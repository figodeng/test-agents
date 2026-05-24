## 1. Cleanup & Setup

- [x] 1.1 Remove old `src/tools.ts` and `src/agent.ts` from previous manual bindTools implementation
- [x] 1.2 Create directory structure: `src/tools/`, `src/agents/`
- [x] 1.3 Ensure `.env` exists with `DEEPSEEK_API_KEY`

## 2. Shared Model

- [x] 2.1 Create `src/model.ts` — ChatOpenAI singleton pointed at `api.deepseek.com` with `deepseek-v4-pro`, thinking mode enabled, reasoning_effort high

## 3. Platform Tool Definitions

- [x] 3.1 Create `src/tools/xiaohongshu.ts` — `post_note`, `search_content`, `add_comment` tools with Zod schemas and mock implementations
- [x] 3.2 Create `src/tools/wechat.ts` — `send_message`, `view_moments`, `voice_call` tools with Zod schemas and mock implementations
- [x] 3.3 Create `src/tools/email.ts` — `compose_email`, `check_inbox`, `search_emails` tools with Zod schemas and mock implementations

## 4. Sub-Agent Singletons

- [x] 4.1 Create `src/agents/xiaohongshu.ts` — `createAgent` singleton with RED tools, wrapped as a tool via `tool()`
- [x] 4.2 Create `src/agents/wechat.ts` — `createAgent` singleton with WeChat tools, wrapped as a tool via `tool()`
- [x] 4.3 Create `src/agents/email.ts` — `createAgent` singleton with Email tools, wrapped as a tool via `tool()`

## 5. Top Agent & REPL

- [x] 5.1 Create `src/agent.ts` — top-level `createAgent` with sub-agent tools, intention-routing prompt, sub-agent deal with the request with the complete user's input,plus readline REPL with reasoning display and `/exit` support

## 6. Verify

- [x] 6.1 Run `npx tsc --noEmit` to verify type-safety
- [ ] 6.2 Run `npm run dev` and test routing to each platform with sample inputs
