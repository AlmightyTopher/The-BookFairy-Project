import { classifyIntent } from '../llm/intent-classifier';
import { parseWithRules } from '../llm/rule-parser';
import { searchReadarr, addBookToReadarr } from '../clients/readarr-client';
import { searchProwlarr } from '../clients/prowlarr-client';
import { addTorrent } from '../clients/qbittorrent-client';
import { logger } from '../utils/logger';
import { SpellChecker } from '../utils/spell-checker';
import { HealthStatus, AudiobookRequest } from '../types/schemas';
import { BookFairyResponseT } from '../schemas/book_fairy_response.schema';
import { checkOllamaHealth } from '../llm/ollama-client';
import { BookSimilarityEngine, SimilarityMatch, BookProfile } from '../utils/book-similarity';
import { ReadarrBook, ReadarrSearchResult } from '../types/readarr';
import { checkReadarrHealth } from '../clients/readarr-client';
import { checkProwlarrHealth } from '../clients/prowlarr-client';
import { checkQbittorrentHealth } from '../clients/qbittorrent-client';

export class AudiobookOrchestrator {
  async handleRequest(query: string) {
    logger.info({ query }, 'Processing request through LLM');
    
    // Quick check for "similar to" patterns before going to LLM
    if (query.match(/(?:similar|like)\s+(?:to\s+)?/i)) {
      const title = this.extractBookTitleFromSimilarRequest(query);
      return this.findSimilarBooks({ 
        title,
        author: '',
        format: 'audiobook',
        language: 'en',
        quality: 'any'
      });
    }
    
    // Quick check for simple "find X" patterns to bypass LLM entirely
    const simpleSearchMatch = query.match(/^(?:find|get|search for|download|look for)\s+(.+?)(?:\s+by\s+(.+?))?$/i);
    if (simpleSearchMatch) {
      let title = simpleSearchMatch[1].trim();
      const author = simpleSearchMatch[2]?.trim();
      
      // Apply spell corrections for common book titles
      const originalTitle = title;
      title = SpellChecker.correctSpelling(title);
      
      // Log if significant corrections were made
      if (SpellChecker.wasSignificantCorrection(originalTitle, title)) {
        logger.info({ originalTitle, correctedTitle: title }, 'Applied intelligent spell correction');
      }
      
      // If no author specified, try to intelligently extract from common book titles
      let finalAuthor = author || 'Unknown';
      if (!author) {
        // Try to extract author from common patterns
        const commonBooks: Record<string, string> = {
          'harry potter': 'J.K. Rowling',
          'dune': 'Frank Herbert',
          'lord of the rings': 'J.R.R. Tolkien',
          'game of thrones': 'George R.R. Martin',
          'song of ice and fire': 'George R.R. Martin',
          'wheel of time': 'Robert Jordan',
          'mistborn': 'Brandon Sanderson',
          'stormlight': 'Brandon Sanderson',
          'foundation': 'Isaac Asimov',
          'ender': 'Orson Scott Card',
          'hitchhiker': 'Douglas Adams',
          'chronicles of narnia': 'C.S. Lewis',
          'narnia': 'C.S. Lewis'
        };
        
        const titleLower = title.toLowerCase();
        for (const [bookKey, bookAuthor] of Object.entries(commonBooks)) {
          if (titleLower.includes(bookKey)) {
            finalAuthor = bookAuthor;
            break;
          }
        }
      }
      
      logger.info({ title, author: finalAuthor }, 'Using fast path for simple search pattern');
      return this.processAudiobookRequest({
        title,
        author: finalAuthor,
        format: 'audiobook',
        language: 'en',
        quality: 'any'
      });
    }
    
    let intent;
    try {
      intent = await classifyIntent(query);
      logger.info({ intent }, 'Classified intent');
    } catch (error) {
      logger.error({ error }, 'LLM intent classification failed, falling back to rules');
      intent = parseWithRules(query);
    }

    if (intent.intent === 'search_audiobook') {
      // If we have extracted info with no title but an author, search by author
      if (intent.extracted && !intent.extracted.title && intent.extracted.author) {
        // Searching for more books by an author
        const searchResults = await searchReadarr(intent.extracted.author);
        if (searchResults?.length > 0) {
          const booksByAuthor = searchResults
            .filter((book: ReadarrBook) => 
              book.authorName?.toLowerCase().includes(intent.extracted!.author.toLowerCase())
            )
            .map((book: ReadarrBook) => `- ${book.title}`);

          if (booksByAuthor.length > 0) {
            return {
              message: `Here are some books by ${intent.extracted.author}:\n${booksByAuthor.join('\n')}\n\nWould you like me to look for any of these as audiobooks?`
            };
          }
        }
        return {
          message: `I couldn't find any books by ${intent.extracted.author}. Could you confirm the author's name?`
        };
      }
      
      // Handle regular book requests
      if (intent.extracted) {
        if (query.toLowerCase().includes('similar to') || query.toLowerCase().includes('like')) {
          return this.findSimilarBooks(intent.extracted);
        }
        return this.processAudiobookRequest(intent.extracted);
      }
    } else if (intent.intent === 'help') {
      return {
        message: "Hello! I'm your friendly Book Fairy. Here's what I can help you with:\n\n" +
                 "🔍 Find audiobooks - Just ask for a book by title and/or author\n" +
                 "📚 Find similar books - Ask for books similar to your favorites\n" +
                 "👥 More by author - Ask for more books by your favorite authors\n\n" +
                 "For example, try:\n" +
                 "- \"Find Dune by Frank Herbert\"\n" +
                 "- \"What books are similar to The Hobbit?\"\n" +
                 "- \"More books by Brandon Sanderson\""
      };
    }

    // Handle unknown intents
    return {
      message: "I understand you're looking for a book. Could you tell me the title or author you're interested in?"
    };
  }

