# Spec: BookFairy Core, Discord-first Audiobook and Ebook Assistant

## Problem
Users want a Discord native way to find, validate, and queue audiobooks and ebooks without juggling web UIs. They need clean search, curated discovery, and a safe handoff to existing *arr and qBittorrent stacks.

## Outcome
From a single Discord interaction, a user can:
- Browse curated audiobook lists by genre and timeframe, or search by title or author.
- See exactly 5 item paginated results with consistent labeling across all flows.
- Confirm an item, then relay exclusively to Prowlarr or Readarr for indexer search and downstream download via qBittorrent.
- Check request status and recent actions.

## Users
- Discord users in the target guilds, non-technical, mobile first.
- The operator, Toefur, who configures tokens and endpoints.

## Scope, Phase 0
- Wire up discovery and search, unify flows behind one Discord slash command entrypoint.
- Implement Prowlarr/Readarr relay only, no direct downloads or DM file delivery.
- Integrate Hardcover GraphQL for metadata enrichment where helpful.
- Support MyAnonamouse via Prowlarr indexer relay, not direct scraping for downloads.
- Maintain existing repository structure, history, and npm run dev functionality.

## Non goals, Phase 0
- No DM based file delivery (constitutional requirement).
- No library management UI, leave to Readarr and Audiobookshelf.
- No credential managers, secrets stay in current storage locations (constitutional requirement).
- No moving or modifying existing secret storage decisions.

## Constitutional Requirements (CONSTITUTION.md)
- **One Discord entrypoint**: Single slash command with button routing only
- **No DM delivery**: All confirmed items relay through Prowlarr/Readarr/qBittorrent exclusively
- **No moving secrets**: Keys remain in current storage locations without modification
- **5-item pagination**: Consistent across all discovery, search, and status flows
- **Preserve repository**: Keep existing repo, history, commands, and npm run dev functionality

## Key Scenarios
1) **Curated Audiobooks**, user clicks Audiobooks, picks a genre and timeframe, sees exactly 5 paginated items, confirms, relay to Prowlarr.
2) **Search by Title or Author**, returns candidates with core fields in 5-item pages and a confirm path, relay to Prowlarr or Readarr.
3) **Status**, shows last N relays and current qBittorrent queue summary in 5-item pagination.

## Data and Integrations
- **Discord**: Single slash command, component buttons, state management.
- **Prowlarr**: indexer relay for search results (constitutional requirement).
- **Readarr**: author or series management as needed (constitutional requirement).
- **qBittorrent**: downstream downloading only (constitutional requirement).
- **Hardcover GraphQL**: title or author metadata and covers, free to use with account token.
- **MAM**: private tracker, navigate via Prowlarr indexer relay only.

## Constraints
- Must run with `npm run dev`, keep TypeScript and Vitest tests intact (constitutional requirement).
- Rate limit per guild and per user.
- No storing credential secrets in code output here beyond what you already do locally (constitutional requirement).
- All existing Discord buttons must remain functional through remapping only (constitutional requirement).

## Risks
- MAM is a private tracker, policies can change.
- Indexer availability varies, so relay first architecture is safer.
- API quotas or changes from third parties.

## Success Metrics
- p50 end to end selection to relay under 5 seconds.
- Under 1 percent button or action mismatch in logs under load.
- Over 95 percent happy path completion for the three key scenarios above.
- 100% compliance with constitutional requirements (one entrypoint, no DM delivery, secrets unchanged, 5-item pagination).

## Acceptance Criteria, Phase 0
- Exactly one slash entrypoint with buttons that route to: Audiobooks, By Title, By Author, Status, Help (constitutional requirement).
- 5 item pagination is consistent across discovery, search, and status (constitutional requirement).
- Relay events logged with correlation ids.
- Tests cover command routing, pagination math, and relay payload construction.
- No DM file delivery functionality present (constitutional requirement).
- All secrets remain in current storage locations (constitutional requirement).
- Repository structure, history, and commands preserved (constitutional requirement).
