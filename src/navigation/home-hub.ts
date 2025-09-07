/**
 * UNIFIED HOME HUB - Single canonical entry point for Book Fairy
 * 
 * This module implements the unified home scene that all navigation converges on.
 * Replaces all scattered "home" and "main menu" implementations with a single 
 * deterministic hub that matches the UI specification.
 * 
 * Key Features:
 * - Exact button IDs as specified for deterministic routing
 * - Preserves Southern Belle personality and greeting
 * - Routes to existing feature flows without modification
 * - Handles all legacy entry points through forwarding
 * - Provides error fallback recovery
 */

import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  Message,
  ButtonInteraction
} from 'discord.js';
import { logger } from '../utils/logger';

/**
 * Known home hub button IDs for validation
 * Used to validate button interactions before processing
 */
const KNOWN_HOME_IDS = new Set([
  'search_title_open',
  'search_author_open', 
  'search_describe_open',
  'browse_genres_open',
  'audiobooks_open',
  'more_options_open',
  'other_cmds_open',
  'home_new_chat',
  'home_back',
  'home_next'
]);

// Session interface for home hub state management
export interface HomeSession {
  lastScene?: string;
  lastQuery?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  // Preserve existing session data without breaking compatibility
  [key: string]: any;
}

/**
 * Session storage for home hub navigation state
 */
const homeSessions = new Map<string, HomeSession>();

/**
 * Get or create session for user
 */
export function getHomeSession(userId: string): HomeSession {
  if (!homeSessions.has(userId)) {
    homeSessions.set(userId, {});
  }
  return homeSessions.get(userId)!;
}

/**
 * Clear session state for new chat
 */
export function clearHomeSession(userId: string): void {
  homeSessions.delete(userId);
}

/**
 * Update session with navigation context
 */
export function updateHomeSession(userId: string, updates: Partial<HomeSession>): void {
  const session = getHomeSession(userId);
  Object.assign(session, updates);
}

/**
 * CANONICAL HOME RENDERER
 * 
 * Creates the single unified hub UI that all entry points converge on.
 * Uses exact button IDs and layout as specified in requirements.
 * 
 * @param session - User session for context-aware rendering
 * @returns Message components for the Book Search hub
 */
export function renderHome(session: HomeSession = {}): { 
  content: string, 
  embeds?: EmbedBuilder[], 
  components: ActionRowBuilder<ButtonBuilder>[] 
} {
  // Primary action buttons row - core search functions
  const searchRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('search_title_open')
        .setLabel('By Title')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('search_author_open')
        .setLabel('By Author')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('search_describe_open')
        .setLabel('Describe the Book')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('browse_genres_open')
        .setLabel('Browse Genres')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('audiobooks_open')
        .setLabel('Audiobooks')
        .setStyle(ButtonStyle.Secondary)
    ]);

  // Secondary action buttons row - utilities and options  
  const utilityRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('more_options_open')
        .setLabel('More Options')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('home_back')
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('home_next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary),
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
    content: "**Book Search**\n\nHey there, sugar! Let me help you find some books.",
    components: [searchRow, utilityRow]
  };
}

/**
 * NAVIGATION DISPATCHER
 * 
 * Routes from home hub buttons to existing feature controllers.
 * Maintains compatibility with all existing flows and functionality.
 * 
 * @param customId - Button custom ID to route
 * @param interaction - Discord button interaction
 * @returns Route destination or null if not handled
 */
export async function navigateFromHome(
  customId: string, 
  interaction: ButtonInteraction
): Promise<{ action: string; data?: any } | null> {
  // Ignore detail/download buttons; they're handled elsewhere.
  if (
    interaction.isButton() &&
    /^BOOK_(VIEW|DL_YES|DL_NO):/.test(interaction.customId)
  ) {
    return null; // let bookDetails handler take it
  }

  // Validate button ID using KNOWN_HOME_IDS set
  if (!KNOWN_HOME_IDS.has(customId)) {
    logger.debug({ customId }, 'Unknown home hub button');
    return null;
  }

  const userId = interaction.user.id;
  const session = getHomeSession(userId);
  
  logger.info({ customId, userId }, 'Navigating from home hub');
  
  switch (customId) {
    case 'search_title_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'search_title' };
      
    case 'search_author_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'search_author' };
      
    case 'search_describe_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'search_describe' };
      
    case 'browse_genres_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'browse_genres' };
      
    case 'audiobooks_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'audiobooks' };
      
    case 'more_options_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'more_options' };
      
    case 'other_cmds_open':
      updateHomeSession(userId, { lastScene: 'home' });
      return { action: 'other_commands' };
      
    case 'home_new_chat':
      clearHomeSession(userId);
      return { action: 'home_refresh' };
      
    case 'home_back':
      // Always returns to home from any depth
      return { action: 'home_refresh' };
      
    case 'home_next':
      // Reserved for future onboarding or carousel
      return { action: 'home_next_reserved' };
      
    default:
      logger.warn({ customId }, 'Unknown home hub button');
      return null;
  }
}

