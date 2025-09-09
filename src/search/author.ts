import { searchBooksByAuthor, type GBook } from "../integrations/google/books";
import { openLibrarySearchByAuthor, type OLAuthorResult } from "../integrations/openlibrary/search";
import { getBooksByAuthor, searchAuthors, type BookDetails } from "../integrations/hardcover/service";

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
  source: "hardcover" | "gbooks" | "openlibrary";
};

const cache = new Map<string, { ts: number; items: BookMeta[] }>();
const TTL = 24 * 60 * 60 * 1000;

// Helper functions to convert different source types to Candidate
function hardcoverToCandidate(book: BookDetails, author: string): Candidate {
  return {
    title: book.title,
    author: book.authors[0] || author,
    year: undefined, // BookDetails doesn't include release date
    isbn13: book.isbn13 || undefined,
    hasDescription: !!book.description,
    hasThumb: !!book.imageUrl,
    rating: undefined, // Hardcover doesn't expose rating in BookDetails
    ratingVotes: undefined,
    source: "hardcover"
  };
}

// Enhanced function to preserve rich Hardcover data for title selection
function hardcoverToBookMeta(book: BookDetails, author: string): BookMeta {
  return {
    title: book.title,
    author: book.authors[0] || author,
    series: book.seriesName ? `${book.seriesName}${book.seriesNumber ? ` #${book.seriesNumber}` : ''}` : undefined,
    isbn: book.isbn13 || undefined,
    year: undefined, // BookDetails doesn't include release date from Hardcover API
    rating: undefined, // Hardcover rating not exposed in BookDetails
    ratingVotes: undefined
  };
}

function gbooksToCandidate(book: GBook): Candidate {
  return {
    title: book.title,
    author: book.authors[0] || "",
    year: book.publishedYear?.toString(),
    isbn13: book.meta.isbn?.length === 13 ? book.meta.isbn : undefined,
    isbn10: book.meta.isbn?.length === 10 ? book.meta.isbn : undefined,
    hasDescription: !!book.pageCount, // Use pageCount as proxy for detailed info
    hasThumb: !!book.thumbnail,
    rating: book.averageRating,
    ratingVotes: book.ratingsCount,
    source: "gbooks"
  };
}

function openlibToCandidate(book: OLAuthorResult): Candidate {
  return {
    title: book.title,
    author: book.author,
    year: book.year,
    isbn13: book.isbn13,
    isbn10: book.isbn10,
    hasDescription: book.hasDescription,
    hasThumb: book.hasThumb,
    rating: book.rating,
    ratingVotes: book.ratingVotes,
    source: "openlibrary"
  };
}

function quality(c: Candidate) {
  // Give Hardcover higher priority, then Google Books, then OpenLibrary
  const sourceBonus = c.source === "hardcover" ? 3 : c.source === "gbooks" ? 1 : 0;
  return (c.hasDescription ? 3 : 0) + (c.hasThumb ? 2 : 0) + ((c.isbn13 || c.isbn10) ? 2 : 0) + (c.year ? 1 : 0) + sourceBonus + (c.rating ? 1 : 0);
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

  // Use ONLY Hardcover for author search as requested
  const hardcoverBooks: BookDetails[] = [];
  
  try {
    // Get books from Hardcover only
    const hcResults = await getBooksByAuthor(author, max);
    hardcoverBooks.push(...hcResults);
    
    // Convert all Hardcover results to BookMeta format with rich metadata preserved
    const items: BookMeta[] = hcResults.map(book => hardcoverToBookMeta(book, author));

    cache.set(key, { ts: now, items });
    return sortItems(items, sort).slice(0, max);
    
  } catch (error) {
    console.error('Hardcover author search failed:', error);
    // Return empty array if Hardcover fails, as requested to use ONLY Hardcover
    return [];
  }
}
