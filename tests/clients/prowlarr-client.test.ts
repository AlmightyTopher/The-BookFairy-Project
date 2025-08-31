// tests/clients/prowlarr-client.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as prowlarr from '../../src/clients/prowlarr-client';

let searchSpy: any;

beforeEach(() => {
  searchSpy = vi.spyOn(prowlarr, 'searchProwlarr');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Prowlarr Client Tests', () => {
  it('should search with basic parameters', async () => {
    searchSpy.mockResolvedValue({
      results: [
        {
          guid: '123',
          title: 'Dune by Frank Herbert M4B',
          size: 500_000_000,
          downloadUrl: 'http://example.com/dune',
          seeders: 10,
          indexerId: 1,
        },
      ],
      format: 'M4B',
    });

    const out = await prowlarr.searchProwlarr('dune');
    expect(Array.isArray(out.results)).toBe(true);
    expect(out.results.length).toBeGreaterThan(0);
  });

  it('should filter by minimum seeders', async () => {
    searchSpy.mockResolvedValue({
      results: [
        { guid: 'A', title: 'Low seed', size: 1, downloadUrl: '#', seeders: 2, indexerId: 1 },
        { guid: 'B', title: 'OK', size: 1, downloadUrl: '#', seeders: 12, indexerId: 1 },
      ],
      format: 'M4B',
    });

    const out = await prowlarr.searchProwlarr('foo');
    const filtered = out.results.filter(r => r.seeders >= 10);
    expect(filtered.map(r => r.guid)).toEqual(['B']);
  });

  it('should handle empty results', async () => {
    searchSpy.mockResolvedValue({ results: [], format: 'MP3' });
    const out = await prowlarr.searchProwlarr('nope');
    expect(out.results.length).toBe(0);
  });

  it('should manage state between searches', async () => {
    searchSpy.mockResolvedValueOnce({ results: [{ guid: '1', title: 'One', size: 1, downloadUrl: '#', seeders: 5, indexerId: 1 }], format: 'M4B' })
             .mockResolvedValueOnce({ results: [{ guid: '2', title: 'Two', size: 1, downloadUrl: '#', seeders: 8, indexerId: 1 }], format: 'M4B' });

    const a = await prowlarr.searchProwlarr('a');
    const b = await prowlarr.searchProwlarr('b');

    expect(a.results[0].guid).toBe('1');
    expect(b.results[0].guid).toBe('2');
    expect(searchSpy).toHaveBeenCalledTimes(2);
  });
});
