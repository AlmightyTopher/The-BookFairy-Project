const API_URL = process.env.HARDCOVER_API_URL || "https://api.hardcover.app/v1/graphql";
const TOKEN = process.env.HARDCOVER_API_TOKEN;
const UA = process.env.HARDCOVER_USER_AGENT || "BookFairy/1.0 (+github.com/AlmightyTopher/The-BookFairy-Project)";

if (!TOKEN) throw new Error("HARDCOVER_API_TOKEN is required");

type GQLError = { message: string };
type GQLRes<T> = { data?: T; errors?: GQLError[] };

export interface BookMeta {
  title?: string;
  author?: string;
  hcId?: number;
  year?: string | number; // Allow both string and number for compatibility
  rating?: number;
  isbn?: string;
}

export interface BookDetails {
  title?: string;
  authors?: string[];
  description?: string;
  summary?: string;
  coverUrl?: string;
  seriesName?: string;
  seriesNumber?: number;
  hcId?: number;
}

export async function gql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}`, "user-agent": UA },
    body: JSON.stringify({ query, variables }),
    // @ts-ignore Node 18 global fetch supports AbortSignal
    signal,
  });
  if (!res.ok) throw new Error(`Hardcover HTTP ${res.status} ${await res.text().catch(() => "")}`);
  const json = (await res.json()) as GQLRes<T>;
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join("; "));
  if (!json.data) throw new Error("Hardcover: empty data");
  return json.data;
}

export const upcase = (s?: string | null) => (s ? s.toUpperCase() : undefined);

// Search for book details using title and author
export async function getBookDetails(meta: BookMeta): Promise<BookDetails | null> {
  if (!meta.title) return null;

  const SEARCH_BY_TITLE = /* GraphQL */ `
    query SearchBookDetails($q: String!, $limit: Int!) {
      search(query: $q, query_type: book, limit: $limit) {
        score
        book {
          id title author_names series_names series_sequence description
          image { url }
        }
      }
    }
  `;

  try {
    const query = meta.author ? `${meta.title} ${meta.author}` : meta.title;
    const data = await gql<{ search: { score: number; book: any }[] }>(SEARCH_BY_TITLE, { q: query, limit: 1 });
    
    if (!data.search?.length) return null;
    
    const book = data.search[0].book;
    return {
      title: book.title,
      authors: book.author_names || [],
      description: book.description,
      coverUrl: book.image?.url,
      seriesName: book.series_names?.[0],
      seriesNumber: book.series_sequence,
      hcId: book.id,
    };
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
}

// Get cover URL for a book - returns undefined instead of null for compatibility
export async function getBookCoverUrl(meta: BookMeta): Promise<string | undefined> {
  const details = await getBookDetails(meta);
  return details?.coverUrl || undefined;
}
