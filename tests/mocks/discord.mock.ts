import { vi } from 'vitest';
import { ButtonStyle, ComponentType } from 'discord.js';

// Mock Discord message object
export const createMockMessage = (content: string, isBot = false, mentioned = true) => {
  return {
    id: 'mock-message-id',
    content,
    author: {
      id: isBot ? 'bot-user-id' : 'user-123',
      bot: isBot,
      username: isBot ? 'TestBot' : 'TestUser',
      tag: isBot ? 'TestBot#0000' : 'TestUser#1234'
    },
    mentions: {
      has: vi.fn().mockReturnValue(mentioned),
      users: new Map(),
      roles: new Map(),
      channels: new Map(),
      members: new Map()
    },
    channel: {
      id: 'channel-123',
      isDMBased: vi.fn().mockReturnValue(false),
      send: vi.fn().mockResolvedValue({}),
      type: 0 // GUILD_TEXT
    },
    guild: {
      id: 'guild-123',
      name: 'Test Guild'
    },
    client: {
      user: {
        id: 'bot-user-id',
        bot: true,
        username: 'BookFairy',
        tag: 'BookFairy#0000'
      }
    },
    reply: vi.fn().mockResolvedValue({}),
    react: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    edit: vi.fn().mockResolvedValue({}),
    pin: vi.fn().mockResolvedValue({}),
    unpin: vi.fn().mockResolvedValue({}),
    createdAt: new Date(),
    createdTimestamp: Date.now(),
    editedAt: null,
    editedTimestamp: null,
    system: false,
    pinned: false,
    tts: false,
    nonce: null,
    embeds: [],
    attachments: new Map(),
    stickers: new Map(),
    components: [],
    reactions: new Map(),
    webhookId: null,
    groupActivityApplication: null,
    applicationId: null,
    activity: null,
    flags: { bitfield: 0 },
    reference: null,
    interaction: null
  };
};

// Mock Discord button interaction
export const createMockButtonInteraction = (customId: string, userId = 'user-123') => {
  return {
    id: 'interaction-123',
    applicationId: 'app-123',
    type: 3, // MESSAGE_COMPONENT
    guildId: 'guild-123',
    channelId: 'channel-123',
    user: {
      id: userId,
      bot: false,
      username: 'TestUser',
      tag: 'TestUser#1234'
    },
    member: {
      user: {
        id: userId,
        bot: false,
        username: 'TestUser',
        tag: 'TestUser#1234'
      }
    },
    token: 'interaction-token',
    version: 1,
    message: {
      id: 'message-123',
      content: 'Test message',
      components: []
    },
    customId,
    componentType: ComponentType.Button,
    deferred: false,
    replied: false,
    ephemeral: false,
    webhook: {
      id: 'webhook-123'
    },
    reply: vi.fn().mockResolvedValue({}),
    followUp: vi.fn().mockResolvedValue({}),
    deferReply: vi.fn().mockResolvedValue({}),
    editReply: vi.fn().mockResolvedValue({}),
    deleteReply: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    deferUpdate: vi.fn().mockResolvedValue({}),
    showModal: vi.fn().mockResolvedValue({}),
    awaitModalSubmit: vi.fn().mockResolvedValue({}),
    createdAt: new Date(),
    createdTimestamp: Date.now(),
    isButton: () => true,
    isSelectMenu: () => false,
    isModalSubmit: () => false,
    isAutocomplete: () => false,
    isChatInputCommand: () => false,
    isContextMenuCommand: () => false,
    isMessageContextMenuCommand: () => false,
    isUserContextMenuCommand: () => false,
    inGuild: () => true,
    inCachedGuild: () => true,
    inRawGuild: () => false
  };
};

// Mock Discord client
export const createMockDiscordClient = () => {
  return {
    user: {
      id: 'bot-user-id',
      bot: true,
      username: 'BookFairy',
      tag: 'BookFairy#0000'
    },
    guilds: {
      cache: new Map(),
      fetch: vi.fn().mockResolvedValue({})
    },
    channels: {
      cache: new Map(),
      fetch: vi.fn().mockResolvedValue({})
    },
    users: {
      cache: new Map(),
      fetch: vi.fn().mockResolvedValue({})
    },
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    login: vi.fn().mockResolvedValue('mock-token'),
    destroy: vi.fn().mockResolvedValue(undefined),
    isReady: () => true,
    readyAt: new Date(),
    readyTimestamp: Date.now(),
    uptime: 10000,
    ws: {
      ping: 50,
      status: 0 // READY
    }
  };
};

// Mock Discord embed
export const createMockEmbed = (title?: string, description?: string) => {
  return {
    title: title || 'Test Embed',
    description: description || 'Test description',
    color: 0x7C4DFF,
    fields: [],
    author: null,
    footer: null,
    image: null,
    thumbnail: null,
    timestamp: null,
    url: null,
    video: null,
    provider: null
  };
};

