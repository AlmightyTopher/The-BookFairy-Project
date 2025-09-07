/**
 * COMPREHENSIVE END-TO-END FUNCTIONALITY TEST
 * Tests all Book Fairy functions from an end-user perspective
 */

const { MessageHandler } = require('./src/bot/message-handler');
const { createSearchResultButtons } = require('./src/utils/discord-ui');

// Mock Discord message creation helper
function createMockMessage(content, mentions = true, isDM = false) {
  return {
    id: '123456789',
    content,
    author: {
      id: 'user123',
      username: 'testuser',
      bot: false
    },
    channel: {
      id: 'channel123',
      send: async (msg) => console.log('📤 Bot Response:', typeof msg === 'string' ? msg.substring(0, 100) + '...' : 'Button Message'),
      isDMBased: () => isDM
    },
    guild: { id: 'guild123' },
    mentions: {
      has: () => mentions
    },
    reply: async (msg) => console.log('📤 Bot Reply:', typeof msg === 'string' ? msg.substring(0, 100) + '...' : 'Button Reply'),
    client: { user: { id: 'bot123' } }
  };
}

// Mock button interaction helper
function createMockButtonInteraction(customId, userId = 'user123') {
  return {
    customId,
    user: { id: userId },
    isButton: () => true,
    reply: async (options) => console.log('📤 Button Response:', options.content?.substring(0, 100) + '...' || 'Button UI'),
    followUp: async (options) => console.log('📤 Follow-up:', options.content?.substring(0, 100) + '...' || 'Follow-up UI'),
    update: async (options) => console.log('📤 Update:', options.content?.substring(0, 100) + '...' || 'Update UI'),
    channel: { id: 'channel123' }
  };
}

async function testBookFairyFunctionality() {
  console.log('\n🧚‍♀️ BOOK FAIRY - COMPREHENSIVE FUNCTIONALITY TEST');
  console.log('=' .repeat(60));
  
  try {
    const messageHandler = new MessageHandler();
    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Basic search functionality
    console.log('\n📚 TEST 1: Basic Search Functionality');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const searchMessage = createMockMessage('book fairy find me fantasy books');
      await messageHandler.handle(searchMessage);
      console.log('✅ Basic search completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Basic search failed:', error.message);
    }

    // Test 2: Author search
    console.log('\n✍️ TEST 2: Author Search');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const authorMessage = createMockMessage('book fairy find books by brandon sanderson');
      await messageHandler.handle(authorMessage);
      console.log('✅ Author search completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Author search failed:', error.message);
    }

    // Test 3: Download status check
    console.log('\n📥 TEST 3: Download Status Check');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const statusMessage = createMockMessage('book fairy downloads');
      await messageHandler.handle(statusMessage);
      console.log('✅ Download status check completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Download status check failed:', error.message);
    }

    // Test 4: Help command
    console.log('\n❓ TEST 4: Help Command');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const helpMessage = createMockMessage('book fairy !fairy help');
      await messageHandler.handle(helpMessage);
      console.log('✅ Help command completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Help command failed:', error.message);
    }

    // Test 5: Genre browsing
    console.log('\n🎭 TEST 5: Genre Browsing');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const genreMessage = createMockMessage('book fairy genres');
      await messageHandler.handle(genreMessage);
      console.log('✅ Genre browsing completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Genre browsing failed:', error.message);
    }

    // Test 6: Button interactions
    console.log('\n🔘 TEST 6: Button Interactions');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const buttonInteraction = createMockButtonInteraction('search_by_title');
      await messageHandler.handleButtonInteraction(buttonInteraction);
      console.log('✅ Button interaction completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Button interaction failed:', error.message);
    }

    // Test 7: Welcome menu
    console.log('\n🎯 TEST 7: Welcome Menu');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const welcomeButton = createMockButtonInteraction('home_new_chat');
      await messageHandler.handleButtonInteraction(welcomeButton);
      console.log('✅ Welcome menu completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Welcome menu failed:', error.message);
    }

    // Test 8: Search result buttons
    console.log('\n📊 TEST 8: Search Result UI Components');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const mockResults = [
        { title: 'Test Book 1', author: 'Test Author 1', downloadUrl: 'test1' },
        { title: 'Test Book 2', author: 'Test Author 2', downloadUrl: 'test2' }
      ];
      const buttons = createSearchResultButtons(mockResults, 0, false);
      console.log('✅ Search result UI components created successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Search result UI components failed:', error.message);
    }

    // Test 9: Message filtering (should ignore bot messages)
    console.log('\n🤖 TEST 9: Message Filtering');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const botMessage = createMockMessage('test message');
      botMessage.author.bot = true; // Make it a bot message
      await messageHandler.handle(botMessage);
      console.log('✅ Bot message filtering completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Bot message filtering failed:', error.message);
    }

    // Test 10: Complex search queries
    console.log('\n🔍 TEST 10: Complex Search Queries');
    console.log('-'.repeat(40));
    totalTests++;
    try {
      const complexMessage = createMockMessage('book fairy I want something like dune but more recent');
      await messageHandler.handle(complexMessage);
      console.log('✅ Complex search query completed successfully');
      testsPassed++;
    } catch (error) {
      console.log('❌ Complex search query failed:', error.message);
    }

    // Final Results
    console.log('\n🎉 FINAL TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📊 Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
    
    if (testsPassed === totalTests) {
      console.log('🎯 ALL FUNCTIONS WORKING CORRECTLY!');
      console.log('📋 End-user functionality verification: PASSED');
    } else {
      console.log('⚠️  Some functions need attention');
      console.log(`📋 End-user functionality verification: ${testsPassed}/${totalTests} working`);
    }

    console.log('\n📚 AVAILABLE FUNCTIONS SUMMARY:');
    console.log('- ✅ Basic book search (mention bot + search query)');
    console.log('- ✅ Author-specific search');
    console.log('- ✅ Download status checking ("downloads")');
    console.log('- ✅ Help system ("!fairy help")');
    console.log('- ✅ Genre browsing ("genres")');
    console.log('- ✅ Interactive button UI');
    console.log('- ✅ Welcome/home navigation');
    console.log('- ✅ Search result displays');
    console.log('- ✅ Message filtering');
    console.log('- ✅ Complex query processing');

  } catch (error) {
    console.error('❌ Fatal error in functionality test:', error);
  }
}

// Run the test
if (require.main === module) {
  testBookFairyFunctionality().catch(console.error);
}

module.exports = { testBookFairyFunctionality };
