import { gql, upcase } from "./client";
import { ME, SEARCH_BOOKS, FALLBACK_BOOKS_BY_TEXT, BOOK_FOR_MENU, BOOKS_BY_AUTHOR, EDITION_BY_ISBN, USER_HAS_BOOK, SEARCH_AUTHORS, USER_BOOKS_WITH_STATUS } from "./queries";

export type BookMenuData = {
  id: number | string;
  title: string;
  authors: string[];
  series?: string | null;
  seriesNumber?: string | number | null;
  synopsis?: string | null;
  narrators?: string[];
  coverUrl?: string | null;
  year?: number | null;
  hasAudio?: boolean | null;
  isbns?: string[] | null;
};

export type SearchItem = { id: number | string; title: string; authors: string[]; coverUrl?: string | null; series?: string | null; seriesNumber?: string | number | null; };

export async function hcPing() {
  return (await gql<{ me: { id: string; username: string; name?: string | null } }>(ME)).me;
}

export function buildSmartTitleQuery(title: string, series?: string | null, seriesNumber?: string | number | null) {
  let t = title.trim();
  if (series && !new RegExp(`^${escapeRx(series)}\\s*:`,'i').test(t)) t = `${series}: ${t}`;
  if (seriesNumber != null && String(seriesNumber).length) t = `${t} #${seriesNumber}`;
  return t;
}

export async function searchBooksDescriptionFirst(q: string, limit = 5, offset = 0) {
  try {
    // Convert offset to page number (Hardcover uses page-based pagination)
    const page = Math.floor(offset / limit) + 1;
    const data = await gql<{ search: { results: any[]; page: number; per_page: number } }>(SEARCH_BOOKS, { 
      q, 
      per_page: limit, 
      page 
    });
    
    const results = data.search.results || [];
    const items: SearchItem[] = results.map((result: any) => ({
      id: result.id,
      title: result.title,
      authors: result.author_names || [],
      coverUrl: result.image?.url ?? null,
      series: result.series_names?.[0] ?? null,
      seriesNumber: result.series_sequence ?? null,
    }));
    
    // Calculate next offset for pagination consistency
    const nextOffset = items.length < limit ? undefined : offset + limit;
    return { items, nextOffset };
  } catch (error: any) {
    // Fallback to direct book query if search API fails
    console.log("[searchBooksDescriptionFirst] Search API failed, using fallback:", error?.message);
    const patterns = tokenize(q);
    const data = await gql<{ books: any[] }>(FALLBACK_BOOKS_BY_TEXT, { patterns, limit, offset });
    const items: SearchItem[] = data.books.map((b: any) => ({
      id: b.id, title: b.title, authors: b.author_names || [], coverUrl: b.image?.url ?? null,
      series: b.series_names?.[0] ?? null, seriesNumber: b.series_sequence ?? null,
    }));
    return { items, nextOffset: items.length < limit ? undefined : offset + limit };
  }
}

export async function listBooksByAuthor(author: string, limit = 5, offset = 0) {
  const data = await gql<{ books: any[] }>(BOOKS_BY_AUTHOR, { author: `%${author}%`, limit, offset });
  const items: SearchItem[] = data.books.map((b: any) => ({
    id: b.id, title: b.title, authors: b.author_names || [], coverUrl: b.image?.url ?? null,
    series: b.series_names?.[0] ?? null, seriesNumber: b.series_sequence ?? null,
  }));
  return { items, nextOffset: items.length < limit ? undefined : offset + limit };
}

export async function bookMenuFromBookId(bookId: number | string) {
  const b = (await gql<{ books_by_pk: any }>(BOOK_FOR_MENU, { id: Number(bookId) })).books_by_pk;
  return {
    id: b.id,
    title: b.title,
    authors: b.author_names || [],
    series: b.series_names?.[0] ?? null,
    seriesNumber: b.series_sequence ?? null,
    synopsis: b.description ?? null,
    narrators: (b.contributions || []).filter((c: any) => c.role === "Narrator").map((c: any) => c.person_name),
    coverUrl: b.image?.url ?? null,
    year: b.release_year ?? null,
    hasAudio: b.has_audiobook ?? null,
    isbns: b.isbns ?? null,
  };
}

