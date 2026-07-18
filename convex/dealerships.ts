import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dealerships").collect();
  },
});

export const get = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dealerships")
      .withIndex("by_numeric_id", q => q.eq("id", args.id))
      .first();
  },
});
