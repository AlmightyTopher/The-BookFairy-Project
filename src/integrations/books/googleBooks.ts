import { BookLite } from "./types";

const API = "https://www.googleapis.com/books/v1/volumes";

function pickYear(d?: string): number | undefined {
  if (!d) return;
  const m = d.match(/\d{4}/);
  return m ? Number(m[0]) : undefined;
}

export async function searchGoogleByAuthor(author: string, apiKey?: string): Promise<BookLite[]> {
  const url = new URL(API);
  // English only, books only
  url.searchParams.set("q", `inauthor:"${author}"`);
  url.searchParams.set("langRestrict", "en");
  url.searchParams.set("printType", "books");
  url.searchParams.set("projection", "lite");
  url.searchParams.set("maxResults", "40");
  url.searchParams.set("orderBy", "relevance");
  if (apiKey) url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`GoogleBooks ${res.status}`);
  const json = await res.json();

  const items = (json.items ?? []) as any[];
  return items.map((it) => {
    const v = it.volumeInfo ?? {};
    const authors: string[] = v.authors ?? [author];
    return {
      title: String(v.title ?? "").trim(),
      author: authors.join(", "),
      year: pickYear(v.publishedDate),
      rating: typeof v.averageRating === "number" ? v.averageRating : undefined,
      ratingsCount: typeof v.ratingsCount === "number" ? v.ratingsCount : undefined,
      source: "google" as const,
    };
  }).filter(b => b.title);
}
