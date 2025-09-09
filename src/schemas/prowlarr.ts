import { z } from "zod";

// Prowlarr Release Schema (Core search result)
export const ProwlarrReleaseSchema = z.object({
  guid: z.string(),
  title: z.string(),
  size: z.number(),
  downloadUrl: z.string().url(),
  seeders: z.number(),
  leechers: z.number(),
  publishDate: z.string(),
  indexerId: z.number(),
  // Additional optional fields that may appear
  age: z.number().optional(),
  ageHours: z.number().optional(),
  ageMinutes: z.number().optional(),
  category: z.number().optional(),
  categoryDesc: z.string().optional(),
  grabs: z.number().optional(),
  imdbId: z.number().optional(),
  indexer: z.string().optional(),
  infoUrl: z.string().url().optional(),
  magnetUrl: z.string().optional(),
  peers: z.number().optional(),
  tmdbId: z.number().optional(),
});

// Prowlarr Search Options Schema
export const ProwlarrSearchOptionsSchema = z.object({
  indexerId: z.number().optional(),
  categories: z.array(z.number()).optional(),
  searchType: z.enum(['all', 'active', 'inactive', 'fl', 'fl-VIP', 'VIP', 'nVIP']).default('active'),
  sortType: z.enum(['titleAsc', 'titleDesc', 'sizeAsc', 'sizeDesc', 'seedersAsc', 'seedersDesc', 'dateAsc', 'dateDesc']).default('seedersDesc'),
  srchIn: z.array(z.string()).default(['title', 'author']),
  preferredFormat: z.enum(['M4B', 'MP3']).default('M4B'),
  fallbackToMP3: z.boolean().default(true),
  minSeeders: z.number().default(1),
  language: z.string().default('ENG'),
  filterRegex: z.string().optional(),
  stateDir: z.string().default('./data'),
});

// Prowlarr Search Result Schema
export const ProwlarrSearchResultSchema = z.object({
  results: z.array(ProwlarrReleaseSchema),
  format: z.enum(['M4B', 'MP3']).optional(),
  total: z.number().optional(),
  indexerId: z.number().optional(),
});

// Prowlarr Search Request Parameters Schema
export const ProwlarrSearchParamsSchema = z.object({
  query: z.string(),
  categories: z.array(z.number()).optional(),
  type: z.literal('search'),
  indexerIds: z.array(z.number()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Prowlarr Health Check Schema
export const ProwlarrHealthIssueSchema = z.object({
  type: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  wikiUrl: z.string().url().optional(),
});

export const ProwlarrHealthResponseSchema = z.array(ProwlarrHealthIssueSchema);

export const ProwlarrHealthStatusSchema = z.object({
  status: z.enum(['up', 'degraded', 'down']),
  responseTime: z.number().optional(),
  lastCheck: z.string(),
  issues: z.array(ProwlarrHealthIssueSchema).optional(),
  error: z.string().optional(),
});

// Prowlarr Indexer Schema
export const ProwlarrIndexerSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  encoding: z.string().optional(),
  language: z.string().optional(),
  type: z.string().optional(),
  added: z.string().optional(),
  redirect: z.boolean().optional(),
  protocol: z.enum(['torrent', 'usenet']),
  privacy: z.enum(['public', 'semi-public', 'private']),
  enable: z.boolean(),
  priority: z.number(),
  categories: z.array(z.number()).optional(),
  capabilities: z.object({
    search: z.array(z.string()).optional(),
    tvSearch: z.array(z.string()).optional(),
    movieSearch: z.array(z.string()).optional(),
    musicSearch: z.array(z.string()).optional(),
    bookSearch: z.array(z.string()).optional(),
  }).optional(),
});

// Prowlarr Category Schema
export const ProwlarrCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  parentId: z.number().optional(),
});

// Prowlarr Download Payload Schema (for relay)
export const ProwlarrDownloadPayloadSchema = z.object({
  indexerId: z.number(),
  downloadUrl: z.string().url(),
  title: z.string(),
  categories: z.array(z.number()),
  seeders: z.number().default(1),
  size: z.number().default(0),
  publishDate: z.string(),
  // Optional additional metadata
  guid: z.string().optional(),
  leechers: z.number().optional(),
  grabs: z.number().optional(),
  imdbId: z.number().optional(),
  tmdbId: z.number().optional(),
});

// Prowlarr Relay Result Schema
export const ProwlarrRelayResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  title: z.string().optional(),
  author: z.string().optional(),
  downloadId: z.string().optional(),
  indexerId: z.number().optional(),
});

// Prowlarr State Management Schema
export const ProwlarrStateSchema = z.object({
  seenGuids: z.array(z.string()),
  lastCheck: z.string(),
});

