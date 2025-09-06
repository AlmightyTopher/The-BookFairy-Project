/**
 * UNIFIED NAVIGATION SYSTEM
 * 
 * This module consolidates all navigation logic across the entire bot into a single source of truth.
 * It replaces scattered navigation implementations and provides consistent behavior everywhere.
 * 
 * MIGRATION MAPPING (Old -> New):
 * - src/utils/discord-ui.ts:createSearchResultButtons -> UnifiedNav.createResultsScreen
 * - src/quick-actions/index.ts:createMainScreen -> UnifiedNav.createMainScreen  
 * - src/quick-actions/index.ts:createMoreOptionsScreen -> UnifiedNav.createMoreOptionsScreen
 * - src/quick-actions/index.ts:createOtherCommandsScreen -> UnifiedNav.createOtherCommandsScreen
 * - src/quick-actions/index.ts:createAudiobooksGenreScreen -> UnifiedNav.createGenreScreen
 * - src/quick-actions/index.ts:createAudiobooksTimeWindowScreen -> UnifiedNav.createTimeframeScreen
 * - src/quick-actions/index.ts:createAudiobooksResultsScreen -> UnifiedNav.createResultsScreen
 * - src/quick-actions/index.ts:createGenreResultsScreen -> UnifiedNav.createResultsScreen
 * - src/bot/message-handler.ts:createWelcomeButtons -> UnifiedNav.createMainScreen
 * - src/bot/message-handler.ts:createGenreButtons -> UnifiedNav.createGenreScreen
 * - All pagination logic -> UnifiedNav.handleNavigation
 * - All back/next/new_search/more_info handlers -> UnifiedNav.dispatch
 */

import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonInteraction,
  StringSelectMenuInteraction
} from 'discord.js';
import { logger } from '../utils/logger';

// Navigation context types
export interface NavContext {
  screen: NavScreen;
  page: number;
  totalPages: number;
  data?: any;
  previousScreen?: NavScreen;
  previousContext?: NavContext;
}

export type NavScreen = 
  | 'main'
  | 'more_options' 
  | 'other_commands'
  | 'genre_list'
  | 'timeframe_select'
  | 'search_results'
  | 'audiobook_results'
  | 'confirmation'
  | 'search_again';

export type NavAction = 
  | 'back'
  | 'next' 
  | 'prev'
  | 'new_message'
  | 'other_commands'
  | 'more_info'
  | 'page_change'
  | 'unavailable';

// Global button registry for stable IDs
class ButtonRegistry {
  private static instance: ButtonRegistry;
  private nextId = 1;
  private idMap = new Map<string, number>();
  
  static getInstance(): ButtonRegistry {
    if (!ButtonRegistry.instance) {
      ButtonRegistry.instance = new ButtonRegistry();
    }
    return ButtonRegistry.instance;
  }
  
  getId(key: string): number {
    if (!this.idMap.has(key)) {
      this.idMap.set(key, this.nextId++);
    }
    return this.idMap.get(key)!;
  }
  
  getCustomId(key: string): string {
    return `nav_${this.getId(key)}`;
  }
}

export class UnifiedNavigation {
  private static instance: UnifiedNavigation;
  private registry = ButtonRegistry.getInstance();
  
  static getInstance(): UnifiedNavigation {
    if (!UnifiedNavigation.instance) {
      UnifiedNavigation.instance = new UnifiedNavigation();
    }
    return UnifiedNavigation.instance;
  }

