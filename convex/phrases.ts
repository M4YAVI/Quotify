import { v } from "convex/values";
import { query, mutation, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const addPhrase = mutation({
  args: {
    text: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Insert phrase with temporary category and processing flag
    const phraseId = await ctx.db.insert("phrases", {
      text: args.text,
      source: args.source,
      category: "Processing...",
      isProcessing: true,
    });

    // Schedule AI categorization
    await ctx.scheduler.runAfter(0, internal.phrases.categorizePhrase, {
      phraseId,
    });

    return phraseId;
  },
});

export const generatePhrase = action({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.runQuery(internal.phrases.getSettings);

    if (!settings?.openRouterApiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: settings.preferredModel || "x-ai/grok-4.1-fast:free",
          messages: [
            {
              role: "system",
              content: "You are a wise philosopher and productivity expert. Generate a unique, meaningful phrase, quote, or thought that can be used for daily inspiration or productivity. It should be profound yet practical. Return ONLY the JSON object with keys 'text' and 'source'. Do not wrap in markdown code blocks."
            },
            {
              role: "user",
              content: "Generate a phrase."
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate phrase");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content generated");
      }

      const parsed = JSON.parse(content);
      return {
        text: parsed.text,
        source: parsed.source || "AI Generated",
      };

    } catch (error) {
      console.error("AI generation failed:", error);
      throw new Error("Failed to generate phrase. Please try again.");
    }
  },
});

export const categorizePhrase = internalAction({
  args: {
    phraseId: v.id("phrases"),
  },
  handler: async (ctx, args) => {
    const phrase = await ctx.runQuery(internal.phrases.getPhrase, {
      phraseId: args.phraseId,
    });

    if (!phrase) return;

    const settings = await ctx.runQuery(internal.phrases.getSettings);

    let category = "Life Wisdom"; // Default category

    if (settings?.openRouterApiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${settings.openRouterApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: settings.preferredModel || "x-ai/grok-4.1-fast:free",
            messages: [
              {
                role: "system",
                content: "Categorize this phrase into one of these categories: Professional, Philosophical, Humorous, Motivational, Technical, Creative, Life Wisdom. Respond with only the category name."
              },
              {
                role: "user",
                content: phrase.text
              }
            ],
            max_tokens: 20,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiCategory = data.choices?.[0]?.message?.content?.trim();
          const validCategories = ["Professional", "Philosophical", "Humorous", "Motivational", "Technical", "Creative", "Life Wisdom"];

          if (validCategories.includes(aiCategory)) {
            category = aiCategory;
          }
        }
      } catch (error) {
        console.error("AI categorization failed:", error);
      }
    }

    await ctx.runMutation(internal.phrases.updatePhraseCategory, {
      phraseId: args.phraseId,
      category,
    });
  },
});

export const getPhrase = internalQuery({
  args: { phraseId: v.id("phrases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.phraseId);
  },
});

export const getSettings = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

export const updatePhraseCategory = internalMutation({
  args: {
    phraseId: v.id("phrases"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.phraseId, {
      category: args.category,
      isProcessing: false,
    });
  },
});

export const listPhrases = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      return await ctx.db
        .query("phrases")
        .withSearchIndex("search_text", (q) =>
          q.search("text", args.search!)
        )
        .collect();
    }

    if (args.category) {
      return await ctx.db
        .query("phrases")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("phrases").order("desc").collect();
  },
});

export const updatePhrase = mutation({
  args: {
    phraseId: v.id("phrases"),
    text: v.string(),
    category: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phrase = await ctx.db.get(args.phraseId);
    if (!phrase) {
      throw new Error("Phrase not found");
    }

    await ctx.db.patch(args.phraseId, {
      text: args.text,
      category: args.category || phrase.category,
      source: args.source,
    });
  },
});

export const deletePhrase = mutation({
  args: { phraseId: v.id("phrases") },
  handler: async (ctx, args) => {
    const phrase = await ctx.db.get(args.phraseId);
    if (!phrase) {
      throw new Error("Phrase not found");
    }

    await ctx.db.delete(args.phraseId);
  },
});

export const getCategoryCounts = query({
  args: {},
  handler: async (ctx) => {
    const phrases = await ctx.db.query("phrases").collect();

    const counts: Record<string, number> = {};
    phrases.forEach((phrase) => {
      counts[phrase.category] = (counts[phrase.category] || 0) + 1;
    });

    return counts;
  },
});

export const getRandomPhrase = query({
  args: {},
  handler: async (ctx) => {
    const phrases = await ctx.db
      .query("phrases")
      .filter((q) => q.neq(q.field("isProcessing"), true))
      .collect();

    if (phrases.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  },
});

export const getWeeklyCount = query({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const phrases = await ctx.db
      .query("phrases")
      .filter((q) => q.gte(q.field("_creationTime"), oneWeekAgo))
      .collect();

    return phrases.length;
  },
});

export const updateSettings = mutation({
  args: {
    openRouterApiKey: v.optional(v.string()),
    preferredModel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", args);
    }
  },
});

export const getSettingsForUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});
