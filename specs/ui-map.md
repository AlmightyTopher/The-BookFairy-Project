# BookFairy Discord UI Map & Interaction Tree - Master Contract Authority

## Overview

The BookFairy Discord bot provides audiobook and ebook discovery through a **constitutional single-entry architecture** as mandated by the Master Contract. Users access all functionality through DM greetings ("hi/hey/yo/hello") or the single `/bookfairy` slash command. The interface enforces strict 5-item pagination with absolute numbering across all flows, where selections always route through Book Details before any download action.

The system maintains per-user state with stable item mapping, session persistence for Describe flows (12h TTL), and ephemeral responses by default. All downloads are handled exclusively via relay to Prowlarr/MAM infrastructure with binary Found/Not found responses. **Master Contract Authority**: This specification supersedes all previous UI documentation and serves as the canonical interaction model.

## ASCII Interaction Tree

```
MASTER CONTRACT CANONICAL FLOW:

Entry Points (CONSTITUTIONAL):
├── DM: "hi/hey/yo/hello" ──┐
└── /bookfairy (slash) ─────┴─→ ROOT Menu [MC-ROOT]

ROOT Menu [MC-ROOT] - FIXED ORDER:
├── "1️⃣ By Title" [MC-TITLE] ──→ Text Input ──→ Results [MC-TITLE-RESULTS]
├── "2️⃣ By Author" [MC-AUTHOR] ──→ Text Input ──→ Disambiguation [MC-AUTHOR-DISAMBIG] ──→ Books [MC-AUTHOR-RESULTS]  
├── "3️⃣ By Narrator" [MC-NARRATOR] ──→ Text Input ──→ Results [MC-NARRATOR-RESULTS]
├── "4️⃣ Describe" [MC-DESCRIBE] ──→ Text Input ──→ Iterative Loop [MC-DESCRIBE-LOOP] ──→ Results [MC-DESCRIBE-RESULTS]
├── "5️⃣ 🎭 Genres" [MC-GENRES] ──→ Selection [MC-GENRE-SELECT] ──→ Timeframe [MC-TIMEFRAME] ──→ Results [MC-GENRE-RESULTS]
├── "More Options ⚙️" [MC-MORE] ──→ Advanced Menu [MC-MORE-MENU]
├── "Help 🆘" [MC-HELP] (always present)
└── "Resume/Discard 🔄" [MC-RESUME-DESCRIBE] (if Describe session active)

Search Results Pattern (ALL FLOWS):
[MC-*-RESULTS] ──→ 5-Item List (Absolute Numbers 1-5, 6-10, 11-15...)
    ├── "1" [MC-SELECT-1] ──→ Book Details [MC-BOOK-DETAILS]
    ├── "2" [MC-SELECT-2] ──→ Book Details [MC-BOOK-DETAILS] 
    ├── "3" [MC-SELECT-3] ──→ Book Details [MC-BOOK-DETAILS]
    ├── "4" [MC-SELECT-4] ──→ Book Details [MC-BOOK-DETAILS]
    ├── "5" [MC-SELECT-5] ──→ Book Details [MC-BOOK-DETAILS]
    ├── "Next ▶️" [MC-NEXT] (if more pages)
    ├── "Prev ◀️" [MC-PREV] (if not page 1)
    ├── "Home 🏠" [MC-HOME] ──→ ROOT Menu [MC-ROOT]
    └── "Help 🆘" [MC-HELP-CONTEXTUAL]

Book Details Flow (CONSTITUTIONAL - ONLY DOWNLOAD ENTRY POINT):
[MC-BOOK-DETAILS] ──→ Rich Metadata Display
    ├── "Download 📥" [MC-DOWNLOAD] ──→ Prowlarr Relay ──→ Found/Not Found Response
    ├── "Share to Channel 📢" [MC-SHARE] ──→ Public embed post
    ├── "Add to Wishlist ⭐" [MC-WISHLIST-ADD] ──→ Wishlist storage
    ├── "Why this result? 🤔" [MC-EXPLAIN] ──→ Ranking explanation
    ├── "More by Author 👤" [MC-MORE-BY-AUTHOR] ──→ Author Results [MC-AUTHOR-RESULTS]
    ├── "Home 🏠" [MC-HOME] ──→ ROOT Menu [MC-ROOT]
    └── "Help 🆘" [MC-HELP-CONTEXTUAL]

More Options Menu [MC-MORE-MENU]:
├── "Other Commands 📋" [MC-OTHER] ──→ Status/Wishlist/Settings [MC-OTHER-MENU]
├── "Advanced Filters 🔍" [MC-FILTERS] ──→ Filter Options [MC-FILTER-MENU]
├── "Sort Options 📊" [MC-SORT] ──→ Sorting Preferences [MC-SORT-MENU] 
├── "Source Selection 🌐" [MC-SOURCES] ──→ LibGen/MAM/etc [MC-SOURCE-MENU]
└── "Back ◀️" [MC-BACK-ROOT] ──→ ROOT Menu [MC-ROOT]

Other Commands [MC-OTHER-MENU]:
├── "Check Status 📊" [MC-STATUS] ──→ Download Status [MC-STATUS-VIEW]
├── "My Wishlist ⭐" [MC-WISHLIST] ──→ Wishlist View [MC-WISHLIST-VIEW]
├── "Link Hardcover 🔗" [MC-LINK-HC] ──→ Token Input [MC-HC-LINK]
└── "Back ◀️" [MC-BACK-MORE] ──→ More Options [MC-MORE-MENU]

Special Flows:

Describe Session Management:
[MC-DESCRIBE-LOOP] ──→ Fuzzy Matching ──→ Clarification
    ├── "Refine Search 🎯" [MC-DESCRIBE-REFINE] ──→ Additional Input ──→ Loop
    ├── "These Look Good ✅" [MC-DESCRIBE-ACCEPT] ──→ Results [MC-DESCRIBE-RESULTS]
    └── "Start Over 🔄" [MC-DESCRIBE-RESTART] ──→ Describe Input [MC-DESCRIBE]

Pagination with Absolute Numbering:
Page 1: Buttons "1", "2", "3", "4", "5" (items 1-5)
Page 2: Buttons "6", "7", "8", "9", "10" (items 6-10) 
Page 3: Buttons "11", "12", "13", "14", "15" (items 11-15)
Footer: "Page X of Y" | Next/Prev disabled at boundaries

Direct Commands (DM only):
"#1", "#2", "#3", "#4", "#5" → Direct item selection from current results
"wishlist" → [MC-WISHLIST-VIEW]
"status" → [MC-STATUS-VIEW]
"help" → [MC-HELP-CONTEXTUAL]
"home" → [MC-ROOT]
```

