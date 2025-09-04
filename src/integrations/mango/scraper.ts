import * as cheerio from 'cheerio';
import { fetch } from 'undici';
import pRetry from 'p-retry';
import { logger } from '../../utils/logger';
import { mangoConfig } from '../../config/mango';
import { Genre, MangoItem, Timeframe, RateLimiter, MangoCache, CacheEntry } from './types';
import { mangoRequests, mangoItemsReturned } from '../../metrics/server';

// Simple in-memory rate limiter using token bucket algorithm
class TokenBucketRateLimiter implements RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(requestsPerMinute: number, burstSize: number) {
    this.capacity = burstSize;
    this.tokens = burstSize;
    this.lastRefill = Date.now();
    this.refillRate = requestsPerMinute / 60; // convert to per second
  }

  canProceed(): boolean {
    this.refillTokens();
    return this.tokens >= 1;
  }

  consume(): void {
    if (this.canProceed()) {
      this.tokens -= 1;
    }
  }

  reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Simple in-memory cache
class SimpleCache {
  private cache: MangoCache = {
    genres: null,
    topLists: new Map(),
  };

  getGenres(): Genre[] | null {
    if (!this.cache.genres) return null;
    if (Date.now() - this.cache.genres.timestamp > this.cache.genres.ttl) {
      this.cache.genres = null;
      return null;
    }
    return this.cache.genres.data;
  }

  setGenres(genres: Genre[]): void {
    this.cache.genres = {
      data: genres,
      timestamp: Date.now(),
      ttl: mangoConfig.cache.genresTtlMs,
    };
  }

  getTopList(key: string): MangoItem[] | null {
    const entry = this.cache.topLists.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.topLists.delete(key);
      return null;
    }
    return entry.data;
  }

  setTopList(key: string, items: MangoItem[]): void {
    this.cache.topLists.set(key, {
      data: items,
      timestamp: Date.now(),
      ttl: mangoConfig.cache.topListTtlMs,
    });
  }
}

// Shared instances
const rateLimiter = new TokenBucketRateLimiter(
  mangoConfig.rateLimit.requestsPerMinute,
  mangoConfig.rateLimit.burstSize
);
const cache = new SimpleCache();

/**
 * Fetches a page from Mango with rate limiting and retries
 */
