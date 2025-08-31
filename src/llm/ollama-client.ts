import axios from 'axios';
import { config } from '../config/config';
import { OllamaGenerateRequestSchema, OllamaResponseSchema } from '../types/schemas';
import { retry, NonRetryableError } from '../utils/retry';
import { logger } from '../utils/logger';

const ollamaClient = axios.create({
  baseURL: config.ollama.baseUrl,
  timeout: config.ollama.timeout, // Use configurable timeout from config
});

export async function generateLlmResponse(prompt: string, model: string) {
  const validatedBody = OllamaGenerateRequestSchema.parse({
    prompt,
    model,
    stream: false,
  });

  const response = await retry(
    () => ollamaClient.post('/api/generate', validatedBody),
    {
      maxAttempts: config.ollama.maxRetries,
      shouldRetry: (error) => {
        if (axios.isAxiosError(error) && error.response) {
          // Don't retry on 4xx client errors
          if (error.response.status >= 400 && error.response.status < 500) {
            return false;
          }
        }
        return true;
      },
    }
  );

  if (response.status !== 200) {
    throw new NonRetryableError(
      `LLM request failed with status ${response.status}`
    );
  }

  const validatedResponse = OllamaResponseSchema.parse(response.data);
  return validatedResponse.response;
}

export async function checkOllamaHealth() {
  const startTime = Date.now();
  try {
    const response = await ollamaClient.get('/', { timeout: 2000 });
    return {
      status: 'up' as 'up' | 'down' | 'degraded',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error({ error }, 'Ollama health check failed');
    return {
      status: 'down' as 'up' | 'down' | 'degraded',
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}
