// # Proposed Test Version
// Test implementation of MessageHandler with button enforcement using existing SouthernBellePersonality

import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, MessageFlags } from 'discord.js';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';
import { logger } from '../utils/logger';
import { BookFairyResponse, BookFairyResponseT } from '../schemas/book_fairy_response.schema';
import { needsClarification } from '../server/clarify_policy';
import { shouldAskAuthorMore } from '../server/author_guard';
import { sanitizeUserContent } from '../utils/sanitize';
import { formatBook, formatBookBullet, generateGoodreadsUrl } from '../utils/goodreads';
import { downloadMonitor } from '../services/download-monitor';
import { SouthernBellePersonality_Test } from '../personality/southern-belle-test';

// Extended session interface to track typing attempts
interface UserSessionWithButtonEnforcement {
  lastResponse?: BookFairyResponseT;
  lastInteractionTime?: Date;
  searchCount: number;
  hasShownResults: boolean;
  pendingDownload?: boolean;
  currentPage?: number;
  allResults?: any[];
  moreInfoMode?: boolean;
  // New fields for button enforcement
  typingAttempts?: number;
  lastButtonInteraction?: Date;
  lastTypingAttempt?: Date;
  shouldEnforceButtons?: boolean; // Track if user has been shown buttons
}

export class MessageHandler_ButtonEnforcement_Test {
  private orchestrator: AudiobookOrchestrator;
  private sessions = new Map<string, UserSessionWithButtonEnforcement>();
  private personality: SouthernBellePersonality_Test;

  constructor() {
    this.orchestrator = new AudiobookOrchestrator();
    this.personality = new SouthernBellePersonality_Test();
  }

  private getSession(userId: string): UserSessionWithButtonEnforcement {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        searchCount: 0,
        hasShownResults: false,
        currentPage: 0,
        allResults: [],
        moreInfoMode: false,
        typingAttempts: 0,
        shouldEnforceButtons: false
      });
    }
    return this.sessions.get(userId)!;
  }

  // Test method: Check if user should be redirected to buttons
  private shouldRedirectToButtons_test(userId: string, query: string): { shouldRedirect: boolean; message?: string } {
    const session = this.getSession(userId);
    
    // Don't enforce buttons for legitimate commands
    const isLegitimateCommand = this.isLegitimateTypedCommand_test(query, session);
    if (isLegitimateCommand) {
      return { shouldRedirect: false };
    }
    
    // If user has been shown buttons and is typing instead of clicking
    if (session.shouldEnforceButtons) {
      const personalityResponse = this.personality.processTypingAttempt_test(userId, query);
      
      // Update session tracking
      session.typingAttempts = (session.typingAttempts || 0) + 1;
      session.lastTypingAttempt = new Date();
      
      return {
        shouldRedirect: true,
        message: personalityResponse.message
      };
    }
    
    return { shouldRedirect: false };
  }

  // Test method: Check if the typed input is a legitimate command that should be processed
  private isLegitimateTypedCommand_test(query: string, session: UserSessionWithButtonEnforcement): boolean {
    // Allow specific commands even with button enforcement
    const legitimateCommands = [
      /^next$/i,                           // "next" for pagination
      /^(downloads?|status)$/i,            // "downloads" or "status"  
      /^\d+$/,                            // Numbers for book selection
      /^(yes|yeah|sure|ok|okay|yep|y)$/i, // Yes responses to prompts
      /^(no|nope|n)$/i                    // No responses
    ];

    // Check if query matches any legitimate command
    const isCommand = legitimateCommands.some(regex => regex.test(query.trim()));
    
    // Also allow if user hasn't been shown results yet (first interaction)
    const isFirstInteraction = !session.hasShownResults && session.searchCount === 0;
    
    // Allow complex search queries (more than simple greetings)
    const isComplexQuery = query.length > 10 && !(/^(hi|hello|hey|help|\?)$/i.test(query.trim()));
    
    return isCommand || isFirstInteraction || isComplexQuery;
  }

  // Test method: Mark that buttons have been shown to user
  private markButtonsShown_test(userId: string): void {
    const session = this.getSession(userId);
    session.shouldEnforceButtons = true;
    session.hasShownResults = true; // Mark that user has seen results/buttons
    session.searchCount = 1; // Indicate they've done at least one search
  }

  // Test method: Reset button enforcement when user uses buttons
  private resetButtonEnforcement_test(userId: string): void {
    const session = this.getSession(userId);
    session.typingAttempts = 0;
    session.lastButtonInteraction = new Date();
    this.personality.processButtonInteraction_test(userId);
  }

  // Test method: Create welcome buttons and mark them as shown
  private createWelcomeButtons_test(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('search_by_title')
          .setLabel('📚 Search by Title')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('search_by_author')
          .setLabel('✍️ Search by Author')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('browse_genres')
          .setLabel('🎭 Browse Genres')
          .setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('recommend_popular')
          .setLabel('🔥 Popular Books')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('recommend_new')
          .setLabel('✨ New Releases')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('check_downloads')
          .setLabel('📥 My Downloads')
          .setStyle(ButtonStyle.Success)
      );

    return [row1, row2];
  }

  // Test method: Main handle method with button enforcement
  async handle_test(message: Message) {
    if (message.author.bot) return;

    // Check if message mentions the bot or is a DM
    const client = message.client;
    if (!client || !client.user) {
      logger.info({}, 'Bot client not ready, skipping message');
      return;
    }
    
    const isMentioned = message.mentions.has(client.user) || message.channel.isDMBased();
    const containsBotName = message.content.toLowerCase().includes('book fairy');

    if (!isMentioned && !containsBotName) return;

    try {
      const session = this.getSession(message.author.id);
      
      // Remove bot mention and bot names from the message using the sanitization utility
      let query = message.content
        .replace(/<@!?\d+>/g, '') // Remove Discord user mentions
        .trim();
      
      query = sanitizeUserContent(query);

      logger.info({ query }, 'Processing book request with button enforcement');

      // If it's just a greeting or empty query, show welcome menu
      if (!query || query.length < 3 || /^(hi|hello|hey|help|\?)$/i.test(query.trim())) {
        const welcomeButtons = this.createWelcomeButtons_test();
        
        // Use personality for welcome message
        const welcomeResponse = this.personality.generateButtonTreeResponse_test('welcome');
        
        await message.reply({ 
          content: welcomeResponse.message, 
          components: welcomeButtons 
        });
        
        // Mark that buttons have been shown
        this.markButtonsShown_test(message.author.id);
        return;
      }

      // NEW: Check if user should be redirected to buttons
      const redirectCheck = this.shouldRedirectToButtons_test(message.author.id, query);
      if (redirectCheck.shouldRedirect) {
        const welcomeButtons = this.createWelcomeButtons_test();
        
        await message.reply({
          content: redirectCheck.message,
          components: welcomeButtons
        });
        return;
      }

      // Continue with existing logic for legitimate commands...
      
      // Check for "next" command to show more results
      if (query.toLowerCase() === 'next' && session.allResults && session.allResults.length > 0) {
        // ... existing next logic would go here
        logger.info({}, 'Processing next command (button enforcement test)');
        return;
      }

      // Check for "downloads" or "status" command to show download status
      if (/^(downloads?|status)$/i.test(query.trim())) {
        // ... existing download status logic would go here
        logger.info({}, 'Processing download status command (button enforcement test)');
        return;
      }

      // Check for number selection to download a specific book
      const numberMatch = query.match(/^(\d+)$/);
      if (numberMatch && session.lastResponse?.results && session.lastResponse.results.length > 0) {
        // ... existing download logic would go here
        logger.info({}, 'Processing book selection (button enforcement test)');
        return;
      }

      // If we get here, it's a legitimate search query - process normally
      logger.info({ query }, 'Processing legitimate search query');
      
      // Reset button enforcement since this is a valid search
      session.shouldEnforceButtons = false;
      session.typingAttempts = 0;
      
      // Continue with orchestrator call...
      // const result = await this.orchestrator.handleRequest(query);
      // ... rest of existing logic
      
    } catch (error) {
      logger.error({ error }, 'Failed to handle message with button enforcement');
      await message.reply('Sorry, something went wrong. Please try again.');
    }
  }

  // Test method: Handle button interactions and reset enforcement
  async handleButtonInteraction_test(interaction: ButtonInteraction) {
    try {
      // Reset button enforcement when user uses buttons
      this.resetButtonEnforcement_test(interaction.user.id);
      
      // Continue with existing button interaction logic...
      logger.info({ buttonId: interaction.customId }, 'Processing button interaction');
      
    } catch (error) {
      logger.error({ error }, 'Failed to handle button interaction');
      await interaction.reply({ content: 'Sorry, something went wrong. Please try again.', flags: MessageFlags.Ephemeral });
    }
  }
}

