import { vi } from 'vitest';
import { EventEmitter } from 'events';

export interface MockUser {
  id: string;
  username: string;
  discriminator: string;
  bot: boolean;
  tag: string;
}

export interface MockChannel {
  id: string;
  type: number;
  isDMBased(): boolean;
  send(content: any): Promise<MockMessage>;
}

export interface MockMessage {
  id: string;
  content: string;
  author: MockUser;
  channel: MockChannel;
  client: MockClient;
  mentions: {
    has(user: MockUser): boolean;
  };
  reply(content: any): Promise<MockMessage>;
}

export interface MockButtonInteraction {
  customId: string;
  user: MockUser;
  channel: MockChannel | null;
  isButton(): boolean;
  reply(options: any): Promise<void>;
  followUp(options: any): Promise<void>;
  replied: boolean;
  deferred: boolean;
}

export interface MockClient extends EventEmitter {
  user: MockUser | null;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  login(token: string): Promise<string>;
  destroy(): void;
}

export class DiscordSimulator {
  private client: MockClient;
  private botUser: MockUser;
  private testUser: MockUser;
  private dmChannel: MockChannel;
  private messageId = 1;
  private interactionQueue: Array<() => void> = [];
  private messageHistory: MockMessage[] = [];
  private buttonInteractionHistory: MockButtonInteraction[] = [];

  constructor() {
    this.botUser = {
      id: 'bot-123456789',
      username: 'Book Fairy',
      discriminator: '0000',
      bot: true,
      tag: 'Book Fairy#0000'
    };

    this.testUser = {
      id: 'user-987654321',
      username: 'TestUser',
      discriminator: '1234',
      bot: false,
      tag: 'TestUser#1234'
    };

    this.dmChannel = {
      id: 'dm-channel-111',
      type: 1, // DM channel type
      isDMBased: () => true,
      send: async (content: any) => {
        const message = this.createMessage(content, this.botUser, this.dmChannel);
        this.messageHistory.push(message);
        return message;
      }
    };

    this.client = new EventEmitter() as MockClient;
    this.client.user = null;
    this.client.login = async (token: string) => {
      this.client.user = this.botUser;
      this.client.emit('ready');
      return 'ready';
    };
    this.client.destroy = () => {
      this.client.removeAllListeners();
    };
  }

  private createMessage(content: any, author: MockUser, channel: MockChannel): MockMessage {
    const messageContent = typeof content === 'string' ? content : content.content || '';
    
    const message: MockMessage = {
      id: `msg-${this.messageId++}`,
      content: messageContent,
      author,
      channel,
      client: this.client,
      mentions: {
        has: (user: MockUser) => {
          return messageContent.includes(`<@${user.id}>`) || messageContent.includes(user.username);
        }
      },
      reply: async (replyContent: any) => {
        const replyMessage = this.createMessage(replyContent, this.botUser, channel);
        this.messageHistory.push(replyMessage);
        return replyMessage;
      }
    };

    return message;
  }

  private createButtonInteraction(customId: string, user: MockUser = this.testUser): MockButtonInteraction {
    const interaction: MockButtonInteraction = {
      customId,
      user,
      channel: this.dmChannel,
      isButton: () => true,
      replied: false,
      deferred: false,
      reply: async (options: any) => {
        interaction.replied = true;
        const content = options.content || options;
        const message = this.createMessage(content, this.botUser, this.dmChannel);
        this.messageHistory.push(message);
      },
      followUp: async (options: any) => {
        const content = options.content || options;
        const message = this.createMessage(content, this.botUser, this.dmChannel);
        this.messageHistory.push(message);
      }
    };

    this.buttonInteractionHistory.push(interaction);
    return interaction;
  }

  // Simulate user sending a message
  async sendUserMessage(content: string): Promise<MockMessage> {
    const message = this.createMessage(content, this.testUser, this.dmChannel);
    this.messageHistory.push(message);
    
    // Emit message event to trigger bot handlers
    this.client.emit('messageCreate', message);
    
    // Wait for any async processing
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return message;
  }

  // Simulate user clicking a button
  async clickButton(customId: string): Promise<MockButtonInteraction> {
    const interaction = this.createButtonInteraction(customId);
    
    // Emit interaction event to trigger bot handlers
    this.client.emit('interactionCreate', interaction);
    
    // Wait for any async processing
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return interaction;
  }

  // Simulate the complete DM entry flow
  async simulateDMEntry(): Promise<MockMessage> {
    return this.sendUserMessage('Hello Book Fairy!');
  }

  // Simulate book search flow
  async simulateBookSearch(query: string, mode: 'title' | 'author' | 'genre' | 'description' = 'title'): Promise<{
    searchMessage: MockMessage;
    searchResults?: MockMessage;
    buttonInteraction?: MockButtonInteraction;
  }> {
    // First, trigger the appropriate search mode
    let buttonId: string;
    switch (mode) {
      case 'title':
        buttonId = 'search_by_title';
        break;
      case 'author':
        buttonId = 'search_by_author';
        break;
      case 'genre':
        buttonId = 'browse_genres';
        break;
      case 'description':
        buttonId = 'search_describe';
        break;
    }

    // Click the search mode button
    const buttonInteraction = await this.clickButton(buttonId);
    
    // Send the search query
    const searchMessage = await this.sendUserMessage(query);
    
    // Get the last bot response (should be search results)
    const botResponses = this.getBotResponses();
    const searchResults = botResponses[botResponses.length - 1];
    
    return {
      searchMessage,
      searchResults,
      buttonInteraction
    };
  }

