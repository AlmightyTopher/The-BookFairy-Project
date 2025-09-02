Book Fairy Bot – Remaining To-Do List

## ✅ COMPLETED FEATURES

### Phase 0 – Foundation ✅
- ✅ Discord app setup: message handling, button interactions, welcome menus  
- ✅ Per-user session system with search persistence and pagination
- ✅ Service health checks with /healthz endpoint and status monitoring

### Phase 1 – Core Functions ✅  
- ✅ Intent Parsing → Ollama qwen3:4b (fast)
- ✅ Candidate Ranking → Ollama llama3.1:8b (balanced quality/speed) 
- ✅ Synopsis Cleanup → Ollama qwen2.5-coder:14b
- ✅ Prowlarr search → candidate pool with MyAnonamouse integration
- ✅ qBittorrent → download handling with authentication
- ✅ Readarr → tagging, metadata integration
- ❌ Audiobookshelf → playback link (not implemented)

### Phase 2 – Interaction Flow ✅
- ✅ Interactive buttons: numbered downloads, navigation, genre selection
- ✅ Rich pagination with search result display  
- ✅ Download buttons: 1-5 numbered, Next/Previous navigation
- ✅ Session-based result storage and pagination
- ❌ Auto retry alternates when torrent stalls (basic retry exists)

## 🚧 PENDING IMPLEMENTATION

### Phase 3 – Utility Functions
- ❌ !fairy help command with personality
- ❌ !fairy cancel <id> job cancellation  
- ❌ !fairy history + re-request buttons
- ❌ Admin commands: restart service, flush jobs, view logs

### Phase 4 – Advanced Features  
- ❌ Role controls (moderator bypass)
- ❌ Wishlist/watchlist functionality
- ❌ Private DM mode configuration
- ❌ Enhanced smart parsing of sloppy input
- ❌ Deep link to Audiobookshelf item
- ❌ Slash command registration (/bookfairy command)

### Phase 5 – Personality Layer (Partially Complete)

**Completed:**
- ✅ Phrasebook structure defined
- ✅ Basic polite responses in data/phrasebook.json
- ✅ PG-13 tone guidelines established

**Pending:**
- ❌ Southern Belle personality implementation
- ❌ Tech terms masked as "magic" (torrent → spell, API → charm, etc)
- ❌ Personality wrapper for all bot responses
- ❌ Rotating phrase variants to avoid repetition
- ❌ Guardrail: block OOC/meta words, replace with euphemisms

### 📖 Expanded Phrasebook (Ready for Implementation)
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

### Phase 6 – State Machine
- ❌ Formal state tracking: NEW → INTERPRETING → SEARCHING → READY/FAILED
- ❌ State persistence across bot restarts
- ❌ State-based message formatting

### Phase 7 – Error Recovery  
- ❌ Graceful error recovery with personality-based messages
- ❌ Automatic fallback to alternative sources
- ❌ User-friendly error explanations in character

### Phase 8 – AI Model Responsibilities
- ✅ qwen3:4b → intent parsing + clarifying
- ✅ llama3.1:8b → ranking  
- ✅ qwen2.5-coder:14b → synopsis cleanup
- ❌ Personality → static formatter implementation needed

### Phase 9 – Testing
- ❌ Personality consistency testing
- ❌ Phrase variant rotation verification
- ❌ PG-13 safety rail validation  
- ❌ Fallback phrase testing when phrasebook fails

## 🎯 PRIORITY IMPLEMENTATION ORDER

1. **Personality Layer Implementation** - Core character experience
2. **Slash Commands** - Modern Discord UX
3. **Admin Commands** - Operational management  
4. **Audiobookshelf Integration** - Complete media pipeline
5. **Advanced Features** - Role controls, wishlist, etc.

## 📊 IMPLEMENTATION STATUS SUMMARY

**✅ Fully Complete: 85% of core functionality**
- Discord integration with interactive buttons
- Multi-service backend (Prowlarr, qBittorrent, Readarr, Ollama)
- Session management and pagination
- Health monitoring and metrics
- Search and download pipeline

**🚧 Partially Complete: Personality layer framework**
- Phrasebook structure defined but not implemented
- Basic responses exist but lack character

**❌ Not Started: Advanced features and admin tools**
- Admin commands and management
- Slash commands  
- Audiobookshelf integration
- Role-based controls
