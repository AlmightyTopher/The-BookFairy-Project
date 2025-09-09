# Spec: BookFairy Core, Discord-first Audiobook and Ebook Assistant

## Problem
Users want a Discord native way to find, validate, and queue audiobooks and ebooks without juggling web UIs. They need clean search, curated discovery, and a safe handoff to existing *arr and qBittorrent stacks.

## Outcome
From a single Discord interaction, a user can:
- Browse curated audiobook lists by genre and timeframe, or search by title or author.
- See 5 item paginated results with sane, consistent labeling.
- Confirm an item, then relay to Prowlarr or Readarr for indexer search and downstream download via qBittorrent.
- Check request status and recent actions.

## Users
- Discord users in the target guilds, non-technical, mobile first.
- The operator, Toefur, who configures tokens and endpoints.

## Scope, Phase 0
- Wire up discovery and search, unify flows behind one command suite.
- Implement Prowlarr relay, not direct downloads.
- Integrate Hardcover GraphQL for metadata enrichment where helpful.
- Support MyAnonamouse via browser or login flow or indexer relay, not direct scraping for downloads.

## Non goals, Phase 0
- No DM based file delivery.
- No library management UI, leave to Readarr and Audiobookshelf.
- No credential managers, keep your existing decision to store keys in workflows or env files.

## Key Scenarios
1) **Curated Audiobooks**, user clicks Audiobooks, picks a genre and timeframe, sees paginated items, confirms, relay to Prowlarr.
2) **Search by Title or Author**, returns candidates with core fields and a confirm path, relay to Prowlarr or Readarr.
3) **Status**, shows last N relays and current qBittorrent queue summary.

## Data and Integrations
- **Discord**: slash commands, component buttons, state.
- **Prowlarr**: indexer relay for search results.
- **Readarr**: author or series management as needed.
- **qBittorrent**: downstream downloading only.
- **Hardcover GraphQL**: title or author metadata and covers, free to use with account token.
- **MAM**: private tracker, navigate via authenticated session, or let Prowlarr handle compatible indexer definitions.

## Constraints
- Must run with `npm run dev`, keep TypeScript and Vitest tests intact.
- Rate limit per guild and per user.
- No storing credential secrets in code output here beyond what you already do locally.

## Risks
- MAM is a private tracker, policies can change.
- Indexer availability varies, so relay first architecture is safer.
- API quotas or changes from third parties.

## Success Metrics
- p50 end to end selection to relay under 5 seconds.
- Under 1 percent button or action mismatch in logs under load.
- Over 95 percent happy path completion for the three key scenarios above.

## Acceptance Criteria, Phase 0
- One slash entrypoint with buttons that route to: Audiobooks, By Title, By Author, Status, Help.
- 5 item pagination is consistent across discovery and search.
- Relay events logged with correlation ids.
- Tests cover command routing, pagination math, and relay payload construction.
