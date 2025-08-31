import { MessageHandler } from './src/bot/message-handler';

// Create a simple test message object
const testMessage = {
  id: '123',
  content: 'find me dune',
  author: { id: '456', username: 'testuser', bot: false },
  channel: { id: '789', isDMBased: () => false },
  guild: { id: '101112' },
  mentions: { has: (user: any) => true },
  client: { user: { id: 'bot123' } },
  reply: async (msg: string) => {
    console.log('REPLY CALLED WITH:', msg);
    return {};
  }
};

async function test() {
  console.log('Starting MessageHandler test...');
  
  const handler = new MessageHandler();
  
  try {
    await handler.handle(testMessage as any);
    console.log('Test completed successfully');
  } catch (error) {
    console.log('Test failed with error:', error);
  }
}

test();
