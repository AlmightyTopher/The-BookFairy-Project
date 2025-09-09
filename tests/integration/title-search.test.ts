// tests/integration/title-search.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/integrations/hardcover/client", () => ({
  searchByTitle: vi.fn(async (q: string) => ({
    books: [
      { title: "Dune", authors: ["Frank Herbert"], year: 1965, isbn: "9780441013593" },
      { title: "Dune Messiah", authors: ["Frank Herbert"], year: 1969, isbn: "9780441172696" },
      { title: "Children of Dune", authors: ["Frank Herbert"], year: 1976, isbn: "9780441104024" },
      { title: "God Emperor of Dune", authors: ["Frank Herbert"], year: 1981, isbn: "9780441294671" },
      { title: "Heretics of Dune", authors: ["Frank Herbert"], year: 1984, isbn: "9780441328000" },
      { title: "Chapterhouse: Dune", authors: ["Frank Herbert"], year: 1985, isbn: "9780441102679" },
    ],
  })),
}));

vi.mock("../../src/integrations/prowlarr/client", () => ({
  toSearchOptions: vi.fn((q: string) => ({ query: q })),
  relaySearch: vi.fn(async (_opts: any, _ctx: any) => ({ ok: true })),
}));

// Force TDD: handler to be implemented by T024.
import { buildTitleSearch, confirmTitle } from "../../src/discord/interactions/title-search";

describe("Title search", () => {
  it("shows exactly 5 candidates on first page", async () => {
    const ui = await buildTitleSearch({ query: "Dune" });
    expect(ui.page.items).toHaveLength(5);
    expect(ui.page.label).toBe("Page 1 of 2");
  });

  it("confirm routes through Prowlarr relay only", async () => {
    const res = await confirmTitle({ title: "Dune", authors: ["Frank Herbert"] }, { guildId: "G", userId: "U" });
    expect(res.ok).toBe(true);
    expect(res.meta?.correlationId).toBeDefined();
  });
});