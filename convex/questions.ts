import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const answer = v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string()));
const question = v.object({
  type: v.union(v.literal("multiple"), v.literal("sata"), v.literal("order"), v.literal("true_false"), v.literal("fill_blank"), v.literal("case_study"), v.literal("priority"), v.literal("med_calc"), v.literal("matching")),
  topic: v.string(), subtopic: v.string(),
  difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("nclex")),
  nclexCategory: v.optional(v.string()), question: v.string(), options: v.array(v.string()), correctAnswer: answer,
  rationale: v.string(), wrongAnswerRationales: v.record(v.string(), v.string()), tags: v.array(v.string()), sourceReference: v.optional(v.string()),
});

export const createQuizWithQuestions = internalMutation({
  args: {
    userId: v.id("users"), title: v.string(), description: v.optional(v.string()), difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("nclex"), v.literal("mixed")),
    sourceType: v.union(v.literal("topic"), v.literal("notes"), v.literal("material"), v.literal("mixed")),
    mode: v.union(v.literal("immediate"), v.literal("test")), shuffleQuestions: v.boolean(), shuffleOptions: v.boolean(), questions: v.array(question),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const quizId = await ctx.db.insert("quizzes", {
      userId: args.userId, title: args.title, description: args.description, difficulty: args.difficulty,
      sourceType: args.sourceType, mode: args.mode, shuffleQuestions: args.shuffleQuestions, shuffleOptions: args.shuffleOptions,
      status: "active", questionCount: args.questions.length, createdAt: now, updatedAt: now,
    });
    await Promise.all(args.questions.map((q, order) => ctx.db.insert("quizQuestions", { ...q, quizId, order, createdAt: now, updatedAt: now })));
    return quizId;
  },
});
