// src/integrations/prowlarr/client.ts
// Enhanced client with new spec contract methods

import { logger } from '../../utils/logger.js';

export type SearchOptions = { query: string; [k: string]: unknown };

export function toSearchOptions(q: string): SearchOptions {
  return { query: String(q ?? "").trim() };
}

export async function relaySearch(
  _opts: SearchOptions,
  ctx?: { correlationId?: string; [k: string]: unknown }
): Promise<{ ok: boolean; meta?: { correlationId?: string } }> {
  // Tests mock this; we keep a predictable shape.
  return { ok: true, meta: { correlationId: ctx?.correlationId } };
}

// NEW SPEC CONTRACT IMPLEMENTATIONS (A1.3)

export interface Result {
  title: string;
  indexerId: number;
  indexer: string;
  size: number;
  seeders: number;
  peers: number;
  publishDate: string;
  link: string;
  guid?: string;
  downloadUrl?: string;
}

/** New Spec: Search across indexers with pagination */
export async function indexer_search(
  query: string, 
  limit: number = 10, 
  offset: number = 0, 
  indexerIds?: string[]
): Promise<Result[]> {
  logger.info({ query, limit, offset, indexerIds }, 'Prowlarr indexer_search');
  
  try {
    // Build search URL
    const url = new URL('/api/v1/search', process.env.PROWLARR_URL || 'http://localhost:9696');
    url.searchParams.set('query', query);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    
    if (indexerIds && indexerIds.length > 0) {
      url.searchParams.set('indexerIds', indexerIds.join(','));
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': process.env.PROWLARR_API_KEY || '',
        'User-Agent': 'BookFairy/1.0'
      }
    });
    
    if (!response.ok) {
      logger.error({ status: response.status, statusText: response.statusText, query }, 'Prowlarr search failed');
      return [];
    }
    
    const data = await response.json();
    
    // Transform Prowlarr response to our Result format
    return (Array.isArray(data) ? data : []).map((item: any): Result => ({
      title: item.title || 'Unknown Title',
      indexerId: item.indexerId || 0,
      indexer: item.indexer || 'Unknown',
      size: item.size || 0,
      seeders: item.seeders || 0,
      peers: item.peers || item.leechers || 0,
      publishDate: item.publishDate || new Date().toISOString(),
      link: item.link || item.guid || '',
      guid: item.guid,
      downloadUrl: item.downloadUrl
    }));
    
  } catch (error) {
    logger.error({ error, query }, 'Prowlarr indexer_search failed');
    return [];
  }
}

/** New Spec: Check if available on MAM specifically */
export async function available_on_mam(query: string): Promise<boolean> {
  logger.info({ query }, 'Checking MAM availability');
  
  try {
    let mamIndexerId = process.env.MAM_INDEXER_ID;
    
    // If no specific ID set, try to find MAM by name
    if (!mamIndexerId) {
      const indexers = await getAvailableIndexers();
      const mam = indexers.find(indexer => 
        indexer.name.toLowerCase().includes('myanonamouse') ||
        indexer.name.toLowerCase().includes('mam')
      );
      mamIndexerId = mam?.id?.toString();
    }
    
    if (!mamIndexerId) {
      logger.warn('MAM indexer not found or configured');
      return false;
    }
    
    const results = await indexer_search(query, 5, 0, [mamIndexerId]);
    const found = results.length > 0;
    
    logger.info({ query, found, resultCount: results.length }, 'MAM availability check complete');
    return found;
    
  } catch (error) {
    logger.error({ error, query }, 'MAM availability check failed');
    return false;
  }
}

/** New Spec: Pick best torrent from results */
export async function pick_best_torrent(results: Result[]): Promise<Result | null> {
  if (!results || results.length === 0) {
    return null;
  }
  
  // Sort by: seeders (desc), then recency (desc), then reasonable size
  const sorted = [...results].sort((a, b) => {
    // Primary: seeders (more is better)
    if (a.seeders !== b.seeders) {
      return b.seeders - a.seeders;
    }
    
    // Secondary: recency (newer is better)
    const aDate = new Date(a.publishDate).getTime();
    const bDate = new Date(b.publishDate).getTime();
    if (aDate !== bDate) {
      return bDate - aDate;
    }
    
    // Tertiary: size (prefer reasonable size, avoid extremes)
    const reasonableSize = 500 * 1024 * 1024; // 500MB as baseline
    const aSizeDiff = Math.abs(a.size - reasonableSize);
    const bSizeDiff = Math.abs(b.size - reasonableSize);
    
    return aSizeDiff - bSizeDiff;
  });
  
  const best = sorted[0];
  logger.info({ 
    title: best.title, 
    seeders: best.seeders, 
    size: best.size, 
    indexer: best.indexer 
  }, 'Best torrent selected');
  
  return best;
}

/** Helper: Get available indexers */
async function getAvailableIndexers(): Promise<Array<{id: number, name: string}>> {
  try {
    const url = new URL('/api/v1/indexer', process.env.PROWLARR_URL || 'http://localhost:9696');
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': process.env.PROWLARR_API_KEY || '',
        'User-Agent': 'BookFairy/1.0'
      }
    });
    
    if (!response.ok) {
      logger.error({ status: response.status }, 'Failed to fetch indexers');
      return [];
    }
    
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map((indexer: any) => ({
      id: indexer.id,
      name: indexer.name || 'Unknown'
    }));
    
  } catch (error) {
    logger.error({ error }, 'Failed to get available indexers');
    return [];
  }
}