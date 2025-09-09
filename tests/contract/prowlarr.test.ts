// tests/contract/prowlarr.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Use your new schemas. They exist, great. The function under test won't — yet.
import { ProwlarrReleaseSchema } from "../../src/schemas/prowlarr";
import type { infer as Infer } from "zod";
// Force TDD: require a builder that must be added by T018.
import { toSearchOptions } from "../../src/integrations/prowlarr/client";

describe("Prowlarr contract", () => {
  it("validates release shape from a search", () => {
    const sample = {
      guid: "abc",
      title: "Dune 1965 Audiobook",
      size: 12345,
      downloadUrl: "https://indexer.example/torrent/123",
      seeders: 100,
      leechers: 2,
      indexerId: 42,
      publishDate: new Date().toISOString(),
    };
    expect(() => ProwlarrReleaseSchema.parse(sample)).not.toThrow();
  });

  it("builds search options from a query string", () => {
    const opts = toSearchOptions("Dune Frank Herbert");
    // minimal shape we rely on
    expect(opts).toMatchObject({ query: "Dune Frank Herbert" });
  });
});