# BookFairy Master Contract Specification

**Feature Branch**: `003-master-contract`  
**Created**: 2025-09-09  
**Status**: Draft - Canonical Authority  
**Input**: Master Contract enforcement for BookFairy Discord bot

## 0) Core Principles (non-negotiable)

### Single Entry Point
- **DM greeting** ("hi/hey/yo/hello") or **/bookfairy** → same ROOT menu
- **No other slash commands** permitted
- All functionality accessible through unified interface

### Constitutional Requirements
- **5-Item Constitution**: Every list exactly 5 items per page
- **Absolute numbering**: Page 1 shows 1–5, page 2 shows 6–10, etc.
- **Stable selection mapping**: `{userId}:{mode}:{page} → [stableItemIds]`
- **Details-before-Download**: Selections open Book Details; only there is Download
- **English-only** (silent filtering)
- **All in Discord** (no website detours by default)

### Authentication & Privacy
- **Per-user Hardcover auth**: User links token; all HC calls use user token
- **Ephemeral default** (servers); Share to Channel only from Details

### Session Management
- **Describe sessions persist** (TTL 12h); Resume/Discard once on re-entry
- **Wishlist fallback** when MAM can't be sourced

## ROOT Menu

**Triggered by**: DM greeting ("hi/hey/yo/hello") or `/bookfairy`

**Fixed button order**:
1. "By Title" → Title search flow
2. "By Author" → Author search with disambiguation  
3. "By Narrator" → Narrator search flow
4. "Describe" → Fuzzy iterative describe flow
5. "🎭 Genres" → Genre scraper flow

**Always present**:
- **Help** button (contextual to visible buttons)
- **Suggestions** based on user history
- **Resume/Discard** (pre-ROOT if Describe session active)

**More Options** submenu:
- Other Commands → Status, Wishlist, Link Hardcover
- Advanced filters and sorting options

## Data Sources & Auth

### Primary Sources
- **Hardcover GraphQL** + **Typesense** for book metadata
- **Headless genre scraper** (28×6 matrix, cached)
- **Prowlarr/MAM** for availability and download relay

### Privacy Requirements
- User tokens stored securely per-user
- No cross-user data leakage
- Secrets never logged in telemetry

## Global List & Paging Rules

### Pagination Standards
- **5 items per page** (constitutional requirement)
- **Footer format**: "Page X of Y" 
- **Prev/Next rules**: Disabled at boundaries, styled consistently
- **Absolute numbering**: Button labels are actual numbers (1-5, 6-10, 11-15)

### Navigation
- **Home/Help on every screen**
- **"#<n>" jump in DM** for direct item selection
- **Stable item mapping**: Never trust array order for selection

## Flows

### A) By Title
- Text input → search → 5-item results → Details → Download

### B) By Author  
- Text input → disambiguation (if multiple authors) → author profile → books list → Details → Download

### C) By Narrator
- Text input → narrator search → audiobook results → Details → Download

### D) Describe (fuzzy, iterative)
- Text input → fuzzy matching → clarification loop → refined results → Details → Download
- **Session persistence**: 12h TTL, Resume/Discard on re-entry

### E) Genres
- Genre selection → timeframe → scraper→MAM (10 items → two pages) → Details → Download

### F) Book Details
- **Only place Download appears**
- Rich metadata display with cover, description, metadata
- "Share to Channel" option
- Download confirmation with candidate ranking

### G) More Options
- Advanced search filters
- Sorting preferences
- Source selection (LibGen, MAM, etc.)

### H) Other Commands  
- Status checking
- Wishlist management
- Hardcover token linking
- Help system

## Sorting & Filters

### Sort Options
- **Year** (newest first, with tie-breakers)
- **Rating** (highest first, with tie-breakers)  
- **Title** (alphabetical, with tie-breakers)

### Persistence
- **Per user/flow** preference storage
- **Chips persist** until "New Chat" reset

## Download Ranking

### Candidate Pool Selection
- Multiple source aggregation
- Availability verification
- Quality scoring

### Strict Ranking Algorithm
1. **Seeders** (more is better)
2. **Age** (newer preferred)  
3. **Size sanity** (reasonable file sizes)

### Output Format
- **Binary response**: "Found" or "Not found" only
- No technical details exposed to user

## Quality-of-Life Features

