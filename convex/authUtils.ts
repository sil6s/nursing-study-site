import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericId } from "convex/values";

export async function requireUser(ctx: any, claimedUserId?: GenericId<"users">) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("You must be signed in.");
  if (claimedUserId && userId !== claimedUserId) throw new Error("You do not have access to this account.");
  return userId;
}