async function fetchPage(url: string): Promise<string> {
  // Check rate limit
  if (!rateLimiter.canProceed()) {
    logger.warn({ url }, 'Rate limit exceeded, waiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  rateLimiter.consume();

  return pRetry(
    async () => {
      logger.debug({ url }, 'Fetching Mango page');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'BookFairy-Bot/1.0 (+https://github.com/AlmightyTopher/The-BookFairy-Project)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        if (response.status === 429) {
          logger.warn({ url, status: response.status }, 'Rate limited by server');
          throw new Error(`Rate limited: ${response.status}`);
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      return await response.text();
    },
    {
      retries: mangoConfig.maxRetries,
      onFailedAttempt: (error) => {
        logger.warn({ url, attemptNumber: error.attemptNumber }, 'Mango fetch attempt failed');
      },
    }
  );
}

/**
 * Attempts to detect JSON API endpoints from the audiobooks page
 */
async function detectJsonEndpoints(html: string): Promise<string[]> {
  const endpoints: string[] = [];
  
  try {
    // Look for fetch calls or API endpoints in script tags
    const scriptRegex = /<script[^>]*>(.*?)<\/script>/gis;
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptContent = match[1];
      
      // Look for fetch calls
      const fetchRegex = /fetch\s*\(\s*["']([^"']*)["']/g;
      let fetchMatch;
      while ((fetchMatch = fetchRegex.exec(scriptContent)) !== null) {
        endpoints.push(fetchMatch[1]);
      }
      
      // Look for API endpoints in general
      const apiRegex = /['"]\/api\/[^'"]*['"]/g;
      let apiMatch;
      while ((apiMatch = apiRegex.exec(scriptContent)) !== null) {
        endpoints.push(apiMatch[0].slice(1, -1)); // Remove quotes
      }
    }
    
    // Look for JSON data in script tags
    const jsonRegex = /<script[^>]*type=["']application\/json["'][^>]*>(.*?)<\/script>/gis;
    while ((match = jsonRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        logger.debug({ jsonKeys: Object.keys(jsonData) }, 'Found JSON data in script tag');
      } catch (e) {
        // Ignore malformed JSON
      }
    }
    
  } catch (error) {
    logger.warn({ error }, 'Error detecting JSON endpoints');
  }
  
  return endpoints;
}

/**
 * Scrapes genres from the HTML content
 */
function scrapeGenres(html: string): Genre[] {
  const $ = cheerio.load(html);
  const genres: Genre[] = [];
  
  try {
    // Try multiple selectors for genre lists
    const genreSelectors = [
      '.genre-list a',
      '.categories a',
      '.filter-genre option',
      '[data-genre]',
      '.nav-genre a',
      '.sidebar .genre',
    ];
    
    for (const selector of genreSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        logger.debug({ selector, count: elements.length }, 'Found genre elements');
        
        elements.each((_, element) => {
          const $el = $(element);
          let name = $el.text().trim();
          let id = $el.attr('data-genre') || $el.attr('value') || name.toLowerCase();
          
          // Clean up the text
          name = name.replace(/\s+/g, ' ').replace(/^\W+|\W+$/g, '');
          if (name && name.length > 0 && name.length < 50) {
            genres.push({
              id: id.replace(/\s+/g, '_').toLowerCase(),
              name,
              slug: name.toLowerCase().replace(/\s+/g, '-'),
            });
          }
        });
        
        if (genres.length > 0) break; // Use first successful selector
      }
    }
    
    // Fallback: extract from any link text that looks like genres
    if (genres.length === 0) {
      logger.debug({}, 'Using fallback genre extraction');
      const commonGenres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
        'Thriller', 'Biography', 'History', 'Self-Help', 'Business', 'Children',
        'Young Adult', 'Literary Fiction', 'Horror', 'Adventure', 'Crime',
      ];
      
      for (const genre of commonGenres) {
        if (html.toLowerCase().includes(genre.toLowerCase())) {
          genres.push({
            id: genre.toLowerCase().replace(/\s+/g, '_'),
            name: genre,
            slug: genre.toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }
    }
    
  } catch (error) {
    logger.error({ error }, 'Error scraping genres');
  }
  
  // Remove duplicates
  const uniqueGenres = genres.filter((genre, index, self) => 
    index === self.findIndex(g => g.id === genre.id)
  );
  
  logger.info({ count: uniqueGenres.length }, 'Scraped genres from Mango');
  return uniqueGenres;
}

/**
 * Scrapes audiobook items from HTML for a specific genre and timeframe
 */
function scrapeItems(html: string, genre: string, timeframe: Timeframe): MangoItem[] {
  const $ = cheerio.load(html);
  const items: MangoItem[] = [];
  
  try {
    // Try multiple selectors for book items
    const itemSelectors = [
      '.book-item',
      '.audiobook-item',
      '.item',
      '.book',
      '.result',
      'article',
      '.card',
    ];
    
    for (const selector of itemSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        logger.debug({ selector, count: elements.length }, 'Found item elements');
        
        elements.each((_, element) => {
          try {
            const $el = $(element);
            
            // Extract title
            const titleSelectors = ['.title', '.book-title', 'h1', 'h2', 'h3', '.name', 'a[href*="book"]'];
            let title = '';
            for (const titleSel of titleSelectors) {
              const titleEl = $el.find(titleSel).first();
              if (titleEl.length > 0) {
                title = titleEl.text().trim();
                break;
              }
            }
            
            // Extract author
            const authorSelectors = ['.author', '.book-author', '.by', '.writer', '[data-author]'];
            let author = '';
            for (const authorSel of authorSelectors) {
              const authorEl = $el.find(authorSel).first();
              if (authorEl.length > 0) {
                author = authorEl.text().trim().replace(/^by\s+/i, '');
                break;
              }
            }
            
            // Extract URL
            const linkSelectors = ['a[href*="book"]', 'a[href*="detail"]', 'a', '[data-url]'];
            let url = '';
            for (const linkSel of linkSelectors) {
              const linkEl = $el.find(linkSel).first();
              if (linkEl.length > 0) {
                const href = linkEl.attr('href');
                if (href) {
                  url = href.startsWith('http') ? href : `${mangoConfig.baseUrl}${href}`;
                  break;
                }
              }
            }
            
            // Clean and validate
            title = title.replace(/\s+/g, ' ').trim();
            author = author.replace(/\s+/g, ' ').trim();
            
            if (title && author && url && title.length < 200 && author.length < 100) {
              items.push({
                title,
                author,
                genre,
                timeframe,
                url,
                source: 'mango',
              });
            }
          } catch (error) {
            logger.debug({ error }, 'Error parsing individual item');
          }
        });
        
        if (items.length > 0) break; // Use first successful selector
      }
    }
    
  } catch (error) {
    logger.error({ error }, 'Error scraping items');
  }
  
  logger.info({ count: items.length, genre, timeframe }, 'Scraped items from Mango');
  return items;
}

/**
 * Lists available genres from Mango
 */
export async function listGenres(): Promise<Genre[]> {
  // Check cache first
  const cached = cache.getGenres();
  if (cached) {
    logger.debug({ count: cached.length }, 'Returning cached genres');
    return cached;
  }
  
  try {
    mangoRequests.inc({ endpoint: 'genres', status: 'attempt' });
    
    const audiobooksUrl = `${mangoConfig.baseUrl}/audiobooks`;
    const html = await fetchPage(audiobooksUrl);
    
    // Try to detect JSON endpoints
    const endpoints = await detectJsonEndpoints(html);
    if (endpoints.length > 0) {
      logger.info({ endpoints }, 'Detected potential JSON API endpoints');
    }
    
    // Scrape genres from HTML
    const genres = scrapeGenres(html);
    
    // Cache the result
    cache.setGenres(genres);
    
    mangoRequests.inc({ endpoint: 'genres', status: 'success' });
    
    return genres;
  } catch (error) {
    mangoRequests.inc({ endpoint: 'genres', status: 'error' });
    logger.error({ error }, 'Failed to fetch genres from Mango');
    throw new Error(`Failed to fetch genres: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns the fixed set of timeframes
 */
export function listTimeframes(): Timeframe[] {
  return ['1w', '1m', '3m', '6m', '1y', 'all'];
}

/**
 * Gets top audiobooks by genre and timeframe
 */
export async function getTopByGenre(genre: string, timeframe: Timeframe, limit = 25): Promise<MangoItem[]> {
  const cacheKey = `${genre}:${timeframe}:${limit}`;
  
  // Check cache first
  const cached = cache.getTopList(cacheKey);
  if (cached) {
    logger.debug({ genre, timeframe, count: cached.length }, 'Returning cached top list');
    mangoItemsReturned.inc({ genre, timeframe }, cached.length);
    return cached;
  }
  
  try {
    mangoRequests.inc({ endpoint: 'top', status: 'attempt' });
    
    // Construct URL based on genre and timeframe
    // This is a best guess - the actual URL structure may need adjustment
    const baseUrl = `${mangoConfig.baseUrl}/audiobooks`;
    const params = new URLSearchParams();
    
    if (genre && genre !== 'all') {
      params.append('genre', genre);
    }
    if (timeframe && timeframe !== 'all') {
      params.append('time', timeframe);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    const url = `${baseUrl}?${params.toString()}`;
    const html = await fetchPage(url);
    
    // Scrape items from HTML
    const items = scrapeItems(html, genre, timeframe);
    
    // Limit results
    const limitedItems = items.slice(0, limit);
    
    // Cache the result
    cache.setTopList(cacheKey, limitedItems);
    
    mangoRequests.inc({ endpoint: 'top', status: 'success' });
    mangoItemsReturned.inc({ genre, timeframe }, limitedItems.length);
    
    return limitedItems;
  } catch (error) {
    mangoRequests.inc({ endpoint: 'top', status: 'error' });
    logger.error({ error, genre, timeframe }, 'Failed to fetch top items from Mango');
    throw new Error(`Failed to fetch top items: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
