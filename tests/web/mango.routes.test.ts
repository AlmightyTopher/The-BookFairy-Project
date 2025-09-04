import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { build } from '../../src/web/health-server';
import type { FastifyInstance } from 'fastify';

// Mock the mango scraper
vi.mock('../../src/integrations/mango/scraper', () => ({
  listGenres: vi.fn().mockResolvedValue([
    { id: 'fiction', name: 'Fiction', slug: 'fiction' },
    { id: 'mystery', name: 'Mystery', slug: 'mystery' }
  ]),
  getTopByGenre: vi.fn().mockResolvedValue([
    {
      title: 'Test Book',
      author: 'Test Author',
      genre: 'fiction',
      timeframe: '1m',
      source: 'mango',
      url: 'https://example.com/test-book'
    }
  ])
}));

describe('Health Server - Mango Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/mango/genres', () => {
    it('should return genres list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/genres'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.genres).toHaveLength(2);
      expect(data.genres[0]).toEqual({
        id: 'fiction',
        name: 'Fiction',
        slug: 'fiction'
      });
    });

    it('should handle scraper errors', async () => {
      const { listGenres } = await import('../../src/integrations/mango/scraper');
      vi.mocked(listGenres).mockRejectedValueOnce(new Error('Scraper error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/genres'
      });

      expect(response.statusCode).toBe(502);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch genres');
    });
  });

  describe('GET /api/mango/top', () => {
    it('should return top books with valid parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top',
        query: {
          genre: 'fiction',
          timeframe: '1m',
          limit: '5'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toMatchObject({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'fiction'
      });
    });

    it('should use default values for optional parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top',
        query: {
          genre: 'fiction'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);

      // Verify getTopByGenre was called with defaults
      const { getTopByGenre } = await import('../../src/integrations/mango/scraper');
      expect(vi.mocked(getTopByGenre)).toHaveBeenCalledWith('fiction', '1m', 10);
    });

    it('should validate required genre parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top'
        // Missing genre parameter
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should validate timeframe parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top',
        query: {
          genre: 'fiction',
          timeframe: 'invalid'
        }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should validate limit parameter range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top',
        query: {
          genre: 'fiction',
          limit: '200' // Above max of 100
        }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should handle scraper errors', async () => {
      const { getTopByGenre } = await import('../../src/integrations/mango/scraper');
      vi.mocked(getTopByGenre).mockRejectedValueOnce(new Error('Scraper error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/mango/top',
        query: {
          genre: 'fiction'
        }
      });

      expect(response.statusCode).toBe(502);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch top books');
    });
  });

  describe('health endpoint compatibility', () => {
    it('should still respond to health checks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.status).toBe('ok');
    });
  });
});
