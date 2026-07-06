import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authUtils";

export const generateUploadUrl = mutation({ args: {}, handler: async (ctx) => { await requireUser(ctx); return ctx.storage.generateUploadUrl(); } });

export const create = mutation({
  args: { userId: v.id("users"), fileName: v.string(), mimeType: v.string(), size: v.number(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);
    const now = Date.now();
    return ctx.db.insert("uploadedMaterials", { ...args, status: "uploaded", createdAt: now, updatedAt: now });
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { await requireUser(ctx, args.userId); return ctx.db.query("uploadedMaterials").withIndex("by_user_created", q => q.eq("userId", args.userId)).order("desc").take(30); },
});

export const get = query({ args: { materialId: v.id("uploadedMaterials") }, handler: async (ctx, args) => { const item = await ctx.db.get(args.materialId); await requireUser(ctx, item?.userId); return item; } });

export const remove = mutation({
  args: { materialId: v.id("uploadedMaterials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) return;
    await requireUser(ctx, material.userId);
    await ctx.storage.delete(material.storageId);
    await ctx.db.delete(args.materialId);
  },
});

export const updateStatus = mutation({
  args: {
    materialId: v.id("uploadedMaterials"),
    status: v.union(v.literal("uploaded"), v.literal("processing"), v.literal("ready"), v.literal("failed")),
    extractedText: v.optional(v.string()), error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found.");
    await requireUser(ctx, material.userId);
    return ctx.db.patch(args.materialId, { status: args.status, extractedText: args.extractedText, error: args.error, updatedAt: Date.now() });
  },
});
