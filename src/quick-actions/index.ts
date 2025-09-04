import { 
  Client, 
  ChatInputCommandInteraction, 
  ButtonInteraction, 
  ModalSubmitInteraction,
  Message,
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { logger } from '../utils/logger';
import { dispatchUserQuery } from '../bridge/dispatch';
import { listGenres, getTopByGenre, listTimeframes, Genre, MangoItem, Timeframe } from '../integrations/mango';
import { formatBook } from '../utils/goodreads';
import { createSearchResultButtons } from '../utils/discord-ui';
import { addTorrent } from '../clients/qbittorrent-client';
import { browserScraper } from '../integrations/mango/browser-scraper';
import { 
  mamFlowManager, 
  CANONICAL_GENRES, 
  CANONICAL_TIME_WINDOWS, 
  CanonicalGenre, 
  CanonicalTimeWindow,
  MAMFlowResults,
  MAMFlowItem
} from '../integrations/mango/mam-flow';
import { prowlarrRelay } from '../integrations/mango/prowlarr-relay';
import { searchMamCandidates } from '../integrations/mam';

interface Session {
  expecting?: 'title' | 'author' | 'description' | 'series' | 'narrator' | 'genre' | 'language' | 'length' | 'request_id';
  nudges: number;
  expiresAt?: Date;
  currentFlow?: 'awaiting_input' | 'processing' | 'showing_results' | 'completed';
  lastSearchResults?: any;
  lastQuery?: string;
  // Genre browsing state
  genreBrowsing?: {
    selectedGenre?: string;
    selectedTimeframe?: Timeframe;
    currentResults?: MangoItem[];
    currentPage?: number;
    totalPages?: number;
  };
  // MAM Flow state (new canonical flow)
  mamFlow?: {
    selectedGenre?: CanonicalGenre;
    selectedTimeWindow?: CanonicalTimeWindow;
    currentPage: number;
    totalPages: number;
    currentResults: MAMFlowItem[];
    currentItem?: MAMFlowItem;
  };
}

const sessions = new Map<string, Session>();
const OPS_CONTACT = process.env.OPS_CONTACT || 'the operations team';

const NUDGE_MESSAGES = [
  "Hey sugar, mind tapping one of the buttons below for me",
  "Darlin', go ahead and press one of those buttons so I can help proper", 
  "Be a peach and pick a button, I will do the rest"
];

function getSessionKey(channelId: string | null, userId: string): string {
  return channelId ? `${channelId}:${userId}` : `dm:${userId}`;
}

export function getSession(channelId: string | null, userId: string): Session {
  const key = getSessionKey(channelId, userId);
  if (!sessions.has(key)) {
    sessions.set(key, { nudges: 0 });
  }
  return sessions.get(key)!;
}

function clearExpectation(channelId: string | null, userId: string): void {
  const session = getSession(channelId, userId);
  session.expecting = undefined;
  session.expiresAt = undefined;
  session.nudges = 0;
  session.currentFlow = undefined;
  session.lastSearchResults = undefined;
  session.lastQuery = undefined;
}

function setExpectation(channelId: string | null, userId: string, expecting: Session['expecting']): void {
  const session = getSession(channelId, userId);
  session.expecting = expecting;
  session.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  session.nudges = 0;
  session.currentFlow = 'awaiting_input';
}

function setProcessingState(channelId: string | null, userId: string): void {
  const session = getSession(channelId, userId);
  session.currentFlow = 'processing';
}

function setResultsState(channelId: string | null, userId: string, results: any, query: string): void {
  const session = getSession(channelId, userId);
  session.currentFlow = 'showing_results';
  session.lastSearchResults = results;
  session.lastQuery = query;
}

function setCompletedState(channelId: string | null, userId: string): void {
  const session = getSession(channelId, userId);
  session.currentFlow = 'completed';
}

function isExpectationValid(session: Session): boolean {
  return !!(session.expecting && session.expiresAt && session.expiresAt > new Date());
}

function createMainScreen(): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('📚 Book Search')
    .setDescription('What book are you looking for, choose how you want to search')
    .setColor(0x7C4DFF);

  const searchRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_search_title')
        .setLabel('By Title')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_search_author')
        .setLabel('By Author')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_search_describe')
        .setLabel('Describe the Book')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_browse_genres')
        .setLabel('🎭 Browse Genres')
        .setStyle(ButtonStyle.Secondary)
    );

  const audiobooksRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_audiobooks')
        .setLabel('📚 Audiobooks')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎧')
    );

  const moreRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_more')
        .setLabel('More Options')
        .setStyle(ButtonStyle.Secondary)
    );

  const anchorRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('bf_flow_other')
        .setLabel('Other Commands')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [searchRow, audiobooksRow, moreRow, anchorRow]
  };
}

function createMoreOptionsScreen(): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('📚 More Search Options')
    .setDescription('More options, pick a path or set filters.')
    .setColor(0x7C4DFF);

  const optionsRow1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_search_series')
        .setLabel('By Series')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_search_narrator')
        .setLabel('By Narrator')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_search_genre')
        .setLabel('By Genre')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_filter_language')
        .setLabel('Language')
        .setStyle(ButtonStyle.Secondary)
    );

  const optionsRow2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_filter_length')
        .setLabel('Length')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_source_library')
        .setLabel('Source, Library')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_source_mam')
        .setLabel('Source, MAM')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_popular')
        .setLabel('Popular')
        .setStyle(ButtonStyle.Secondary)
    );

  const optionsRow3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_new')
        .setLabel('New Releases')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_surprise')
        .setLabel('Surprise Me')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_browse_genres')
        .setLabel('Browse Genres')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_more_back')
        .setLabel('Back')
        .setStyle(ButtonStyle.Secondary)
    );

  const anchorRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('bf_flow_other')
        .setLabel('Other Commands')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [optionsRow1, optionsRow2, optionsRow3, anchorRow]
  };
}

function createOtherCommandsScreen(): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('🔧 Other Commands')
    .setDescription('Other commands, pick a utility, or hit New Chat to start over.')
    .setColor(0x7C4DFF);

  const commandRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_check_status')
        .setLabel('Check Status')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_help')
        .setLabel('Help')
        .setStyle(ButtonStyle.Primary)
    );

  const anchorRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('bf_flow_other')
        .setLabel('Other Commands')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [commandRow, anchorRow]
  };
}

function createSearchAgainPrompt(): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('✅ Search Complete')
    .setDescription('Would you like to search for another book?')
    .setColor(0x4CAF50);

  const actionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_search_again')
        .setLabel('Search Again')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_done')
        .setLabel('Done')
        .setStyle(ButtonStyle.Secondary)
    );

  const anchorRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('bf_flow_other')
        .setLabel('Other Commands')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [actionRow, anchorRow]
  };
}