  // Simulate download selection
  async simulateDownloadSelection(bookNumber: number): Promise<MockButtonInteraction> {
    return this.clickButton(`download_${bookNumber}`);
  }

  // Simulate genre browsing
  async simulateGenreBrowsing(genre: string): Promise<MockButtonInteraction> {
    return this.clickButton(`genre_${genre}`);
  }

  // Simulate checking download status
  async simulateDownloadStatusCheck(): Promise<MockButtonInteraction> {
    return this.clickButton('check_downloads');
  }

  // Simulate help request
  async simulateHelpRequest(): Promise<MockButtonInteraction> {
    return this.clickButton('show_help');
  }

  // Simulate new chat
  async simulateNewChat(): Promise<MockButtonInteraction> {
    return this.clickButton('home_new_chat');
  }

  // Get all messages from bot
  getBotResponses(): MockMessage[] {
    return this.messageHistory.filter(msg => msg.author.bot);
  }

  // Get all messages from user
  getUserMessages(): MockMessage[] {
    return this.messageHistory.filter(msg => !msg.author.bot);
  }

  // Get all button interactions
  getButtonInteractions(): MockButtonInteraction[] {
    return [...this.buttonInteractionHistory];
  }

  // Get last bot response
  getLastBotResponse(): MockMessage | undefined {
    const botResponses = this.getBotResponses();
    return botResponses[botResponses.length - 1];
  }

  // Get conversation flow as array of { type, content, timestamp }
  getConversationFlow(): Array<{
    type: 'user_message' | 'bot_response' | 'button_click';
    content: string;
    timestamp: number;
    customId?: string;
  }> {
    const flow: Array<{
      type: 'user_message' | 'bot_response' | 'button_click';
      content: string;
      timestamp: number;
      customId?: string;
    }> = [];

    // Add messages
    this.messageHistory.forEach(msg => {
      flow.push({
        type: msg.author.bot ? 'bot_response' : 'user_message',
        content: msg.content,
        timestamp: Date.now()
      });
    });

    // Add button interactions
    this.buttonInteractionHistory.forEach(interaction => {
      flow.push({
        type: 'button_click',
        content: `Button clicked: ${interaction.customId}`,
        timestamp: Date.now(),
        customId: interaction.customId
      });
    });

    return flow.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Reset for new test
  reset(): void {
    this.messageHistory = [];
    this.buttonInteractionHistory = [];
    this.messageId = 1;
    this.client.removeAllListeners();
  }

  // Check if bot showed expected greeting
  hasGreeting(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('welcome') ||
      msg.content.toLowerCase().includes('book fairy') ||
      msg.content.toLowerCase().includes('audiobook')
    );
  }

  // Check if bot showed book search menu
  hasBookSearchMenu(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('search') ||
      msg.content.toLowerCase().includes('title') ||
      msg.content.toLowerCase().includes('author')
    );
  }

  // Check if bot showed search results
  hasSearchResults(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('found') ||
      msg.content.toLowerCase().includes('results') ||
      /\d+\.\s/.test(msg.content) // Numbered list pattern
    );
  }

  // Check if bot showed download confirmation
  hasDownloadConfirmation(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('download') ||
      msg.content.toLowerCase().includes('started') ||
      msg.content.toLowerCase().includes('✅')
    );
  }

  // Check if bot showed not found message
  hasNotFoundMessage(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('couldn\'t find') ||
      msg.content.toLowerCase().includes('no results') ||
      msg.content.toLowerCase().includes('try again')
    );
  }

  // Check if bot offered alternatives
  hasAlternatives(): boolean {
    const botResponses = this.getBotResponses();
    return botResponses.some(msg => 
      msg.content.toLowerCase().includes('similar') ||
      msg.content.toLowerCase().includes('instead') ||
      msg.content.toLowerCase().includes('try')
    );
  }

  // Get mock client for tests
  getClient(): MockClient {
    return this.client;
  }

  // Get test user for tests
  getTestUser(): MockUser {
    return this.testUser;
  }

  // Get DM channel for tests
  getDMChannel(): MockChannel {
    return this.dmChannel;
  }
}

// Global instance for tests
export const discordSimulator = new DiscordSimulator();

// Vitest mock functions
export const mockDiscordClient = vi.fn().mockImplementation(() => discordSimulator.getClient());
export const mockSendMessage = vi.fn().mockImplementation(discordSimulator.sendUserMessage.bind(discordSimulator));
export const mockClickButton = vi.fn().mockImplementation(discordSimulator.clickButton.bind(discordSimulator));
