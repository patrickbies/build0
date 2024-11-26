import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const isUsernameUnique = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const unique = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .collect();
    return unique.length == 0;
  },
});

export const createAccount = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const newUserId = await ctx.db.insert("users", {
      createdAt: Date.now(),
      displayName: args.displayName,
      email: args.email,
      username: args.username,
      clerkId: args.clerkId,
    });

    return newUserId;
  },
});

export const queryUser = query({
  args: {
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.uid) return;

    const metadata = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.uid))
      .unique();

    if (!metadata) return;
    const userPosts = await ctx.db.query("posts").withIndex("userId", q => q.eq("userId", metadata?._id)).collect();

    return { metadata: metadata, userPosts: userPosts };
  },
});

export const searchBar = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    // Search `users` table for username and displayName
    const userResults = await ctx.db
      .query("users")
      .withSearchIndex("search_username", (q) =>
        q.search("username", args.searchTerm)
      )
      .collect();

    return userResults;
  },
});