function createPromptMessage(field: string): string {
  switch (field) {
    case 'title': return 'What book title are you looking for?';
    case 'author': return 'Which author would you like books from?';
    case 'description': return 'Can you describe the book you\'re looking for?';
    case 'series': return 'What book series are you interested in?';
    case 'narrator': return 'Which narrator are you looking for?';
    case 'genre': return 'What genre would you like?';
    case 'language': return 'What language do you prefer?';
    case 'length': return 'How long should the book be? (short, medium, long)';
    case 'request_id': return 'What request ID do you want to check?';
    default: return 'What are you looking for?';
  }
}

function normalizeCommand(field: string, value: string): string {
  switch (field) {
    case 'title': return `find books with title ${value}`;
    case 'author': return `find books by author ${value}`;
    case 'description': return `find books about ${value}`;
    case 'series': return `find books in series ${value}`;
    case 'narrator': return `find books narrated by ${value}`;
    case 'genre': return `find ${value} books`;
    case 'language': return `find books in ${value} language`;
    case 'length': return `find ${value} length books`;
    case 'request_id': return `check status of request ${value}`;
    default: return `find books about ${value}`;
  }
}

function isCustomTextInput(content: string): boolean {
  // Check if the message looks like a book search rather than a command
  const lowerContent = content.toLowerCase().trim();
  
  // Skip numbers (book selections)
  if (/^\d+$/.test(content.trim())) {
    return false;
  }
  
  // Skip simple responses
  if (/^(yes|yeah|sure|ok|okay|yep|y|no|nope|n)$/i.test(lowerContent)) {
    return false;
  }
  
  // Check for book-related keywords that suggest this is a custom search
  const bookKeywords = [
    'find', 'search', 'looking for', 'book', 'audiobook', 'author', 'title', 
    'series', 'by ', 'from ', 'about', 'written by', 'read by', 'narrated by'
  ];
  
  return bookKeywords.some(keyword => lowerContent.includes(keyword)) || 
         content.length > 10; // Longer texts are likely custom searches
}

// MAM Flow UI Components
function createAudiobooksGenreScreen(page: number = 0): { embeds: EmbedBuilder[], components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('📚 Browse by Genre')
    .setDescription('Choose a genre to explore audiobooks from MyAnonaMouse.')
    .setColor(0x00D4AA);

  // Split genres into pages of 25 (Discord limit)
  const genresPerPage = 25;
  const totalPages = Math.ceil(CANONICAL_GENRES.length / genresPerPage);
  const startIndex = page * genresPerPage;
  const endIndex = Math.min(startIndex + genresPerPage, CANONICAL_GENRES.length);
  const pageGenres = CANONICAL_GENRES.slice(startIndex, endIndex);

  // Update embed to show current page
  embed.setDescription(`Choose a genre to explore audiobooks from MyAnonaMouse.\nPage ${page + 1} of ${totalPages}`);

  // Create select menu with genres for this page
  const genreOptions = pageGenres.map(genre => 
    new StringSelectMenuOptionBuilder()
      .setLabel(genre)
      .setValue(`mam_genre_${genre.toLowerCase().replace(/[\s\/]+/g, '_')}`)
      .setDescription(`Browse ${genre} audiobooks`)
  );

  const genreSelectMenu = new StringSelectMenuBuilder()
    .setCustomId('bf_audiobooks_genre_select')
    .setPlaceholder(`Select a genre (${pageGenres[0]} - ${pageGenres[pageGenres.length - 1]})...`)
    .addOptions(genreOptions);

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(genreSelectMenu);

  const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [selectRow];

  // Add pagination buttons if needed
  if (totalPages > 1) {
    const navButtons: ButtonBuilder[] = [];
    
    if (page > 0) {
      navButtons.push(
        new ButtonBuilder()
          .setCustomId(`bf_genre_page_${page - 1}`)
          .setLabel('← Previous')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    if (page < totalPages - 1) {
      navButtons.push(
        new ButtonBuilder()
          .setCustomId(`bf_genre_page_${page + 1}`)
          .setLabel('Next →')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    if (navButtons.length > 0) {
      const navRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(navButtons);
      components.push(navRow);
    }
  }

  // Back button
  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('← Back to Main')
        .setStyle(ButtonStyle.Secondary)
    );

  components.push(backRow);

  return {
    embeds: [embed],
    components
  };
}

function createAudiobooksTimeWindowScreen(selectedGenre: CanonicalGenre): { embeds: EmbedBuilder[], components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle(`📚 ${selectedGenre} Audiobooks`)
    .setDescription('Choose a time window to see the most popular titles.')
    .setColor(0x00D4AA);

  // Create select menu with canonical time windows
  const timeOptions = CANONICAL_TIME_WINDOWS.map(timeWindow => 
    new StringSelectMenuOptionBuilder()
      .setLabel(timeWindow.charAt(0).toUpperCase() + timeWindow.slice(1))
      .setValue(`mam_time_${timeWindow.replace(/\s+/g, '_')}`)
      .setDescription(`Popular in the last ${timeWindow}`)
  );

  const timeSelectMenu = new StringSelectMenuBuilder()
    .setCustomId('bf_audiobooks_time_select')
    .setPlaceholder('Select time window...')
    .addOptions(timeOptions);

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(timeSelectMenu);

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_audiobooks')
        .setLabel('← Back to Genres')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [selectRow, backRow]
  };
}

function createAudiobooksResultsScreen(
  results: MAMFlowResults,
  genre: CanonicalGenre,
  timeWindow: CanonicalTimeWindow
): { content: string, components: ActionRowBuilder<ButtonBuilder>[] } {
  if (results.items.length === 0) {
    return {
      content: `Sorry, I couldn't find any ${genre} audiobooks for ${timeWindow}. Try a different genre or time period.`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('bf_audiobooks_change_genre')
            .setLabel('Change Genre')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('bf_audiobooks_change_time')
            .setLabel('Change Time')
            .setStyle(ButtonStyle.Secondary)
        ])
      ]
    };
  }

  // Format exactly like title search using formatPaginatedResults pattern
  const startIndex = (results.currentPage - 1) * results.items.length;
  let content = `📚 **${genre} Audiobooks** (Popular ${timeWindow})\n`;
  content += `Showing ${startIndex + 1}-${startIndex + results.items.length} of ${results.totalItems} results (Page ${results.currentPage}/${results.totalPages}):\n\n`;
  
  // Format items exactly like title search using formatBook
  content += results.items
    .map((item, index) => formatBook(item.title, item.author, startIndex + index + 1))
    .join('\n');

  const hasNextPage = results.currentPage < results.totalPages;
  if (hasNextPage) {
    content += `\n\nSay "next" to see more results, or pick a number to download!`;
  } else {
    content += `\n\nPick a number to download!`;
  }

  // Create buttons that look identical to title search but use genre-specific handlers
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  
  // Numbered download buttons [1][2][3][4][5] - same visual style as title search
  const numberButtons: ButtonBuilder[] = [];
  for (let i = 0; i < Math.min(results.items.length, 5); i++) {
    const buttonNumber = startIndex + i + 1;
    numberButtons.push(
      new ButtonBuilder()
        .setCustomId(`bf_audiobooks_select_${i}`)
        .setLabel(`${buttonNumber}`)
        .setStyle(ButtonStyle.Primary)
    );
  }
  
  if (numberButtons.length > 0) {
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(numberButtons));
  }
  
  // Navigation buttons row - same style as title search
  const navButtons: ButtonBuilder[] = [];
  
  if (hasNextPage) {
    navButtons.push(
      new ButtonBuilder()
        .setCustomId('bf_audiobooks_next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
    );
  }
  
  navButtons.push(
    new ButtonBuilder()
      .setCustomId('bf_genre_more_info')
      .setLabel('📖 More Info')
      .setStyle(ButtonStyle.Secondary)
  );
  
  // Genre-specific navigation instead of "New Search"
  navButtons.push(
    new ButtonBuilder()
      .setCustomId('bf_audiobooks_change_genre')
      .setLabel('Change Genre')
      .setStyle(ButtonStyle.Secondary)
  );

  if (navButtons.length > 0) {
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(navButtons));
  }

  return {
    content,
    components
  };
}

