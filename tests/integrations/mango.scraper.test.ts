import { describe, it, expect, vi } from 'vitest';

// Simple mock for testing basic imports
vi.mock('undici', () => ({
  fetch: vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => '<html><body></body></html>'
  })
}));

describe('Mango Scraper Integration', () => {
  it('should import scraper functions without errors', async () => {
    const { listGenres, getTopByGenre, listTimeframes } = await import('../../src/integrations/mango/scraper');
    
    expect(listGenres).toBeDefined();
    expect(getTopByGenre).toBeDefined();
    expect(listTimeframes).toBeDefined();
    
    // Test that listTimeframes works
    const timeframes = listTimeframes();
    expect(timeframes).toEqual(['1w', '1m', '3m', '6m', '1y', 'all']);
  });
  
  it('should import types without errors', async () => {
    const { GenreSchema, MangoItemSchema, TimeframeSchema } = await import('../../src/integrations/mango/types');
    
    expect(GenreSchema).toBeDefined();
    expect(MangoItemSchema).toBeDefined();
    expect(TimeframeSchema).toBeDefined();
  });
  
  it('should import config without errors', async () => {
    const { mangoConfig } = await import('../../src/config/mango');
    
    expect(mangoConfig).toBeDefined();
    expect(mangoConfig.baseUrl).toBe('https://mango-mushroom-0d3dde80f.azurestaticapps.net');
  });
});
