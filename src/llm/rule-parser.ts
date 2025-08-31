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

  // If no explicit search keywords but the query looks like a book title, try to search
  if (lowerQuery.length > 3 && !lowerQuery.includes('help') && !lowerQuery.includes('status')) {
    const extracted = extractAudiobookDetails(correctedQuery);
    if (extracted && extracted.title.length > 2) {
      return {
        intent: 'search_audiobook',
        confidence: 0.6, // Lower confidence since no explicit search intent
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
  const prefixes = ['find me', 'get me', 'search for', 'download', 'look for', 'find', 'get'];
  prefixes.forEach((prefix) => {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    title = title.replace(regex, '').trim();
  });

  if (title) {
    return {
      title,
      author,
      language: 'en',
      quality: 'any',
      format: 'audiobook',
    };
  }
}
