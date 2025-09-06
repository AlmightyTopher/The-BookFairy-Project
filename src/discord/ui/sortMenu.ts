import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import type { SortKey } from "../../search/author";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating_desc", label: "Rating (high → low)" },
  { key: "rating_asc",  label: "Rating (low → high)" },
  { key: "year_desc",   label: "Year (new → old)" },
  { key: "year_asc",    label: "Year (old → new)" },
  { key: "title_asc",   label: "Title (A → Z)" },
  { key: "title_desc",  label: "Title (Z → A)" }
];

export function buildSortRow(stateId: string, current: SortKey) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`BOOK_SORT:${stateId}`)
    .setPlaceholder("Sort results…")
    .addOptions(
      OPTIONS.map(o =>
        new StringSelectMenuOptionBuilder()
          .setLabel(o.label)
          .setValue(o.key)
          .setDefault(o.key === current)
      )
    );
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