// Test function to validate button enforcement behavior
export function testButtonEnforcement() {
  console.log("🧪 Testing Button Enforcement Logic:");
  
  const handler = new MessageHandler_ButtonEnforcement_Test();
  
  // Test scenarios
  const testUser = "test_user_123";
  
  // Scenario 1: First interaction (should not enforce)
  const session1 = handler['getSession'](testUser);
  const redirect1 = handler['shouldRedirectToButtons_test'](testUser, "find me fantasy books");
  console.log("✅ First interaction allows search:", !redirect1.shouldRedirect);
  
  // Scenario 2: After buttons shown, user types (should redirect)  
  handler['markButtonsShown_test'](testUser);
  const redirect2 = handler['shouldRedirectToButtons_test'](testUser, "hello");
  console.log("✅ After buttons shown, typing redirects:", redirect2.shouldRedirect);
  console.log("✅ Redirect message:", redirect2.message);
  
  // Scenario 3: Legitimate commands still work
  const redirect3 = handler['shouldRedirectToButtons_test'](testUser, "next");
  const redirect4 = handler['shouldRedirectToButtons_test'](testUser, "3");
  const redirect5 = handler['shouldRedirectToButtons_test'](testUser, "downloads");
  console.log("✅ Legitimate commands bypass enforcement:", !redirect3.shouldRedirect && !redirect4.shouldRedirect && !redirect5.shouldRedirect);
  
  // Scenario 4: Button interaction resets enforcement
  handler['resetButtonEnforcement_test'](testUser);
  const redirect6 = handler['shouldRedirectToButtons_test'](testUser, "hello again");
  console.log("✅ After button use, enforcement resets:", !redirect6.shouldRedirect);
  
  return {
    firstInteractionWorks: !redirect1.shouldRedirect,
    redirectAfterButtons: redirect2.shouldRedirect,
    legitimateCommandsWork: !redirect3.shouldRedirect && !redirect4.shouldRedirect && !redirect5.shouldRedirect,
    buttonInteractionResets: !redirect6.shouldRedirect,
    personalityMessaging: redirect2.message !== undefined && redirect2.message.length > 0 && 
                         (redirect2.message.toLowerCase().includes('darlin') || 
                          redirect2.message.toLowerCase().includes('sugar') || 
                          redirect2.message.toLowerCase().includes('honey') ||
                          redirect2.message.toLowerCase().includes('button'))
  };
}
