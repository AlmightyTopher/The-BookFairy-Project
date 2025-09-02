Book Fairy Bot – Priority-Organized To-Do List

## ✅ COMPLETED FEATURES (85% Core Functionality)

### Foundation & Core Functions ✅
- ✅ Discord app setup: message handling, button interactions, welcome menus  
- ✅ Per-user session system with search persistence and pagination
- ✅ Service health checks with /healthz endpoint and status monitoring
- ✅ Prowlarr search → candidate pool with MyAnonamouse integration
- ✅ qBittorrent → download handling with authentication
- ✅ Readarr → tagging, metadata integration
- ✅ Interactive buttons: numbered downloads, navigation, genre selection
- ✅ Rich pagination with search result display  
- ✅ Download buttons: 1-5 numbered, Next/Previous navigation
- ✅ Session-based result storage and pagination
- ✅ Development environment running (Bot: "The Magical Book Fairy#8678", Metrics: port 9090)
- ✅ Commands documentation created (commands.md with all issued instructions)
- ✅ Commands documentation enhanced (detailed breakdowns of command purposes and workflows)
- ✅ Commands documentation streamlined (focused on human-AI communication only)

## 🎯 PRIORITIZED IMPLEMENTATION ROADMAP

### 🚨 PRIORITY 1: CRITICAL INFRASTRUCTURE (Fix Before Production)

**Reliability Improvements**
- ❌ Auto retry alternates when torrent stalls
- ❌ Audiobookshelf → playbook link integration
- ❌ Download completion notifications (notify original requester when download finishes)
- ✅ Docker containerization for production deployment (Dockerfile, docker-compose, environment configs)
- ✅ Simplify bot output format (show only book title and author, clean presentation) - **Enhanced with format tag removal and series detection**
- ✅ Goodreads integration (clickable link next to title for book details and reviews)
- ✅ More Info button functionality restored and working across all search types (quick actions + regular messages)
- ✅ Enhanced text cleaning and series detection with bold formatting for multi-book collections

### 🎭 PRIORITY 2: USER EXPERIENCE (High Impact)

**User Interface Improvements** - *Focus on functionality and usability*

**Completed:**
- ✅ Phrasebook structure defined
- ✅ Basic polite responses in data/phrasebook.json
- ✅ PG-13 tone guidelines established

**Pending:**
- ❌ Button-only interaction enforcement (redirect users who type instead of clicking)
- ❌ Escalation messaging for persistent typers (3x redirect → admin contact)
- ❌ Clean, functional response formatting
- ❌ Improved user guidance for button interactions

### ⚙️ PRIORITY 3: OPERATIONAL MANAGEMENT (Medium Impact)

**Admin Commands & Monitoring**
- ❌ !fairy help command with personality
- ❌ !fairy cancel <id> job cancellation  
- ❌ !fairy history + re-request buttons
- ❌ Admin commands: restart service, flush jobs, view logs
- ❌ Role controls (moderator bypass)
- ❌ Help button enhancement (maintain current structure, add administrator contact instruction)

**Error Recovery & State Management**
- ❌ Formal state tracking: NEW → INTERPRETING → SEARCHING → READY/FAILED
- ❌ State persistence across bot restarts
- ❌ State-based message formatting
- ❌ Graceful error recovery with personality-based messages
- ❌ Automatic fallback to alternative sources
- ❌ User-friendly error explanations in character

### 🎨 PRIORITY 4: ENHANCED FEATURES (Lower Impact)

**User Experience Enhancements**
- ❌ Wishlist/watchlist functionality
- ❌ Private DM mode configuration
- ❌ Enhanced smart parsing of sloppy input
- ❌ Deep link to Audiobookshelf item

**Testing & Quality Assurance**
- ❌ Personality consistency testing
- ❌ Phrase variant rotation verification
- ❌ PG-13 safety rail validation  
- ❌ Fallback phrase testing when phrasebook fails

