import { z } from "zod";

export const BookFairyResponse = z.object({
  intent: z.enum([
    "FIND_SIMILAR","FIND_BY_TITLE","FIND_BY_AUTHOR",
    "FIND_BY_METADATA","GET_AUTHOR_MORE",
    "GET_METADATA","GET_SUMMARY","UNKNOWN"
  ]),
  confidence: z.number().min(0).max(1),
  seed_book: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    series: z.string().optional(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    year: z.string().optional(),
    audience: z.enum(["children","middle-grade","YA","adult","academic","general"]).optional(),
    format: z.enum(["novel","picture_book","textbook","comic","graphic_novel","short_story_collection","anthology","reference","poetry","audiobook"]).optional(),
    genre: z.string().optional(),
    subgenres: z.array(z.string()).optional(),
    themes: z.array(z.string()).optional(),
    tone_style: z.array(z.string()).optional(),
    notable_features: z.array(z.string()).optional(),
  }),
  similarity_rules_applied: z.object({
    matched_axes: z.array(z.string()),
    min_required_axes: z.number()
  }),
  filters: z.object({
    audience_lock: z.boolean(),
    format_lock: z.boolean(),
    exclude: z.array(z.string())
  }),
  clarifying_question: z.string(),
  results: z.array(z.object({
    title: z.string(),
    author: z.string(),
    genre: z.string().optional(),
    subgenre: z.string().optional(),
    audience: z.string().optional(),
    format: z.string().optional(),
    why_similar: z.string(),
    similarity_axes: z.array(z.string()),
    downloadUrl: z.string().optional()  // Add downloadUrl for direct downloads
  })),
  post_prompt: z.string()
});

export type BookFairyResponseT = z.infer<typeof BookFairyResponse>;
