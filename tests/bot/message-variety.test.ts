import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../../src/bot/message-handler';

// Mock all dependencies
vi.mock('../../src/orchestrator/audiobook-orchestrator', () => ({
  AudiobookOrchestrator: vi.fn().mockImplementation(() => ({
    handleRequest: vi.fn().mockResolvedValue({
      intent: 'FIND_SIMILAR',
      confidence: 0.95,
      seed_book: {
        title: 'Test Book',
        author: 'Test Author'
      },
      results: [
        {
          title: 'Similar Book',
          author: 'Similar Author',
          why_similar: 'Similar themes and writing style',
          similarity_axes: ['genre', 'theme', 'writing_style']
        }
      ],
      clarifying_question: null,
      post_prompt: null
    })
  }))
}));

vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../../src/schemas/book_fairy_response.schema', () => ({
  BookFairyResponse: {
    parse: vi.fn().mockImplementation((data) => data)
  }
}));

vi.mock('../../src/server/clarify_policy', () => ({
  needsClarification: vi.fn().mockReturnValue(false)
}));

vi.mock('../../src/server/author_guard', () => ({
  shouldAskAuthorMore: vi.fn().mockReturnValue(true)
}));

describe('Message Variety Tests', () => {
  let messageHandler: MessageHandler;
  
  const createMockMessage = (content: string, hasMention = true) => ({
    id: '123456789',
    content,
    author: {
      id: '987654321',
      username: 'testuser',
      bot: false
    },
    channel: {
      id: '111222333',
      send: vi.fn().mockResolvedValue({}),
      isDMBased: () => false
    },
    guild: {
      id: '444555666'
    },
    mentions: {
      has: vi.fn().mockReturnValue(hasMention)
    },
    reply: vi.fn().mockResolvedValue({}),
    client: {
      user: { id: 'bot123' }
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = new MessageHandler();
  });

  const testMessages = [
    'find me a good book',
    'recommend something like dune',
    'I just finished the expanse, what next?',
    'need a new audiobook series',
    'what are some good sci-fi books?',
    'book fairy help me find fantasy books',
    'something similar to brandon sanderson',
    'I love urban fantasy, recommendations?',
    'find me cozy mysteries',
    'what should I read after harry potter?'
  ];

  testMessages.forEach((messageContent, index) => {
    it(`should handle message variety ${index + 1}: "${messageContent}"`, async () => {
      const message = createMockMessage(messageContent);
      
      await expect(messageHandler.handle(message as any)).resolves.not.toThrow();
      
      // Verify orchestrator was called - account for "book fairy" being cleaned from content
      const expectedContent = messageContent.replace(/book fairy/gi, '').trim();
      expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(expectedContent || messageContent);
    }, { timeout: 5000 });
  });

  it('should handle very long messages', async () => {
    const longMessage = 'I just finished reading this amazing book series about space exploration and alien civilizations and I really loved the way the author handled the complex political relationships between different species and I was wondering if you could recommend something similar that has the same depth of world-building and character development';
    const message = createMockMessage(longMessage);
    
    await expect(messageHandler.handle(message as any)).resolves.not.toThrow();
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(longMessage);
  }, { timeout: 5000 });

  it('should handle messages with emojis and special characters', async () => {
    const emojiMessage = '📚 find me a good book! 😊 Something like Harry Potter ⚡';
    const message = createMockMessage(emojiMessage);
    
    await expect(messageHandler.handle(message as any)).resolves.not.toThrow();
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(emojiMessage);
  }, { timeout: 5000 });

  it('should handle messages without mentions but with "book fairy" in content', async () => {
    const message = createMockMessage('hey book fairy, find me something good', false);
    
    await expect(messageHandler.handle(message as any)).resolves.not.toThrow();
    
    // Should clean the query by removing "book fairy"
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('hey , find me something good');
  }, { timeout: 5000 });
});
