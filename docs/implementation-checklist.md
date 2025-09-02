# Implementation Checklist - Discord Mobile Browse Flow

## 📋 Phase-by-Phase Implementation Guide

This document provides a detailed implementation checklist following the Test-Before-Modify workflow outlined in `remember.md`.

## 🔒 Safety Protocol Reminder

Before ANY implementation:

- ✅ **NO modifications** to existing code without explicit permission
- ✅ **Clone-first approach** for all testing  
- ✅ **Wait for approval** before actual implementation
- ✅ **Preserve existing behavior** as primary directive

## Phase 1: Data Foundation ✅ READY TO IMPLEMENT

### 1.1 Genre Database Creation

**Files to Create:**
- `data/genres.json`

**Implementation Steps:**
1. Create genre database with 150+ entries
2. Structure: `{ id, label, synonyms[] }`
3. Include audiobook-relevant categories
4. Validate JSON parsing and unique IDs

**Acceptance Criteria:**
- [ ] JSON parses without errors
- [ ] All genre IDs are unique
- [ ] Minimum 150 genre entries
- [ ] Synonyms array populated for each genre
- [ ] Covers major audiobook categories

**Test Strategy:**
```typescript
// Test file: tests/unit/genres.test.ts
describe('Genre Database', () => {
  test('genres.json is valid JSON', () => {
    const genres = require('../../data/genres.json');
    expect(genres).toBeDefined();
    expect(Array.isArray(genres.genres)).toBe(true);
  });
  
  test('all genre IDs are unique', () => {
    const genres = require('../../data/genres.json');
    const ids = genres.genres.map(g => g.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});
```

### 1.2 Timeframe Presets Creation

**Files to Create:**
- `data/timeframes.json`

**Implementation Steps:**
1. Create exact preset array: `["24h","3d","7d","30d","90d","all"]`
2. Add descriptions mapping
3. Validate structure

**Acceptance Criteria:**
- [ ] Exact values match specification
- [ ] JSON structure is valid
- [ ] Descriptions provided for each preset

## Phase 2: Schema & Types ✅ READY TO IMPLEMENT

### 2.1 Search Schema Definition

**Files to Create:**
- `src/schemas/search.ts`

**Implementation Steps:**
1. Define Zod schemas for SearchItem and SearchResultPage
2. Export TypeScript types
3. Add validation helpers

**Acceptance Criteria:**
- [ ] Zod schemas validate correctly
- [ ] TypeScript types exported
- [ ] Schema validates test fixtures
- [ ] Error messages are user-friendly

### 2.2 Timeframe Mapper Utility

**Files to Create:**
- `src/utils/timeframe-mapper.ts`
- `tests/unit/timeframe-mapper.test.ts`

**Implementation Steps:**
1. Implement `presetToMaxAgeDays(preset)` function
2. Create comprehensive unit tests
3. Handle edge cases and invalid inputs

**Acceptance Criteria:**
- [ ] All preset mappings correct (24h=1, 3d=3, etc.)
- [ ] Returns null for 'all' preset
- [ ] Throws error for invalid presets
- [ ] Unit tests achieve 100% coverage

## Phase 3: Backend Services ⚠️ NEEDS APPROVAL

**Risk Level:** MEDIUM (touches existing indexer integration)

### 3.1 Indexer Router Creation

**Files to Create:**
- `src/services/indexers/router.ts`
- `tests/unit/indexer-router.test.ts`

**Files to Review/Extend:**
- `src/clients/prowlarr-client.ts` (may need genre mapping)
- `config/` files (for new configuration)

**Implementation Strategy:**
1. **First:** Create test version `indexer-router-test.ts`
2. **Then:** Mock existing Prowlarr client calls
3. **Finally:** Replace after approval

**Acceptance Criteria:**
- [ ] Unified SearchResultPage interface
- [ ] Prowlarr integration working
- [ ] Optional MAM proxy support
- [ ] Error handling for service failures
- [ ] Genre to category mapping

## Phase 4: Discord Integration ⚠️ HIGH RISK

**Risk Level:** HIGH (modifies Discord bot behavior)

### 4.1 Slash Command Registration

**Files to Create:**
- `src/commands/browse.ts`

