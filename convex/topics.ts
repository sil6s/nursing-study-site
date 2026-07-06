import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

const topic = v.object({
  title: v.string(), description: v.string(), keyConcepts: v.array(v.string()),
  priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  sourceReference: v.optional(v.string()),
});

export const replaceForMaterial = mutation({
  args: { userId: v.id("users"), materialId: v.id("uploadedMaterials"), topics: v.array(topic) },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const old = await ctx.db.query("extractedStudyTopics").withIndex("by_material", q => q.eq("materialId", args.materialId)).collect();
    await Promise.all(old.map(item => ctx.db.delete(item._id)));
    return Promise.all(args.topics.map(item => ctx.db.insert("extractedStudyTopics", { ...item, userId: args.userId, materialId: args.materialId, selected: true, createdAt: Date.now() })));
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("extractedStudyTopics").withIndex("by_user", q => q.eq("userId", args.userId)).order("desc").take(100); },
});

export const setSelected = mutation({
  args: { topicId: v.id("extractedStudyTopics"), selected: v.boolean() },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) throw new Error("Topic not found.");
    await requireUser(ctx, topic.userId);
    return ctx.db.patch(args.topicId, { selected: args.selected });
  },
});