**MAM Gateway Implementation** - *Deferred - Replace Prowlarr dependency*
- ❌ Create separate MAM sessions for client vs gateway
- ❌ Build `services/mam-gateway` with Node TypeScript
- ❌ Implement health and search endpoints with rate limiting
- ❌ Add session management with runtime injection
- ❌ Replace Prowlarr calls in Book Fairy integration
- ❌ Remove Prowlarr container and dependencies
- ❌ Add comprehensive testing and operational safeguards

### 🗂️ REFERENCE: IMPLEMENTATION DETAILS

**📖 Expanded Phrasebook (Ready for Implementation)**
```json
{
  "searching": [
    "Well sugar, let me flap my wings and dig through these dusty spellbooks…",
    "Hold on darlin', I'm rustlin' up your book faster than gossip at a church picnic.",
    "Lawd, you sure do keep me busy. Let me sprinkle some fairy dust and see what pops up.",
    "Mercy, child, give me a second while I work my charms."
  ],
  "presenting": [
    "Here's the gem I conjured up, sugar. Don't say I never do nothin' for you.",
    "Bless your heart, I found this one sittin' pretty on the shelf. Maybe it's the one?",
    "Now honey, these are the closest charms I could muster. Pick your poison.",
    "There ya go, darlin'. Magic as promised, choices and all."
  ],
  "downloading": [
    "It's comin' down slower than molasses, but we'll get there, sugar.",
    "Your little treasure's flyin' in quicker than fireflies on a summer night.",
    "Mercy me, this spell's takin' a while to brew. Sit tight, darlin'.",
    "Hush now, it's workin'. You can't rush fairy magic."
  ],
  "ready": [
    "All done, sweetpea! Here's your shiny new read, hot off the fairy press.",
    "Well, look at that. I pulled it off again. Click here before I change my mind.",
    "Finished faster than a preacher at a potluck, sugar. Go enjoy.",
    "There it is, darlin'. Now don't say I never spoil you."
  ],
  "not_found": [
    "Well butter my biscuit, I couldn't find a lick of it. But I did scare up some cousins.",
    "That spell fizzled out, darlin'. Let's try another charm, shall we?",
    "Bless it all, the winds weren't right today. I'll keep my ear to the ground for ya.",
    "Shoot, child, nothin' came up but I can keep watch if you fancy."
  ],
  "cancel": [
    "Fine, fine. I'll stop fussin'. You change your mind more than a cat on a hot tin roof.",
    "Alright sugar, no harm done. Spell undone.",
    "Lawd have mercy, I was halfway through and you pulled the rug out. Typical.",
    "Cancelin' it now, darlin'. You sure are fickle."
  ],
  "error": [
    "Well ain't that a peach — my wings got tangled. I'll try another spell.",
    "Darlin', the magic well ran dry. Might need one of them high-falutin' admins to fix it.",
    "Shoot, that one croaked deader than a June bug in July. Gimme a sec to stir a new brew.",
    "Mercy, sugar, somethin' went sideways. I'll patch it up quick."
  ]
}
```

**🔧 MAM Gateway Detailed Implementation Plan**

#### 1) Plan and Sessions
- ❌ Create two separate MAM sessions in Preferences > Security:
  - One for torrent client (dynamic seedbox)
  - One for new MAM gateway search service
- ❌ Configure VPN/IP considerations:
  - Torrent client session: ASN-locked with dynamic seedbox enabled
  - Gateway session: IP-locked (stable) or ASN-locked (rotating IPs)
- ❌ Add rate-limit awareness to avoid "too many requests"
- ❌ Implement throttle bulk searches

#### 2) Repo Structure, Files, and Config
- ❌ Create `services/mam-gateway` directory with Node TypeScript layout
- ❌ Add project metadata files, scripts, and build outputs to `dist`
- ❌ Create `config/mam.env` with variables:
  - MAM session, base URL, rate limit, concurrency
  - Wedge policy, optional mamapi polling
