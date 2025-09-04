import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, MessageFlags } from 'discord.js';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';
import { logger } from '../utils/logger';
import { BookFairyResponse, BookFairyResponseT } from '../schemas/book_fairy_response.schema';
import { needsClarification } from '../server/clarify_policy';
import { sanitizeUserContent } from '../utils/sanitize';
import { formatBook, formatBookBullet, generateGoodreadsUrl } from '../utils/goodreads';
import { downloadMonitor } from '../services/download-monitor';
import { SouthernBellePersonality_Test } from '../personality/southern-belle-test';
import { createSearchResultButtons } from '../utils/discord-ui';
import { createGenreSelectionScreen } from '../quick-actions';

/**
 * Tracks user conversation state and interaction history
 */
interface UserSession {
  /** Last Book Fairy response provided to the user */
  lastResponse?: BookFairyResponseT;
  /** Timestamp of the user's last interaction */
  lastInteractionTime?: Date;
  /** Number of searches performed in this session */
  searchCount: number;
  /** Whether search results have been displayed */
  hasShownResults: boolean;
  /** Whether a download is currently pending */
  pendingDownload?: boolean;
  /** Current page number for paginated results */
  currentPage?: number;
  /** Complete set of search results for pagination */
  allResults?: any[];
  /** Whether user is requesting detailed book information */
  moreInfoMode?: boolean;
  // New fields for button enforcement
  typingAttempts?: number;
  lastButtonInteraction?: Date;
  lastTypingAttempt?: Date;
  shouldEnforceButtons?: boolean;
}

/**
 * Main Discord message handler for the Book Fairy bot.
 * 
 * Handles all incoming Discord messages and interactions, coordinating between:
 * - User intent parsing and audiobook search (via AudiobookOrchestrator)
 * - Southern Belle personality responses (via SouthernBellePersonality)
 * - Button-based UI enforcement and session management
 * - Download monitoring and progress tracking
 * 
 * Features:
 * - Intelligent button enforcement to guide users through proper UI flow
 * - Session-based user state tracking across conversations
 * - Comprehensive error handling with graceful fallbacks
 * - Integration with Readarr, Prowlarr, and qBittorrent services
 */
export class MessageHandler {
  private orchestrator: AudiobookOrchestrator;
  private sessions = new Map<string, UserSession>();
  private personality: SouthernBellePersonality_Test;

  constructor() {
    this.orchestrator = new AudiobookOrchestrator();
    this.personality = new SouthernBellePersonality_Test();
  }

  private getSession(userId: string): UserSession {
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

  private updateSession(message: Message, response: BookFairyResponseT): void {
    const session = this.getSession(message.author.id);
    session.lastResponse = response;
    session.lastInteractionTime = new Date();
    if (response.results.length > 0) {
      session.hasShownResults = true;
      session.searchCount++;
    }
  }

  // Public method to store search results from quick actions
  public storeSearchResults(userId: string, result: any): void {
    const session = this.getSession(userId);
    session.lastResponse = result as BookFairyResponseT;
    session.lastInteractionTime = new Date();
    session.hasShownResults = true;
    session.searchCount++;
    
    // Store all results for button interactions
    if (result.allResults) {
      session.allResults = result.allResults;
    } else if (result.results) {
      session.allResults = result.results;
    }
    
    // Store pagination info
    if (result.pagination) {
      session.currentPage = result.pagination.currentPage || 0;
    }
  }

  private formatPaginatedResults(results: any[], currentPage: number, totalPages: number, totalResults: number, hasNextPage: boolean, startIndex: number): string {
    let responseMsg = `Showing ${startIndex + 1}-${startIndex + results.length} of ${totalResults} results (Page ${currentPage}/${totalPages}):\n\n`;
    
    responseMsg += results
      .map((book, index) => formatBook(book.title, book.author, startIndex + index + 1))
      .join('\n');

    if (hasNextPage) {
      responseMsg += `\n\nSay "next" to see more results, or pick a number to download!`;
    } else {
      responseMsg += `\n\nPick a number to download!`;
    }

    return responseMsg;
  }

  private createWelcomeButtons(): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Primary search options
    const searchButtons = [
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
    ];
    
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(searchButtons));
    
