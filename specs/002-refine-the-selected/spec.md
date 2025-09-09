# Feature Specification: BookFairy Core Refinement - Constitutional Compliance

**Feature Branch**: `002-refine-the-selected`  
**Created**: 2025-09-09  
**Status**: Draft  
**Input**: User description: "Refine the selected spec. Enforce CONSTITUTION.md: one Discord entrypoint, no DM delivery, no moving secrets, 5-item pagination everywhere, relay via Prowlarr/Readarr/qBittorrent only. Return a complete markdown and APPLY the edit to specs/001-bookfairy-core/spec.md."

## User Scenarios & Testing

### Primary User Story
Discord users need a unified, constitutional-compliant way to discover and queue audiobooks/ebooks without juggling multiple interfaces, while maintaining existing repository integrity and security practices.

### Acceptance Scenarios
1. **Given** a Discord user in a target guild, **When** they use the single Discord entrypoint command, **Then** they see exactly 5 buttons: Audiobooks, By Title, By Author, Status, Help
2. **Given** a user browses any content (audiobooks, search results, status), **When** results are displayed, **Then** pagination shows exactly 5 items per page consistently
3. **Given** a user confirms an audiobook/ebook selection, **When** the confirmation is processed, **Then** the request is relayed exclusively to Prowlarr/Readarr/qBittorrent with no direct file delivery
4. **Given** the application is running, **When** accessed via npm run dev, **Then** all existing functionality remains intact and tests continue to pass
5. **Given** credential management needs, **When** secrets are required, **Then** they remain in their current storage locations without modification

### Edge Cases
- What happens when pagination would result in fewer than 5 items on the last page?
- How does the system handle relay failures to Prowlarr/Readarr/qBittorrent?
- What occurs if users attempt to access DM-based file delivery features?

## Requirements

### Functional Requirements
- **FR-001**: System MUST provide exactly one Discord slash command entrypoint
- **FR-002**: System MUST display exactly 5 items per page for all paginated content (audiobooks, search results, status)
- **FR-003**: System MUST relay all confirmed selections exclusively through Prowlarr, Readarr, or qBittorrent
- **FR-004**: System MUST NOT provide any direct message (DM) file delivery functionality
- **FR-005**: System MUST preserve existing repository structure, history, and commands
- **FR-006**: System MUST maintain current secret storage locations without modification
- **FR-007**: System MUST keep existing Discord buttons functional through remapping only
- **FR-008**: System MUST continue to pass all tests when running npm run dev
- **FR-009**: System MUST provide access to: curated audiobook browsing, title search, author search, status checking, and help
- **FR-010**: System MUST log all relay events with correlation IDs for traceability
- **FR-011**: System MUST enforce rate limiting per guild and per user
- **FR-012**: System MUST complete happy path scenarios (browse, search, relay) in under 5 seconds (p50)

### Key Entities
- **Discord Command**: Single entrypoint with routing to five core functions
- **Pagination State**: Consistent 5-item display across all content types
- **Relay Request**: Structured handoff to external download management systems
- **User Session**: Guild-scoped interaction tracking with rate limiting
- **Correlation Event**: Logged relay operations for monitoring and debugging

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
