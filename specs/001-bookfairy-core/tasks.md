# Tasks: BookFairy Core

## 0. Repo prep
- [ ] Add `specs/001-bookfairy-core/*` and commit.
- [ ] Add `FEATURE_MAM_FLOW` and `FEATURE_HARDCOVER` flags to config loader.
**AC**: App boots with flags present or defaulted.

## 1. Unified entry and buttons
- [ ] Ensure `/bookfairy` shows: Audiobooks, By Title, By Author, Status, Help.
- [ ] Wire existing `/genres` to call the same handler as Audiobooks.
**AC**: Button routes map one to one to handlers, no dead paths.

## 2. Pagination primitive
- [ ] Implement shared paginator util, 5 per page, “Page X of Y”, next or prev with custom id.
**AC**: Unit tests cover edge pages, single page, multi page.

## 3. Curated Audiobooks flow
- [ ] Genre list, fixed 12, timeframe list, fixed 6.
- [ ] Fetch curated list via Mango service, normalize to `{title, author?, year?, link}`.
- [ ] Optional MAM browse enrichment behind `FEATURE_MAM_FLOW`.
- [ ] Confirm path, build Prowlarr relay payload.
**AC**: Selecting an item logs a relay ready DTO.

## 4. Title search
- [ ] Query Hardcover GraphQL by title, normalize candidates.
- [ ] Show 5 at a time, confirm, Prowlarr relay payload.
**AC**: Returns at least one valid candidate for a known title fixture.

## 5. Author search
- [ ] Query Hardcover GraphQL by author, group series sensibly, paginate.
- [ ] Confirm, Prowlarr or Readarr action depending on config.
**AC**: Known author fixture yields grouped output and a valid relay DTO.

## 6. Relay clients
- [ ] Prowlarr client, configurable base URL and apiKey, search endpoint wrapper.
- [ ] Readarr minimal helper, add or lookup author or series if enabled.
**AC**: Integration tests with mock servers pass.

## 7. Status view
- [ ] Show last N relays from in memory ring buffer or lightweight store.
- [ ] Optional qBittorrent summary if configured.
**AC**: Command returns within one second with recent actions.

## 8. Rate limits and logging
- [ ] Per guild and per user rate limit middlewares.
- [ ] pino logs with correlation id, error cause chains.
**AC**: Limits enforced and logged, tests verify cooldowns.

## 9. E2E script
- [ ] Vitest suite that simulates: Audiobooks → pick → confirm, Title → pick → confirm, Author → pick → confirm.
**AC**: Test green with external IO mocked.

## 10. Docs
- [ ] Update README sections for commands and flags.
**AC**: Quickstart still works, `npm run dev`, `npm test`.