function createAudiobooksConfirmationScreen(item: MAMFlowItem): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('📚 Confirm Selection')
    .setDescription(`**${item.title}**\nby ${item.author}`)
    .setColor(0x00D4AA);

  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_audiobooks_send_to_prowlarr')
        .setLabel('Send to Prowlarr')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📥'),
      new ButtonBuilder()
        .setCustomId('bf_audiobooks_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

  return {
    embeds: [embed],
    components: [buttonRow]
  };
}

async function createGenreSelectionScreen(): Promise<{ embeds: EmbedBuilder[], components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] }> {
  const embed = new EmbedBuilder()
    .setTitle('🎭 Browse by Genre')
    .setDescription('First, pick a genre you\'d like to explore.')
    .setColor(0x7C4DFF);

  try {
    logger.info({}, 'Starting to fetch genres from Mango');
    const genres = await listGenres();
    logger.info({ genreCount: genres.length, genres: genres.map(g => g.name) }, 'Fetched genres from Mango');
    
    // Check if we're using fallback genres (they'll have specific names)
    const isFallback = genres.some(g => g.id === 'fiction' && g.name === 'Fiction');
    
    if (genres.length === 0) {
      logger.warn({}, 'No genres returned from Mango');
      embed.setDescription('Sorry sugar, I couldn\'t fetch the genres right now. Please try again in a moment.');
      
      const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('bf_flow_more')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary)
        );
      
      return { embeds: [embed], components: [backRow] };
    }

    // Update description if using fallback
    if (isFallback) {
      embed.setDescription('🔄 Main service temporarily unavailable - showing popular genres.\nFirst, pick a genre you\'d like to explore.');
    }

    // Create select menu with up to 25 genres (Discord limit)
    const genreOptions = genres.slice(0, 25).map(genre => 
      new StringSelectMenuOptionBuilder()
        .setLabel(genre.name)
        .setValue(genre.id)
        .setDescription(`Browse ${genre.name} audiobooks`)
    );

    const genreSelect = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('bf_genre_select')
          .setPlaceholder('Choose a genre...')
          .addOptions(genreOptions)
          .setMinValues(1)
          .setMaxValues(1)
      );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bf_flow_more')
          .setLabel('Back')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('bf_flow_main')
          .setLabel('New Chat')
          .setStyle(ButtonStyle.Success)
      );

    return {
      embeds: [embed],
      components: [genreSelect, backRow]
    };
  } catch (error) {
    logger.error({ error }, 'Failed to create genre selection screen');
    embed.setDescription('Sorry darlin\', something went wrong loading the genres. Please try again later.');
    
    const backRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bf_flow_more')
          .setLabel('Back')
          .setStyle(ButtonStyle.Secondary)
      );
    
    return { embeds: [embed], components: [backRow] };
  }
}

function createTimeframeSelectionScreen(selectedGenre: string): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const embed = new EmbedBuilder()
    .setTitle('📅 Select Time Period')
    .setDescription(`Now pick a time window for **${selectedGenre}** audiobooks.`)
    .setColor(0x7C4DFF);

  const timeframes = listTimeframes();
  const timeframeLabels: Record<Timeframe, string> = {
    '1w': 'Past Week',
    '1m': 'Past Month', 
    '3m': 'Past 3 Months',
    '6m': 'Past 6 Months',
    '1y': 'Past Year',
    'all': 'All Time'
  };

  const timeframeRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      ...timeframes.slice(0, 4).map(timeframe =>
        new ButtonBuilder()
          .setCustomId(`bf_timeframe_${timeframe}`)
          .setLabel(timeframeLabels[timeframe])
          .setStyle(ButtonStyle.Primary)
      )
    );

  const timeframeRow2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      ...timeframes.slice(4).map(timeframe =>
        new ButtonBuilder()
          .setCustomId(`bf_timeframe_${timeframe}`)
          .setLabel(timeframeLabels[timeframe])
          .setStyle(ButtonStyle.Primary)
      )
    );

  const backRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_flow_browse_genres')
        .setLabel('Back to Genres')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('New Chat')
        .setStyle(ButtonStyle.Success)
    );

  return {
    embeds: [embed],
    components: [timeframeRow, timeframeRow2, backRow]
  };
}

