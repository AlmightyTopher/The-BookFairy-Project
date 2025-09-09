// tests/integration/audiobooks.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// T023 (handler) + T022 (mango) + T018 (prowlarr client) will satisfy this.
vi.mock("../../src/integrations/mango/service", () => ({
  fetchCurated: vi.fn(async (_genre: string, _timeframe: string) => [
    { title: "Dune", author: "Frank Herbert", year: 1965, link: "https://example/dune" },
    { title: "Neuromancer", author: "William Gibson", year: 1984, link: "https://example/neuromancer" },
    { title: "Snow Crash", author: "Neal Stephenson", year: 1992, link: "https://example/snowcrash" },
    { title: "The Martian", author: "Andy Weir", year: 2011, link: "https://example/martian" },
    { title: "Project Hail Mary", author: "Andy Weir", year: 2021, link: "https://example/phm" },
    { title: "Blindsight", author: "Peter Watts", year: 2006, link: "https://example/blindsight" },
  ]),
}));

vi.mock("../../src/integrations/prowlarr/client", () => ({
  toSearchOptions: vi.fn((q: string) => ({ query: q /* categories: [3030] */ })),
  relaySearch: vi.fn(async (_opts: any, _ctx: any) => ({ ok: true })),
}));

// Force TDD: these modules/exports should be added by tasks.
import { buildAudiobooksFlow, confirmAudiobook } from "../../src/discord/interactions/audiobooks";

describe("Audiobooks flow (curated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("paginates results as 5 items with 'Page 1 of N'", async () => {
    const ui = await buildAudiobooksFlow({ genre: "Sci-Fi", timeframe: "All" });
    expect(ui.page.label).toMatch(/^Page 1 of \d+$/);
    expect(ui.page.items).toHaveLength(5);
  });

  it("confirmation relays via Prowlarr and logs correlation id, no magnets", async () => {
    const selection = { title: "Dune", author: "Frank Herbert" };
    const res = await confirmAudiobook(selection, { guildId: "G", userId: "U" });

    expect(res.ok).toBe(true);
    // shape contract we care about:
    expect(res.meta?.correlationId).toMatch(/[a-f0-9-]{8,}/i);
    expect(res.payload?.query).toContain("Dune");
    // and absolutely no direct magnet or download shortcut:
    expect(JSON.stringify(res)).not.toMatch(/magnet:\?xt=/i);
  });
});