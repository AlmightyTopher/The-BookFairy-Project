import { Client, GatewayIntentBits, Partials, MessageFlags } from 'discord.js';
import { MessageHandler } from './bot/message-handler';
import { installQuickActions, handleQuickActionMessage } from './quick-actions';
import { setDiscordClient, setMessageHandler } from './bridge/dispatch';
import { config } from './config/config';
import { logger } from './utils/logger';

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
  
  try {
    await messageHandler.handleButtonInteraction(interaction);
  } catch (error) {
    logger.error({ error }, 'Failed to handle button interaction');
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Sorry, something went wrong. Please try again.', flags: MessageFlags.Ephemeral });
      }
    } catch (replyError) {
      logger.error({ replyError }, 'Failed to send error reply');
    }
  }
});

client.login(config.discord.token)
  .catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  });