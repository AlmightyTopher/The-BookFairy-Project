import { z } from 'zod';

// LLM Intent Schemas
export const AudiobookRequestSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  language: z.string().default('en'),
  series: z.string().optional(),
  quality: z.enum(['any', 'high', 'lossless']).default('any'),
  format: z.literal('audiobook'),
});

export const IntentClassificationSchema = z.object({
  intent: z.enum(['search_audiobook', 'status_check', 'help', 'unknown']),
  confidence: z.number().min(0).max(1),
  extracted: AudiobookRequestSchema.optional(),
});

// Ollama API Schemas
export const OllamaGenerateRequestSchema = z.object({
  model: z.string(),
  prompt: z.string(),
  stream: z.boolean().default(false),
  system: z.string().optional(),
  options: z
    .object({
      temperature: z.number().optional(),
      top_p: z.number().optional(),
      max_tokens: z.number().optional(),
    })
    .optional(),
});

export const OllamaResponseSchema = z.object({
  model: z.string(),
  response: z.string(),
  done: z.boolean(),
  created_at: z.string(),
});

// Health Check Schemas
export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  services: z.record(
    z.object({
      status: z.enum(['up', 'down', 'degraded']),
      responseTime: z.number().optional(),
      lastCheck: z.string(),
      error: z.string().optional(),
    })
  ),
});

// Type exports
export type AudiobookRequest = z.infer<typeof AudiobookRequestSchema>;
export type IntentClassification = z.infer<typeof IntentClassificationSchema>;
export type OllamaGenerateRequest = z.infer<typeof OllamaGenerateRequestSchema>;
export type OllamaResponse = z.infer<typeof OllamaResponseSchema>;
export type HealthStatus = z.infer<typeof HealthStatusSchema>;