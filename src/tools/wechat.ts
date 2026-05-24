import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ── send_message ───────────────────────────────────────────

export const sendMessage = tool(
  async ({ content, recipient, group }) => {
    const target = group ? `group "${group}"` : `contact "${recipient}"`;
    return `Message sent to ${target} on WeChat.\n"${content.slice(0, 100)}${content.length > 100 ? "..." : ""}" — delivered at ${new Date().toLocaleTimeString()}`;
  },
  {
    name: "send_message",
    description: "Send a message to a contact or group on WeChat.",
    schema: z.object({
      content: z.string().describe("Message text to send"),
      recipient: z.string().optional().describe("Contact name to send to"),
      group: z.string().optional().describe("Group name to send to (takes precedence over recipient)"),
    }),
  }
);

// ── view_moments ───────────────────────────────────────────

const mockMoments = [
  { author: "Zhang Wei", content: "Great dinner with the team tonight! 🍜", time: "2h ago", likes: 15 },
  { author: "Li Na", content: "Check out my new painting...", time: "5h ago", likes: 42 },
  { author: "Wang Fang", content: "Anyone else watching the game? 🏀", time: "1h ago", likes: 8 },
  { author: "Engineering Group", content: "Reminder: sprint review tomorrow 10am", time: "3h ago", likes: 3 },
  { author: "Chen Jie", content: "Weekend hike photos — breathtaking views!", time: "8h ago", likes: 67 },
];

export const viewMoments = tool(
  async ({ count }) => {
    const limit = count ?? 5;
    return mockMoments.slice(0, limit)
      .map((m) => `  ${m.author}: ${m.content} — ${m.time}, ${m.likes}❤️`)
      .join("\n");
  },
  {
    name: "view_moments",
    description: "View recent WeChat Moments posts from contacts.",
    schema: z.object({
      count: z.number().optional().describe("Number of recent moments to show, default 5"),
    }),
  }
);

// ── voice_call ─────────────────────────────────────────────

export const voiceCall = tool(
  async ({ contact }) => ({
    contact,
    status: "calling",
    duration: "connecting...",
    callId: `wxcall_${Date.now()}`,
  }),
  {
    name: "voice_call",
    description: "Initiate a voice call to a contact on WeChat.",
    schema: z.object({
      contact: z.string().describe("Contact name to call"),
    }),
  }
);
