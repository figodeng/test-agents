## ADDED Requirements

### Requirement: Agent detects business type from user input
The top-level agent SHALL analyze user input and determine which platform (Xiaohongshu, WeChat, or Email) the user intends to interact with.

#### Scenario: User asks to post on social media
- **WHEN** user says "Post my vacation photos to RED"
- **THEN** agent routes to the xiaohongshu sub-agent

#### Scenario: User asks to send a message
- **WHEN** user says "Send a message to the team on WeChat"
- **THEN** agent routes to the wechat sub-agent

#### Scenario: User asks to check inbox
- **WHEN** user says "Check my email inbox"
- **THEN** agent routes to the email sub-agent

### Requirement: Agent handles ambiguous input
The top-level agent SHALL ask for clarification when user intent is ambiguous across multiple platforms.

#### Scenario: Ambiguous messaging request
- **WHEN** user says "Send a message to Alice" without specifying the platform
- **THEN** agent asks whether to use WeChat or Email

### Requirement: Agent returns sub-agent results to user
The top-level agent SHALL relay the sub-agent's response back to the user in a conversational format.

#### Scenario: Successful tool execution
- **WHEN** a sub-agent completes its operation
- **THEN** the top agent presents the result to the user without raw tool output formatting
