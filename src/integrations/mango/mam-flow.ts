import { Page } from 'puppeteer';
import { logger } from '../../utils/logger';
import { browserScraper } from './browser-scraper';

// Fixed canonical labels - never change at runtime
export const CANONICAL_GENRES = [
  'All AudioBooks',
  'Action/Adventure', 
  'Art',
  'Biographical',
  'Business',
  'Computer/Internet',
  'Crafts',
  'Crime/Thriller',
  'Fantasy',
  'Food',
  'General Fiction',
  'General Non-Fic',
  'Historical Fiction',
  'History',
  'Home/Garden',
  'Horror',
  'Humor',
  'Instructional',
  'Juvenile',
  'Language',
  'Literary Classics',
  'Math/Science/Tech',
  'Medical',
  'Mystery',
  'Nature',
  'Philosophy',
  'Pol/Soc/Relig',
  'Recreation',
  'Romance',
  'Science Fiction',
  'Self-Help',
  'Travel/Adventure',
  'True Crime',
  'Urban Fantasy',
  'Western',
  'Young Adult'
] as const;

export const CANONICAL_TIME_WINDOWS = [
  'week',
  'month', 
  '3 months',
  '6 months',
  '1 year',
  'all time'
] as const;

export type CanonicalGenre = typeof CANONICAL_GENRES[number];
export type CanonicalTimeWindow = typeof CANONICAL_TIME_WINDOWS[number];

// Runtime link mapping
interface GenreTimeLink {
  genre: CanonicalGenre;
  timeWindow: CanonicalTimeWindow;
  mamUrl: string;
  lastRefreshed: number;
}

// MAM item structure for this flow
export interface MAMFlowItem {
  title: string;
  author: string;
  magnetUrl?: string;
  torrentUrl?: string;
  infohash?: string;
  detailsPageUrl: string;
}

// Paginated results
export interface MAMFlowResults {
  items: MAMFlowItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Rate limiting per guild/user
const rateLimiter = new Map<string, { lastRequest: number; requestCount: number }>();

class MAMFlowManager {
  private linkCache = new Map<string, GenreTimeLink>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

