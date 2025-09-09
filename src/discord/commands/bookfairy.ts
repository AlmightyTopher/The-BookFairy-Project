// src/discord/commands/bookfairy.ts
// Pure object builder for tests; no discord.js dependency.
export function buildMainMenu() {
  return {
    command: "/bookfairy",
    buttons: [
      { id: "bf:audiobooks", label: "Audiobooks" },
      { id: "bf:title",      label: "By Title" },
      { id: "bf:author",     label: "By Author" },
      { id: "bf:status",     label: "Status" },
      { id: "bf:help",       label: "Help" },
    ],
  };
}