### User Convenience
- **Recents/pinned** items for quick access
- **Jump-to-number** (#1, #2, etc.) in DM
- **Availability icon** on results
- **"Why this result?"** explanation on request

### Contextual Help
- **Help on every screen** with relevant guidance
- Context-sensitive button explanations
- Flow-specific assistance

## Errors & Recovery

### User-Friendly Messaging
- **Friendly messages** for all error conditions
- **No stack traces** ever shown to users
- **Secrets never logged** in any telemetry

### Recovery Patterns
- Clear navigation back to working state
- Alternative suggestion when searches fail
- Graceful degradation when services unavailable

## Observability, Rate Limits, Caching

### Telemetry
- **Correlation IDs** for request tracking
- **Redaction** of sensitive data
- Structured logging for debugging

### Rate Limiting
- **Per-user QPS** caps to prevent abuse
- **Global caps** for system protection
- **Graceful throttling** with user feedback

### Caching Strategy
- **Genre scraper cache** (28×6 matrix)
- **Metadata caching** with TTL
- **User preference persistence**

## Interaction Grammar

### Natural Text Processing
- **"hi/title/author/narrator/describe/#n/wishlist/help"**
- **"link hardcover <token>"** for authentication
- **Context-aware parsing** based on current flow

### Command Recognition
- Flexible input processing
- Typo tolerance where reasonable
- Clear disambiguation when ambiguous

## Function Responsibilities

### Core Functions (behavior, inputs, outputs, constraints - no implementation)

**Router**
- Routes all interactions to appropriate handlers
- Maintains session context and state transitions
- Enforces global navigation rules

**RenderRoot** 
- Generates main menu with constitutional button layout
- Handles Resume/Discard for active Describe sessions
- Applies user preferences and suggestions

**HandleGreeting**
- Processes natural language greetings
- Determines appropriate entry point
- Initializes user session context

**LinkHardcover**
- Manages per-user Hardcover token association
- Validates token permissions and access
- Stores tokens securely for user session

**SearchTitle/Author/Narrator**
- Execute search queries with constitutional pagination
- Apply ranking and filtering algorithms
- Return exactly 5 results with absolute numbering

**AuthorDisambiguation**
- Handles multiple author matches
- Presents disambiguation interface
- Routes to selected author profile

**FetchAuthorBooks**
- Retrieves author's complete bibliography
- Applies sorting and filtering preferences
- Maintains constitutional pagination limits

**DescribeFlow**
- Manages iterative fuzzy search sessions
- Implements 12h TTL session persistence
- Handles Resume/Discard workflow

**GenreScraperFlow**
- Executes headless scraping (28×6 matrix)
- Caches results with appropriate TTL
- Routes to MAM integration for 10 items → 2 pages

**BookDetails**
- Renders comprehensive book information
- Provides exclusive Download entry point
- Handles Share to Channel functionality

**DownloadHandler**
- Executes candidate ranking algorithm
- Interfaces with Prowlarr/MAM for relay
- Returns binary Found/Not found response

**Wishlist**
- Manages per-user wishlist persistence
- Handles fallback when MAM unavailable
- Provides wishlist browsing and management

**Status**
- Reports download queue status
- Shows recent activity history
- Provides system health indicators

**Help**
- Contextual assistance based on current screen
- Flow-specific guidance and examples
- Troubleshooting for common issues

**StateManager**
- Maintains stable selection mappings
- Handles session persistence and cleanup
- Enforces constitutional navigation rules

**Telemetry**
- Correlation ID generation and propagation
- Structured logging with redaction
- Rate limiting and abuse prevention

## Acceptance Suite

### Constitutional Compliance
- [ ] Single entry point: Only `/bookfairy` and DM greetings accepted
- [ ] 5-item pagination enforced on all lists
- [ ] Absolute numbering: Page 1 shows 1-5, Page 2 shows 6-10
- [ ] Details-before-Download: No download buttons except in Details view
- [ ] English-only filtering applied silently
- [ ] Ephemeral responses by default

### Navigation & UX
- [ ] Help button present on every screen
- [ ] Home navigation available from all flows
- [ ] Stable item selection mapping independent of array order
- [ ] Resume/Discard appears for active Describe sessions
- [ ] All button layouts match fixed ROOT menu order

### Data & Integration
- [ ] Per-user Hardcover authentication working
- [ ] Prowlarr/MAM relay functioning for downloads
- [ ] Genre scraper cache populated (28×6 matrix)
- [ ] Wishlist fallback when MAM unavailable
- [ ] 12h TTL on Describe sessions

### Quality & Reliability  
- [ ] Friendly error messages, no stack traces
- [ ] Secrets never logged in telemetry
- [ ] Rate limiting enforced per-user and globally
- [ ] Correlation IDs propagated through all flows
- [ ] "#n" jump commands work in DM

### Search & Discovery
- [ ] All search flows return exactly 5 results
- [ ] Ranking algorithm: seeders → age → size sanity
- [ ] Binary download response: Found/Not found only
- [ ] Sorting persists per user/flow until New Chat
- [ ] "Why this result?" explanations available

---

**NOTE**: This specification serves as the canonical authority for BookFairy behavior. All implementation must conform to these requirements without exception. Any conflicts with existing specs should defer to this Master Contract.