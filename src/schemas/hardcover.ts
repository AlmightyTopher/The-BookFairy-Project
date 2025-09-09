import { z } from "zod";

// Hardcover Image Schema
export const HardcoverImageSchema = z.object({
  url: z.string().url().nullable().optional(),
});

// Hardcover Series Schema
export const HardcoverSeriesSchema = z.object({
  name: z.string().nullable().optional(),
});

// Hardcover Book Series Node Schema
export const HardcoverSeriesNodeSchema = z.object({
  position: z.number().nullable().optional(),
  series: HardcoverSeriesSchema.nullable().optional(),
});

// Hardcover Edition Schema
export const HardcoverEditionSchema = z.object({
  id: z.number(),
  isbn_13: z.string().nullable().optional(),
  isbn_10: z.string().nullable().optional(),
  image: HardcoverImageSchema.nullable().optional(),
  release_date: z.string().nullable().optional(),
});

// Hardcover Cover Edition Schema
export const HardcoverCoverEditionSchema = z.object({
  image: HardcoverImageSchema.nullable().optional(),
});

// Hardcover Book Schema (Core GraphQL Response)
export const HardcoverBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  author_names: z.array(z.string()).nullable().optional(),
  default_cover_edition: HardcoverCoverEditionSchema.nullable().optional(),
  book_series: z.array(HardcoverSeriesNodeSchema).nullable().optional(),
  editions: z.array(HardcoverEditionSchema).nullable().optional(),
});

// Hardcover Edition with Book Schema (for ISBN lookups)
export const HardcoverEditionWithBookSchema = z.object({
  id: z.number(),
  isbn_13: z.string().nullable().optional(),
  image: HardcoverImageSchema.nullable().optional(),
  book: HardcoverBookSchema,
});

// Hardcover Search Result Schema
export const HardcoverSearchResultSchema = z.object({
  id: z.number(),
});

// Hardcover Search Response Schema
export const HardcoverSearchResponseSchema = z.object({
  search: z.object({
    results: z.array(HardcoverSearchResultSchema).optional(),
  }),
});

// Hardcover Books Query Response Schema
export const HardcoverBooksResponseSchema = z.object({
  books: z.array(HardcoverBookSchema),
});

// Hardcover Editions Query Response Schema
export const HardcoverEditionsResponseSchema = z.object({
  editions: z.array(HardcoverEditionWithBookSchema),
});

// Hardcover GraphQL Error Schema
export const HardcoverErrorSchema = z.object({
  message: z.string(),
  locations: z.array(z.object({
    line: z.number(),
    column: z.number(),
  })).optional(),
  path: z.array(z.union([z.string(), z.number()])).optional(),
  extensions: z.record(z.any()).optional(),
});

// Hardcover GraphQL Response Schema (Generic)
export const HardcoverGraphQLResponseSchema = z.object({
  data: z.any().nullable().optional(),
  errors: z.array(HardcoverErrorSchema).optional(),
});

// BookFairy-specific schemas for Hardcover integration

// Book Metadata Input Schema (for searches)
export const BookMetaSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  hcId: z.number().optional(),
});

// Book Details Output Schema (normalized response)
export const BookDetailsSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  seriesName: z.string().optional(),
  seriesNumber: z.number().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(), // Added for compatibility
  isbn13: z.string().nullable().optional(),
  hcId: z.number().nullable().optional(),
});

// Hardcover Search Query Variables Schema
export const HardcoverSearchVariablesSchema = z.object({
  q: z.string(),
  page: z.number().default(1),
  per: z.number().default(5),
});

// Hardcover Book Query Variables Schema
export const HardcoverBookVariablesSchema = z.object({
  id: z.number(),
});

// Hardcover Edition Query Variables Schema
export const HardcoverEditionVariablesSchema = z.object({
  isbn13: z.string().nullable().optional(),
  isbn10: z.string().nullable().optional(),
});

// Hardcover GraphQL Query Schema
export const HardcoverGraphQLQuerySchema = z.object({
  query: z.string(),
  variables: z.record(z.any()),
});

// Hardcover API Configuration Schema
export const HardcoverConfigSchema = z.object({
  apiToken: z.string().min(1, "Hardcover API token is required"),
  graphqlUrl: z.string().url().default("https://api.hardcover.app/v1/graphql"),
  timeout: z.number().default(10000),
  userAgent: z.string().default("BookFairy/1.0"),
});

// Hardcover Search Options Schema
export const HardcoverSearchOptionsSchema = z.object({
  maxResults: z.number().default(5),
  normalizeTitle: z.boolean().default(true),
  includeAuthor: z.boolean().default(true),
});

// Hardcover Client Response Schema (for error handling)
export const HardcoverClientResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
});

// Author Search Schema (for future author search functionality)
export const HardcoverAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: HardcoverImageSchema.nullable().optional(),
  bio: z.string().nullable().optional(),
});

export const HardcoverAuthorSearchResponseSchema = z.object({
  search: z.object({
    results: z.array(z.object({
      id: z.number(),
    })).optional(),
  }),
});

export const HardcoverAuthorsResponseSchema = z.object({
  authors: z.array(HardcoverAuthorSchema),
});

// Export TypeScript types
export type HardcoverImage = z.infer<typeof HardcoverImageSchema>;
export type HardcoverSeries = z.infer<typeof HardcoverSeriesSchema>;
export type HardcoverSeriesNode = z.infer<typeof HardcoverSeriesNodeSchema>;
export type HardcoverEdition = z.infer<typeof HardcoverEditionSchema>;
export type HardcoverBook = z.infer<typeof HardcoverBookSchema>;
export type HardcoverEditionWithBook = z.infer<typeof HardcoverEditionWithBookSchema>;
export type HardcoverSearchResult = z.infer<typeof HardcoverSearchResultSchema>;
export type HardcoverSearchResponse = z.infer<typeof HardcoverSearchResponseSchema>;
export type HardcoverBooksResponse = z.infer<typeof HardcoverBooksResponseSchema>;
export type HardcoverEditionsResponse = z.infer<typeof HardcoverEditionsResponseSchema>;
export type HardcoverError = z.infer<typeof HardcoverErrorSchema>;
export type HardcoverGraphQLResponse = z.infer<typeof HardcoverGraphQLResponseSchema>;
export type BookMeta = z.infer<typeof BookMetaSchema>;
export type BookDetails = z.infer<typeof BookDetailsSchema>;
export type HardcoverSearchVariables = z.infer<typeof HardcoverSearchVariablesSchema>;
export type HardcoverBookVariables = z.infer<typeof HardcoverBookVariablesSchema>;
export type HardcoverEditionVariables = z.infer<typeof HardcoverEditionVariablesSchema>;
export type HardcoverGraphQLQuery = z.infer<typeof HardcoverGraphQLQuerySchema>;
export type HardcoverConfig = z.infer<typeof HardcoverConfigSchema>;
export type HardcoverSearchOptions = z.infer<typeof HardcoverSearchOptionsSchema>;
export type HardcoverClientResponse = z.infer<typeof HardcoverClientResponseSchema>;
export type HardcoverAuthor = z.infer<typeof HardcoverAuthorSchema>;
export type HardcoverAuthorSearchResponse = z.infer<typeof HardcoverAuthorSearchResponseSchema>;
export type HardcoverAuthorsResponse = z.infer<typeof HardcoverAuthorsResponseSchema>;