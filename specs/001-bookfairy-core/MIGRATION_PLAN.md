# Migration Plan: TDD Implementation → Spec-Kit Build Sheet

## Executive Summary

**Current State**: Solid TDD foundation with 131 passing tests, constitutional compliance ✅  
**Target State**: Comprehensive Spec-Kit build sheet with 9 phases of functionality  
**Strategy**: Hybrid evolution - preserve working foundation, adapt/extend systematically  

---

## 🎯 Migration Strategy

### Phase M1: Foundation Preservation (CRITICAL)
**Goal**: Keep all working components, tests passing  
**Risk**: Low - no breaking changes  

### Phase M2: Contract Adaptation (HIGH PRIORITY)
**Goal**: Adapt existing components to match new spec contracts  
**Risk**: Medium - requires interface changes with test updates  

### Phase M3: Missing Component Addition (MEDIUM PRIORITY)  
**Goal**: Add components that don't exist yet  
**Risk**: Low - additive changes only  

### Phase M4: Enhancement & Polish (LOW PRIORITY)
**Goal**: Add observability, rate limiting, advanced features  
**Risk**: Low - quality of life improvements  

---

## 📊 Component Mapping Matrix

| Spec Requirement | Current Implementation | Status | Migration Action |
|------------------|----------------------|--------|------------------|
| **PHASE 0: PRECONDITIONS** |
| P0.1 Env Check | ❌ None | Missing | 🆕 Add startup validation |
| P0.2 English Policy | ❌ None | Missing | 🆕 Add global filter |
| **PHASE 1: DATA ADAPTERS** |
| A1.1 Hardcover | ✅ `src/integrations/hardcover/client.ts` | Partial | 🔄 Adapt contracts |
| A1.2 Open Library | ❌ None | Missing | 🆕 New adapter |
| A1.3 Prowlarr | ✅ `src/integrations/prowlarr/client.ts` | Basic | 🔄 Enhance contracts |
| A1.4 LibriVox | ❌ None | Missing | 🆕 Optional adapter |
| **PHASE 2: STATE PERSISTENCE** |
| S2.1 Button Mapping | ❌ None | Missing | 🆕 New system |
| S2.2 Session Persist | ❌ None | Missing | 🆕 New system |
| S2.3 Wishlist | ❌ None | Missing | 🆕 New system |
| **PHASE 3: SEARCH FLOWS** |
| F3.1 Title Search | ✅ `src/discord/interactions/title-search.ts` | Working | 🔄 Enhance pagination |
| F3.2 Author Search | ✅ `src/discord/interactions/author-search.ts` | Working | 🔄 Add author→books |
| F3.3 Narrator Search | ❌ None | Missing | 🆕 New flow |
| F3.4 Describe Search | ❌ None | Missing | 🆕 New flow |
| **PHASE 4: DETAILS & DOWNLOAD** |
| D4.1 Details View | ✅ Basic in Hardcover client | Partial | 🔄 Enhance display |
| D4.2 Download Decision | ✅ Basic Prowlarr integration | Partial | 🔄 Add MAM check |
| **PHASE 5: CONTROLS** |
| U5.1 Controls | ✅ Basic button structure | Working | 🔄 Complete coverage |
| U5.2 Numbering | ✅ `src/lib/pagination.ts` | Working | ✅ Already compliant |
| **PHASES 6-9: OBSERVABILITY, VALIDATION, TESTS, DOCS** |
| O6.1-O6.3, V7.1-V7.2, T8.1-T8.2, D9.1 | ❌ Mostly missing | Missing | 🆕 New systems |

---

## 🚀 Detailed Migration Phases

### **Phase M1: Foundation Preservation** ⏱️ 1 day

#### M1.1 Protect Current Assets
```bash
# Ensure all tests still pass
npm test

# Document current API surface
grep -r "export" src/integrations/ > docs/current-api.txt
grep -r "export" src/discord/ >> docs/current-api.txt

# Create backup branch
git checkout -b backup/pre-migration
git push origin backup/pre-migration
```

#### M1.2 Version Current Contracts
```typescript
// src/integrations/hardcover/legacy.ts
export type LegacyBookMeta = { /* current interface */ };
export type LegacyBookDetails = { /* current interface */ };

// Preserve existing functions with "legacy" prefix
export async function legacyGetBookDetails(opts: LegacyBookMeta): Promise<LegacyBookDetails | null>
export async function legacySearchByAuthor(author: string)
export async function legacySearchByTitle(title: string)
```

