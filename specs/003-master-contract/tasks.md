# Master Contract Implementation Tasks

**Feature**: BookFairy Master Contract Enforcement  
**Status**: Planning Phase  
**Constitutional Authority**: All tasks must comply with Master Contract specifications  

## Task Categories

### 🔴 CRITICAL - Constitutional Violations (Must Fix Immediately)

#### Task MC-001: Single Entry Point Consolidation
**Priority**: P0 - Constitutional Violation  
**Size**: Large (3-4 PRs)  

**Acceptance Criteria**:
- [ ] Remove `/menu` and `/genres` slash command registrations
- [ ] Implement single `/bookfairy` slash command registration
- [ ] Route DM greetings ("hi/hey/yo/hello") to identical interface as `/bookfairy`
- [ ] All existing functionality accessible through unified interface
- [ ] No behavior regression on any working flow

**Test Hooks**:
- Unit: `test_single_entry_point()` verifies only `/bookfairy` registered
- Integration: `test_dm_greeting_equivalence()` verifies DM and slash identical
- Manual: Verify all current user workflows function identically

**Handler Implementation**: `TBD: RouterRoot()`  
**Constitutional Check**: ✅ REQUIRED - Enforces single entry principle

---

#### Task MC-002: Details-Before-Download Enforcement  
**Priority**: P0 - Constitutional Violation  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Remove ALL download buttons from search result pages
- [ ] Ensure selections (1-5 buttons) route to Book Details view only
- [ ] Implement exclusive download button in Book Details view
- [ ] Add confirmation flow for download requests
- [ ] Prowlarr relay integration from Details view only

**Test Hooks**:
- Unit: `test_no_download_outside_details()` scans for download buttons in results
- Integration: `test_selection_routes_to_details()` verifies selection flow
- Constitutional: `test_download_exclusivity()` ensures single download entry

**Handler Implementation**: `TBD: HandleSelection()`, `TBD: BookDetails()`, `TBD: DownloadHandler()`  
**Constitutional Check**: ✅ REQUIRED - Enforces Details-before-Download principle

---

#### Task MC-003: Absolute Numbering Implementation
**Priority**: P0 - Constitutional Violation  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Implement stable ID mapping: `{userId}:{mode}:{page} → [stableItemIds]`
- [ ] Replace all array-index selection with stable ID selection
- [ ] Button labels show absolute numbers: Page 1 = "1,2,3,4,5", Page 2 = "6,7,8,9,10"
- [ ] Selection mapping never relies on array order
- [ ] Direct commands "#1", "#2", etc. work in DM

**Test Hooks**:
- Unit: `test_stable_id_mapping()` verifies selection independence from array order
- Integration: `test_absolute_numbering()` verifies button labels match absolute positions
- Manual: Verify "#3" selects correct item regardless of array shuffle

**Handler Implementation**: `TBD: HandleSelection()`, `TBD: StateManager()`  
**Constitutional Check**: ✅ REQUIRED - Enforces stable selection mapping

---

### 🔴 CRITICAL - 5-Item Constitution Enforcement

#### Task MC-004: Universal 5-Item Pagination
**Priority**: P0 - Constitutional Violation  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] ALL paginated lists show exactly 5 items per page
- [ ] Search results, genre results, status, wishlist ALL enforce 5-item limit
- [ ] Footer format: "Page X of Y" on all paginated views
- [ ] Next/Prev buttons disabled at boundaries, consistent styling
- [ ] Home and Help buttons present on ALL paginated screens

**Test Hooks**:
- Unit: `test_five_item_pagination()` verifies all paginated handlers return max 5
- Integration: `test_pagination_consistency()` verifies UI elements across all flows
- Constitutional: `test_no_pagination_violations()` scans for non-5-item lists

**Handler Implementation**: All result handlers - `SearchTitle()`, `SearchAuthor()`, etc.  
**Constitutional Check**: ✅ REQUIRED - Enforces 5-item constitution

---

### 🟡 HIGH - Core Functionality Implementation

#### Task MC-005: ROOT Menu Implementation
**Priority**: P1 - Core Flow  
**Size**: Large (3 PRs)

