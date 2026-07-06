"use node";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured in Convex.");
  return key;
}

function cleanJson(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(trimmed); } catch {
    const start = Math.min(...["[", "{"].map(c => trimmed.indexOf(c)).filter(i => i >= 0));
    const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"));
    if (!Number.isFinite(start) || end <= start) throw new Error("Gemini returned malformed JSON.");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

async function generate(
  parts: Array<Record<string, unknown>>,
  schema?: Record<string, unknown>,
  jsonOnly = false,
) {
  const response = await fetch(`${BASE}/${MODEL}:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: schema || jsonOnly ? "application/json" : "text/plain",
        ...(schema ? { responseSchema: schema } : {}),
      },
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 400)}`);
  }
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

const topicsSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" }, description: { type: "STRING" },
      keyConcepts: { type: "ARRAY", items: { type: "STRING" } },
      priority: { type: "STRING", enum: ["high", "medium", "low"] },
      sourceReference: { type: "STRING", nullable: true },
    },
    required: ["title", "description", "keyConcepts", "priority"],
  },
};

const questionSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      type: { type: "STRING", enum: ["multiple", "sata", "order", "true_false", "fill_blank", "case_study", "priority", "med_calc", "matching"] },
      topic: { type: "STRING" },
      subtopic: { type: "STRING" },
      difficulty: { type: "STRING", enum: ["easy", "medium", "hard", "nclex"] },
      nclexCategory: { type: "STRING", nullable: true },
      question: { type: "STRING" },
      options: { type: "ARRAY", items: { type: "STRING" } },
      correctAnswer: {
        anyOf: [
          { type: "STRING" },
          { type: "NUMBER" },
          { type: "ARRAY", items: { type: "STRING" } },
          { type: "OBJECT" },
        ],
      },
      rationale: { type: "STRING" },
      wrongAnswerRationales: { type: "OBJECT" },
      tags: { type: "ARRAY", items: { type: "STRING" } },
      sourceReference: { type: "STRING", nullable: true },
    },
    required: ["type", "topic", "subtopic", "difficulty", "question", "options", "correctAnswer", "rationale", "wrongAnswerRationales", "tags"],
  },
};

function validateGeneratedQuestions(value: unknown) {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { questions?: unknown[] }).questions)
      ? (value as { questions: unknown[] }).questions
      : [];
  if (!list.length) throw new Error("Gemini returned no questions.");
  const placeholder = /(sample question|question text here|placeholder|lorem ipsum|insert .* here)/i;
  return list.map((raw, index) => {
    const q = raw as Record<string, unknown>;
    const options = Array.isArray(q.options) ? q.options.map(String) : [];
    const type = String(q.type);
    if (!q.question || placeholder.test(String(q.question))) throw new Error(`Question ${index + 1} contains placeholder text.`);
    if (!["fill_blank", "med_calc"].includes(type) && options.length < 2) throw new Error(`Question ${index + 1} needs answer options.`);
    if (["multiple", "true_false", "case_study", "priority"].includes(type) && !options.includes(String(q.correctAnswer))) {
      throw new Error(`Question ${index + 1}'s answer does not match an option.`);
    }
    if (type === "sata" && (!Array.isArray(q.correctAnswer) || q.correctAnswer.length < 2 || q.correctAnswer.some(a => !options.includes(String(a))))) {
      throw new Error(`Question ${index + 1} has invalid SATA answers.`);
    }
    if (type === "order" && (!Array.isArray(q.correctAnswer) || q.correctAnswer.length !== options.length || q.correctAnswer.some(a => !options.includes(String(a))))) {
      throw new Error(`Question ${index + 1} has an invalid ordered answer.`);
    }
    if (type === "med_calc" && !/(mg|mcg|g|kg|mL|L|units?|gtt|hr|dose)/i.test(`${q.question} ${String(q.correctAnswer)}`)) {
      throw new Error(`Question ${index + 1}'s medication calculation is missing units.`);
    }
    return {
      ...q,
      nclexCategory: q.nclexCategory ? String(q.nclexCategory) : undefined,
      sourceReference: q.sourceReference ? String(q.sourceReference) : undefined,
    };
  });
}

export const extractTopics = action({
  args: { userId: v.id("users"), materialId: v.id("uploadedMaterials"), pastedText: v.optional(v.string()) },
  handler: async (ctx, args): Promise<unknown[]> => {
    await requireUser(ctx, args.userId);
    const material = await ctx.runQuery(api.materials.get, { materialId: args.materialId });
    if (!material) throw new Error("Uploaded material not found.");
    await ctx.runMutation(api.materials.updateStatus, { materialId: args.materialId, status: "processing" });
    try {
      const blob = await ctx.storage.get(material.storageId);
      if (!blob) throw new Error("Stored file could not be read.");
      const bytes = Buffer.from(await blob.arrayBuffer()).toString("base64");
      const prompt = `Act as an expert nursing educator. Extract the most important nursing study topics, clinical concepts, medications, procedures, safety concerns, prioritization rules, and NCLEX-relevant ideas from this class material. Be faithful to the source. Return strict JSON only.`;
      const text = await generate([
        { text: prompt + (args.pastedText ? `\nAdditional notes:\n${args.pastedText}` : "") },
        { inlineData: { mimeType: material.mimeType || "application/octet-stream", data: bytes } },
      ], topicsSchema);
      const topics = cleanJson(text);
      if (!Array.isArray(topics)) throw new Error("Gemini returned invalid topic data.");
      await ctx.runMutation(api.topics.replaceForMaterial, { userId: args.userId, materialId: args.materialId, topics });
      await ctx.runMutation(api.materials.updateStatus, { materialId: args.materialId, status: "ready" });
      return topics;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Topic extraction failed.";
      await ctx.runMutation(api.materials.updateStatus, { materialId: args.materialId, status: "failed", error: message });
      throw error;
    }
  },
});

