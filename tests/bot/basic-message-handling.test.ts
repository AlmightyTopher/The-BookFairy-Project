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

describe('Basic Message Handling Tests', () => {
  let messageHandler: MessageHandler;
  
  const mockMessage = {
    id: '123456789',
    content: 'find me dune',
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
      has: vi.fn().mockReturnValue(false)
    },
    reply: vi.fn().mockResolvedValue({}),
    client: {
      user: { id: 'bot123' }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = new MessageHandler();
  });

  it('should create MessageHandler instance', () => {
    expect(messageHandler).toBeInstanceOf(MessageHandler);
  });

  it('should ignore bot messages', async () => {
    const botMessage = {
      ...mockMessage,
      author: { ...mockMessage.author, bot: true }
    };

    await messageHandler.handle(botMessage as any);
    
    expect(botMessage.reply).not.toHaveBeenCalled();
  });

  it('should handle messages properly (integration test)', async () => {
    const messageWithMention = {
      ...mockMessage,
      content: 'find me dune',
      mentions: {
        has: vi.fn().mockReturnValue(true)
      }
    };

    // Test that the handler runs without throwing
    await expect(messageHandler.handle(messageWithMention as any)).resolves.not.toThrow();
    
    // Verify the orchestrator was called
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('find me dune');
  });

  it('should process messages with bot name mention', async () => {
    const mentionMessage = {
      ...mockMessage,
      content: 'hey book fairy find me something good',
      mentions: {
        has: vi.fn().mockReturnValue(false)
      }
    };

    await expect(messageHandler.handle(mentionMessage as any)).resolves.not.toThrow();
    
    // Verify the orchestrator was called with cleaned query
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('find me something good');
  });
});
