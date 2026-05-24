## Why

Users need a single conversational interface that understands their intent and routes requests to the right platform. Instead of switching between Xiaohongshu, WeChat, and Email separately, the user says what they want in natural language and the agent handles the routing automatically.

## What Changes

- **New** two-level agent hierarchy using `createAgent` from LangChain
- **New** top-level intention router that detects business/platform type from user input
- **New** three sub-agents (Xiaohongshu, WeChat, Email) each with platform-specific tools
- **New** sub-agents wrapped as tools via `tool()`, created once as singletons at module load
- **New** shared DeepSeek V4 Pro model instance with thinking mode enabled across all agents
- **New** interactive CLI REPL for user interaction

## Capabilities

### New Capabilities
- `intention-routing`: Top-level agent that detects business type from user input and routes to the correct sub-agent
- `xiaohongshu-agent`: Sub-agent for Xiaohongshu/RED operations (post notes, search content, add comments)
- `wechat-agent`: Sub-agent for WeChat operations (send messages, view moments, voice calls)
- `email-agent`: Sub-agent for email operations (compose, check inbox, search emails)

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New files: `src/agent.ts`, `src/model.ts`, `src/tools/`, `src/agents/`
- Dependencies: langchain, @langchain/openai, zod, dotenv
- All tool implementations use mock data (no external APIs)
