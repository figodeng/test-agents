## ADDED Requirements

### Requirement: Post a note to Xiaohongshu
The xiaohongshu sub-agent SHALL support posting a new note with content and optional images via a `post_note` tool.

#### Scenario: Post text note
- **WHEN** user asks to post "My latest travel diary" to RED
- **THEN** agent calls `post_note` with content "My latest travel diary" and returns a mock success response with post ID

#### Scenario: Post note with images
- **WHEN** user asks to post a note with 3 photos
- **THEN** agent calls `post_note` with image count and returns a mock success response

### Requirement: Search content on Xiaohongshu
The xiaohongshu sub-agent SHALL support searching for content by keyword via a `search_content` tool.

#### Scenario: Search by keyword
- **WHEN** user asks to search for "coffee shops Shanghai" on RED
- **THEN** agent calls `search_content` with keyword "coffee shops Shanghai" and returns mock search results

### Requirement: Add comment on Xiaohongshu
The xiaohongshu sub-agent SHALL support adding a comment to a note via an `add_comment` tool.

#### Scenario: Comment on a note
- **WHEN** user asks to comment "Love this!" on a RED post
- **THEN** agent calls `add_comment` with content "Love this!" and returns a mock success response
