const API_URL = process.env.HARDCOVER_API_URL || "https://api.hardcover.app/v1/graphql";
const TOKEN = process.env.HARDCOVER_API_TOKEN;
const UA = process.env.HARDCOVER_USER_AGENT || "BookFairy/1.0 (+github.com/AlmightyTopher/The-BookFairy-Project)";

if (!TOKEN) throw new Error("HARDCOVER_API_TOKEN is required");

type GQLError = { message: string };
type GQLRes<T> = { data?: T; errors?: GQLError[] };

// Types for book metadata
export interface BookMeta {
  title?: string | null;
  author?: string | null;
  hcId?: number | string | null;
  isbn?: string | null;
  series?: string | null;
  seriesNumber?: string | number | null;
}

export interface BookDetails {
  hcId?: number | string | null;
  title?: string | null;
  authors?: string[];
  description?: string | null;
  coverUrl?: string | null;
  seriesName?: string | null;
  seriesNumber?: string | number | null;
  year?: number | null;
  hasAudio?: boolean | null;
  isbns?: string[] | null;
}

export async function gql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}`, "user-agent": UA },
    body: JSON.stringify({ query, variables }),
    // @ts-ignore Node 18+ global fetch supports AbortSignal
    signal,
  });
  if (!res.ok) throw new Error(`Hardcover HTTP ${res.status} ${await res.text().catch(() => "")}`);
  const json = (await res.json()) as GQLRes<T>;
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join("; "));
  if (!json.data) throw new Error("Hardcover: empty data");
  return json.data;
}

export const upcase = (s?: string | null) => (s ? s.toUpperCase() : undefined);

// GraphQL queries
const SEARCH_BOOKS_QUERY = /* GraphQL */ `
  query SearchBooks($q: String!, $limit: Int!, $offset: Int!) {
    search(query: $q, query_type: book, limit: $limit, offset: $offset) {
      score
      book {
        id title author_names series_names series_sequence release_year
        has_audiobook has_ebook isbns image { url } description
      }
    }
  }
`;

const BOOK_DETAILS_QUERY = /* GraphQL */ `
  query BookDetails($id: bigint!) {
    books_by_pk(id: $id) {
      id title author_names series_names series_sequence description release_year
      image { url }
      isbns has_audiobook has_ebook
    }
  }
`;

// Helper function to build search query
function buildSearchQuery(meta: BookMeta): string {
  const parts: string[] = [];
  
  if (meta.title) parts.push(meta.title);
  if (meta.author) parts.push(meta.author);
  if (meta.series) parts.push(meta.series);
  
  return parts.join(" ");
}

// Main functions
export async function getBookDetails(meta: BookMeta): Promise<BookDetails | null> {
  try {
    // If we have an hcId, fetch directly
    if (meta.hcId) {
      const data = await gql<{ books_by_pk: any }>(BOOK_DETAILS_QUERY, { id: Number(meta.hcId) });
      const book = data.books_by_pk;
      
      if (book) {
        return {
          hcId: book.id,
          title: book.title,
          authors: book.author_names || [],
          description: book.description,
          coverUrl: book.image?.url,
          seriesName: book.series_names?.[0],
          seriesNumber: book.series_sequence,
          year: book.release_year,
          hasAudio: book.has_audiobook,
          isbns: book.isbns
        };
      }
    }

    // Otherwise, search for the book
    const query = buildSearchQuery(meta);
    if (!query) return null;

    const searchData = await gql<{ search: { score: number; book: any }[] }>(SEARCH_BOOKS_QUERY, {
      q: query,
      limit: 5,
      offset: 0
    });

    const books = searchData.search?.map(s => s.book).filter(Boolean) || [];
    
    // Find best match
    for (const book of books) {
      // Simple matching logic - can be improved
      const titleMatch = !meta.title || book.title?.toLowerCase().includes(meta.title.toLowerCase());
      const authorMatch = !meta.author || (book.author_names || []).some((a: string) => 
        a.toLowerCase().includes(meta.author!.toLowerCase()) || meta.author!.toLowerCase().includes(a.toLowerCase())
      );
      
      if (titleMatch && authorMatch) {
        return {
          hcId: book.id,
          title: book.title,
          authors: book.author_names || [],
          description: book.description,
          coverUrl: book.image?.url,
          seriesName: book.series_names?.[0],
          seriesNumber: book.series_sequence,
          year: book.release_year,
          hasAudio: book.has_audiobook,
          isbns: book.isbns
        };
      }
    }

    return null;
  } catch (error) {
    console.error("[getBookDetails] error:", error);
    return null;
  }
}

export async function getBookCoverUrl(meta: BookMeta): Promise<string | undefined> {
  try {
    const details = await getBookDetails(meta);
    return details?.coverUrl || undefined;
  } catch (error) {
    console.error("[getBookCoverUrl] error:", error);
    return undefined;
  }
}
