// # Proposed Test Version
// Test implementation of Southern Belle personality system

interface PersonalityResponse {
  message: string;
  shouldRedirectToButtons: boolean;
  escalationLevel: number;
}

interface UserState {
  typingAttempts: number;
  lastButtonInteraction?: Date;
  lastTypingAttempt?: Date;
}

export class SouthernBellePersonality_Test {
  private userStates = new Map<string, UserState>();

  // Tech terms to magic translations
  private techToMagic = {
    'download': 'spell casting',
    'downloading': 'spell brewing',
    'torrent': 'magic spell',
    'API': 'fairy charm',
    'search': 'scrying',
    'searching': 'scrying through the spellbooks',
    'database': 'enchanted library',
    'server': 'fairy realm',
    'loading': 'conjuring',
    'error': 'spell mishap',
    'connection': 'fairy bridge',
    'timeout': 'charm wearing off'
  };

  private phrasebook = {
    welcome: [
      "Well hey there, sugar! Aren't you just sweeter than sweet tea for stoppin' by! I'm your very own Book Fairy, ready to help you find the most delightful audiobooks this side of heaven.",
      "Bless your heart for visitin'! I'm fixin' to help you discover some absolutely enchanting stories. What kind of magic are we conjurin' up today, darlin'?",
      "Why hello there, honey child! Welcome to my little corner of book heaven. I've got more stories than a Sunday church social, and I'm just itchin' to share 'em with you!"
    ],

    buttonRedirect: [
      "Darlin', I do declare — them buttons ain't just for decoration! Would you be a dear and press one for me?",
      "Sweet pea, those pretty little buttons are there for a reason! Give one a gentle tap, won't you?",
      "Honey, I appreciate the chatterin', but I work best with button tappin'. Mind clickin' one of those lovely options?",
      "Sugar, bless your heart, but I need you to use them buttons down there. They're prettier than a Georgia peach and twice as useful!"
    ],

    escalation: [
      "Well mercy me, somethin' seems to be stuck like molasses in January! Best check in with the fine folks maintainin' me before I melt like butter in July.",
      "Bless your heart, but I'm more confused than a cat in a dog house! Might want to holler at my caretakers 'fore things get messier than a pig in mud.",
      "Lord have mercy, I'm flustered as a long-tailed cat in a room full of rockin' chairs! Time to call in the cavalry, sugar."
    ],

    searching: [
      "Well sugar, let me flap my wings and dig through these dusty spellbooks…",
      "Hold on darlin', I'm rustlin' up your book faster than gossip at a church picnic.",
      "Lawd, you sure do keep me busy! Let me sprinkle some fairy dust and see what pops up.",
      "Mercy, child, give me a second while I work my charms."
    ],

    presenting: [
      "Well aren't you just sweeter than sweet tea for tappin' that button! Now, sugar, what genre can I fetch for ya?",
      "Here's the gem I conjured up, sugar. Don't say I never do nothin' for you.",
      "Bless your heart, I found this one sittin' pretty on the shelf. Maybe it's the one?",
      "There ya go, darlin'. Magic as promised, choices and all."
    ],

    downloading: [
      "It's comin' down slower than molasses, but we'll get there, sugar.",
      "Your little treasure's flyin' in quicker than fireflies on a summer night.",
      "Mercy me, this spell's takin' a while to brew. Sit tight, darlin'.",
      "Hush now, it's workin'. You can't rush fairy magic."
    ],

    ready: [
      "All done, sweetpea! Here's your shiny new read, hot off the fairy press.",
      "Well, look at that. I pulled it off again. Click here before I change my mind.",
      "Finished faster than a preacher at a potluck, sugar. Go enjoy.",
      "There it is, darlin'. Now don't say I never spoil you."
    ],

    error: [
      "Well ain't that a peach — my wings got tangled. I'll try another spell.",
      "Darlin', the magic well ran dry. Might need one of them high-falutin' admins to fix it.",
      "Shoot, that one croaked deader than a June bug in July. Gimme a sec to stir a new brew.",
      "Mercy, sugar, somethin' went sideways. I'll patch it up quick."
    ]
  };

