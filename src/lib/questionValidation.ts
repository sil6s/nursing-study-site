import type { NursingQuestion, QuestionType } from "./types";

const TYPES: QuestionType[] = ["multiple", "sata", "order", "true_false", "fill_blank", "case_study", "priority", "med_calc", "matching"];
const PLACEHOLDER = /(sample question|question text here|placeholder|lorem ipsum|insert .* here|example answer)/i;

export function validateQuestion(raw: unknown, index = 0): NursingQuestion {
  if (!raw || typeof raw !== "object") throw new Error(`Question ${index + 1} is not an object.`);
  const q = raw as NursingQuestion;
  if (!TYPES.includes(q.type)) throw new Error(`Question ${index + 1} has an unsupported type.`);
  if (!q.question?.trim() || PLACEHOLDER.test(q.question)) throw new Error(`Question ${index + 1} is empty or contains placeholder text.`);
  if (!q.topic?.trim() || !q.subtopic?.trim()) throw new Error(`Question ${index + 1} needs a topic and subtopic.`);
  if (!["easy", "medium", "hard", "nclex"].includes(q.difficulty)) throw new Error(`Question ${index + 1} has an invalid difficulty.`);
  if (!Array.isArray(q.options) || q.options.some((o) => typeof o !== "string" || !o.trim())) throw new Error(`Question ${index + 1} has invalid options.`);
  if (!q.rationale?.trim()) throw new Error(`Question ${index + 1} needs a rationale.`);
  if (!Array.isArray(q.tags)) q.tags = [];
  if (!q.wrongAnswerRationales || typeof q.wrongAnswerRationales !== "object") q.wrongAnswerRationales = {};

  const stringAnswer = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
  if (["multiple", "case_study", "priority", "true_false"].includes(q.type) && !q.options.includes(stringAnswer)) {
    throw new Error(`Question ${index + 1}'s correct answer must exactly match an option.`);
  }
  if (q.type === "sata") {
    if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length < 2 || q.correctAnswer.some((a) => !q.options.includes(String(a)))) {
      throw new Error(`Question ${index + 1} SATA needs at least two answers matching its options.`);
    }
  }
  if (q.type === "order") {
    if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length !== q.options.length ||
        new Set(q.correctAnswer.map(String)).size !== q.options.length ||
        q.correctAnswer.some((a) => !q.options.includes(String(a)))) {
      throw new Error(`Question ${index + 1}'s ordered answer must contain every exact option once.`);
    }
  }
  if (q.type === "med_calc") {
    if (!/(mg|mcg|g|kg|mL|L|units?|gtt|hr|dose)/i.test(`${q.question} ${String(q.correctAnswer)}`)) {
      throw new Error(`Question ${index + 1}'s medication calculation must include units.`);
    }
  }
  if (q.type === "matching" && (typeof q.correctAnswer !== "object" || Array.isArray(q.correctAnswer))) {
    throw new Error(`Question ${index + 1}'s matching answer must be a mapping object.`);
  }
  return q;
}

export function validateQuestions(raw: unknown): NursingQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("Gemini returned no questions.");
  return raw.map(validateQuestion);
}
