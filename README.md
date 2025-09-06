# The BookFairy Project

## What it is
Discord-first assistant that finds, validates, and queues audiobooks or ebooks via Prowlarr, Readarr, and qBittorrent, with optional n8n orchestration.

## Quickstart
1. `cp .env.example .env` and fill values
2. `npm ci`
3. `npm run dev` to run locally, `npm test` to verify

## Commands

- `/bookfairy` opens the chooser. Buttons: Get a book, Search by genre, Check status, Help.
- `/genres` browse audiobooks by genre and timeframe via Mango Mushrooms integration.

## Features

## Core Features

### Audiobooks: Fixed Labels with Live Link Refresh, 5 Item Pagination, Namlinks to Prowlarr Flow

#### New Canonical Audiobook Discovery System

A headless browsing and relay flow for discovering audiobooks through curated genre/time combinations:

- **Fixed Canonical Labels**: 12 hardcoded genres (Fiction, Mystery, Romance, etc.) and 6 time windows (week, month, 3 months, 6 months, 1 year, all time)
- **Runtime Link Refresh**: Always fetches fresh links from Mango-Mushroom site at request time
- **MAM Integration**: Navigates to MyAnonamouse results pages with automatic login
- **5-Item Pagination**: Matches title search UX exactly with "Page X of Y" indicator
- **Prowlarr Relay**: Sends selected items to Prowlarr (never downloads directly)
- **Rate Limited**: Per-guild and per-user rate limiting with graceful fallbacks

#### User Experience

1. Click "📚 Audiobooks" from main menu
2. Select from canonical genre list
3. Choose time window
4. Browse paginated results (5 per page)
5. Select item → confirm → send to Prowlarr

#### Technical Implementation

- `src/integrations/mango/mam-flow.ts` - Core flow manager with canonical labels
- `src/integrations/mango/prowlarr-relay.ts` - Secure handoff to Prowlarr
- Rate limiting and session state management
- Headless browser navigation with retry logic

#### Dry Run Mode

Test the scraping and pagination without calling Prowlarr:

```bash
npm run test:mam-flow
```

### Genre & Timeframe Browser (Mango)

Discover popular audiobooks by genre and time period using the Mango Mushrooms service:

- Browse by genres: Fiction, Mystery, Sci-Fi, Fantasy, etc.
- Filter by timeframes: 1 week, 1 month, 3 months, 6 months, 1 year, all time
- Optional MAM enrichment for additional metadata and download links
- Rate-limited requests with caching for performance

### Search & Download

- Direct integration with Prowlarr for torrent indexing
- Readarr integration for series management
- qBittorrent for download management
- Smart matching and quality selection

## Architecture

- `src/discord` interactions and state machine
- `src/schemas` data contracts via Zod
- `src/lib/http` outbound calls with retry and limits
- `src/security` allowlists and path guards
- `src/metrics` health and Prom metrics

## Testing

- Vitest only, `npm test`, coverage via V8.

## Ops

- Health: `GET /healthz`, Metrics: `GET /metrics`
- Logs: JSON via pino, correlation ids per-request

## Contributing

- `npm run lint`, `npm run typecheck`, tests must pass in CI.

## License

MIT
