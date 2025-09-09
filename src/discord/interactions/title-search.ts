// src/discord/interactions/title-search.ts
import { paginate } from "../../lib/pagination";
import * as HC from "../../integrations/hardcover/client"; // mocked in tests
import { toSearchOptions, relaySearch } from "../../integrations/prowlarr/client";

type BuildParams = { query: string };

export async function buildTitleSearch({ query }: BuildParams) {
  const res = await (HC as any).searchByTitle(query);
  // tests' mock returns { books: [{ title, authors: [..], year, isbn }...] }
  const items = (res?.books ?? []).map((b: any) => ({
    title: b.title,
    authors: Array.isArray(b.authors) ? b.authors : (b.authors ?? []).map((a: any) => a?.name).filter(Boolean),
    year: b.year ?? b?.editions?.[0]?.year,
    isbn: b.isbn ?? b?.editions?.[0]?.isbn13,
    label: `${b.title}${b.year ? ` (${b.year})` : ""}`,
  }));

  const page = paginate(items, 1, 5);
  return { page };
}

type ConfirmSelection = { title: string; authors?: string[] };
type Ctx = { guildId: string; userId?: string };

export async function confirmTitle(sel: ConfirmSelection, ctx: Ctx) {
  const correlationId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const query = [sel.title, ...(sel.authors ?? [])].join(" ").trim();
  const opts = toSearchOptions(query);
  const res = await relaySearch(opts, { ...ctx, correlationId });

  return { ok: !!res?.ok, meta: { correlationId }, payload: opts };
}