  /**
   * Check rate limiting for guild/user combination
   */
  private checkRateLimit(guildId: string, userId: string): boolean {
    const key = `${guildId}:${userId}`;
    const now = Date.now();
    const limit = rateLimiter.get(key);

    if (!limit) {
      rateLimiter.set(key, { lastRequest: now, requestCount: 1 });
      return true;
    }

    if (now - limit.lastRequest > this.RATE_LIMIT_WINDOW) {
      // Reset window
      rateLimiter.set(key, { lastRequest: now, requestCount: 1 });
      return true;
    }

    if (limit.requestCount >= this.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    limit.requestCount++;
    limit.lastRequest = now;
    return true;
  }

  /**
   * Build MAM browse URL directly using the genre and time window
   */
  private buildMAMBrowseUrl(genre: CanonicalGenre, timeWindow: CanonicalTimeWindow): string {
    const baseUrl = 'https://www.myanonamouse.net/tor/browse.php';
    const params = new URLSearchParams();
    
    // Basic audiobook search parameters
    params.append('tor[srchIn][title]', 'true');
    params.append('tor[srchIn][author]', 'true');
    params.append('tor[srchIn][narrator]', 'true');
    params.append('tor[searchType]', 'all');
    params.append('tor[searchIn]', 'torrents');
    params.append('tor[cat][]', '42'); // Audiobooks category
    params.append('tor[browse_lang][]', '1'); // English
    params.append('tor[browseFlagsHideVsShow]', '0');
    params.append('tor[sortType]', 'snatchedDesc'); // Most popular first
    params.append('tor[startNumber]', '0');
    params.append('thumbnail', 'true');
    
    // Add date range based on time window
    const now = new Date();
    const startDate = new Date(now);
    
    switch (timeWindow) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3 months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6 months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1 year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all time':
        // Don't set date filters for all time
        break;
    }
    
    if (timeWindow !== 'all time') {
      params.append('tor[startDate]', startDate.toISOString().split('T')[0]);
      params.append('tor[endDate]', now.toISOString().split('T')[0]);
    }
    
    // Add genre-specific search terms if not "All AudioBooks"
    if (genre !== 'All AudioBooks') {
      // Use the genre name as a search term
      params.append('tor[search]', genre);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get fresh MAM URL for a genre/time combination by building it directly
   */
  private async refreshLinkForGenreTime(genre: CanonicalGenre, timeWindow: CanonicalTimeWindow): Promise<string> {
    const cacheKey = `${genre}:${timeWindow}`;
    const cached = this.linkCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastRefreshed < this.CACHE_TTL) {
      return cached.mamUrl;
    }

    logger.info({ genre, timeWindow }, 'Building MAM URL for genre/time combination');

    // Build the MAM URL directly instead of scraping Mango
    const mamUrl = this.buildMAMBrowseUrl(genre, timeWindow);

    // Cache the result
    this.linkCache.set(cacheKey, {
      genre,
      timeWindow,
      mamUrl,
      lastRefreshed: Date.now()
    });

    logger.info({ genre, timeWindow, mamUrl }, 'Built MAM URL');
    return mamUrl;
  }

  /**
   * Scrape MAM results page and extract items with pagination
   */
  async getMAMResults(
    genre: CanonicalGenre, 
    timeWindow: CanonicalTimeWindow, 
    page: number = 1,
    guildId: string,
    userId: string
  ): Promise<MAMFlowResults> {
    // Rate limiting check
    if (!this.checkRateLimit(guildId, userId)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    try {
      // First try direct MAM scraping
      return await this.getMAMResultsDirect(genre, timeWindow, page, guildId, userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn({ error: errorMessage, genre, timeWindow }, 'Direct MAM scraping failed, trying Mango API fallback');
      
      // Fallback to Mango API
      return await this.getMAMResultsViaMangoAPI(genre, timeWindow, page, guildId, userId);
    }
  }

  /**
   * Direct MAM scraping (original method)
   */
  private async getMAMResultsDirect(
    genre: CanonicalGenre, 
    timeWindow: CanonicalTimeWindow, 
    page: number = 1,
    guildId: string,
    userId: string
  ): Promise<MAMFlowResults> {
    // Get fresh MAM URL
    const mamUrl = await this.refreshLinkForGenreTime(genre, timeWindow);
    
    const browserPage = await browserScraper.createPage();
    
    try {
      await browserPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await browserPage.setViewport({ width: 1920, height: 1080 });

      // Login to MAM - this is critical for session persistence
      const loginSuccess = await browserScraper.performMAMLogin(browserPage);
      if (!loginSuccess) {
        throw new Error('Failed to login to MAM');
      }

      // Navigate to MAM results page
      await browserPage.goto(mamUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a moment for page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if we got redirected to login page (session expired)
      const currentUrl = await browserPage.url();
      if (currentUrl.includes('login.php')) {
        logger.warn({ originalUrl: mamUrl, currentUrl }, 'Redirected to login page, session may have expired');
        
        // Try to login again
        const secondLoginAttempt = await browserScraper.performMAMLogin(browserPage);
        if (!secondLoginAttempt) {
          throw new Error('Failed to re-login to MAM after redirect');
        }

        // Navigate to the target URL again
        await browserPage.goto(mamUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Final check - if we're still on login page, there's a persistent login issue
      const finalUrl = await browserPage.url();
      if (finalUrl.includes('login.php')) {
        const pageTitle = await browserPage.title();
        logger.error({ mamUrl, finalUrl, pageTitle }, 'Still on login page after multiple attempts');
        throw new Error('Unable to access MAM browse page - login session not persisting');
      }

      // Wait for results table with a longer timeout
      try {
        await browserPage.waitForSelector('table.coltable, .torrentTable, #searchResult, table', { timeout: 20000 });
      } catch (error) {
        logger.warn({ mamUrl }, 'Timeout waiting for results table, proceeding anyway');
      }

      // Extract all items from the page
      const allItems = await this.extractMAMItems(browserPage);
      
      if (allItems.length === 0) {
        throw new Error('No items extracted from MAM page');
      }
      
      logger.info({ 
        genre, 
        timeWindow, 
        page, 
        extractedItems: allItems.length,
        sampleTitles: allItems.slice(0, 3).map(item => item.title)
      }, 'Extracted MAM items from page');
      
      // Implement pagination: 5 items per page
      const itemsPerPage = 5;
      const totalItems = allItems.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = allItems.slice(startIndex, endIndex);

      logger.info({ 
        genre, 
        timeWindow, 
        page, 
        totalPages, 
        totalItems, 
        pageItems: pageItems.length 
      }, 'Extracted MAM results with pagination');

      return {
        items: pageItems,
        currentPage: page,
        totalPages,
        totalItems
      };

    } finally {
      await browserPage.close();
    }
  }

  /**
   * Fallback method using Mango API
   */
  private async getMAMResultsViaMangoAPI(
    genre: CanonicalGenre, 
    timeWindow: CanonicalTimeWindow, 
    page: number = 1,
    guildId: string,
    userId: string
  ): Promise<MAMFlowResults> {
    logger.info({ genre, timeWindow }, 'Using Mango API fallback for MAM results');

    // Map time windows to Mango API format
    const timeFrameMap: Record<CanonicalTimeWindow, string> = {
      'week': '1w',
      'month': '1m', 
      '3 months': '3m',
      '6 months': '6m',
      '1 year': '1y',
      'all time': 'all'
    };

    const timeframe = timeFrameMap[timeWindow] || '1m';

    try {
      // Use the browser scraper to get results from Mango
      const mangoResults = await browserScraper.scrapeByGenreAndTimeframe(genre, timeframe as any, 25);
      
      // Convert Mango results to MAM format
      const mamItems: MAMFlowItem[] = mangoResults.map((item, index) => ({
        title: item.title,
        author: item.author,
        detailsPageUrl: item.url,
        // Add fallback download URLs if available
        magnetUrl: item.url.includes('magnet:') ? item.url : undefined,
        torrentUrl: !item.url.includes('magnet:') ? item.url : undefined
      }));

      // Implement pagination: 5 items per page
      const itemsPerPage = 5;
      const totalItems = mamItems.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = mamItems.slice(startIndex, endIndex);

      logger.info({ 
        genre, 
        timeWindow, 
        page, 
        totalPages, 
        totalItems, 
        pageItems: pageItems.length,
        source: 'mango-api'
      }, 'Retrieved results via Mango API fallback');

      return {
        items: pageItems,
        currentPage: page,
        totalPages,
        totalItems
      };

    } catch (error) {
      logger.error({ error, genre, timeWindow }, 'Mango API fallback also failed');
      
      // Return empty results rather than failing completely
      return {
        items: [],
        currentPage: page,
        totalPages: 0,
        totalItems: 0
      };
    }
  }

  /**
   * Extract MAM items from the results page using the actual MAM page structure
   */
  private async extractMAMItems(page: Page): Promise<MAMFlowItem[]> {
    return await page.evaluate(() => {
      const items: any[] = [];
      
      // Look for the main torrent table - MAM uses a specific structure
      // Based on the provided MAM page, look for table rows with torrent data
      const rows = document.querySelectorAll('table tr');
      
      for (const row of rows) {
        // Skip header rows and empty rows
        if (row.querySelector('th') || !row.querySelector('td')) continue;
        
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) continue; // Need at least several columns for torrent data
        
        // Look for the title cell - usually contains the main torrent link
        let titleLink: HTMLAnchorElement | null = null;
        let title = '';
        let author = 'Unknown Author';
        
        // Search through cells for the main title link
        for (const cell of cells) {
          const links = cell.querySelectorAll('a');
          for (const link of links) {
            const href = link.href || '';
            const text = link.textContent?.trim() || '';
            
            // Look for links that go to torrent details pages
            if (href.includes('/tor/') && text.length > 5 && !text.includes('comment')) {
              titleLink = link as HTMLAnchorElement;
              title = text;
              break;
            }
          }
          if (titleLink) break;
        }
        
        if (!titleLink || !title) continue;
        
        // Parse title to extract author - MAM often uses "Title by Author" format
        const byMatch = title.match(/^(.+?)\s+by\s+(.+)$/i);
        if (byMatch) {
          title = byMatch[1].trim();
          author = byMatch[2].trim();
        }
        
        // Clean up title and author
        title = title.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
        author = author.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
        
        // Get the torrent details URL
        let detailsUrl = titleLink.href;
        if (!detailsUrl.startsWith('http')) {
          detailsUrl = `https://www.myanonamouse.net${detailsUrl}`;
        }
        
        // Only add if we have valid title and URL
        if (title.length > 0 && detailsUrl.includes('/tor/')) {
          items.push({
            title,
            author,
            detailsPageUrl: detailsUrl
          });
        }
      }
      
      // Enhanced debug info to help troubleshoot
      const debugInfo = {
        url: window.location.href,
        title: document.title,
        totalRows: document.querySelectorAll('tr').length,
        torrentLinks: document.querySelectorAll('a[href*="/tor/"]').length,
        extractedItems: items.length
      };
      
      console.log('MAM Extraction Enhanced Debug:', JSON.stringify(debugInfo, null, 2));
      
      if (items.length > 0) {
        console.log('First few extracted items:', items.slice(0, 3));
      } else {
        // If no items found, show what we're seeing on the page
        const pageIndicators = {
          hasSearchResults: document.body.textContent?.includes('Search Results'),
          hasJumpTo: document.body.textContent?.includes('Jump to'),
          hasTorrents: document.body.textContent?.includes('torrent'),
          bodySnippet: document.body.textContent?.substring(0, 300)
        };
        console.log('No items found, page indicators:', JSON.stringify(pageIndicators, null, 2));
      }
      
      return items;
    });
  }

  /**
   * Get download metadata for a specific MAM item
   */
  async getDownloadMetadata(item: MAMFlowItem): Promise<MAMFlowItem> {
    const page = await browserScraper.createPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Login to MAM
      const loginSuccess = await browserScraper.performMAMLogin(page);
      if (!loginSuccess) {
        throw new Error('Failed to login to MAM for download metadata');
      }

      // Navigate to item details page
      await page.goto(item.detailsPageUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract download URLs
      const downloadData = await page.evaluate(() => {
        // Look for magnet link
        const magnetLink = document.querySelector('a[href^="magnet:"]') as HTMLAnchorElement;
        if (magnetLink) {
          return { magnetUrl: magnetLink.href };
        }

        // Look for torrent download link
        const torrentLink = document.querySelector('a[href*="download"], a[href*="/tor/"]') as HTMLAnchorElement;
        if (torrentLink) {
          let href = torrentLink.href;
          if (!href.startsWith('http')) {
            href = `https://www.myanonamouse.net${href}`;
          }
          return { torrentUrl: href };
        }

        return {};
      });

      return {
        ...item,
        ...downloadData
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Dry run mode for testing
   */
  async dryRun(genre: CanonicalGenre, timeWindow: CanonicalTimeWindow, guildId: string, userId: string): Promise<string> {
    try {
      const results = await this.getMAMResults(genre, timeWindow, 1, guildId, userId);
      
      let output = `\n=== DRY RUN: ${genre} + ${timeWindow} ===\n`;
      output += `Total items: ${results.totalItems}, Page 1 of ${results.totalPages}\n\n`;
      
      results.items.forEach((item, index) => {
        output += `${index + 1}) ${item.title}, ${item.author}\n`;
      });
      
      return output;
    } catch (error) {
      return `DRY RUN ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

export const mamFlowManager = new MAMFlowManager();