// Mock Discord button component
export const createMockButton = (customId: string, label: string, style = ButtonStyle.Primary) => {
  return {
    type: ComponentType.Button,
    customId,
    label,
    style,
    disabled: false,
    emoji: null,
    url: null
  };
};

// Mock Discord action row
export const createMockActionRow = (components: any[] = []) => {
  return {
    type: ComponentType.ActionRow,
    components
  };
};

// Mock Discord permissions
export const createMockPermissions = (permissions: string[] = []) => {
  return {
    has: vi.fn((permission) => permissions.includes(permission)),
    add: vi.fn(),
    remove: vi.fn(),
    serialize: vi.fn().mockReturnValue({}),
    toArray: vi.fn().mockReturnValue(permissions),
    bitfield: BigInt(0)
  };
};

// Mock Discord guild member
export const createMockGuildMember = (userId = 'user-123', permissions: string[] = []) => {
  return {
    id: userId,
    user: {
      id: userId,
      bot: false,
      username: 'TestUser',
      tag: 'TestUser#1234'
    },
    nickname: null,
    displayName: 'TestUser',
    roles: {
      cache: new Map(),
      add: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue({})
    },
    permissions: createMockPermissions(permissions),
    joinedAt: new Date(),
    joinedTimestamp: Date.now(),
    premiumSince: null,
    premiumSinceTimestamp: null,
    manageable: true,
    kickable: true,
    bannable: true,
    moderatable: true,
    voice: {
      channel: null,
      channelId: null,
      deaf: false,
      mute: false,
      selfDeaf: false,
      selfMute: false,
      selfVideo: false,
      streaming: false,
      suppress: false
    },
    presence: null,
    communicationDisabledUntil: null,
    communicationDisabledUntilTimestamp: null,
    pending: false,
    partial: false,
    ban: vi.fn().mockResolvedValue({}),
    kick: vi.fn().mockResolvedValue({}),
    edit: vi.fn().mockResolvedValue({}),
    timeout: vi.fn().mockResolvedValue({}),
    disableCommunicationUntil: vi.fn().mockResolvedValue({}),
    removeCommunicationDisable: vi.fn().mockResolvedValue({})
  };
};

// Mock Discord channel
export const createMockChannel = (type = 0, isDM = false) => {
  return {
    id: 'channel-123',
    type,
    name: isDM ? null : 'test-channel',
    guild: isDM ? null : { id: 'guild-123', name: 'Test Guild' },
    guildId: isDM ? null : 'guild-123',
    parentId: null,
    parent: null,
    position: 0,
    topic: null,
    nsfw: false,
    rateLimitPerUser: 0,
    lastMessageId: null,
    lastPinTimestamp: null,
    defaultAutoArchiveDuration: null,
    messages: {
      cache: new Map(),
      fetch: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({})
    },
    members: new Map(),
    permissionOverwrites: {
      cache: new Map(),
      create: vi.fn().mockResolvedValue({}),
      edit: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({})
    },
    send: vi.fn().mockResolvedValue({}),
    sendTyping: vi.fn().mockResolvedValue({}),
    createWebhook: vi.fn().mockResolvedValue({}),
    setName: vi.fn().mockResolvedValue({}),
    setTopic: vi.fn().mockResolvedValue({}),
    setNSFW: vi.fn().mockResolvedValue({}),
    setRateLimitPerUser: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    clone: vi.fn().mockResolvedValue({}),
    edit: vi.fn().mockResolvedValue({}),
    isDMBased: () => isDM,
    isTextBased: () => true,
    isVoiceBased: () => false,
    isThread: () => false,
    createdAt: new Date(),
    createdTimestamp: Date.now(),
    url: `https://discord.com/channels/${isDM ? '@me' : 'guild-123'}/channel-123`
  };
};

// Helper function to setup Discord mocks
export const setupDiscordMocks = () => {
  const client = createMockDiscordClient();
  const message = createMockMessage('test message');
  const interaction = createMockButtonInteraction('test_button');
  
  return {
    client,
    message,
    interaction,
    createMessage: createMockMessage,
    createInteraction: createMockButtonInteraction,
    createEmbed: createMockEmbed,
    createButton: createMockButton,
    createActionRow: createMockActionRow,
    createChannel: createMockChannel,
    createMember: createMockGuildMember
  };
};

// Mock message flags
export const MessageFlags = {
  Crossposted: 1 << 0,
  IsCrosspost: 1 << 1,
  SuppressEmbeds: 1 << 2,
  SourceMessageDeleted: 1 << 3,
  Urgent: 1 << 4,
  HasThread: 1 << 5,
  Ephemeral: 1 << 6,
  Loading: 1 << 7,
  FailedToMentionSomeRolesInThread: 1 << 8,
  SuppressNotifications: 1 << 12
};

// Export commonly used Discord enums for tests
export const DiscordEnums = {
  ButtonStyle,
  ComponentType,
  MessageFlags
};
