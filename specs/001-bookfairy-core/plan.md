# Technical Plan: BookFairy Core

## Architecture
- **Runtime**: Node 20 plus, TypeScript.
- **Discord**: discord.js interactions and component buttons.
- **HTTP and IO**: axios or fetch, retry with backoff, correlation id per request.
- **Schemas**: zod for inputs and outputs.
- **Headless flow, MAM**: Playwright preferred, or Puppeteer, for login and browse only result capture, no direct torrent fetch.
- **Relay**: Prowlarr REST for searches, optional Readarr series ops, qBittorrent untouched by bot except optional status peek.
- **Metadata**: Hardcover GraphQL for enrichment on title or author flows.

## Folders, reuse existing layout
- `src/discord/*`: commands, components, router.
- `src/integrations/prowlarr/*`: relay client and DTOs.
- `src/integrations/readarr/*`: minimal add or lookup helpers.
- `src/integrations/mango/*`: curated genre and timeframe coordinator.
- `src/integrations/mam/*`: authenticated browse only session, if enabled.
- `src/integrations/hardcover/*`: GraphQL client and queries.
- `src/schemas/*`: zod schemas for Discord payloads and relay DTOs.
- `src/lib/*`: env, http client, rate limit, logging.
- `tests/*`: vitest suites for command routing, pagination, and relay DTOs.

## Commands
- `/bookfairy` opens main chooser with buttons:
  - **Audiobooks** → curated Mango or MAM flow
  - **By Title**
  - **By Author**
  - **Status**
  - **Help**
- `/genres` remains, it routes to the same handler as Audiobooks.

## Flows
1) **Audiobooks, curated**
   - Present genre fixed list, then timeframe fixed list.
   - Fetch curated list from Mango service, normalize to `{title, author?, year?, link}`.
   - Optional MAM browse enrichment behind `FEATURE_MAM_FLOW`.
   - Confirm path, build Prowlarr search relay payload.
2) **Search by Title or Author**
   - Query Hardcover GraphQL, normalize candidates.
   - Show 5 at a time, confirm, Prowlarr relay.
3) **Status**
   - Show last N relays and qBittorrent queue summary if configured.

## Config
- `.env` keys for Discord, Prowlarr, Readarr, qBittorrent, Hardcover.
- Feature flags: `FEATURE_MAM_FLOW=true|false`, `FEATURE_HARDCOVER=true|false`.

## Testing
- **Unit**: command routing, zod schemas, pagination math.
- **Integration**: mock Prowlarr or Readarr endpoints, Hardcover GraphQL fixture, Playwright headed stub for MAM.
- **E2E, local**: `npm test` target that exercises the full happy path without external IO when flags are disabled.

## Telemetry
- pino JSON logs, request id per interaction, success and failure counters, simple Prom metrics endpoint.

## Rollout
- Implement behind flags, default MAM off, Hardcover on.
- Keep current behavior working during integration.
- Ship in PRs tied to tasks below.
