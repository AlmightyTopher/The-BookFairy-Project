import { TTLCache } from "./cache";
import { BookLite, CatalogResult, SortKey } from "./types";
import { searchGoogleByAuthor } from "./googleBooks";
import { searchOpenLibraryByAuthor } from "./openLibrary";

const cache = new TTLCache<CatalogResult>(10 * 60 * 1000); // 10 minutes

function norm(s: string) { return s.toLowerCase().replace(/[\s\p{P}]+/gu, " ").trim(); }
function key(b: BookLite) { return `${norm(b.title)}::${norm(b.author)}`; }

function dedupe(items: BookLite[]): BookLite[] {
  const map = new Map<string, BookLite>();
  for (const b of items) {
    const k = key(b);
    const existing = map.get(k);
    if (!existing) { map.set(k, b); continue; }
    // prefer item with rating / year
    const better =
      (b.rating ?? -1) > (existing.rating ?? -1) ? b :
      (b.year   ?? -1) > (existing.year   ?? -1) ? b :
      existing;
    map.set(k, better);
  }
  return [...map.values()];
}

function sortItems(items: BookLite[], sort: SortKey): BookLite[] {
  const arr = [...items];
  const byTitle = (a: BookLite, b: BookLite) => norm(a.title).localeCompare(norm(b.title));
  const byYear  = (a: BookLite, b: BookLite) => (b.year ?? -1) - (a.year ?? -1);
  const byYearAsc = (a: BookLite, b: BookLite) => (a.year ?? 99999) - (b.year ?? 99999);
  const byRating = (a: BookLite, b: BookLite) => (b.rating ?? -1) - (a.rating ?? -1);

  switch (sort) {
    case "title_asc":  return arr.sort(byTitle);
    case "title_desc": return arr.sort((a,b)=>-byTitle(a,b));
    case "year_desc":  return arr.sort(byYear);
    case "year_asc":   return arr.sort(byYearAsc);
    case "rating_asc": return arr.sort((a,b)=>-byRating(a,b)).reverse();
    case "rating_desc":
    default:           return arr.sort(byRating);
  }
}

export async function getAuthorCatalog(author: string, sort: SortKey): Promise<CatalogResult> {
  const ck = `author:${norm(author)}`;
  const cached = cache.get(ck);
  if (cached) {
    return { items: sortItems(cached.items, sort), fromCache: true };
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  let google: BookLite[] = [];
  try { google = await searchGoogleByAuthor(author, apiKey); } catch { /* ignore */ }

  // fallback / blend with Open Library
  let open: BookLite[] = [];
  try { open = await searchOpenLibraryByAuthor(author); } catch { /* ignore */ }

  const merged = dedupe([...google, ...open].filter(b => b.author && b.title));
  cache.set(ck, { items: merged, fromCache: false });

  return { items: sortItems(merged, sort), fromCache: false };
}
