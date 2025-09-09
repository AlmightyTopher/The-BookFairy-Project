/* Filename: src/integrations/hardcover/client.ts
   Purpose: Robust Hardcover GraphQL client for cover+details.

   Requires in .env:
     HARDCOVER_API_TOKEN= (raw token, not including the word "Bearer")
     HARDCOVER_GRAPHQL_URL=https://api.hardcover.app/v1/graphql
*/

// Warning for missing token
if (!process.env.HARDCOVER_API_TOKEN) {
  console.warn("WARN: HARDCOVER_API_TOKEN is not set");
}

const HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";
const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";

type HCImage = { url?: string | null };
type HCSeriesNode = { position?: number | null; series?: { name?: string | null } | null };

export type BookMeta = {
  title?: string;
  author?: string;
  isbn?: string;
  hcId?: number;
};

export type BookDetails = {
  title: string;
  authors: string[];
  seriesName?: string;
  seriesNumber?: number;
  description?: string;
  imageUrl?: string | null;
  isbn13?: string | null;
  hcId?: number | null;
};

function bearer(): Record<string, string> {
  return HC_TOKEN ? { authorization: `Bearer ${HC_TOKEN}` } : {};
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!HC_TOKEN) throw new Error("Hardcover token missing");
  const res = await fetch(HC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "BookFairy/1.0",
      ...bearer(),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Hardcover HTTP ${res.status}: ${txt}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(`Hardcover GraphQL error: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

// Normalize: drop subtitles after ":" and trim noisy bits that hurt search.
function normalizeTitle(raw?: string) {
  if (!raw) return "";
  const primary = raw.split(":")[0]; // "The Good Guy's Guide to Great Sex"
  return primary.replace(/\s+/g, " ").trim();
}

async function searchBookIdByTitleAuthor(title: string, author?: string): Promise<number | null> {
  const q = [normalizeTitle(title), author].filter(Boolean).join(" ");
  // Use results { id } (more stable than "ids" across schema revs)
  const query = /* GraphQL */ `
    query ($q: String!, $page: Int!, $per: Int!) {
      search(query: $q, query_type: "Book", page: $page, per_page: $per) {
        results { id }
      }
    }
  `;
  try {
    const data = await gql<{ search: { results?: Array<{ id: number }> } }>(query, { q, page: 1, per: 5 });
    const id = data?.search?.results?.[0]?.id ?? null;
    return id ?? null;
  } catch {
    return null;
  }
}

async function fetchBookById(id: number) {
  const query = /* GraphQL */ `
    query ($id: Int!) {
      books(where: { id: { _eq: $id } }, limit: 1) {
        id
        title
        description
        author_names
        default_cover_edition { image { url } }
        book_series { position series { name } }
        editions(limit: 1, order_by: {release_date: desc}) { isbn_13 }
      }
    }
  `;
  const data = await gql<{
    books: Array<{
      id: number;
      title: string;
      description?: string | null;
      author_names?: string[] | null;
      default_cover_edition?: { image?: HCImage | null } | null;
      book_series?: HCSeriesNode[] | null;
      editions?: Array<{ isbn_13?: string | null }> | null;
    }>;
  }>(query, { id });

  const b = data.books?.[0];
  if (!b) return null;

  const seriesNode = (b.book_series ?? []).find(Boolean) ?? null;
  return {
    hcId: b.id,
    title: b.title,
    description: b.description ?? undefined,
    authors: (b.author_names ?? []).filter(Boolean) as string[],
    imageUrl: b.default_cover_edition?.image?.url ?? null,
    seriesName: seriesNode?.series?.name ?? undefined,
    seriesNumber: seriesNode?.position ?? undefined,
    isbn13: b.editions?.[0]?.isbn_13 ?? null,
  } as BookDetails;
}

async function fetchEditionByIsbn(isbn: string) {
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  if (!clean) return null;
  const q = /* GraphQL */ `
    query ($isbn13: String, $isbn10: String) {
      editions(
        where: { _or: [{ isbn_13: { _eq: $isbn13 } }, { isbn_10: { _eq: $isbn10 } }] }
        limit: 1
      ) {
        id
        isbn_13
        image { url }
        book {
          id
          title
          description
          author_names
          default_cover_edition { image { url } }
          book_series { position series { name } }
        }
      }
    }
  `;
  const data = await gql<{
    editions: Array<{
      id: number;
      isbn_13?: string | null;
      image?: HCImage | null;
      book: {
        id: number;
        title: string;
        description?: string | null;
        author_names?: string[] | null;
        default_cover_edition?: { image?: HCImage | null } | null;
        book_series?: HCSeriesNode[] | null;
      };
    }>;
  }>(q, {
    isbn13: clean.length === 13 ? clean : null,
    isbn10: clean.length === 10 ? clean : null,
  });

  const ed = data.editions?.[0];
  if (!ed) return null;

  const seriesNode = (ed.book.book_series ?? []).find(Boolean) ?? null;
  return {
    hcId: ed.book.id,
    title: ed.book.title,
    description: ed.book.description ?? undefined,
    authors: (ed.book.author_names ?? []).filter(Boolean) as string[],
    imageUrl: ed.book.default_cover_edition?.image?.url ?? ed.image?.url ?? null,
    seriesName: seriesNode?.series?.name ?? undefined,
    seriesNumber: seriesNode?.position ?? undefined,
    isbn13: ed.isbn_13 ?? null,
  } as BookDetails;
}

/** Public: simplest cover URL probe for list views */
export async function getBookCoverUrl(opts: BookMeta): Promise<string | null> {
  try {
    const byIsbn = opts.isbn ? await fetchEditionByIsbn(opts.isbn) : null;
    if (byIsbn?.imageUrl) return byIsbn.imageUrl;

    const id = opts.hcId ?? (opts.title ? await searchBookIdByTitleAuthor(opts.title, opts.author) : null);
    if (!id) return null;

    const bk = await fetchBookById(id);
    return bk?.imageUrl ?? null;
  } catch {
    return null;
  }
}

/** Public: full details for the detail card */
export async function getBookDetails(opts: BookMeta): Promise<BookDetails | null> {
  if (!HC_TOKEN) return null;
  try {
    if (opts.isbn) {
      const d = await fetchEditionByIsbn(opts.isbn);
      if (d) return d;
    }
    const id = opts.hcId ?? (opts.title ? await searchBookIdByTitleAuthor(opts.title, opts.author) : null);
    if (!id) return null;
    return await fetchBookById(id);
  } catch {
    return null;
  }
}

/** Public: search by author (required by interaction handlers) */
export async function searchByAuthor(author: string) {
  if (!HC_TOKEN) return { works: [] };
  try {
    const query = /* GraphQL */ `
      query ($q: String!, $page: Int!, $per: Int!) {
        search(query: $q, query_type: "Book", page: $page, per_page: $per) {
          results { id title authors { name } series { name } publication_year }
        }
      }
    `;
    const data = await gql<{ search: { results?: Array<{ 
      id: number; 
      title: string; 
      authors?: Array<{ name: string }>;
      series?: Array<{ name: string }>;
      publication_year?: number;
    }> } }>(query, { q: author, page: 1, per: 25 });
    
    const works = (data?.search?.results ?? []).map(book => ({
      title: book.title,
      series: book.series?.[0]?.name,
      year: book.publication_year
    }));
    
    return { works };
  } catch {
    return { works: [] };
  }
}

/** Public: search by title (required by interaction handlers) */
export async function searchByTitle(title: string) {
  if (!HC_TOKEN) return { books: [] };
  try {
    const query = /* GraphQL */ `
      query ($q: String!, $page: Int!, $per: Int!) {
        search(query: $q, query_type: "Book", page: $page, per_page: $per) {
          results { id title authors { name } publication_year }
        }
      }
    `;
    const data = await gql<{ search: { results?: Array<{ 
      id: number; 
      title: string; 
      authors?: Array<{ name: string }>;
      publication_year?: number;
    }> } }>(query, { q: title, page: 1, per: 25 });
    
    const books = (data?.search?.results ?? []).map(book => ({
      title: book.title,
      authors: (book.authors ?? []).map(a => a.name).filter(Boolean),
      year: book.publication_year
    }));
    
    return { books };
  } catch {
    return { books: [] };
  }
}

/** Public: normalize Hardcover results for BookFairy (required by contract tests) */
export function normalizeHardcoverResults(data: { books: Array<any> }): Array<{
  title: string;
  authors: string[];
  year?: number;
  isbn?: string;
}> {
  return (data.books ?? []).map(book => ({
    title: book.title || "",
    authors: Array.isArray(book.author_names) 
      ? book.author_names.filter(Boolean)
      : (book.authors ?? []).map((a: any) => a?.name || a).filter(Boolean),
    year: book.year ?? book.editions?.[0]?.year,
    isbn: book.isbn ?? book.editions?.[0]?.isbn_13,
  }));
}
