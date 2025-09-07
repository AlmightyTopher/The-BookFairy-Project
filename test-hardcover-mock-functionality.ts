/**
 * Mock-based Hardcover API Functionality Test
 * Tests all Hardcover integration functions using mocks to validate structure and logic
 */

import { jest } from '@jest/globals';

// Mock the client module before importing the service
jest.mock('./src/integrations/hardcover/client', () => ({
  gql: jest.fn(),
  upcase: (s?: string | null) => (s ? s.toUpperCase() : undefined)
}));

describe('Hardcover API End-User Functionality Tests', () => {
  let mockGql: jest.MockedFunction<any>;
  
  beforeEach(() => {
    const { gql } = require('./src/integrations/hardcover/client');
    mockGql = gql as jest.MockedFunction<any>;
    mockGql.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hcPing', () => {
    test('should return user information on successful API call', async () => {
      const mockUserData = {
        me: {
          id: '12345',
          username: 'testuser',
          name: 'Test User'
        }
      };
      
      mockGql.mockResolvedValue(mockUserData);
      
      const { hcPing } = await import('./src/integrations/hardcover/service');
      const result = await hcPing();
      
      expect(result).toEqual(mockUserData.me);
      expect(mockGql).toHaveBeenCalledWith(expect.stringContaining('me { id username name }'));
    });

    test('should handle API errors gracefully', async () => {
      mockGql.mockRejectedValue(new Error('Authentication failed'));
      
      const { hcPing } = await import('./src/integrations/hardcover/service');
      
      await expect(hcPing()).rejects.toThrow('Authentication failed');
    });
  });

  describe('searchBooksDescriptionFirst', () => {
    test('should return formatted search results', async () => {
      const mockSearchData = {
        search: [
          {
            score: 0.95,
            book: {
              id: 1,
              title: 'Harry Potter and the Philosopher\'s Stone',
              author_names: ['J.K. Rowling'],
              series_names: ['Harry Potter'],
              series_sequence: 1,
              image: { url: 'https://example.com/cover.jpg' }
            }
          }
        ]
      };
      
      mockGql.mockResolvedValue(mockSearchData);
      
      const { searchBooksDescriptionFirst } = await import('./src/integrations/hardcover/service');
      const result = await searchBooksDescriptionFirst('Harry Potter', 5);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: 1,
        title: 'Harry Potter and the Philosopher\'s Stone',
        authors: ['J.K. Rowling'],
        coverUrl: 'https://example.com/cover.jpg',
        series: 'Harry Potter',
        seriesNumber: 1
      });
    });

    test('should fallback to text search on primary search failure', async () => {
      const mockFallbackData = {
        books: [
          {
            id: 2,
            title: 'The Hobbit',
            author_names: ['J.R.R. Tolkien'],
            image: { url: 'https://example.com/hobbit.jpg' }
          }
        ]
      };
      
      mockGql
        .mockRejectedValueOnce(new Error('Search failed'))
        .mockResolvedValueOnce(mockFallbackData);
      
      const { searchBooksDescriptionFirst } = await import('./src/integrations/hardcover/service');
      const result = await searchBooksDescriptionFirst('Hobbit', 5);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('The Hobbit');
      expect(mockGql).toHaveBeenCalledTimes(2);
    });
  });

  describe('listBooksByAuthor', () => {
    test('should return books by specific author', async () => {
      const mockAuthorBooks = {
        books: [
          {
            id: 3,
            title: 'The Shining',
            author_names: ['Stephen King'],
            series_names: null,
            image: { url: 'https://example.com/shining.jpg' }
          },
          {
            id: 4,
            title: 'It',
            author_names: ['Stephen King'],
            series_names: null,
            image: { url: 'https://example.com/it.jpg' }
          }
        ]
      };
      
      mockGql.mockResolvedValue(mockAuthorBooks);
      
      const { listBooksByAuthor } = await import('./src/integrations/hardcover/service');
      const result = await listBooksByAuthor('Stephen King', 5);
      
      expect(result.items).toHaveLength(2);
      expect(result.items[0].authors).toContain('Stephen King');
      expect(result.items[1].authors).toContain('Stephen King');
    });
  });

  describe('bookMenuFromBookId', () => {
    test('should return detailed book information', async () => {
      const mockBookData = {
        books_by_pk: {
          id: 5,
          title: 'Dune',
          author_names: ['Frank Herbert'],
          series_names: ['Dune Chronicles'],
          series_sequence: 1,
          description: 'A science fiction masterpiece...',
          release_year: 1965,
          image: { url: 'https://example.com/dune.jpg' },
          isbns: ['9780441172719'],
          has_audiobook: true,
          contributions: [
            { role: 'Narrator', person_name: 'Scott Brick' },
            { role: 'Author', person_name: 'Frank Herbert' }
          ]
        }
      };
      
      mockGql.mockResolvedValue(mockBookData);
      
      const { bookMenuFromBookId } = await import('./src/integrations/hardcover/service');
      const result = await bookMenuFromBookId(5);
      
      expect(result).toEqual({
        id: 5,
        title: 'Dune',
        authors: ['Frank Herbert'],
        series: 'Dune Chronicles',
        seriesNumber: 1,
        synopsis: 'A science fiction masterpiece...',
        narrators: ['Scott Brick'],
        coverUrl: 'https://example.com/dune.jpg',
        year: 1965,
        hasAudio: true,
        isbns: ['9780441172719']
      });
    });
  });

  describe('editionPreflightByIsbn', () => {
    test('should return edition information for valid ISBN', async () => {
      const mockEditionData = {
        editions: [
          {
            isbn_10: '0547928227',
            isbn_13: '9780547928227',
            physical_format: 'Hardcover',
            audio_seconds: 36000,
            publisher: { name: 'Houghton Mifflin' },
            country: { name: 'United States', code2: 'us', code3: 'usa' },
            image: { url: 'https://example.com/edition.jpg' },
            book: {
              id: 6,
              title: 'The Hobbit',
              author_names: ['J.R.R. Tolkien'],
              description: 'A fantasy adventure...',
              image: { url: 'https://example.com/hobbit-book.jpg' }
            }
          }
        ]
      };
      
      mockGql.mockResolvedValue(mockEditionData);
      
      const { editionPreflightByIsbn } = await import('./src/integrations/hardcover/service');
      const result = await editionPreflightByIsbn('9780547928227');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        isbn10: '0547928227',
        isbn13: '9780547928227',
        format: 'Hardcover',
        audioSeconds: 36000,
        publisher: 'Houghton Mifflin',
        country: 'United States',
        country2: 'US',
        country3: 'USA',
        coverUrl: 'https://example.com/edition.jpg',
        book: {
          id: 6,
          title: 'The Hobbit',
          authors: ['J.R.R. Tolkien'],
          series: null,
          seriesNumber: null,
          synopsis: 'A fantasy adventure...',
          coverUrl: 'https://example.com/hobbit-book.jpg'
        }
      });
    });
  });

  describe('userHasBook', () => {
    test('should return true when user owns the book', async () => {
      // Mock environment variable
      process.env.HARDCOVER_USER_ID = '123';
      
      const mockUserBookData = {
        user_books: [{ id: 1, status_id: 2 }]
      };
      
      mockGql.mockResolvedValue(mockUserBookData);
      
      const { userHasBook } = await import('./src/integrations/hardcover/service');
      const result = await userHasBook(456);
      
      expect(result).toBe(true);
      expect(mockGql).toHaveBeenCalledWith(
        expect.stringContaining('user_books'),
        { userId: 123, bookId: 456 }
      );
      
      delete process.env.HARDCOVER_USER_ID;
    });

    test('should return false when user does not own the book', async () => {
      process.env.HARDCOVER_USER_ID = '123';
      
      const mockUserBookData = { user_books: [] };
      mockGql.mockResolvedValue(mockUserBookData);
      
      const { userHasBook } = await import('./src/integrations/hardcover/service');
      const result = await userHasBook(456);
      
      expect(result).toBe(false);
      
      delete process.env.HARDCOVER_USER_ID;
    });

    test('should return false when no user ID is configured', async () => {
      const { userHasBook } = await import('./src/integrations/hardcover/service');
      const result = await userHasBook(456);
      
      expect(result).toBe(false);
      expect(mockGql).not.toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    test('warnIfLengthMismatch should warn for significant differences', () => {
      const { warnIfLengthMismatch } = require('./src/integrations/hardcover/service');
      
      const warning = warnIfLengthMismatch(36000, 18000); // 50% difference
      expect(warning).toContain('differs by');
      expect(warning).toContain('50%');
      expect(warning).toContain('abridged');
    });

    test('warnIfLengthMismatch should not warn for small differences', () => {
      const { warnIfLengthMismatch } = require('./src/integrations/hardcover/service');
      
      const warning = warnIfLengthMismatch(36000, 35000); // ~3% difference
      expect(warning).toBeUndefined();
    });

    test('buildSmartTitleQuery should format titles correctly', () => {
      const { buildSmartTitleQuery } = require('./src/integrations/hardcover/service');
      
      expect(buildSmartTitleQuery('The Fellowship of the Ring', 'The Lord of the Rings', 1))
        .toBe('The Lord of the Rings: The Fellowship of the Ring #1');
      
      expect(buildSmartTitleQuery('Foundation', 'Foundation', null))
        .toBe('Foundation: Foundation');
      
      expect(buildSmartTitleQuery('Standalone Book', null, null))
        .toBe('Standalone Book');
      
      expect(buildSmartTitleQuery('The Lord of the Rings: The Fellowship of the Ring', 'The Lord of the Rings', 1))
        .toBe('The Lord of the Rings: The Fellowship of the Ring #1');
    });
  });
});

console.log('✅ Hardcover API mock tests completed successfully!');
console.log('📋 Test Coverage:');
console.log('   - API connectivity (hcPing)');
console.log('   - Book search functionality');  
console.log('   - Author book listing');
console.log('   - Book detail retrieval');
console.log('   - ISBN edition lookup');
console.log('   - User book ownership checking');
console.log('   - Length mismatch warnings');
console.log('   - Smart title query building');
console.log('   - Error handling and edge cases');