- ❌ Update `.gitignore` for secrets and build artifacts

#### 3) Compose Wiring
- ❌ Add `mam-gateway` container service to compose stack
- ❌ Optional `mamapi` service for automated session refresh
- ❌ Expose gateway on internal port, map externally for testing

#### 4) Gateway Behavior and Endpoints
- ❌ Implement health endpoint (status, policy, rate settings)
- ❌ Implement stateless search endpoint with parameters:
  - Query text, author, title, category, format, page
  - Min/max size filters
- ❌ Apply query throttling and concurrency limits
- ❌ Handle upstream errors: 429/5xx retry with backoff, 403 session refresh
- ❌ Annotate results with wedge suggestion flags (read-only, no auto-spend)

#### 5) Session Management
- ❌ Lightweight endpoint to inject new mam_id at runtime
- ❌ If mamapi configured: poll periodically to update mam_id in memory
- ❌ Document operational process: session generation, IP vs ASN settings, 403 causes

#### 6) Book Fairy Integration
- ❌ Replace direct Prowlarr calls with gateway calls
- ❌ Add error handling paths:
  - Session invalid → trigger refresh flow
  - Rate limited → queue and retry
  - Indexer unavailable → back off and notify

#### 7) Remove Prowlarr Dependency
- ❌ Disable/remove Prowlarr container from stack
- ❌ Remove code paths calling Prowlarr
- ❌ Keep torrent client sessions separate (no cookie mixing)

#### 8) Testing and Validation
- ❌ Verify gateway health endpoint returns expected config
- ❌ Test targeted searches (audiobook/ebook categories)
- ❌ Confirm results and wedge annotations
- ❌ Simulate forced 403 to test bot refresh flow
- ❌ Simulate bursty searches to confirm throttling
- ❌ Verify torrent client continues working independently

#### 9) Operational Safeguards
- ❌ Add logging: upstream error types, search volumes, backoff events
- ❌ Add metrics counters: searches, errors, retries
- ❌ Document monthly check process: session rotation, ASN vs IP validation

#### 10) Acceptance Criteria
- ❌ Book Fairy searches MAM reliably via gateway (zero Prowlarr dependency)
- ❌ 403 errors automatically surface to refresh flow (not hard failures)
- ❌ Bulk searches don't trigger MAM rate limits under normal usage
- ❌ Separate sessions enforced for client and gateway (no cross-use)

## 🎯 PRIORITY IMPLEMENTATION ORDER

1. **Personality Layer Implementation** - Core character experience (Priority 2 → Priority 1)
2. **Slash Commands** - Modern Discord UX
3. **Reliability Improvements** - Auto retry and Audiobookshelf integration
4. **Admin Commands** - Operational management  
5. **Enhanced Features** - Role controls, wishlist, etc.
6. **MAM Gateway Implementation** - Deferred - Remove Prowlarr dependency

## 📊 IMPLEMENTATION STATUS SUMMARY

**✅ Fully Complete: 85% of core functionality**
- Discord integration with interactive buttons
- Multi-service backend (Prowlarr, qBittorrent, Readarr)
- Session management and pagination
- Health monitoring and metrics
- Search and download pipeline

**🚧 Partially Complete: Personality layer framework**
- Phrasebook structure defined but not implemented
- Basic responses exist but lack character

**❌ High Priority: MAM Gateway Implementation**
- Replace Prowlarr with direct MAM gateway service
- Improved reliability and session management
- Separate torrent client and search sessions
- Rate limiting and error handling

**❌ Not Started: Advanced features and admin tools**
- Admin commands and management
- Slash commands  
- Audiobookshelf integration
- Role-based controls

**Needs added to flow**
- ❌ Refactor repo to smallest readable form without changing behavior, remove dead code and duplication, keep APIs stable, add concise inline comments and docstrings, no obfuscation, all tests must pass.

--