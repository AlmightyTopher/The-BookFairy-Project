import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../bot/message-handler';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';

// Mock the orchestrator
vi.mock('../orchestrator/audiobook-orchestrator');
vi.mock('../utils/logger');

describe('Integration Tests', () => {
  let messageHandler: MessageHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = new MessageHandler();
  });

  it('should create message handler successfully', () => {
    expect(messageHandler).toBeInstanceOf(MessageHandler);
  });

  it('should verify dependencies are properly mocked', () => {
    expect(AudiobookOrchestrator).toHaveBeenCalled();
  });
});