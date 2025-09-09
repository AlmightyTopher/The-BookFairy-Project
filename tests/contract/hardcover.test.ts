// tests/contract/hardcover.test.ts
import { describe, it, expect } from "vitest";
import { HardcoverBookSchema } from "../../src/schemas/hardcover";

// Force TDD: normalization util to add in T020.
import { normalizeHardcoverResults } from "../../src/integrations/hardcover/client";

describe("Hardcover contract", () => {
  it("parses a representative book record", () => {
    const sample = {
      id: 12345,
      title: "Dune",
      description: "A classic science fiction novel",
      author_names: ["Frank Herbert"],
      default_cover_edition: {
        image: { url: "https://example/dune.jpg" }
      },
      book_series: [{
        position: 1,
        series: { name: "Dune Chronicles" }
      }],
      editions: [{
        id: 1,
        isbn_13: "9780441013593"
      }]
    };
    expect(() => HardcoverBookSchema.parse(sample)).not.toThrow();
  });

  it("normalizes result set into BookFairy book meta", () => {
    const res = normalizeHardcoverResults({
      books: [
        { 
          id: 1,
          title: "Dune", 
          author_names: ["Frank Herbert"], 
          editions: [{ id: 1, isbn_13: "9780441013593" }] 
        },
        { 
          id: 2,
          title: "Dune Messiah", 
          author_names: ["Frank Herbert"], 
          editions: [{ id: 2, isbn_13: "9780441172696" }] 
        },
      ],
    });
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Dune", authors: ["Frank Herbert"] }),
      ])
    );
  });
});