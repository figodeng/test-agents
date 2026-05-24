## Context

A CLI REPL agent that understands user intent from natural language input and routes requests to platform-specific sub-agents. Each sub-agent handles its own platform operations (Xiaohongshu, WeChat, Email). The system uses DeepSeek V4 Pro via LangChain's OpenAI-compatible adapter. All tool data is mocked.

Current state: empty project with a stale manual `bindTools` implementation in `src/` that needs to be replaced with the `createAgent`-based architecture.

## Goals / Non-Goals

**Goals:**
- Use `createAgent` from `langchain` for proper ReAct agent loop (replaces manual tool dispatch)
- Two-level agent hierarchy: top agent routes to sub-agents
- Sub-agents wrapped as tools, created once as singletons at module load
- Shared DeepSeek ChatOpenAI model instance across all agents
- Each platform exposes multiple discrete tools (Option B: granular tools)
- Interactive readline REPL with reasoning display

**Non-Goals:**
- Real API integrations (all mock data)
- Multi-turn conversation memory across REPL turns
- Streaming responses
- Authentication or user management

## Decisions

### 1. `createAgent` over manual `bindTools`
**Decision**: Use `createAgent({ model, tools, prompt })` from `langchain`.
**Why**: `createAgent` provides a production-ready ReAct loop that handles tool execution, result synthesis, and error recovery out of the box. Manual `bindTools` requires implementing the agent loop ourselves (feed tool results back to model, handle multi-step reasoning).
**Alternatives considered**: Manual `bindTools` + `AgentAction`/`AgentFinish` types — rejected because it duplicates logic `createAgent` already provides.

### 2. Sub-agents as tools (singleton pattern)
**Decision**: Each sub-agent is created once at module load via `createAgent`, then wrapped with `tool()` and registered on the top agent.
**Why**: Singleton avoids repeated initialization cost. The `tool()` wrapper gives the top agent a clean interface — it sees sub-agents as plain tools with names and schemas.
**Alternatives considered**: Creating inner agents on each invocation — rejected due to unnecessary overhead.

### 3. Discrete platform tools (Option B)
**Decision**: Each sub-agent exposes multiple specific tools rather than a single catch-all chat tool.
**Why**: Gives the sub-agent structured decision-making within its platform domain. Users don't need to know tool names — the sub-agent picks the right one.
- Xiaohongshu: `post_note`, `search_content`, `add_comment`
- WeChat: `send_message`, `view_moments`, `voice_call`
- Email: `compose_email`, `check_inbox`, `search_emails`
**Alternatives considered**: Single chat tool per platform (Option A) — rejected because it loses structured tool selection within the sub-agent.

### 4. Shared model instance
**Decision**: One `ChatOpenAI` instance (DeepSeek V4 Pro, thinking mode enabled) shared across all four `createAgent` calls.
**Why**: Avoids multiple HTTP client instances. The model is stateless — sharing is safe. Each `createAgent` call gets its own prompt and tool set, which properly scopes behavior.

### 5. File structure
```
src/
├── model.ts              # shared ChatOpenAI singleton
├── tools/                # platform tool definitions (Zod schemas + mocks)
│   ├── xiaohongshu.ts
│   ├── wechat.ts
│   └── email.ts
├── agents/               # sub-agents (createAgent singletons, wrapped as tools)
│   ├── xiaohongshu.ts
│   ├── wechat.ts
│   └── email.ts
└── agent.ts              # top agent + readline REPL
```

## Risks / Trade-offs

- **Singleton stale state**: If a sub-agent's internal state needs resetting, singletons don't provide isolation between turns. **Mitigation**: Sub-agents are stateless — each `invoke` is independent with fresh messages.
- **Two-level depth limit**: Nesting agents deeper would add latency (each level = LLM call). **Mitigation**: Two levels is sufficient for this use case. If more platforms are added, they're siblings, not deeper.
- **DeepSeek thinking mode**: `reasoning_content` field may not be surfaced by `createAgent`'s response handling. **Mitigation**: Reasoning is shown in REPL output; if createAgent drops it, we can add middleware or check raw response fields.
- **Tool name collision**: If two platforms export a tool with the same name, the top agent's tool registry would conflict. **Mitigation**: Tool names are namespaced by platform (`post_note`, not generic `post`).
