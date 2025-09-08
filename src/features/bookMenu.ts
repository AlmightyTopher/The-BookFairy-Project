import type { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { BookMenuData, buildSmartTitleQuery, getUserBookStatus, warnIfLengthMismatch } from "../integrations/hardcover/service";
import { requestDownload } from "../services/downloads";

type ShowOpts = {
  onConfirmDownload: (ctx: { book: BookMenuData; smartQuery: string }) => Promise<void>;
  torrentSeconds?: number | null;
};

export async function showBookMenu(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  book: BookMenuData,
  opts: ShowOpts
) {
  const smart = buildSmartTitleQuery(book.title, book.series, book.seriesNumber);
  const bookStatus = await getUserBookStatus(book.id);
  const warn = warnIfLengthMismatch(undefined, opts.torrentSeconds ?? null);

  const statusText = bookStatus?.hasBook 
    ? `\n📚 In your library${bookStatus.status ? ` (${bookStatus.status})` : ''}`
    : '';

  const embed = new EmbedBuilder()
    .setTitle(book.title)
    .setDescription([book.synopsis || "No synopsis available."]
      .concat(statusText ? [statusText] : [])
      .concat(warn ? [`\n${warn}`] : [])
      .join(""))
    .setThumbnail(book.coverUrl || null)
    .addFields(
      { name: "Author", value: (book.authors?.join(", ") || "Unknown"), inline: true },
      { name: "Series", value: (book.series || "—"), inline: true },
      { name: "Number", value: String(book.seriesNumber ?? "—"), inline: true },
      { name: "Narrators", value: (book.narrators?.join(", ") || "—"), inline: false },
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("bookmenu_dl").setLabel("Download").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("bookmenu_no").setLabel("No thanks").setStyle(ButtonStyle.Secondary)
  );

  const msg = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

  const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
  collector.on("collect", async (btn) => {
    await btn.deferUpdate();
    if (btn.customId === "bookmenu_dl") {
      // Wire to existing download system
      await requestDownload({
        title: smart, // Use the smart query instead of raw title
        author: book.authors?.join(", "),
        userId: interaction.user.id,
        channelId: interaction.channel?.id,
      });
      await btn.followUp({ content: "✅ Added. Thanks! Returning to main.", ephemeral: true });
    } else {
      await btn.followUp({ content: "👍 No problem. Returning to main.", ephemeral: true });
    }
    collector.stop("done");
  });
}
