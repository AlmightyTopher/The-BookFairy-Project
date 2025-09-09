# Tasks: BookFairy Core

**Input**: Design documents from `/specs/001-bookfairy-core/`
**Prerequisites**: plan.md (required), spec.md

## Phase 3.1: Setup

- [ ] T001 Add feature flags FEATURE_MAM_FLOW and FEATURE_HARDCOVER to src/lib/config.ts
- [ ] T002 [P] Create zod schemas for Discord payloads in src/schemas/discord.ts
- [ ] T003 [P] Create zod schemas for Prowlarr DTOs in src/schemas/prowlarr.ts
- [ ] T004 [P] Create zod schemas for Hardcover DTOs in src/schemas/hardcover.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T005 [P] Unit test for pagination utility in tests/unit/pagination.test.ts
- [ ] T006 [P] Unit test for command routing in tests/unit/commands.test.ts
- [ ] T007 [P] Integration test for audiobooks flow in tests/integration/audiobooks.test.ts
- [ ] T008 [P] Integration test for title search flow in tests/integration/title-search.test.ts
- [ ] T009 [P] Integration test for author search flow in tests/integration/author-search.test.ts
- [ ] T010 [P] Integration test for status view in tests/integration/status.test.ts
- [ ] T011 [P] Contract test for Prowlarr relay in tests/contract/prowlarr.test.ts
- [ ] T012 [P] Contract test for Hardcover GraphQL in tests/contract/hardcover.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T013 [P] Pagination utility with 5-item pages in src/lib/pagination.ts
- [ ] T014 [P] Rate limiting middleware in src/lib/rate-limit.ts
- [ ] T015 [P] Correlation ID middleware in src/lib/correlation.ts
- [ ] T016 Update main /bookfairy command with unified buttons in src/discord/commands/bookfairy.ts
- [ ] T017 Wire /genres command to audiobooks handler in src/discord/commands/genres.ts
- [ ] T018 [P] Prowlarr client implementation in src/integrations/prowlarr/client.ts
- [ ] T019 [P] Readarr minimal helper in src/integrations/readarr/client.ts
- [ ] T020 [P] Hardcover GraphQL client in src/integrations/hardcover/client.ts
- [ ] T021 [P] MAM browser service (behind feature flag) in src/integrations/mam/browser.ts
- [ ] T022 [P] Mango curated service in src/integrations/mango/service.ts

## Phase 3.4: Discord Interactions

- [ ] T023 Audiobooks button handler with genre/timeframe selection in src/discord/interactions/audiobooks.ts
- [ ] T024 Title search button handler in src/discord/interactions/title-search.ts
- [ ] T025 Author search button handler in src/discord/interactions/author-search.ts
- [ ] T026 Status button handler in src/discord/interactions/status.ts
- [ ] T027 Help button handler in src/discord/interactions/help.ts
- [ ] T028 Book confirmation handler for Prowlarr relay in src/discord/interactions/confirm.ts

## Phase 3.5: Integration & Polish

- [ ] T029 [P] Request/response logging with pino in src/lib/logger.ts
- [ ] T030 [P] In-memory relay buffer for status tracking in src/lib/relay-store.ts
- [ ] T031 Connect Discord interactions to service layer
- [ ] T032 Add error handling and validation to all endpoints
- [ ] T033 [P] E2E test suite covering all happy paths in tests/e2e/bookfairy.test.ts
- [ ] T034 [P] Performance optimization - ensure <5s response time
- [ ] T035 [P] Update README with new commands and configuration in README.md

## Dependencies

- Setup (T001-T004) before tests (T005-T012)
- Tests (T005-T012) before implementation (T013-T028)
- Core implementation before integration (T029-T035)
- T013 blocks T023-T027 (pagination needed for all interactions)
- T018-T022 block T028 (clients needed for relay)
- T030 blocks T026 (relay store needed for status)

## Parallel Example

```bash
# Launch setup tasks together:
Task: "Create zod schemas for Discord payloads in src/schemas/discord.ts"
Task: "Create zod schemas for Prowlarr DTOs in src/schemas/prowlarr.ts" 
Task: "Create zod schemas for Hardcover DTOs in src/schemas/hardcover.ts"

# Launch test tasks together (after setup):
Task: "Unit test for pagination utility in tests/unit/pagination.test.ts"
Task: "Unit test for command routing in tests/unit/commands.test.ts"
Task: "Integration test for audiobooks flow in tests/integration/audiobooks.test.ts"
```

## Constitutional Compliance Checklist

- [ ] Single Discord entrypoint (/bookfairy command) ✓
- [ ] No DM file delivery (Prowlarr/Readarr/qBittorrent relay only) ✓
- [ ] Secrets remain in current locations (no credential managers) ✓
- [ ] 5-item pagination consistent across all flows ✓
- [ ] Repository structure preserved ✓

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- All relay operations must go through Prowlarr/Readarr/qBittorrent only
- Feature flags allow gradual rollout of MAM and Hardcover integrations