function createGenreResultsScreen(
  results: MangoItem[], 
  genre: string, 
  timeframe: Timeframe, 
  page: number = 0
): { embeds: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[] } {
  const itemsPerPage = 5;
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, results.length);
  const pageItems = results.slice(startIndex, endIndex);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const timeframeLabels: Record<Timeframe, string> = {
    '1w': 'Past Week',
    '1m': 'Past Month', 
    '3m': 'Past 3 Months',
    '6m': 'Past 6 Months',
    '1y': 'Past Year',
    'all': 'All Time'
  };

  const embed = new EmbedBuilder()
    .setTitle(`📚 ${genre} • ${timeframeLabels[timeframe]}`)
    .setColor(0x7C4DFF);

  if (pageItems.length === 0) {
    embed.setDescription('Sorry sugar, I couldn\'t find any audiobooks for that combination. Try a different timeframe or genre.');
  } else {
    const description = pageItems.map((item, index) => {
      const itemNumber = startIndex + index + 1;
      return `**${itemNumber}.** **${item.title}** — ${item.author} · [Open](${item.url}) · (${item.genre} · ${timeframeLabels[item.timeframe]})`;
    }).join('\n\n');

    embed.setDescription(description);
    
    if (totalPages > 1) {
      embed.setFooter({ text: `Page ${page + 1} of ${totalPages} • ${results.length} total results` });
    } else {
      embed.setFooter({ text: `${results.length} results` });
    }
  }

  // Navigation and action buttons
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  // Pagination if needed (matching Prowlarr/Goodreads pattern)
  if (totalPages > 1) {
    const paginationRow = new ActionRowBuilder<ButtonBuilder>();
    
    if (page > 0) {
      paginationRow.addComponents(
        new ButtonBuilder()
          .setCustomId('bf_genre_prev')
          .setLabel('⬅️ Previous')
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    if (page < totalPages - 1) {
      paginationRow.addComponents(
        new ButtonBuilder()
          .setCustomId('bf_genre_next')
          .setLabel('Next ➡️')
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    // Add page indicator button (disabled)
    paginationRow.addComponents(
      new ButtonBuilder()
        .setCustomId('bf_genre_page_info')
        .setLabel(`Page ${page + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    
    if (paginationRow.components.length > 0) {
      components.push(paginationRow);
    }
  }

  // Queue buttons for individual items (matching Prowlarr/Goodreads pattern)
  if (pageItems.length > 0) {
    const queueRow = new ActionRowBuilder<ButtonBuilder>();
    pageItems.forEach((_, index) => {
      const itemNumber = startIndex + index + 1;
      queueRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`bf_queue_${itemNumber - 1}`) // 0-based index for the full results array
          .setLabel(`${itemNumber}`) // Just the number, like Prowlarr/Goodreads
          .setStyle(ButtonStyle.Primary) // Primary style like download buttons
      );
    });
    components.push(queueRow);
  }

  // Action buttons row (matching Prowlarr/Goodreads pattern)
  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  
  // More info button
  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId('bf_genre_more_info')
      .setLabel('📖 More Info')
      .setStyle(ButtonStyle.Secondary)
  );
  
  // MAM enrichment button  
  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId('bf_genre_enrich_mam')
      .setLabel('🔍 MAM Info')
      .setStyle(ButtonStyle.Secondary)
  );
  
  components.push(actionRow);

  // Navigation buttons (matching Prowlarr/Goodreads pattern)
  const navRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bf_genre_timeframe_back')
        .setLabel('⏮️ Change Timeframe')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_flow_browse_genres')
        .setLabel('🔄 Change Genre')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('bf_genre_share')
        .setLabel('📤 Share to Channel')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bf_flow_main')
        .setLabel('🆕 New Search')
        .setStyle(ButtonStyle.Success)
    );

  components.push(navRow);

  return {
    embeds: [embed],
    components
  };
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    if (interaction.commandName === 'genres') {
      const screen = createAudiobooksGenreScreen(0);
      await interaction.reply({
        embeds: screen.embeds,
        components: screen.components,
        ephemeral: !interaction.channel?.isDMBased()
      });
    } else {
      const screen = createMainScreen();
      await interaction.reply({
        embeds: screen.embeds,
        components: screen.components,
        ephemeral: !interaction.channel?.isDMBased()
      });
    }
  } catch (error) {
    logger.error({ error }, 'Failed to handle slash command');
  }
}

/**
 * Handle audiobooks navigation (next/prev/refresh)
 */
async function handleAudiobooksNavigation(
  interaction: ButtonInteraction,
  user: any,
  channelId: string | null,
  action: 'next' | 'prev' | 'refresh'
): Promise<void> {
  const session = getSession(channelId, user.id);
  
  if (!session.mamFlow?.selectedGenre || !session.mamFlow?.selectedTimeWindow) {
    await interaction.deferUpdate();
    const screen = createAudiobooksGenreScreen(0);
    await interaction.editReply({
      embeds: screen.embeds,
      components: screen.components
    });
    return;
  }

  await interaction.deferUpdate();

  try {
    let targetPage = session.mamFlow.currentPage;
    
    if (action === 'next') {
      targetPage = Math.min(session.mamFlow.currentPage + 1, session.mamFlow.totalPages);
    } else if (action === 'prev') {
      targetPage = Math.max(session.mamFlow.currentPage - 1, 1);
    } else {
      targetPage = session.mamFlow.currentPage;
    }

    // Get fresh results for the target page
    const results = await mamFlowManager.getMAMResults(
      session.mamFlow.selectedGenre,
      session.mamFlow.selectedTimeWindow,
      targetPage,
      interaction.guildId || 'dm',
      user.id
    );

    // Update session state
    session.mamFlow.currentPage = results.currentPage;
    session.mamFlow.totalPages = results.totalPages;
    session.mamFlow.currentResults = results.items;

    // Show updated results
    const screen = createAudiobooksResultsScreen(results, session.mamFlow.selectedGenre, session.mamFlow.selectedTimeWindow);
    await interaction.editReply({
      content: screen.content,
      components: screen.components
    });

  } catch (error) {
    logger.error({ error, action }, 'Failed to handle audiobooks navigation');
    await interaction.editReply({
      content: 'Sorry, something went wrong. Please try again.',
      embeds: [],
      components: []
    });
  }
}

async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  try {
    const { customId, user, channel } = interaction;
    const channelId = channel?.id || null;
    const session = getSession(channelId, user.id);

    // Reset nudges on any button press
    session.nudges = 0;

    switch (customId) {
      case 'bf_flow_main': {
        clearExpectation(channelId, user.id);
        const screen = createMainScreen();
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_flow_more': {
        const screen = createMoreOptionsScreen();
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_flow_more_back': {
        const screen = createMainScreen();
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_flow_other': {
        const screen = createOtherCommandsScreen();
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_flow_search_again': {
        clearExpectation(channelId, user.id);
        const screen = createMainScreen();
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_flow_done': {
        clearExpectation(channelId, user.id);
        const embed = new EmbedBuilder()
          .setTitle('👋 Thanks for using Book Fairy!')
          .setDescription('Feel free to start a new search anytime.')
          .setColor(0x4CAF50);

        const anchorRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('bf_flow_main')
              .setLabel('New Chat')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('bf_flow_other')
              .setLabel('Other Commands')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.update({
          embeds: [embed],
          components: [anchorRow]
        });
        break;
      }

      case 'bf_flow_search_title':
      case 'bf_flow_search_author':
      case 'bf_flow_search_describe':
      case 'bf_flow_search_series':
      case 'bf_flow_search_narrator':
      case 'bf_flow_search_genre':
      case 'bf_flow_filter_language':
      case 'bf_flow_filter_length': {
        const fieldMap: Record<string, Session['expecting']> = {
          'bf_flow_search_title': 'title',
          'bf_flow_search_author': 'author',
          'bf_flow_search_describe': 'description',
          'bf_flow_search_series': 'series',
          'bf_flow_search_narrator': 'narrator',
          'bf_flow_search_genre': 'genre',
          'bf_flow_filter_language': 'language',
          'bf_flow_filter_length': 'length'
        };

        const field = fieldMap[customId];
        if (field) {
          setExpectation(channelId, user.id, field);
          
          const embed = new EmbedBuilder()
            .setTitle('💬 Search Question')
            .setDescription(createPromptMessage(field))
            .setColor(0x7C4DFF)
            .setFooter({ text: 'Just type your answer in chat' });

          // Keep navigation buttons available
          const navRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('bf_flow_main')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('bf_flow_more_back')
                .setLabel('Back')
                .setStyle(ButtonStyle.Secondary)
            );

          await interaction.update({
            embeds: [embed],
            components: [navRow]
          });
        }
        break;
      }

      case 'bf_flow_source_library':
      case 'bf_flow_source_mam':
      case 'bf_flow_popular':
      case 'bf_flow_new':
      case 'bf_flow_surprise': {
        // These are quick actions that don't need input
        const commandMap: Record<string, string> = {
          'bf_flow_source_library': 'show me popular library books',
          'bf_flow_source_mam': 'show me popular MAM books',
          'bf_flow_popular': 'show me popular books',
          'bf_flow_new': 'show me new releases',
          'bf_flow_surprise': 'surprise me with a good book'
        };

        const command = commandMap[customId];
        if (command) {
          setProcessingState(channelId, user.id);
          
          // Send acknowledgment
          const ackMessage = 'Processing your request...';
          
          await interaction.reply({ content: ackMessage, ephemeral: true });

          // Dispatch to pipeline
          await dispatchUserQuery({
            userId: user.id,
            username: user.username,
            channelId: channelId || 'dm',
            text: command,
            source: 'quick_actions'
          });

          // Show search again prompt after a delay
          setTimeout(async () => {
            setCompletedState(channelId, user.id);
            const screen = createSearchAgainPrompt();
            if (channel?.isDMBased()) {
              await interaction.followUp({
                embeds: screen.embeds,
                components: screen.components
              });
            } else {
              await interaction.editReply({
                content: '',
                embeds: screen.embeds,
                components: screen.components
              });
            }
          }, 3000); // Give time for the search results to appear
        }
        break;
      }

      case 'bf_flow_audiobooks': {
        // Entry point for MAM flow
        await interaction.deferUpdate();
        
        try {
          const screen = createAudiobooksGenreScreen(0); // Start at page 0
          await interaction.editReply({
            embeds: screen.embeds,
            components: screen.components
          });
        } catch (error) {
          logger.error({ error }, 'Failed to show audiobooks genre selection');
          await interaction.editReply({
            content: 'Sorry, something went wrong loading the audiobook genres. Please try again later.',
            embeds: [],
            components: []
          });
        }
        break;
      }

      case 'bf_flow_browse_genres': {
        // Use canonical MAM genres with pagination
        await interaction.deferUpdate();
        
        try {
          const screen = createAudiobooksGenreScreen(0); // Start at page 0
          await interaction.editReply({
            embeds: screen.embeds,
            components: screen.components
          });
        } catch (error) {
          logger.error({ error }, 'Failed to show MAM genre selection');
          await interaction.editReply({
            content: 'Sorry darlin\', something went wrong loading the genres. Please try again later.'
          });
        }
        break;
      }

      case 'bf_genre_timeframe_back': {
        const session = getSession(channelId, user.id);
        if (session.genreBrowsing?.selectedGenre) {
          const screen = createTimeframeSelectionScreen(session.genreBrowsing.selectedGenre);
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
        } else {
          // Fallback to audiobooks genre selection
          const screen = createAudiobooksGenreScreen(0);
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
        }
        break;
      }

      case 'bf_genre_page_info': {
        // This button is disabled, but we need a handler for completeness
        await interaction.reply({ 
          content: 'This is just a page indicator.',
          ephemeral: true 
        });
        break;
      }

      case 'bf_genre_prev': {
        const session = getSession(channelId, user.id);
        if (session.genreBrowsing?.currentResults && session.genreBrowsing.selectedGenre && session.genreBrowsing.selectedTimeframe) {
          const currentPage = session.genreBrowsing.currentPage || 0;
          const newPage = Math.max(0, currentPage - 1);
          session.genreBrowsing.currentPage = newPage;
          
          const screen = createGenreResultsScreen(
            session.genreBrowsing.currentResults,
            session.genreBrowsing.selectedGenre,
            session.genreBrowsing.selectedTimeframe,
            newPage
          );
          
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
        }
        break;
      }

      case 'bf_genre_next': {
        const session = getSession(channelId, user.id);
        if (session.genreBrowsing?.currentResults && session.genreBrowsing.selectedGenre && session.genreBrowsing.selectedTimeframe) {
          const currentPage = session.genreBrowsing.currentPage || 0;
          const totalPages = Math.ceil(session.genreBrowsing.currentResults.length / 5);
          const newPage = Math.min(totalPages - 1, currentPage + 1);
          session.genreBrowsing.currentPage = newPage;
          
          const screen = createGenreResultsScreen(
            session.genreBrowsing.currentResults,
            session.genreBrowsing.selectedGenre,
            session.genreBrowsing.selectedTimeframe,
            newPage
          );
          
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
        }
        break;
      }

      case 'bf_genre_more_info': {
        const session = getSession(channelId, user.id);
        if (!session.genreBrowsing?.currentResults) {
          await interaction.reply({ 
            content: 'No results available for more info.',
            ephemeral: true 
          });
          break;
        }

        // Show detailed info about current results, similar to Goodreads pattern
        const results = session.genreBrowsing.currentResults;
        const currentPage = session.genreBrowsing.currentPage || 0;
        const itemsPerPage = 5;
        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, results.length);
        const pageItems = results.slice(startIndex, endIndex);

        const embed = new EmbedBuilder()
          .setTitle('📖 Detailed Information')
          .setDescription(`Showing details for ${session.genreBrowsing.selectedGenre} • ${session.genreBrowsing.selectedTimeframe}`)
          .setColor(0x7C4DFF);

        const detailedInfo = pageItems.map((item, index) => {
          const itemNumber = startIndex + index + 1;
          return `**${itemNumber}.** **${item.title}**\n` +
                 `   **Author:** ${item.author}\n` +
                 `   **Genre:** ${item.genre}\n` +
                 `   **URL:** [Open on Mango](${item.url})\n` +
                 `   **Period:** ${item.timeframe}`;
        }).join('\n\n');

        embed.setDescription(detailedInfo);

        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
        break;
      }

      case 'bf_genre_enrich_mam': {
        const session = getSession(channelId, user.id);
        if (!session.genreBrowsing?.currentResults) {
          await interaction.reply({ 
            content: 'No results available for MAM enrichment.',
            ephemeral: true 
          });
          break;
        }

        try {
          await interaction.reply({ 
            content: '🔍 Enriching results with MAM data...', 
            ephemeral: true 
          });

          const results = session.genreBrowsing.currentResults;
          const currentPage = session.genreBrowsing.currentPage || 0;
          const itemsPerPage = 5;
          const startIndex = currentPage * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, results.length);
          const pageItems = results.slice(startIndex, endIndex);

          const enrichedInfos = await Promise.all(
            pageItems.map(async (item, index) => {
              try {
                const mamCandidates = await searchMamCandidates(item);
                const itemNumber = startIndex + index + 1;
                return {
                  number: itemNumber,
                  title: item.title,
                  author: item.author,
                  mamCount: mamCandidates.length,
                  mamResults: mamCandidates.slice(0, 3) // Show top 3 MAM results
                };
              } catch (error) {
                logger.error({ error, item: item.title }, 'Failed to enrich with MAM');
                return {
                  number: startIndex + index + 1,
                  title: item.title,
                  author: item.author,
                  mamCount: 0,
                  mamResults: []
                };
              }
            })
          );

          const embed = new EmbedBuilder()
            .setTitle('🔍 MAM Enrichment Results')
            .setColor(0x7C4DFF);

          const enrichedText = enrichedInfos.map(info => {
            let result = `**${info.number}.** **${info.title}** by ${info.author}\n`;
            if (info.mamCount > 0) {
              result += `   **MAM Results:** ${info.mamCount} found\n`;
              if (info.mamResults.length > 0) {
                const topResult = info.mamResults[0];
                result += `   **Top Match:** ${topResult.title} (${topResult.size || 'Unknown size'})`;
              }
            } else {
              result += `   **MAM Results:** No matches found`;
            }
            return result;
          }).join('\n\n');

          embed.setDescription(enrichedText);

          await interaction.editReply({
            content: '',
            embeds: [embed]
          });

        } catch (error) {
          logger.error({ error }, 'Failed to enrich results with MAM');
          await interaction.editReply({
            content: 'Sorry, failed to enrich results with MAM data. Please try again later.'
          });
        }
        break;
      }

      case 'bf_genre_share': {
        const session = getSession(channelId, user.id);
        if (session.genreBrowsing?.currentResults && session.genreBrowsing.selectedGenre && session.genreBrowsing.selectedTimeframe) {
          const currentPage = session.genreBrowsing.currentPage || 0;
          const screen = createGenreResultsScreen(
            session.genreBrowsing.currentResults,
            session.genreBrowsing.selectedGenre,
            session.genreBrowsing.selectedTimeframe,
            currentPage
          );
          
          // Send as a public message
          await interaction.reply({
            embeds: screen.embeds,
            components: screen.components,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: 'No results to share right now.',
            ephemeral: true
          });
        }
        break;
      }

      case 'bf_flow_check_status': {
        setExpectation(channelId, user.id, 'request_id');
        
        const embed = new EmbedBuilder()
          .setTitle('📋 Check Status')
          .setDescription('What request ID do you want to check?')
          .setColor(0x7C4DFF)
          .setFooter({ text: 'Just type the request ID in chat' });

        // Keep navigation buttons available
        const navRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('bf_flow_main')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('bf_flow_other')
              .setLabel('Back')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.update({
          embeds: [embed],
          components: [navRow]
        });
        break;
      }

      case 'bf_flow_help': {
        const helpEmbed = new EmbedBuilder()
          .setTitle('📖 Help')
          .setDescription('Use the buttons to search for books. You can search by title, author, description, or use the advanced options. When prompted, just type your answer in the chat.')
          .setColor(0x7C4DFF);

        const screen = createMainScreen();
        await interaction.update({
          embeds: [helpEmbed, ...screen.embeds],
          components: screen.components
        });
        break;
      }

      // Timeframe selection handlers
      default: {
        // Handle timeframe selection buttons - redirect to new MAM flow
        if (customId.startsWith('bf_timeframe_')) {
          await interaction.update({
            content: '🔄 Redirecting to the new audiobooks interface...'
          });
          
          setTimeout(async () => {
            const screen = createAudiobooksGenreScreen(0);
            await interaction.editReply({
              content: null,
              embeds: screen.embeds,
              components: screen.components
            });
          }, 1000);
          break;
        }
        
        // Handle queue buttons - redirect to new MAM flow
        if (customId.startsWith('bf_queue_')) {
          await interaction.reply({
            content: '🔄 Please use the new audiobooks interface! Click the "📚 Audiobooks" button to get started with the updated flow that sends items to Prowlarr.',
            ephemeral: true
          });
          break;
        }

        // Handle genre page navigation
        if (customId.startsWith('bf_genre_page_')) {
          const page = parseInt(customId.replace('bf_genre_page_', ''));
          await interaction.deferUpdate();
          
          try {
            const screen = createAudiobooksGenreScreen(page);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
          } catch (error) {
            logger.error({ error, page }, 'Failed to show genre page');
            await interaction.editReply({
              content: 'Sorry, something went wrong changing pages. Please try again.',
              embeds: [],
              components: []
            });
          }
          break;
        }

        // MAM Flow Handlers
        if (customId.startsWith('bf_audiobooks_select_')) {
          const itemIndex = parseInt(customId.replace('bf_audiobooks_select_', ''));
          const session = getSession(channelId, user.id);
          
          if (!session.mamFlow?.currentResults || !session.mamFlow.currentResults[itemIndex]) {
            await interaction.reply({ 
              content: 'Sorry, that item is no longer available.',
              ephemeral: true 
            });
            break;
          }
          
          const item = session.mamFlow.currentResults[itemIndex];
          session.mamFlow.currentItem = item;
          
          await interaction.deferUpdate();
          
          try {
            const screen = createAudiobooksConfirmationScreen(item);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
          } catch (error) {
            logger.error({ error }, 'Failed to show audiobooks confirmation');
            await interaction.editReply({
              content: 'Sorry, something went wrong. Please try again.',
              embeds: [],
              components: []
            });
          }
          break;
        }

        if (customId === 'bf_audiobooks_next') {
          await handleAudiobooksNavigation(interaction, user, channelId, 'next');
          break;
        }

        if (customId === 'bf_audiobooks_prev') {
          await handleAudiobooksNavigation(interaction, user, channelId, 'prev');
          break;
        }

        if (customId === 'bf_audiobooks_change_genre') {
          await interaction.deferUpdate();
          const screen = createAudiobooksGenreScreen(0);
          await interaction.editReply({
            embeds: screen.embeds,
            components: screen.components
          });
          // Clear MAM flow state
          const session = getSession(channelId, user.id);
          session.mamFlow = undefined;
          break;
        }

        if (customId === 'bf_audiobooks_change_time') {
          const session = getSession(channelId, user.id);
          if (!session.mamFlow?.selectedGenre) {
            await interaction.deferUpdate();
            const screen = createAudiobooksGenreScreen(0);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
            break;
          }
          
          await interaction.deferUpdate();
          const screen = createAudiobooksTimeWindowScreen(session.mamFlow.selectedGenre);
          await interaction.editReply({
            embeds: screen.embeds,
            components: screen.components
          });
          break;
        }

        if (customId === 'bf_audiobooks_send_to_prowlarr') {
          const session = getSession(channelId, user.id);
          if (!session.mamFlow?.currentItem) {
            await interaction.reply({ 
              content: 'No item selected.',
              ephemeral: true 
            });
            break;
          }

          await interaction.deferUpdate();
          
          try {
            await interaction.editReply({
              content: '🔄 Getting download metadata and sending to Prowlarr...',
              embeds: [],
              components: []
            });

            // Get download metadata
            const itemWithMetadata = await mamFlowManager.getDownloadMetadata(session.mamFlow.currentItem);
            
            // Send to Prowlarr
            const result = await prowlarrRelay.relayToDownload(itemWithMetadata);
            
            if (result.success) {
              const successRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('bf_audiobooks_pick_another')
                    .setLabel('Pick Another')
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId('bf_audiobooks_change_genre')
                    .setLabel('Change Genre')
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('bf_audiobooks_change_time')
                    .setLabel('Change Time')
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('bf_flow_main')
                    .setLabel('Done')
                    .setStyle(ButtonStyle.Success)
                );

              await interaction.editReply({
                content: `✅ Successfully sent "${result.title}" by ${result.author} to Prowlarr!`,
                components: [successRow]
              });
            } else {
              const errorRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('bf_audiobooks_pick_another')
                    .setLabel('Pick Another')
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId('bf_audiobooks_change_genre')
                    .setLabel('Change Genre')
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('bf_flow_main')
                    .setLabel('Done')
                    .setStyle(ButtonStyle.Success)
                );

              await interaction.editReply({
                content: `❌ ${result.message}`,
                components: [errorRow]
              });
            }
          } catch (error) {
            logger.error({ error }, 'Failed to send audiobook to Prowlarr');
            await interaction.editReply({
              content: `❌ Failed to send to Prowlarr: ${error instanceof Error ? error.message : 'Unknown error'}`,
              components: []
            });
          }
          break;
        }

        if (customId === 'bf_audiobooks_pick_another') {
          const session = getSession(channelId, user.id);
          if (!session.mamFlow?.selectedGenre || !session.mamFlow?.selectedTimeWindow) {
            await interaction.deferUpdate();
            const screen = createAudiobooksGenreScreen(0);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
            break;
          }

          await handleAudiobooksNavigation(interaction, user, channelId, 'refresh');
          break;
        }

        if (customId === 'bf_audiobooks_cancel') {
          const session = getSession(channelId, user.id);
          if (!session.mamFlow?.selectedGenre || !session.mamFlow?.selectedTimeWindow) {
            await interaction.deferUpdate();
            const screen = createAudiobooksGenreScreen(0);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
            break;
          }

          await handleAudiobooksNavigation(interaction, user, channelId, 'refresh');
          break;
        }
        
        // Unknown button
        logger.warn({ customId }, 'Unknown button interaction');
        break;
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to handle button interaction');
  }
}

async function handleMessage(message: Message, client: Client): Promise<boolean> {
  if (message.author.bot) return false;
  
  const channelId = message.channel.id;
  const userId = message.author.id;
  const session = getSession(channelId, userId);

  // Check if we're expecting input and it's still valid
  if (isExpectationValid(session) && session.expecting) {
    const value = message.content.trim();
    const field = session.expecting;
    
    // Generate the command
    const command = normalizeCommand(field, value);
    
    // Set processing state
    setProcessingState(channelId, userId);
    
    // Send "hold on, searching" message
    const searchVerb = field === 'request_id' ? 'checking status for' : 'searching for';
    const ackMessage = message.channel.isDMBased() ? 
      `Got it! Hold on while I go ${searchVerb} "${value}"...` : 
      `Hold on while I ${searchVerb.replace('go ', '')} "${value}"...`;
    
    const ackReply = await message.reply(ackMessage);
    
    // Dispatch to pipeline
    await dispatchUserQuery({
      userId: message.author.id,
      username: message.author.username,
      channelId: channelId,
      text: command,
      source: 'quick_actions'
    });
    
    // Clear expectation and show search again prompt after delay
    setTimeout(async () => {
      clearExpectation(channelId, userId);
      setCompletedState(channelId, userId);
      
      const screen = createSearchAgainPrompt();
      if (message.channel.isDMBased()) {
        if ('send' in message.channel) {
          await message.channel.send({
            embeds: screen.embeds,
            components: screen.components
          });
        }
      } else {
        await ackReply.edit({
          content: '',
          embeds: screen.embeds,
          components: screen.components
        });
      }
    }, 3000); // Give time for search results to appear
    
    return true; // Handled by quick actions
  }

  // Handle custom text input (not during expected input flow)
  if (isCustomTextInput(message.content)) {
    // This is a custom search query - send immediate feedback
    const ackMessage = 'Please wait. I\'m searching for that book...';
    await message.reply(ackMessage);
    
    // Set processing state
    setProcessingState(channelId, userId);
    
    // Return false to let the main message handler process the full search
    return false;
  }

  // For DMs, check if we should show the menu for simple greetings/commands
  if (message.channel.isDMBased()) {
    const content = message.content.toLowerCase().trim();
    
    // Skip if it's a number (book selection) or simple response
    if (/^\d+$/.test(message.content.trim()) || 
        /^(yes|yeah|sure|ok|okay|yep|y|no|nope|n)$/i.test(content)) {
      return false; // Let main handler process these
    }
    
    // Show menu for simple greetings or unclear input
    const greetings = ['hi', 'hello', 'hey', 'help', 'menu', 'start'];
    const isGreeting = greetings.some(greeting => content.includes(greeting));
    
    if (isGreeting || content.length < 4) {
      const screen = createMainScreen();
      await message.reply({
        content: "Hey there, sugar! Let me help you find some books.",
        embeds: screen.embeds,
        components: screen.components
      });
      return true; // Handled by quick actions
    }
  }

  // User typed without expecting and it's not a custom search - send nudge
  session.nudges++;
  
  let nudgeMessage: string;
  if (session.nudges >= 3) {
    nudgeMessage = `Sweetheart, go on and tap one of the buttons I showed you. If it keeps fussing, I might be having a spell. Please reach out to ${OPS_CONTACT}.`;
  } else {
    const randomNudge = NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
    nudgeMessage = randomNudge;
  }
  
  // Send nudge and show main screen
  const screen = createMainScreen();
  await message.reply({
    content: nudgeMessage,
    embeds: screen.embeds,
    components: screen.components
  });
  
  return true; // Handled by quick actions
}

async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction): Promise<void> {
  try {
    const { customId, user, channel, values } = interaction;
    const channelId = channel?.id || null;
    const session = getSession(channelId, user.id);

    // Reset nudges on any interaction
    session.nudges = 0;

    switch (customId) {
      case 'bf_genre_select': {
        // Redirect to new MAM flow
        await interaction.update({
          content: '🔄 Redirecting to the new audiobooks interface...'
        });
        
        setTimeout(async () => {
          const screen = createAudiobooksGenreScreen(0);
          await interaction.editReply({
            content: null,
            embeds: screen.embeds,
            components: screen.components
          });
        }, 1000);
        break;
      }

      case 'bf_audiobooks_genre_select': {
        const selectedGenreValue = values[0];
        
        // Extract the genre name from the value
        if (!selectedGenreValue.startsWith('mam_genre_')) {
          await interaction.reply({
            content: 'Sorry, invalid genre selection.',
            ephemeral: true
          });
          break;
        }
        
        const genreName = selectedGenreValue.replace('mam_genre_', '').replace(/_/g, ' ');
        
        // Find the canonical genre that matches (case-insensitive, handle special chars)
        const canonicalGenre = CANONICAL_GENRES.find(g => 
          g.toLowerCase().replace(/[\s\/]+/g, '_') === selectedGenreValue.replace('mam_genre_', '')
        ) as CanonicalGenre;

        if (!canonicalGenre) {
          await interaction.reply({
            content: `Sorry, invalid genre selection: "${genreName}". Please try again.`,
            ephemeral: true
          });
          break;
        }

        // Initialize MAM flow state
        if (!session.mamFlow) {
          session.mamFlow = {
            currentPage: 1,
            totalPages: 1,
            currentResults: []
          };
        }
        session.mamFlow.selectedGenre = canonicalGenre;

        // Show time window selection
        const screen = createAudiobooksTimeWindowScreen(canonicalGenre);
        await interaction.update({
          embeds: screen.embeds,
          components: screen.components
        });
        break;
      }

      case 'bf_audiobooks_time_select': {
        const selectedTimeValue = values[0];
        const timeWindow = selectedTimeValue.replace('mam_time_', '').replace(/_/g, ' ') as CanonicalTimeWindow;

        if (!session.mamFlow?.selectedGenre) {
          await interaction.reply({
            content: 'Please select a genre first.',
            ephemeral: true
          });
          break;
        }

        session.mamFlow.selectedTimeWindow = timeWindow;

        await interaction.deferUpdate();

        try {
          // Get MAM results
          const results = await mamFlowManager.getMAMResults(
            session.mamFlow.selectedGenre,
            timeWindow,
            1, // Start with page 1
            interaction.guildId || 'dm',
            user.id
          );

          // Update session state
          session.mamFlow.currentPage = results.currentPage;
          session.mamFlow.totalPages = results.totalPages;
          session.mamFlow.currentResults = results.items;

          // Show results
          const screen = createAudiobooksResultsScreen(results, session.mamFlow.selectedGenre, timeWindow);
          await interaction.editReply({
            content: screen.content,
            components: screen.components
          });

        } catch (error) {
          logger.error({ error }, 'Failed to get MAM results');
          
          if (error instanceof Error && error.message.includes('Rate limit')) {
            await interaction.editReply({
              content: '⏱️ Rate limit exceeded. Please wait a moment before trying again.',
              embeds: [],
              components: []
            });
          } else {
            await interaction.editReply({
              content: 'Sorry, something went wrong getting the audiobooks. Please try again later.',
              embeds: [],
              components: []
            });
          }
        }
        break;
      }

      default: {
        logger.warn({ customId }, 'Unknown select menu interaction');
        await interaction.reply({ 
          content: 'Sorry, I didn\'t understand that selection.',
          ephemeral: true 
        });
        break;
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to handle select menu interaction');
  }
}

export function installQuickActions(client: Client): void {
  // Handle slash commands
  client.on('interactionCreate', async (interaction) => {
    try {
      logger.info({ type: interaction.type, customId: 'customId' in interaction ? interaction.customId : 'N/A' }, 'Received interaction');
      
      if (interaction.type === InteractionType.ApplicationCommand) {
        const chatInputInteraction = interaction as ChatInputCommandInteraction;
        logger.info({ commandName: chatInputInteraction.commandName }, 'Received slash command');
        if (chatInputInteraction.commandName === 'menu' || chatInputInteraction.commandName === 'genres') {
          await handleSlashCommand(chatInputInteraction);
        }
      } else if (interaction.type === InteractionType.MessageComponent) {
        if (interaction.isButton()) {
          const buttonInteraction = interaction as ButtonInteraction;
          logger.info({ customId: buttonInteraction.customId }, 'Received button interaction');
          if (buttonInteraction.customId.startsWith('bf_')) {
            await handleButtonInteraction(buttonInteraction);
          }
        } else if (interaction.isStringSelectMenu()) {
          const selectInteraction = interaction as StringSelectMenuInteraction;
          logger.info({ customId: selectInteraction.customId }, 'Received select menu interaction');
          if (selectInteraction.customId.startsWith('bf_')) {
            await handleSelectMenuInteraction(selectInteraction);
          }
        }
      }
    } catch (error) {
      logger.error({ error }, 'Failed to handle interaction');
    }
  });

  logger.info('Quick actions system installed');
}

/**
 * Fallback to the existing search pipeline when direct MAM download fails
 */
async function fallbackToSearchPipeline(
  item: MangoItem, 
  user: any, 
  channelId: string, 
  interaction: ButtonInteraction
): Promise<void> {
  try {
    // Create a search query for the existing pipeline
    const query = `find audiobook "${item.title}" by ${item.author}`;
    
    // Dispatch to existing BookFairy pipeline (same as Prowlarr flow)
    await dispatchUserQuery({
      userId: user.id,
      username: user.username,
      channelId: channelId || 'dm',
      text: query,
      source: 'genre_browser'
    });
    
    // Success feedback
    await interaction.editReply({ 
      content: `✅ Queued "${item.title}" for search through Prowlarr!\n` +
              `🔍 The bot will search for it and download if found.`
    });
    
    logger.info({ 
      title: item.title, 
      author: item.author, 
      userId: user.id 
    }, 'Queued item from genre browser via search pipeline');
    
  } catch (error) {
    logger.error({ error, item: item.title }, 'Failed to queue item via search pipeline');
    throw error; // Re-throw to be handled by the caller
  }
}

// Export functions for use by message handler
export { createGenreSelectionScreen };

// Export the message handler for integration with main bot
export { handleMessage as handleQuickActionMessage };
