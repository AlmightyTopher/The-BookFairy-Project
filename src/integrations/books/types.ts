export type SortKey =
  | "rating_desc" | "rating_asc"
  | "year_desc"   | "year_asc"
  | "title_asc"   | "title_desc";

export interface BookLite {
  title: string;
  author: string;
  year?: number;
  rating?: number;        // 0-5 if present
  ratingsCount?: number;
  source?: "google" | "openlibrary";
}

export interface CatalogResult {
  items: BookLite[];
  fromCache: boolean;
}
