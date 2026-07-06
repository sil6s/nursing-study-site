import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

export const list = query({
  args: { userId: v.id("users"), includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const quizzes = await ctx.db.query("quizzes").withIndex("by_user", q => q.eq("userId", args.userId)).order("desc").collect();
    return args.includeArchived ? quizzes : quizzes.filter(q => q.status !== "archived");
  },
});

export const get = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    await requireUser(ctx, quiz.userId);
    const questions = await ctx.db.query("quizQuestions").withIndex("by_quiz_order", q => q.eq("quizId", args.quizId)).collect();
    return { quiz, questions };
  },
});

export const archive = mutation({
  args: { quizId: v.id("quizzes"), archived: v.boolean() },
  handler: async (ctx, args) => { const quiz = await ctx.db.get(args.quizId); if (!quiz) return; await requireUser(ctx, quiz.userId); return ctx.db.patch(args.quizId, { status: args.archived ? "archived" : "active", updatedAt: Date.now() }); },
});

export const remove = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return;
    await requireUser(ctx, quiz.userId);
    const questions = await ctx.db.query("quizQuestions").withIndex("by_quiz", q => q.eq("quizId", args.quizId)).collect();
    await Promise.all(questions.map(q => ctx.db.delete(q._id)));
    await ctx.db.delete(args.quizId);
  },
});
