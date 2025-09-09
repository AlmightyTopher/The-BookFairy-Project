// tests/unit/pagination.test.ts
import { describe, it, expect } from "vitest";

// Intentionally import a not-yet-implemented util to force TDD.
// T013 will provide this.
import { paginate } from "../../src/lib/pagination";

describe("pagination (5-per-page is law)", () => {
  const mk = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  it("returns exactly 5 items per page (except last page)", () => {
    const items = mk(12);
    const p1 = paginate(items, 1, 5);
    const p2 = paginate(items, 2, 5);
    const p3 = paginate(items, 3, 5);

    expect(p1.items).toHaveLength(5);
    expect(p2.items).toHaveLength(5);
    expect(p3.items).toHaveLength(2);

    expect(p1.totalPages).toBe(3);
    expect(p1.page).toBe(1);
    expect(p3.page).toBe(3);
  });

  it("clamps out-of-range pages and exposes hasPrev/hasNext", () => {
    const items = mk(7);
    const p0 = paginate(items, 0, 5);
    const p99 = paginate(items, 99, 5);

    expect(p0.page).toBe(1);
    expect(p0.hasPrev).toBe(false);
    expect(p0.hasNext).toBe(true);

    expect(p99.page).toBe(2);
    expect(p99.hasPrev).toBe(true);
    expect(p99.hasNext).toBe(false);
  });

  it("includes a stable `label` like 'Page X of Y'", () => {
    const items = mk(11);
    const p2 = paginate(items, 2, 5);
    expect(p2.label).toBe("Page 2 of 3");
  });
});