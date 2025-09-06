// Author → Books search via Google Books (English only).
// Sorting: "year" | "rating" | "title_az" | "title_za" (default title_az)

export type GBook = {
  id: string;
  title: string;
  authors: string[];
  publishedYear?: number;
  averageRating?: number;
  ratingsCount?: number;
  pageCount?: number;
  categories?: string[];
  thumbnail?: string;
  meta: { title: string; author: string; series?: string; isbn?: string };
};

type SortKey = "year" | "rating" | "title_az" | "title_za";
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

function toYear(d?: string) { if (!d) return; const y = parseInt(d.slice(0,4),10); return Number.isFinite(y)?y:undefined; }

function normalizeItem(it: any): GBook | null {
  const v = it?.volumeInfo; if (!v?.title) return null;
  const title = String(v.title).trim();
  const authors = Array.isArray(v.authors) ? v.authors.map((a: string) => a.trim()) : [];
  const isbn = (v.industryIdentifiers || []).find((i: any) => i.type==="ISBN_13")?.identifier
            || (v.industryIdentifiers || []).find((i: any) => i.type==="ISBN_10")?.identifier;
  const thumb = v.imageLinks?.thumbnail?.replace("http://","https://")
             || v.imageLinks?.smallThumbnail?.replace("http://","https://");
  return {
    id: it.id,
    title,
    authors,
    publishedYear: toYear(v.publishedDate),
    averageRating: v.averageRating,
    ratingsCount: v.ratingsCount,
    pageCount: v.pageCount,
    categories: v.categories,
    thumbnail: thumb,
    meta: { title, author: authors[0] ?? "", isbn },
  };
}

function sortItems(items: GBook[], sort: SortKey): GBook[] {
  const byTitle = (a: GBook,b:GBook)=>a.title.localeCompare(b.title,undefined,{sensitivity:"base"});
  if (sort==="title_az") return [...items].sort(byTitle);
  if (sort==="title_za") return [...items].sort((a,b)=>-byTitle(a,b));
  if (sort==="year")    return [...items].sort((a,b)=>(b.publishedYear??0)-(a.publishedYear??0));
  if (sort==="rating")  return [...items].sort((a,b)=>(b.averageRating??0)-(a.averageRating??0) || (b.ratingsCount??0)-(a.ratingsCount??0));
  return items;
}

export async function searchBooksByAuthor(author: string, opts?: { limit?: number; pages?: number; sort?: SortKey; }) {
  const key = process.env.GOOGLE_BOOKS_API_KEY; if (!key) throw new Error("Missing GOOGLE_BOOKS_API_KEY");
  const limit = Math.max(1, Math.min(100, opts?.limit ?? 25));
  const pages = Math.max(1, Math.min(3,   opts?.pages ?? 2));
  const sort  = (opts?.sort ?? "title_az") as SortKey;

  const pageSize = 40;
  let total = 0; const all: GBook[] = [];

  for (let p=0; p<pages; p++) {
    const startIndex = p * pageSize;
    const url = new URL(GOOGLE_BOOKS_API);
    url.searchParams.set("q", `inauthor:"${author.replace(/"/g,"")}"`);
    url.searchParams.set("langRestrict", "en");
    url.searchParams.set("printType", "books");
    url.searchParams.set("maxResults", String(pageSize));
    url.searchParams.set("startIndex", String(startIndex));
    url.searchParams.set("key", key);

    const res = await fetch(url);
    if (!res.ok) { console.log("[googleBooks] HTTP", res.status, await res.text()); break; }
    const json: any = await res.json();
    total = json?.totalItems ?? total;
    const normalized = (json?.items ?? []).map(normalizeItem).filter(Boolean) as GBook[];
    all.push(...normalized);
    if (!json?.items || json.items.length < pageSize) break;
  }

  const seen = new Set<string>();
  const deduped = all.filter(b => { const k = `${b.title.toLowerCase()}|${(b.authors[0]||"").toLowerCase()}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const sorted = sortItems(deduped, sort).slice(0, limit);
  console.log("[googleBooks] author=%s total=%d returning=%d sort=%s", author, total, sorted.length, sort);
  return { total, items: sorted };
}
