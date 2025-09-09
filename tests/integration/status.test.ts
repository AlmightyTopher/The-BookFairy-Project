// tests/integration/status.test.ts
import { describe, it, expect, vi } from "vitest";

// T030 should provide relay-store.
vi.mock("../../src/lib/relay-store", () => ({
  getRecentRelays: vi.fn(() => [
    { id: "c1", at: Date.now() - 10000, state: "relayed" },
    { id: "c2", at: Date.now() - 20000, state: "relayed" },
    { id: "c3", at: Date.now() - 30000, state: "relayed" },
    { id: "c4", at: Date.now() - 40000, state: "relayed" },
    { id: "c5", at: Date.now() - 50000, state: "relayed" },
    { id: "c6", at: Date.now() - 60000, state: "queued" },
  ]),
}));

// Force TDD: handler is T026.
import { buildStatusView } from "../../src/discord/interactions/status";

describe("Status view", () => {
  it("shows at most 5 recent relays with age and state", async () => {
    const ui = await buildStatusView();
    expect(ui.items).toHaveLength(5);
    expect(ui.items[0]).toMatchObject({ state: expect.any(String), age: expect.any(String) });
  });
});