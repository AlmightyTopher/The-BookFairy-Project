import { z } from "zod";

export const AuthorSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  id: z.string().optional(),
});

export const BookQuerySchema = z.object({
  author: z.string().optional(),
  title: z.string().optional(),
  genre: z.string().optional(),
  series: z.string().optional(),
  format: z.enum(["ebook", "audiobook"]).default("audiobook"),
  language: z.string().default("en"),
  quality: z.enum(["any", "high", "standard"]).default("any"),
});

export const CandidateSchema = z.object({
  source: z.enum(["MAM", "Readarr", "Prowlarr"]),
  title: z.string().min(1),
  author: z.string().optional(),
  magnet: z.string().optional(),
  torrentId: z.string().optional(),
  downloadUrl: z.string().optional(),
  size: z.number().optional(),
  seeders: z.number().optional(),
  leechers: z.number().optional(),
  publishDate: z.string().optional(),
  indexerId: z.number().optional(),
});

export const SearchResultSchema = z.object({
  results: z.array(CandidateSchema),
  totalResults: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  format: z.string().optional(),
});

export const UserSessionSchema = z.object({
  userId: z.string(),
  channelId: z.string(),
  currentStep: z.enum(["root", "choose_action", "find_book", "ask_author", "ask_title", "confirm", "queued"]),
  lastActivity: z.date(),
  searchResults: z.array(CandidateSchema).optional(),
  currentQuery: BookQuerySchema.optional(),
});

export type Author = z.infer<typeof AuthorSchema>;
export type BookQuery = z.infer<typeof BookQuerySchema>;
export type Candidate = z.infer<typeof CandidateSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
