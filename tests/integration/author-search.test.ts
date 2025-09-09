// tests/integration/author-search.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/integrations/hardcover/client", () => ({
  searchByAuthor: vi.fn(async (name: string) => ({
    author: name,
    works: [
      { series: "The Expanse", title: "Leviathan Wakes", year: 2011 },
      { series: "The Expanse", title: "Caliban's War", year: 2012 },
      { series: "The Expanse", title: "Abaddon's Gate", year: 2013 },
      { series: "The Expanse", title: "Cibola Burn", year: 2014 },
      { series: "The Expanse", title: "Nemesis Games", year: 2015 },
      { series: "The Expanse", title: "Babylon's Ashes", year: 2016 },
    ],
  })),
}));

vi.mock("../../src/integrations/prowlarr/client", () => ({
  toSearchOptions: vi.fn((q: string) => ({ query: q })),
  relaySearch: vi.fn(async (_opts: any, _ctx: any) => ({ ok: true })),
}));

// Force TDD: handler to be implemented by T025.
import { buildAuthorSearch, confirmAuthorWork } from "../../src/discord/interactions/author-search";

describe("Author search", () => {
  it("groups series sensibly and paginates 5-per-page", async () => {
    const ui = await buildAuthorSearch({ author: "James S. A. Corey" });
    expect(ui.grouped["The Expanse"]).toBeDefined();
    expect(ui.page.items).toHaveLength(5);
  });

  it("confirm routes via Prowlarr/Readarr depending on config", async () => {
    const res = await confirmAuthorWork({ series: "The Expanse", title: "Leviathan Wakes" }, { guildId: "G" });
    expect(res.ok).toBe(true);
  });
});