// Prowlarr Configuration Schema
export const ProwlarrConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1, "Prowlarr API key is required"),
  timeout: z.number().default(30000),
  categories: z.array(z.number()).default([3000, 3030]), // Audiobook categories
  maxRetries: z.number().default(3),
  mamIndexerId: z.number().default(1),
});

// Prowlarr API Error Schema
export const ProwlarrErrorSchema = z.object({
  message: z.string(),
  description: z.string().optional(),
  code: z.number().optional(),
  details: z.string().optional(),
});

// Prowlarr API Response Wrapper Schema
export const ProwlarrApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: ProwlarrErrorSchema.optional(),
  statusCode: z.number(),
  headers: z.record(z.string()).optional(),
});

// BookFairy-specific Prowlarr Integration Schemas

// Search Context Schema (for tracking user searches)
export const ProwlarrSearchContextSchema = z.object({
  query: z.string(),
  userId: z.string(),
  guildId: z.string(),
  requestId: z.string(),
  timestamp: z.string(),
  options: ProwlarrSearchOptionsSchema.optional(),
});

// Prowlarr Book Candidate Schema (normalized for BookFairy)
export const ProwlarrBookCandidateSchema = z.object({
  source: z.literal('Prowlarr'),
  title: z.string(),
  author: z.string().optional(),
  magnet: z.string().optional(),
  torrentId: z.string().optional(),
  downloadUrl: z.string().url(),
  size: z.number(),
  seeders: z.number(),
  leechers: z.number(),
  publishDate: z.string(),
  indexerId: z.number(),
  indexerName: z.string().optional(),
  format: z.enum(['M4B', 'MP3']).optional(),
  language: z.string().optional(),
  guid: z.string(),
});

// Prowlarr Relay Context Schema (for tracking relay operations)
export const ProwlarrRelayContextSchema = z.object({
  userId: z.string(),
  guildId: z.string(),
  requestId: z.string(),
  correlationId: z.string(),
  timestamp: z.string(),
  item: ProwlarrBookCandidateSchema,
  result: ProwlarrRelayResultSchema.optional(),
});

// Prowlarr Statistics Schema
export const ProwlarrStatsSchema = z.object({
  totalSearches: z.number(),
  successfulSearches: z.number(),
  totalRelays: z.number(),
  successfulRelays: z.number(),
  averageResponseTime: z.number(),
  lastActivity: z.string(),
  indexerStats: z.record(z.object({
    searches: z.number(),
    results: z.number(),
    relays: z.number(),
    successRate: z.number(),
  })).optional(),
});

// Prowlarr Batch Operation Schema
export const ProwlarrBatchOperationSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['search', 'download', 'health_check']),
    payload: z.any(),
    indexerId: z.number().optional(),
  })),
  batchId: z.string(),
  userId: z.string(),
  timestamp: z.string(),
});

// Export TypeScript types
export type ProwlarrRelease = z.infer<typeof ProwlarrReleaseSchema>;
export type ProwlarrSearchOptions = z.infer<typeof ProwlarrSearchOptionsSchema>;
export type ProwlarrSearchResult = z.infer<typeof ProwlarrSearchResultSchema>;
export type ProwlarrSearchParams = z.infer<typeof ProwlarrSearchParamsSchema>;
export type ProwlarrHealthIssue = z.infer<typeof ProwlarrHealthIssueSchema>;
export type ProwlarrHealthResponse = z.infer<typeof ProwlarrHealthResponseSchema>;
export type ProwlarrHealthStatus = z.infer<typeof ProwlarrHealthStatusSchema>;
export type ProwlarrIndexer = z.infer<typeof ProwlarrIndexerSchema>;
export type ProwlarrCategory = z.infer<typeof ProwlarrCategorySchema>;
export type ProwlarrDownloadPayload = z.infer<typeof ProwlarrDownloadPayloadSchema>;
export type ProwlarrRelayResult = z.infer<typeof ProwlarrRelayResultSchema>;
export type ProwlarrState = z.infer<typeof ProwlarrStateSchema>;
export type ProwlarrConfig = z.infer<typeof ProwlarrConfigSchema>;
export type ProwlarrError = z.infer<typeof ProwlarrErrorSchema>;
export type ProwlarrApiResponse = z.infer<typeof ProwlarrApiResponseSchema>;
export type ProwlarrSearchContext = z.infer<typeof ProwlarrSearchContextSchema>;
export type ProwlarrBookCandidate = z.infer<typeof ProwlarrBookCandidateSchema>;
export type ProwlarrRelayContext = z.infer<typeof ProwlarrRelayContextSchema>;
export type ProwlarrStats = z.infer<typeof ProwlarrStatsSchema>;
export type ProwlarrBatchOperation = z.infer<typeof ProwlarrBatchOperationSchema>;