import { Message, Client, TextChannel, Guild } from 'discord.js';
import { AudiobookOrchestrator } from '../../src/orchestrator/audiobook-orchestrator';

export function createMockMessage(content: string): Partial<Message> {
  return {
    content,
    author: { bot: false },
    client: {
      user: { id: 'bot-id' }
    } as Partial<Client> as Client,
    mentions: {
      has: (user: any) => content.includes('@BookFairy')
    },
    reply: jest.fn(),
    channel: {
      isDMBased: () => false,
      sendTyping: jest.fn()
    } as Partial<TextChannel> as TextChannel
  };
}

export function createHealthCheck(status: 'up' | 'down' = 'up') {
  return {
    status,
    responseTime: 10,
    lastCheck: new Date().toISOString()
  };
}

export async function waitForHealth(orchestrator: AudiobookOrchestrator, timeout = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const health = await orchestrator.getHealthStatus();
    if (health.status === 'healthy') {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}
