// tests/unit/commands.test.ts
import { describe, it, expect } from "vitest";

// Force TDD: T016 should export this builder.
import { buildMainMenu } from "../../src/discord/commands/bookfairy";

describe("/bookfairy main menu", () => {
  it("has exactly five buttons in this order", () => {
    const ui = buildMainMenu();
    // Treat this as a pure object test. Don't require discord.js to exist here.
    const labels = ui.buttons.map((b: any) => b.label);
    expect(labels).toEqual(["Audiobooks", "By Title", "By Author", "Status", "Help"]);
  });

  it("exposes a single slash entrypoint name", () => {
    const ui = buildMainMenu();
    expect(ui.command).toBe("/bookfairy");
  });
});