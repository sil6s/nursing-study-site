import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

const answer = v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string()));

export const start = mutation({
  args: { userId: v.id("users"), quizId: v.id("quizzes"), mode: v.union(v.literal("immediate"), v.literal("test")), totalQuestions: v.number() },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.insert("quizAttempts", { ...args, status: "in_progress", score: 0, correctCount: 0, startedAt: Date.now() }); },
});

export const recordAnswer = mutation({
  args: { attemptId: v.id("quizAttempts"), userId: v.id("users"), quizId: v.id("quizzes"), questionId: v.id("quizQuestions"), answer, isCorrect: v.boolean() },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const previous = await ctx.db.query("quizAnswers").withIndex("by_attempt", q => q.eq("attemptId", args.attemptId)).filter(q => q.eq(q.field("questionId"), args.questionId)).unique();
    if (previous) await ctx.db.patch(previous._id, { answer: args.answer, isCorrect: args.isCorrect, answeredAt: Date.now() });
    else await ctx.db.insert("quizAnswers", { ...args, answeredAt: Date.now() });
  },
});

export const complete = mutation({
  args: { attemptId: v.id("quizAttempts"), score: v.number(), correctCount: v.number() },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found.");
    await requireUser(ctx, attempt.userId);
    await ctx.db.patch(args.attemptId, { status: "completed", score: args.score, correctCount: args.correctCount, completedAt: Date.now() });
    const progress = await ctx.db.query("quizProgress").withIndex("by_attempt", q => q.eq("attemptId", args.attemptId)).unique();
    if (progress) await ctx.db.delete(progress._id);
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("quizAttempts").withIndex("by_user", q => q.eq("userId", args.userId)).order("desc").take(100); },
});
