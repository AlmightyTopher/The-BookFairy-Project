/* Filename: src/integrations/hardcover/service.ts
   Purpose: Enhanced Hardcover service layer with comprehensive API features
   
   Based on Hardcover API documentation review, this service provides:
   - Advanced search capabilities
   - User library integration
   - Multiple data retrieval methods
   - Enhanced error handling and rate limiting
*/

import { getBookDetails, getBookCoverUrl, type BookMeta, type BookDetails } from './client';

// Extended types based on API documentation
export interface HardcoverSearchOptions {
  query: string;
  queryType?: 'book' | 'author' | 'series' | 'character' | 'list' | 'publisher' | 'user';
  perPage?: number;
  page?: number;
  sort?: string;
  fields?: string;
  weights?: string;
}

export interface HardcoverSearchResult {
  ids: number[];
  results: any[];
  query: string;
  queryType: string;
  page: number;
  perPage: number;
}

export interface UserLibraryOptions {
  userId: number;
  status?: 1 | 2 | 3 | 4 | 5 | 6; // Want to Read, Currently Reading, Read, Paused, DNF, Ignored
  limit?: number;
  offset?: number;
}

export interface AuthorSearchResult {
  id: number;
  name: string;
  alternateNames?: string[];
  booksCount: number;
  image?: { url?: string };
  seriesNames?: string[];
  slug: string;
}

export interface SeriesInfo {
  id: number;
  name: string;
  booksCount: number;
  primaryBooksCount: number;
  authorName: string;
  books: any[];
  slug: string;
}

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60; // 60 requests per minute per API docs
  private readonly timeWindow = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    const oldest = this.requests[0];
    return oldest + this.timeWindow - Date.now();
  }
}

const rateLimiter = new RateLimiter();

// Helper function to build authorization headers (matching client format)
function buildHeaders(): Record<string, string> {
  const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";
  return {
    "content-type": "application/json",
    "user-agent": "BookFairy/1.0",
    ...(HC_TOKEN ? { authorization: `Bearer ${HC_TOKEN}` } : {})
  };
}

