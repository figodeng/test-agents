import { createAgent, tool } from "langchain";
import { z } from "zod";
import { model } from "../model.js";
import { sendMessage, viewMoments, voiceCall } from "../tools/wechat.js";

const contextSchema = z.object({
  sessionId: z.string().describe("Current session identifier from the top-level agent"),
});

const agent = createAgent({
  model,
  tools: [sendMessage, viewMoments, voiceCall],
  contextSchema,
  systemPrompt: `You are a WeChat assistant. Help users with:
- Sending messages to contacts or groups
- Viewing recent Moments posts
- Making voice calls to contacts

Use the available tools to fulfill the user's request. Return a friendly, conversational response.`,
});

export const wechatTool = tool(
  async ({ query }, config) => {
    const sessionId = (config?.context as { sessionId?: string } | undefined)?.sessionId ?? "unknown";
    console.log(`\n[tool] WeChat | sessionId=${sessionId} | query=${query.slice(0, 50)}...`);
    const result = await agent.invoke(
      { messages: [{ role: "user", content: query }] },
      { context: { sessionId } },
    );
    const messages = result.messages;
    const lastMsg = messages[messages.length - 1];
    return typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
  },
  {
    name: "wechat",
    description: "Handle WeChat operations: sending messages, viewing Moments, and making voice calls. Use this when the user wants to interact with WeChat.",
    schema: z.object({
      query: z.string().describe("The user's full request to process on WeChat. Include relevant context about the user's intent within the query text."),
    }),
  }
);
