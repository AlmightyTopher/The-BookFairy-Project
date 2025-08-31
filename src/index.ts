import { Client, GatewayIntentBits } from 'discord.js';
import { MessageHandler } from './bot/message-handler';
import { config } from './config/config';
import { logger } from './utils/logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

const messageHandler = new MessageHandler();
let botReady = false;

client.once('clientReady', () => {
  logger.info(`Logged in as ${client.user?.tag}`);
  botReady = true;
});

client.on('messageCreate', async (message) => {
  if (!botReady) {
    logger.info({}, 'Bot not ready yet, skipping message');
    return;
  }
  await messageHandler.handle(message);
});

client.login(config.discord.token)
  .catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  });