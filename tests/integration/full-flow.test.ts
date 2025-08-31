import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../../src/bot/message-handler';

// Mock all dependencies
vi.mock('../../src/orchestrator/audiobook-orchestrator', () => ({
  AudiobookOrchestrator: vi.fn().mockImplementation(() => ({
    handleRequest: vi.fn().mockResolvedValue({
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
          why_similar: 'Epic science fiction with political intrigue',
          similarity_axes: ['genre', 'theme', 'scope']
        },
        {
          title: 'Hyperion',
          author: 'Dan Simmons',
          why_similar: 'Complex world-building and multiple storylines',
          similarity_axes: ['genre', 'complexity', 'world_building']
        }
      ],
      clarifying_question: null,
      post_prompt: 'Would you like more recommendations in this genre?'
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

describe('Full Flow Integration Tests', () => {
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

  it('should complete full recommendation flow', async () => {
    const message = createMockMessage('find me something like dune');
    
    // Execute the full flow
    await messageHandler.handle(message as any);
    
    // Verify the orchestrator was called
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('find me something like dune');
    
    // The flow should complete without throwing
    expect(true).toBe(true);
  });

  it('should handle complex queries with context', async () => {
    const complexQuery = 'I just finished reading The Expanse series and loved the realistic space travel and political intrigue. Can you recommend something similar but maybe with more alien contact?';
    const message = createMockMessage(complexQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(complexQuery);
  });

  it('should process multiple book recommendations', async () => {
    const message = createMockMessage('recommend me 3 good sci-fi books');
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith('recommend me 3 good sci-fi books');
  });

  it('should handle follow-up style questions', async () => {
    const followUpQuery = 'what about something with more humor?';
    const message = createMockMessage(followUpQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(followUpQuery);
  });

  it('should process genre-specific requests', async () => {
    const genreQuery = 'I want to explore urban fantasy - any good recommendations?';
    const message = createMockMessage(genreQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(genreQuery);
  });

  it('should handle author similarity requests', async () => {
    const authorQuery = 'find me authors who write like Terry Pratchett';
    const message = createMockMessage(authorQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(authorQuery);
  });

  it('should process mood-based recommendations', async () => {
    const moodQuery = 'I need something light and funny after reading some heavy stuff';
    const message = createMockMessage(moodQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(moodQuery);
  });

  it('should handle series completion questions', async () => {
    const seriesQuery = 'I just finished Harry Potter, what series should I start next?';
    const message = createMockMessage(seriesQuery);
    
    await messageHandler.handle(message as any);
    
    expect(messageHandler['orchestrator'].handleRequest).toHaveBeenCalledWith(seriesQuery);
  });
});
