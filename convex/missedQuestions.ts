import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

export const record = mutation({
  args: { userId: v.id("users"), questionId: v.id("quizQuestions"), quizId: v.id("quizzes"), topic: v.string(), subtopic: v.string(), isCorrect: v.boolean() },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const existing = await ctx.db.query("missedQuestions").withIndex("by_user_question", q => q.eq("userId", args.userId).eq("questionId", args.questionId)).unique();
    if (args.isCorrect) {
      if (existing) await ctx.db.patch(existing._id, { timesCorrectAfterMiss: existing.timesCorrectAfterMiss + 1, resolvedAt: Date.now() });
      return;
    }
    if (existing) await ctx.db.patch(existing._id, { timesMissed: existing.timesMissed + 1, lastMissedAt: Date.now(), resolvedAt: undefined });
    else await ctx.db.insert("missedQuestions", { ...args, timesMissed: 1, timesCorrectAfterMiss: 0, lastMissedAt: Date.now(), resolvedAt: undefined });
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("missedQuestions").withIndex("by_user", q => q.eq("userId", args.userId)).order("desc").take(200); },
});

export const weakTopics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const missed = await ctx.db.query("missedQuestions").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
    const counts = new Map<string, number>();
    for (const item of missed) counts.set(item.topic, (counts.get(item.topic) ?? 0) + item.timesMissed);
    return [...counts].map(([topic, misses]) => ({ topic, misses })).sort((a, b) => b.misses - a.misses).slice(0, 10);
  },
});