## Node Table - Master Contract Authority

| ID | User Label | Component | Paginated? | Next States | Back/Cancel | Constitutional Handler | Notes |
|----|------------|-----------|------------|-------------|-------------|----------------------|-------|
| `MC-ROOT` | "Quick Actions Menu" | embed | No | MC-TITLE, MC-AUTHOR, MC-NARRATOR, MC-DESCRIBE, MC-GENRES, MC-MORE, MC-HELP | N/A (root) | `TBD: RouterRoot()` | **FIXED ORDER** - Constitutional |
| `MC-TITLE` | "1️⃣ By Title" | button | No | MC-TITLE-RESULTS | MC-ROOT | `TBD: SearchTitle()` | Absolute position 1 |
| `MC-AUTHOR` | "2️⃣ By Author" | button | No | MC-AUTHOR-DISAMBIG | MC-ROOT | `TBD: SearchAuthor()` | Absolute position 2 |
| `MC-NARRATOR` | "3️⃣ By Narrator" | button | No | MC-NARRATOR-RESULTS | MC-ROOT | `TBD: SearchNarrator()` | Absolute position 3 |
| `MC-DESCRIBE` | "4️⃣ Describe" | button | No | MC-DESCRIBE-LOOP | MC-ROOT | `TBD: DescribeFlow()` | Absolute position 4, 12h TTL |
| `MC-GENRES` | "5️⃣ 🎭 Genres" | button | No | MC-GENRE-SELECT | MC-ROOT | `TBD: GenreScraperFlow()` | Absolute position 5 |
| `MC-MORE` | "More Options ⚙️" | button | No | MC-MORE-MENU | MC-ROOT | `TBD: RenderMoreOptions()` | Always position 6 |
| `MC-HELP` | "Help 🆘" | button | No | Context Help | Current screen | `TBD: Help()` | **ALWAYS PRESENT** |
| `MC-RESUME-DESCRIBE` | "Resume/Discard 🔄" | button | No | MC-DESCRIBE-LOOP, MC-ROOT | MC-ROOT | `TBD: HandleDescribeResume()` | Only if session active |
| `MC-TITLE-RESULTS` | "Search Results" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-ROOT | `TBD: SearchTitle()` | Absolute numbering 1-5, 6-10, etc. |
| `MC-AUTHOR-RESULTS` | "Author's Books" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-AUTHOR-DISAMBIG | `TBD: FetchAuthorBooks()` | After disambiguation |
| `MC-NARRATOR-RESULTS` | "Narrator Results" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-ROOT | `TBD: SearchNarrator()` | Audiobook focus |
| `MC-DESCRIBE-RESULTS` | "Describe Results" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-DESCRIBE-LOOP | `TBD: DescribeFlow()` | After clarification |
| `MC-GENRE-RESULTS` | "Genre Results" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-TIMEFRAME | `TBD: GenreScraperFlow()` | 28×6 scraper → MAM |
| `MC-SELECT-1` | "1" | button | No | MC-BOOK-DETAILS | Results page | `TBD: HandleSelection()` | **ABSOLUTE NUMBERING** |
| `MC-SELECT-2` | "2" | button | No | MC-BOOK-DETAILS | Results page | `TBD: HandleSelection()` | **ABSOLUTE NUMBERING** |
| `MC-SELECT-3` | "3" | button | No | MC-BOOK-DETAILS | Results page | `TBD: HandleSelection()` | **ABSOLUTE NUMBERING** |
| `MC-SELECT-4` | "4" | button | No | MC-BOOK-DETAILS | Results page | `TBD: HandleSelection()` | **ABSOLUTE NUMBERING** |
| `MC-SELECT-5` | "5" | button | No | MC-BOOK-DETAILS | Results page | `TBD: HandleSelection()` | **ABSOLUTE NUMBERING** |
| `MC-NEXT` | "Next ▶️" | button | No | Next page | Same page type | `TBD: HandlePagination()` | Disabled on last page |
| `MC-PREV` | "Prev ◀️" | button | No | Prev page | Same page type | `TBD: HandlePagination()` | Disabled on first page |
| `MC-BOOK-DETAILS` | "Book Details" | embed | No | MC-DOWNLOAD, MC-SHARE, MC-WISHLIST-ADD | Previous results | `TBD: BookDetails()` | **ONLY DOWNLOAD ENTRY** |
| `MC-DOWNLOAD` | "Download 📥" | button | No | Prowlarr Relay | MC-BOOK-DETAILS | `TBD: DownloadHandler()` | **CONSTITUTIONAL RESTRICTION** |
| `MC-SHARE` | "Share to Channel 📢" | button | No | Public post | MC-BOOK-DETAILS | `TBD: ShareToChannel()` | Only non-ephemeral action |
| `MC-WISHLIST-ADD` | "Add to Wishlist ⭐" | button | No | Confirmation | MC-BOOK-DETAILS | `TBD: Wishlist()` | Fallback when MAM unavailable |
| `MC-HOME` | "Home 🏠" | button | No | MC-ROOT | N/A | `TBD: RouterRoot()` | **ALWAYS AVAILABLE** |
| `MC-AUTHOR-DISAMBIG` | "Choose Author" | select | No | MC-AUTHOR-RESULTS | MC-ROOT | `TBD: AuthorDisambiguation()` | Multiple author matches |
| `MC-DESCRIBE-LOOP` | "Clarify Search" | text+buttons | No | MC-DESCRIBE-RESULTS, MC-DESCRIBE-REFINE | MC-ROOT | `TBD: DescribeFlow()` | Iterative refinement |
| `MC-GENRE-SELECT` | "Choose Genre" | select | No | MC-TIMEFRAME | MC-ROOT | `TBD: GenreScraperFlow()` | 28 genre options |
| `MC-TIMEFRAME` | "Choose Timeframe" | buttons | No | MC-GENRE-RESULTS | MC-GENRE-SELECT | `TBD: GenreScraperFlow()` | 6 time options |
| `MC-STATUS-VIEW` | "Download Status" | embed | **Yes (5)** | Status details | MC-OTHER-MENU | `TBD: Status()` | Recent 5 downloads |
| `MC-WISHLIST-VIEW` | "My Wishlist" | embed | **Yes (5)** | MC-SELECT-[1-5] | MC-OTHER-MENU | `TBD: Wishlist()` | User's saved items |
| `MC-HC-LINK` | "Link Token" | text input | No | Confirmation | MC-OTHER-MENU | `TBD: LinkHardcover()` | Per-user auth |