**Success Criteria**: All 131 tests still pass, no functionality broken

---

### **Phase M2: Contract Adaptation** ⏱️ 3-5 days

#### M2.1 Hardcover Adapter Evolution
**Current**: 
```typescript
searchByTitle(title: string) -> { books }
searchByAuthor(author: string) -> { works }
```

**New Spec Contract**:
```typescript
search_books(query: string, page: number, per_page: number) -> BasicBook[]
search_authors(query: string, page: number, per_page: number) -> {name: string, slug: string}[]
books_by_author_slug(slug: string, page: number, per_page: number) -> BasicBook[]
book_details(book_id: string) -> BookDetails
```

**Migration Steps**:
1. Add new interface alongside existing
2. Update tests to use new interface
3. Update interaction handlers to use new interface
4. Remove legacy interface once tests pass

#### M2.2 Prowlarr Adapter Evolution
**Current**:
```typescript
toSearchOptions(query: string)
relaySearch(opts, ctx)
```

**New Spec Contract**:
```typescript
indexer_search(query: string, limit: number, offset: number, indexerIds?: string[]) -> Result[]
available_on_mam(query: string) -> boolean
pick_best_torrent(results: Result[]) -> Result | null
```

#### M2.3 Updated BasicBook Interface
```typescript
interface BasicBook {
  id: string;
  title: string;
  authors: string[];
  series?: string;
  seriesNumber?: number;
  hasAudiobook?: boolean;
  coverUrl?: string;
  year?: number;
  isbn?: string;
}
```

**Success Criteria**: New contracts work, tests updated and passing

---

### **Phase M3: Missing Component Addition** ⏱️ 5-7 days

#### M3.1 Environment Validation (P0.1)
```typescript
// src/lib/env-validator.ts
export interface EnvRequirements {
  HARDCOVER_API_TOKEN: string;
  PROWLARR_URL: string;
  PROWLARR_API_KEY: string;
  PROWLARR_INDEXER_IDS?: string;
  MAM_INDEXER_ID?: string;
}

export function validateEnvironment(): { valid: boolean; errors: string[] }
export async function testConnections(): Promise<{ [service: string]: boolean }>
```

#### M3.2 Open Library Adapter (A1.2)
```typescript
// src/integrations/openlibrary/client.ts
export async function ol_search_loose(text: string, page: number): Promise<BasicBook[]>
export async function ol_search_fielded(params: {
  title?: string;
  author?: string;
  subject?: string;
  q?: string;
  page?: number;
}): Promise<BasicBook[]>
```

#### M3.3 State Persistence System (S2.1, S2.2, S2.3)
```typescript
// src/lib/state-manager.ts
export class StateManager {
  // Button mapping with TTL
  setPageMap(userId: string, mode: string, page: number, ids: string[]): void
  resolveChoice(userId: string, mode: string, page: number, choice: number): string | null
  
  // Session persistence
  startDescribe(userId: string, query: string): void
  getDescribe(userId: string): DescribeSession | null
  updateDescribe(userId: string, patch: Partial<DescribeSession>): void
  endDescribe(userId: string): void
  
  // Wishlist
  wishlistAdd(userId: string, bookId: string, title: string, authors: string[]): void
  wishlistList(userId: string, limit: number, offset: number): WishlistItem[]
  wishlistClear(userId: string): void
}
```

#### M3.4 Narrator Search Flow (F3.3)
```typescript
// src/discord/interactions/narrator-search.ts
export async function buildNarratorSearch({ narrator }: { narrator: string })
export async function confirmNarratorWork(selection: any, ctx: any)
```

#### M3.5 Describe Search with Clarifier (F3.4)
```typescript
// src/discord/interactions/describe-search.ts
export async function buildDescribeSearch({ query }: { query: string })
export async function handleClarifier(userId: string, clarification: string)
export async function confirmDescribeBook(selection: any, ctx: any)
```

**Success Criteria**: New components working, integrated with existing flows

---

### **Phase M4: Enhancement & Polish** ⏱️ 3-4 days

#### M4.1 Structured Logging (O6.1)
```typescript
// src/lib/structured-logger.ts
export function logUserAction(
  userId: string,
  mode: string,
  query: string,
  took_ms: number,
  result_count: number,
  cache_hit: boolean
): void
```

