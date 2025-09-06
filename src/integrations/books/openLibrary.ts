import { BookLite } from "./types";

export async function searchOpenLibraryByAuthor(author: string): Promise<BookLite[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("author", author);
  url.searchParams.set("language", "eng");
  url.searchParams.set("limit", "40");

  const res = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`OpenLibrary ${res.status}`);
  const json = await res.json();

  const docs: any[] = json.docs ?? [];
  return docs.map(d => ({
    title: String(d.title ?? "").trim(),
    author: (d.author_name?.join(", ") ?? author),
    year: typeof d.first_publish_year === "number" ? d.first_publish_year : undefined,
    rating: undefined,
    ratingsCount: undefined,
    source: "openlibrary" as const,
  })).filter(b => b.title);
}