export const generateQuiz = action({
  args: {
    userId: v.id("users"), title: v.string(), topicPrompt: v.string(), notes: v.optional(v.string()),
    topics: v.array(v.object({ title: v.string(), description: v.string(), keyConcepts: v.array(v.string()), priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")), sourceReference: v.optional(v.string()) })),
    count: v.number(), difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("nclex"), v.literal("mixed")),
    mode: v.union(v.literal("immediate"), v.literal("test")), shuffleQuestions: v.boolean(), shuffleOptions: v.boolean(),
  },
  handler: async (ctx, args): Promise<string> => {
    await requireUser(ctx, args.userId);
    if (!args.topicPrompt.trim() && !args.notes?.trim() && !args.topics.length) throw new Error("Enter a topic, paste notes, or extract study topics first.");
    const prompt = `You are an expert nursing faculty member and NCLEX item writer.
Create exactly ${Math.max(1, Math.min(args.count, 100))} clinically accurate nursing questions.
Difficulty: ${args.difficulty}. Use a balanced mix of appropriate question types from multiple, SATA, order, true_false, fill_blank, case_study, priority, med_calc, and matching.
Use exact option text in correctAnswer. SATA must have at least 2 correct options. Ordered answers must contain every option exactly once. Medication calculations must show required units in the question and final answer. Include a strong teaching rationale and a rationale for every wrong option.
Reject ambiguity. Never invent source claims. Never use placeholders. Return strict JSON only with no markdown or commentary.
Topic/idea: ${args.topicPrompt}
Selected extracted topics: ${JSON.stringify(args.topics)}
Notes: ${args.notes ?? ""}`;
    let questions: ReturnType<typeof validateGeneratedQuestions> | undefined;
    let correction = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = cleanJson(await generate([{
        text: `${prompt}${correction}`,
      }], questionSchema));
      try {
        questions = validateGeneratedQuestions(raw);
        break;
      } catch (error) {
        if (attempt === 1) throw error;
        const validationMessage = error instanceof Error ? error.message : "The JSON failed validation.";
        correction = `\n\nYour previous output was rejected: ${validationMessage}
Regenerate the entire quiz. Correct that problem, use complete real questions, and return JSON only.`;
      }
    }
    if (!questions) throw new Error("Gemini did not produce a valid quiz.");
    const quizId = await ctx.runMutation(internal.questions.createQuizWithQuestions, {
      userId: args.userId, title: args.title, description: `AI-generated nursing quiz: ${args.topicPrompt || args.topics.map(t => t.title).join(", ")}`,
      difficulty: args.difficulty, sourceType: args.topics.length ? (args.notes || args.topicPrompt ? "mixed" : "material") : (args.notes ? "notes" : "topic"),
      mode: args.mode, shuffleQuestions: args.shuffleQuestions, shuffleOptions: args.shuffleOptions, questions: questions as never,
    });
    return quizId;
  },
});

export const explainQuestion = action({
  args: {
    userId: v.id("users"), questionId: v.id("quizQuestions"), question: v.string(), options: v.array(v.string()),
    correctAnswer: v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string())),
    rationale: v.string(), userAnswer: v.optional(v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string()))),
    request: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    await requireUser(ctx, args.userId);
    const prompt = `You are a concise, supportive nursing instructor. Answer the learner's request using clinically accurate nursing reasoning. Explicitly distinguish education from patient-specific medical advice.
Question: ${args.question}
Options: ${JSON.stringify(args.options)}
Correct answer: ${JSON.stringify(args.correctAnswer)}
Existing rationale: ${args.rationale}
Learner answer: ${JSON.stringify(args.userAnswer)}
Request: ${args.request}`;
    const response = await generate([{ text: prompt }]);
    await ctx.runMutation(internal.explanations.saveMessagePair, { userId: args.userId, questionId: args.questionId, title: args.question.slice(0, 80), prompt: args.request, response });
    return response;
  },
});

export const createStudyGuide = action({
  args: { topic: v.string(), context: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return generate([{ text: `Create a compact nursing study guide for "${args.topic}". Include core concepts, assessment cues, interventions, safety alerts, medications if relevant, NCLEX priority tips, and memory aids. Context: ${args.context ?? ""}` }]);
  },
});
