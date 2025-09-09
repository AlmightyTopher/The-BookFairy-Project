// Filename: src/discord/interactions/bookDetails.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Interaction,
} from "discord.js";
import { book_details, getBookCoverUrl, type BookMeta } from "../../integrations/hardcover/client";
import { searchGoogleBooks } from "../../integrations/googlebooks/client";
import { requestDownload } from "../../services/downloads";
import { showMainMenu } from "../ui/mainMenu";
import { buttonStore } from "../../state/buttonStore";

// Helpers
const truncate = (s: string, n: number) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);
const stripSubtitle = (t: string) => t.split(":")[0].replace(/\(.*?\)|\[.*?\]/g, "").trim();

function parseId(customId: string): string | null {
  const i = customId.indexOf(":");
  return i === -1 ? null : customId.slice(i + 1);
}

function makeYesId(meta: BookMeta) {
  const id = buttonStore.put(meta);
  return `BOOK_DL_YES:${id}`;
}
function makeNoId(meta: BookMeta) {
  const id = buttonStore.put(meta);
  return `BOOK_DL_NO:${id}`;
}

async function handleView(interaction: ButtonInteraction, id: string) {
  await interaction.deferUpdate();

  console.log("[bookDetails] VIEW click", interaction.customId);
  console.log("[bookDetails] get", id);
  const meta = buttonStore.get(id);
  console.log("[bookDetails] hit", !!meta, meta?.title);

  if (!meta) {
    await interaction.followUp({ content: "Sorry, that selection expired. Try again.", ephemeral: true });
    return;
  }

  console.log("[bookDetails] fetching details for:", meta.title, "by", meta.author);

  let details = null;

  // If meta has an hcId (book ID), use the new contract
  if (meta.hcId) {
    console.log("[bookDetails] using new contract with book ID:", meta.hcId);
    details = await book_details(meta.hcId).catch((e) => {
      console.log("[bookDetails] New contract error:", e?.message ?? e);
      return null;
    });
  }

  // Fall back to legacy approach if no ID or new contract failed
  if (!details) {
    console.log("[bookDetails] falling back to legacy approach");
    const { getBookDetails } = await import("../../integrations/hardcover/client");
    
    // Pass 1: exact
    details = await getBookDetails(meta).catch((e) => {
      console.log("[bookDetails] Hardcover pass1 error:", e?.message ?? e);
      return null;
    });

    // Pass 2: stripped subtitle (e.g., drop text after colon/paren/brackets)
    if (!details) {
      const bare = { ...meta, title: stripSubtitle(meta.title ?? "") };
      console.log("[bookDetails] pass2 with title:", bare.title);
      details = await getBookDetails(bare).catch((e) => {
        console.log("[bookDetails] Hardcover pass2 error:", e?.message ?? e);
        return null;
      });
    }
  }

  const title = details?.title ?? meta.title ?? "Selected Book";
  const authors =
    (details?.authors?.length ? details.authors.join(", ") : meta.author) ?? "Unknown author";

  const fields: { name: string; value: string; inline?: boolean }[] = [];
  if (details?.seriesName) {
    const snum = details.seriesNumber != null ? ` #${details.seriesNumber}` : "";
    fields.push({ name: "Series", value: `${details.seriesName}${snum}`, inline: true });
  }
  fields.push({ name: "Author", value: authors, inline: true });

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setFields(fields)
    .setFooter({ text: "Want me to grab it for you?" });

  // Pick best cover: details.coverUrl → direct lookup → none
  let coverUrl: string | undefined = details?.coverUrl ?? undefined;
  if (!coverUrl) {
    coverUrl = await getBookCoverUrl(meta).catch(() => undefined);
    if (!coverUrl && details?.title) {
      // try again with stripped title if needed
      coverUrl = await getBookCoverUrl({ ...meta, title: stripSubtitle(details.title) }).catch(() => undefined);
    }
  }

  // --- Google Books fallback for description and cover ---
  let description =
    details?.description ||
    (details as any)?.summary ||
    undefined;

  if (!description || !coverUrl) {
    const gb = await searchGoogleBooks(meta);
    if (gb) {
      if (!description && gb.description) {
        description = gb.description;
        console.log("[bookDetails] description from Google Books");
      }
      if (!coverUrl && gb.coverUrl) {
        coverUrl = gb.coverUrl;
        console.log("[bookDetails] cover from Google Books:", coverUrl);
      }
    }
  }

  // Final fallbacks
  if (!description) description = "No synopsis available.";

  // Apply to embed (truncate just in case)
  embed.setDescription(truncate(description, 1000));
  if (coverUrl) embed.setImage(coverUrl);

  const enriched: BookMeta = { ...meta, hcId: details?.hcId ?? meta.hcId };
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(makeYesId(enriched)).setStyle(ButtonStyle.Success).setLabel("Download"),
    new ButtonBuilder().setCustomId(makeNoId(enriched)).setStyle(ButtonStyle.Secondary).setLabel("No thanks")
  );

  await interaction.followUp({ embeds: [embed], components: [row] });
}

async function handleYes(interaction: ButtonInteraction, id: string) {
  await interaction.deferUpdate();
  const meta = buttonStore.get(id);
  if (!meta) {
    await interaction.followUp({ content: "That selection expired. Try again.", ephemeral: true });
    return;
  }
  await requestDownload({
    title: meta.title ?? "Unknown",
    author: meta.author,
    userId: interaction.user.id,
    channelId: interaction.channel?.id,
  });

  const mainMenu = showMainMenu({ userId: interaction.user.id });
  await interaction.followUp({ 
    content: "✅ Added. Thanks!\n\n" + mainMenu.content,
    components: mainMenu.components
  });
}

async function handleNo(interaction: ButtonInteraction, id: string) {
  await interaction.deferUpdate();
  const _meta = buttonStore.get(id); // optional touch
  const mainMenu = showMainMenu({ userId: interaction.user.id });
  await interaction.followUp({ 
    content: "👍 No problem. Back to the start.\n\n" + mainMenu.content,
    components: mainMenu.components
  });
}

export function registerBookDetailHandlers(client: Client) {
  client.on("interactionCreate", async (i: Interaction) => {
    if (!i.isButton()) return;
    const cid = i.customId;

    if (cid.startsWith("BOOK_VIEW:")) {
      const id = parseId(cid);
      if (!id) return;
      await handleView(i, id);
      return;
    }
    if (cid.startsWith("BOOK_DL_YES:")) {
      const id = parseId(cid);
      if (!id) return;
      await handleYes(i, id);
      return;
    }
    if (cid.startsWith("BOOK_DL_NO:")) {
      const id = parseId(cid);
      if (!id) return;
      await handleNo(i, id);
      return;
    }
  });
}
