// Call this from your existing "pick a number" handler in the title search flow.
// If Hardcover can resolve the book, we show the Book Menu and stop. Otherwise your current flow continues.
import type { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { searchBooksDescriptionFirst, bookMenuFromBookId } from "../integrations/hardcover/service";
import { showBookMenu } from "./bookMenu";
import { requestDownload } from "../services/downloads";

export async function handleTitleSelectionToBookMenu(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  picked: { title: string; author?: string | null },
) {
  try {
    const query = picked.author ? `${picked.title} ${picked.author}` : picked.title;
    const page = await searchBooksDescriptionFirst(query, 1, 0);
    const bookId = page.items[0]?.id;
    if (!bookId) return; // let your existing Google Books detail view run

    const data = await bookMenuFromBookId(Number(bookId));
    await showBookMenu(interaction, data, {
      onConfirmDownload: async ({ smartQuery }) => {
        await requestDownload({
          title: smartQuery,
          author: data.authors?.join(", "),
          userId: interaction.user.id,
          channelId: interaction.channel?.id,
        });
      },
    });
  } catch (error: any) {
    // If Hardcover fails (e.g., 403 errors), silently fall back to existing flow
    console.log("[titleSelectionHook] Hardcover failed, falling back to existing flow:", error?.message || error);
    return; // let your existing Google Books detail view run
  }
}
