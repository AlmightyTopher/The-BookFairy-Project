// Test script to simulate bot requests
const { MessageHandler } = require('./dist/bot/message-handler.js');

// Mock Discord message object
const createMockMessage = (content) => ({
  id: '123456789',
  content: content,
  author: {
    id: '987654321',
    username: 'testuser',
    bot: false
  },
  channel: {
    id: '111222333',
    send: async (message) => {
      console.log('📤 Bot would send:', message);
      return {};
    },
    isDMBased: () => false
  },
  guild: {
    id: '444555666'
  },
  mentions: {
    has: () => true // Simulate mention
  },
  reply: async (message) => {
    console.log('📤 Bot would reply:', message);
    return {};
  },
  client: {
    user: { id: 'bot123' }
  }
});

async function testBotRequest(query) {
  console.log(`\n🧪 Testing query: "${query}"`);
  console.log('⏰ Started at:', new Date().toLocaleTimeString());
  
  try {
    const messageHandler = new MessageHandler();
    const mockMessage = createMockMessage(query);
    
    await messageHandler.handle(mockMessage);
    console.log('✅ Request completed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('⏰ Finished at:', new Date().toLocaleTimeString());
}

// Test the query
testBotRequest("find me dune");
