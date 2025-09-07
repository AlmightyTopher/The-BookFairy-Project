import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscordSimulator } from '../mocks/discord-simulator.mock';
import { mockProwlarrClient } from '../mocks/prowlarr.mock';
import { mockQBittorrentClient } from '../mocks/qbittorrent.mock';
import { mockReadarrClient } from '../mocks/readarr.mock';
import { MessageHandler } from '../../src/bot/message-handler';
import testCases from './catalog.testcases.json';

// Mock external dependencies
vi.mock('../../src/clients/prowlarr-client', () => ({
  searchProwlarr: vi.fn(),
  checkProwlarrHealth: vi.fn()
}));

vi.mock('../../src/clients/qbittorrent-client', () => ({
  login: vi.fn(),
  addTorrent: vi.fn(),
  getTorrents: vi.fn(),
  getTorrentInfo: vi.fn()
}));

vi.mock('../../src/clients/readarr-client', () => ({
  getSystemStatus: vi.fn(),
  searchAuthor: vi.fn(),
  addAuthor: vi.fn()
}));

describe('Book Search Flow E2E Tests', () => {
  let simulator: DiscordSimulator;
  let messageHandler: MessageHandler;

  beforeEach(async () => {
    // Reset all mocks
    mockProwlarrClient.reset();
    mockQBittorrentClient.reset();
    mockReadarrClient.reset();
    
    // Setup qBittorrent login
    mockQBittorrentClient.forceLogin();

    // Create fresh simulator and message handler
    simulator = new DiscordSimulator();
    messageHandler = new MessageHandler();

    // Setup mock implementations
    const { searchProwlarr } = await import('../../src/clients/prowlarr-client');
    const { login, addTorrent } = await import('../../src/clients/qbittorrent-client');
    
    vi.mocked(searchProwlarr).mockImplementation(mockProwlarrClient.searchProwlarr.bind(mockProwlarrClient));
    vi.mocked(login).mockImplementation(mockQBittorrentClient.login.bind(mockQBittorrentClient));
    vi.mocked(addTorrent).mockImplementation(mockQBittorrentClient.addTorrent.bind(mockQBittorrentClient));
  });

  afterEach(() => {
    simulator.reset();
    vi.clearAllMocks();
  });

  describe('Discord DM Entry and Greeting', () => {
    test('should greet user and show Book Search menu on DM entry', async () => {
      // Simulate user sending greeting in DM
      await simulator.simulateDMEntry();

      // Verify bot responds with greeting and menu
      expect(simulator.hasGreeting()).toBe(true);
      expect(simulator.hasBookSearchMenu()).toBe(true);

      const lastResponse = simulator.getLastBotResponse();
      expect(lastResponse?.content).toMatch(/welcome|book fairy|search/i);
    });

    test('should maintain consistent menu structure across interactions', async () => {
      await simulator.simulateDMEntry();
      
      // Check that essential buttons are mentioned or implied in responses
      const botResponses = simulator.getBotResponses();
      const hasSearchOptions = botResponses.some(msg => 
        msg.content.toLowerCase().includes('title') ||
        msg.content.toLowerCase().includes('author') ||
        msg.content.toLowerCase().includes('genre')
      );
      
      expect(hasSearchOptions).toBe(true);
    });
  });

  describe('Search by Title - Found Cases', () => {
    test.each(testCases.found.filter(tc => tc.mode === 'title'))(
      'should find results for title search: "$query"',
      async ({ query }) => {
        // Setup mock response for this query
        mockProwlarrClient.setMockResponse(query.toLowerCase(), {
          results: [
            {
              guid: `test-${query.replace(/\s+/g, '-').toLowerCase()}-001`,
              title: `${query} [ENG / MP3] [Test Author]`,
              size: 500000000,
              downloadUrl: `magnet:?xt=urn:btih:test${query.replace(/\s+/g, '')}`,
              seeders: 25,
              leechers: 2,
              publishDate: '2023-01-01T00:00:00Z',
              indexerId: 1
            }
          ],
          format: 'MP3',
          total: 1,
          indexerId: 1
        });

        // Simulate complete flow
        await simulator.simulateDMEntry();
        const searchResult = await simulator.simulateBookSearch(query, 'title');

        // Verify search results are shown
        expect(simulator.hasSearchResults()).toBe(true);
        
        const lastResponse = simulator.getLastBotResponse();
        expect(lastResponse?.content).toMatch(/found|result/i);
        expect(lastResponse?.content).toContain(query);

        // Simulate download selection
        await simulator.simulateDownloadSelection(1);

        // Verify download confirmation
        expect(simulator.hasDownloadConfirmation()).toBe(true);
      }
    );
  });

  describe('Search by Author - Found Cases', () => {
    test.each(testCases.found.filter(tc => tc.mode === 'author'))(
      'should find results for author search: "$query"',
      async ({ query }) => {
        // Setup mock response for this author
        mockProwlarrClient.setMockResponse(query.toLowerCase(), {
          results: [
            {
              guid: `author-${query.replace(/\s+/g, '-').toLowerCase()}-001`,
              title: `Test Book by ${query} [ENG / MP3]`,
              size: 400000000,
              downloadUrl: `magnet:?xt=urn:btih:author${query.replace(/\s+/g, '')}`,
              seeders: 35,
              leechers: 4,
              publishDate: '2023-02-01T00:00:00Z',
              indexerId: 1
            },
            {
              guid: `author-${query.replace(/\s+/g, '-').toLowerCase()}-002`,
              title: `Another Book by ${query} [ENG / M4B]`,
              size: 600000000,
              downloadUrl: `magnet:?xt=urn:btih:author2${query.replace(/\s+/g, '')}`,
              seeders: 28,
              leechers: 3,
              publishDate: '2023-03-01T00:00:00Z',
              indexerId: 1
            }
          ],
          format: 'MP3',
          total: 2,
          indexerId: 1
        });

        // Simulate complete flow
        await simulator.simulateDMEntry();
        await simulator.simulateBookSearch(query, 'author');

        // Verify multiple results are shown
        expect(simulator.hasSearchResults()).toBe(true);
        
        const lastResponse = simulator.getLastBotResponse();
        expect(lastResponse?.content).toMatch(/found|result/i);
        expect(lastResponse?.content).toContain(query);

        // Verify pagination or numbered list
        expect(lastResponse?.content).toMatch(/\d+\./);

        // Test download selection
        await simulator.simulateDownloadSelection(2);
        expect(simulator.hasDownloadConfirmation()).toBe(true);
      }
    );
  });

  describe('Search by Genre - Found Cases', () => {
    test.each(testCases.found.filter(tc => tc.mode === 'genre'))(
      'should find results for genre search: "$query"',
      async ({ query }) => {
        // Setup mock response for this genre
        mockProwlarrClient.setMockResponse(query.toLowerCase(), {
          results: [
            {
              guid: `genre-${query.toLowerCase()}-001`,
              title: `Great ${query.charAt(0).toUpperCase() + query.slice(1)} Book [ENG / MP3]`,
              size: 450000000,
              downloadUrl: `magnet:?xt=urn:btih:genre${query}1`,
              seeders: 42,
              leechers: 6,
              publishDate: '2023-04-01T00:00:00Z',
              indexerId: 1
            }
          ],
          format: 'MP3',
          total: 1,
          indexerId: 1
        });

        // Simulate complete flow
        await simulator.simulateDMEntry();
        await simulator.simulateGenreBrowsing(query);

        // Alternative: simulate typing the genre directly
        await simulator.sendUserMessage(`${query} books`);

        // Verify results
        expect(simulator.hasSearchResults()).toBe(true);
        
        const lastResponse = simulator.getLastBotResponse();
        expect(lastResponse?.content).toMatch(/found|result/i);
      }
    );
  });

  describe('Search by Description - Found Cases', () => {
    test.each(testCases.found.filter(tc => tc.mode === 'description'))(
      'should find results for description search: "$query"',
      async ({ query }) => {
        // For description searches, we expect the system to parse and match
        // In this case, "science fiction desert planet spice" should match Dune
        if (query.includes('science fiction desert planet spice')) {
          mockProwlarrClient.setMockResponse('dune', {
            results: [
              {
                guid: 'desc-dune-001',
                title: 'Dune by Frank Herbert [ENG / MP3] [Narrated by Scott Brick]',
                size: 687865856,
                downloadUrl: 'magnet:?xt=urn:btih:desc-dune',
                seeders: 47,
                leechers: 3,
                publishDate: '2023-01-15T10:30:00Z',
                indexerId: 1
              }
            ],
            format: 'MP3',
            total: 1,
            indexerId: 1
          });
        }

        // Simulate complete flow
        await simulator.simulateDMEntry();
        await simulator.simulateBookSearch(query, 'description');

        // Verify results or helpful response
        const lastResponse = simulator.getLastBotResponse();
        expect(lastResponse?.content).toBeDefined();
        
        // Should either find results or provide helpful guidance
        const hasResults = simulator.hasSearchResults();
        const hasHelpfulResponse = lastResponse?.content.toLowerCase().includes('try') ||
                                 lastResponse?.content.toLowerCase().includes('search') ||
                                 lastResponse?.content.toLowerCase().includes('looking for');
        
        expect(hasResults || hasHelpfulResponse).toBe(true);
      }
    );
  });

  describe('Search Not Found Cases', () => {
    test.each(testCases.notFound)(
      'should handle not found gracefully for $mode search: "$query"',
      async ({ mode, query }) => {
        // Ensure mock returns empty results for not found cases
        mockProwlarrClient.setMockResponse(query.toLowerCase(), {
          results: [],
          format: undefined,
          total: 0,
          indexerId: 1
        });

        // Simulate complete flow
        await simulator.simulateDMEntry();
        
        if (mode === 'genre') {
          // For genre, try browsing genres first, then search
          await simulator.simulateGenreBrowsing(query);
        } else {
          await simulator.simulateBookSearch(query, mode as any);
        }

        // Verify not found message and alternatives
        expect(simulator.hasNotFoundMessage()).toBe(true);
        
        const lastResponse = simulator.getLastBotResponse();
        expect(lastResponse?.content).toMatch(/couldn't find|no results|try again|sorry/i);

        // Should offer alternatives or suggestions
        const hasAlternatives = simulator.hasAlternatives() ||
                              lastResponse?.content.toLowerCase().includes('different') ||
                              lastResponse?.content.toLowerCase().includes('another') ||
                              lastResponse?.content.toLowerCase().includes('instead');
        
        expect(hasAlternatives).toBe(true);
      }
    );
  });

  describe('Complete Download Workflow', () => {
    test('should handle complete download workflow for found book', async () => {
      // Setup a known good response
      mockProwlarrClient.setMockResponse('dune', {
        results: [
          {
            guid: 'workflow-dune-001',
            title: 'Dune by Frank Herbert [ENG / MP3] [Narrated by Scott Brick]',
            size: 687865856,
            downloadUrl: 'magnet:?xt=urn:btih:workflow-dune',
            seeders: 47,
            leechers: 3,
            publishDate: '2023-01-15T10:30:00Z',
            indexerId: 1
          }
        ],
        format: 'MP3',
        total: 1,
        indexerId: 1
      });

      // Step 1: DM Entry and Greeting
      await simulator.simulateDMEntry();
      expect(simulator.hasGreeting()).toBe(true);

      // Step 2: Book Search
      await simulator.simulateBookSearch('Dune', 'title');
      expect(simulator.hasSearchResults()).toBe(true);

      // Step 3: Download Selection
      await simulator.simulateDownloadSelection(1);
      expect(simulator.hasDownloadConfirmation()).toBe(true);

      // Step 4: Check Download Status
      await simulator.simulateDownloadStatusCheck();
      
      const conversation = simulator.getConversationFlow();
      expect(conversation.length).toBeGreaterThan(4);
      
      // Verify flow includes all major steps
      const hasGreeting = conversation.some(step => step.content.toLowerCase().includes('welcome'));
      const hasSearch = conversation.some(step => step.content.toLowerCase().includes('dune'));
      const hasDownload = conversation.some(step => step.type === 'button_click' && step.customId === 'download_1');
      
      expect(hasGreeting).toBe(true);
      expect(hasSearch).toBe(true);
      expect(hasDownload).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network error
      mockProwlarrClient.simulateNetworkError();

      await simulator.simulateDMEntry();
      await simulator.simulateBookSearch('Test Book', 'title');

      const lastResponse = simulator.getLastBotResponse();
      expect(lastResponse?.content).toMatch(/error|problem|try again|sorry/i);
    });

    test('should handle malformed queries', async () => {
      await simulator.simulateDMEntry();
      
      // Test various edge cases
      const edgeCases = ['', '   ', '!@#$%', 'a'.repeat(1000)];
      
      for (const query of edgeCases) {
        await simulator.sendUserMessage(query);
        const lastResponse = simulator.getLastBotResponse();
        
        // Should handle gracefully without crashing
        expect(lastResponse?.content).toBeDefined();
      }
    });

    test('should handle rapid button clicking', async () => {
      await simulator.simulateDMEntry();
      
      // Rapid button clicks
      await Promise.all([
        simulator.clickButton('search_by_title'),
        simulator.clickButton('search_by_author'),
        simulator.clickButton('browse_genres')
      ]);

      // Should handle without crashing
      const responses = simulator.getBotResponses();
      expect(responses.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrency and State Management', () => {
    test('should handle concurrent searches properly', async () => {
      // Setup different responses for concurrent searches
      mockProwlarrClient.setMockResponse('book1', {
        results: [{
          guid: 'concurrent-1',
          title: 'Book 1 [ENG / MP3]',
          size: 100000000,
          downloadUrl: 'magnet:?xt=urn:btih:book1',
          seeders: 10,
          leechers: 1,
          publishDate: '2023-01-01T00:00:00Z',
          indexerId: 1
        }],
        format: 'MP3',
        total: 1,
        indexerId: 1
      });

      mockProwlarrClient.setMockResponse('book2', {
        results: [{
          guid: 'concurrent-2',
          title: 'Book 2 [ENG / MP3]',
          size: 200000000,
          downloadUrl: 'magnet:?xt=urn:btih:book2',
          seeders: 20,
          leechers: 2,
          publishDate: '2023-01-01T00:00:00Z',
          indexerId: 1
        }],
        format: 'MP3',
        total: 1,
        indexerId: 1
      });

      await simulator.simulateDMEntry();

      // Simulate concurrent searches
      await Promise.all([
        simulator.simulateBookSearch('Book1', 'title'),
        simulator.simulateBookSearch('Book2', 'title')
      ]);

      // Should handle both searches
      const responses = simulator.getBotResponses();
      expect(responses.length).toBeGreaterThan(2);
    });
  });

  describe('Session State Persistence', () => {
    test('should maintain search results across interactions', async () => {
      // Setup mock response
      mockProwlarrClient.setMockResponse('test series', {
        results: Array.from({ length: 8 }, (_, i) => ({
          guid: `series-${i + 1}`,
          title: `Test Series Book ${i + 1} [ENG / MP3]`,
          size: 300000000 + i * 50000000,
          downloadUrl: `magnet:?xt=urn:btih:series${i + 1}`,
          seeders: 15 + i,
          leechers: 2,
          publishDate: '2023-01-01T00:00:00Z',
          indexerId: 1
        })),
        format: 'MP3',
        total: 8,
        indexerId: 1
      });

      await simulator.simulateDMEntry();
      await simulator.simulateBookSearch('Test Series', 'title');

      // Should show paginated results
      expect(simulator.hasSearchResults()).toBe(true);

      // Test pagination if more than 5 results
      const lastResponse = simulator.getLastBotResponse();
      if (lastResponse?.content.includes('next') || lastResponse?.content.includes('more')) {
        // Simulate "next" command
        await simulator.sendUserMessage('next');
        
        const nextResponse = simulator.getLastBotResponse();
        expect(nextResponse?.content).toMatch(/\d+\./); // Should show numbered results
      }

      // Test download selection from results
      await simulator.simulateDownloadSelection(1);
      expect(simulator.hasDownloadConfirmation()).toBe(true);
    });
  });

  describe('Help and Navigation', () => {
    test('should provide help when requested', async () => {
      await simulator.simulateDMEntry();
      await simulator.simulateHelpRequest();

      const lastResponse = simulator.getLastBotResponse();
      expect(lastResponse?.content).toMatch(/help|command|search|fairy/i);
    });

    test('should handle new chat reset', async () => {
      await simulator.simulateDMEntry();
      await simulator.simulateBookSearch('Test Book', 'title');
      
      // Reset with new chat
      await simulator.simulateNewChat();
      
      const lastResponse = simulator.getLastBotResponse();
      expect(lastResponse?.content).toMatch(/welcome|search|book/i);
    });
  });
});
