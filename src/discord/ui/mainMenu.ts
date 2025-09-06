import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export interface MenuContext {
  userId?: string;
  [key: string]: any;
}

export function showMainMenu(ctx: MenuContext = {}): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  // Primary search options row
  const searchRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('search_by_title')
        .setLabel('📚 Search by Title')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('search_by_author')
        .setLabel('✍️ Search by Author')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('browse_genres')
        .setLabel('🎭 Browse Genres')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('search_describe')
        .setLabel('📝 Describe Book')
        .setStyle(ButtonStyle.Secondary)
    ]);

  // Quick actions row
  const quickRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('recommend_popular')
        .setLabel('🔥 Popular Books')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('recommend_new')
        .setLabel('✨ New Releases')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('check_downloads')
        .setLabel('📥 My Downloads')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('show_help')
        .setLabel('❓ Help')
        .setStyle(ButtonStyle.Secondary)
    ]);

  // Anchor buttons row
  const anchorRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('home_new_chat')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('other_cmds_open')
        .setLabel('Other Commands')
        .setStyle(ButtonStyle.Secondary)
    ]);

  return {
    content: "🪄 **Welcome to Book Fairy!** How would you like to find your next audiobook?",
    components: [searchRow, quickRow, anchorRow]
  };
}
