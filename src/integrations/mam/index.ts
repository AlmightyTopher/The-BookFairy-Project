import fs from 'fs';
import { fetch } from 'undici';
import { logger } from '../../utils/logger';
import { mamConfig } from '../../config/mam';
import { MangoItem } from '../mango/types';
import { mamEnrichmentAttempts, mamEnrichmentHits } from '../../metrics/server';

export interface MamCandidate {
  title: string;
  author: string;
  url: string;
  seeders: number;
  leechers: number;
  size: string;
  category: string;
  source: 'mam';
}

/**
 * Checks if MAM credentials are available
 */
function hasMamCredentials(): boolean {
  // Check for cookies file
  if (mamConfig.cookiesFile && fs.existsSync(mamConfig.cookiesFile)) {
    return true;
  }
  
  // Check for Prowlarr configuration
  if (mamConfig.prowlarr.url && mamConfig.prowlarr.apiKey) {
    return true;
  }
  
  return false;
}

/**
 * Loads cookies from file for MAM authentication
 */
function loadMamCookies(): string | null {
  try {
    if (!fs.existsSync(mamConfig.cookiesFile)) {
      return null;
    }
    
    const cookiesData = fs.readFileSync(mamConfig.cookiesFile, 'utf-8');
    // Parse cookies.txt format or return raw cookie string
    const lines = cookiesData.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    if (lines.length === 0) {
      return null;
    }
    
    // Simple format: just return the first non-comment line as cookie
    return lines[0].trim();
  } catch (error) {
    logger.warn({ error }, 'Failed to load MAM cookies');
    return null;
  }
}

/**
 * Searches MAM directly using cookies (simplified stub)
 */
async function searchMamDirect(query: string): Promise<MamCandidate[]> {
  const cookies = loadMamCookies();
  if (!cookies) {
    logger.debug({}, 'No MAM cookies available');
    return [];
  }
  
  try {
    // This is a stub implementation - in real usage, you'd need to:
    // 1. Make authenticated requests to MAM search
    // 2. Parse the response HTML/JSON
    // 3. Extract torrent information
    
    logger.debug({ query }, 'MAM direct search (stub implementation)');
    
    // Stub: return empty array for now
    return [];
  } catch (error) {
    logger.warn({ error, query }, 'MAM direct search failed');
    return [];
  }
}

/**
 * Searches MAM via Prowlarr
 */
async function searchMamViaProwlarr(query: string): Promise<MamCandidate[]> {
  const { url, apiKey, mamIndexerId } = mamConfig.prowlarr;
  
  if (!url || !apiKey) {
    logger.debug({}, 'No Prowlarr configuration available');
    return [];
  }
  
  try {
    const searchUrl = `${url}/api/v1/search`;
    const params = new URLSearchParams({
      query,
      indexerIds: mamIndexerId.toString(),
      categories: '3000,3030', // Audiobook categories
      type: 'search',
    });
    
    const response = await fetch(`${searchUrl}?${params.toString()}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Prowlarr API error: ${response.status}`);
    }
    
    const results = await response.json() as any[];
    
    return results.map(result => ({
      title: result.title || '',
      author: extractAuthorFromTitle(result.title || ''),
      url: result.downloadUrl || result.guid || '',
      seeders: result.seeders || 0,
      leechers: result.leechers || 0,
      size: formatSize(result.size || 0),
      category: result.category || 'Audiobook',
      source: 'mam' as const,
    }));
  } catch (error) {
    logger.warn({ error, query }, 'Prowlarr MAM search failed');
    return [];
  }
}

/**
 * Simple author extraction from title
 */
function extractAuthorFromTitle(title: string): string {
  // Look for common patterns like "Author - Title" or "Title by Author"
  const patterns = [
    /^([^-]+)\s*-\s*(.+)$/, // "Author - Title"
    /^(.+)\s+by\s+([^(]+)/i, // "Title by Author"
    /^([^(]+)\s*\(/,  // "Author (anything)"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown Author';
}

/**
 * Formats file size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Searches MAM for candidates matching a Mango item
 */
export async function searchMamCandidates(item: MangoItem): Promise<MamCandidate[]> {
  if (!mamConfig.enabled || !hasMamCredentials()) {
    logger.debug({ title: item.title }, 'MAM enrichment skipped - credentials not available');
    return [];
  }
  
  try {
    mamEnrichmentAttempts.inc({ source: 'mango' });
    
    // Construct search query from Mango item
    const query = `${item.title} ${item.author}`.trim();
    
    logger.debug({ query, source: 'mango' }, 'Searching MAM for candidates');
    
    // Try Prowlarr first, then direct MAM if available
    let candidates: MamCandidate[] = [];
    let source = 'none';
    
    if (mamConfig.prowlarr.url && mamConfig.prowlarr.apiKey) {
      candidates = await searchMamViaProwlarr(query);
      source = 'prowlarr';
    }
    
    // If Prowlarr didn't work and we have direct MAM access, try that
    if (candidates.length === 0 && loadMamCookies()) {
      candidates = await searchMamDirect(query);
      source = 'direct';
    }
    
    if (candidates.length > 0) {
      mamEnrichmentHits.inc({ source, candidate_count: candidates.length.toString() });
    }
    
    logger.info({ 
      query, 
      candidateCount: candidates.length,
      mangoTitle: item.title,
      source
    }, 'MAM search completed');
    
    return candidates;
  } catch (error) {
    logger.error({ error, item: item.title }, 'MAM search failed');
    return [];
  }
}
