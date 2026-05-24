import * as readline from "node:readline";
import { createAgent, createMiddleware } from "langchain";
import { z } from "zod";
import { Command, END } from "@langchain/langgraph";
import type { AIMessage } from "@langchain/core/messages";
import { model } from "./model.js";
import { xiaohongshuTool } from "./agents/xiaohongshu.js";
import { wechatTool } from "./agents/wechat.js";
import { emailTool } from "./agents/email.js";

const stopAfterTool = createMiddleware({
  name: "stopAfterTool",
  wrapToolCall: async (request, handler) => {
    const result = await handler(request);
    // enhance tool execution result
    // console.log(`\n[Middleware] stopAfterTool activated. Interrupting agent after tool call. \n`);
    return new Command({ goto: END, update: { messages: [result] } });
  },
});

const agent = createAgent({
  model,
  tools: [xiaohongshuTool, wechatTool, emailTool],
  middleware: [stopAfterTool],
  contextSchema: z.object({
    sessionId: z.string().describe("Session identifier for this conversation turn"),
  }),
  systemPrompt: `You are an intention routing agent. Your job is to detect which platform the user wants to interact with based on their input.

- If the user mentions RED, Xiaohongshu, posting notes, or searching lifestyle content → use the xiaohongshu tool
- If the user mentions WeChat, sending messages, Moments, or voice calls → use the wechat tool
- If the user mentions email, inbox, composing mail, or searching emails → use the email tool

When routing to a tool, pass the user's original input unchanged as the "query" parameter.

If the user's intent is ambiguous (e.g. "send a message" without specifying the platform), make it default to WeChat.`,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

let turnCounter = 0;

console.log("┌─────────────────────────────────────────────┐");
console.log("│         Intention Agent (DeepSeek V4)       │");
console.log("│                                             │");
console.log("│  Platforms: Xiaohongshu | WeChat | Email    │");
console.log("│  Tool results bypass LLM, sent directly     │");
console.log("│  Type /exit to quit                         │");
console.log("└─────────────────────────────────────────────┘\n");

while (true) {
  const input = await ask("\n> ");
  if (!input.trim()) continue;
  if (input.trim() === "/exit") break;

  const sessionId = `sess_${Date.now()}_${++turnCounter}`;
  console.log(`\n[session] ${sessionId}`);

  try {
    const result = await agent.invoke(
      { messages: [{ role: "user", content: input }] },
      { context: { sessionId } },
    );

    for (const msg of result.messages) {
      const aiMsg = msg as AIMessage;
      if (aiMsg.tool_calls?.length) {
        for (const tc of aiMsg.tool_calls) {
          const args = tc.args as Record<string, unknown>;
          console.log(`\n→ routing to: ${tc.name} | query=${(args.query as string)?.slice(0, 60)}...`);
        }
      } else if (msg.type === "tool") {
        console.log(`\n→ Tool result: ${msg.content}`);
      }
    }

    const lastMsg = result.messages[result.messages.length - 1];
    const content = typeof lastMsg.content === "string" ? lastMsg.content : JSON.stringify(lastMsg.content);
    console.log(`\nAgent result: ${content}`);
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
  }
}

console.log("\nGoodbye!");
rl.close();