    // Quick actions
    const quickButtons = [
      new ButtonBuilder()
        .setCustomId('recommend_popular')
        .setLabel('🔥 Popular Books')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('recommend_new')
        .setLabel('✨ New Releases')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('check_downloads')
        .setLabel('📥 My Downloads')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('show_help')
        .setLabel('❓ Help')
        .setStyle(ButtonStyle.Secondary)
    ];
    
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(quickButtons));
    
    return rows;
  }

  private createGenreButtons(): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Popular genres
    const genreButtons1 = [
      new ButtonBuilder()
        .setCustomId('genre_fantasy')
        .setLabel('🧙 Fantasy')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('genre_scifi')
        .setLabel('🚀 Sci-Fi')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('genre_mystery')
        .setLabel('🔍 Mystery')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('genre_romance')
        .setLabel('💕 Romance')
        .setStyle(ButtonStyle.Primary)
    ];
    
    const genreButtons2 = [
      new ButtonBuilder()
        .setCustomId('genre_thriller')
        .setLabel('⚡ Thriller')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('genre_biography')
        .setLabel('👤 Biography')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('genre_history')
        .setLabel('📜 History')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('back_to_main')
        .setLabel('⬅️ Back')
        .setStyle(ButtonStyle.Secondary)
    ];
    
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(genreButtons1));
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(genreButtons2));
    
    return rows;
  }

  // Check if user should be redirected to buttons
  private shouldRedirectToButtons(userId: string, query: string): { shouldRedirect: boolean; message?: string } {
    const session = this.getSession(userId);
    
    // Don't enforce buttons for legitimate commands
    const isLegitimateCommand = this.isLegitimateTypedCommand(query, session);
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

  // Check if the typed input is a legitimate command
  private isLegitimateTypedCommand(query: string, session: UserSession): boolean {
    const legitimateCommands = [
      /^next$/i,
      /^(downloads?|status)$/i,
      /^\d+$/,
      /^(yes|yeah|sure|ok|okay|yep|y)$/i,
      /^(no|nope|n)$/i,
      /^!fairy\s+(help|cancel).*$/i  // Admin commands
    ];

    const isCommand = legitimateCommands.some(regex => regex.test(query.trim()));
    const isFirstInteraction = !session.hasShownResults && session.searchCount === 0 && !session.shouldEnforceButtons;
    const isComplexQuery = query.length > 10 && !(/^(hi|hello|hey|help|\?)$/i.test(query.trim()));
    const isSimpleGreeting = /^(hi|hello|hey|help|\?)$/i.test(query.trim());
    
    // Don't allow simple greetings if buttons have been shown
    if (session.shouldEnforceButtons && isSimpleGreeting) {
      return false;
    }
    
    // Always allow complex queries (real searches) even after buttons shown
    return isCommand || (isFirstInteraction && isComplexQuery) || (!isSimpleGreeting && isComplexQuery);
  }

  // Mark that buttons have been shown to user
  private markButtonsShown(userId: string): void {
    const session = this.getSession(userId);
    session.shouldEnforceButtons = true;
  }

  // Reset button enforcement when user uses buttons
  private resetButtonEnforcement(userId: string): void {
    const session = this.getSession(userId);
    session.typingAttempts = 0;
    session.lastButtonInteraction = new Date();
    this.personality.processButtonInteraction_test(userId);
  }

  private shouldAskForAnotherSearch(session: UserSession): boolean {
    // Only ask if they've seen results and completed an interaction, but not immediately after download
    return session.hasShownResults && session.searchCount > 0 && !session.pendingDownload;
  }

  private async handleDownloadStatus(message: Message): Promise<void> {
    const userDownloads = downloadMonitor.getUserDownloads(message.author.id);
    
    if (userDownloads.length === 0) {
      const noDownloadsMessage = "📥 You don't have any downloads being tracked right now.\n\nStart a download by searching for a book and selecting one!";
      const personalityMessage = this.personality.transformMessage_test(noDownloadsMessage, 'error');
      await message.reply(personalityMessage);
      return;
    }

    let statusMessage = "📥 **Your Download Status:**\n\n";
    
    for (const download of userDownloads) {
      const downloadTime = Math.round((Date.now() - download.startTime) / 1000 / 60); // minutes
      
      if (download.notified) {
        statusMessage += `✅ **${download.name}** - Completed\n`;
      } else {
        // Check current status
        const status = await downloadMonitor.checkDownloadStatus(download.hash);
        if (status.completed) {
          statusMessage += `🎉 **${download.name}** - Just finished!\n`;
        } else {
          statusMessage += `🔄 **${download.name}** - Downloading (${downloadTime}m)\n`;
        }
      }
    }

    const activeCount = downloadMonitor.getActiveDownloadsCount();
    if (activeCount > 0) {
      statusMessage += `\n💡 I'll notify you when your downloads complete!`;
    }

    await message.reply(statusMessage);
  }

  private async handleDownloadRequest(message: Message, session: UserSession, selectedIndex: number): Promise<void> {
    if (!session.lastResponse?.results || selectedIndex >= session.lastResponse.results.length) {
      await message.reply(`Please choose a number between 1 and ${session.lastResponse?.results?.length || 0}.`);
      return;
    }

    const selectedBook = session.lastResponse.results[selectedIndex];
    
    // Mark that a download is pending to prevent immediate re-prompting
    session.pendingDownload = true;
    
    const downloadResult = await this.orchestrator.downloadBook(
      selectedBook.title, 
      selectedBook.downloadUrl,
      message.author.id,
      message.channel.id
    );
    
    if (downloadResult.success) {
      let responseMessage = `✅ Started downloading "${selectedBook.title}"! `;
      if (downloadResult.hash) {
        responseMessage += `I'll notify you when it's finished downloading.\n\n`;
      } else {
        responseMessage += `It'll be ready soon.\n\n`;
      }
      responseMessage += `Would you like to add another book? Just ask me to search for it!`;
      
      await message.reply(responseMessage);
    } else {
      const errorMessage = `❌ Failed to download "${selectedBook.title}": ${downloadResult.error}\n\nWould you like to try another book? Just ask me to search for it!`;
      const personalityErrorMessage = this.personality.transformMessage_test(errorMessage, 'error');
      await message.reply(personalityErrorMessage);
    }
    
    // Reset the download flag after completion
    session.pendingDownload = false;
  }

  /**
   * Handles admin commands like !fairy help and !fairy cancel
   * @param message - Discord message containing the admin command
   * @param query - The full command string
   */
  private async handleAdminCommand(message: Message, query: string): Promise<void> {
    const args = query.toLowerCase().trim().split(/\s+/);
    const command = args[1]; // First arg after "!fairy"
    
    try {
      switch (command) {
        case 'help':
          await this.handleHelpCommand(message, args);
          break;
        case 'cancel':
          await this.handleCancelCommand(message, args);
          break;
        default:
          const unknownMessage = this.personality.transformMessage_test(
            "Well honey, I don't know that command. Try `!fairy help` to see what I can do for you.", 
            'error'
          );
          await message.reply(unknownMessage);
      }
    } catch (error) {
      logger.error({ error }, 'Error handling admin command');
      const errorMessage = this.personality.transformMessage_test(
        "Mercy me, somethin' went sideways with that command. Try again, darlin'.", 
        'error'
      );
      await message.reply(errorMessage);
    }
  }

  /**
   * Handles the !fairy help command
   */
  private async handleHelpCommand(messageOrInteraction: Message | ButtonInteraction, args: string[]): Promise<void> {
    const helpMessage = `**🧚‍♀️ Book Fairy Help - Southern Belle Edition**

**Basic Commands:**
• Just mention me and tell me what books you want! *(Example: "find me some fantasy books")*
• Type a number to download a book from search results
• Use the buttons - I'm much better with those, sugar! 

**Genre Browsing:**
• Type \`genres\` or \`!genres\` - Browse books by genre and timeframe
• Use \`/genres\` slash command for quick access
• All genre options are also available through my button menus!

**Admin Commands:**
• \`!fairy help\` - Show this help menu (what you're seein' now)
• \`!fairy cancel <id>\` - Cancel a download job *(coming real soon, darlin')*

**Quick Tips:**
• Type "downloads" or "status" to see what's cookin'
• Type "next" to see more search results
• I work best when you use my pretty buttons! 💅

**Need More Help?**
Contact an administrator if you're havin' trouble. I'm just a fairy, after all! ✨

*Bless your heart for askin' - now get to searchin'!* 📚`;

    const personalityMessage = this.personality.transformMessage_test(helpMessage, 'presenting');
    
    if ('reply' in messageOrInteraction && 'author' in messageOrInteraction) {
      // It's a Message
      await messageOrInteraction.reply(personalityMessage);
    } else {
      // It's a ButtonInteraction
      await (messageOrInteraction as ButtonInteraction).reply({ 
        content: personalityMessage, 
        flags: MessageFlags.Ephemeral 
      });
    }
  }

  /**
   * Handles the !fairy cancel command (placeholder for now)
   */
  private async handleCancelCommand(message: Message, args: string[]): Promise<void> {
    if (args.length < 3) {
      const helpMessage = this.personality.transformMessage_test(
        "Sugar, you need to tell me which download to cancel. Try `!fairy cancel <id>` (though I haven't learned that trick yet).", 
        'error'
      );
      await message.reply(helpMessage);
      return;
    }

    // For now, just acknowledge the command since we need download ID tracking
    const comingSoonMessage = this.personality.transformMessage_test(
      "Well bless your heart, darlin'! That feature's still cookin' in my spell book. Check back real soon!", 
      'ready'
    );
    await message.reply(comingSoonMessage);
  }

  async handleButtonInteraction(interaction: ButtonInteraction) {
    try {
      // Reset button enforcement when user uses buttons
      this.resetButtonEnforcement(interaction.user.id);
      
      const session = this.getSession(interaction.user.id);
      
      if (interaction.customId.startsWith('download_')) {
        // Extract the number from the button ID
        const selectedNumber = parseInt(interaction.customId.replace('download_', ''));
        const selectedIndex = selectedNumber - 1;
        
        // Check if we're in "more info mode"
        if (session.moreInfoMode) {
          // Show Goodreads link for the selected book
          let selectedBook;
          if (session.allResults && session.allResults.length > selectedIndex) {
            selectedBook = session.allResults[selectedIndex];
          } else if (session.lastResponse?.results && session.lastResponse.results.length > (selectedIndex % 5)) {
            selectedBook = session.lastResponse.results[selectedIndex % 5];
          }
          
          if (selectedBook) {
            const goodreadsUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(`${selectedBook.title} ${selectedBook.author}`)}`;
            await interaction.reply({ 
              content: `📖 **${selectedBook.title}** by ${selectedBook.author}\n\n${goodreadsUrl}\n\n*Click the link above to view on Goodreads*`, 
              flags: MessageFlags.Ephemeral 
            });
          } else {
            await interaction.reply({ content: 'Sorry, I couldn\'t find that book. Please try again.', flags: MessageFlags.Ephemeral });
          }
          return;
        }
        
        // Normal download mode
        // Find the correct book from all results or current page results
        let selectedBook;
        if (session.allResults && session.allResults.length > selectedIndex) {
          selectedBook = session.allResults[selectedIndex];
        } else if (session.lastResponse?.results && session.lastResponse.results.length > (selectedIndex % 5)) {
          selectedBook = session.lastResponse.results[selectedIndex % 5];
        }
        
        if (!selectedBook) {
          await interaction.reply({ content: 'Sorry, I couldn\'t find that book. Please try again.', flags: MessageFlags.Ephemeral });
          return;
        }
        
        // Mark that a download is pending
        session.pendingDownload = true;
        
        await interaction.reply({ 
          content: this.personality.transformMessage_test(`🔄 Starting download for "${selectedBook.title}"...`, 'downloading'), 
          flags: MessageFlags.Ephemeral 
        });
        
        const downloadResult = await this.orchestrator.downloadBook(
          selectedBook.title, 
          selectedBook.downloadUrl,
          interaction.user.id,
          interaction.channel?.id
        );
        
        if (downloadResult.success) {
          let responseMessage = `✅ Started downloading "${selectedBook.title}"! `;
          if (downloadResult.hash) {
            responseMessage += `I'll notify you when it's finished downloading.\n\n`;
          } else {
            responseMessage += `It'll be ready soon.\n\n`;
          }
          responseMessage += `Would you like to add another book? Just ask me to search for it!`;
          
          // Transform with personality
          responseMessage = this.personality.transformMessage_test(responseMessage, 'downloading');
          
          await interaction.followUp({ 
            content: responseMessage,
            flags: [] 
          });
        } else {
          await interaction.followUp({ 
            content: `❌ Failed to download "${selectedBook.title}": ${downloadResult.error}\n\nWould you like to try another book? Just ask me to search for it!`,
            flags: [] 
          });
        }
        
        // Reset the download flag
        session.pendingDownload = false;
        
      } else if (interaction.customId === 'next_page') {
        // Handle next page button
        if (session.allResults && session.allResults.length > 0) {
          const nextPage = (session.currentPage || 0) + 1;
          const resultsPerPage = 5;
          const startIndex = nextPage * resultsPerPage;
          
          if (startIndex < session.allResults.length) {
            session.currentPage = nextPage;
            const pageResults = session.allResults.slice(startIndex, startIndex + resultsPerPage);
            const totalPages = Math.ceil(session.allResults.length / resultsPerPage);
            const hasNextPage = startIndex + resultsPerPage < session.allResults.length;
            
            // Update session with current page results
            session.lastResponse = {
              ...session.lastResponse!,
              results: pageResults
            };
            
            const response = this.formatPaginatedResults(pageResults, nextPage + 1, totalPages, session.allResults.length, hasNextPage, startIndex);
            const buttons = createSearchResultButtons(pageResults, startIndex, hasNextPage);
            
            await interaction.reply({ 
              content: response, 
              components: buttons,
              flags: []
            });
          } else {
            await interaction.reply({ content: "You've seen all the results! Would you like to search for another book?", flags: MessageFlags.Ephemeral });
          }
        }
        
      } else if (interaction.customId === 'new_search') {
        // Reset more info mode and show welcome menu
        const session = this.getSession(interaction.user.id);
        session.moreInfoMode = false;
        
        const welcomeButtons = this.createWelcomeButtons();
        await interaction.reply({ 
          content: "🪄 **Welcome to Book Fairy!** How would you like to find your next audiobook?", 
          components: welcomeButtons,
          flags: MessageFlags.Ephemeral 
        });
        
      } else if (interaction.customId === 'search_by_title') {
        await interaction.reply({ 
          content: "📚 **Search by Title**\nPlease type the book title you're looking for:", 
          flags: MessageFlags.Ephemeral 
        });
        
      } else if (interaction.customId === 'search_by_author') {
        await interaction.reply({ 
          content: "✍️ **Search by Author**\nPlease type the author's name:", 
          flags: MessageFlags.Ephemeral 
        });
        
      } else if (interaction.customId === 'browse_genres') {
        try {
          const screen = await createGenreSelectionScreen();
          await interaction.reply({ 
            embeds: screen.embeds,
            components: screen.components,
            flags: MessageFlags.Ephemeral 
          });
        } catch (error) {
          logger.error({ error }, 'Failed to show genre selection screen');
          await interaction.reply({ 
            content: "Sorry darlin', I'm having trouble loading the genre browser right now. Please try again in a moment.", 
            flags: MessageFlags.Ephemeral 
          });
        }
        
      } else if (interaction.customId.startsWith('genre_')) {
        const genre = interaction.customId.replace('genre_', '');
        const genreMap: { [key: string]: string } = {
          'fantasy': 'fantasy books',
          'scifi': 'science fiction books',
          'mystery': 'mystery books',
          'romance': 'romance books',
          'thriller': 'thriller books',
          'biography': 'biography books',
          'history': 'history books'
        };
        
        const searchQuery = genreMap[genre] || `${genre} books`;
        await interaction.reply({ 
          content: this.personality.transformMessage_test(`🔍 Searching for ${searchQuery}...`, 'searching'), 
          flags: MessageFlags.Ephemeral 
        });
        
        // Trigger search
        const result = await this.orchestrator.handleRequest(searchQuery);
        
        if (result && 'results' in result && result.results.length > 0) {
          const validatedResponse = BookFairyResponse.parse(result);
          this.updateSession({ author: { id: interaction.user.id } } as Message, validatedResponse);
          
          // Store all results for pagination  
          const session = this.getSession(interaction.user.id);
          if (validatedResponse.results.length > 5) {
            session.allResults = validatedResponse.results;
            session.currentPage = 0;
            const firstPageResults = validatedResponse.results.slice(0, 5);
            validatedResponse.results = firstPageResults;
          }
          
          const responseMsg = `Found ${session.allResults?.length || validatedResponse.results.length} ${searchQuery}:\n\n` +
            validatedResponse.results
              .map((book, index) => formatBook(book.title, book.author, index + 1))
              .join('\n');
              
          const buttons = createSearchResultButtons(validatedResponse.results, 0, (session.allResults?.length || 0) > 5);
          
          await interaction.followUp({ 
            content: responseMsg,
            components: buttons
          });
        } else {
          const noResultsMessage = `Sorry, I couldn't find any ${searchQuery}. Try a different genre or search by title/author.`;
          await interaction.followUp({ 
            content: this.personality.transformMessage_test(noResultsMessage, 'error'),
            components: this.createWelcomeButtons()
          });
        }
        
      } else if (interaction.customId === 'recommend_popular') {
        await interaction.reply({ content: `🔍 Finding popular audiobooks...`, flags: MessageFlags.Ephemeral });
        
        const result = await this.orchestrator.handleRequest('popular audiobooks');
        // Handle similar to genre search...
        
      } else if (interaction.customId === 'recommend_new') {
        await interaction.reply({ content: `🔍 Finding new releases...`, flags: MessageFlags.Ephemeral });
        
        const result = await this.orchestrator.handleRequest('new audiobook releases');
        // Handle similar to genre search...
        
      } else if (interaction.customId === 'check_downloads') {
        const userDownloads = downloadMonitor.getUserDownloads(interaction.user.id);
        
        if (userDownloads.length === 0) {
          await interaction.reply({ 
            content: "📥 You don't have any downloads being tracked right now.\n\nStart a download by searching for a book and selecting one!",
            flags: MessageFlags.Ephemeral 
          });
          return;
        }

        let statusMessage = "📥 **Your Download Status:**\n\n";
        
        for (const download of userDownloads) {
          const downloadTime = Math.round((Date.now() - download.startTime) / 1000 / 60); // minutes
          
          if (download.notified) {
            statusMessage += `✅ **${download.name}** - Completed\n`;
          } else {
            // Check current status
            const status = await downloadMonitor.checkDownloadStatus(download.hash);
            if (status.completed) {
              statusMessage += `🎉 **${download.name}** - Just finished!\n`;
            } else {
              statusMessage += `🔄 **${download.name}** - Downloading (${downloadTime}m)\n`;
            }
          }
        }

        const activeCount = downloadMonitor.getActiveDownloadsCount();
        if (activeCount > 0) {
          statusMessage += `\n💡 I'll notify you when your downloads complete!`;
        }

        await interaction.reply({ content: statusMessage, flags: MessageFlags.Ephemeral });
        
      } else if (interaction.customId === 'show_help') {
        // Use the same help content as the !fairy help command
        await this.handleHelpCommand(interaction, ['!fairy', 'help']);
        
      } else if (interaction.customId === 'more_info') {
        // Show Goodreads links in the same format as search results
        const session = this.getSession(interaction.user.id);
        
        // Get current visible books and pagination info
        let visibleBooks: any[] = [];
        let currentPage = 1;
        let totalPages = 1;
        let totalResults = 0;
        let startIndex = 0;
        
        if (session.lastResponse?.results) {
          visibleBooks = session.lastResponse.results.slice(0, 5);
          totalResults = session.allResults?.length || visibleBooks.length;
          
          // Calculate pagination from session data
          if (session.currentPage !== undefined && session.allResults) {
            currentPage = session.currentPage + 1; // Convert from 0-based to 1-based
            totalPages = Math.ceil(session.allResults.length / 5);
            startIndex = session.currentPage * 5;
          }
        } else if (session.allResults) {
          visibleBooks = session.allResults.slice(0, 5);
          totalResults = session.allResults.length;
          totalPages = Math.ceil(session.allResults.length / 5);
        }
        
        if (visibleBooks.length === 0) {
          await interaction.reply({ 
            content: `❌ No books available to show information for. Please search for books first.`, 
            flags: MessageFlags.Ephemeral 
          });
          return;
        }
        
        // Format the message exactly like search results but for Goodreads
        let responseMsg = `📖 **Goodreads Information**\n\nShowing ${startIndex + 1}-${startIndex + visibleBooks.length} of ${totalResults} results (Page ${currentPage}/${totalPages}):\n\n`;
        
        responseMsg += visibleBooks
          .map((book, index) => formatBook(book.title, book.author, startIndex + index + 1))
          .join('\n');
        
        responseMsg += `\n\nClick a number below to view that book on Goodreads!`;
        
        // Create numbered Goodreads buttons (1-5) that mirror the download buttons
        const goodreadsButtons: ButtonBuilder[] = [];
        visibleBooks.forEach((book, index) => {
          const goodreadsUrl = generateGoodreadsUrl(book.title, book.author);
          const button = new ButtonBuilder()
            .setLabel(`${startIndex + index + 1}`)
            .setStyle(ButtonStyle.Link)
            .setURL(goodreadsUrl);
          goodreadsButtons.push(button);
        });
        
        // Create action row for numbered buttons
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(goodreadsButtons);
        
        // Add a "Back to Downloads" button
        const backToDownloadsButton = new ButtonBuilder()
          .setCustomId('back_to_downloads')
          .setLabel('📥 Back to Downloads')
          .setStyle(ButtonStyle.Secondary);
        
        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backToDownloadsButton);
        
        await interaction.reply({ 
          content: responseMsg,
          components: [actionRow, backRow],
          flags: MessageFlags.Ephemeral 
        });
        
      } else if (interaction.customId === 'back_to_downloads') {
        // Show the same search results but with download functionality
        const session = this.getSession(interaction.user.id);
        
        // Get current visible books and pagination info (same logic as More Info)
        let visibleBooks: any[] = [];
        let currentPage = 1;
        let totalPages = 1;
        let totalResults = 0;
        let startIndex = 0;
        let hasNextPage = false;
        
        if (session.lastResponse?.results) {
          visibleBooks = session.lastResponse.results.slice(0, 5);
          totalResults = session.allResults?.length || visibleBooks.length;
          
          // Calculate pagination from session data
          if (session.currentPage !== undefined && session.allResults) {
            currentPage = session.currentPage + 1; // Convert from 0-based to 1-based
            totalPages = Math.ceil(session.allResults.length / 5);
            startIndex = session.currentPage * 5;
            hasNextPage = (session.currentPage + 1) < totalPages;
          }
        } else if (session.allResults) {
          visibleBooks = session.allResults.slice(0, 5);
          totalResults = session.allResults.length;
          totalPages = Math.ceil(session.allResults.length / 5);
          hasNextPage = totalPages > 1;
        }
        
        if (visibleBooks.length === 0) {
          await interaction.reply({ 
            content: `❌ No books available. Please search for books first.`, 
            flags: MessageFlags.Ephemeral 
          });
          return;
        }
        
        // Format the message exactly like search results
        const formattedResults = this.formatPaginatedResults(visibleBooks, currentPage, totalPages, totalResults, hasNextPage, startIndex);
        const buttons = createSearchResultButtons(visibleBooks, startIndex, hasNextPage);
        
        await interaction.reply({ 
          content: formattedResults,
          components: buttons,
          flags: MessageFlags.Ephemeral 
        });
        
      } else if (interaction.customId === 'back_to_main') {
        // Reset more info mode and show welcome menu
        const session = this.getSession(interaction.user.id);
        session.moreInfoMode = false;
        
        const welcomeButtons = this.createWelcomeButtons();
        await interaction.reply({ 
          content: "🪄 **Welcome to Book Fairy!** How would you like to find your next audiobook?", 
          components: welcomeButtons,
          flags: MessageFlags.Ephemeral 
        });
      }
      
    } catch (error) {
      logger.error({ error }, 'Failed to handle button interaction');
      await interaction.reply({ content: 'Sorry, something went wrong. Please try again.', flags: MessageFlags.Ephemeral });
    }
  }

  /**
   * Main message processing method that handles all incoming Discord messages.
   * 
   * Process flow:
   * 1. Filters out bot messages and checks for bot mentions/name references
   * 2. Manages user sessions and button enforcement logic
   * 3. Sanitizes and processes user queries through the orchestrator
   * 4. Applies Southern Belle personality to responses
   * 5. Sends formatted responses with appropriate buttons and UI elements
   * 
   * Features:
   * - Smart button enforcement to guide users through proper interaction flow
   * - Session persistence across conversations with individual users
   * - Comprehensive error handling with personality-appropriate responses
   * - Support for greetings, help requests, and direct audiobook searches
   * 
   * @param message - Discord message object containing user input and metadata
   */
  async handle(message: Message) {
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

      logger.info({ query }, 'Processing book request');

      // If it's just a greeting or empty query, show welcome menu
      if (!query || query.length < 3 || /^(hi|hello|hey|help|\?)$/i.test(query.trim())) {
        const welcomeButtons = this.createWelcomeButtons();
        
        // Use personality for welcome message
        const welcomeResponse = this.personality.generateButtonTreeResponse_test('welcome');
        
        await message.reply({ 
          content: welcomeResponse.message, 
          components: welcomeButtons 
        });
        
        // Mark that buttons have been shown
        this.markButtonsShown(message.author.id);
        return;
      }

      // Handle admin commands
      if (query.startsWith('!fairy ')) {
        await this.handleAdminCommand(message, query);
        return;
      }

      // Handle genre browsing commands
      if (query.toLowerCase().match(/^(!?genres?|!?browse\s*genres?)$/)) {
        try {
          const screen = await createGenreSelectionScreen();
          const personalityMessage = this.personality.transformMessage_test(
            "Well honey, let's find you some books by genre! Pick what tickles your fancy:",
            'presenting'
          );
          await message.reply({
            content: personalityMessage,
            components: screen.components
          });
          this.markButtonsShown(message.author.id);
          return;
        } catch (error) {
          logger.error({ error }, 'Error creating genre selection screen');
          const errorMessage = this.personality.transformMessage_test(
            "Oh mercy, somethin' went wrong with the genre browser. Try again, sugar!",
            'error'
          );
          await message.reply(errorMessage);
          return;
        }
      }

      // NEW: Check if user should be redirected to buttons
      const redirectCheck = this.shouldRedirectToButtons(message.author.id, query);
      if (redirectCheck.shouldRedirect) {
        const welcomeButtons = this.createWelcomeButtons();
        
        await message.reply({
          content: redirectCheck.message,
          components: welcomeButtons
        });
        return;
      }

      // Check for "next" command to show more results
      if (query.toLowerCase() === 'next' && session.allResults && session.allResults.length > 0) {
        const nextPage = (session.currentPage || 0) + 1;
        const resultsPerPage = 5;
        const startIndex = nextPage * resultsPerPage;
        
        if (startIndex < session.allResults.length) {
          session.currentPage = nextPage;
          const pageResults = session.allResults.slice(startIndex, startIndex + resultsPerPage);
          const totalPages = Math.ceil(session.allResults.length / resultsPerPage);
          const hasNextPage = startIndex + resultsPerPage < session.allResults.length;
          
          // Update session with current page results
          session.lastResponse = {
            ...session.lastResponse!,
            results: pageResults
          };
          
          const response = this.formatPaginatedResults(pageResults, nextPage + 1, totalPages, session.allResults.length, hasNextPage, startIndex);
          const buttons = createSearchResultButtons(pageResults, startIndex, hasNextPage);
          
          await message.reply({ 
            content: response, 
            components: buttons 
          });
          return;
        } else {
          await message.reply("You've seen all the results! Would you like to search for another book?");
          return;
        }
      }

      // Check for "downloads" or "status" command to show download status
      if (/^(downloads?|status)$/i.test(query.trim())) {
        await this.handleDownloadStatus(message);
        return;
      }

      // Check for number selection to download a specific book
      const numberMatch = query.match(/^(\d+)$/);
      if (numberMatch && session.lastResponse?.results && session.lastResponse.results.length > 0) {
        const selectedIndex = parseInt(numberMatch[1]) - 1;
        await this.handleDownloadRequest(message, session, selectedIndex);
        return;
      }

      // Check for "yes" response to previous author prompt
      if (session.lastResponse?.post_prompt && 
          /^(yes|yeah|sure|ok|okay|yep|y)$/i.test(query) &&
          session.lastResponse?.seed_book?.author) {
        query = `more books by ${session.lastResponse.seed_book.author}`;
      }

      // If we get here, it's a legitimate search query - reset button enforcement
      session.shouldEnforceButtons = false;
      session.typingAttempts = 0;

      // Send searching message with personality
      const searchingMessage = this.personality.transformMessage_test(`Searching for "${query}"...`, 'searching');
      await message.reply(searchingMessage);

      const result = await this.orchestrator.handleRequest(query);
      logger.info({ result: JSON.stringify(result, null, 2) }, 'Received result from orchestrator');
      
      // Handle simple message responses
      if (result && typeof result === 'object' && 'message' in result && !('intent' in result)) {
        logger.info({ message: result.message }, 'Sending simple message response to Discord');
        await message.reply(result.message);
        return;
      }
      
      // Validate response against schema
      const validatedResponse = BookFairyResponse.parse(result);
      logger.info({ validatedResponse }, 'Response validated against schema successfully');
      
      // Update session with new response
      this.updateSession(message, validatedResponse);
      
      // Store all results for pagination
      if (validatedResponse.results.length > 5) {
        session.allResults = validatedResponse.results;
        session.currentPage = 0;
        // Show first 5 results
        const firstPageResults = validatedResponse.results.slice(0, 5);
        validatedResponse.results = firstPageResults;
      }

      // Format response message
      let responseMsg = '';

      if (needsClarification(validatedResponse.confidence)) {
        responseMsg = validatedResponse.clarifying_question;
      } else {
        if (validatedResponse.results.length > 0) {
          // Check if this is a direct search (FIND_BY_TITLE) or similarity search
          if (validatedResponse.intent === 'FIND_BY_TITLE') {
            // Update session with new results FIRST, before using them
            this.storeSearchResults(message.author.id, result);
            
            // Get the updated session to access fresh allResults
            const updatedSession = this.getSession(message.author.id);
            const totalResults = updatedSession.allResults?.length || validatedResponse.results.length;
            
            responseMsg = `Found ${totalResults} audiobook(s) for "${validatedResponse.seed_book.title}":\n\n`;
            
            // Transform the results message with personality
            responseMsg = this.personality.transformMessage_test(responseMsg, 'presenting');
            
            // Use pagination-aware formatting
            if (totalResults > 5) {
              const totalPages = Math.ceil(totalResults / 5);
              const hasNextPage = totalResults > 5;
              responseMsg = this.formatPaginatedResults(validatedResponse.results, 1, totalPages, totalResults, hasNextPage, 0);
            } else {
            // List search results with clean title + author format and Goodreads links
            responseMsg += validatedResponse.results
              .map((book, index) => formatBook(book.title, book.author, index + 1))
              .join('\n');              // Add download status message
              if (validatedResponse.post_prompt) {
                responseMsg += `\n\n${validatedResponse.post_prompt}`;
              }
            }
          } else {
            // This is a similarity search
            if (validatedResponse.seed_book?.title) {
              responseMsg = `Based on ${validatedResponse.seed_book.title}, here are some suggestions:\n\n`;
            }

            // List results with clean title + author format and Goodreads links
            responseMsg += validatedResponse.results
              .map(book => formatBookBullet(book.title, book.author))
              .join('\n');

            // Add author follow-up if appropriate
            if (validatedResponse.post_prompt) {
              responseMsg += `\n\n${validatedResponse.post_prompt}`;
            }
          }
        } else {
          const errorMessage = validatedResponse.clarifying_question || 
            "I couldn't find any matching books. Could you tell me more about what you're looking for?";
          responseMsg = this.personality.transformMessage_test(errorMessage, 'error');
        }
      }

      logger.info({ responseMsg }, 'Sending response to Discord');
      
      // Check if this is a search result that should have buttons
      if (validatedResponse.results.length > 0 && validatedResponse.intent === 'FIND_BY_TITLE') {
        const startIndex = session.currentPage ? session.currentPage * 5 : 0;
        const hasNextPage = session.allResults ? session.allResults.length > (startIndex + 5) : false;
        const buttons = createSearchResultButtons(validatedResponse.results, startIndex, hasNextPage);
        
        await message.reply({ 
          content: responseMsg, 
          components: buttons 
        });
      } else {
        await message.reply(responseMsg);
      }
      
      logger.info({}, 'Response sent to Discord successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to handle request');
      const errorMessage = 'Sorry, something went wrong while processing your request. Please try again.';
      const personalityErrorMessage = this.personality.transformMessage_test(errorMessage, 'error');
      await message.reply(personalityErrorMessage);
    }
  }

  // Test compatibility methods - provide expected interface for tests
  async handleMessage(message: Message) {
    return this.handle(message);
  }

  async handleInteraction(interaction: ButtonInteraction) {
    return this.handleButtonInteraction(interaction);
  }
}
