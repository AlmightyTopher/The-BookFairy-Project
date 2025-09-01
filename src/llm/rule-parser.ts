import { IntentClassification, AudiobookRequest } from '../types/schemas';
import { SpellChecker } from '../utils/spell-checker';

// Simple keyword-based rule parser as a fallback

const searchKeywords = ['find', 'get', 'search for', 'download', 'look for', 'more books'];
const statusKeywords = ['status', 'check', 'progress', 'downloads'];
const helpKeywords = ['help', 'commands', 'usage'];

export function parseWithRules(query: string): IntentClassification {
  // Apply spell correction first
  const correctedQuery = SpellChecker.correctSpelling(query);
  const lowerQuery = correctedQuery.toLowerCase();

  if (helpKeywords.some((kw) => lowerQuery.includes(kw))) {
    return {
      intent: 'help',
      confidence: 0.9,
    };
  }

  if (statusKeywords.some((kw) => lowerQuery.includes(kw))) {
    return {
      intent: 'status_check',
      confidence: 0.9,
    };
  }

  // Handle number selections (e.g., "1", "2", "download 3") - convert to search
  const numberMatch = correctedQuery.match(/^(?:download\s+)?(\d+)$/i);
  if (numberMatch) {
    return {
      intent: 'search_audiobook',
      confidence: 0.95,
      extracted: {
        title: `selection ${numberMatch[1]}`, // Will be handled by message handler
        author: 'Unknown',
        language: 'en',
        quality: 'any',
        format: 'audiobook'
      }
    };
  }

  // Handle "more books by Author" pattern
  if (lowerQuery.includes('more books by')) {
    const authorName = correctedQuery.split('more books by').pop()?.trim();
    if (authorName) {
      return {
        intent: 'search_audiobook',
        confidence: 0.9,
        extracted: {
          title: '', // Empty title means search by author only
          author: authorName,
          language: 'en',
          quality: 'any',
          format: 'audiobook',
        }
      };
    }
  }

  // Enhanced search keyword detection
  if (searchKeywords.some((kw) => lowerQuery.includes(kw))) {
    const extracted = extractAudiobookDetails(correctedQuery);
    if (extracted) {
      return {
        intent: 'search_audiobook',
        confidence: 0.8,
        extracted,
      };
    }
  }

  // If we have a corrected query that looks like a book title, try to search for it
  if (correctedQuery !== query && correctedQuery.length > 3) {
    const extracted = extractAudiobookDetails(correctedQuery);
    if (extracted) {
      return {
        intent: 'search_audiobook',
        confidence: 0.7, // Lower confidence since it's spell-corrected
        extracted,
      };
    }
  }

  // Default: treat any text as a potential book search (this replaces LLM fallback)
  if (lowerQuery.length > 2 && !lowerQuery.includes('help') && !lowerQuery.includes('status')) {
    const extracted = extractAudiobookDetails(correctedQuery);
    if (extracted && extracted.title.length > 1) {
      return {
        intent: 'search_audiobook',
        confidence: 0.6, // Lower confidence for general text
        extracted,
      };
    }
  }

  return {
    intent: 'unknown',
    confidence: 0.5,
  };
}

function extractAudiobookDetails(query: string): AudiobookRequest | undefined {
  const byAuthorRegex = /by\s+(.+)/i;
  const authorMatch = query.match(byAuthorRegex);
  const author = authorMatch ? authorMatch[1].trim() : 'Unknown';

  let title = query.replace(byAuthorRegex, '').trim();
  
  // Remove common search prefixes more aggressively
  const prefixes = [
    'find me', 'get me', 'search for', 'download', 'look for', 'find', 'get',
    'books with title', 'book with title', 'books titled', 'book titled',
    'audiobooks with title', 'audiobook with title', 'audiobook titled',
    'books by title', 'book by title'
  ];
  
  prefixes.forEach((prefix) => {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    title = title.replace(regex, '').trim();
  });

  // Handle specific patterns like "books with title X" or "title: X"
  const titlePatterns = [
    /^(?:books?|audiobooks?)\s+(?:with\s+)?title\s*:?\s*(.+)$/i,
    /^title\s*:?\s*(.+)$/i,
    /^(?:the\s+)?(.+)$/i
  ];

  for (const pattern of titlePatterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }

  if (title && title.length > 1) {
    return {
      title,
      author,
      language: 'en',
      quality: 'any',
      format: 'audiobook',
    };
  }
  
  return undefined;
}
