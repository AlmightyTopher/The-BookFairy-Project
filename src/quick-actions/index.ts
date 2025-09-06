import { Client, Message } from 'discord.js';
import { logger } from '../utils/logger.js';
import { FlowEngine } from '../flow/flow-engine.js';

// Create flow engine instance locally to avoid module-level imports
let flowEngine: FlowEngine;

export function installQuickActions(client: Client): void {
  // Initialize flow engine when Discord client is ready
  flowEngine = new FlowEngine();
  logger.info('Quick actions installed with flow engine');
}

export async function handleQuickActionMessage(message: Message, client: Client): Promise<boolean> {
  // Skip bot messages
  if (message.author.bot) return false;

  const content = message.content.toLowerCase().trim();
  const userId = message.author.id;

  // Simple greetings should go to main menu
  const greetings = ['hi', 'hello', 'hey', 'help', 'menu', 'start'];
  const isGreeting = greetings.some(greeting => content.includes(greeting));
  
  // Very short messages are probably greetings or unclear
  if (isGreeting || content.length < 4) {
    if (!flowEngine) {
      logger.error('Flow engine not initialized in quick actions');
      return false;
    }
    
    // Navigate to main menu
    flowEngine.navigateTo(userId, 'Main');
    const rendered = flowEngine.renderRoute(userId);
    
    await message.reply({
      embeds: rendered.embeds || [],
      components: rendered.components || []
    });
    return true;
  }

  // Let other systems handle more complex queries
  return false;
}

export async function handleMessage(message: Message): Promise<boolean> {
  return handleQuickActionMessage(message, message.client);
}

// Legacy function for backwards compatibility
export function createMainScreen() {
  logger.warn('createMainScreen() is deprecated - use flow engine instead');
  return null;
}

// Export other legacy functions for compatibility
export const quickActions = {
  handleMessage,
  createMainScreen
};
