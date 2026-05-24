import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ── post_note ──────────────────────────────────────────────

export const postNote = tool(
  async ({ content, imageCount }) => {
    const imgs = imageCount ? ` with ${imageCount} photo${imageCount > 1 ? "s" : ""}` : "";
    const result = `Posted to RED${imgs}. Post ID: red_${Date.now()}\nPreview: "${content.slice(0, 80)}${content.length > 80 ? "..." : ""}"`;
    console.log(`\n[tool] post_note | result="${result}"\n`);
    return result;
  },
  {
    name: "post_note",
    description: "Post a new note to Xiaohongshu/RED with text content and optional images.",
    schema: z.object({
      content: z.string().describe("The text content of the note to post"),
      imageCount: z.number().optional().describe("Number of images to attach, if any"),
    }),
  }
);

// ── search_content ─────────────────────────────────────────

const mockREDResults = [
  { title: "Best coffee shops in Shanghai 2024", likes: 2300, author: "CoffeeHunter" },
  { title: "Hidden gem cafe in French Concession", likes: 1800, author: "ShanghaiEats" },
  { title: "My morning coffee routine", likes: 5600, author: "LifeWithBean" },
  { title: "Coffee shop hopping in Jing'an", likes: 920, author: "WanderlustRED" },
  { title: "Specialty coffee guide to Shanghai", likes: 4100, author: "BaristaDiary" },
];

export const searchContent = tool(
  async ({ keyword }) => {
    const results = mockREDResults
      .filter((r) => r.title.toLowerCase().includes(keyword.toLowerCase()))
      .slice(0, 3);
    if (results.length === 0) return `No RED posts found for "${keyword}".`;
    return results
      .map((r) => `  ${r.title} — ${r.likes.toLocaleString()} likes, by @${r.author}`)
      .join("\n");
  },
  {
    name: "search_content",
    description: "Search for content on Xiaohongshu/RED by keyword.",
    schema: z.object({
      keyword: z.string().describe("Search keyword, e.g. 'coffee', 'travel', 'skincare'"),
    }),
  }
);

// ── add_comment ────────────────────────────────────────────

export const addComment = tool(
  async ({ content }) => ({
    commentId: `cmt_${Date.now()}`,
    content,
    status: "posted",
  }),
  {
    name: "add_comment",
    description: "Add a comment to a note on Xiaohongshu/RED.",
    schema: z.object({
      content: z.string().describe("Comment text to add"),
    }),
  }
);
