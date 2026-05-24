import { createAgent, tool } from "langchain";
import { z } from "zod";
import { model } from "../model.js";
import { postNote, searchContent, addComment } from "../tools/xiaohongshu.js";

const contextSchema = z.object({
  sessionId: z.string().describe("Current session identifier from the top-level agent"),
});

const agent = createAgent({
  model,
  tools: [postNote, searchContent, addComment],
  contextSchema,
  systemPrompt: `You are a Xiaohongshu (RED) assistant. Help users with:
- Posting notes (text + optional images)
- Searching for content by keyword
- Adding comments to posts

Use the available tools to fulfill the user's request. Return a friendly, conversational response.`,
});

export const xiaohongshuTool = tool(
  async ({ query }, config) => {
    // Access thread-level context via config, matching the LangChain example pattern:
    // config.context contains context from agent.invoke(state, { context: {...} })
    const sessionId = (config?.context as { sessionId?: string } | undefined)?.sessionId ?? "unknown";
    console.log(`\n[tool] Xiaohongshu | sessionId=${sessionId} | query=${query} \n`);
    const result = await agent.invoke(
      { messages: [{ role: "user", content: query }] },
      { context: { sessionId } },
    );
    const messages = result.messages;
    const lastMsg = messages[messages.length - 1];
    const res = typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
    console.log(`\n[tool] Xiaohongshu | sessionId=${sessionId} | result=${res}\n`);
    return res;
  },
  {
    name: "xiaohongshu",
    description: "Handle Xiaohongshu/RED operations: posting notes, searching content, and adding comments. Use this when the user wants to interact with RED/Xiaohongshu.",
    schema: z.object({
      query: z.string().describe("The user's full request to process on Xiaohongshu. Include relevant context about the user's intent within the query text."),
    }),
  }
);
