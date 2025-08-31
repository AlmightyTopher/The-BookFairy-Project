export interface ReadarrBook {
  title: string;
  author?: string;
  authorName?: string;
  language?: string;
  genres?: string[];
  overview?: string;
  pageCount?: number;
}

export interface ReadarrSearchResult extends ReadarrBook {
  id: number;
  titleSlug: string;
  images?: Array<{ url: string; coverType: string }>;
  ratings?: { votes: number; value: number };
  releaseDate?: string;
  added?: string;
  addOptions?: { monitor: boolean; searchForNewBook: boolean };
}
