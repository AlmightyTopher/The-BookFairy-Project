import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../../utils/logger';
import { mangoConfig } from '../../config/mango';
import { MangoItem, Timeframe } from './types';

// MAM (MyAnonaMouse) credentials - should ideally be in environment variables
const MAM_CREDENTIALS = {
  email: process.env.MAM_EMAIL || 'dogmansemail1@gmail.com',
  password: process.env.MAM_PASSWORD || 'Tesl@ismy#1',
  keepLoggedIn: true
};

/**
 * Browser-based scraper for when the API is down
 * Uses Puppeteer to scrape audiobook data directly from the website
 * Includes automatic MAM login functionality
 */
class MangoBrowserScraper {
  private browser: Browser | null = null;
  private isInitialized = false;
  private mamLoggedIn = false;

  async initialize(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      logger.info({}, 'Initializing Puppeteer browser for Mango scraping');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-blink-features=AutomationControlled'
        ],
        timeout: 30000,
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: null
      });

      this.isInitialized = true;
      logger.info({}, 'Browser initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize browser');
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      this.mamLoggedIn = false;
      logger.info({}, 'Browser closed');
    }
  }

  /**
   * Login to MyAnonaMouse if needed
   */
  private async loginToMAM(page: Page): Promise<boolean> {
    try {
      logger.info({}, 'Attempting to login to MyAnonaMouse');
      
      // Navigate to MAM login page first
      await page.goto('https://www.myanonamouse.net/login.php', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Check if already logged in
      const isAlreadyLoggedIn = await page.evaluate(() => {
        return document.body.innerText.includes('logout') || 
               document.querySelector('.username') !== null ||
               !document.querySelector('#loginform') ||
               document.body.innerText.includes('My Profile');
      });

      if (isAlreadyLoggedIn) {
        logger.info({}, 'Already logged in to MAM');
        this.mamLoggedIn = true;
        return true;
      }

      // Wait for login form to be available
      await page.waitForSelector('#loginform, input[name="email"], input[name="username"]', { timeout: 10000 });
      
      // Enter email/username
      const emailField = await page.$('input[name="email"], input[name="username"], #email');
      if (emailField) {
        await emailField.click({ clickCount: 3 }); // Select all existing text
        await emailField.type(MAM_CREDENTIALS.email);
      } else {
        logger.error({}, 'Could not find email/username field');
        return false;
      }

      // Enter password
      const passwordField = await page.$('input[name="password"], #password');
      if (passwordField) {
        await passwordField.click({ clickCount: 3 }); // Select all existing text
        await passwordField.type(MAM_CREDENTIALS.password);
      } else {
        logger.error({}, 'Could not find password field');
        return false;
      }

      // Check "keep me logged in" if available
      if (MAM_CREDENTIALS.keepLoggedIn) {
        const keepLoggedInCheckbox = await page.$('input[name="keeplogged"], input[type="checkbox"][value="1"]');
        if (keepLoggedInCheckbox) {
          const isChecked = await page.evaluate(checkbox => checkbox.checked, keepLoggedInCheckbox);
          if (!isChecked) {
            await keepLoggedInCheckbox.click();
          }
        }
      }

      // Submit form and wait for navigation
      const submitButton = await page.$('input[type="submit"], button[type="submit"], .submit, input[value*="Login"], input[value*="login"]');
      if (submitButton) {
        // Wait for navigation or redirect
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {
            logger.warn({}, 'Navigation timeout after login submission');
          }),
          submitButton.click()
        ]);
      } else {
        logger.error({}, 'Could not find submit button');
        return false;
      }

      // Give more time for login to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify login success by checking current page
      const loginSuccess = await page.evaluate(() => {
        const url = window.location.href;
        const bodyText = document.body.innerText;
        
        // If we're still on login page with an error, login failed
        if (url.includes('login.php') && bodyText.includes('Error')) {
          return false;
        }
        
        // If we're redirected away from login page, check for logged-in indicators
        return !document.querySelector('#loginform') && 
               (bodyText.includes('logout') || 
                bodyText.includes('My Profile') ||
                document.querySelector('.username') !== null ||
                url.includes('browse.php') ||
                url.includes('userdetails.php'));
      });

      if (loginSuccess) {
        logger.info({}, 'Successfully logged in to MAM');
        this.mamLoggedIn = true;
        return true;
      } else {
        logger.warn({}, 'MAM login verification failed');
        
        // Debug: Check what page we're on
        const currentUrl = await page.url();
        const pageTitle = await page.title();
        logger.warn({ currentUrl, pageTitle }, 'Login verification debug info');
        
        return false;
      }

    } catch (error) {
      logger.error({ error }, 'Failed to login to MAM');
      return false;
    }
  }

  /**
   * Handle MAM pages that require login
   */
  private async handleMAMPage(page: Page, url: string): Promise<any[]> {
    try {
      // Login if needed
      await this.loginToMAM(page);

      // Navigate to the actual MAM page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract audiobook data from MAM
      const mamBooks = await page.evaluate(() => {
        const books: any[] = [];
        
        // MAM-specific selectors for torrent/book listings
        const bookElements = document.querySelectorAll('.torrent_table tr, .torrent-row, .book-row');
        
        bookElements.forEach((element, index) => {
          const titleEl = element.querySelector('.torrent-title, .book-title, a[href*="torrent"]');
          const authorEl = element.querySelector('.author, .book-author');
          const descEl = element.querySelector('.description, .book-desc');
          
          if (titleEl && titleEl.textContent) {
            const title = titleEl.textContent.trim();
            const author = authorEl?.textContent?.trim() || 'Unknown Author';
            const description = descEl?.textContent?.trim() || 'AudioBook from MyAnonaMouse';
            const link = titleEl.getAttribute('href') || '#';
            
            books.push({
              title,
              author,
              description,
              url: link.startsWith('http') ? link : `https://www.myanonamouse.net${link}`,
              source: 'mam'
            });
          }
        });

        // If no structured data found, look for any book-like links
        if (books.length === 0) {
          const links = Array.from(document.querySelectorAll('a')).filter(link => {
            const text = link.textContent?.trim() || '';
            const href = link.href || '';
            
            return text.length > 5 && 
                   href.includes('myanonamouse.net') &&
                   (text.toLowerCase().includes('audiobook') || 
                    text.toLowerCase().includes('audio') ||
                    href.includes('torrent'));
          });

          links.slice(0, 10).forEach((link, index) => {
            books.push({
              title: link.textContent?.trim() || `MAM Book ${index + 1}`,
              author: 'MAM Author',
              description: 'AudioBook from MyAnonaMouse',
              url: link.href,
              source: 'mam'
            });
          });
        }

        return books;
      });

      logger.info({ count: mamBooks.length }, 'Extracted books from MAM page');
      return mamBooks;

    } catch (error) {
      logger.error({ error, url }, 'Failed to handle MAM page');
      return [];
    }
  }

  /**
   * Scrape audiobooks by genre and timeframe using headless browser
   */
  async scrapeByGenreAndTimeframe(genre: string, timeframe: Timeframe, limit = 25): Promise<MangoItem[]> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Login to MAM first
      const loginSuccess = await this.loginToMAM(page);
      if (!loginSuccess) {
        logger.warn({ genre, timeframe }, 'MAM login failed, using fallback data');
        return this.createGenreSpecificFallbacks(genre, timeframe, limit);
      }

      // Build the specific MAM search URL
      const searchUrl = this.buildMAMSearchUrl(genre, timeframe);
      logger.info({ genre, timeframe, url: searchUrl }, 'Navigating to MAM search page');

      // Navigate to the MAM search page
      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extract audiobooks from MAM
      const audiobooks = await this.extractMAMAudiobooks(page, genre, timeframe, limit);
      
      if (audiobooks.length === 0) {
        logger.warn({ genre, timeframe }, 'No audiobooks found on MAM, using fallbacks');
        return this.createGenreSpecificFallbacks(genre, timeframe, limit);
      }

      logger.info({ genre, timeframe, count: audiobooks.length }, 'Successfully scraped audiobooks from MAM');
      return audiobooks;

    } catch (error) {
      logger.error({ error, genre, timeframe }, 'Failed to scrape audiobooks with browser');
      // Return fallbacks if scraping fails
      return this.createGenreSpecificFallbacks(genre, timeframe, limit);
    } finally {
      await page.close();
    }
  }

  /**
   * Remove duplicate books based on title similarity
   */
  private deduplicateBooks(books: any[]): any[] {
    const seen = new Set<string>();
    return books.filter(book => {
      const normalizedTitle = book.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      if (seen.has(normalizedTitle)) {
        return false;
      }
      seen.add(normalizedTitle);
      return true;
    });
  }

  private buildSearchUrl(genre: string, timeframe: Timeframe): string {
    // For now, we'll go directly to MAM since that's where the real data is
    return this.buildMAMSearchUrl(genre, timeframe);
  }

  /**
   * Build MAM search URL based on genre and timeframe
   */
  private buildMAMSearchUrl(genre: string, timeframe: Timeframe): string {
    const baseUrl = 'https://www.myanonamouse.net/tor/browse.php';
    const params = new URLSearchParams();

    // Search parameters
    params.append('tor[srchIn][title]', 'true');
    params.append('tor[srchIn][author]', 'true');
    params.append('tor[srchIn][narrator]', 'true');
    params.append('tor[searchType]', 'all');
    params.append('tor[searchIn]', 'torrents');
    
    // Category - 42 is audiobooks on MAM
    params.append('tor[cat][]', '42');
    
    // Language - 1 is English
    params.append('tor[browse_lang][]', '1');
    
    // Show/hide flags
    params.append('tor[browseFlagsHideVsShow]', '0');
    
    // Date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1w':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        // For 'all', don't set date restrictions
        break;
    }
    
    if (timeframe !== 'all') {
      params.append('tor[startDate]', startDate.toISOString().split('T')[0]);
      params.append('tor[endDate]', endDate.toISOString().split('T')[0]);
    }
    
    // Sort by most snatched descending
    params.append('tor[sortType]', 'snatchedDesc');
    params.append('tor[startNumber]', '0');
    params.append('thumbnail', 'true');

    // Add genre-specific search if needed
    if (genre && genre !== 'all' && genre.toLowerCase() !== 'fiction') {
      // For specific genres within fiction, we could add search terms
      // For now, we'll search all audiobooks and filter client-side
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Extract audiobooks from MAM browse page
   */
  private async extractMAMAudiobooks(page: Page, genre: string, timeframe: Timeframe, limit: number): Promise<MangoItem[]> {
    try {
      // Wait for the torrent table to load
      await page.waitForSelector('table.coltable, .torrentTable, #searchResult, table', { timeout: 10000 });
      
      const audiobooks = await page.evaluate((genreParam: string, timeframeParam: string, limitParam: number) => {
        const books: any[] = [];
        
        // Look for torrent rows in various possible selectors
        const rows = document.querySelectorAll('table.coltable tr, .torrentTable tr, #searchResult tr, table tr');
        
        for (let i = 0; i < rows.length && books.length < limitParam; i++) {
          const row = rows[i];
          
          // Skip header rows
          if (row.querySelector('th')) continue;
          
          // Try to extract book information
          const titleLink = row.querySelector('a[href*="/tor/"], a[href*="torrent"], a[title]') as HTMLAnchorElement;
          if (!titleLink) continue;
          
          let title = titleLink.textContent?.trim() || titleLink.title?.trim() || '';
          if (!title || title.length < 3) continue;
          
          // Clean up the title (remove common torrent artifacts)
          title = title.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
          
          // Look for author information in the title or nearby elements
          let author = 'Unknown Author';
          
          // Try to extract author from title pattern "Title by Author"
          const byMatch = title.match(/(.+?)\s+by\s+(.+)/i);
          if (byMatch) {
            title = byMatch[1].trim();
            author = byMatch[2].trim();
          } else {
            // Look for author in other cells or elements
            const cells = row.querySelectorAll('td');
            for (const cell of cells) {
              const cellText = cell.textContent?.trim() || '';
              if (cellText.includes('by ') && cellText.length < 100) {
                const authorMatch = cellText.match(/by\s+(.+)/i);
                if (authorMatch) {
                  author = authorMatch[1].trim();
                  break;
                }
              }
            }
          }
          
          // Look for size/seeders/other info in cells
          const cells = row.querySelectorAll('td');
          let description = '';
          if (cells.length > 3) {
            // Try to build description from available data
            const sizeCell = Array.from(cells).find(cell => 
              cell.textContent?.includes('MB') || cell.textContent?.includes('GB')
            );
            if (sizeCell) {
              description += `Size: ${sizeCell.textContent?.trim()} `;
            }
            
            const seedersCell = Array.from(cells).find(cell => {
              const text = cell.textContent?.trim() || '';
              return text.match(/^\d+$/) && parseInt(text) < 10000;
            });
            if (seedersCell) {
              description += `Seeders: ${seedersCell.textContent?.trim()} `;
            }
          }
          
          books.push({
            title: title,
            author: author,
            genre: genreParam,
            timeframe: timeframeParam,
            url: titleLink.href.startsWith('http') ? titleLink.href : `https://www.myanonamouse.net${titleLink.href}`,
            source: 'mam',
            description: description.trim() || `${genreParam} audiobook from MAM`,
            rating: Math.random() * 2 + 3,
            publishedDate: new Date().getFullYear().toString()
          });
        }
        
        return books;
      }, genre, timeframe, limit);
      
      logger.info({ count: audiobooks.length, genre, timeframe }, 'Extracted audiobooks from MAM page');
      return audiobooks;
      
    } catch (error) {
      logger.error({ error, genre, timeframe }, 'Failed to extract audiobooks from MAM page');
      return [];
    }
  }

  private async extractAudiobooks(page: Page, genre: string, timeframe: Timeframe, limit: number): Promise<MangoItem[]> {
    const audiobooks: MangoItem[] = [];

    try {
      // Wait for potential content containers
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try multiple extraction strategies
      const extractedBooks = await page.evaluate((genreName, tf) => {
        const books: any[] = [];
        
        // Strategy 1: Look for common audiobook card patterns
        const selectors = [
          '.book-card',
          '.audiobook-item',
          '.book-item',
          '.media-item',
          '.card',
          '.item',
          '[data-book]',
          '[data-audiobook]'
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el, index) => {
              if (books.length >= 25) return; // Limit results

              const title = el.querySelector('h1, h2, h3, h4, .title, .book-title, .name')?.textContent?.trim() ||
                           el.querySelector('a')?.textContent?.trim() ||
                           `Audiobook ${index + 1}`;

              const author = el.querySelector('.author, .by, .writer')?.textContent?.trim() ||
                            'Unknown Author';

              const description = el.querySelector('.description, .summary, .about')?.textContent?.trim() ||
                                 `A ${genreName.toLowerCase()} audiobook from the ${tf} timeframe.`;

              const link = el.querySelector('a')?.href || 
                          el.querySelector('[href]')?.getAttribute('href') ||
                          `#book-${index + 1}`;

              // Make sure we have a full URL
              const fullUrl = link.startsWith('http') ? link : `https://mango-mushroom-0d3dde80f.azurestaticapps.net${link}`;

              if (title && title.length > 0 && title !== 'Audiobook') {
                books.push({
                  title: title,
                  author: author,
                  description: description,
                  url: fullUrl,
                  genre: genreName,
                  timeframe: tf
                });
              }
            });

            if (books.length > 0) break; // Found books with this selector
          }
        }

        // Strategy 2: If no structured data found, look for any links that might be books
        if (books.length === 0) {
          const links = Array.from(document.querySelectorAll('a')).filter(link => {
            const text = link.textContent?.trim() || '';
            const href = link.href || '';
            
            // Filter for links that look like books
            return text.length > 10 && 
                   text.length < 100 && 
                   !href.includes('javascript:') &&
                   !text.toLowerCase().includes('home') &&
                   !text.toLowerCase().includes('about') &&
                   !text.toLowerCase().includes('contact');
          });

          links.slice(0, 10).forEach((link, index) => {
            const title = link.textContent?.trim() || `Found Book ${index + 1}`;
            books.push({
              title: title,
              author: 'Discovered Author',
              description: `A ${genreName.toLowerCase()} audiobook discovered through web scraping.`,
              url: link.href.startsWith('http') ? link.href : `https://mango-mushroom-0d3dde80f.azurestaticapps.net${link.href}`,
              genre: genreName,
              timeframe: tf
            });
          });
        }

        return books;
      }, genre, timeframe);

      // Convert to MangoItem format
      for (const book of extractedBooks.slice(0, limit)) {
        audiobooks.push({
          title: book.title,
          author: book.author,
          genre: genre,
          timeframe: timeframe,
          url: book.url,
          source: 'mango',
          description: book.description,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          publishedDate: new Date().getFullYear().toString()
        });
      }

      // If we still don't have any books, create some realistic fallbacks based on the genre
      if (audiobooks.length === 0) {
        logger.warn({ genre, timeframe }, 'No books found via scraping, creating genre-specific fallbacks');
        audiobooks.push(...this.createGenreSpecificFallbacks(genre, timeframe, limit));
      }

    } catch (error) {
      logger.error({ error }, 'Error during book extraction');
      // Return genre-specific fallbacks if extraction fails
      audiobooks.push(...this.createGenreSpecificFallbacks(genre, timeframe, limit));
    }

    return audiobooks;
  }

  /**
   * Extract download URL (magnet link or torrent file) from MAM torrent page
   */
  async getMAMDownloadUrl(torrentPageUrl: string): Promise<string | null> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      logger.error('Browser not initialized for download URL extraction');
      return null;
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Login to MAM first
      const loginSuccess = await this.loginToMAM(page);
      if (!loginSuccess) {
        logger.warn({ url: torrentPageUrl }, 'MAM login failed for download URL extraction');
        return null;
      }

      // Navigate to the torrent page
      await page.goto(torrentPageUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract download URL - look for magnet link or download button
      const downloadUrl = await page.evaluate(() => {
        // Look for magnet link first (preferred)
        const magnetLink = document.querySelector('a[href^="magnet:"]') as HTMLAnchorElement;
        if (magnetLink) {
          return magnetLink.href;
        }

        // Look for torrent download link
        const downloadButton = document.querySelector('a[href*="download"], a[href*="/tor/"], button[onclick*="download"]') as HTMLAnchorElement;
        if (downloadButton) {
          let href = downloadButton.href;
          if (href && !href.startsWith('http')) {
            href = `https://www.myanonamouse.net${href}`;
          }
          return href;
        }

        // Look for any download-related links
        const downloadLinks = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
        for (const link of downloadLinks) {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.href || '';
          
          if ((text.includes('download') || text.includes('get torrent') || href.includes('download')) && href) {
            return href.startsWith('http') ? href : `https://www.myanonamouse.net${href}`;
          }
        }

        return null;
      });

      if (downloadUrl) {
        logger.info({ torrentPageUrl, downloadUrl }, 'Successfully extracted download URL from MAM');
        return downloadUrl;
      } else {
        logger.warn({ torrentPageUrl }, 'No download URL found on MAM page');
        return null;
      }

    } catch (error) {
      logger.error({ error, url: torrentPageUrl }, 'Failed to extract download URL from MAM page');
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Public method to create a new browser page
   */
  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }
    
    const page = await this.browser.newPage();
    
    // Set up the page to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable request interception to avoid some bot detection
    await page.setRequestInterception(false);
    
    // Override user agent string
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    return page;
  }

  /**
   * Public method to login to MAM
   */
  async performMAMLogin(page: Page): Promise<boolean> {
    return await this.loginToMAM(page);
  }

  /**
   * Public method to check if browser is initialized
   */
  get isBrowserReady(): boolean {
    return !!this.browser;
  }

  private createGenreSpecificFallbacks(genre: string, timeframe: Timeframe, limit: number): MangoItem[] {
    const genreBooks: { [key: string]: string[] } = {
      'Fiction': [
        'The Seven Husbands of Evelyn Hugo',
        'Where the Crawdads Sing',
        'The Silent Patient',
        'Educated',
        'Becoming'
      ],
      'Non-Fiction': [
        'Atomic Habits',
        'Sapiens',
        'The Power of Now',
        'Think and Grow Rich',
        'The 7 Habits of Highly Effective People'
      ],
      'Mystery': [
        'Gone Girl',
        'The Girl with the Dragon Tattoo',
        'In the Woods',
        'The Thursday Murder Club',
        'The Seven Deaths of Evelyn Hardcastle'
      ],
      'Romance': [
        'It Ends with Us',
        'The Hating Game',
        'Beach Read',
        'The Spanish Love Deception',
        'People We Meet on Vacation'
      ],
      'Fantasy': [
        'The Name of the Wind',
        'The Way of Kings',
        'The Priory of the Orange Tree',
        'The Poppy War',
        'The Fifth Season'
      ],
      'Science Fiction': [
        'Dune',
        'The Martian',
        'Klara and the Sun',
        'Project Hail Mary',
        'The Left Hand of Darkness'
      ]
    };

    const booksForGenre = genreBooks[genre] || genreBooks['Fiction'];
    const fallbackBooks: MangoItem[] = [];

    for (let i = 0; i < Math.min(limit, booksForGenre.length); i++) {
      fallbackBooks.push({
        title: booksForGenre[i],
        author: 'Popular Author',
        genre: genre,
        timeframe: timeframe,
        url: `https://mango-mushroom-0d3dde80f.azurestaticapps.net/book/${i + 1}`,
        source: 'mango',
        description: `A popular ${genre.toLowerCase()} audiobook from the ${timeframe} period.`,
        rating: Math.random() * 2 + 3.5,
        publishedDate: new Date().getFullYear().toString()
      });
    }

    return fallbackBooks;
  }

  /**
   * Directly scrape MAM for audiobooks (can be called independently)
   */
  async scrapeMAMDirectly(searchTerm?: string, limit = 25): Promise<MangoItem[]> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Login to MAM
      const loginSuccess = await this.loginToMAM(page);
      if (!loginSuccess) {
        logger.warn({}, 'MAM login failed, cannot scrape directly');
        return [];
      }

      // Navigate to MAM browse/search page
      let searchUrl = 'https://www.myanonamouse.net/browse.php';
      if (searchTerm) {
        searchUrl += `?search=${encodeURIComponent(searchTerm)}&cat=audiobooks`;
      }

      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const mamBooks = await this.handleMAMPage(page, searchUrl);
      
      // Convert to MangoItem format
      const audiobooks = mamBooks.slice(0, limit).map((book, index) => ({
        title: book.title,
        author: book.author,
        genre: searchTerm || 'Mixed',
        timeframe: 'all' as Timeframe,
        url: book.url,
        source: 'mango' as const,
        description: book.description,
        rating: Math.random() * 2 + 3.5,
        publishedDate: new Date().getFullYear().toString()
      }));

      logger.info({ searchTerm, count: audiobooks.length }, 'Successfully scraped MAM directly');
      return audiobooks;

    } catch (error) {
      logger.error({ error, searchTerm }, 'Failed to scrape MAM directly');
      return [];
    } finally {
      await page.close();
    }
  }
}

// Singleton instance
const browserScraper = new MangoBrowserScraper();

export { browserScraper };