## Pagination Rules - Constitutional Authority

### **CONSTITUTIONAL COMPLIANCE - NON-NEGOTIABLE**

- **Fixed Page Size**: Exactly **5 items per page** across ALL paginated flows
- **Absolute Numbering**: 
  - Page 1: Buttons labeled "1", "2", "3", "4", "5" (items 1-5)
  - Page 2: Buttons labeled "6", "7", "8", "9", "10" (items 6-10)  
  - Page 3: Buttons labeled "11", "12", "13", "14", "15" (items 11-15)
- **Footer Format**: "Page X of Y" in embed footer
- **Navigation Controls**:
  - "Next ▶️" disabled on last page, styled `ButtonStyle.Secondary`
  - "Prev ◀️" disabled on first page, styled `ButtonStyle.Secondary`
- **Universal Presence**: "Home 🏠" and "Help 🆘" on every paginated screen
- **Stable Mapping**: Selection maps to `{userId}:{mode}:{page} → [stableItemIds]`

## Validation & Errors - Master Contract

### **Constitutional Violations (Auto-Blocked)**
- **Multiple Entry Points**: Only `/bookfairy` and DM greetings permitted
- **Page Size ≠ 5**: Any pagination showing other than 5 items
- **Download Outside Details**: No download buttons except in Book Details view
- **Missing Help**: Help button must be present on every screen
- **Array-Order Selection**: Selection must use stable ID mapping

