import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { retry } from '../utils/retry';
import * as fs from 'fs';
import * as path from 'path';

interface ProwlarrRelease {
  guid: string;
  title: string;
  size: number;
  downloadUrl: string;
  seeders: number;
  leechers: number;
  publishDate: string;
  indexerId: number;
}

interface ProwlarrState {
  seenGuids: Set<string>;
  lastCheck: string;
}

export interface SearchOptions {
  indexerId?: number | undefined;
  categories?: number[] | undefined;
  searchType?: 'all' | 'active' | 'inactive' | 'fl' | 'fl-VIP' | 'VIP' | 'nVIP';
  sortType?: 'titleAsc' | 'titleDesc' | 'sizeAsc' | 'sizeDesc' | 'seedersAsc' | 'seedersDesc' | 'dateAsc' | 'dateDesc';
  srchIn?: string[];
  preferredFormat?: 'M4B' | 'MP3';
  fallbackToMP3?: boolean;
  minSeeders?: number;
  language?: string;
  filterRegex?: string;
  stateDir?: string;
}

export interface SearchResult {
  results: ProwlarrRelease[];
  format?: 'M4B' | 'MP3';
  total?: number;
  indexerId?: number;
}

function loadState(stateDir: string): ProwlarrState {
  const statePath = path.join(stateDir, 'prowlarr_state.json');
  if (fs.existsSync(statePath)) {
    const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return {
      seenGuids: new Set(data.seenGuids),
      lastCheck: data.lastCheck
    };
  }
  return {
    seenGuids: new Set<string>(),
    lastCheck: new Date().toISOString()
  };
}

function saveState(state: ProwlarrState, stateDir: string): void {
  const statePath = path.join(stateDir, 'prowlarr_state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({
    seenGuids: Array.from(state.seenGuids),
    lastCheck: state.lastCheck
  }, null, 2));
}

const prowlarrClient: AxiosInstance = axios.create({
  baseURL: config.prowlarr.baseUrl,
  headers: {
    'X-Api-Key': config.prowlarr.apiKey,
  },
  timeout: config.prowlarr.timeout,
});

export async function searchProwlarr(query: string, options: Partial<SearchOptions> = {}): Promise<SearchResult> {
  const searchOptions = {
    indexerId: options.indexerId,
    categories: options.categories,
    searchType: options.searchType ?? 'active',
    sortType: options.sortType ?? 'seedersDesc',
    srchIn: options.srchIn ?? ['title', 'author'],
    preferredFormat: options.preferredFormat ?? 'M4B',
    fallbackToMP3: options.fallbackToMP3 ?? true,
    minSeeders: options.minSeeders ?? 1,
    language: options.language ?? 'ENG',
    filterRegex: options.filterRegex ?? undefined, // Remove restrictive regex by default
    stateDir: options.stateDir ?? './data'
  } as const;

  // Make the request
  const { data } = await retry(() =>
    prowlarrClient.get<ProwlarrRelease[]>('/api/v1/search', {
      params: {
        query,
        categories: config.prowlarr.categories,
        type: 'search',
      },
    })
  );

  console.log('Raw Prowlarr response:', JSON.stringify(data, null, 2));

  let results = data;

  // Apply intelligent filtering
  results = results.filter((result: ProwlarrRelease) => {
    const title = result.title.toLowerCase();
    
    // Check regex if specified (optional now)
    if (searchOptions.filterRegex) {
      const regex = new RegExp(searchOptions.filterRegex, 'i');
      if (!regex.test(result.title)) return false;
    }

    // Check language if specified (case insensitive)
    if (searchOptions.language) {
      const langPattern = `[${searchOptions.language.toLowerCase()}`;
      const langPatternUpper = `[${searchOptions.language.toUpperCase()}`;
      if (!title.includes(langPattern) && !title.includes(langPatternUpper)) {
        return false;
      }
    }

    // Check minimum seeders
    if (result.seeders < searchOptions.minSeeders) return false;

    return true;
  });

  // Sort by seeders (highest first)
  results.sort((a: ProwlarrRelease, b: ProwlarrRelease) => b.seeders - a.seeders);

  // Intelligent format selection - try M4B first, then MP3
  const m4bResults = results.filter((result: ProwlarrRelease) => 
    result.title.toLowerCase().includes('m4b')
  );

  if (m4bResults.length > 0) {
    return {
      results: m4bResults,
      format: 'M4B',
      total: m4bResults.length,
      indexerId: searchOptions.indexerId
    };
  }

  // If no M4B found, try MP3
  const mp3Results = results.filter((result: ProwlarrRelease) => {
    const title = result.title.toLowerCase();
    return title.includes('mp3');
  });

  if (mp3Results.length > 0) {
    return {
      results: mp3Results,
      format: 'MP3',
      total: mp3Results.length,
      indexerId: searchOptions.indexerId
    };
  }

  // If no specific format found, return all audiobook results
  const audiobookResults = results.filter((result: ProwlarrRelease) => {
    const title = result.title.toLowerCase();
    return title.includes('audio') || title.includes('mp3') || title.includes('m4a') || title.includes('m4b');
  });

  if (audiobookResults.length > 0) {
    return {
      results: audiobookResults,
      format: 'MP3',
      total: audiobookResults.length,
      indexerId: searchOptions.indexerId
    };
  }

  // If still no results, return all results (maybe it's a different format)
  if (results.length > 0) {
    return {
      results: results,
      format: undefined,
      total: results.length,
      indexerId: searchOptions.indexerId
    };
  }

  // If no results found at all
  return {
    results: [],
    format: undefined,
    total: 0,
    indexerId: searchOptions.indexerId
  };
}

export async function checkProwlarrHealth() {
  const startTime = Date.now();
  try {
    const response = await prowlarrClient.get('/api/v1/health', {
      timeout: 2000,
    });
    const issues = response.data as Array<{ type: string; message: string }>;
    const hasErrors = issues.some(issue => issue.type === 'error');
    
    return {
      status: hasErrors ? 'degraded' as const : 'up' as const,
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      issues: issues.length > 0 ? issues : undefined,
    };
  } catch (error: any) {
    return {
      status: 'down' as const,
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}