**Acceptance Criteria**:
- [ ] Fixed button order: "1️⃣ By Title", "2️⃣ By Author", "3️⃣ By Narrator", "4️⃣ Describe", "5️⃣ 🎭 Genres"
- [ ] "More Options ⚙️", "Help 🆘" always present
- [ ] "Resume/Discard 🔄" appears when Describe session active (12h TTL)
- [ ] Identical rendering for `/bookfairy` and DM greetings
- [ ] Ephemeral responses by default (server contexts)

**Test Hooks**:
- Unit: `test_root_menu_structure()` verifies button order and labels
- Integration: `test_describe_session_resume()` verifies session persistence
- Manual: Verify menu consistency across entry methods

**Handler Implementation**: `TBD: RouterRoot()`, `TBD: HandleDescribeResume()`  
**Constitutional Check**: ✅ COMPLIANT - Implements canonical ROOT structure

---

#### Task MC-006: Search Flow Implementation  
**Priority**: P1 - Core Flow  
**Size**: Large (4 PRs, one per search type)

**Acceptance Criteria**:
- [ ] By Title: Text input → 5-item results → Details selection → Download
- [ ] By Author: Text input → disambiguation (if needed) → author books → Details → Download  
- [ ] By Narrator: Text input → audiobook results → Details → Download
- [ ] Describe: Text input → fuzzy matching → clarification loop → results → Details → Download
- [ ] All flows return exactly 5 results with absolute numbering
- [ ] Help and Home buttons on every screen

**Test Hooks**:
- Unit: `test_search_flow_consistency()` verifies all search types follow pattern
- Integration: `test_search_to_download_flow()` verifies end-to-end flow
- Manual: Test each search type with sample queries

**Handler Implementation**: `TBD: SearchTitle()`, `TBD: SearchAuthor()`, `TBD: SearchNarrator()`, `TBD: DescribeFlow()`  
**Constitutional Check**: ✅ COMPLIANT - Implements canonical search patterns

---

#### Task MC-007: Book Details Implementation
**Priority**: P1 - Core Flow  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Rich metadata display with cover, description, author, rating, availability
- [ ] "Download 📥" button (exclusive download entry point)  
- [ ] "Share to Channel 📢" (only non-ephemeral action)
- [ ] "Add to Wishlist ⭐" (fallback when MAM unavailable)
- [ ] "Why this result? 🤔" ranking explanation
- [ ] "More by Author 👤" navigation to author results
- [ ] Navigation: Home, Help, Back to results

**Test Hooks**:
- Unit: `test_book_details_structure()` verifies all required elements present
- Integration: `test_download_exclusivity()` verifies download only available here
- Manual: Verify rich metadata display and all button functions

**Handler Implementation**: `TBD: BookDetails()`, `TBD: ShareToChannel()`, `TBD: Wishlist()`  
**Constitutional Check**: ✅ COMPLIANT - Implements exclusive download entry

---

### 🟡 HIGH - Session & State Management

#### Task MC-008: Describe Session Persistence
**Priority**: P1 - Advanced Feature  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] 12-hour TTL for Describe sessions
- [ ] Resume/Discard appears on ROOT menu when session active
- [ ] Iterative clarification loop with refinement options
- [ ] Session state includes original query, clarifications, current results
- [ ] Automatic cleanup of expired sessions

**Test Hooks**:
- Unit: `test_describe_session_ttl()` verifies 12h expiration  
- Integration: `test_describe_resume_discard()` verifies session management
- Manual: Start describe session, restart bot, verify resume option

**Handler Implementation**: `TBD: DescribeFlow()`, `TBD: StateManager()`  
**Constitutional Check**: ✅ COMPLIANT - Implements session persistence requirements

---

#### Task MC-009: Stable State Management
**Priority**: P1 - Core Infrastructure  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Implement `{userId}:{mode}:{page} → [stableItemIds]` mapping
- [ ] Per-user preference persistence (sort options, filters)  
- [ ] Rate limiting per-user and globally
- [ ] Session cleanup and garbage collection
- [ ] State isolation between users

**Test Hooks**:
- Unit: `test_stable_state_mapping()` verifies state persistence
- Integration: `test_user_isolation()` verifies no cross-user data leakage
- Load: `test_rate_limiting()` verifies QPS enforcement

**Handler Implementation**: `TBD: StateManager()`, `TBD: Telemetry()`  
**Constitutional Check**: ✅ COMPLIANT - Implements stable state requirements

---