### **Error Recovery Patterns**
- **Empty Results**: "No books found. Try different terms or browse genres"
- **Service Unavailable**: "Service temporarily unavailable. Try again in a moment"
- **Authentication Required**: "Link your Hardcover account first: /bookfairy → More Options → Other Commands → Link Hardcover"
- **Rate Limited**: "Please wait a moment before your next search"
- **Session Expired**: "Your session expired. Starting fresh..." → MC-ROOT

### **Never Shown to Users**
- Stack traces or technical error details
- Internal service names or endpoints  
- Database errors or connection failures
- Authentication tokens or API keys

## Telemetry Hooks - Master Contract

### **Correlation ID Standards**
- **Format**: `MC-${timestamp}-${randomId}` (Master Contract prefix)
- **Generation Points**: Search initiation, flow transitions, download requests
- **Propagation**: Through all service calls and error logs
- **Redaction**: User tokens, search terms, personal data

### **Required Logging Points**
- **Flow Entry**: User enters any flow with correlation ID
- **Selection Events**: Item selections with stable IDs (never array positions)
- **Download Requests**: With ranking decision explanation
- **Error Conditions**: With user-friendly message shown
- **Rate Limit Hits**: Per-user and global threshold events
- **Session Management**: Describe session create/resume/discard/expire

### **Telemetry Function**: `TBD: Telemetry()`
- Structured logging with correlation IDs
- Automatic PII redaction
- Rate limit monitoring
- Performance metrics collection

## Legacy/Unlinked Components

### **DEPRECATED - REMOVE IN IMPLEMENTATION**
- **Multiple Slash Commands**: `/menu`, `/genres` (constitutional violation)
- **Direct Download Buttons**: Any download buttons outside Book Details
- **Non-5-Item Pagination**: Any list showing ≠ 5 items
- **Array-Based Selection**: Selection using array indices instead of stable IDs

### **LEGACY HANDLERS - MARK FOR REMOVAL**
- `src/quick-actions/index.ts` (if not constitutional)
- `src/bot/message-handler.ts` (if bypasses Book Details)
- Any handlers allowing downloads outside Details flow
- Multiple entry point registration code

### **UNLINKED FLOWS - WIRE OR REMOVE**
- Flow Engine JSON routes (if not integrated)
- Orphaned button handlers without stable ID mapping
- Non-constitutional pagination implementations
- Direct result selection bypassing Details view

## Change Request Cookbook - Master Contract Authority

