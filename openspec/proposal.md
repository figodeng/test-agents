# Build Intention Agent with LangChain JS

## Summary
A CLI REPL agent using LangChain's `createAgent` that detects business/platform intent from user input and routes to the correct sub-agent. Sub-agents handle platform-specific operations. All tool data is mocked.

## Architecture

```
src/
├── model.ts              ← shared ChatOpenAI singleton (DeepSeek V4 Pro)
│                            thinking.enabled + reasoning_effort: high
│
├── tools/
│   ├── xiaohongshu.ts    ← post_note, search_content, add_comment
│   ├── wechat.ts         ← send_message, view_moments, voice_call
│   └── email.ts          ← compose_email, check_inbox, search_emails
│
├── agents/
│   ├── xiaohongshu.ts    ← createAgent({ model, tools: [3 RED tools] })
│   ├── wechat.ts         ← createAgent({ model, tools: [3 WeChat tools] })
│   └── email.ts          ← createAgent({ model, tools: [3 Email tools] })
│
└── agent.ts              ← top-level createAgent + readline REPL
                            tools: [xiaohongshuTool, wechatTool, emailTool]
```

### Two-level agent hierarchy

- **Top agent** — detects business type from user input, routes to the correct sub-agent tool
- **Sub-agents** — platform-specific agents (createAgent) wrapped as tools, handle detailed operations

### Key decisions
- **Singleton sub-agents** — created once at module load, reused
- **Discrete platform tools** — each platform exposes multiple tools (Option B)
- **Shared model** — one ChatOpenAI instance passed to all agents
- **Sub-agents as tools** — each sub-agent wrapped via `tool()`, top agent routes to them

### Invocation flow
```
User input → Top agent (detect platform) → Sub-agent tool (singleton)
                                           → Inner createAgent (platform tools)
                                           → Result ← ← ←
```

## Dependencies
- langchain, @langchain/openai, zod, dotenv, readline
