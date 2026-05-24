## ADDED Requirements

### Requirement: Send a message on WeChat
The wechat sub-agent SHALL support sending a text message to a contact or group via a `send_message` tool.

#### Scenario: Send message to contact
- **WHEN** user asks to send "Meeting at 3pm" to Zhang Wei on WeChat
- **THEN** agent calls `send_message` with content "Meeting at 3pm" and recipient "Zhang Wei" and returns a mock success response

#### Scenario: Send message to group
- **WHEN** user asks to send "Project update" to the Engineering group on WeChat
- **THEN** agent calls `send_message` with content "Project update" and group "Engineering" and returns a mock success response

### Requirement: View WeChat moments
The wechat sub-agent SHALL support viewing recent moments/posts via a `view_moments` tool.

#### Scenario: View recent moments
- **WHEN** user asks to "Show me recent WeChat moments"
- **THEN** agent calls `view_moments` and returns a list of mock moments with author and content

### Requirement: Make a voice call on WeChat
The wechat sub-agent SHALL support initiating a voice call via a `voice_call` tool.

#### Scenario: Initiate voice call
- **WHEN** user asks to "Call Mom on WeChat"
- **THEN** agent calls `voice_call` with contact "Mom" and returns a mock call initiation response
