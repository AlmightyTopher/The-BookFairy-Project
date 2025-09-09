import { Client, Interaction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { findBooksByAuthor, type SortKey, type BookMeta } from "../../search/author";
import { vput, vget } from "../../state/viewStore";
import { buildSortRow } from "../ui/sortMenu";
import { bookSelectButton } from "../ui/bookButtons";

type AuthorState = {
  kind: "author";
  query: string;
  page: number;
  sort: SortKey;
  total: number; // informational
};

const PAGE_SIZE = 5;

function pageSlice<T>(arr: T[], page: number) {
  const start = page * PAGE_SIZE;
  return arr.slice(start, start + PAGE_SIZE);
}

function buildPageRow(stateId: string, page: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prev = new ButtonBuilder()
    .setCustomId(`BOOK_PAGE:${stateId}:${Math.max(0, page - 1)}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Prev")
    .setDisabled(page <= 0);
  const next = new ButtonBuilder()
    .setCustomId(`BOOK_PAGE:${stateId}:${Math.min(totalPages - 1, page + 1)}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Next")
    .setDisabled(page >= totalPages - 1);
  return new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next);
}

async function compose(authorQuery: string, sort: SortKey, page: number) {
  const results = await findBooksByAuthor(authorQuery, { sort, max: 50, lang: "en" });
  const total = results.length;
  const slice = pageSlice(results, page);
  const lines = slice.map((m, idx) => {
    let line = `${idx + 1}. **${m.title}**`;
    
    // Add series information if available (from Hardcover)
    if (m.series) {
      line += ` *(${m.series})*`;
    }
    
    // Add year if available
    if (m.year) {
      line += ` (${m.year})`;
    }
    
    // Add author
    line += ` by ${m.author}`;
    
    // Add rating if available
    if (typeof m.rating === "number") {
      line += ` — ★ ${m.rating.toFixed(1)}`;
    }
    
    return line;
  });
  return { results, total, slice, lines };
}

// PUBLIC: kick off an Author search reply (use this in your existing flow)
export async function renderAuthorResults(interaction: any, authorQuery: string, sort: SortKey = "rating_desc", page = 0) {
  const { results, total, slice, lines } = await compose(authorQuery, sort, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // store a tiny view state id
  const stateId = vput<AuthorState>({ kind: "author", query: authorQuery, page, sort, total });

  await interaction.reply({
    content:
      `Showing ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + slice.length} of ${total} results for **${authorQuery}** (Page ${page + 1}/${totalPages})\n\n` +
      lines.join("\n") + `\n\nSay "next" to see more results, or pick a number to view details!`,
    components: [
      // numbered buttons 1–N (BOOK_VIEW flow)
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...slice.map((m: BookMeta, idx: number) => bookSelectButton(m, idx + 1))
      ),
      // sort menu keeps state id
      buildSortRow(stateId, sort),
      // page row
      buildPageRow(stateId, page, total)
    ]
  });
}

// Session management for author searches
const activeSessions = new Map<string, Set<string>>();

export function isInAuthorSession(guildId: string | null, userId: string): boolean {
  if (!guildId) return false;
  return activeSessions.get(guildId)?.has(userId) ?? false;
}

export function startAuthorSession(guildId: string, userId: string): void {
  if (!activeSessions.has(guildId)) {
    activeSessions.set(guildId, new Set());
  }
  activeSessions.get(guildId)!.add(userId);
}

export function endAuthorSession(guildId: string, userId: string): void {
  activeSessions.get(guildId)?.delete(userId);
}

// Export both function names for compatibility
export const registerAuthorSearchHandlers = registerAuthorUIHandlers;

// INTERNAL: handlers for sorting and pagination
export function registerAuthorUIHandlers(client: Client) {
  client.on("interactionCreate", async (i: Interaction) => {
    // sort select
    if (i.isStringSelectMenu()) {
      const m = i.customId.match(/^BOOK_SORT:([A-Za-z0-9_-]+)$/);
      if (!m) return;
      const chosen = i.values?.[0] as SortKey | undefined;
      const state = vget<AuthorState>(m[1]);
      if (!chosen || !state || state.kind !== "author") {
        await i.reply({ content: "Sorry, that sort selection expired. Try again.", ephemeral: true });
        return;
      }
      const page = 0; // reset to first page on sort
      const { results, total, slice, lines } = await compose(state.query, chosen, page);
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const newStateId = vput<AuthorState>({ kind: "author", query: state.query, page, sort: chosen, total });

      await i.update({
        content:
          `Showing ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + slice.length} of ${total} results for **${state.query}** (Page ${page + 1}/${totalPages})\n\n` +
          lines.join("\n") + `\n\nSay "next" to see more results, or pick a number to view details!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...slice.map((m: BookMeta, idx: number) => bookSelectButton(m, idx + 1))
          ),
          buildSortRow(newStateId, chosen),
          buildPageRow(newStateId, page, total)
        ]
      });
      return;
    }

    // page buttons
    if (i.isButton()) {
      const m = i.customId.match(/^BOOK_PAGE:([A-Za-z0-9_-]+):(\d+)$/);
      if (!m) return;

      const state = vget<AuthorState>(m[1]);
      const page = Number(m[2]);
      if (!state || state.kind !== "author") {
        await i.reply({ content: "Sorry, those results expired. Run the search again.", ephemeral: true });
        return;
      }

      const { results, total, slice, lines } = await compose(state.query, state.sort, page);
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const newStateId = vput<AuthorState>({ kind: "author", query: state.query, page, sort: state.sort, total });

      await i.update({
        content:
          `Showing ${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + slice.length} of ${total} results for **${state.query}** (Page ${page + 1}/${totalPages})\n\n` +
          lines.join("\n") + `\n\nSay "next" to see more results, or pick a number to view details!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...slice.map((m: BookMeta, idx: number) => bookSelectButton(m, idx + 1))
          ),
          buildSortRow(newStateId, state.sort),
          buildPageRow(newStateId, page, total)
        ]
      });
    }
  });
}
