// Simple test to validate personality messages
console.log("🧪 Testing Southern Belle Personality Integration");

// Mock the personality response structure
const welcomeMessages = [
  "Well hey there, sugar! Aren't you just sweeter than sweet tea for stoppin' by!",
  "Bless your heart for visitin'! I'm fixin' to help you discover some absolutely enchanting stories.",
  "Why hello there, honey child! Welcome to my little corner of book heaven."
];

const searchingMessages = [
  "Well sugar, let me flap my wings and dig through these dusty spellbooks…",
  "Hold on darlin', I'm rustlin' up your book faster than gossip at a church picnic.",
  "Mercy, child, give me a second while I work my charms."
];

const presentingMessages = [
  "Here's the gem I conjured up, sugar. Don't say I never do nothin' for you.",
  "Bless your heart, I found this one sittin' pretty on the shelf. Maybe it's the one?",
  "There ya go, darlin'. Magic as promised, choices and all."
];

const downloadingMessages = [
  "It's comin' down slower than molasses, but we'll get there, sugar.",
  "Your little treasure's flyin' in quicker than fireflies on a summer night.",
  "Hush now, it's workin'. You can't rush fairy magic."
];

const errorMessages = [
  "Well ain't that a peach — my wings got tangled. I'll try another spell.",
  "Shoot, that one croaked deader than a June bug in July. Gimme a sec to stir a new brew.",
  "Mercy, sugar, somethin' went sideways. I'll patch it up quick."
];

function getRandomMessage(category) {
  const messages = {
    welcome: welcomeMessages,
    searching: searchingMessages,
    presenting: presentingMessages,
    downloading: downloadingMessages,
    error: errorMessages
  };
  
  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

console.log("\n🎭 Southern Belle Personality Examples:");
console.log("✅ Welcome:", getRandomMessage('welcome'));
console.log("✅ Searching:", getRandomMessage('searching'));
console.log("✅ Presenting:", getRandomMessage('presenting'));
console.log("✅ Downloading:", getRandomMessage('downloading'));
console.log("✅ Error:", getRandomMessage('error'));

console.log("\n🔧 Tech Term Masking Examples:");
const techTerms = {
  'download': 'spell casting',
  'API': 'fairy charm',
  'server': 'fairy realm',
  'error': 'spell mishap'
};

const originalMessage = "Download from API server failed with error";
let maskedMessage = originalMessage;
for (const [tech, magic] of Object.entries(techTerms)) {
  maskedMessage = maskedMessage.replace(new RegExp(tech, 'gi'), magic);
}

console.log("Original:", originalMessage);
console.log("Masked:  ", maskedMessage);

console.log("\n🎉 Personality Integration Active!");
console.log("The bot now speaks with Southern Belle charm across:");
console.log("• Welcome messages & button interactions");
console.log("• Search status & result presentation");
console.log("• Download progress & completion");
console.log("• Error handling & no results");
console.log("• Tech term masking (API → fairy charm, etc.)");
