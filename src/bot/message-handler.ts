import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, MessageFlags } from 'discord.js';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';
import { logger } from '../utils/logger';
import { BookFairyResponse, BookFairyResponseT } from '../schemas/book_fairy_response.schema';
import { needsClarification } from '../server/clarify_policy';
import { shouldAskAuthorMore } from '../server/author_guard';
import { sanitizeUserContent } from '../utils/sanitize';
import { formatBook, formatBookBullet, generateGoodreadsUrl } from '../utils/goodreads';

interface UserSession {
  lastResponse?: BookFairyResponseT;
  lastInteractionTime?: Date;
  searchCount: number;
  hasShownResults: boolean;
  pendingDownload?: boolean;
  currentPage?: number;
  allResults?: any[];
  moreInfoMode?: boolean; // Track if user is in "more info" mode
}

export class MessageHandler {
  private orchestrator: AudiobookOrchestrator;
  private sessions = new Map<string, UserSession>();

  constructor() {
    this.orchestrator = new AudiobookOrchestrator();
  }

  private getSession(userId: string): UserSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        searchCount: 0,
        hasShownResults: false,
        currentPage: 0,
        allResults: [],
        moreInfoMode: false
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
        .setStyle(ButtonStyle.Success)
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

  private createSearchResultButtons(results: any[], startIndex: number, hasNextPage: boolean): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Create numbered buttons for up to 5 results (Discord's limit per row)
    const buttons: ButtonBuilder[] = [];
    for (let i = 0; i < Math.min(results.length, 5); i++) {
      const buttonNumber = startIndex + i + 1;
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`download_${buttonNumber}`)
          .setLabel(`${buttonNumber}`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    // Add buttons to row
    if (buttons.length > 0) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons));
    }
    
    // Add navigation buttons if needed
    const navButtons: ButtonBuilder[] = [];
    
    if (hasNextPage) {
      navButtons.push(
        new ButtonBuilder()
          .setCustomId('next_page')
          .setLabel('Next')
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('more_info')
        .setLabel('📖 More Info')
        .setStyle(ButtonStyle.Secondary)
    );
    
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('new_search')
        .setLabel('New Search')
        .setStyle(ButtonStyle.Success)
    );
    
    if (navButtons.length > 0) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(navButtons));
    }
    
    return rows;
  }

  private shouldAskForAnotherSearch(session: UserSession): boolean {
    // Only ask if they've seen results and completed an interaction, but not immediately after download
    return session.hasShownResults && session.searchCount > 0 && !session.pendingDownload;
  }

  private async handleDownloadRequest(message: Message, session: UserSession, selectedIndex: number): Promise<void> {
    if (!session.lastResponse?.results || selectedIndex >= session.lastResponse.results.length) {
      await message.reply(`Please choose a number between 1 and ${session.lastResponse?.results?.length || 0}.`);
      return;
    }

    const selectedBook = session.lastResponse.results[selectedIndex];
    
    // Mark that a download is pending to prevent immediate re-prompting
    session.pendingDownload = true;
    
    const downloadResult = await this.orchestrator.downloadBook(selectedBook.title, selectedBook.downloadUrl);
    
    if (downloadResult.success) {
      await message.reply(`✅ Started downloading "${selectedBook.title}"! It'll be ready soon.\n\nWould you like to add another book? Just ask me to search for it!`);
    } else {
      await message.reply(`❌ Failed to download "${selectedBook.title}": ${downloadResult.error}\n\nWould you like to try another book? Just ask me to search for it!`);
    }
    
    // Reset the download flag after completion
    session.pendingDownload = false;
  }

  async handleButtonInteraction(interaction: ButtonInteraction) {
    try {
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
        
        await interaction.reply({ content: `🔄 Starting download for "${selectedBook.title}"...`, flags: MessageFlags.Ephemeral });
        
        const downloadResult = await this.orchestrator.downloadBook(selectedBook.title, selectedBook.downloadUrl);
        
        if (downloadResult.success) {
          await interaction.followUp({ 
            content: `✅ Started downloading "${selectedBook.title}"! It'll be ready soon.\n\nWould you like to add another book? Just ask me to search for it!`,
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
            const buttons = this.createSearchResultButtons(pageResults, startIndex, hasNextPage);
            
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
        const genreButtons = this.createGenreButtons();
        await interaction.reply({ 
          content: "🎭 **Browse by Genre**\nChoose a genre you're interested in:", 
          components: genreButtons,
          flags: MessageFlags.Ephemeral 
        });
        
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
        await interaction.reply({ content: `🔍 Searching for ${searchQuery}...`, flags: MessageFlags.Ephemeral });
        
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
              
          const buttons = this.createSearchResultButtons(validatedResponse.results, 0, (session.allResults?.length || 0) > 5);
          
          await interaction.followUp({ 
            content: responseMsg,
            components: buttons
          });
        } else {
          await interaction.followUp({ 
            content: `Sorry, I couldn't find any ${searchQuery}. Try a different genre or search by title/author.`,
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
        
      } else if (interaction.customId === 'more_info') {
        // Toggle "more info mode" and update the message
        const session = this.getSession(interaction.user.id);
        session.moreInfoMode = !session.moreInfoMode;
        
        if (session.moreInfoMode) {
          // Show instructions for info mode
          await interaction.reply({ 
            content: `📖 **Information Mode Activated**\n\nNow click any number (1-5) to view Goodreads information for that book instead of downloading.\n\n*Click "📖 More Info" again to return to download mode.*`, 
            flags: MessageFlags.Ephemeral 
          });
        } else {
          // Back to download mode
          await interaction.reply({ 
            content: `📥 **Download Mode Activated**\n\nNow click any number (1-5) to download that book.\n\n*Click "📖 More Info" to view book information instead.*`, 
            flags: MessageFlags.Ephemeral 
          });
        }
        
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
        await message.reply({ 
          content: "🪄 **Welcome to Book Fairy!** I help you find and download audiobooks.\n\nHow would you like to find your next audiobook?", 
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
          const buttons = this.createSearchResultButtons(pageResults, startIndex, hasNextPage);
          
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
          responseMsg = validatedResponse.clarifying_question || 
            "I couldn't find any matching books. Could you tell me more about what you're looking for?";
        }
      }

      logger.info({ responseMsg }, 'Sending response to Discord');
      
      // Check if this is a search result that should have buttons
      if (validatedResponse.results.length > 0 && validatedResponse.intent === 'FIND_BY_TITLE') {
        const startIndex = session.currentPage ? session.currentPage * 5 : 0;
        const hasNextPage = session.allResults ? session.allResults.length > (startIndex + 5) : false;
        const buttons = this.createSearchResultButtons(validatedResponse.results, startIndex, hasNextPage);
        
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
      await message.reply('Sorry, something went wrong while processing your request. Please try again.');
    }
  }
}
