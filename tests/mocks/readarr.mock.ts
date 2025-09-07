import { vi } from 'vitest';

export interface MockAuthor {
  id: number;
  authorName: string;
  authorNameLastFirst: string;
  sortName: string;
  overview: string;
  links: Array<{ url: string; name: string }>;
  images: Array<{ coverType: string; url: string }>;
  path: string;
  qualityProfileId: number;
  metadataProfileId: number;
  monitored: boolean;
  rootFolderPath: string;
  added: string;
  addOptions: {
    monitor: string;
    booksToMonitor: string[];
    monitored: boolean;
    searchForMissingBooks: boolean;
  };
}

export interface MockBook {
  id: number;
  title: string;
  authorTitle: string;
  seriesTitle: string;
  overview: string;
  isbn13: string;
  asin: string;
  goodreadsId: string;
  titleSlug: string;
  monitored: boolean;
  anyEditionOk: boolean;
  ratings: {
    votes: number;
    value: number;
    popularity: number;
  };
  releaseDate: string;
  pageCount: number;
  genres: string[];
  author: {
    id: number;
    authorName: string;
  };
  images: Array<{ coverType: string; url: string }>;
  links: Array<{ url: string; name: string }>;
  editions: MockEdition[];
}

export interface MockEdition {
  id: number;
  bookId: number;
  foreignEditionId: string;
  titleSlug: string;
  isbn13: string;
  asin: string;
  title: string;
  language: string;
  overview: string;
  format: string;
  isEbook: boolean;
  publisher: string;
  pageCount: number;
  releaseDate: string;
  images: Array<{ coverType: string; url: string }>;
  links: Array<{ url: string; name: string }>;
  ratings: {
    votes: number;
    value: number;
    popularity: number;
  };
  monitored: boolean;
  manualAdd: boolean;
}

export interface MockQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: Array<{
    id: number;
    name: string;
    allowed: boolean;
    quality: {
      id: number;
      name: string;
    };
  }>;
}

export interface MockRootFolder {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace: number;
  unmappedFolders: Array<{
    name: string;
    path: string;
  }>;
}

export interface MockAddAuthorResponse {
  success: boolean;
  author?: MockAuthor;
  error?: string;
}

export interface MockHealthCheck {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  issues?: Array<{ type: string; message: string }>;
}

export class MockReadarrClient {
  private authors: Map<number, MockAuthor> = new Map();
  private books: Map<number, MockBook> = new Map();
  private qualityProfiles: MockQualityProfile[] = [];
  private rootFolders: MockRootFolder[] = [];
  private connectionStatus: 'connected' | 'disconnected' | 'unauthorized' = 'connected';
  private responseDelay = 0;
  private nextAuthorId = 1;
  private nextBookId = 1;

  constructor() {
    this.setupDefaultData();
  }

