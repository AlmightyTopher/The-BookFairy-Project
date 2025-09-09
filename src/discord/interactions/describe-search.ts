import { paginate } from "../../lib/pagination.js";
import * as OL from "../../integrations/openlibrary/client.js";
import * as HC from "../../integrations/hardcover/client.js";
import { toSearchOptions, relaySearch } from "../../integrations/prowlarr/client.js";
import { stateManager } from "../../lib/state-manager.js";
import { logger } from "../../utils/logger.js";

type BuildParams = { query: string; userId: string };

interface RankedBook {
  id: string;
  title: string;
  authors: string[];
  series?: string;
  year?: number;
  hasAudiobook?: boolean;
  coverUrl?: string;
  source: 'openlibrary' | 'hardcover';
  score: number;
  isbn?: string;
  hcId?: string | number;
}

export async function buildDescribeSearch({ query, userId }: BuildParams) {
  logger.info({ query, userId }, 'Building describe search');
  
  // Start or resume session
  let session = stateManager.getDescribe(userId);
  if (!session) {
    stateManager.startDescribe(userId, query);
    session = stateManager.getDescribe(userId)!;
  }
  
  try {
    // Get results from multiple sources
    const [olResults, hcResults] = await Promise.all([
      OL.ol_search_loose(query, 1),
      searchHardcoverDescriptive(query)
    ]);
    
    logger.debug({ 
      olCount: olResults.length, 
      hcCount: hcResults.length 
    }, 'Raw search results');
    
    // Convert to unified format
    const olBooks: RankedBook[] = olResults.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      series: book.series,
      year: book.year,
      hasAudiobook: book.hasAudiobook || false,
      coverUrl: book.coverUrl,
      source: 'openlibrary' as const,
      score: 0, // Will be calculated
      isbn: book.isbn,
      hcId: book.id
    }));
    
    const hcBooks: RankedBook[] = hcResults.map(book => ({
      id: book.id?.toString() || book.title,
      title: book.title,
      authors: book.authors,
      series: book.series,
      year: book.year,
      hasAudiobook: book.hasAudiobook || false,
      coverUrl: book.coverUrl,
      source: 'hardcover' as const,
      score: 0, // Will be calculated
      isbn: book.isbn,
      hcId: book.id
    }));
    
    // Combine and dedupe
    const allBooks = [...olBooks, ...hcBooks];
    const deduped = dedupeBooks(allBooks);
    
    // Apply ranking algorithm
    const ranked = rankBooks(deduped, query, session.clarifications);
    
    // Store results in session
    stateManager.updateDescribe(userId, { 
      currentResults: ranked,
      state: 'active'
    });
    
    const enriched = ranked.map(book => ({
      ...book,
      label: formatBookLabel(book)
    }));
    
    const page = paginate(enriched, 1, 5);
    return { 
      page, 
      query, 
      clarificationCount: session.clarifications.length,
      canClarify: session.clarifications.length < 3 // Limit clarifications
    };
    
  } catch (error) {
    logger.error({ error, query, userId }, 'Error in describe search');
    
    // Return empty results but keep session active
    const page = paginate([], 1, 5);
    return { 
      page, 
      query, 
      clarificationCount: 0,
      canClarify: true 
    };
  }
}

async function searchHardcoverDescriptive(query: string): Promise<HC.BasicBook[]> {
  try {
    // Try title search first
    const titleResult = await HC.searchByTitle(query);
    const titleBooks = titleResult?.books || [];
    
    // Extract potential author names from query and try author search
    const authorMatches = extractAuthorNames(query);
    let authorBooks: any[] = [];
    
    if (authorMatches.length > 0) {
      for (const author of authorMatches.slice(0, 2)) { // Limit to 2 authors
        try {
          const authorResult = await HC.searchByAuthor(author);
          const works = authorResult?.works || [];
          authorBooks.push(...works.map((work: any) => ({
            id: work.id || work.title,
            title: work.title,
            authors: [author], // Use the author we searched for
            series: work.series,
            year: work.year,
            hasAudiobook: false // Unknown from works
          })));
        } catch (err) {
          logger.debug({ error: err, author }, 'Author search failed');
        }
      }
    }
    
    // Combine and limit
    return [...titleBooks, ...authorBooks].slice(0, 10);
    
  } catch (error) {
    logger.error({ error, query }, 'Hardcover descriptive search failed');
    return [];
  }
}

function extractAuthorNames(query: string): string[] {
  // Simple heuristic to extract potential author names
  // Look for capitalized words that might be names
  const words = query.split(/\s+/);
  const names: string[] = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];
    
    // If we have two capitalized words in a row, might be a name
    if (word1.match(/^[A-Z][a-z]+$/) && word2.match(/^[A-Z][a-z]+$/)) {
      names.push(`${word1} ${word2}`);
    }
  }
  
  return names;
}

