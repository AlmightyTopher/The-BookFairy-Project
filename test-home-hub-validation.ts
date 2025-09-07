/**
 * Test for home hub button validation using KNOWN_HOME_IDS
 */
import { navigateFromHome } from './src/navigation/home-hub';
import { ButtonInteraction } from 'discord.js';

// Mock logger to prevent actual logging during tests
jest.mock('./src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Create a mock ButtonInteraction
function createMockInteraction(customId: string): ButtonInteraction {
  return {
    isButton: () => true,
    customId,
    user: { id: 'test-user-123' }
  } as ButtonInteraction;
}

describe('Home Hub Button Validation', () => {
  test('should accept all known home button IDs', async () => {
    const knownIds = [
      'search_title_open',
      'search_author_open', 
      'search_describe_open',
      'browse_genres_open',
      'audiobooks_open',
      'more_options_open',
      'other_cmds_open',
      'home_new_chat',
      'home_back',
      'home_next'
    ];

    for (const buttonId of knownIds) {
      const interaction = createMockInteraction(buttonId);
      const result = await navigateFromHome(buttonId, interaction);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('action');
      console.log(`✓ ${buttonId} -> ${result?.action}`);
    }
  });

  test('should reject unknown button IDs', async () => {
    const unknownIds = [
      'unknown_button',
      'invalid_id',
      'test_button',
      'random_action'
    ];

    for (const buttonId of unknownIds) {
      const interaction = createMockInteraction(buttonId);
      const result = await navigateFromHome(buttonId, interaction);
      
      expect(result).toBeNull();
      console.log(`✓ ${buttonId} -> rejected (null)`);
    }
  });

  test('should ignore book detail buttons', async () => {
    const bookDetailIds = [
      'BOOK_VIEW:12345',
      'BOOK_DL_YES:67890',
      'BOOK_DL_NO:54321'
    ];

    for (const buttonId of bookDetailIds) {
      const interaction = createMockInteraction(buttonId);
      const result = await navigateFromHome(buttonId, interaction);
      
      expect(result).toBeNull();
      console.log(`✓ ${buttonId} -> ignored (null)`);
    }
  });

  test('should return correct action mappings', async () => {
    const expectedMappings = {
      'search_title_open': 'search_title',
      'search_author_open': 'search_author',
      'search_describe_open': 'search_describe',
      'browse_genres_open': 'browse_genres',
      'audiobooks_open': 'audiobooks',
      'more_options_open': 'more_options',
      'other_cmds_open': 'other_commands',
      'home_new_chat': 'home_refresh',
      'home_back': 'home_refresh',
      'home_next': 'home_next_reserved'
    };

    for (const [buttonId, expectedAction] of Object.entries(expectedMappings)) {
      const interaction = createMockInteraction(buttonId);
      const result = await navigateFromHome(buttonId, interaction);
      
      expect(result).not.toBeNull();
      expect(result?.action).toBe(expectedAction);
      console.log(`✓ ${buttonId} -> ${result?.action} (expected: ${expectedAction})`);
    }
  });
});

console.log('Running home hub validation tests...');
