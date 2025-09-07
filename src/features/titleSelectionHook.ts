// Call this from your existing "pick a number" handler in the title search flow.
// It preserves your current UX; if Hardcover can't resolve, your old path continues.
import type { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { searchBooksDescriptionFirst, bookMenuFromBookId } from "../integrations/hardcover/service";
import { showBookMenu } from "./bookMenu";

export async function handleTitleSelectionToBookMenu(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  picked: { title: string; author?: string | null },
) {
  const query = picked.author ? `${picked.title} ${picked.author}` : picked.title;
  const page = await searchBooksDescriptionFirst(query, 1, 0);
  const bookId = page.items[0]?.id;
  if (!bookId) return; // let your current Google Books detail view run if null

  const data = await bookMenuFromBookId(Number(bookId));
  await showBookMenu(interaction, data, {
    onConfirmDownload: async ({ smartQuery }) => {
      // call your existing prowlarr relay here with smartQuery
    },
  });
}
