import { vi } from 'vitest';

// Mock Hardcover GraphQL responses
export const mockHardcoverResponses = {
  searchBooks: {
    success: {
      data: {
        books: [
          {
            id: "1",
            title: "Dune",
            slug: "dune",
            isbn: "9780441013593",
            isbn13: "9780441013593",
            description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides...",
            image: "https://example.com/dune.jpg",
            release_date: "1965-01-01",
            pages: 688,
            contributions: [
              {
                author: {
                  id: "author1",
                  name: "Frank Herbert",
                  slug: "frank-herbert"
                },
                role: "Author"
              }
            ],
            books_series: [
              {
                book_series: {
                  id: "series1",
                  name: "Dune Chronicles",
                  slug: "dune-chronicles"
                },
                position: 1
              }
            ],
            genres: [
              { name: "Science Fiction" },
              { name: "Space Opera" }
            ]
          },
          {
            id: "2",
            title: "Foundation",
            slug: "foundation",
            isbn: "9780553293357",
            isbn13: "9780553293357",
            description: "The first novel in Isaac Asimov's classic science-fiction masterpiece...",
            image: "https://example.com/foundation.jpg",
            release_date: "1951-01-01",
            pages: 244,
            contributions: [
              {
                author: {
                  id: "author2",
                  name: "Isaac Asimov",
                  slug: "isaac-asimov"
                },
                role: "Author"
              }
            ],
            books_series: [
              {
                book_series: {
                  id: "series2",
                  name: "Foundation",
                  slug: "foundation-series"
                },
                position: 1
              }
            ],
            genres: [
              { name: "Science Fiction" },
              { name: "Hard Science Fiction" }
            ]
          }
        ]
      }
    },
    empty: {
      data: {
        books: []
      }
    },
    error: {
      errors: [
        {
          message: "GraphQL query failed",
          locations: [{ line: 1, column: 1 }],
          path: ["books"]
        }
      ]
    }
  },
  bookById: {
    success: {
      data: {
        book: {
          id: "1",
          title: "Dune",
          slug: "dune",
          isbn: "9780441013593",
          isbn13: "9780441013593",
          description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
          image: "https://example.com/dune.jpg",
          release_date: "1965-01-01",
          pages: 688,
          contributions: [
            {
              author: {
                id: "author1",
                name: "Frank Herbert",
                slug: "frank-herbert"
              },
              role: "Author"
            }
          ],
          books_series: [
            {
              book_series: {
                id: "series1",
                name: "Dune Chronicles",
                slug: "dune-chronicles"
              },
              position: 1
            }
          ],
          genres: [
            { name: "Science Fiction" },
            { name: "Space Opera" }
          ],
          reviews: [
            {
              id: "review1",
              rating: 5,
              review_text: "An epic masterpiece of science fiction",
              user: {
                name: "BookLover123"
              }
            }
          ]
        }
      }
    }
  }
};

// Mock authentication responses
export const mockAuthResponses = {
  success: {
    data: {
      user: {
        id: "user123",
        username: "testuser",
        email: "test@example.com"
      }
    }
  },
  failure: {
    errors: [
      {
        message: "Authentication failed",
        extensions: {
          code: "UNAUTHENTICATED"
        }
      }
    ]
  }
};

// Mock network errors
export const mockNetworkErrors = {
  timeout: new Error('Request timeout'),
  connectionRefused: new Error('Connection refused'),
  rateLimited: new Error('Rate limit exceeded'),
  serverError: new Error('Internal server error')
};

// Hardcover service mocks
export const createHardcoverMocks = () => {
  return {
    // GraphQL client mock
    gql: vi.fn(),
    
    // Service layer mocks
    searchBooksDescriptionFirst: vi.fn(),
    searchBooksByTitle: vi.fn(),
    searchBooksByAuthor: vi.fn(),
    getBookById: vi.fn(),
    getBooksByISBN: vi.fn(),
    getAuthorBooks: vi.fn(),
    getSeriesBooks: vi.fn(),
    
    // Authentication mocks
    authenticate: vi.fn(),
    refreshToken: vi.fn(),
    
    // Error handling mocks
    handleGraphQLError: vi.fn(),
    retryRequest: vi.fn()
  };
};

// Setup default mock behaviors
export const setupHardcoverMocks = () => {
  const mocks = createHardcoverMocks();
  
  // Default successful responses
  mocks.searchBooksDescriptionFirst.mockResolvedValue(mockHardcoverResponses.searchBooks.success.data.books);
  mocks.searchBooksByTitle.mockResolvedValue(mockHardcoverResponses.searchBooks.success.data.books);
  mocks.searchBooksByAuthor.mockResolvedValue(mockHardcoverResponses.searchBooks.success.data.books);
  mocks.getBookById.mockResolvedValue(mockHardcoverResponses.bookById.success.data.book);
  mocks.authenticate.mockResolvedValue(mockAuthResponses.success.data.user);
  
  // GraphQL client mock
  mocks.gql.mockResolvedValue(mockHardcoverResponses.searchBooks.success);
  
  return mocks;
};

// Error scenario setups
export const setupHardcoverErrorScenarios = () => {
  const mocks = createHardcoverMocks();
  
  // Network errors
  mocks.gql.mockRejectedValue(mockNetworkErrors.timeout);
  mocks.searchBooksDescriptionFirst.mockRejectedValue(mockNetworkErrors.connectionRefused);
  
  // GraphQL errors
  mocks.gql.mockResolvedValue(mockHardcoverResponses.searchBooks.error);
  
  // Authentication errors
  mocks.authenticate.mockRejectedValue(mockAuthResponses.failure);
  
  return mocks;
};

// Test data generators
export const generateMockBook = (overrides = {}) => {
  return {
    id: "mock-book-id",
    title: "Mock Book Title",
    slug: "mock-book-title",
    isbn: "9781234567890",
    isbn13: "9781234567890",
    description: "A mock book for testing purposes",
    image: "https://example.com/mock-book.jpg",
    release_date: "2023-01-01",
    pages: 300,
    contributions: [
      {
        author: {
          id: "mock-author-id",
          name: "Mock Author",
          slug: "mock-author"
        },
        role: "Author"
      }
    ],
    genres: [
      { name: "Fiction" }
    ],
    ...overrides
  };
};

export const generateMockAuthor = (overrides = {}) => {
  return {
    id: "mock-author-id",
    name: "Mock Author",
    slug: "mock-author",
    bio: "A mock author for testing",
    image: "https://example.com/mock-author.jpg",
    ...overrides
  };
};

export const generateMockSearchResults = (count = 5) => {
  return Array.from({ length: count }, (_, index) => 
    generateMockBook({
      id: `book-${index + 1}`,
      title: `Test Book ${index + 1}`,
      slug: `test-book-${index + 1}`
    })
  );
};
