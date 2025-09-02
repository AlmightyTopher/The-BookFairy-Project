import { logger } from '../utils/logger';
import { formatBook, formatBookBullet } from '../utils/goodreads';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';
import { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { MessageHandler } from '../bot/message-handler';
import { createSearchResultButtons } from '../utils/discord-ui';

interface UserQueryPayload {
  userId: string;
  username: string;
  channelId: string;
  text: string;
  source: string;
}

// Create a singleton orchestrator for quick actions
const orchestrator = new AudiobookOrchestrator();
let discordClient: Client | null = null;
let messageHandler: MessageHandler | null = null;

export function setDiscordClient(client: Client): void {
  discordClient = client;
}

export function setMessageHandler(handler: MessageHandler): void {
  messageHandler = handler;
}

export async function dispatchUserQuery(payload: UserQueryPayload): Promise<void> {
  try {
    logger.info({ payload }, 'Dispatching user query from quick actions');
    
    // Check if this is an author search and send immediate feedback
    const isAuthorSearch = payload.text.toLowerCase().includes('find books by author');
    if (isAuthorSearch && discordClient) {
      logger.info({ channelId: payload.channelId }, 'Sending author search feedback message');
      try {
        const channel = await discordClient.channels.fetch(payload.channelId);
        if (channel && 'send' in channel) {
          await channel.send('Please wait. I\'m searching for books by that author...');
          logger.info({}, 'Successfully sent author search feedback message');
        } else {
          logger.warn({ channelType: channel?.type }, 'Channel cannot send messages');
        }
      } catch (error) {
        logger.error({ error }, 'Failed to send author search feedback message');
      }
    } else if (isAuthorSearch) {
      logger.warn({}, 'Author search detected but Discord client not available');
    }
    
    // Process the query directly through the orchestrator
    const result = await orchestrator.handleRequest(payload.text);
    
    // Send the result back to Discord if we have a client
    if (discordClient && result) {
      logger.info({ hasResult: !!result, resultType: typeof result }, 'Attempting to send result to Discord');
      try {
        const channel = await discordClient.channels.fetch(payload.channelId);
        
        if (channel && 'send' in channel) {
          // Format the result for Discord
          let response = '';
          
          if (typeof result === 'object' && result) {
            if ('message' in result && result.message) {
              // Simple message response
              response = result.message;
            } else if ('intent' in result && (result.intent === 'AUTHOR_BIBLIOGRAPHY' || result.intent === 'AUTHOR_SEARCH')) {
              // Goodreads author search response
              response = result.clarifying_question || `Found author information for "${result.seed_book?.author || payload.text}"`;
            } else if ('results' in result && result.results && result.results.length > 0) {
              // Search results with pagination support
              if (result.intent === 'FIND_BY_TITLE') {
                // Show pagination info if available (using any type for flexibility)
                const paginationInfo = (result as any).pagination ? 
                  ` (Page ${(result as any).pagination.currentPage + 1} of ${(result as any).pagination.totalPages})` : '';
                const totalCount = (result as any).pagination?.totalResults || result.results.length;
                
                response = `Found ${totalCount} audiobook(s) for "${result.seed_book?.title || payload.text}"${paginationInfo}:\n\n`;
                
                // Number the results based on current page
                const startNumber = (result as any).pagination ? ((result as any).pagination.currentPage * 5) + 1 : 1;
                response += result.results
                  .map((book: any, index: number) => formatBook(book.title, book.author, startNumber + index))
                  .join('\n');
              } else {
                response = `Based on your search, here are some suggestions:\n\n`;
                response += result.results
                  .map((book: any) => formatBookBullet(book.title, book.author))
                  .join('\n');
              }
              
              // Add custom post prompt (includes pagination instructions)
              if ((result as any).post_prompt) {
                response += `\n\n${(result as any).post_prompt}`;
              } else if (result.results.length > 0) {
                response += '\n\nType a number to download, or continue searching!';
              }
            } else if ('clarifying_question' in result && result.clarifying_question) {
              response = result.clarifying_question;
            }
          } else {
            response = String(result);
          }
          
          if (response) {
            logger.info({ responseLength: response.length, channelId: payload.channelId }, 'Sending response to Discord');
            
            // Check if this is a search result that should have buttons
            if (result && typeof result === 'object' && 'results' in result && result.results && result.results.length > 0) {
              const pagination = (result as any).pagination;
              const startIndex = pagination ? (pagination.currentPage * 5) : 0;
              const hasNextPage = pagination ? pagination.hasNextPage : false;
              const buttons = createSearchResultButtons(result.results, startIndex, hasNextPage);
              
              // Store the search results in the user session so button clicks can access them
              if (messageHandler) {
                messageHandler.storeSearchResults(payload.userId, result);
              }
              
              await channel.send({ 
                content: response, 
                components: buttons 
              });
            } else {
              await channel.send(response);
            }
            
            logger.info({}, 'Successfully sent response to Discord');
          } else {
            logger.warn({ result }, 'Generated empty response, not sending');
          }
        }
      } catch (error) {
        logger.error({ error, payload }, 'Failed to send result back to Discord');
      }
    }
    
    // Log the result for debugging
    logger.info({ result, source: payload.source }, 'Quick actions query processed');
    
  } catch (error) {
    logger.error({ error, payload }, 'Failed to dispatch user query');
    
    // Send error message back to Discord if possible
    if (discordClient) {
      try {
        const channel = await discordClient.channels.fetch(payload.channelId);
        if (channel && 'send' in channel) {
          await channel.send('Sorry, something went wrong while processing your request. Please try again.');
        }
      } catch (sendError) {
        logger.error({ sendError }, 'Failed to send error message back to Discord');
      }
    }
  }
}
