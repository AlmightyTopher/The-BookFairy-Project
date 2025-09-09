import { logger } from '../../utils/logger.js';
import { filterEnglishOnly } from '../../lib/env-validator.js';

export interface BasicBook {
  id: string;
  title: string;
  authors: string[];
  series?: string;
  seriesNumber?: number;
  hasAudiobook?: boolean;
  coverUrl?: string;
  year?: number;
  isbn?: string;
  language?: string[];
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  language?: string[];
  cover_i?: number;
  subject?: string[];
  edition_count?: number;
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
  start: number;
}

interface SearchParams {
  title?: string;
  author?: string;
  subject?: string;
  q?: string;
  page?: number;
}

const OL_BASE_URL = 'https://openlibrary.org';
const OL_SEARCH_URL = `${OL_BASE_URL}/search.json`;
const ITEMS_PER_PAGE = 50; // OL's max, we'll post-filter to 5

function buildCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

function normalizeDoc(doc: OpenLibraryDoc): BasicBook {
  // Extract first author for deduplication key
  const firstAuthor = doc.author_name?.[0] || 'Unknown';
  
  return {
    id: doc.key,
    title: doc.title || 'Unknown Title',
    authors: doc.author_name || [],
    year: doc.first_publish_year,
    isbn: doc.isbn?.[0],
    language: doc.language,
    coverUrl: doc.cover_i ? buildCoverUrl(doc.cover_i) : undefined,
    hasAudiobook: false // OL doesn't distinguish audiobooks reliably
  };
}

function dedupeBooks(books: BasicBook[]): BasicBook[] {
  const seen = new Set<string>();
  const deduped: BasicBook[] = [];
  
  for (const book of books) {
    const key = `${book.title}|${book.authors[0] || 'Unknown'}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(book);
    }
  }
  
  return deduped;
}

function postFilterBooks(books: BasicBook[]): BasicBook[] {
  // Filter out books without authors
  const withAuthors = books.filter(book => book.authors.length > 0);
  
  // Apply English-only filter
  const englishOnly = filterEnglishOnly(withAuthors);
  
  // Dedupe by title|firstAuthor
  const deduped = dedupeBooks(englishOnly);
  
  return deduped;
}

export async function ol_search_loose(text: string, page: number = 1): Promise<BasicBook[]> {
  try {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const url = new URL(OL_SEARCH_URL);
    url.searchParams.set('q', text);
    url.searchParams.set('limit', ITEMS_PER_PAGE.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,isbn,language,cover_i,subject,edition_count');
    
    logger.info({ query: text, page, url: url.toString() }, 'OpenLibrary loose search');
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'BookFairy/1.0 (https://github.com/AlmightyTopher/The-BookFairy-Project)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenLibrary HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: OpenLibraryResponse = await response.json();
    logger.info({ numFound: data.numFound, returned: data.docs.length }, 'OpenLibrary search results');
    
    const books = data.docs.map(normalizeDoc);
    const filtered = postFilterBooks(books);
    
    return filtered.slice(0, 5); // Limit to 5 items as per constitutional requirement
    
  } catch (error) {
    logger.error({ error, query: text }, 'OpenLibrary loose search failed');
    return [];
  }
}

export async function ol_search_fielded(params: SearchParams): Promise<BasicBook[]> {
  try {
    const page = params.page || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const url = new URL(OL_SEARCH_URL);
    
    // Build fielded query
    const queryParts: string[] = [];
    
    if (params.title) {
      queryParts.push(`title:${params.title}`);
    }
    
    if (params.author) {
      queryParts.push(`author:${params.author}`);
    }
    
    if (params.subject) {
      queryParts.push(`subject:${params.subject}`);
    }
    
    if (params.q) {
      queryParts.push(params.q);
    }
    
    const query = queryParts.join(' AND ');
    
    url.searchParams.set('q', query);
    url.searchParams.set('limit', ITEMS_PER_PAGE.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,isbn,language,cover_i,subject,edition_count');
    
    logger.info({ params, query, page, url: url.toString() }, 'OpenLibrary fielded search');
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'BookFairy/1.0 (https://github.com/AlmightyTopher/The-BookFairy-Project)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenLibrary HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: OpenLibraryResponse = await response.json();
    logger.info({ numFound: data.numFound, returned: data.docs.length }, 'OpenLibrary fielded search results');
    
    const books = data.docs.map(normalizeDoc);
    const filtered = postFilterBooks(books);
    
    return filtered.slice(0, 5); // Limit to 5 items as per constitutional requirement
    
  } catch (error) {
    logger.error({ error, params }, 'OpenLibrary fielded search failed');
    return [];
  }
}

// Test function for validation
export async function testOpenLibraryConnection(): Promise<boolean> {
  try {
    const results = await ol_search_loose('test', 1);
    logger.info({ resultCount: results.length }, 'OpenLibrary connection test');
    return true;
  } catch (error) {
    logger.error({ error }, 'OpenLibrary connection test failed');
    return false;
  }
}