// src/discord/interactions/audiobooks.ts
import { paginate } from "../../lib/pagination";
import { toSearchOptions, relaySearch } from "../../integrations/prowlarr/client";

// Mango curated service (mocked in tests)
import * as Mango from "../../integrations/mango/service";

// super lightweight id gen; keep it Node/TS friendly
function cid() {
  // dumb but stable; good enough for tests
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

type CuratedItem = { title: string; author?: string; year?: number; link?: string };
type BuildParams = { genre: string; timeframe: string };

export async function buildAudiobooksFlow(params: BuildParams) {
  const curated: CuratedItem[] = await Mango.fetchCurated(params.genre, params.timeframe);
  const items = curated.map(c => ({
    title: c.title,
    author: c.author,
    year: c.year,
    link: c.link,
    label: c.author ? `${c.title} — ${c.author}` : c.title,
  }));
  const page = paginate(items, 1, 5);
  return { page };
}

type ConfirmSelection = { title: string; author?: string };
type Ctx = { guildId: string; userId?: string };

export async function confirmAudiobook(selection: ConfirmSelection, ctx: Ctx) {
  const correlationId = cid();
  const query = [selection.title, selection.author].filter(Boolean).join(" ");
  const opts = toSearchOptions(query);

  const res = await relaySearch(opts, { ...ctx, correlationId });

  return {
    ok: !!res?.ok,
    meta: { correlationId },
    payload: opts, // tests assert query presence here
  };
}