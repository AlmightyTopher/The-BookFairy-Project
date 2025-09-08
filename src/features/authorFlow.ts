import type { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { listBooksByAuthor, bookMenuFromBookId } from "../integrations/hardcover/service";
import { showBookMenu } from "./bookMenu";
import { requestDownload } from "../services/downloads";

export async function runAuthorFlow(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  author: string
) {
  let offset = 0;
  while (true) {
    const page = await listBooksByAuthor(author, 5, offset);
    if (!page.items.length) {
      await interaction.reply({ content: "No results.", ephemeral: true });
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...page.items.map((b, i) => new ButtonBuilder()
        .setCustomId(`author_pick_${b.id}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel(`${i + 1}. ${b.title}`.slice(0, 80)))
    );
    const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("nav_back").setStyle(ButtonStyle.Secondary).setLabel("Back"),
      new ButtonBuilder().setCustomId("nav_next").setStyle(ButtonStyle.Secondary).setLabel("Next"),
      new ButtonBuilder().setCustomId("nav_new").setStyle(ButtonStyle.Secondary).setLabel("New search"),
    );

    const msg = await interaction.reply({ content: `Books by ${author}:`, components: [row, nav], ephemeral: true, fetchReply: true });
    const pick = await new Promise<{ id?: string; nav?: "next" | "back" | "new" }>((resolve) => {
      const c = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
      c.on("collect", (btn) => {
        if (btn.customId === "nav_next") return void (offset = (page.nextOffset ?? offset), resolve({ nav: "next" }), c.stop());
        if (btn.customId === "nav_back") return void (offset = Math.max(0, offset - 5), resolve({ nav: "back" }), c.stop());
        if (btn.customId === "nav_new") return void resolve({ nav: "new" });
        if (btn.customId.startsWith("author_pick_")) return void resolve({ id: btn.customId.replace("author_pick_", "") });
      });
    });

    if (pick?.nav === "new") return;
    if (pick?.id) {
      const data = await bookMenuFromBookId(Number(pick.id));
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
      return;
    }
  }
}