### **Template Format**
```
Update Node `<MC-ID>`: change **Label** to '<exact text>', **Position** to N under `<PARENT-MC-ID>`, **Handler** to `<function-name>()`. Constitutional check: [PASS/BLOCKED].
```

### **Constitutional Compliance Examples**

1. **ALLOWED - Label Change**:
   ```
   Update Node `MC-GENRES`: change **Label** to '🎵 Music Books', **Handler** remains `GenreScraperFlow()`. Constitutional check: PASS.
   ```

2. **BLOCKED - Pagination Violation**:
   ```
   Request: "Show 10 items per page instead of 5"
   Response: ❌ BLOCKED BY CONSTITUTION: Page size must remain exactly 5 items (Master Contract Section: Global List & Paging Rules).
   ```

3. **BLOCKED - Download Outside Details**:
   ```
   Request: "Add download buttons to search results"  
   Response: ❌ BLOCKED BY CONSTITUTION: Downloads only permitted in Book Details view (Master Contract Section: Core Principles - Details-before-Download).
   ```

4. **ALLOWED - Add Help Context**:
   ```
   Update Node `MC-HELP`: add **Context** for `MC-DESCRIBE-RESULTS` → "Try different keywords or use 'refine search'". Constitutional check: PASS.
   ```

### **Implementation Change Patterns**

5. **Handler Rewiring**:
   ```
   Update Node `MC-NARRATOR-RESULTS`: change **Handler** to `SearchNarrator()`, ensure **Pagination** = 5 items, **Selection** = stable IDs. Constitutional check: PASS.
   ```

6. **New Flow Addition**:
   ```
   Add Node `MC-ISBN-SEARCH`: **Label** '📖 By ISBN', **Position** 6 under `MC-ROOT`, **Handler** `SearchISBN()`, **Next States** [`MC-ISBN-RESULTS`]. Constitutional check: REQUIRES MC-ROOT expansion approval.
   ```

## Open Questions - Master Contract Implementation

### **Handler Implementation Priorities** (all marked TBD)

1. **RouterRoot()** - Highest Priority
   - Must enforce fixed button order (1-5 constitutional positions)
   - Handle Resume/Discard for active Describe sessions
   - Route DM greetings and /bookfairy identically

2. **DescribeFlow()** - High Priority  
   - Implement 12h TTL session persistence
   - Manage iterative clarification loop
   - Handle Resume/Discard workflow

3. **HandleSelection()** - High Priority
   - Implement stable ID mapping `{userId}:{mode}:{page} → [stableItemIds]`
   - Never rely on array positions for selection
   - Route all selections through Book Details

4. **BookDetails()** - Critical Priority
   - Exclusive download entry point (constitutional requirement)
   - Rich metadata display with Share/Wishlist options
   - "Why this result?" ranking explanations

5. **DownloadHandler()** - Critical Priority
   - Implement ranking: seeders → age → size sanity
   - Binary response: Found/Not found only
   - Prowlarr/MAM relay integration

### **Proposed Implementation Sequence**
1. **Constitutional Framework**: RouterRoot, HandleSelection, stable ID mapping
2. **Core Flows**: Search functions with 5-item pagination  
3. **Details & Download**: BookDetails with exclusive download access
4. **Advanced Features**: DescribeFlow with session persistence
5. **Quality of Life**: Help system, telemetry, error handling

---

## Summary - Master Contract Authority

**Total Nodes**: 32 canonical interaction points (28 implemented + 4 TBD)  
**Paginated Nodes**: 6 (all enforcing constitutional 5-item limit with absolute numbering) ✅  
**Constitutional Compliance**: AUTHORITATIVE - All violations must be corrected ⚖️  
**Legacy/Unlinked Nodes**: 8+ components requiring removal or rewiring ⚠️

**Implementation Priority**: 
1. **CRITICAL**: Single entry point consolidation (`/bookfairy` only)
2. **CRITICAL**: Details-before-Download enforcement (no downloads outside Details)  
3. **CRITICAL**: Absolute numbering with stable ID mapping (1-5, 6-10, 11-15...)
4. **HIGH**: Help button on every screen, 5-item pagination universal
5. **MEDIUM**: Session persistence, telemetry, quality-of-life features

**This UI Map serves as the binding contract for all BookFairy Discord interactions. No deviations from these specifications are permitted without Master Contract amendment.**