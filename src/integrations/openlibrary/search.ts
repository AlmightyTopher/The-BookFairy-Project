// Open Library fallback — filtered to English when language info exists
export type OLAuthorResult = {
  title: string;
  author: string;
  year?: string;
  isbn10?: string;
  isbn13?: string;
  hasDescription: boolean;
  hasThumb: boolean;
  rating?: number;
  ratingVotes?: number;
  source: "openlibrary";
};

type OLDoc = {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  language?: string[];
};

export async function openLibrarySearchByAuthor(author: string, opts?: { max?: number; lang?: string }) {
  const max = Math.min(opts?.max ?? 50, 50);
  const res = await fetch(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=${max}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`[openlibrary] HTTP ${res.status}`);
  const json = await res.json() as { docs?: OLDoc[] };

  const docs = (json.docs ?? []).filter(d =>
    (opts?.lang ?? "en") === "en" ? (d.language?.some(l => l.toLowerCase().startsWith("eng")) ?? true) : true
  );

  const out: OLAuthorResult[] = [];
  for (const d of docs) {
    if (!d.title) continue;
    const isbns = d.isbn ?? [];
    out.push({
      title: d.title.trim(),
      author: (d.author_name && d.author_name.length) ? d.author_name.join(", ") : author,
      year: d.first_publish_year ? String(d.first_publish_year) : undefined,
      isbn10: isbns.find(x => x.length === 10),
      isbn13: isbns.find(x => x.length === 13),
      hasDescription: false,
      hasThumb: Boolean(d.cover_i),
      rating: undefined,
      ratingVotes: undefined,
      source: "openlibrary"
    });
  }

  const seen = new Map<string, OLAuthorResult>();
  for (const m of out) {
    const k = m.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (!seen.has(k)) seen.set(k, m);
  }
  return [...seen.values()];
}
