import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { bookSelectButton } from '../discord/ui/bookButtons';
import { BookMeta } from '../integrations/hardcover/client';

/**
 * Utility functions for creating Discord UI components.
 * Centralizes button and component creation to reduce code duplication.
 */

/**
 * Creates search result buttons with numbered book detail options and navigation.
 * 
 * @param results - Array of search results to create buttons for
 * @param startIndex - Starting index for button numbering (for pagination)
 * @param hasNextPage - Whether there are more results available
 * @returns Array of ActionRowBuilder components with book detail and navigation buttons
 */
export function createSearchResultButtons(
  results: any[], 
  startIndex: number, 
  hasNextPage: boolean
): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  // Create numbered buttons for up to 5 results (Discord's limit per row)
  const buttons: ButtonBuilder[] = [];
  for (let i = 0; i < Math.min(results.length, 5); i++) {
    const book = results[i];
    const meta: BookMeta = {
      title: book.title,
      author: book.author,
      isbn: book.isbn
    };
    
    const button = bookSelectButton(meta, startIndex + i + 1);
    buttons.push(button);
  }
  
  // Add buttons to row
  if (buttons.length > 0) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons));
  }
  
  // Add navigation buttons if needed
  const navButtons: ButtonBuilder[] = [];
  
  if (hasNextPage) {
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
    );
  }
  
  navButtons.push(
    new ButtonBuilder()
      .setCustomId('new_search')
      .setLabel('New Search')
      .setStyle(ButtonStyle.Success)
  );
  
  if (navButtons.length > 0) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(navButtons));
  }
  
  // Add consistent bottom anchor buttons - New Chat on far left, Help in middle, Other Commands on right
  const anchorButtons = [
    new ButtonBuilder()
      .setCustomId('home_new_chat')
      .setLabel('New Chat')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('show_help')
      .setLabel('🆘 Help')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('other_cmds_open')
      .setLabel('Other Commands')
      .setStyle(ButtonStyle.Secondary)
  ];
  
  rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(anchorButtons));
  
  return rows;
}
