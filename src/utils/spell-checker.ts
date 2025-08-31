import * as natural from 'natural';
import { logger } from './logger';

export class SpellChecker {
  private static readonly BOOK_VOCABULARY = [
    // Common words that should NOT be corrected
    'something', 'anything', 'everything', 'nothing', 'someone', 'anyone',
    'everyone', 'somewhere', 'anywhere', 'everywhere', 'somehow', 'anyhow',
    'what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this',
    'like', 'find', 'search', 'looking', 'want', 'need', 'recommend', 'suggest',
    'similar', 'about', 'after', 'before', 'with', 'without', 'good', 'great',
    'best', 'better', 'new', 'old', 'first', 'last', 'next', 'previous',
    
    // Common book words
    'book', 'novel', 'story', 'tale', 'saga', 'series', 'collection', 'anthology',
    'fiction', 'fantasy', 'science', 'mystery', 'thriller', 'romance', 'horror',
    'adventure', 'biography', 'memoir', 'history', 'philosophy', 'poetry',
    
    // Famous book titles and series
    'harry', 'potter', 'chronicles', 'narnia', 'lord', 'rings', 'hobbit',
    'game', 'thrones', 'song', 'ice', 'fire', 'wheel', 'time', 'dune',
    'foundation', 'hitchhiker', 'galaxy', 'guide', 'ender', 'mistborn',
    'stormlight', 'archive', 'silmarillion', 'tolkien', 'lewis', 'rowling',
    'martin', 'jordan', 'herbert', 'asimov', 'adams', 'card', 'sanderson',
    
    // Common fantasy/sci-fi words
    'dragon', 'wizard', 'magic', 'spell', 'sword', 'kingdom', 'empire',
    'space', 'planet', 'galaxy', 'universe', 'alien', 'robot', 'android',
    'future', 'past', 'time', 'travel', 'dimension', 'portal', 'quest',
    
    // Common book-related words
    'author', 'writer', 'chapter', 'volume', 'edition', 'paperback',
    'hardcover', 'audiobook', 'ebook', 'kindle', 'library', 'bookstore'
  ];

  private static readonly COMMON_CORRECTIONS: Record<string, string> = {
    // Keep some critical corrections for performance
    'narnieya': 'narnia',
    'naria': 'narnia',
    'chronicls': 'chronicles',
    'poter': 'potter',
    'pottter': 'potter',
    'hairy': 'harry',
    'lotr': 'lord of the rings',
    'hobitt': 'hobbit',
    'simarillion': 'silmarillion',
    'drangon': 'dragon',
    'magik': 'magic',
    'magick': 'magic'
  };

  /**
   * Corrects spelling in a book title or query using both dictionary corrections
   * and fuzzy matching against book vocabulary
   */
  static correctSpelling(text: string): string {
    if (!text || text.length < 2) return text;

    const words = text.toLowerCase().split(/\s+/);
    const correctedWords: string[] = [];
    let correctionsMade = 0;

    for (const word of words) {
      // Skip very short words and common words
      if (word.length <= 2 || this.isCommonWord(word)) {
        correctedWords.push(word);
        continue;
      }

      // Check direct corrections first
      if (this.COMMON_CORRECTIONS[word]) {
        correctedWords.push(this.COMMON_CORRECTIONS[word]);
        correctionsMade++;
        continue;
      }

      // Find best match in vocabulary
      const corrected = this.findBestMatch(word);
      if (corrected !== word) {
        correctedWords.push(corrected);
        correctionsMade++;
      } else {
        correctedWords.push(word);
      }
    }

    const result = correctedWords.join(' ');
    
    if (correctionsMade > 0) {
      logger.info({ 
        original: text, 
        corrected: result, 
        corrections: correctionsMade 
      }, 'Applied spell corrections');
    }

    return result;
  }

  /**
   * Find the best matching word from vocabulary using edit distance
   */
  private static findBestMatch(word: string): string {
    let bestMatch = word;
    let bestDistance = Infinity;
    const maxDistance = Math.max(1, Math.floor(word.length * 0.3)); // Allow 30% character difference

    for (const vocabWord of this.BOOK_VOCABULARY) {
      // Skip if length difference is too large
      if (Math.abs(word.length - vocabWord.length) > maxDistance) {
        continue;
      }

      const dist = natural.LevenshteinDistance(word, vocabWord);
      
      // Only consider it a match if:
      // 1. Distance is within reasonable bounds
      // 2. It's better than current best
      // 3. The words start with the same letter (helps avoid false positives)
      if (dist < bestDistance && 
          dist <= maxDistance && 
          word[0] === vocabWord[0] &&
          dist < word.length * 0.4) {
        bestDistance = dist;
        bestMatch = vocabWord;
      }
    }

    return bestMatch;
  }

  /**
   * Check if a word is too common to need spell checking
   */
  private static isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
      'will', 'just', 'should', 'now', 'find', 'get', 'search', 'look',
      'download', 'read', 'listen', 'want', 'need', 'like', 'love'
    ]);
    
    return commonWords.has(word);
  }

  /**
   * Check if a correction was significant enough to mention to the user
   */
  static wasSignificantCorrection(original: string, corrected: string): boolean {
    const originalWords = original.toLowerCase().split(/\s+/);
    const correctedWords = corrected.toLowerCase().split(/\s+/);
    
    if (originalWords.length !== correctedWords.length) return true;
    
    let differences = 0;
    for (let i = 0; i < originalWords.length; i++) {
      if (originalWords[i] !== correctedWords[i]) {
        differences++;
      }
    }
    
    return differences > 0;
  }
}