### 🟢 MEDIUM - Quality of Life Features

#### Task MC-010: Genre Scraper Integration  
**Priority**: P2 - Discovery Feature  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] 28×6 genre/timeframe matrix scraping with caching
- [ ] Genre selection dropdown with 28 options
- [ ] Timeframe selection: 1w, 1m, 3m, 6m, 1y, all
- [ ] Results: 10 items across 2 pages (5+5) with absolute numbering
- [ ] MAM integration for availability checking

**Test Hooks**:
- Unit: `test_genre_scraper_cache()` verifies caching behavior
- Integration: `test_genre_to_download_flow()` verifies end-to-end
- Manual: Test each genre/timeframe combination

**Handler Implementation**: `TBD: GenreScraperFlow()`  
**Constitutional Check**: ✅ COMPLIANT - Maintains 5-item pagination

---

#### Task MC-011: Download Ranking Implementation
**Priority**: P2 - Core Algorithm  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Ranking algorithm: seeders ↓ → age ↑ → size sanity
- [ ] Binary response: "Found" or "Not found" only
- [ ] Prowlarr/MAM relay integration
- [ ] "Why this result?" explanation shows ranking factors
- [ ] No technical details exposed to users

**Test Hooks**:
- Unit: `test_download_ranking_algorithm()` verifies sorting logic
- Integration: `test_prowlarr_relay()` verifies external service integration  
- Manual: Verify ranking explanations are user-friendly

**Handler Implementation**: `TBD: DownloadHandler()`  
**Constitutional Check**: ✅ COMPLIANT - Implements ranking requirements

---

#### Task MC-012: Help System Implementation
**Priority**: P2 - User Experience  
**Size**: Small (1 PR)

**Acceptance Criteria**:
- [ ] Help button present on every screen (constitutional requirement)
- [ ] Contextual help based on current flow state
- [ ] Flow-specific guidance and examples
- [ ] Troubleshooting for common error conditions
- [ ] No technical jargon or implementation details

**Test Hooks**:
- Unit: `test_help_on_every_screen()` verifies help button presence
- Integration: `test_contextual_help()` verifies context-appropriate content
- Manual: Navigate through all flows, verify help relevance

**Handler Implementation**: `TBD: Help()`  
**Constitutional Check**: ✅ REQUIRED - Help must be universally available

---

### 🟢 MEDIUM - Integration & Infrastructure

#### Task MC-013: Hardcover Authentication
**Priority**: P2 - User Feature  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Per-user Hardcover token linking via "link hardcover <token>"
- [ ] Secure token storage per user (no cross-user access)
- [ ] All Hardcover API calls use user's linked token
- [ ] Token validation and error handling
- [ ] Privacy compliance (tokens never logged)

**Test Hooks**:
- Unit: `test_token_storage_isolation()` verifies per-user storage
- Integration: `test_hardcover_api_with_user_token()` verifies API integration
- Security: `test_token_redaction()` verifies no token logging

**Handler Implementation**: `TBD: LinkHardcover()`  
**Constitutional Check**: ✅ COMPLIANT - Implements per-user auth

---

#### Task MC-014: Telemetry & Observability  
**Priority**: P2 - Operations  
**Size**: Medium (2 PRs)

**Acceptance Criteria**:
- [ ] Correlation IDs: `MC-${timestamp}-${randomId}` format
- [ ] Structured logging with automatic PII redaction
- [ ] Rate limit monitoring and alerting
- [ ] Performance metrics collection (response times, error rates)
- [ ] No secrets or user tokens ever logged

**Test Hooks**:
- Unit: `test_correlation_id_propagation()` verifies ID flow through system
- Integration: `test_pii_redaction()` verifies sensitive data handling
- Operations: `test_metrics_collection()` verifies monitoring data

**Handler Implementation**: `TBD: Telemetry()`  
**Constitutional Check**: ✅ COMPLIANT - Implements observability requirements

---

### 🔵 LOW - Polish & Enhancement

#### Task MC-015: Error Handling & Recovery
**Priority**: P3 - User Experience  
**Size**: Small (1 PR)

**Acceptance Criteria**:
- [ ] Friendly error messages for all failure modes
- [ ] No stack traces or technical details shown to users
- [ ] Clear recovery guidance for error conditions  
- [ ] Graceful degradation when services unavailable
- [ ] Automatic retry mechanisms where appropriate