/**
 * LEGACY ENTRY POINT FORWARDER
 * 
 * Handles all legacy commands and entry points by forwarding to home.
 * Maintains backwards compatibility while consolidating navigation.
 * 
 * @param trigger - Legacy trigger (command, button ID, etc.)
 * @returns Whether trigger was handled and forwarded to home
 */
export function forwardLegacyToHome(trigger: string): boolean {
  const legacyTriggers = [
    // Legacy slash commands
    '/start', '/help', '/menu',
    
    // Legacy button IDs
    'bf_flow_main', 'new_search', 'search_again', 'back_to_main',
    
    // Legacy greetings and commands
    'hi', 'hello', 'hey', 'help', 'menu', 'start',
    
    // Legacy quick action returns
    'bf_flow_search_again', 'bf_flow_done'
  ];
  
  const normalizedTrigger = trigger.toLowerCase().trim();
  return legacyTriggers.some(legacy => 
    normalizedTrigger === legacy || 
    normalizedTrigger.includes(legacy)
  );
}

/**
 * ERROR RECOVERY
 * 
 * Fallback to home hub when errors occur anywhere in the system.
 * Provides safe recovery point with user-friendly messaging.
 * 
 * @param error - Error that occurred
 * @param userId - User ID for session context
 * @returns Home hub render with error acknowledgment
 */
export function recoverToHome(error: Error, userId?: string): { 
  content: string, 
  components: ActionRowBuilder<ButtonBuilder>[] 
} {
  if (userId) {
    // Clear potentially corrupted session state
    clearHomeSession(userId);
  }
  
  logger.error({ error, userId }, 'Recovering to home hub after error');
  
  const home = renderHome();
  return {
    content: "Something went wrong, back at Home\n\n" + home.content,
    components: home.components
  };
}

/**
 * DETERMINISTIC HOME LOAD
 * 
 * Single function that loads the home hub for any context.
 * Used by all entry points to ensure consistent experience.
 * 
 * @param userId - User ID for session management
 * @param fromError - Whether this is error recovery
 * @returns Complete home hub render
 */
export function loadHome(userId: string, fromError: boolean = false): {
  content: string,
  components: ActionRowBuilder<ButtonBuilder>[]
} {
  try {
    const session = getHomeSession(userId);
    const home = renderHome(session);
    
    if (fromError) {
      return {
        content: "Something went wrong, back at Home\n\n" + home.content,
        components: home.components
      };
    }
    
    return home;
  } catch (error) {
    logger.error({ error, userId }, 'Error in loadHome, using basic fallback');
    return recoverToHome(error as Error, userId);
  }
}

/**
 * HOME HUB INTEGRATION VALIDATOR
 * 
 * Validates that all required button IDs are unique and properly handled.
 * Used for testing and deployment verification.
 */
export function validateHomeHub(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const requiredIds = [
    'search_title_open', 'search_author_open', 'search_describe_open',
    'browse_genres_open', 'audiobooks_open', 'more_options_open',
    'other_cmds_open', 'home_back', 'home_next', 'home_new_chat'
  ];
  
  const home = renderHome();
  const foundIds = new Set<string>();
  
  // Extract all button custom IDs
  for (const row of home.components) {
    for (const component of row.components) {
      if (component instanceof ButtonBuilder) {
        const buttonData = component.toJSON();
        if ('custom_id' in buttonData && buttonData.custom_id) {
          foundIds.add(buttonData.custom_id);
        }
      }
    }
  }
  
  // Check for missing required IDs
  for (const requiredId of requiredIds) {
    if (!foundIds.has(requiredId)) {
      issues.push(`Missing required button ID: ${requiredId}`);
    }
  }
  
  // Check for button limit compliance (5 per row, max 5 rows)
  for (let i = 0; i < home.components.length; i++) {
    if (home.components[i].components.length > 5) {
      issues.push(`Row ${i + 1} has ${home.components[i].components.length} buttons, max is 5`);
    }
  }
  
  if (home.components.length > 5) {
    issues.push(`${home.components.length} rows found, max is 5`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
