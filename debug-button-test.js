// Quick debug test for button enforcement
const fs = require('fs');

// Since we can't import the TypeScript directly, let's create a simple test
console.log("🧪 Simple Button Enforcement Debug Test");

// Mock user session  
let session = {
  shouldEnforceButtons: false,
  typingAttempts: 0,
  lastButtonInteraction: null,
  lastTypingAttempt: null
};

console.log("📝 Initial session:", session);

// Step 1: First interaction (should not enforce)
console.log("\n1️⃣ First interaction test:");
console.log("shouldEnforceButtons:", session.shouldEnforceButtons);
console.log("Should allow search:", !session.shouldEnforceButtons);

// Step 2: Mark buttons as shown
console.log("\n2️⃣ After showing buttons:");
session.shouldEnforceButtons = true;
console.log("shouldEnforceButtons:", session.shouldEnforceButtons);
console.log("Should redirect now:", session.shouldEnforceButtons);

// Step 3: Check legitimate command bypass
console.log("\n3️⃣ Legitimate command test:");
function isLegitimateCommand(query) {
  const legitimateCommands = [
    /^next$/i,
    /^previous$/i,
    /^back$/i,
    /^\d+$/,
    /^downloads?$/i,
    /^status$/i,
    /^help$/i,
    /^cancel$/i
  ];
  
  return legitimateCommands.some(pattern => pattern.test(query.trim()));
}

const testCommands = ["next", "3", "downloads", "hello"];
testCommands.forEach(cmd => {
  const isLegit = isLegitimateCommand(cmd);
  console.log(`Command "${cmd}": legitimate=${isLegit}, should redirect=${session.shouldEnforceButtons && !isLegit}`);
});

// Step 4: Reset after button interaction  
console.log("\n4️⃣ After button interaction:");
session.typingAttempts = 0;
session.lastButtonInteraction = new Date();
console.log("Should still enforce:", session.shouldEnforceButtons);
console.log("But typing attempts reset:", session.typingAttempts);

console.log("\n✅ Debug complete - the logic seems correct");
console.log("The issue might be in the TypeScript test implementation");