**Test Hooks**:
- Unit: `test_error_message_friendly()` verifies user-friendly messages
- Integration: `test_service_failure_handling()` verifies graceful degradation
- Manual: Test error conditions, verify recovery paths

**Handler Implementation**: All handlers with error handling  
**Constitutional Check**: ✅ COMPLIANT - User-friendly error requirements

---

#### Task MC-016: Advanced Features
**Priority**: P3 - Power User  
**Size**: Large (3 PRs)

**Acceptance Criteria**:
- [ ] Wishlist management with fallback when MAM unavailable
- [ ] Status checking for recent downloads (5 most recent)
- [ ] Advanced filters and sorting options with persistence
- [ ] Source selection (LibGen, MAM, etc.) with user preferences
- [ ] "Surprise Me" functionality with user preference learning

**Test Hooks**:
- Unit: `test_wishlist_fallback()` verifies MAM unavailable handling
- Integration: `test_advanced_filter_persistence()` verifies user preferences
- Manual: Test all advanced features for usability

**Handler Implementation**: `TBD: Wishlist()`, `TBD: Status()`, various filter handlers  
**Constitutional Check**: ✅ COMPLIANT - All maintain 5-item pagination

---

## Implementation Sequence

### Phase 1: Constitutional Compliance (P0 Tasks)
**Duration**: 2-3 weeks  
**Tasks**: MC-001, MC-002, MC-003, MC-004  
**Goal**: Eliminate all constitutional violations

### Phase 2: Core Functionality (P1 Tasks)  
**Duration**: 3-4 weeks  
**Tasks**: MC-005, MC-006, MC-007, MC-008, MC-009  
**Goal**: Implement complete user workflows

### Phase 3: Quality & Integration (P2 Tasks)
**Duration**: 2-3 weeks  
**Tasks**: MC-010, MC-011, MC-012, MC-013, MC-014  
**Goal**: Production-ready features and monitoring

### Phase 4: Polish & Enhancement (P3 Tasks)
**Duration**: 1-2 weeks  
**Tasks**: MC-015, MC-016  
**Goal**: User experience optimization

## Risk Mitigation

### **High Risk Tasks**
- **MC-001 (Single Entry)**: Risk of breaking existing user workflows
  - **Mitigation**: Feature flags, gradual rollout, comprehensive testing
  
- **MC-002 (Details-Before-Download)**: Risk of confusing existing users
  - **Mitigation**: Clear UI transitions, help text, user education

- **MC-003 (Absolute Numbering)**: Risk of selection mapping bugs
  - **Mitigation**: Extensive unit testing, stable ID validation

### **Rollback Strategy**
- Each constitutional task includes rollback plan
- Feature flags allow quick disable of problematic changes
- Legacy handlers preserved until new implementation proven stable

### **Testing Strategy**
- **Constitutional Compliance Tests**: Automated verification of all Master Contract rules
- **Behavior Preservation Tests**: Ensure no regression in existing functionality
- **User Acceptance Tests**: Manual verification of all user workflows

---

## Acceptance Gates

### **Phase 1 Gate (Constitutional)**
- [ ] No constitutional violations detected by automated scan
- [ ] All existing user workflows function identically
- [ ] 5-item pagination enforced universally
- [ ] Single entry point verified (only `/bookfairy` registered)
- [ ] Details-before-Download enforced (no downloads outside Details)

### **Phase 2 Gate (Functionality)**  
- [ ] All search flows implemented with 5-item results
- [ ] Book Details view exclusive download entry
- [ ] Describe session persistence working (12h TTL)
- [ ] Help button present on every screen
- [ ] Stable ID selection mapping functional

### **Phase 3 Gate (Production)**
- [ ] Telemetry and observability operational
- [ ] Per-user Hardcover authentication working
- [ ] Rate limiting and abuse prevention active
- [ ] Download ranking algorithm functional
- [ ] Genre scraper integration complete

### **Phase 4 Gate (Polish)**
- [ ] Error handling user-friendly across all flows
- [ ] Advanced features stable and tested
- [ ] Performance meets targets (< 2s response time)
- [ ] User experience smooth and intuitive

---

**All tasks must maintain "No behavior regression" for existing green paths while enforcing Master Contract compliance.**