// Enhanced GraphQL client with rate limiting
async function graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    console.warn(`[Hardcover] Rate limit hit, waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  const HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";
  const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";

  if (!HC_TOKEN) {
    throw new Error("HARDCOVER_API_TOKEN not configured");
  }

  try {
    rateLimiter.recordRequest();
    
    const response = await fetch(HC_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('[Hardcover] GraphQL request failed:', error);
    throw error;
  }
}

/**
 * Advanced search using Hardcover's Typesense-powered search API
 */
export async function searchBooks(options: HardcoverSearchOptions): Promise<HardcoverSearchResult> {
  const query = `
    query SearchBooks($query: String!, $queryType: String, $perPage: Int, $page: Int, $sort: String, $fields: String, $weights: String) {
      search(
        query: $query
        query_type: $queryType
        per_page: $perPage
        page: $page
        sort: $sort
        fields: $fields
        weights: $weights
      ) {
        ids
        results
        query
        query_type
        page
        per_page
      }
    }
  `;

  const variables = {
    query: options.query,
    queryType: options.queryType || 'book',
    perPage: options.perPage || 25,
    page: options.page || 1,
    sort: options.sort,
    fields: options.fields,
    weights: options.weights
  };

  const data = await graphqlRequest<{ search: HardcoverSearchResult }>(query, variables);
  return data.search;
}

/**
 * Search for authors with detailed information
 */
export async function searchAuthors(authorName: string, limit = 10): Promise<AuthorSearchResult[]> {
  const searchResult = await searchBooks({
    query: authorName,
    queryType: 'author',
    perPage: limit
  });

  if (!searchResult.results || !Array.isArray(searchResult.results)) {
    return [];
  }

  return searchResult.results.map((result: any) => ({
    id: result.id || 0,
    name: result.name || '',
    alternateNames: result.alternate_names || [],
    booksCount: result.books_count || 0,
    image: result.image,
    seriesNames: result.series_names || [],
    slug: result.slug || ''
  }));
}

/**
 * Get books by a specific author using contributions
 */
export async function getBooksByAuthor(authorName: string, limit = 20): Promise<BookDetails[]> {
  const query = `
    query BooksByAuthor($authorName: String!, $limit: Int!) {
      books(
        where: {
          contributions: {
            author: {
              name: { _eq: $authorName }
            }
          }
        }
        limit: $limit
        order_by: { users_count: desc }
      ) {
        id
        title
        subtitle
        description
        release_date
        pages
        rating
        ratings_count
        contributions {
          author {
            name
          }
        }
        default_cover_edition {
          image {
            url
          }
        }
        book_series {
          position
          series {
            name
          }
        }
        editions(limit: 1, order_by: { release_date: desc }) {
          isbn_13
        }
      }
    }
  `;

  const data = await graphqlRequest<{ books: any[] }>(query, { authorName, limit });
  
  return data.books.map(book => ({
    hcId: book.id,
    title: book.title,
    authors: book.contributions?.map((c: any) => c.author?.name).filter(Boolean) || [],
    description: book.description,
    imageUrl: book.default_cover_edition?.image?.url,
    seriesName: book.book_series?.[0]?.series?.name,
    seriesNumber: book.book_series?.[0]?.position,
    isbn13: book.editions?.[0]?.isbn_13
  }));
}

/**
 * Get user's library books (requires user authentication)
 */
export async function getUserLibraryBooks(options: UserLibraryOptions): Promise<BookDetails[]> {
  const query = `
    query UserLibraryBooks($userId: Int!, $statusId: Int, $limit: Int!, $offset: Int!) {
      user_books(
        where: {
          user_id: { _eq: $userId }
          ${options.status ? 'status_id: { _eq: $statusId }' : ''}
        }
        distinct_on: book_id
        limit: $limit
        offset: $offset
      ) {
        book {
          id
          title
          subtitle
          description
          release_date
          pages
          rating
          ratings_count
          contributions {
            author {
              name
            }
          }
          default_cover_edition {
            image {
              url
            }
          }
          book_series {
            position
            series {
              name
            }
          }
          editions(limit: 1, order_by: { release_date: desc }) {
            isbn_13
          }
        }
        status_id
        created_at
      }
    }
  `;

  const variables = {
    userId: options.userId,
    statusId: options.status,
    limit: options.limit || 50,
    offset: options.offset || 0
  };

  const data = await graphqlRequest<{ user_books: Array<{ book: any }> }>(query, variables);
  
  return data.user_books.map(({ book }) => ({
    hcId: book.id,
    title: book.title,
    authors: book.contributions?.map((c: any) => c.author?.name).filter(Boolean) || [],
    description: book.description,
    imageUrl: book.default_cover_edition?.image?.url,
    seriesName: book.book_series?.[0]?.series?.name,
    seriesNumber: book.book_series?.[0]?.position,
    isbn13: book.editions?.[0]?.isbn_13
  }));
}

/**
 * Get series information with books
 */
export async function getSeriesInfo(seriesName: string): Promise<SeriesInfo[]> {
  const searchResult = await searchBooks({
    query: seriesName,
    queryType: 'series',
    perPage: 10
  });

  if (!searchResult.results || !Array.isArray(searchResult.results)) {
    return [];
  }

  return searchResult.results.map((result: any) => ({
    id: result.id || 0,
    name: result.name || '',
    booksCount: result.books_count || 0,
    primaryBooksCount: result.primary_books_count || 0,
    authorName: result.author_name || '',
    books: result.books || [],
    slug: result.slug || ''
  }));
}

/**
 * Get comprehensive book details by multiple methods
 */
export async function getEnhancedBookDetails(meta: BookMeta): Promise<BookDetails | null> {
  try {
    // Try the existing client method first
    const details = await getBookDetails(meta);
    if (details) return details;

    // Fallback to search-based lookup
    if (meta.title) {
      const searchQuery = [meta.title, meta.author].filter(Boolean).join(' ');
      const searchResult = await searchBooks({
        query: searchQuery,
        queryType: 'book',
        perPage: 5
      });

      if (searchResult.ids.length > 0) {
        const bookId = searchResult.ids[0];
        return await getBookDetailsById(bookId);
      }
    }

    return null;
  } catch (error) {
    console.error('[Hardcover] Enhanced book details failed:', error);
    return null;
  }
}

/**
 * Get book details by Hardcover ID
 */
export async function getBookDetailsById(bookId: number): Promise<BookDetails | null> {
  const query = `
    query BookById($id: Int!) {
      books(where: { id: { _eq: $id } }, limit: 1) {
        id
        title
        subtitle
        description
        release_date
        pages
        rating
        ratings_count
        reviews_count
        users_count
        created_at
        updated_at
        default_cover_edition {
          image {
            url
          }
        }
        book_series {
          position
          series {
            name
          }
        }
        contributions {
          author {
            name
            id
          }
        }
        editions(limit: 1, order_by: { release_date: desc }) {
          isbn_13
          title
          edition_format
          pages
          publisher {
            name
          }
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest<{ books: any[] }>(query, { id: bookId });
    const book = data.books?.[0];
    
    if (!book) return null;

    const seriesNode = book.book_series?.[0];
    
    return {
      hcId: book.id,
      title: book.title,
      authors: book.contributions?.map((c: any) => c.author?.name).filter(Boolean) || [],
      description: book.description,
      imageUrl: book.default_cover_edition?.image?.url,
      seriesName: seriesNode?.series?.name,
      seriesNumber: seriesNode?.position,
      isbn13: book.editions?.[0]?.isbn_13
    };
  } catch (error) {
    console.error('[Hardcover] Get book by ID failed:', error);
    return null;
  }
}

/**
 * Get current user info (requires authentication)
 */
export async function getCurrentUser(): Promise<{ id: number; username: string } | null> {
  const query = `
    query Me {
      me {
        id
        username
      }
    }
  `;

  try {
    const data = await graphqlRequest<{ me: { id: number; username: string } }>(query);
    return data.me;
  } catch (error) {
    console.error('[Hardcover] Get current user failed:', error);
    return null;
  }
}

// Legacy function aliases for backward compatibility
export async function hcPing(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}

export async function searchBooksDescriptionFirst(query: string, limit = 10): Promise<BookDetails[]> {
  const searchResult = await searchBooks({
    query,
    queryType: 'book',
    perPage: limit,
    fields: 'description,title',
    weights: '3,2'
  });

  if (searchResult.ids.length === 0) return [];

  // Fetch full details for the found books
  const bookDetails = await Promise.all(
    searchResult.ids.slice(0, limit).map(id => getBookDetailsById(id))
  );

  return bookDetails.filter(Boolean) as BookDetails[];
}

export async function listBooksByAuthor(authorName: string, limit = 20): Promise<BookDetails[]> {
  return await getBooksByAuthor(authorName, limit);
}

export interface BookMenuData {
  id: number;
  title: string;
  authors: string[];
  description?: string;
  imageUrl?: string;
  seriesName?: string;
  seriesNumber?: number;
  isbn13?: string;
}

export async function bookMenuFromBookId(bookId: number): Promise<BookMenuData | null> {
  const details = await getBookDetailsById(bookId);
  if (!details) return null;

  return {
    id: details.hcId || bookId,
    title: details.title,
    authors: details.authors,
    description: details.description,
    imageUrl: details.imageUrl || undefined,
    seriesName: details.seriesName,
    seriesNumber: details.seriesNumber,
    isbn13: details.isbn13 || undefined
  };
}

export async function editionPreflightByIsbn(isbn: string): Promise<{ exists: boolean; bookId?: number }> {
  try {
    const details = await getBookDetails({ isbn });
    return {
      exists: !!details,
      bookId: details?.hcId || undefined
    };
  } catch {
    return { exists: false };
  }
}

export async function userHasBook(userId: number, bookId: number): Promise<boolean> {
  try {
    const query = `
      query UserHasBook($userId: Int!, $bookId: Int!) {
        user_books(
          where: {
            user_id: { _eq: $userId }
            book_id: { _eq: $bookId }
          }
          limit: 1
        ) {
          id
        }
      }
    `;

    const data = await graphqlRequest<{ user_books: Array<{ id: number }> }>(query, { userId, bookId });
    return data.user_books.length > 0;
  } catch {
    return false;
  }
}

export function warnIfLengthMismatch(expected: number, actual: number, context: string): void {
  if (expected !== actual) {
    console.warn(`[Hardcover] Length mismatch in ${context}: expected ${expected}, got ${actual}`);
  }
}

export function buildSmartTitleQuery(title: string, author?: string): string {
  const normalizedTitle = title.split(':')[0].replace(/\(.*?\)|\[.*?\]/g, '').trim();
  return [normalizedTitle, author].filter(Boolean).join(' ');
}

export async function getUserBookStatus(userId: number, bookId: number): Promise<number | null> {
  try {
    const query = `
      query UserBookStatus($userId: Int!, $bookId: Int!) {
        user_books(
          where: {
            user_id: { _eq: $userId }
            book_id: { _eq: $bookId }
          }
          limit: 1
        ) {
          status_id
        }
      }
    `;

    const data = await graphqlRequest<{ user_books: Array<{ status_id: number }> }>(query, { userId, bookId });
    return data.user_books[0]?.status_id || null;
  } catch {
    return null;
  }
}

// Re-export existing client functions for backward compatibility
export { getBookDetails, getBookCoverUrl, type BookMeta, type BookDetails };
