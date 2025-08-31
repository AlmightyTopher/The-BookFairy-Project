import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../../src/bot/message-handler';

// Mock all dependencies
vi.mock('../../src/orchestrator/audiobook-orchestrator', () => ({
  AudiobookOrchestrator: vi.fn().mockImplementation(() => ({
    handleRequest: vi.fn().mockImplementation((query: string) => {
      // Return different responses based on query content
      if (query.includes('similar') || query.includes('like')) {
        return Promise.resolve({
          intent: 'FIND_SIMILAR',
          confidence: 0.95,
          seed_book: {
            title: 'Dune',
            author: 'Frank Herbert'
          },
          results: [
            {
              title: 'Foundation',
              author: 'Isaac Asimov',
              why_similar: 'Epic sci-fi scope',
              similarity_axes: ['genre', 'scope']
            }
          ],
          clarifying_question: null,
          post_prompt: null
        });
      } else if (query.includes('fantasy')) {
        return Promise.resolve({
          intent: 'FIND_GENRE',
          confidence: 0.9,
          results: [
            {
              title: 'The Way of Kings',
              author: 'Brandon Sanderson',
              why_similar: 'Epic fantasy with magic systems',
              similarity_axes: ['genre']
            }
          ],
          clarifying_question: null,
          post_prompt: null
        });
      } else {
        return Promise.resolve({
          intent: 'GENERAL_RECOMMENDATION',
          confidence: 0.8,
          results: [
            {
              title: 'The Expanse',
              author: 'James S.A. Corey',
              why_similar: 'Great story and characters',
              similarity_axes: ['quality']
            }
          ],
          clarifying_question: null,
          post_prompt: null
        });
      }
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

describe('Intent Classification Tests', () => {
  let messageHandler: MessageHandler;
  
  const createMockMessage = (content: string) => ({
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
      has: vi.fn().mockReturnValue(true)
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

  it('should classify FIND_SIMILAR intent correctly', async () => {
    const message = createMockMessage('find me something similar to dune');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('find me something similar to dune');
  });

  it('should classify fantasy genre request correctly', async () => {
    const message = createMockMessage('recommend me some fantasy books');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('recommend me some fantasy books');
  });

  it('should handle general recommendation requests', async () => {
    const message = createMockMessage('what should I read next?');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('what should I read next?');
  });

  it('should handle author-specific requests', async () => {
    const message = createMockMessage('recommend books by brandon sanderson');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('recommend books by brandon sanderson');
  });

  it('should handle series continuation requests', async () => {
    const message = createMockMessage('I just finished reading the expanse, what next?');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('I just finished reading the expanse, what next?');
  });

  it('should handle mood-based requests', async () => {
    const message = createMockMessage('I want something dark and gritty');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('I want something dark and gritty');
  });
});
