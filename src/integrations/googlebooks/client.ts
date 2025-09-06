// Lightweight Google Books client with optional API key.
// Exports: searchGoogleBooks({ title, author })
import type { BookMeta } from "../../integrations/hardcover/client";

type GBVolume = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    infoLink?: string;
  };
};

export async function searchGoogleBooks(
  meta: Pick<BookMeta, "title" | "author">
): Promise<{ description?: string; coverUrl?: string; infoLink?: string } | null> {
  const key = process.env.GOOGLE_BOOKS_API_KEY?.trim();
  // Build a tight query: intitle + inauthor. Also try a stripped-title variant.
  const baseTitle = meta.title?.split(":")[0].replace(/\(.*?\)|\[.*?\]/g, "").trim() ?? "";
  const q = `intitle:"${baseTitle}" inauthor:"${(meta.author || "").split(",")[0].trim()}"`;

  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", q);
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("langRestrict", "en");
  if (key) url.searchParams.set("key", key);

  try {
    const res = await fetch(url.toString(), { headers: { "User-Agent": "book-fairy/1.0" } });
    if (!res.ok) throw new Error(`Google Books ${res.status}`);
    const data = (await res.json()) as { items?: GBVolume[] };

    const first = data.items?.find(Boolean);
    if (!first?.volumeInfo) return null;

    const v = first.volumeInfo;
    const cover =
      v.imageLinks?.thumbnail ||
      v.imageLinks?.smallThumbnail ||
      undefined;

    return {
      description: v.description,
      coverUrl: cover ? cover.replace("http://", "https://") : undefined,
      infoLink: v.infoLink,
    };
  } catch (e) {
    console.log("[googlebooks] error:", (e as Error).message);
    return null;
  }
}
