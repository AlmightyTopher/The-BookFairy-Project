import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} from 'discord.js';
import { randomUUID } from 'crypto';

import { MessageHandler } from './bot/message-handler';
import { installQuickActions, handleQuickActionMessage } from './quick-actions';
import { setDiscordClient, setMessageHandler } from './bridge/dispatch';
import { config } from './config/config';
import { logger, withReqId } from './utils/logger';
import { startMetrics, requests } from './metrics/server';
import { downloadMonitor } from './services/download-monitor';
import { registerBookDetailHandlers } from './discord/interactions/bookDetails';
import { registerAuthorSearchHandlers } from './discord/interactions/authorSearch';
import { isInAuthorSession } from './discord/interactions/authorSearch';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const messageHandler = new MessageHandler();
let botReady = false;

client.once(Events.ClientReady, () => {
  logger.info(`Logged in as ${client.user?.tag}`);
  botReady = true;

  // Bridge wiring
  setDiscordClient(client);
  setMessageHandler(messageHandler);

  // Download monitor gets the client
  downloadMonitor.setDiscordClient(client);
  logger.info('Download monitor initialized with Discord client');

  // Register book detail handlers
  registerBookDetailHandlers(client);
  logger.info('Book detail handlers registered');
  // Register author search handlers
  registerAuthorSearchHandlers(client);
  logger.info('Author search handlers registered');

  // Start metrics server
  startMetrics(parseInt(process.env.METRICS_PORT || '9090', 10));
});

// Quick actions (global)
installQuickActions(client);

client.on(Events.MessageCreate, async (message) => {
  if (!botReady) {
    logger.info({}, 'Bot not ready yet, skipping message');
    return;
  }

  // If user is in the author flow, let that handler own the message.
  if (isInAuthorSession(message.guildId, message.author.id)) {
    return;
  }

  // Handle DMs or messages directed at the bot
  const isMentioned = message.mentions.has(client.user!);
  const containsBotName = message.content.toLowerCase().includes('book fairy');
  const isDM = message.channel.isDMBased();

  if (isMentioned || containsBotName || isDM) {
    // Try quick actions first
    let handledByQuickActions = false;
    try {
      handledByQuickActions = await handleQuickActionMessage(message, client);
    } catch (error) {
      logger.error({ error }, 'Quick actions handler failed, falling back to main handler');
    }

    if (!handledByQuickActions) {
      await messageHandler.handleMessage(message);
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
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
        await interaction.reply({ content: 'Sorry, something went wrong. Please try again.', ephemeral: true });
      }
    } catch (replyError) {
      log.error({ replyError }, 'Failed to send error reply');
    }
  }
});

client.login(config.discord.token).catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');

  try {
    // Stop download monitoring
    downloadMonitor.stopMonitoring?.();

    // Destroy Discord client
    client.destroy();
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
  }

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
