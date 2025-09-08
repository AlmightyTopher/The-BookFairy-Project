import { searchBooksByAuthor } from "../integrations/google/books";
import { openLibrarySearchByAuthor } from "../integrations/openlibrary/search";

export type SortKey =
  | "title_asc" | "title_desc"
  | "year_asc"  | "year_desc"
  | "rating_asc"| "rating_desc";

export type BookMeta = {
  title: string;
  author: string;
  series?: string;
  isbn?: string;
  year?: string;
  rating?: number;
  ratingVotes?: number;
};

type Candidate = {
  title: string; author: string; year?: string; isbn10?: string; isbn13?: string;
  hasDescription: boolean; hasThumb: boolean; rating?: number; ratingVotes?: number;
  source: "gbooks" | "openlibrary";
};

const cache = new Map<string, { ts: number; items: BookMeta[] }>();
const TTL = 24 * 60 * 60 * 1000;

function quality(c: Candidate) {
  return (c.hasDescription ? 3 : 0) + (c.hasThumb ? 2 : 0) + ((c.isbn13 || c.isbn10) ? 2 : 0) + (c.year ? 1 : 0) + (c.source === "gbooks" ? 1 : 0) + (c.rating ? 1 : 0);
}

function sortItems(items: BookMeta[], key: SortKey) {
  const byTitle = (a: BookMeta, b: BookMeta) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  const byYear  = (a: BookMeta, b: BookMeta) => (Number(a.year ?? 0) - Number(b.year ?? 0));
  const byRate  = (a: BookMeta, b: BookMeta) => ((a.rating ?? 0) - (b.rating ?? 0)) || ((a.ratingVotes ?? 0) - (b.ratingVotes ?? 0));
  const s = [...items];
  switch (key) {
    case "title_asc":  return s.sort(byTitle);
    case "title_desc": return s.sort((a, b) => -byTitle(a, b));
    case "year_asc":   return s.sort(byYear);
    case "year_desc":  return s.sort((a, b) => -byYear(a, b));
    case "rating_asc": return s.sort(byRate);
    case "rating_desc":return s.sort((a, b) => -byRate(a, b));
    default:           return s;
  }
}

export async function findBooksByAuthor(
  author: string,
  opts?: { max?: number; sort?: SortKey; lang?: string }
): Promise<BookMeta[]> {
  const lang = "en"; // hard-force English
  const sort = opts?.sort ?? "rating_desc";
  const max = Math.min(opts?.max ?? 50, 50);

  const key = `${author.toLowerCase()}|${lang}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < TTL) {
    return sortItems(hit.items, sort).slice(0, max);
  }

  const [ga, ob] = await Promise.allSettled([
    searchBooksByAuthor(author, { limit: 40 }),
    openLibrarySearchByAuthor(author, { max: 50, lang })
  ]);
  const list: Candidate[] = [];
  if (ga.status === "fulfilled") {
    const gbooks = ga.value.items ?? [];
    const candidates = gbooks.map(gb => ({
      title: gb.title,
      author: gb.authors[0] ?? "",
      year: gb.publishedYear?.toString(),
      isbn10: undefined,
      isbn13: gb.meta.isbn,
      hasDescription: Boolean(gb.categories?.length),
      hasThumb: Boolean(gb.thumbnail),
      rating: gb.averageRating,
      ratingVotes: gb.ratingsCount,
      source: "gbooks" as const
    }));
    list.push(...candidates);
  }
  if (ob.status === "fulfilled") list.push(...ob.value);

  const merged = new Map<string, Candidate>();
  for (const c of list) {
    const k = c.title.toLowerCase().replace(/\s+/g, " ").trim();
    const prev = merged.get(k);
    if (!prev || quality(c) > quality(prev)) merged.set(k, c);
  }

  const items: BookMeta[] = [...merged.values()].map(c => ({
    title: c.title,
    author: c.author,
    year: c.year,
    isbn: c.isbn13 ?? c.isbn10,
    rating: c.rating,
    ratingVotes: c.ratingVotes
  }));

  cache.set(key, { ts: now, items });
  return sortItems(items, sort).slice(0, max);
}
