// src/discord/interactions/author-search.ts
import { paginate } from "../../lib/pagination";
import * as HC from "../../integrations/hardcover/client"; // mocked in tests
import { toSearchOptions, relaySearch } from "../../integrations/prowlarr/client";

type BuildParams = { author: string };

export async function buildAuthorSearch({ author }: BuildParams) {
  const res = await (HC as any).searchByAuthor(author);
  const works: Array<{ series?: string; title: string; year?: number }> = res?.works ?? [];

  // Group by series (null/undefined go under "Standalone")
  const grouped: Record<string, Array<{ title: string; year?: number }>> = {};
  for (const w of works) {
    const key = w.series || "Standalone";
    grouped[key] ||= [];
    grouped[key].push({ title: w.title, year: w.year });
  }

  const flat = works.map(w => ({
    series: w.series || "Standalone",
    title: w.title,
    year: w.year,
    label: w.series ? `${w.title} — ${w.series} (${w.year ?? "n/a"})` : `${w.title} (${w.year ?? "n/a"})`,
  }));

  const page = paginate(flat, 1, 5);
  return { grouped, page };
}

type ConfirmSelection = { series?: string; title: string };
type Ctx = { guildId: string; userId?: string };

export async function confirmAuthorWork(sel: ConfirmSelection, ctx: Ctx) {
  const correlationId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const query = [sel.title, sel.series].filter(Boolean).join(" ");
  const opts = toSearchOptions(query);
  const res = await relaySearch(opts, { ...ctx, correlationId });
  return { ok: !!res?.ok, meta: { correlationId }, payload: opts };
}