import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { MessageHandler } from './message-handler';

export class DiscordBot {
  private client: Client;
  private messageHandler: MessageHandler;
  private readyPromise!: Promise<void>;
  private isReady: boolean = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.messageHandler = new MessageHandler();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.readyPromise = new Promise((resolve, reject) => {
      this.client.once(Events.ClientReady, () => {
        logger.info('Discord bot is ready!');
        this.isReady = true;
        resolve();
      });

      this.client.once(Events.Error, (error) => {
        logger.error({ error }, 'Discord bot encountered an error');
        this.isReady = false;
        reject(error);
      });
    });

    this.client.on(Events.MessageCreate, (message) => {
      this.messageHandler.handle(message);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;
      await this.messageHandler.handleButtonInteraction(interaction);
    });

    this.client.on(Events.Debug, (message) => {
      logger.debug({ message }, 'Discord debug');
    });

    this.client.on(Events.Warn, (message) => {
      logger.warn({ message }, 'Discord warning');
    });
  }

  async start() {
    try {
      logger.info('Starting Discord bot...');
      await this.client.login(config.discord.token);
      
      // Wait for ready with timeout
      await Promise.race([
        this.readyPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Discord bot connection timeout')), 30000)
        )
      ]);
      
      logger.info(`Connected to ${this.client.guilds.cache.size} guilds`);
    } catch (error) {
      logger.error({ error }, 'Failed to start Discord bot');
      this.isReady = false;
      throw error;
    }
  }

  async stop() {
    try {
      logger.info('Stopping Discord bot...');
      await this.client.destroy();
      this.isReady = false;
      logger.info('Discord bot stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping Discord bot');
      throw error;
    }
  }

  isHealthy() {
    return this.isReady && this.client.isReady();
  }

  getGuildCount(): number {
    return this.client.guilds.cache.size;
  }
}
