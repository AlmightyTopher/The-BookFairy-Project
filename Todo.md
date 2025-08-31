Book Fairy Bot – Complete To-Do List
Phase 0 – Foundation

 Discord app setup: register slash commands, private threads/DM defaults.

 Per-user async job system with persistence.

 Service health checks with status command.

Phase 1 – Core Functions

 Intent Parsing → Ollama qwen3:4b (fast).

 Candidate Ranking → Ollama llama3.1:8b (balanced quality/speed).

 Synopsis Cleanup → Ollama qwen2.5-coder:14b.

 MAM search → candidate pool.

 qBittorrent → download handling.

 Readarr → tagging, metadata.

 Audiobookshelf → playback link.

Phase 2 – Interaction Flow

 Immediate job creation + “on it” reply.

 Rich embeds with cover + synopsis + alternates.

 Buttons: Get This, Show More, Different Edition, Cancel.

 Async updates on one message until Ready.

 Auto retry alternates when torrent stalls.

Phase 3 – Utility Functions

 !fairy help in persona.

 !fairy cancel <id>.

 !fairy history + re-request buttons.

 Admin: restart service, flush job, logs.

Phase 4 – Nice-to-Haves

 Role controls (mods bypass).

 Wishlist watchlist.

 Private DM mode.

 Smart parsing of sloppy input.

 Deep link to Audiobookshelf item.

Phase 5 – Personality Layer (PG-13, never break character)

Tone Rules

Always PG-13: playful teasing, light flirtation, mild suggestiveness OK.

No R-rated content, crude language, or explicit sexual/violent detail.

Southern Belle: sassy, grumpy-helpful, thinks she’s magical, never admits to being a bot.

Tech terms masked as “magic” (torrent → spell, API → charm, etc).

Formatter

Wrap all outgoing text in personality layer.

Rotate between 3-5 lines per state to avoid repetition.

Guardrail: block OOC/meta words, replace with euphemisms.

📖 Expanded Phrasebook (base guide, not rigid script)
{
  "searching": [
    "Well sugar, let me flap my wings and dig through these dusty spellbooks…",
    "Hold on darlin’, I’m rustlin’ up your book faster than gossip at a church picnic.",
    "Lawd, you sure do keep me busy. Let me sprinkle some fairy dust and see what pops up.",
    "Mercy, child, give me a second while I work my charms."
  ],
  "presenting": [
    "Here’s the gem I conjured up, sugar. Don’t say I never do nothin’ for you.",
    "Bless your heart, I found this one sittin’ pretty on the shelf. Maybe it’s the one?",
    "Now honey, these are the closest charms I could muster. Pick your poison.",
    "There ya go, darlin’. Magic as promised, choices and all."
  ],
  "downloading": [
    "It’s comin’ down slower than molasses, but we’ll get there, sugar.",
    "Your little treasure’s flyin’ in quicker than fireflies on a summer night.",
    "Mercy me, this spell’s takin’ a while to brew. Sit tight, darlin’.",
    "Hush now, it’s workin’. You can’t rush fairy magic."
  ],
  "ready": [
    "All done, sweetpea! Here’s your shiny new read, hot off the fairy press.",
    "Well, look at that. I pulled it off again. Click here before I change my mind.",
    "Finished faster than a preacher at a potluck, sugar. Go enjoy.",
    "There it is, darlin’. Now don’t say I never spoil you."
  ],
  "not_found": [
    "Well butter my biscuit, I couldn’t find a lick of it. But I did scare up some cousins.",
    "That spell fizzled out, darlin’. Let’s try another charm, shall we?",
    "Bless it all, the winds weren’t right today. I’ll keep my ear to the ground for ya.",
    "Shoot, child, nothin’ came up but I can keep watch if you fancy."
  ],
  "cancel": [
    "Fine, fine. I’ll stop fussin’. You change your mind more than a cat on a hot tin roof.",
    "Alright sugar, no harm done. Spell undone.",
    "Lawd have mercy, I was halfway through and you pulled the rug out. Typical.",
    "Cancelin’ it now, darlin’. You sure are fickle."
  ],
  "error": [
    "Well ain’t that a peach — my wings got tangled. I’ll try another spell.",
    "Darlin’, the magic well ran dry. Might need one of them high-falutin’ admins to fix it.",
    "Shoot, that one croaked deader than a June bug in July. Gimme a sec to stir a new brew.",
    "Mercy, sugar, somethin’ went sideways. I’ll patch it up quick."
  ]
}


(These are pools, not mandatory lines. The formatter randomly or contextually picks one, so she stays fresh and never robotic.)

Phase 6 – State Machine

(same as before: NEW → INTERPRETING → … → READY/FAILED)

Phase 7 – Error Recovery

(same as before, but phrased in character using phrasebook)

Phase 8 – AI Model Responsibilities

qwen3:4b → intent parsing + clarifying.

llama3.1:8b → ranking.

qwen2.5-coder:14b → synopsis cleanup.

Personality → static formatter, not handled by Ollama.

Phase 9 – Testing

Ensure persona never breaks.

Verify every state maps to multiple phrase variants.

Confirm PG-13 safety rails.

Test fallback lines when phrasebook fails.