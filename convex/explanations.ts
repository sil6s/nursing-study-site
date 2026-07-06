import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

export const saveMessagePair = internalMutation({
  args: { userId: v.id("users"), questionId: v.id("quizQuestions"), title: v.string(), prompt: v.string(), response: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("aiExplanationThreads").withIndex("by_user_question", q => q.eq("userId", args.userId).eq("questionId", args.questionId)).unique();
    const messages = [
      ...(existing?.messages ?? []),
      { role: "user" as const, content: args.prompt, createdAt: now },
      { role: "assistant" as const, content: args.response, createdAt: now },
    ];
    if (existing) return ctx.db.patch(existing._id, { messages, updatedAt: now });
    return ctx.db.insert("aiExplanationThreads", { userId: args.userId, questionId: args.questionId, title: args.title, messages, createdAt: now, updatedAt: now });
  },
});

export const get = query({
  args: { userId: v.id("users"), questionId: v.id("quizQuestions") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("aiExplanationThreads").withIndex("by_user_question", q => q.eq("userId", args.userId).eq("questionId", args.questionId)).unique(); },
});