  private extractBookTitleFromSimilarRequest(query: string): string {
    const similarPatterns = [
      /(?:similar|like|recommendations?\s+for)\s+(?:to\s+)?["']?([^"']+?)["']?\s*$/i,
      /find.*(?:similar|like)\s+(?:to\s+)?["']?([^"']+?)["']?\s*$/i,
      /(?:books?|audiobooks?)\s+(?:similar|like)\s+(?:to\s+)?["']?([^"']+?)["']?\s*$/i
    ];

    for (const pattern of similarPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return query.trim();
  }

  private async findSimilarBooks(request: AudiobookRequest) {
    const bookTitle = this.extractBookTitleFromSimilarRequest(request.title);
    logger.info({ bookTitle }, 'Finding similar books');

    try {
      // Default seed book profile for known books
      const seedBookProfiles: Record<string, Partial<BookProfile>> = {
        'dune': {
          title: 'Dune',
          author: 'Frank Herbert',
          genre: 'science fiction',
          subgenres: ['space opera', 'political sci-fi', 'ecological sci-fi'],
          themes: ['politics', 'ecology', 'destiny', 'survival', 'religion', 'power'],
          tone_style: ['epic', 'philosophical', 'complex'],
          notable_features: ['multiple POV', 'extensive worldbuilding', 'political intrigue'],
          audience: 'adult',
          format: 'novel'
        }
      };

      // Search for the book in Prowlarr first for availability
      const prowlarrResults = await searchProwlarr(bookTitle, {
        preferredFormat: 'M4B',
        fallbackToMP3: true,
        language: 'ENG',
        minSeeders: 2
      });

      // Get the seed book details from Readarr
      const readarrResults = await searchReadarr(bookTitle);
      if (!readarrResults?.length) {
        const exactMatch = prowlarrResults.results?.find(result => 
          result.title.toLowerCase().includes(bookTitle.toLowerCase())
        );

        if (exactMatch) {
          return {
            message: `I found "${exactMatch.title}" as an audiobook! Would you like me to download it?`
          };
        }

        return {
          message: `I couldn't find detailed information about "${bookTitle}". Could you tell me more about what kind of books you enjoy? For example, what genres or themes interest you?`
        };
      }

      // Find the seed book in Readarr results
      const seedBookData = readarrResults.find((book: ReadarrBook) => 
        book.title.toLowerCase().includes(bookTitle.toLowerCase())
      );

      if (!seedBookData) {
        return {
          message: `I couldn't find detailed information about "${bookTitle}". Could you tell me more about what kind of books you enjoy?`
        };
      }

      // Create book profiles for similarity matching
      const seedProfile = BookSimilarityEngine.profileFromReadarrBook(seedBookData);
      const candidateProfiles = readarrResults
        .filter((book: ReadarrBook) => book.language?.toLowerCase() === 'eng')
        .map((book: ReadarrBook) => BookSimilarityEngine.profileFromReadarrBook(book));

      // Find similar books
      const similarBooks = BookSimilarityEngine.findSimilarBooks(seedProfile, candidateProfiles);

      // Build the BookFairy response
      return {
        intent: 'FIND_SIMILAR' as const,
        confidence: 0.9,
        seed_book: {
          title: seedProfile.title,
          author: seedProfile.author,
          series: '',
          isbn: '',
          publisher: '',
          year: '',
          audience: seedProfile.audience || 'adult',
          format: seedProfile.format || 'novel',
          genre: seedProfile.genre || '',
          subgenres: seedProfile.subgenres || [],
          themes: seedProfile.themes || [],
          tone_style: seedProfile.tone_style || [],
          notable_features: seedProfile.notable_features || []
        },
        similarity_rules_applied: {
          matched_axes: ['genre', 'audience', 'themes', 'tone_style', 'structure'],
          min_required_axes: 2
        },
        filters: {
          audience_lock: true,
          format_lock: true,
          exclude: ['comics_if_seed_is_not_comics', 'YA_if_seed_is_not_YA']
        },
        clarifying_question: similarBooks.length === 0 
          ? "I couldn't find any books similar to your request. Could you tell me more about what aspects you enjoy - for example, the themes, style, or genre?" 
          : '',
        results: similarBooks.map((book: SimilarityMatch) => ({
          title: book.title,
          author: book.author,
          genre: book.genre,
          subgenre: book.subgenre,
          audience: book.audience,
          format: book.format,
          why_similar: book.why_similar,
          similarity_axes: book.similarity_axes
        })),
        post_prompt: seedProfile.author 
          ? `Would you like to see more books by ${seedProfile.author}?`
          : ''
      };
    } catch (error: any) {
      logger.error({ error, bookTitle }, 'Error finding similar books');
      
      if (error.response?.status === 503) {
        return {
          message: "The search service is temporarily busy. Please try your request again in a few moments."
        };
      }
      
      return {
        message: "I'm having trouble connecting to the book search service. Please try again in a moment."
      };
    }
  }

  private async processAudiobookRequest(request: any) {
    try {
      logger.info({ request }, 'Searching for audiobook');
      const searchResult = await searchProwlarr(request.title, {
        preferredFormat: 'M4B',
        fallbackToMP3: true,
        language: 'ENG',
        minSeeders: 2
      });

      logger.info({ 
        resultCount: searchResult.results?.length || 0,
        format: searchResult.format 
      }, 'Prowlarr search completed');

      if (!searchResult.results || searchResult.results.length === 0) {
        logger.info({ title: request.title }, 'No audiobooks found');
        return {
          intent: 'FIND_BY_TITLE' as const,
          confidence: 0.8,
          seed_book: {
            title: request.title,
            author: request.author || '',
            series: '',
            isbn: '',
            publisher: '',
            year: '',
            audience: 'adult',
            format: 'audiobook',
            genre: '',
            subgenres: [],
            themes: [],
            tone_style: [],
            notable_features: []
          },
          similarity_rules_applied: {
            matched_axes: [],
            min_required_axes: 0
          },
          filters: {
            audience_lock: false,
            format_lock: true,
            exclude: []
          },
          clarifying_question: `I couldn't find "${request.title}" as an audiobook. Would you like me to look for something similar?`,
          results: [],
          post_prompt: ''
        };
      }

      // Show multiple results if found with intelligent author extraction
      const results = searchResult.results.slice(0, 5).map(result => {
        // Try to extract author from title
        let author = 'Unknown';
        const byMatch = result.title.match(/by\s+([^[]+)/i);
        if (byMatch) {
          author = byMatch[1].trim();
        }
        
        return {
          title: result.title,
          author: author,
          genre: 'audiobook',
          subgenre: '',
          audience: 'adult',
          format: 'audiobook',
          why_similar: `${result.seeders} seeders, ${(result.size / (1024*1024*1024)).toFixed(1)}GB`,
          similarity_axes: ['format', 'availability']
        };
      });

      logger.info({ resultCount: results.length }, 'Formatted results for response');

      const bestMatch = searchResult.results[0];
      logger.info({ bestMatch: { title: bestMatch.title, seeders: bestMatch.seeders } }, 'Selected best match');

      // Don't auto-download - show options instead
      const formatInfo = searchResult.format === 'M4B' ? 
        '(M4B format)' : 
        '(MP3 format)';

      return {
        intent: 'FIND_BY_TITLE' as const,
        confidence: 0.9,
        seed_book: {
          title: request.title,
          author: request.author || '',
          series: '',
          isbn: '',
          publisher: '',
          year: '',
          audience: 'adult',
          format: 'audiobook',
          genre: '',
          subgenres: [],
          themes: [],
          tone_style: [],
          notable_features: []
        },
        similarity_rules_applied: {
          matched_axes: ['title', 'format'],
          min_required_axes: 1
        },
        filters: {
          audience_lock: false,
          format_lock: true,
          exclude: []
        },
        clarifying_question: '',
        results: results,
        post_prompt: `Which one would you like me to download? Just say the number (1-${results.length}) or tell me which specific book you want.`
      };
    } catch (error: any) {
      logger.error({ error: error.message, request }, 'Error searching for audiobook');
      return {
        intent: 'FIND_BY_TITLE' as const,
        confidence: 0.5,
        seed_book: {
          title: request.title,
          author: request.author || '',
          series: '',
          isbn: '',
          publisher: '',
          year: '',
          audience: 'adult',
          format: 'audiobook',
          genre: '',
          subgenres: [],
          themes: [],
          tone_style: [],
          notable_features: []
        },
        similarity_rules_applied: {
          matched_axes: [],
          min_required_axes: 0
        },
        filters: {
          audience_lock: false,
          format_lock: false,
          exclude: []
        },
        clarifying_question: "I'm having trouble searching for books right now. Please try again in a moment.",
        results: [],
        post_prompt: ''
      };
    }
  }

  async getHealthStatus(): Promise<HealthStatus> {
    console.log('Orchestrator: Starting health checks...');
    const [ollama, readarr, prowlarr, qbittorrent] = await Promise.all([
      checkOllamaHealth(),
      checkReadarrHealth(),
      checkProwlarrHealth(),
      checkQbittorrentHealth(),
    ]);
    console.log('Orchestrator: Ollama health:', ollama);
    console.log('Orchestrator: Readarr health:', readarr);
    console.log('Orchestrator: Prowlarr health:', prowlarr);
    console.log('Orchestrator: qBittorrent health:', qbittorrent);

        

    const overallHealthy = ollama.status === 'up' && readarr.status === 'up' && prowlarr.status === 'up' && qbittorrent.status === 'up';

    return {
      overall: overallHealthy,
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        ollama,
        readarr,
        prowlarr,
        qbittorrent,
      }
    } as HealthStatus;
  }

  // Method to download a specific book by title
  async downloadBook(bookTitle: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the book in the last search results (stored in memory)
      // For a production app, you'd want to store this more persistently
      logger.info({ bookTitle }, 'Attempting to download specific book');
      
      // For now, let's do a quick search to find the exact torrent
      const searchResult = await searchProwlarr(bookTitle, {
        preferredFormat: 'M4B',
        fallbackToMP3: true,
        language: 'ENG',
        minSeeders: 2
      });

      if (!searchResult.results || searchResult.results.length === 0) {
        return { success: false, error: 'Book not found in search results' };
      }

      // Find exact match by title
      const exactMatch = searchResult.results.find(result => 
        result.title.toLowerCase().includes(bookTitle.toLowerCase())
      );

      if (!exactMatch) {
        return { success: false, error: 'Exact book match not found' };
      }

      await addTorrent(exactMatch.downloadUrl);
      logger.info({ torrent: { title: exactMatch.title, url: exactMatch.downloadUrl } }, 'Added torrent to qBittorrent successfully');
      
      return { success: true };
    } catch (error: any) {
      logger.error({ error: error.message, bookTitle }, 'Error downloading book');
      return { success: false, error: error.message };
    }
  }
}
