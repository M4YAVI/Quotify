import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  phrases: defineTable({
    text: v.string(),
    category: v.string(),
    source: v.optional(v.string()),
    isProcessing: v.optional(v.boolean()),
    // Keep userId as optional for backward compatibility with existing data
    userId: v.optional(v.id("users")),
  })
    .index("by_category", ["category"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["category"],
    }),
  
  settings: defineTable({
    openRouterApiKey: v.optional(v.string()),
    preferredModel: v.optional(v.string()),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
