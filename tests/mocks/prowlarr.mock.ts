import { vi } from 'vitest';

export interface MockProwlarrRelease {
  guid: string;
  title: string;
  size: number;
  downloadUrl: string;
  seeders: number;
  leechers: number;
  publishDate: string;
  indexerId: number;
}

export interface MockSearchResult {
  results: MockProwlarrRelease[];
  format?: 'M4B' | 'MP3';
  total?: number;
  indexerId?: number;
}

export class MockProwlarrClient {
  private mockResponses: Map<string, MockSearchResult> = new Map();
  private healthStatus: 'up' | 'down' | 'degraded' = 'up';
  private responseDelay = 0;

  constructor() {
    this.setupDefaultResponses();
  }

  private setupDefaultResponses(): void {
    // Popular audiobooks - MAM format responses
    this.mockResponses.set('dune', {
      results: [
        {
          guid: 'mam-dune-001',
          title: 'Dune by Frank Herbert [ENG / MP3] [Narrated by Scott Brick]',
          size: 687865856, // ~655MB
          downloadUrl: 'magnet:?xt=urn:btih:dune001&dn=Dune',
          seeders: 47,
          leechers: 3,
          publishDate: '2023-01-15T10:30:00Z',
          indexerId: 1
        },
        {
          guid: 'mam-dune-002', 
          title: 'Dune by Frank Herbert [ENG / M4B] [Narrated by Simon Vance]',
          size: 532676608, // ~508MB
          downloadUrl: 'magnet:?xt=urn:btih:dune002&dn=Dune_M4B',
          seeders: 23,
          leechers: 1,
          publishDate: '2023-02-20T14:22:00Z',
          indexerId: 1
        }
      ],
      format: 'MP3',
      total: 2,
      indexerId: 1
    });

    this.mockResponses.set('harry potter', {
      results: [
        {
          guid: 'mam-hp-001',
          title: 'Harry Potter and the Sorcerer\'s Stone by J.K. Rowling [ENG / MP3] [Narrated by Jim Dale]',
          size: 456789012,
          downloadUrl: 'magnet:?xt=urn:btih:hp001&dn=Harry_Potter_1',
          seeders: 89,
          leechers: 12,
          publishDate: '2022-11-10T09:15:00Z',
          indexerId: 1
        },
        {
          guid: 'mam-hp-002',
          title: 'Harry Potter and the Chamber of Secrets by J.K. Rowling [ENG / M4B] [Narrated by Jim Dale]',
          size: 398765432,
          downloadUrl: 'magnet:?xt=urn:btih:hp002&dn=Harry_Potter_2',
          seeders: 67,
          leechers: 8,
          publishDate: '2022-11-15T16:45:00Z',
          indexerId: 1
        }
      ],
      format: 'MP3',
      total: 2,
      indexerId: 1
    });

    this.mockResponses.set('brandon sanderson', {
      results: [
        {
          guid: 'mam-sanderson-001',
          title: 'The Way of Kings by Brandon Sanderson [ENG / MP3] [Narrated by Kate Reading & Michael Kramer]',
          size: 1234567890,
          downloadUrl: 'magnet:?xt=urn:btih:sanderson001&dn=Way_of_Kings',
          seeders: 34,
          leechers: 5,
          publishDate: '2023-03-08T11:20:00Z',
          indexerId: 1
        },
        {
          guid: 'mam-sanderson-002',
          title: 'Mistborn: The Final Empire by Brandon Sanderson [ENG / M4B] [Narrated by Michael Kramer]',
          size: 876543210,
          downloadUrl: 'magnet:?xt=urn:btih:sanderson002&dn=Mistborn_1',
          seeders: 42,
          leechers: 7,
          publishDate: '2023-01-22T13:55:00Z',
          indexerId: 1
        }
      ],
      format: 'MP3',
      total: 2,
      indexerId: 1
    });

    this.mockResponses.set('fantasy', {
      results: [
        {
          guid: 'mam-fantasy-001',
          title: 'The Name of the Wind by Patrick Rothfuss [ENG / MP3] [Narrated by Rupert Degas]',
          size: 567890123,
          downloadUrl: 'magnet:?xt=urn:btih:fantasy001&dn=Name_of_the_Wind',
          seeders: 28,
          leechers: 4,
          publishDate: '2023-04-12T08:30:00Z',
          indexerId: 1
        },
        {
          guid: 'mam-fantasy-002',
          title: 'The Lies of Locke Lamora by Scott Lynch [ENG / M4B] [Narrated by Michael Page]',
          size: 445566778,
          downloadUrl: 'magnet:?xt=urn:btih:fantasy002&dn=Lies_of_Locke_Lamora',
          seeders: 19,
          leechers: 2,
          publishDate: '2023-02-28T15:10:00Z',
          indexerId: 1
        }
      ],
      format: 'MP3',
      total: 2,
      indexerId: 1
    });

    this.mockResponses.set('science fiction', {
      results: [
        {
          guid: 'mam-scifi-001',
          title: 'Foundation by Isaac Asimov [ENG / MP3] [Narrated by Scott Brick]',
          size: 334455667,
          downloadUrl: 'magnet:?xt=urn:btih:scifi001&dn=Foundation',
          seeders: 31,
          leechers: 6,
          publishDate: '2023-01-05T12:45:00Z',
          indexerId: 1
        }
      ],
      format: 'MP3',
      total: 1,
      indexerId: 1
    });

    // Empty result for "not found" cases
    this.mockResponses.set('nopebook zero by nunya', {
      results: [],
      format: undefined,
      total: 0,
      indexerId: 1
    });

    this.mockResponses.set('imaginary personface', {
      results: [],
      format: undefined,
      total: 0,
      indexerId: 1
    });
  }

