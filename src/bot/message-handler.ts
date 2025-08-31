import { Message } from 'discord.js';
import { AudiobookOrchestrator } from '../orchestrator/audiobook-orchestrator';
import { logger } from '../utils/logger';
import { BookFairyResponse, BookFairyResponseT } from '../schemas/book_fairy_response.schema';
import { needsClarification } from '../server/clarify_policy';
import { shouldAskAuthorMore } from '../server/author_guard';

export class MessageHandler {
  private orchestrator: AudiobookOrchestrator;
  private lastResponse?: BookFairyResponseT;

  constructor() {
    this.orchestrator = new AudiobookOrchestrator();
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
      // Remove bot mention and bot names from the message
      let query = message.content
        .replace(/<@!?\d+>/g, '') // Remove Discord user mentions
        .replace(/@Book\s+Fairy/gi, '') // Remove @Book Fairy mentions
        .replace(/Book\s+Fairy/gi, '') // Remove Book Fairy references
        .replace(/Magical\s+Book\s+Fairy/gi, '') // Remove full bot name
        .replace(/\bhey\b/gi, '') // Remove common greetings (word boundaries)
        .replace(/\bhi\b/gi, '')
        .replace(/\bhello\b/gi, '')
        .replace(/,/g, '') // Remove commas
        .trim();

      logger.info({ query }, 'Processing book request');

      // Check for number selection to download a specific book
      const numberMatch = query.match(/^(\d+)$/);
      if (numberMatch && this.lastResponse?.results && this.lastResponse.results.length > 0) {
        const selectedIndex = parseInt(numberMatch[1]) - 1;
        if (selectedIndex >= 0 && selectedIndex < this.lastResponse.results.length) {
          const selectedBook = this.lastResponse.results[selectedIndex];
          const downloadResult = await this.orchestrator.downloadBook(selectedBook.title);
          
          if (downloadResult.success) {
            await message.reply(`✅ Started downloading "${selectedBook.title}"! It'll be ready soon.`);
          } else {
            await message.reply(`❌ Failed to download "${selectedBook.title}": ${downloadResult.error}`);
          }
          return;
        } else {
          await message.reply(`Please choose a number between 1 and ${this.lastResponse.results.length}.`);
          return;
        }
      }

      // Check for "yes" response to previous author prompt
      if (this.lastResponse?.post_prompt && 
          /^(yes|yeah|sure|ok|okay|yep|y)$/i.test(query) &&
          this.lastResponse?.seed_book?.author) {
        query = `more books by ${this.lastResponse.seed_book.author}`;
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
      
      // Store for next turn
      this.lastResponse = validatedResponse;

      // Format response message
      let responseMsg = '';

      if (needsClarification(validatedResponse.confidence)) {
        responseMsg = validatedResponse.clarifying_question;
      } else {
        if (validatedResponse.results.length > 0) {
          // Check if this is a direct search (FIND_BY_TITLE) or similarity search
          if (validatedResponse.intent === 'FIND_BY_TITLE') {
            responseMsg = `Found ${validatedResponse.results.length} audiobook(s) for "${validatedResponse.seed_book.title}":\n\n`;
            
            // List search results with download info
            responseMsg += validatedResponse.results
              .map((book, index) => `${index + 1}. ${book.title}\n   ${book.why_similar}`)
              .join('\n\n');

            // Add download status message
            if (validatedResponse.post_prompt) {
              responseMsg += `\n\n${validatedResponse.post_prompt}`;
            }
          } else {
            // This is a similarity search
            if (validatedResponse.seed_book?.title) {
              responseMsg = `Based on ${validatedResponse.seed_book.title}, here are some suggestions:\n\n`;
            }

            // List results with similarity reasons
            responseMsg += validatedResponse.results
              .map(book => {
                const features = book.similarity_axes.slice(0, 2).join(', ');
                return `- ${book.title} by ${book.author}\n  ${book.why_similar} (matching on ${features})`;
              })
              .join('\n\n');

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
      await message.reply(responseMsg);
      logger.info({}, 'Response sent to Discord successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to handle request');
      await message.reply('Sorry, something went wrong while processing your request. Please try again.');
    }
  }
}
