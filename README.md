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