  private setupDefaultData(): void {
    // Setup default quality profiles
    this.qualityProfiles = [
      {
        id: 1,
        name: 'Any',
        upgradeAllowed: true,
        cutoff: 20,
        items: [
          { id: 10, name: 'Unknown', allowed: true, quality: { id: 0, name: 'Unknown' } },
          { id: 20, name: 'MP3-VBR-V0', allowed: true, quality: { id: 20, name: 'MP3-VBR-V0' } },
          { id: 21, name: 'MP3-VBR-V2', allowed: true, quality: { id: 21, name: 'MP3-VBR-V2' } },
          { id: 22, name: 'MP3-CBR-320', allowed: true, quality: { id: 22, name: 'MP3-CBR-320' } },
          { id: 30, name: 'M4B', allowed: true, quality: { id: 30, name: 'M4B' } },
          { id: 40, name: 'FLAC', allowed: true, quality: { id: 40, name: 'FLAC' } }
        ]
      },
      {
        id: 2,
        name: 'MP3 Only',
        upgradeAllowed: false,
        cutoff: 22,
        items: [
          { id: 20, name: 'MP3-VBR-V0', allowed: true, quality: { id: 20, name: 'MP3-VBR-V0' } },
          { id: 21, name: 'MP3-VBR-V2', allowed: true, quality: { id: 21, name: 'MP3-VBR-V2' } },
          { id: 22, name: 'MP3-CBR-320', allowed: true, quality: { id: 22, name: 'MP3-CBR-320' } }
        ]
      }
    ];

    // Setup default root folders
    this.rootFolders = [
      {
        id: 1,
        path: '/audiobooks',
        accessible: true,
        freeSpace: 500000000000, // 500GB
        unmappedFolders: []
      },
      {
        id: 2,
        path: '/ebooks',
        accessible: true,
        freeSpace: 250000000000, // 250GB
        unmappedFolders: []
      }
    ];

    // Setup some default authors and books
    const frankHerbert: MockAuthor = {
      id: this.nextAuthorId++,
      authorName: 'Frank Herbert',
      authorNameLastFirst: 'Herbert, Frank',
      sortName: 'herbert frank',
      overview: 'Franklin Patrick Herbert Jr. was an American science fiction author best known for the 1965 novel Dune and its five sequels.',
      links: [
        { url: 'https://www.goodreads.com/author/show/58.Frank_Herbert', name: 'goodreads' }
      ],
      images: [
        { coverType: 'poster', url: 'https://example.com/frank-herbert.jpg' }
      ],
      path: '/audiobooks/Frank Herbert',
      qualityProfileId: 1,
      metadataProfileId: 1,
      monitored: true,
      rootFolderPath: '/audiobooks',
      added: '2023-01-01T00:00:00Z',
      addOptions: {
        monitor: 'all',
        booksToMonitor: [],
        monitored: true,
        searchForMissingBooks: true
      }
    };

    this.authors.set(frankHerbert.id, frankHerbert);

    const duneBook: MockBook = {
      id: this.nextBookId++,
      title: 'Dune',
      authorTitle: 'Frank Herbert',
      seriesTitle: 'Dune Chronicles',
      overview: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides...',
      isbn13: '9780441013593',
      asin: 'B00B7NPRY8',
      goodreadsId: '44767458',
      titleSlug: 'dune',
      monitored: true,
      anyEditionOk: true,
      ratings: {
        votes: 845123,
        value: 4.25,
        popularity: 98.5
      },
      releaseDate: '1965-08-01T00:00:00Z',
      pageCount: 688,
      genres: ['Science Fiction', 'Fantasy', 'Fiction'],
      author: {
        id: frankHerbert.id,
        authorName: frankHerbert.authorName
      },
      images: [
        { coverType: 'cover', url: 'https://example.com/dune-cover.jpg' }
      ],
      links: [
        { url: 'https://www.goodreads.com/book/show/44767458-dune', name: 'goodreads' }
      ],
      editions: [
        {
          id: 1,
          bookId: 1,
          foreignEditionId: 'B00B7NPRY8',
          titleSlug: 'dune-audiobook-2007',
          isbn13: '',
          asin: 'B00B7NPRY8',
          title: 'Dune',
          language: 'English',
          overview: 'Audiobook edition narrated by Scott Brick',
          format: 'Audiobook',
          isEbook: false,
          publisher: 'Macmillan Audio',
          pageCount: 0,
          releaseDate: '2007-05-29T00:00:00Z',
          images: [
            { coverType: 'cover', url: 'https://example.com/dune-audiobook-cover.jpg' }
          ],
          links: [
            { url: 'https://www.audible.com/pd/Dune-Audiobook/B00B7NPRY8', name: 'audible' }
          ],
          ratings: {
            votes: 23456,
            value: 4.4,
            popularity: 95.2
          },
          monitored: true,
          manualAdd: false
        }
      ]
    };

    this.books.set(duneBook.id, duneBook);
  }

  setConnectionStatus(status: 'connected' | 'disconnected' | 'unauthorized'): void {
    this.connectionStatus = status;
  }

  setResponseDelay(ms: number): void {
    this.responseDelay = ms;
  }

  async getSystemStatus(): Promise<MockHealthCheck> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    const baseResponse = {
      responseTime: this.responseDelay + 100,
      lastCheck: new Date().toISOString()
    };