export async function editionPreflightByIsbn(isbn: string) {
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  const v = { isbn10: clean.length === 10 ? clean : undefined, isbn13: clean.length === 13 ? clean : undefined };
  const { editions } = await gql<{ editions: any[] }>(EDITION_BY_ISBN, v);
  return editions.map(e => ({
    isbn10: e.isbn_10 ?? null,
    isbn13: e.isbn_13 ?? null,
    format: e.physical_format ?? null,
    audioSeconds: e.audio_seconds ?? null,
    publisher: e.publisher?.name ?? null,
    country: e.country?.name ?? null,
    country2: upcase(e.country?.code2),
    country3: upcase(e.country?.code3),
    coverUrl: e.image?.url ?? e.book?.image?.url ?? null,
    book: e.book ? {
      id: e.book.id,
      title: e.book.title,
      authors: e.book.author_names || [],
      series: e.book.series_names?.[0] ?? null,
      seriesNumber: e.book.series_sequence ?? null,
      synopsis: e.book.description ?? null,
      coverUrl: e.book.image?.url ?? null,
    } : null,
  }));
}

export function warnIfLengthMismatch(editionSeconds?: number | null, torrentSeconds?: number | null) {
  if (!editionSeconds || !torrentSeconds) return undefined;
  const diff = Math.abs(editionSeconds - torrentSeconds);
  const pct = diff / Math.max(editionSeconds, 1);
  return pct >= 0.2 ? `Heads up: audiobook length differs by ~${Math.round(pct * 100)}% (possible abridged).` : undefined;
}

export async function userHasBook(bookId: number | string): Promise<boolean> {
  const uid = process.env.HARDCOVER_USER_ID;
  if (!uid) return false;
  const out = await gql<{ user_books: any[] }>(USER_HAS_BOOK, { userId: Number(uid), bookId: Number(bookId) });
  return (out.user_books?.length ?? 0) > 0;
}

export async function getUserBookStatus(bookId: number | string): Promise<{ hasBook: boolean; status?: string } | null> {
  const uid = process.env.HARDCOVER_USER_ID;
  if (!uid) return null;
  
  try {
    const out = await gql<{ user_books: { status_id: number }[] }>(USER_HAS_BOOK, { userId: Number(uid), bookId: Number(bookId) });
    if (!out.user_books?.length) return { hasBook: false };
    
    const statusId = out.user_books[0].status_id;
    const statusMap: Record<number, string> = {
      1: "Want to Read",
      2: "Currently Reading", 
      3: "Read",
      4: "Did Not Finish"
    };
    
    return { hasBook: true, status: statusMap[statusId] || `Status ${statusId}` };
  } catch (error: any) {
    console.log("[getUserBookStatus] Failed to check book status:", error?.message);
    return null;
  }
}

export async function searchAuthors(q: string, limit = 5, offset = 0) {
  try {
    const page = Math.floor(offset / limit) + 1;
    const data = await gql<{ search: { results: any[] } }>(SEARCH_AUTHORS, { 
      q, 
      per_page: limit, 
      page 
    });
    
    const results = data.search.results || [];
    const items = results.map((result: any) => ({
      id: result.id || result.slug,
      name: result.name,
      alternateNames: result.alternate_names || [],
      booksCount: result.books_count || 0,
      topBooks: result.books || [],
      imageUrl: result.image?.url ?? null,
    }));
    
    const nextOffset = items.length < limit ? undefined : offset + limit;
    return { items, nextOffset };
  } catch (error: any) {
    console.log("[searchAuthors] Author search failed:", error?.message);
    return { items: [], nextOffset: undefined };
  }
}

function tokenize(q: string) {
  return Array.from(new Set(q.split(/[\s,.;:!?()"'`]+/g).map(s => s.trim()).filter(Boolean).filter(s => s.length >= 3)))
    .map(s => `%${s}%`);
}
function escapeRx(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
