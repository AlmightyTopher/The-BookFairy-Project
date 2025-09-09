import { z } from "zod";

// Discord User Schema
export const DiscordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string().optional(),
  globalName: z.string().optional(),
  avatar: z.string().nullable().optional(),
  bot: z.boolean().optional(),
});

// Discord Channel Schema
export const DiscordChannelSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.number(),
  guildId: z.string().optional(),
});

// Discord Guild Schema
export const DiscordGuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable().optional(),
});

// Discord Message Schema
export const DiscordMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: DiscordUserSchema,
  channel: DiscordChannelSchema,
  guild: DiscordGuildSchema.optional(),
  timestamp: z.string(),
  editedTimestamp: z.string().nullable().optional(),
});

// Discord Slash Command Option Schema
export const DiscordCommandOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.number(),
  required: z.boolean().optional(),
  choices: z.array(z.object({
    name: z.string(),
    value: z.union([z.string(), z.number()]),
  })).optional(),
  options: z.array(z.lazy(() => DiscordCommandOptionSchema)).optional(),
});

// Discord Slash Command Schema
export const DiscordSlashCommandSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(DiscordCommandOptionSchema).optional(),
  defaultMemberPermissions: z.string().nullable().optional(),
  dmPermission: z.boolean().optional(),
});

// Discord Button Component Schema
export const DiscordButtonSchema = z.object({
  type: z.literal(2), // Button component type
  style: z.number().min(1).max(5), // Button styles 1-5
  label: z.string().optional(),
  emoji: z.object({
    id: z.string().nullable().optional(),
    name: z.string().optional(),
    animated: z.boolean().optional(),
  }).optional(),
  customId: z.string().optional(),
  url: z.string().optional(),
  disabled: z.boolean().optional(),
});

// Discord Select Menu Option Schema
export const DiscordSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
  emoji: z.object({
    id: z.string().nullable().optional(),
    name: z.string().optional(),
    animated: z.boolean().optional(),
  }).optional(),
  default: z.boolean().optional(),
});

// Discord Select Menu Schema
export const DiscordSelectMenuSchema = z.object({
  type: z.literal(3), // Select menu component type
  customId: z.string(),
  options: z.array(DiscordSelectOptionSchema),
  placeholder: z.string().optional(),
  minValues: z.number().optional(),
  maxValues: z.number().optional(),
  disabled: z.boolean().optional(),
});

// Discord Action Row Schema
export const DiscordActionRowSchema = z.object({
  type: z.literal(1), // Action row component type
  components: z.array(z.union([
    DiscordButtonSchema,
    DiscordSelectMenuSchema,
  ])),
});

// Discord Embed Field Schema
export const DiscordEmbedFieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  inline: z.boolean().optional(),
});

// Discord Embed Schema
export const DiscordEmbedSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  color: z.number().optional(),
  footer: z.object({
    text: z.string(),
    iconUrl: z.string().optional(),
  }).optional(),
  image: z.object({
    url: z.string(),
  }).optional(),
  thumbnail: z.object({
    url: z.string(),
  }).optional(),
  author: z.object({
    name: z.string(),
    url: z.string().optional(),
    iconUrl: z.string().optional(),
  }).optional(),
  fields: z.array(DiscordEmbedFieldSchema).optional(),
});

// Discord Interaction Schema
export const DiscordInteractionSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  type: z.number(),
  data: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    type: z.number().optional(),
    resolved: z.record(z.any()).optional(),
    options: z.array(z.object({
      name: z.string(),
      type: z.number(),
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    })).optional(),
    guildId: z.string().optional(),
    targetId: z.string().optional(),
    customId: z.string().optional(),
    componentType: z.number().optional(),
    values: z.array(z.string()).optional(),
  }).optional(),
  guildId: z.string().optional(),
  channelId: z.string().optional(),
  member: z.object({
    user: DiscordUserSchema,
    roles: z.array(z.string()),
    premiumSince: z.string().nullable().optional(),
    permissions: z.string(),
    pending: z.boolean().optional(),
    nick: z.string().nullable().optional(),
    mute: z.boolean().optional(),
    joinedAt: z.string(),
    deaf: z.boolean().optional(),
    communicationDisabledUntil: z.string().nullable().optional(),
  }).optional(),
  user: DiscordUserSchema.optional(),
  token: z.string(),
  version: z.number(),
  message: DiscordMessageSchema.optional(),
  appPermissions: z.string().optional(),
  locale: z.string().optional(),
  guildLocale: z.string().optional(),
});

// Discord Interaction Response Schema
export const DiscordInteractionResponseSchema = z.object({
  type: z.number(),
  data: z.object({
    tts: z.boolean().optional(),
    content: z.string().optional(),
    embeds: z.array(DiscordEmbedSchema).optional(),
    allowedMentions: z.object({
      parse: z.array(z.string()).optional(),
      roles: z.array(z.string()).optional(),
      users: z.array(z.string()).optional(),
      repliedUser: z.boolean().optional(),
    }).optional(),
    flags: z.number().optional(),
    components: z.array(DiscordActionRowSchema).optional(),
    attachments: z.array(z.object({
      id: z.string(),
      description: z.string().optional(),
    })).optional(),
  }).optional(),
});

// BookFairy Specific Schemas
export const BookFairyButtonDataSchema = z.object({
  action: z.enum([
    "audiobooks",
    "search_title", 
    "search_author",
    "status",
    "help",
    "confirm_book",
    "pagination_next",
    "pagination_prev",
    "select_genre",
    "select_timeframe"
  ]),
  bookId: z.string().optional(),
  page: z.number().optional(),
  genre: z.string().optional(),
  timeframe: z.string().optional(),
});

export const BookFairySlashCommandDataSchema = z.object({
  command: z.enum(["bookfairy", "genres"]),
  options: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.string().optional(),
  }).optional(),
});

// Export types
export type DiscordUser = z.infer<typeof DiscordUserSchema>;
export type DiscordChannel = z.infer<typeof DiscordChannelSchema>;
export type DiscordGuild = z.infer<typeof DiscordGuildSchema>;
export type DiscordMessage = z.infer<typeof DiscordMessageSchema>;
export type DiscordSlashCommand = z.infer<typeof DiscordSlashCommandSchema>;
export type DiscordButton = z.infer<typeof DiscordButtonSchema>;
export type DiscordSelectMenu = z.infer<typeof DiscordSelectMenuSchema>;
export type DiscordActionRow = z.infer<typeof DiscordActionRowSchema>;
export type DiscordEmbed = z.infer<typeof DiscordEmbedSchema>;
export type DiscordInteraction = z.infer<typeof DiscordInteractionSchema>;
export type DiscordInteractionResponse = z.infer<typeof DiscordInteractionResponseSchema>;
export type BookFairyButtonData = z.infer<typeof BookFairyButtonDataSchema>;
export type BookFairySlashCommandData = z.infer<typeof BookFairySlashCommandDataSchema>;