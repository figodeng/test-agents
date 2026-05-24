import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ── compose_email ──────────────────────────────────────────

export const composeEmail = tool(
  async ({ recipient, subject, body, cc }) => {
    const ccLine = cc ? `\n  CC: ${cc}` : "";
    return `Email sent!\n  To: ${recipient}${ccLine}\n  Subject: ${subject}\n  Body: "${body.slice(0, 100)}${body.length > 100 ? "..." : ""}"\n  Sent at: ${new Date().toLocaleTimeString()}\n  Status: delivered`;
  },
  {
    name: "compose_email",
    description: "Compose and send an email to a recipient.",
    schema: z.object({
      recipient: z.string().describe("Recipient email address or name"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Email body content"),
      cc: z.string().optional().describe("CC recipients, comma-separated"),
    }),
  }
);

// ── check_inbox ────────────────────────────────────────────

const mockInbox = [
  { sender: "Sarah Chen", subject: "Q2 Budget Review", preview: "Hi, please find attached the Q2 budget...", time: "10:32 AM", unread: true },
  { sender: "Mike Johnson", subject: "Team offsite planning", preview: "Hey team, let's finalize the dates...", time: "9:15 AM", unread: true },
  { sender: "HR Department", subject: "Benefits enrollment reminder", preview: "This is a reminder to complete your...", time: "Yesterday", unread: false },
  { sender: "GitHub", subject: "[repo/backend] New PR: fix auth middleware", preview: "PR #342 opened by figodeng...", time: "Yesterday", unread: false },
  { sender: "Alice Wang", subject: "Coffee catch-up?", preview: "Hey! Are you free this Thursday...", time: "Mon", unread: true },
];

export const checkInbox = tool(
  async ({ filter }) => {
    let emails = mockInbox;
    if (filter === "unread") emails = mockInbox.filter((e) => e.unread);
    return emails
      .map((e) => `  ${e.unread ? "🔵" : "⚪"} [${e.time}] ${e.sender} — "${e.subject}": ${e.preview}`)
      .join("\n");
  },
  {
    name: "check_inbox",
    description: "Check recent emails in the inbox.",
    schema: z.object({
      filter: z.string().optional().describe("Filter: 'unread' for unread only, omit for all recent"),
    }),
  }
);

// ── search_emails ──────────────────────────────────────────

const mockAllEmails = [
  ...mockInbox,
  { sender: "Sarah Chen", subject: "Invoice #INV-2024-089", preview: "Please process the attached invoice...", time: "Fri", unread: false },
  { sender: "Vendor Inc", subject: "Invoice for services rendered", preview: "Dear customer, attached is invoice...", time: "Thu", unread: false },
  { sender: "Sarah Chen", subject: "Fwd: Contract update", preview: "Forwarding the latest contract...", time: "Wed", unread: false },
];

export const searchEmails = tool(
  async ({ keyword, sender }) => {
    let results = mockAllEmails;
    if (keyword) results = results.filter((e) =>
      e.subject.toLowerCase().includes(keyword.toLowerCase()) ||
      e.preview.toLowerCase().includes(keyword.toLowerCase())
    );
    if (sender) results = results.filter((e) =>
      e.sender.toLowerCase().includes(sender.toLowerCase())
    );
    if (results.length === 0) return "No matching emails found.";
    return results.slice(0, 5)
      .map((e) => `  [${e.time}] ${e.sender} — "${e.subject}"`)
      .join("\n");
  },
  {
    name: "search_emails",
    description: "Search emails by keyword or sender.",
    schema: z.object({
      keyword: z.string().optional().describe("Search keyword for subject/body"),
      sender: z.string().optional().describe("Sender name or email to filter by"),
    }),
  }
);