function dedupeBooks(books: RankedBook[]): RankedBook[] {
  const seen = new Map<string, RankedBook>();
  
  for (const book of books) {
    const key = `${book.title.toLowerCase()}|${book.authors[0]?.toLowerCase() || 'unknown'}`;
    
    if (!seen.has(key)) {
      seen.set(key, book);
    } else {
      // If we have a duplicate, prefer Hardcover source
      const existing = seen.get(key)!;
      if (book.source === 'hardcover' && existing.source === 'openlibrary') {
        seen.set(key, book);
      }
    }
  }
  
  return Array.from(seen.values());
}

function rankBooks(books: RankedBook[], originalQuery: string, clarifications: string[]): RankedBook[] {
  const queryTerms = originalQuery.toLowerCase().split(/\s+/);
  const clarificationTerms = clarifications.flatMap(c => c.toLowerCase().split(/\s+/));
  const allTerms = [...queryTerms, ...clarificationTerms];
  
  return books.map(book => {
    let score = 0;
    
    // Title fuzzy matching (60% weight)
    const titleScore = calculateFuzzyScore(book.title.toLowerCase(), allTerms);
    score += titleScore * 0.6;
    
    // Author fuzzy matching (30% weight)
    const authorText = book.authors.join(' ').toLowerCase();
    const authorScore = calculateFuzzyScore(authorText, allTerms);
    score += authorScore * 0.3;
    
    // Series boost (5% weight)
    if (book.series) {
      const seriesScore = calculateFuzzyScore(book.series.toLowerCase(), allTerms);
      score += seriesScore * 0.05;
    }
    
    // Audiobook boost (5% weight)
    if (book.hasAudiobook) {
      score += 0.05;
    }
    
    // Source preference (Hardcover slightly preferred)
    if (book.source === 'hardcover') {
      score += 0.01;
    }
    
    return { ...book, score };
  }).sort((a, b) => b.score - a.score);
}

function calculateFuzzyScore(text: string, terms: string[]): number {
  let matches = 0;
  let totalLength = 0;
  
  for (const term of terms) {
    totalLength += term.length;
    
    if (text.includes(term)) {
      matches += term.length;
    } else {
      // Partial matching for fuzzy search
      for (let i = 0; i < text.length - term.length + 1; i++) {
        const substring = text.substring(i, i + term.length);
        const similarity = calculateSimilarity(substring, term);
        if (similarity > 0.7) { // 70% similarity threshold
          matches += term.length * similarity;
          break;
        }
      }
    }
  }
  
  return totalLength > 0 ? matches / totalLength : 0;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function formatBookLabel(book: RankedBook): string {
  const parts = [];
  
  parts.push(book.title);
  
  if (book.authors.length > 0) {
    parts.push(`by ${book.authors.slice(0, 2).join(', ')}`);
  }
  
  if (book.series) {
    parts.push(`(${book.series})`);
  }
  
  if (book.year) {
    parts.push(`${book.year}`);
  }
  
  if (book.hasAudiobook) {
    parts.push('🎧');
  }
  
  // Show score for debugging (remove in production)
  if (book.score > 0) {
    parts.push(`[${Math.round(book.score * 100)}%]`);
  }
  
  return parts.join(' ');
}

export async function handleClarifier(userId: string, clarification: string) {
  logger.info({ userId, clarification }, 'Handling clarification');
  
  const session = stateManager.getDescribe(userId);
  if (!session) {
    logger.warn({ userId }, 'No active describe session for clarification');
    return { success: false, error: 'No active session' };
  }
  
  // Add clarification to session
  const updatedClarifications = [...session.clarifications, clarification];
  stateManager.updateDescribe(userId, { 
    clarifications: updatedClarifications,
    state: 'waiting_clarifier' 
  });
  
  // Re-run search with clarification
  const combinedQuery = `${session.originalQuery} ${clarification}`;
  const results = await buildDescribeSearch({ 
    query: combinedQuery, 
    userId 
  });
  
  return { success: true, results };
}

type ConfirmSelection = { 
  title: string; 
  authors?: string[];
  hcId?: string | number;
  source?: string;
};

type Ctx = { guildId: string; userId?: string };

export async function confirmDescribeBook(sel: ConfirmSelection, ctx: Ctx) {
  const correlationId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  
  // Build search query
  const queryParts = [sel.title];
  
  if (sel.authors && sel.authors.length > 0) {
    queryParts.push(...sel.authors.slice(0, 2));
  }
  
  const query = queryParts.join(' ');
  const opts = toSearchOptions(query);
  
  logger.info({ selection: sel, query, correlationId }, 'Confirming describe book selection');
  
  try {
    const res = await relaySearch(opts, { ...ctx, correlationId });
    
    // End the describe session on successful confirmation
    if (ctx.userId && res?.ok) {
      stateManager.endDescribe(ctx.userId);
    }
    
    return { 
      ok: !!res?.ok, 
      meta: { correlationId, source: sel.source || 'unknown' }, 
      payload: opts 
    };
  } catch (error) {
    logger.error({ error, selection: sel, correlationId }, 'Error confirming describe book');
    return { 
      ok: false, 
      meta: { correlationId, error: String(error) }, 
      payload: opts 
    };
  }
}