    switch (this.connectionStatus) {
      case 'connected':
        return {
          status: 'up' as const,
          ...baseResponse
        };
      case 'unauthorized':
        return {
          status: 'degraded' as const,
          ...baseResponse,
          issues: [{ type: 'error', message: 'API key invalid' }]
        };
      case 'disconnected':
        return {
          status: 'down' as const,
          error: 'Connection refused',
          lastCheck: new Date().toISOString()
        };
    }
  }

  async getQualityProfiles(): Promise<MockQualityProfile[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    return [...this.qualityProfiles];
  }

  async getRootFolders(): Promise<MockRootFolder[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    return [...this.rootFolders];
  }

  async searchAuthor(name: string): Promise<MockAuthor[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    const searchTerm = name.toLowerCase();
    return Array.from(this.authors.values()).filter(author =>
      author.authorName.toLowerCase().includes(searchTerm) ||
      author.sortName.toLowerCase().includes(searchTerm)
    );
  }

  async addAuthor(author: Partial<MockAuthor>): Promise<MockAddAuthorResponse> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      return { success: false, error: 'Connection error' };
    }

    if (!author.authorName) {
      return { success: false, error: 'Author name is required' };
    }

    const newAuthor: MockAuthor = {
      id: this.nextAuthorId++,
      authorName: author.authorName,
      authorNameLastFirst: author.authorNameLastFirst || `${author.authorName.split(' ').pop()}, ${author.authorName.split(' ').slice(0, -1).join(' ')}`,
      sortName: author.sortName || author.authorName.toLowerCase(),
      overview: author.overview || '',
      links: author.links || [],
      images: author.images || [],
      path: author.path || `/audiobooks/${author.authorName}`,
      qualityProfileId: author.qualityProfileId || 1,
      metadataProfileId: author.metadataProfileId || 1,
      monitored: author.monitored !== false,
      rootFolderPath: author.rootFolderPath || '/audiobooks',
      added: new Date().toISOString(),
      addOptions: author.addOptions || {
        monitor: 'all',
        booksToMonitor: [],
        monitored: true,
        searchForMissingBooks: true
      }
    };

    this.authors.set(newAuthor.id, newAuthor);

    return { success: true, author: newAuthor };
  }

  async getAuthor(id: number): Promise<MockAuthor | null> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    return this.authors.get(id) || null;
  }

  async getAuthorBooks(authorId: number): Promise<MockBook[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    return Array.from(this.books.values()).filter(book => book.author.id === authorId);
  }

  async getBook(id: number): Promise<MockBook | null> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    return this.books.get(id) || null;
  }

  async searchBooks(query: string): Promise<MockBook[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus !== 'connected') {
      throw new Error('Connection error');
    }

    const searchTerm = query.toLowerCase();
    return Array.from(this.books.values()).filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.authorTitle.toLowerCase().includes(searchTerm) ||
      book.overview.toLowerCase().includes(searchTerm)
    );
  }

  // Test utility methods
  reset(): void {
    this.authors.clear();
    this.books.clear();
    this.qualityProfiles = [];
    this.rootFolders = [];
    this.connectionStatus = 'connected';
    this.responseDelay = 0;
    this.nextAuthorId = 1;
    this.nextBookId = 1;
    this.setupDefaultData();
  }

  addMockAuthor(author: Partial<MockAuthor>): MockAuthor {
    const newAuthor: MockAuthor = {
      id: this.nextAuthorId++,
      authorName: author.authorName || 'Test Author',
      authorNameLastFirst: author.authorNameLastFirst || 'Author, Test',
      sortName: author.sortName || 'test author',
      overview: author.overview || '',
      links: author.links || [],
      images: author.images || [],
      path: author.path || '/audiobooks/Test Author',
      qualityProfileId: author.qualityProfileId || 1,
      metadataProfileId: author.metadataProfileId || 1,
      monitored: author.monitored !== false,
      rootFolderPath: author.rootFolderPath || '/audiobooks',
      added: new Date().toISOString(),
      addOptions: author.addOptions || {
        monitor: 'all',
        booksToMonitor: [],
        monitored: true,
        searchForMissingBooks: true
      }
    };

    this.authors.set(newAuthor.id, newAuthor);
    return newAuthor;
  }

  addMockBook(book: Partial<MockBook>, authorId?: number): MockBook {
    const newBook: MockBook = {
      id: this.nextBookId++,
      title: book.title || 'Test Book',
      authorTitle: book.authorTitle || 'Test Author',
      seriesTitle: book.seriesTitle || '',
      overview: book.overview || '',
      isbn13: book.isbn13 || '',
      asin: book.asin || '',
      goodreadsId: book.goodreadsId || '',
      titleSlug: book.titleSlug || 'test-book',
      monitored: book.monitored !== false,
      anyEditionOk: book.anyEditionOk !== false,
      ratings: book.ratings || { votes: 100, value: 4.0, popularity: 50.0 },
      releaseDate: book.releaseDate || new Date().toISOString(),
      pageCount: book.pageCount || 300,
      genres: book.genres || ['Fiction'],
      author: book.author || { id: authorId || 1, authorName: 'Test Author' },
      images: book.images || [],
      links: book.links || [],
      editions: book.editions || []
    };

    this.books.set(newBook.id, newBook);
    return newBook;
  }

  simulateNetworkError(): void {
    this.setConnectionStatus('disconnected');
  }

  simulateAuthFailure(): void {
    this.setConnectionStatus('unauthorized');
  }

  simulateSlowResponse(ms: number = 5000): void {
    this.setResponseDelay(ms);
  }
}

export const mockReadarrClient = new MockReadarrClient();

// Vitest mock functions
export const mockGetSystemStatus = vi.fn().mockImplementation(mockReadarrClient.getSystemStatus.bind(mockReadarrClient));
export const mockGetQualityProfiles = vi.fn().mockImplementation(mockReadarrClient.getQualityProfiles.bind(mockReadarrClient));
export const mockGetRootFolders = vi.fn().mockImplementation(mockReadarrClient.getRootFolders.bind(mockReadarrClient));
export const mockSearchAuthor = vi.fn().mockImplementation(mockReadarrClient.searchAuthor.bind(mockReadarrClient));
export const mockAddAuthor = vi.fn().mockImplementation(mockReadarrClient.addAuthor.bind(mockReadarrClient));
export const mockGetAuthor = vi.fn().mockImplementation(mockReadarrClient.getAuthor.bind(mockReadarrClient));
export const mockGetAuthorBooks = vi.fn().mockImplementation(mockReadarrClient.getAuthorBooks.bind(mockReadarrClient));
export const mockGetBook = vi.fn().mockImplementation(mockReadarrClient.getBook.bind(mockReadarrClient));
export const mockSearchBooks = vi.fn().mockImplementation(mockReadarrClient.searchBooks.bind(mockReadarrClient));