  /**
   * Create standard navigation row that appears at bottom of all screens
   */
  createNavRow(context: NavContext): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    // Back button - enabled if we have a previous screen
    const backButton = new ButtonBuilder()
      .setCustomId(this.registry.getCustomId('back'))
      .setLabel('⬅️ Back')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!context.previousScreen);
    
    // Next button - enabled if we have more pages
    const nextButton = new ButtonBuilder()
      .setCustomId(this.registry.getCustomId('next'))
      .setLabel('Next ➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(context.page >= context.totalPages);
    
    // New Message button - always available
    const newMessageButton = new ButtonBuilder()
      .setCustomId(this.registry.getCustomId('new_message'))
      .setLabel('🆕 New Chat')
      .setStyle(ButtonStyle.Success);
    
    // Other Commands button - always available  
    const otherCommandsButton = new ButtonBuilder()
      .setCustomId(this.registry.getCustomId('other_commands'))
      .setLabel('⚙️ Other Commands')
      .setStyle(ButtonStyle.Secondary);
    
    // Unavailable placeholder - reserved for future expansion
    const unavailableButton = new ButtonBuilder()
      .setCustomId(this.registry.getCustomId('unavailable'))
      .setLabel('Unavailable')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
    
    row.addComponents([backButton, nextButton, newMessageButton, otherCommandsButton, unavailableButton]);
    return row;
  }

  /**
   * Create main screen with unified navigation
   */
  createMainScreen(): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
    const embed = new EmbedBuilder()
      .setTitle('📚 Book Search')
      .setDescription('What book are you looking for, choose how you want to search')
      .setColor(0x7C4DFF);

    const searchRow1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_title'))
          .setLabel('By Title')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_author'))
          .setLabel('By Author')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_describe'))
          .setLabel('Describe the Book')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('browse_genres'))
          .setLabel('🎭 Browse Genres')
          .setStyle(ButtonStyle.Secondary)
      ]);

    const searchRow2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('audiobooks'))
          .setLabel('📚 Audiobooks')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎧'),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('more_options'))
          .setLabel('More Options')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_1'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_2'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      ]);

    const context: NavContext = {
      screen: 'main',
      page: 1,
      totalPages: 1
    };

    const navRow = this.createNavRow(context);

    return {
      embeds: [embed],
      components: [searchRow1, searchRow2, navRow]
    };
  }

  /**
   * Create more options screen with unified navigation
   */
  createMoreOptionsScreen(previousContext?: NavContext): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
    const embed = new EmbedBuilder()
      .setTitle('📚 More Search Options')
      .setDescription('More options, pick a path or set filters.')
      .setColor(0x7C4DFF);

    const optionsRow1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_series'))
          .setLabel('By Series')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_narrator'))
          .setLabel('By Narrator')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('search_genre'))
          .setLabel('By Genre')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('filter_language'))
          .setLabel('Language')
          .setStyle(ButtonStyle.Secondary)
      ]);

    const optionsRow2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('filter_length'))
          .setLabel('Length')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('source_library'))
          .setLabel('Source, Library')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('source_mam'))
          .setLabel('Source, MAM')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('popular'))
          .setLabel('Popular')
          .setStyle(ButtonStyle.Secondary)
      ]);

    const optionsRow3 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('new_releases'))
          .setLabel('New Releases')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('surprise_me'))
          .setLabel('Surprise Me')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_3'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_4'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      ]);

    const context: NavContext = {
      screen: 'more_options',
      page: 1,
      totalPages: 1,
      previousScreen: previousContext?.screen || 'main',
      previousContext
    };

    const navRow = this.createNavRow(context);

    return {
      embeds: [embed],
      components: [optionsRow1, optionsRow2, optionsRow3, navRow]
    };
  }

  /**
   * Create other commands screen with unified navigation
   */
  createOtherCommandsScreen(previousContext?: NavContext): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
    const embed = new EmbedBuilder()
      .setTitle('🔧 Other Commands')
      .setDescription('Other commands, pick a utility, or hit New Chat to start over.')
      .setColor(0x7C4DFF);

    const commandRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('check_status'))
          .setLabel('Check Status')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('help'))
          .setLabel('Help')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_5'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId('unavailable_6'))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      ]);

    const context: NavContext = {
      screen: 'other_commands',
      page: 1,
      totalPages: 1,
      previousScreen: previousContext?.screen || 'main',
      previousContext
    };

    const navRow = this.createNavRow(context);

    return {
      embeds: [embed],
      components: [commandRow, navRow]
    };
  }

  /**
   * Create genre selection screen with unified navigation
   */
  createGenreScreen(page: number = 0, genres: any[] = [], previousContext?: NavContext): { embeds: EmbedBuilder[], components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle('📚 Browse by Genre')
      .setDescription('Choose a genre to explore audiobooks.')
      .setColor(0x00D4AA);

    const genresPerPage = 20; // 4 rows of 5 buttons each (leaving bottom row for nav)
    const totalPages = Math.ceil(genres.length / genresPerPage);
    const startIndex = page * genresPerPage;
    const endIndex = Math.min(startIndex + genresPerPage, genres.length);
    const pageGenres = genres.slice(startIndex, endIndex);

    embed.setDescription(`Choose a genre to explore audiobooks.\nPage ${page + 1} of ${totalPages}`);

    const components: ActionRowBuilder<any>[] = [];

    // Create 4 rows of 5 genre buttons each
    for (let row = 0; row < 4; row++) {
      const rowStart = row * 5;
      const rowEnd = Math.min(rowStart + 5, pageGenres.length);
      
      if (rowStart < pageGenres.length) {
        const genreRow = new ActionRowBuilder<ButtonBuilder>();
        const buttons: ButtonBuilder[] = [];
        
        for (let i = rowStart; i < rowStart + 5; i++) {
          if (i < pageGenres.length) {
            const genre = pageGenres[i];
            buttons.push(
              new ButtonBuilder()
                .setCustomId(this.registry.getCustomId(`genre_${genre.id}`))
                .setLabel(genre.name)
                .setStyle(ButtonStyle.Primary)
            );
          } else {
            // Fill with unavailable buttons
            buttons.push(
              new ButtonBuilder()
                .setCustomId(this.registry.getCustomId(`unavailable_genre_${row}_${i}`))
                .setLabel('Unavailable')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );
          }
        }
        
        genreRow.addComponents(buttons);
        components.push(genreRow);
      }
    }

    const context: NavContext = {
      screen: 'genre_list',
      page: page + 1,
      totalPages,
      data: { genres, genresPerPage },
      previousScreen: previousContext?.screen || 'main',
      previousContext
    };

    const navRow = this.createNavRow(context);
    components.push(navRow);

    return {
      embeds: [embed],
      components
    };
  }

  /**
   * Create timeframe selection screen with unified navigation
   */
  createTimeframeScreen(previousContext?: NavContext): { embeds: EmbedBuilder[], components: ActionRowBuilder<any>[] } {
    const embed = new EmbedBuilder()
      .setTitle('📅 Select Time Window')
      .setDescription('Choose how far back to search for popular audiobooks.')
      .setColor(0x00D4AA);

    const timeSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(this.registry.getCustomId('audiobooks_time_select'))
          .setPlaceholder('Select time window...')
          .addOptions([
            new StringSelectMenuOptionBuilder()
              .setLabel('📅 Past Week')
              .setDescription('Most popular in the last 7 days')
              .setValue('week'),
            new StringSelectMenuOptionBuilder()
              .setLabel('📅 Past Month')
              .setDescription('Most popular in the last 30 days')
              .setValue('month'),
            new StringSelectMenuOptionBuilder()
              .setLabel('📅 Past 3 Months')
              .setDescription('Most popular in the last 90 days')
              .setValue('3months'),
            new StringSelectMenuOptionBuilder()
              .setLabel('📅 Past Year')
              .setDescription('Most popular in the last 365 days')
              .setValue('year')
          ])
      );

    const context: NavContext = {
      screen: 'timeframe_select',
      page: 1,
      totalPages: 1,
      previousScreen: previousContext?.screen || 'genre_list',
      previousContext
    };

    const navRow = this.createNavRow(context);

    return {
      embeds: [embed],
      components: [timeSelectRow, navRow]
    };
  }

  /**
   * Create results screen with unified navigation (works for all result types)
   */
  createResultsScreen(
    results: any[], 
    page: number, 
    totalItems: number, 
    itemsPerPage: number = 5,
    title: string = 'Results',
    previousContext?: NavContext
  ): { content?: string, embeds?: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;

    let content = `📚 **${title}**\n`;
    content += `Showing ${startIndex + 1}-${startIndex + results.length} of ${totalItems} results (Page ${page}/${totalPages}):\n\n`;
    
    // Format results (keeping existing formatting logic)
    content += results.map((item, index) => {
      const itemNumber = startIndex + index + 1;
      return `**${itemNumber}.** **${item.title}** — ${item.author}`;
    }).join('\n');

    const hasNextPage = page < totalPages;
    if (hasNextPage) {
      content += `\n\nSay "next" to see more results, or pick a number to download!`;
    } else {
      content += `\n\nPick a number to download!`;
    }

    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    
    // Numbered download buttons [1][2][3][4][5]
    const numberButtons: ButtonBuilder[] = [];
    for (let i = 0; i < Math.min(results.length, 5); i++) {
      const buttonNumber = startIndex + i + 1;
      numberButtons.push(
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId(`select_${i}`))
          .setLabel(`${buttonNumber}`)
          .setStyle(ButtonStyle.Primary)
      );
    }
    
    // Fill remaining slots with unavailable buttons
    for (let i = results.length; i < 5; i++) {
      numberButtons.push(
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId(`unavailable_select_${i}`))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    }
    
    if (numberButtons.length > 0) {
      components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(numberButtons));
    }
    
    // Action buttons row
    const actionButtons: ButtonBuilder[] = [
      new ButtonBuilder()
        .setCustomId(this.registry.getCustomId('more_info'))
        .setLabel('📖 More Info')
        .setStyle(ButtonStyle.Secondary)
    ];
    
    // Fill action row to 5 buttons
    for (let i = 1; i < 5; i++) {
      actionButtons.push(
        new ButtonBuilder()
          .setCustomId(this.registry.getCustomId(`unavailable_action_${i}`))
          .setLabel('Unavailable')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    }
    
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(actionButtons));

    const context: NavContext = {
      screen: 'search_results',
      page,
      totalPages,
      data: { results, totalItems, itemsPerPage },
      previousScreen: previousContext?.screen || 'main',
      previousContext
    };

    const navRow = this.createNavRow(context);
    components.push(navRow);

    return {
      content,
      components
    };
  }

  /**
   * Handle navigation button interactions
   */
  async handleNavigation(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    action: NavAction,
    currentContext: NavContext
  ): Promise<NavContext | null> {
    logger.info({ action, currentScreen: currentContext.screen }, 'Handling navigation action');

    switch (action) {
      case 'back':
        if (currentContext.previousContext) {
          return currentContext.previousContext;
        }
        return { screen: 'main', page: 1, totalPages: 1 };

      case 'next':
        if (currentContext.page < currentContext.totalPages) {
          return {
            ...currentContext,
            page: currentContext.page + 1
          };
        }
        break;

      case 'prev':
        if (currentContext.page > 1) {
          return {
            ...currentContext,
            page: currentContext.page - 1
          };
        }
        break;

      case 'new_message':
        return { screen: 'main', page: 1, totalPages: 1 };

      case 'other_commands':
        return { 
          screen: 'other_commands', 
          page: 1, 
          totalPages: 1,
          previousScreen: currentContext.screen,
          previousContext: currentContext
        };

      case 'unavailable':
        // Do nothing, button is disabled
        break;
    }

    return null;
  }

  /**
   * Main dispatcher for all navigation interactions
   */
  async dispatch(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    currentContext: NavContext
  ): Promise<{ newContext?: NavContext, screen?: any, action?: string } | null> {
    const customId = interaction.customId;
    
    // Determine action from button ID
    let action: NavAction | null = null;
    
    if (customId === this.registry.getCustomId('back')) {
      action = 'back';
    } else if (customId === this.registry.getCustomId('next')) {
      action = 'next';
    } else if (customId === this.registry.getCustomId('new_message')) {
      action = 'new_message';
    } else if (customId === this.registry.getCustomId('other_commands')) {
      action = 'other_commands';
    } else if (customId === this.registry.getCustomId('unavailable')) {
      action = 'unavailable';
    } else if (customId === this.registry.getCustomId('more_info')) {
      action = 'more_info';
    }

    if (action) {
      const newContext = await this.handleNavigation(interaction, action, currentContext);
      if (newContext) {
        return { newContext };
      }
    }

    // Handle screen-specific actions (non-nav buttons)
    return { action: 'screen_specific', newContext: currentContext };
  }

  /**
   * Get button registry for external access
   */
  getRegistry(): ButtonRegistry {
    return this.registry;
  }
}

// Export singleton instance
export const unifiedNav = UnifiedNavigation.getInstance();