  setMockResponse(query: string, response: MockSearchResult): void {
    this.mockResponses.set(query.toLowerCase(), response);
  }

  setHealthStatus(status: 'up' | 'down' | 'degraded'): void {
    this.healthStatus = status;
  }

  setResponseDelay(ms: number): void {
    this.responseDelay = ms;
  }

  async searchProwlarr(query: string, options: any = {}): Promise<MockSearchResult> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    const normalizedQuery = query.toLowerCase();
    const result = this.mockResponses.get(normalizedQuery);
    
    if (result) {
      return {
        ...result,
        indexerId: options.indexerId || result.indexerId
      };
    }

    // Default empty response for unknown queries
    return {
      results: [],
      format: undefined,
      total: 0,
      indexerId: options.indexerId || 1
    };
  }

  async checkProwlarrHealth() {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    const baseResponse = {
      responseTime: this.responseDelay + 50,
      lastCheck: new Date().toISOString()
    };

    switch (this.healthStatus) {
      case 'up':
        return {
          status: 'up' as const,
          ...baseResponse
        };
      case 'degraded':
        return {
          status: 'degraded' as const,
          ...baseResponse,
          issues: [{ type: 'warning', message: 'Some indexers are offline' }]
        };
      case 'down':
        return {
          status: 'down' as const,
          error: 'Connection refused',
          lastCheck: new Date().toISOString()
        };
    }
  }

  // Utility methods for test setup
  reset(): void {
    this.mockResponses.clear();
    this.setupDefaultResponses();
    this.healthStatus = 'up';
    this.responseDelay = 0;
  }

  addResponse(query: string, response: MockSearchResult): void {
    this.setMockResponse(query, response);
  }

  simulateNetworkError(): void {
    this.setHealthStatus('down');
  }

  simulateSlowResponse(ms: number = 5000): void {
    this.setResponseDelay(ms);
  }
}

export const mockProwlarrClient = new MockProwlarrClient();

// Vitest mock functions
export const mockSearchProwlarr = vi.fn().mockImplementation(mockProwlarrClient.searchProwlarr.bind(mockProwlarrClient));
export const mockCheckProwlarrHealth = vi.fn().mockImplementation(mockProwlarrClient.checkProwlarrHealth.bind(mockProwlarrClient));
