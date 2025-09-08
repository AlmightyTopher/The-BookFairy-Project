export const ME = /* GraphQL */ `query { me { id username name } }`;

export const SEARCH_BOOKS = /* GraphQL */ `
  query SearchBooks($q: String!, $per_page: Int!, $page: Int!) {
    search(query: $q, query_type: "book", per_page: $per_page, page: $page) {
      results
      query
      per_page
      page
    }
  }
`;

export const FALLBACK_BOOKS_BY_TEXT = /* GraphQL */ `
  query BooksByText($patterns: [String!]!, $limit: Int!, $offset: Int!) {
    books(
      where: {
        _or: [
          { title: { _ilike: ANY($patterns) } },
          { alternative_titles: { _ilike: ANY($patterns) } },
          { description: { _ilike: ANY($patterns) } },
          { author_names: { _ilike: ANY($patterns) } },
          { series_names: { _ilike: ANY($patterns) } }
        ]
      }
      order_by: [{ ratings_count: desc }, { users_count: desc }]
      limit: $limit
      offset: $offset
    ) {
      id title author_names series_names series_sequence image { url } description isbns has_audiobook
    }
  }
`;

export const BOOK_FOR_MENU = /* GraphQL */ `
  query BookForMenu($id: bigint!) {
    books_by_pk(id: $id) {
      id title author_names series_names series_sequence description release_year
      image { url }
      isbns has_audiobook has_ebook
      contributions(where: { role: { _eq: "Narrator" } }) { person_name role }
    }
  }
`;

export const BOOKS_BY_AUTHOR = /* GraphQL */ `
  query BooksByAuthor($author: String!, $limit: Int!, $offset: Int!) {
    books(
      where: { author_names: { _ilike: $author } }
      order_by: [{ release_year: desc }, { ratings_count: desc }]
      limit: $limit
      offset: $offset
    ) {
      id title author_names series_names series_sequence image { url } description
    }
  }
`;

export const EDITION_BY_ISBN = /* GraphQL */ `
  query EditionByIsbn($isbn10: String, $isbn13: String) {
    editions(where: { _or: [{isbn_13:{_eq:$isbn13}}, {isbn_10:{_eq:$isbn10}}] }, limit: 5) {
      id title isbn_10 isbn_13 physical_format audio_seconds
      country { name code2 code3 }
      publisher { name }
      image { url }
      book { id title author_names series_names series_sequence description image { url } }
    }
  }
`;

export const USER_HAS_BOOK = /* GraphQL */ `
  query UserHasBook($userId: bigint!, $bookId: bigint!) {
    user_books(where: { user_id: { _eq: $userId }, book_id: { _eq: $bookId } }, limit: 1) {
      id status_id
    }
  }
`;

export const SEARCH_AUTHORS = /* GraphQL */ `
  query SearchAuthors($q: String!, $per_page: Int!, $page: Int!) {
    search(query: $q, query_type: "author", per_page: $per_page, page: $page) {
      results
      query
      per_page
      page
    }
  }
`;

export const USER_BOOKS_WITH_STATUS = /* GraphQL */ `
  query UserBooksWithStatus($userId: bigint!, $statusId: Int!, $limit: Int!) {
    user_books(
      where: { user_id: { _eq: $userId }, status_id: { _eq: $statusId } }
      limit: $limit
    ) {
      book {
        id
        title
        author_names
        image { url }
        series_names
        series_sequence
      }
    }
  }
`;

export const USER_LIBRARY_SUMMARY = /* GraphQL */ `
  query UserLibrarySummary($userId: bigint!) {
    user_books(
      where: { user_id: { _eq: $userId } }
      distinct_on: book_id
      limit: 1000
    ) {
      book {
        id
        title
        author_names
      }
      status_id
    }
  }
`;
