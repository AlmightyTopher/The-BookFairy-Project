import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Utility functions for creating Discord UI components.
 * Centralizes button and component creation to reduce code duplication.
 */

/**
 * Creates search result buttons with numbered download options and navigation.
 * 
 * @param results - Array of search results to create buttons for
 * @param startIndex - Starting index for button numbering (for pagination)
 * @param hasNextPage - Whether there are more results available
 * @returns Array of ActionRowBuilder components with download and navigation buttons
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
    const buttonNumber = startIndex + i + 1;
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`download_${buttonNumber}`)
        .setLabel(`${buttonNumber}`)
        .setStyle(ButtonStyle.Primary)
    );
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
      .setCustomId('more_info')
      .setLabel('📖 More Info')
      .setStyle(ButtonStyle.Secondary)
  );
  
  navButtons.push(
    new ButtonBuilder()
      .setCustomId('new_search')
      .setLabel('New Search')
      .setStyle(ButtonStyle.Success)
  );
  
  if (navButtons.length > 0) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(navButtons));
  }
  
  return rows;
}
