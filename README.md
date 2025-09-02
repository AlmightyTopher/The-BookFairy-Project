# The BookFairy Project

## What it is
Discord-first assistant that finds, validates, and queues audiobooks or ebooks via Prowlarr, Readarr, and qBittorrent, with optional n8n orchestration.

## Quickstart
1. `cp .env.example .env` and fill values
2. `npm ci`
3. `npm run dev` to run locally, `npm test` to verify

## Commands
- `/bookfairy` opens the chooser. Buttons: Get a book, Search by genre, Check status, Help.

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
