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

function getSession(channelId: string | null, userId: string): Session {
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
    components: [searchRow, moreRow, anchorRow]
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

// Genre browsing UI components
async function createGenreSelectionScreen(): Promise<{ embeds: EmbedBuilder[], components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] }> {
  const embed = new EmbedBuilder()
    .setTitle('🎭 Browse by Genre')
    .setDescription('First, pick a genre you\'d like to explore.')
    .setColor(0x7C4DFF);

  try {
    const genres = await listGenres();
    
    if (genres.length === 0) {
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
      const screen = await createGenreSelectionScreen();
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

      case 'bf_flow_browse_genres': {
        try {
          const screen = await createGenreSelectionScreen();
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
        } catch (error) {
          logger.error({ error }, 'Failed to show genre selection');
          await interaction.reply({ 
            content: 'Sorry darlin\', something went wrong loading the genres. Please try again later.',
            ephemeral: true 
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
          // Fallback to genre selection
          const screen = await createGenreSelectionScreen();
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
        // Handle timeframe selection buttons
        if (customId.startsWith('bf_timeframe_')) {
          const timeframe = customId.replace('bf_timeframe_', '') as Timeframe;
          const session = getSession(channelId, user.id);
          
          if (!session.genreBrowsing?.selectedGenre) {
            await interaction.reply({ 
              content: 'Sorry, something went wrong. Please start over.',
              ephemeral: true 
            });
            break;
          }
          
          try {
            // Store timeframe selection
            session.genreBrowsing.selectedTimeframe = timeframe;
            session.genreBrowsing.currentPage = 0;
            
            // Show loading message
            await interaction.update({
              embeds: [new EmbedBuilder()
                .setTitle('⏳ Loading Results...')
                .setDescription('Hold on sugar, I\'m fetching those audiobooks for you...')
                .setColor(0x7C4DFF)],
              components: []
            });
            
            // Fetch results
            const results = await getTopByGenre(session.genreBrowsing.selectedGenre, timeframe, 25);
            session.genreBrowsing.currentResults = results;
            
            // Show results
            const screen = createGenreResultsScreen(results, session.genreBrowsing.selectedGenre, timeframe, 0);
            await interaction.editReply({
              embeds: screen.embeds,
              components: screen.components
            });
            
          } catch (error) {
            logger.error({ error, genre: session.genreBrowsing.selectedGenre, timeframe }, 'Failed to fetch genre results');
            await interaction.editReply({
              embeds: [new EmbedBuilder()
                .setTitle('❌ Oops!')
                .setDescription('Sorry darlin\', I couldn\'t fetch those results right now. Please try again in a moment.')
                .setColor(0xFF0000)],
              components: [new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('bf_flow_browse_genres')
                    .setLabel('Try Again')
                    .setStyle(ButtonStyle.Primary)
                )]
            });
          }
          break;
        }
        
        // Handle queue buttons (matching Prowlarr/Goodreads download pattern)
        if (customId.startsWith('bf_queue_')) {
          const itemIndex = parseInt(customId.replace('bf_queue_', ''));
          const session = getSession(channelId, user.id);
          
          if (!session.genreBrowsing?.currentResults || !session.genreBrowsing.currentResults[itemIndex]) {
            await interaction.reply({ 
              content: 'Sorry, that item is no longer available.',
              ephemeral: true 
            });
            break;
          }
          
          const item = session.genreBrowsing.currentResults[itemIndex];
          
          try {
            // Immediate feedback (like Prowlarr download buttons)
            await interaction.reply({ 
              content: `🔄 Starting download for "${item.title}" by ${item.author}...`,
              ephemeral: true 
            });
            
            // Try to enrich with MAM candidates first
            const mamCandidates = await searchMamCandidates(item);
            
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
            const successMessage = mamCandidates.length > 0 
              ? `✅ Queued "${item.title}" with ${mamCandidates.length} MAM candidates found!`
              : `✅ Queued "${item.title}" for download!`;
              
            await interaction.editReply({ 
              content: successMessage 
            });
            
            logger.info({ 
              title: item.title, 
              author: item.author, 
              mamCandidates: mamCandidates.length,
              userId: user.id 
            }, 'Queued item from genre browser');
            
          } catch (error) {
            logger.error({ error, item: item.title }, 'Failed to queue item from genre browser');
            await interaction.editReply({ 
              content: `❌ Failed to queue "${item.title}". Please try searching for it manually.`
            });
          }
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
        const selectedGenreId = values[0];
        
        try {
          // Get genre name for display
          const genres = await listGenres();
          const selectedGenre = genres.find(g => g.id === selectedGenreId);
          const genreName = selectedGenre?.name || selectedGenreId;
          
          // Store genre selection in session
          if (!session.genreBrowsing) {
            session.genreBrowsing = {};
          }
          session.genreBrowsing.selectedGenre = genreName;
          
          // Show timeframe selection
          const screen = createTimeframeSelectionScreen(genreName);
          await interaction.update({
            embeds: screen.embeds,
            components: screen.components
          });
          
        } catch (error) {
          logger.error({ error }, 'Failed to handle genre selection');
          await interaction.reply({ 
            content: 'Sorry darlin\', something went wrong. Please try again.',
            ephemeral: true 
          });
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

// Export functions for use by message handler
export { createGenreSelectionScreen };

// Export the message handler for integration with main bot
export { handleMessage as handleQuickActionMessage };
