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
  InteractionType
} from 'discord.js';
import { logger } from '../utils/logger';
import { dispatchUserQuery } from '../bridge/dispatch';

interface Session {
  expecting?: 'title' | 'author' | 'description' | 'series' | 'narrator' | 'genre' | 'language' | 'length' | 'request_id';
  nudges: number;
  expiresAt?: Date;
  currentFlow?: 'awaiting_input' | 'processing' | 'showing_results' | 'completed';
  lastSearchResults?: any;
  lastQuery?: string;
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
    components: [searchRow, anchorRow]
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

async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const screen = createMainScreen();
    await interaction.reply({
      embeds: screen.embeds,
      components: screen.components,
      ephemeral: !interaction.channel?.isDMBased()
    });
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

export function installQuickActions(client: Client): void {
  // Handle slash commands
  client.on('interactionCreate', async (interaction) => {
    try {
      logger.info({ type: interaction.type, customId: 'customId' in interaction ? interaction.customId : 'N/A' }, 'Received interaction');
      
      if (interaction.type === InteractionType.ApplicationCommand) {
        const chatInputInteraction = interaction as ChatInputCommandInteraction;
        logger.info({ commandName: chatInputInteraction.commandName }, 'Received slash command');
        if (chatInputInteraction.commandName === 'menu') {
          await handleSlashCommand(chatInputInteraction);
        }
      } else if (interaction.type === InteractionType.MessageComponent) {
        const buttonInteraction = interaction as ButtonInteraction;
        logger.info({ customId: buttonInteraction.customId }, 'Received button interaction');
        if (buttonInteraction.customId.startsWith('bf_flow_')) {
          await handleButtonInteraction(buttonInteraction);
        }
      }
    } catch (error) {
      logger.error({ error }, 'Failed to handle interaction');
    }
  });

  logger.info('Quick actions system installed');
}

// Export the message handler for integration with main bot
export { handleMessage as handleQuickActionMessage };
