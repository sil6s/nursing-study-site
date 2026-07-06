import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";
const answer = v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string()));

export const save = mutation({
  args: {
    userId: v.id("users"), quizId: v.id("quizzes"), attemptId: v.id("quizAttempts"), currentIndex: v.number(),
    answers: v.array(v.object({ questionId: v.id("quizQuestions"), answer })),
    submittedQuestionIds: v.array(v.id("quizQuestions")),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const existing = await ctx.db.query("quizProgress").withIndex("by_user_quiz", q => q.eq("userId", args.userId).eq("quizId", args.quizId)).unique();
    if (existing) return ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
    return ctx.db.insert("quizProgress", { ...args, updatedAt: Date.now() });
  },
});

export const get = query({
  args: { userId: v.id("users"), quizId: v.id("quizzes") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("quizProgress").withIndex("by_user_quiz", q => q.eq("userId", args.userId).eq("quizId", args.quizId)).unique(); },
});
