import { Client, GatewayIntentBits, Partials, MessageFlags } from 'discord.js';
import { MessageHandler } from './bot/message-handler';
import { installQuickActions, handleQuickActionMessage } from './quick-actions';
import { setDiscordClient, setMessageHandler } from './bridge/dispatch';
import { config } from './config/config';
import { logger } from './utils/logger';
import { startMetrics, requests } from './metrics/server';
import { withReqId } from './lib/logger';
import { randomUUID } from 'crypto';
import { downloadMonitor } from './services/download-monitor';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const messageHandler = new MessageHandler();
let botReady = false;

client.once('clientReady', () => {
  logger.info(`Logged in as ${client.user?.tag}`);
  botReady = true;
  
  // Set the Discord client and message handler in the dispatch bridge
  setDiscordClient(client);
  setMessageHandler(messageHandler);
  
  // Set up download monitor with Discord client
  downloadMonitor.setDiscordClient(client);
  logger.info('Download monitor initialized with Discord client');
  
  // Start metrics server
  startMetrics(parseInt(process.env.METRICS_PORT || '9090'));
});

// Install quick actions system
installQuickActions(client);

client.on('messageCreate', async (message) => {
  if (!botReady) {
    logger.info({}, 'Bot not ready yet, skipping message');
    return;
  }
  
  // Handle all messages that mention the bot or are DMs
  const isMentioned = message.mentions.has(client.user!);
  const containsBotName = message.content.toLowerCase().includes('book fairy');
  const isDM = message.channel.isDMBased();
  
  if (isMentioned || containsBotName || isDM) {
    // First, try to handle with quick actions
    let handledByQuickActions = false;
    try {
      handledByQuickActions = await handleQuickActionMessage(message, client);
    } catch (error) {
      logger.error({ error }, 'Quick actions handler failed, falling back to main handler');
    }
    
    // If quick actions didn't handle it, or it's a custom search/number/response, process with main handler
    if (!handledByQuickActions) {
      await messageHandler.handle(message);
    }
  }
});

// Handle button interactions for download buttons, next page, etc.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  const reqId = randomUUID();
  const log = withReqId(reqId);
  
  try {
    log.info({ buttonId: interaction.customId, userId: interaction.user.id }, 'Button interaction received');
    requests.inc({ type: 'button', command: interaction.customId, status: 'received' });
    
    await messageHandler.handleButtonInteraction(interaction);
    
    requests.inc({ type: 'button', command: interaction.customId, status: 'success' });
  } catch (error) {
    log.error({ error }, 'Failed to handle button interaction');
    requests.inc({ type: 'button', command: interaction.customId, status: 'error' });
    
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Sorry, something went wrong. Please try again.', flags: MessageFlags.Ephemeral });
      }
    } catch (replyError) {
      log.error({ replyError }, 'Failed to send error reply');
    }
  }
});

client.login(config.discord.token)
  .catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  downloadMonitor.stopMonitoring();
  client.destroy();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);