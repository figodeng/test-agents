## ADDED Requirements

### Requirement: Compose and send an email
The email sub-agent SHALL support composing and sending an email via a `compose_email` tool.

#### Scenario: Send email with subject and body
- **WHEN** user asks to "Email John about the Q2 report, subject: Q2 Results"
- **THEN** agent calls `compose_email` with recipient "John", subject "Q2 Results", and body text, and returns a mock sent confirmation

#### Scenario: Send email with CC
- **WHEN** user asks to email the team with CC to the manager
- **THEN** agent calls `compose_email` with CC recipients and returns a mock sent confirmation

### Requirement: Check email inbox
The email sub-agent SHALL support checking the inbox via a `check_inbox` tool.

#### Scenario: Check recent emails
- **WHEN** user asks to "Check my inbox"
- **THEN** agent calls `check_inbox` and returns a list of mock recent emails with sender, subject, and preview

#### Scenario: Check unread emails only
- **WHEN** user asks to "Show unread emails"
- **THEN** agent calls `check_inbox` with filter "unread" and returns mock unread email list

### Requirement: Search emails
The email sub-agent SHALL support searching emails by keyword via a `search_emails` tool.

#### Scenario: Search by keyword
- **WHEN** user asks to "Search emails for 'invoice'"
- **THEN** agent calls `search_emails` with keyword "invoice" and returns mock matching email results

#### Scenario: Search by sender
- **WHEN** user asks to "Find emails from Sarah"
- **THEN** agent calls `search_emails` with sender "Sarah" and returns mock matching results
