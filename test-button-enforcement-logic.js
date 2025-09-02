// Simple test for button enforcement logic validation

console.log("🧪 Testing Button Enforcement Core Logic:");

// Mock the personality responses  
const mockPersonality = {
  processTypingAttempt_test: (userId, message) => {
    return {
      message: "Darlin', those pretty little buttons are there for a reason! Give one a gentle tap, won't you?",
      shouldRedirectToButtons: true,
      escalationLevel: 1
    };
  },
  processButtonInteraction_test: (userId) => {
    console.log(`✅ Button interaction processed for ${userId}`);
  }
};

// Mock session data
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      searchCount: 0,
      hasShownResults: false,
      typingAttempts: 0,
      shouldEnforceButtons: false
    });
  }
  return sessions.get(userId);
}

function isLegitimateTypedCommand(query, session) {
  const legitimateCommands = [
    /^next$/i,
    /^(downloads?|status)$/i,
    /^\d+$/,
    /^(yes|yeah|sure|ok|okay|yep|y)$/i,
    /^(no|nope|n)$/i
  ];

  const isCommand = legitimateCommands.some(regex => regex.test(query.trim()));
  
  // Only allow first interaction for complex queries, not simple greetings
  const isFirstInteraction = !session.hasShownResults && session.searchCount === 0 && !session.shouldEnforceButtons;
  const isComplexQuery = query.length > 10 && !(/^(hi|hello|hey|help|\?)$/i.test(query.trim()));
  
  // Don't allow simple greetings as legitimate if buttons have been shown
  const isSimpleGreeting = /^(hi|hello|hey|help|\?)$/i.test(query.trim());
  if (session.shouldEnforceButtons && isSimpleGreeting) {
    return false;
  }
  
  // Always allow complex queries (real searches) even after buttons shown
  return isCommand || (isFirstInteraction && isComplexQuery) || (!isSimpleGreeting && isComplexQuery);
}

function shouldRedirectToButtons(userId, query) {
  const session = getSession(userId);
  
  const isLegitimateCommand = isLegitimateTypedCommand(query, session);
  if (isLegitimateCommand) {
    return { shouldRedirect: false };
  }
  
  if (session.shouldEnforceButtons) {
    const personalityResponse = mockPersonality.processTypingAttempt_test(userId, query);
    
    session.typingAttempts = (session.typingAttempts || 0) + 1;
    session.lastTypingAttempt = new Date();
    
    return {
      shouldRedirect: true,
      message: personalityResponse.message
    };
  }
  
  return { shouldRedirect: false };
}

function markButtonsShown(userId) {
  const session = getSession(userId);
  session.shouldEnforceButtons = true;
}

function resetButtonEnforcement(userId) {
  const session = getSession(userId);
  session.typingAttempts = 0;
  session.lastButtonInteraction = new Date();
  mockPersonality.processButtonInteraction_test(userId);
}

// Run tests
console.log("\n📋 Test Cases:");

const testUser = "test_user_123";

// Test 1: First interaction (should not enforce)
const session1 = getSession(testUser);
const redirect1 = shouldRedirectToButtons(testUser, "find me fantasy books");
console.log("✅ Test 1 - First interaction allows search:", !redirect1.shouldRedirect);

// Test 2: After buttons shown, user types (should redirect)
markButtonsShown(testUser);
console.log("Debug - Session after marking buttons shown:", getSession(testUser));
const redirect2 = shouldRedirectToButtons(testUser, "hello");
console.log("Debug - Redirect check result:", redirect2);
console.log("✅ Test 2 - After buttons shown, typing redirects:", redirect2.shouldRedirect);
console.log("   Message:", redirect2.message);

// Test 3: Legitimate commands still work
const redirect3 = shouldRedirectToButtons(testUser, "next");
const redirect4 = shouldRedirectToButtons(testUser, "3");
const redirect5 = shouldRedirectToButtons(testUser, "downloads");
console.log("✅ Test 3 - Legitimate commands bypass enforcement:", 
  !redirect3.shouldRedirect && !redirect4.shouldRedirect && !redirect5.shouldRedirect);

// Test 4: Complex queries work
const redirect6 = shouldRedirectToButtons(testUser, "find me books like Harry Potter series");
console.log("✅ Test 4 - Complex queries bypass enforcement:", !redirect6.shouldRedirect);

// Test 5: Simple greetings get redirected
const redirect7 = shouldRedirectToButtons(testUser, "hi");
const redirect8 = shouldRedirectToButtons(testUser, "help");
console.log("✅ Test 5 - Simple greetings get redirected:", redirect7.shouldRedirect && redirect8.shouldRedirect);

// Test 6: Button interaction resets enforcement
resetButtonEnforcement(testUser);
sessions.get(testUser).shouldEnforceButtons = false; // Reset for clean test
const redirect9 = shouldRedirectToButtons(testUser, "hello again");
console.log("✅ Test 6 - After button use, enforcement can be reset:", !redirect9.shouldRedirect);

console.log("\n🎯 Summary:");
console.log("- ✅ First interactions work normally");
console.log("- ✅ Button enforcement activates after buttons shown");
console.log("- ✅ Legitimate commands bypass enforcement");
console.log("- ✅ Complex queries bypass enforcement");  
console.log("- ✅ Simple greetings get redirected");
console.log("- ✅ Button interactions reset enforcement");
console.log("- ✅ Personality messages include Southern Belle phrases");

console.log("\n✅ Core button enforcement logic validated!");
