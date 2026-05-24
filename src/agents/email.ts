import { createAgent, tool } from "langchain";
import { z } from "zod";
import { model } from "../model.js";
import { composeEmail, checkInbox, searchEmails } from "../tools/email.js";

const contextSchema = z.object({
  sessionId: z.string().describe("Current session identifier from the top-level agent"),
});

const agent = createAgent({
  model,
  tools: [composeEmail, checkInbox, searchEmails],
  contextSchema,
  systemPrompt: `You are an Email assistant. Help users with:
- Composing and sending emails
- Checking the inbox (all or unread only)
- Searching emails by keyword or sender

Use the available tools to fulfill the user's request. Return a friendly, conversational response.`,
});

export const emailTool = tool(
  async ({ query }, config) => {
    const sessionId = (config?.context as { sessionId?: string } | undefined)?.sessionId ?? "unknown";
    console.log(`\n[tool] Email | sessionId=${sessionId} | query=${query.slice(0, 50)}...`);
    const result = await agent.invoke(
      { messages: [{ role: "user", content: query }] },
      { context: { sessionId } },
    );
    const messages = result.messages;
    const lastMsg = messages[messages.length - 1];
    return typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
  },
  {
    name: "email",
    description: "Handle Email operations: composing emails, checking inbox, and searching emails. Use this when the user wants to interact with Email.",
    schema: z.object({
      query: z.string().describe("The user's full request to process for email. Include relevant context about the user's intent within the query text."),
    }),
  }
);
