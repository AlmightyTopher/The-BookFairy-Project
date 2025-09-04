import { describe, it, expect, vi } from 'vitest';

// Mock the mango scraper
vi.mock('../../src/integrations/mango/scraper', () => ({
  listGenres: vi.fn().mockResolvedValue([
    { id: 'fiction', name: 'Fiction', slug: 'fiction' },
    { id: 'mystery', name: 'Mystery', slug: 'mystery' },
    { id: 'sci-fi', name: 'Science Fiction', slug: 'science-fiction' }
  ]),
  getTopByGenre: vi.fn().mockResolvedValue([
    {
      title: 'Test Book 1',
      author: 'Author One',
      genre: 'fiction',
      timeframe: '1m',
      source: 'mango',
      url: 'https://example.com/book1'
    },
    {
      title: 'Test Book 2', 
      author: 'Author Two',
      genre: 'fiction',
      timeframe: '1m',
      source: 'mango',
      url: 'https://example.com/book2'
    }
  ])
}));

describe('Discord Genre Flow Integration', () => {
  it('should be able to import mango scraper functions', async () => {
    const { listGenres, getTopByGenre } = await import('../../src/integrations/mango/scraper');
    
    expect(listGenres).toBeDefined();
    expect(getTopByGenre).toBeDefined();
    
    // Test function calls
    const genres = await listGenres();
    expect(genres).toHaveLength(3);
    expect(genres[0]).toMatchObject({
      id: 'fiction',
      name: 'Fiction',
      slug: 'fiction'
    });
    
    const books = await getTopByGenre('fiction', '1m', 10);
    expect(books).toHaveLength(2);
    expect(books[0]).toMatchObject({
      title: 'Test Book 1',
      author: 'Author One',
      genre: 'fiction'
    });
  });

  it('should be able to import quick-actions module', async () => {
    // Test that the module loads without errors
    const quickActions = await import('../../src/quick-actions');
    expect(quickActions).toBeDefined();
  });

  it('should be able to import config modules', async () => {
    const { mangoConfig } = await import('../../src/config/mango');
    expect(mangoConfig).toBeDefined();
    expect(mangoConfig.baseUrl).toBe('https://mango-mushroom-0d3dde80f.azurestaticapps.net');
    
    const { config } = await import('../../src/config/config');
    expect(config).toBeDefined();
  });

  it('should validate mango types schemas', async () => {
    const { GenreSchema, MangoItemSchema, TimeframeSchema } = await import('../../src/integrations/mango/types');
    
    // Test genre validation
    const validGenre = { id: 'test', name: 'Test Genre', slug: 'test-genre' };
    expect(() => GenreSchema.parse(validGenre)).not.toThrow();
    
    // Test item validation
    const validItem = {
      title: 'Test Book',
      author: 'Test Author',
      genre: 'fiction',
      timeframe: '1m',
      source: 'mango',
      url: 'https://example.com/test'
    };
    expect(() => MangoItemSchema.parse(validItem)).not.toThrow();
    
    // Test timeframe validation
    expect(() => TimeframeSchema.parse('1w')).not.toThrow();
    expect(() => TimeframeSchema.parse('invalid')).toThrow();
  });

  it('should import health server with new routes', async () => {
    const { build } = await import('../../src/web/health-server');
    expect(build).toBeDefined();
    
    const server = build({ logger: false });
    expect(server).toBeDefined();
    
    // Test that server has the expected routes
    const routes = server.printRoutes();
    expect(routes).toContain('genres');
    expect(routes).toContain('top');
    expect(routes).toContain('health');
    
    await server.close();
  });
});
