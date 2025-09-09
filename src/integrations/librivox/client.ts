import { logger } from '../../utils/logger.js';

export interface LibriVoxProject {
  id: string;
  title: string;
  authors: string[];
  readers: string[];
  language: string;
  genres: string[];
  description?: string;
  url: string;
  rss?: string;
  totalTime?: string;
  numSections?: number;
}

interface LibriVoxApiResponse {
  books: Array<{
    id: string;
    title: string;
    description?: string;
    url_librivox: string;
    url_rss?: string;
    language: string;
    copyright_year?: string;
    num_sections?: string;
    totaltime?: string;
    authors?: Array<{
      id: string;
      first_name?: string;
      last_name?: string;
      display_name?: string;
    }>;
    readers?: Array<{
      id: string;
      display_name?: string;
    }>;
    genres?: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

const LIBRIVOX_API_BASE = 'https://librivox.org/api/feed/audiobooks';

// Best effort - do not block flow on failures
async function safeLibriVoxRequest(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BookFairy/1.0 (https://github.com/AlmightyTopher/The-BookFairy-Project)'
      },
      // Short timeout for best-effort requests
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      logger.debug({ status: response.status, url }, 'LibriVox API returned non-200');
      return null;
    }
    
    return await response.json();
  } catch (error) {
    logger.debug({ error: String(error), url }, 'LibriVox API request failed (best effort)');
    return null;
  }
}

function normalizeProject(book: any): LibriVoxProject {
  const authors = (book.authors || []).map((author: any) => 
    author.display_name || 
    `${author.first_name || ''} ${author.last_name || ''}`.trim() ||
    'Unknown Author'
  );
  
  const readers = (book.readers || []).map((reader: any) => 
    reader.display_name || 'Unknown Reader'
  );
  
  const genres = (book.genres || []).map((genre: any) => genre.name);
  
  return {
    id: book.id,
    title: book.title || 'Unknown Title',
    authors,
    readers,
    language: book.language || 'en',
    genres,
    description: book.description,
    url: book.url_librivox,
    rss: book.url_rss,
    totalTime: book.totaltime,
    numSections: book.num_sections ? parseInt(book.num_sections, 10) : undefined
  };
}

/**
 * Search LibriVox by reader/narrator name (A1.4)
 * Returns public domain audiobook projects read by the specified person
 */
export async function librivox_by_reader(name: string, limit: number = 10): Promise<LibriVoxProject[]> {
  logger.debug({ name, limit }, 'LibriVox reader search (best effort)');
  
  try {
    // LibriVox API supports reader search
    const url = new URL(LIBRIVOX_API_BASE);
    url.searchParams.set('format', 'json');
    url.searchParams.set('reader', name);
    url.searchParams.set('limit', limit.toString());
    
    const data: LibriVoxApiResponse | null = await safeLibriVoxRequest(url.toString());
    
    if (!data || !Array.isArray(data.books)) {
      logger.debug({ name }, 'No LibriVox results or invalid response format');
      return [];
    }
    
    const projects = data.books.map(normalizeProject);
    
    // Filter to English only (most relevant for BookFairy users)
    const englishProjects = projects.filter(project => 
      project.language === 'en' || project.language === 'english'
    );
    
    logger.debug({ 
      name, 
      totalFound: projects.length, 
      englishFound: englishProjects.length 
    }, 'LibriVox reader search completed');
    
    return englishProjects;
    
  } catch (error) {
    // LibriVox is best effort - log but don't throw
    logger.debug({ error: String(error), name }, 'LibriVox reader search failed (best effort)');
    return [];
  }
}

/**
 * Search LibriVox by title (supplementary)
 * Can be used to enrich narrator searches for public domain works
 */
export async function librivox_by_title(title: string, limit: number = 5): Promise<LibriVoxProject[]> {
  logger.debug({ title, limit }, 'LibriVox title search (best effort)');
  
  try {
    const url = new URL(LIBRIVOX_API_BASE);
    url.searchParams.set('format', 'json');
    url.searchParams.set('title', title);
    url.searchParams.set('limit', limit.toString());
    
    const data: LibriVoxApiResponse | null = await safeLibriVoxRequest(url.toString());
    
    if (!data || !Array.isArray(data.books)) {
      return [];
    }
    
    const projects = data.books.map(normalizeProject);
    
    // Filter to English only
    const englishProjects = projects.filter(project => 
      project.language === 'en' || project.language === 'english'
    );
    
    logger.debug({ 
      title, 
      totalFound: projects.length, 
      englishFound: englishProjects.length 
    }, 'LibriVox title search completed');
    
    return englishProjects;
    
  } catch (error) {
    logger.debug({ error: String(error), title }, 'LibriVox title search failed (best effort)');
    return [];
  }
}

/**
 * Get unique narrator names from LibriVox projects
 * Useful for enriching narrator search results
 */
export function extractNarrators(projects: LibriVoxProject[]): string[] {
  const narrators = new Set<string>();
  
  for (const project of projects) {
    for (const reader of project.readers) {
      if (reader && reader !== 'Unknown Reader') {
        narrators.add(reader);
      }
    }
  }
  
  return Array.from(narrators).sort();
}

/**
 * Test LibriVox connectivity (for health checks)
 */
export async function testLibriVoxConnection(): Promise<boolean> {
  try {
    const url = new URL(LIBRIVOX_API_BASE);
    url.searchParams.set('format', 'json');
    url.searchParams.set('title', 'alice');
    url.searchParams.set('limit', '1');
    
    const data = await safeLibriVoxRequest(url.toString());
    const isWorking = data && Array.isArray(data.books);
    
    logger.debug({ isWorking }, 'LibriVox connection test');
    return !!isWorking;
    
  } catch (error) {
    logger.debug({ error: String(error) }, 'LibriVox connection test failed');
    return false;
  }
}