import { z } from 'zod';

// Mango-specific types
export const TimeframeSchema = z.enum(['1w', '1m', '3m', '6m', '1y', 'all']);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const GenreSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  count: z.number().optional(),
});
export type Genre = z.infer<typeof GenreSchema>;

export const MangoItemSchema = z.object({
  title: z.string(),
  author: z.string(),
  genre: z.string(),
  timeframe: TimeframeSchema,
  url: z.string().url(),
  source: z.union([z.literal('mango'), z.literal('mam')]),
  rating: z.number().optional(),
  downloads: z.number().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
});
export type MangoItem = z.infer<typeof MangoItemSchema>;

// Rate limiting types
export interface RateLimiter {
  canProceed(): boolean;
  consume(): void;
  reset(): void;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface MangoCache {
  genres: CacheEntry<Genre[]> | null;
  topLists: Map<string, CacheEntry<MangoItem[]>>;
}

// Response types for potential JSON APIs
export const MangoApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
});
export type MangoApiResponse = z.infer<typeof MangoApiResponseSchema>;