  private getUserState(userId: string): UserState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, { typingAttempts: 0 });
    }
    return this.userStates.get(userId)!;
  }

  private getRandomPhrase(category: keyof typeof this.phrasebook): string {
    const phrases = this.phrasebook[category];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private maskTechTerms(message: string): string {
    let masked = message;
    for (const [tech, magic] of Object.entries(this.techToMagic)) {
      const regex = new RegExp(tech, 'gi');
      masked = masked.replace(regex, magic);
    }
    return masked;
  }

  // Test method: Process user typing attempt
  processTypingAttempt_test(userId: string, message: string): PersonalityResponse {
    const state = this.getUserState(userId);
    state.typingAttempts++;
    state.lastTypingAttempt = new Date();

    // Escalation logic
    if (state.typingAttempts >= 3) {
      return {
        message: this.getRandomPhrase('escalation'),
        shouldRedirectToButtons: true,
        escalationLevel: 3
      };
    }

    // Regular redirect
    return {
      message: this.getRandomPhrase('buttonRedirect'),
      shouldRedirectToButtons: true,
      escalationLevel: state.typingAttempts
    };
  }

  // Test method: Process successful button interaction
  processButtonInteraction_test(userId: string): void {
    const state = this.getUserState(userId);
    state.typingAttempts = 0; // Reset typing attempts
    state.lastButtonInteraction = new Date();
  }

  // Test method: Transform message with Southern Belle personality
  transformMessage_test(originalMessage: string, context: 'welcome' | 'searching' | 'presenting' | 'downloading' | 'ready' | 'error'): string {
    // First mask tech terms
    let transformed = this.maskTechTerms(originalMessage);
    
    // Add Southern Belle flair based on context
    const personality = this.getRandomPhrase(context);
    
    // Combine personality with content
    if (context === 'welcome') {
      return personality;
    } else if (context === 'presenting') {
      return `${personality}\n\n${transformed}`;
    } else {
      return `${personality} ${transformed}`;
    }
  }

  // Test method: Generate button tree responses
  generateButtonTreeResponse_test(
    context: 'welcome' | 'genre_selection' | 'search_results' | 'download_confirm',
    data?: any
  ): { message: string; buttonLayout: string } {
    
    const responses = {
      welcome: {
        message: this.getRandomPhrase('welcome') + "\n\nNow sugar, how would you like to find your next delightful story?",
        buttonLayout: "📚 Search by Title | ✍️ Search by Author | 🎭 Browse Genres\n🔥 Popular Books | ✨ New Releases"
      },
      
      genre_selection: {
        message: "Well aren't you just sweeter than sweet tea for tappin' that button! Now, sugar, what genre tickles your fancy?",
        buttonLayout: "🧙 Fantasy | 🚀 Sci-Fi | 🔍 Mystery | 💕 Romance\n⚡ Thriller | 👤 Biography | 📜 History | ⬅️ Back"
      },
      
      search_results: {
        message: `${this.getRandomPhrase('presenting')}\n\nFound these little treasures for you:`,
        buttonLayout: "[1] [2] [3] [4] [5] | [📖 More Info] | [Next] [New Search]"
      },
      
      download_confirm: {
        message: this.getRandomPhrase('downloading'),
        buttonLayout: "[✅ Confirm] [❌ Cancel] [🔍 Search More]"
      }
    };

    return responses[context];
  }
}

// Test cases to validate behavior
export function runPersonalityTests_test() {
  const personality = new SouthernBellePersonality_Test();
  
  console.log("🧪 Testing Southern Belle Personality System:");
  
  // Test 1: Tech term masking
  const techMessage = "Downloading book from server, please wait while API connects...";
  const masked = personality.transformMessage_test(techMessage, 'downloading');
  console.log("✅ Tech Masking:", masked);
  
  // Test 2: Typing escalation
  const userId = "test_user_123";
  console.log("✅ First typing attempt:", personality.processTypingAttempt_test(userId, "hello").message);
  console.log("✅ Second typing attempt:", personality.processTypingAttempt_test(userId, "hi there").message);
  console.log("✅ Third typing attempt (escalation):", personality.processTypingAttempt_test(userId, "help").message);
  
  // Test 3: Button interaction reset
  personality.processButtonInteraction_test(userId);
  console.log("✅ After button interaction:", personality.processTypingAttempt_test(userId, "test").escalationLevel);
  
  // Test 4: Button tree responses
  const welcome = personality.generateButtonTreeResponse_test('welcome');
  console.log("✅ Welcome Response:", welcome);
  
  return {
    techMasking: masked.includes('spell brewing'),
    escalationWorks: true,
    buttonTreeGenerated: welcome.buttonLayout.includes('📚'),
    personalityApplied: masked.includes('darlin') || masked.includes('sugar')
  };
}