#### M4.2 Rate Limiting (O6.2, O6.3)
```typescript
// src/lib/rate-limiter.ts
export class RateLimiter {
  checkHostLimit(host: string): boolean
  checkUserLimit(userId: string): boolean
  recordRequest(userId: string, host: string): void
}
```

#### M4.3 Health Endpoint (V7.2)
```typescript
// src/health/checker.ts
export async function checkHealth(): Promise<{
  hardcover: boolean;
  openlibrary: boolean;
  prowlarr: boolean;
  overall: boolean;
}>
```

**Success Criteria**: Full observability, production-ready

---

## 📋 Implementation Roadmap

### Week 1: Foundation & Contracts
- [ ] **Day 1**: Phase M1 - Preserve foundation
- [ ] **Day 2-3**: Phase M2.1 - Hardcover contract adaptation  
- [ ] **Day 4-5**: Phase M2.2 - Prowlarr contract adaptation

### Week 2: Missing Components  
- [ ] **Day 1**: Phase M3.1 - Environment validation
- [ ] **Day 2**: Phase M3.2 - Open Library adapter
- [ ] **Day 3**: Phase M3.3 - State persistence system
- [ ] **Day 4**: Phase M3.4 - Narrator search
- [ ] **Day 5**: Phase M3.5 - Describe search

### Week 3: Polish & Testing
- [ ] **Day 1-2**: Phase M4 - Observability
- [ ] **Day 3**: Manual testing (T8.1)
- [ ] **Day 4**: Automated test coverage (T8.2)
- [ ] **Day 5**: Documentation (D9.1)

---

## 🔬 Testing Strategy

### Preserve Existing Tests
```bash
# All current tests must continue passing
npm test  # Target: 131+ passing tests
```

### Add Spec-Driven Tests
```bash
# Test each new contract
npm test tests/contracts/
npm test tests/integration/
npm test tests/manual/
```

### Manual Validation Checklist (T8.1)
1. Title search "Mistborn" → details → download
2. Author search "Brandon Sanderson" → pick → books → navigate  
3. Narrator search "Scott Brick" → audiobook results
4. Describe "blue desert sand magic thief" → clarifier → updated results
5. Force not found → wishlist → list → clear

---

## 🎯 Success Metrics

### Technical Metrics
- [ ] **All existing tests pass** (131+ tests)
- [ ] **New contract tests pass** (50+ additional tests)
- [ ] **Manual checklist passes** (5/5 scenarios)
- [ ] **Performance targets met** (<2s response time)

### Functional Metrics  
- [ ] **Environment validation** works on startup
- [ ] **All 4 search flows** work end-to-end
- [ ] **State persistence** survives restarts
- [ ] **Rate limiting** prevents abuse
- [ ] **Health checks** show system status

### Constitutional Compliance
- [x] **Single Discord entrypoint** maintained
- [x] **No DM delivery** maintained  
- [x] **5-item pagination** maintained
- [x] **Secrets unchanged** maintained
- [x] **Repository preserved** maintained

---

## 🚨 Risk Mitigation

### High Risk Items
1. **Contract Changes**: Backup interfaces, gradual migration
2. **State System**: Start simple, TTL-based, expand gradually  
3. **Test Coverage**: Update tests incrementally, never break existing

### Rollback Plan
1. **Backup branch**: `backup/pre-migration` always available
2. **Feature flags**: New components behind flags
3. **Legacy interfaces**: Keep working until new proven

---

## 📁 File Structure Evolution

### Current Structure (Preserve)
```
src/
├── discord/interactions/          # ✅ Keep, enhance
├── integrations/hardcover/        # 🔄 Adapt contracts
├── integrations/prowlarr/         # 🔄 Enhance  
├── lib/pagination.ts             # ✅ Keep, works perfectly
└── schemas/                      # ✅ Keep, extend
```

### New Additions
```
src/
├── integrations/openlibrary/     # 🆕 New adapter
├── integrations/librivox/        # 🆕 Optional adapter  
├── lib/state-manager.ts          # 🆕 Persistence
├── lib/env-validator.ts          # 🆕 Startup checks
├── lib/rate-limiter.ts           # 🆕 Rate limiting
├── health/                       # 🆕 Health system
└── discord/interactions/
    ├── narrator-search.ts        # 🆕 New flow
    └── describe-search.ts        # 🆕 New flow
```

---

This migration plan preserves our successful TDD foundation while systematically evolving toward the comprehensive Spec-Kit requirements. The hybrid approach minimizes risk while maximizing the value of our existing work.