**Files to Modify:**
- `src/index.ts` (command registration)
- Discord application configuration

**Critical Safety Requirements:**
- **MUST** preserve existing message-based functionality
- **MUST** not break current button interactions
- **MUST** test in isolation first

### 4.2 UI Components

**Files to Create:**
- `src/ui/genre-selector.ts`
- `src/ui/timeframe-selector.ts`
- `src/ui/results-presenter.ts`

**Implementation Strategy:**
1. Create standalone UI components first
2. Test with mock data
3. Integrate with Discord client after approval

## Phase 5: Queue & API Enhancement ⚠️ MEDIUM RISK

**Risk Level:** MEDIUM (extends existing HTTP server)

### 5.1 Queue Endpoint

**Files to Modify:**
- `src/web/health-server.ts`

**Files to Create:**
- `src/api/queue-handler.ts`
- `tests/integration/queue-endpoint.test.ts`

**Critical Requirements:**
- **MUST** not break existing health endpoint
- **MUST** integrate with existing download system
- **MUST** preserve metrics collection

## 📊 Implementation Dependencies

### Prerequisites

1. **Existing Systems Must Remain Functional:**
   - Message-based search commands
   - Button interaction handlers
   - Download monitoring system
   - Health metrics endpoint

2. **New Dependencies:**
   - Discord.js slash command support
   - Zod validation library (if not present)
   - Additional memory for caching

### Integration Points

1. **Prowlarr Client:** Extend for genre-based searches
2. **Download System:** Integrate queue endpoint
3. **Discord Bot:** Add slash command handling
4. **Metrics:** Extend with browse-specific counters

## 🧪 Testing Strategy

### Test Environment Setup

```bash
# Test data fixtures
tests/fixtures/
├── genres-sample.json      # Sample genre data
├── search-results.json     # Mock search responses
└── discord-interactions.json  # Mock Discord events
```

### Testing Phases

1. **Unit Tests:** Individual components in isolation
2. **Integration Tests:** Component interactions  
3. **Discord Tests:** Mock Discord API interactions
4. **Smoke Tests:** End-to-end validation
5. **Performance Tests:** Response time validation

### Rollback Strategy

1. **Feature Flags:** Enable/disable slash commands
2. **Database Rollback:** Revert schema changes
3. **Discord Rollback:** Remove slash command registration
4. **Code Rollback:** Git revert capabilities

## 📈 Monitoring & Validation

### Success Metrics

- **Response Time:** < 3 seconds for searches
- **Error Rate:** < 1% for UI interactions
- **Cache Hit Rate:** > 80% for pagination
- **User Adoption:** Gradual increase in slash command usage

### Alert Conditions

- Search response time > 5 seconds
- Error rate > 5% in 5-minute window
- Memory usage > 1GB
- Cache hit rate < 50%

## 🚀 Deployment Planning

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Discord app permissions configured
- [ ] Environment variables set
- [ ] Rollback plan tested

### Deployment Steps

1. **Stage 1:** Deploy backend services (no Discord changes)
2. **Stage 2:** Register slash commands (limited guilds)
3. **Stage 3:** Enable UI components
4. **Stage 4:** Full rollout with monitoring

### Post-Deployment Validation

- [ ] Slash commands appear in Discord
- [ ] Genre autocomplete working
- [ ] Search results display correctly
- [ ] Queue functionality operational
- [ ] Metrics collecting properly

---

## 🔑 APPROVAL GATES

Before proceeding with each phase, explicit approval required:

### Phase 1 & 2: **# permission to modify** (Low Risk)
- Data files and new utility functions
- No existing code modifications

### Phase 3: **# approved to replace original** (Medium Risk)  
- May need to extend existing Prowlarr client
- New service layer creation

### Phase 4: **# expand to other modules** (High Risk)
- Discord bot modifications
- Slash command registration
- UI integration

### Phase 5: **# safe to overwrite** (Medium Risk)
- HTTP server extensions
- API endpoint additions

**Status: AWAITING PERMISSION TO BEGIN IMPLEMENTATION**

---

*This checklist ensures safe, methodical implementation following the Test-Before-Modify protocol while preserving all existing functionality.*
