import { paginate } from "../../lib/pagination.js";
import * as HC from "../../integrations/hardcover/client.js";
import * as OL from "../../integrations/openlibrary/client.js";
import { toSearchOptions, relaySearch } from "../../integrations/prowlarr/client.js";
import { logger } from "../../utils/logger.js";

type BuildParams = { narrator: string };

interface NarratorWork {
  title: string;
  authors: string[];
  series?: string;
  year?: number;
  hasAudiobook?: boolean;
  source: 'hardcover' | 'fallback';
  hcId?: string | number;
}

export async function buildNarratorSearch({ narrator }: BuildParams) {
  logger.info({ narrator }, 'Building narrator search');
  
  let works: NarratorWork[] = [];
  
  try {
    // First try: Hardcover contribution filter (preferred for audiobooks)
    // Note: Hardcover doesn't have a direct narrator search in our current client
    // This would need to be added to the Hardcover adapter
    const hardcoverResults = await searchHardcoverByNarrator(narrator);
    
    if (hardcoverResults.length > 0) {
      works = hardcoverResults.map(book => ({
        title: book.title,
        authors: book.authors,
        series: book.series,
        year: book.year,
        hasAudiobook: book.hasAudiobook,
        source: 'hardcover' as const,
        hcId: book.id
      }));
      
      logger.info({ narrator, count: works.length }, 'Found works via Hardcover narrator search');
    } else {
      // Fallback: General book search with narrator name
      logger.info({ narrator }, 'No Hardcover narrator results, falling back to general search');
      
      // Try Hardcover general search
      const generalHC = await HC.searchByTitle(narrator);
      const hcBooks = (generalHC?.books || []).slice(0, 3); // Limit fallback results
      
      // Try Open Library search
      const olBooks = await OL.ol_search_loose(`narrator ${narrator}`, 1);
      
      // Combine and dedupe
      const combined = [
        ...hcBooks.map(book => ({
          title: book.title,
          authors: book.authors,
          year: book.year,
          hasAudiobook: false, // Unknown from general search
          source: 'fallback' as const,
          hcId: book.id
        })),
        ...olBooks.map(book => ({
          title: book.title,
          authors: book.authors,
          series: book.series,
          year: book.year,
          hasAudiobook: book.hasAudiobook,
          source: 'fallback' as const,
          hcId: book.id
        }))
      ];
      
      // Simple deduplication by title
      const seen = new Set<string>();
      works = combined.filter(work => {
        const key = work.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      logger.info({ narrator, count: works.length }, 'Found works via fallback search');
    }
    
  } catch (error) {
    logger.error({ error, narrator }, 'Error in narrator search');
    works = [];
  }
  
  // Add audiobook preference boost for sorting
  const sorted = works.sort((a, b) => {
    // Audiobooks first
    if (a.hasAudiobook && !b.hasAudiobook) return -1;
    if (!a.hasAudiobook && b.hasAudiobook) return 1;
    
    // Hardcover results over fallback
    if (a.source === 'hardcover' && b.source === 'fallback') return -1;
    if (a.source === 'fallback' && b.source === 'hardcover') return 1;
    
    // Newer books first
    return (b.year || 0) - (a.year || 0);
  });
  
  const enriched = sorted.map(work => ({
    ...work,
    label: formatWorkLabel(work, narrator)
  }));
  
  const page = paginate(enriched, 1, 5);
  return { page, narrator };
}

// Placeholder for future Hardcover narrator search enhancement
async function searchHardcoverByNarrator(narrator: string): Promise<HC.BasicBook[]> {
  // TODO: Enhance Hardcover client with narrator/contribution search
  // For now, return empty array to trigger fallback
  logger.debug({ narrator }, 'Hardcover narrator search not yet implemented, using fallback');
  return [];
}

function formatWorkLabel(work: NarratorWork, narrator: string): string {
  const parts = [];
  
  parts.push(work.title);
  
  if (work.authors.length > 0) {
    parts.push(`by ${work.authors.slice(0, 2).join(', ')}`);
  }
  
  if (work.series) {
    parts.push(`(${work.series})`);
  }
  
  if (work.year) {
    parts.push(`${work.year}`);
  }
  
  if (work.hasAudiobook) {
    parts.push('🎧');
  }
  
  if (work.source === 'hardcover') {
    parts.push('📚');
  }
  
  return parts.join(' ');
}

type ConfirmSelection = { 
  title: string; 
  authors?: string[];
  hcId?: string | number;
  source?: string;
};

type Ctx = { guildId: string; userId?: string };

export async function confirmNarratorWork(sel: ConfirmSelection, ctx: Ctx) {
  const correlationId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  
  // Build search query prioritizing audiobook formats
  const queryParts = [sel.title];
  
  if (sel.authors && sel.authors.length > 0) {
    queryParts.push(...sel.authors.slice(0, 2)); // Limit to first 2 authors
  }
  
  // Add audiobook-specific terms to improve matching
  queryParts.push('audiobook OR mp3 OR m4a OR m4b');
  
  const query = queryParts.join(' ');
  const opts = toSearchOptions(query);
  
  logger.info({ selection: sel, query, correlationId }, 'Confirming narrator work selection');
  
  try {
    const res = await relaySearch(opts, { ...ctx, correlationId });
    return { 
      ok: !!res?.ok, 
      meta: { correlationId, source: sel.source || 'unknown' }, 
      payload: opts 
    };
  } catch (error) {
    logger.error({ error, selection: sel, correlationId }, 'Error confirming narrator work');
    return { 
      ok: false, 
      meta: { correlationId, error: String(error) }, 
      payload: opts 
    };
  }
}