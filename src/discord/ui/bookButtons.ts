// Filename: src/discord/ui/bookButtons.ts
import { ButtonBuilder, ButtonStyle } from "discord.js";
import type { BookMeta } from "../../integrations/hardcover/client";
import { buttonStore } from "../../state/buttonStore";

export function buildBookViewId(meta: BookMeta) {
  const id = buttonStore.put(meta);
  return `BOOK_VIEW:${id}`; // short, safe
}

export function bookSelectButton(meta: BookMeta, index: number) {
  return new ButtonBuilder()
    .setCustomId(buildBookViewId(meta))
    .setStyle(ButtonStyle.Secondary)
    .setLabel(String(index));
}
