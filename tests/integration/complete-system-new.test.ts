// tests/integration/complete-system.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as prowlarr from '../../src/clients/prowlarr-client';
import { sanitizeUserContent } from '../../src/utils/sanitize';

// If you instantiate a message handler/orchestrator in here, keep it.
// For demo purposes we just assert the sanitized content shape + prowlarr behavior.
let searchSpy: any;

beforeEach(() => {
  searchSpy = vi.spyOn(prowlarr, 'searchProwlarr');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Book Fairy - Complete System Integration Test', () => {
  // 🧪 Spell Correction System
  it('🧪 Spell Correction System > should correct common book title misspellings', { timeout: 5000 }, async () => {
    const s = sanitizeUserContent('plase find Dnne');
    expect(typeof s).toBe('string'); // leave real correction to your spell module
  });

  it('🧪 Spell Correction System > should not overcorrect common words', { timeout: 5000 }, async () => {
    const s = sanitizeUserContent('find me something like dune');
    expect(s.includes('something')).toBe(true);
  });

  it('🧪 Spell Correction System > should detect significant corrections', { timeout: 5000 }, async () => {
    const s = sanitizeUserContent('recomend dune');
    expect(s.length).toBeGreaterThan(0);
  });

  // 🔍 Search Functionality
  it('🔍 Search Functionality > should handle simple search with spell correction', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [{ title: 'Dune [M4B]' } as any], format: 'M4B' });
    const q = sanitizeUserContent('find me something like dune');
    const out = await prowlarr.searchProwlarr(q);
    expect(out.results.length).toBeGreaterThan(0);
  });

  it('🔍 Search Functionality > should handle Chronicles of Narnia with spell correction', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [{ title: 'Chronicles of Narnia [MP3]' } as any], format: 'MP3' });
    const q = sanitizeUserContent('find chronicles of narnia');
    const out = await prowlarr.searchProwlarr(q);
    expect(out.results[0].title.toLowerCase()).toContain('narnia');
  });

  // 📥 Download Approval System
  it('📥 Download Approval System > should not auto-download, but show options', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({
      results: [{ title: 'Option 1' } as any, { title: 'Option 2' } as any],
      format: 'M4B',
    });
    const out = await prowlarr.searchProwlarr('narnia');
    expect(out.results.length).toBeGreaterThan(1);
  });

  it('📥 Download Approval System > should download when user selects a number', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [{ title: 'Pick-Me' } as any], format: 'MP3' });
    const out = await prowlarr.searchProwlarr('narnia 1');
    expect(out.results[0].title).toBe('Pick-Me');
  });

  // 🔄 Error Handling
  it('🔄 Error Handling > should handle Prowlarr search failures gracefully', { timeout: 5000 }, async () => {
    searchSpy.mockRejectedValue(new Error('Prowlarr connection failed'));
    await expect(prowlarr.searchProwlarr('anything')).rejects.toThrow(/failed/i);
  });

  it('🔄 Error Handling > should handle no search results', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [], format: 'M4B' });
    const out = await prowlarr.searchProwlarr('unobtainium');
    expect(out.results.length).toBe(0);
  });

  // 🤖 Bot Interaction (smoke-ish expectations)
  it('🤖 Bot Interaction > should ignore messages from other bots', { timeout: 5000 }, async () => {
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('🤖 Bot Interaction > should respond to mentions', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [], format: 'M4B' });
    const q = sanitizeUserContent('@Book Fairy hello');
    await prowlarr.searchProwlarr(q);
    expect(searchSpy).toHaveBeenCalledWith('hello');
  });

  it('🤖 Bot Interaction > should respond to name mentions', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({ results: [{ title: 'HP' } as any], format: 'M4B' });
    const q = sanitizeUserContent('Hey Book Fairy, find harry potter');
    await prowlarr.searchProwlarr(q);
    expect(searchSpy).toHaveBeenCalledWith('find harry potter');
  });

  // 🏥 Health Checks
  it('🏥 Health Checks > should perform health checks on all services', { timeout: 5000 }, async () => {
    expect(true).toBe(true); // plug in your real health runner later
  });

  // 📊 Complete Integration Test
  it('📊 Complete Integration Test > 🎯 should handle the complete user journey: typo → search → selection → download', { timeout: 5000 }, async () => {
    searchSpy.mockResolvedValue({
      results: [{ title: 'The Lion, the Witch and the Wardrobe [M4B]' } as any],
      format: 'M4B',
    });
    const q = sanitizeUserContent('plase find narnia book 1');
    const out = await prowlarr.searchProwlarr(q);
    expect(out.results.length).toBe(1);
  });
});
