import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterMaxMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterMaxMs: 1000,
  shouldRetry: () => true,
};

export class NonRetryableError extends Error {}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    backoffMultiplier,
    jitterMaxMs,
    shouldRetry,
  } = { ...defaultRetryOptions, ...options };

  let attempt = 1;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxAttempts || !(error instanceof Error) || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs,
      );
      const jitter = Math.floor(Math.random() * jitterMaxMs);
      const totalDelay = delay + jitter;

      logger.warn(
        {
          attempt,
          maxAttempts,
          delay: totalDelay,
          error: error.message,
        },
        `Retrying failed operation...`,
      );

      await new Promise(resolve => setTimeout(resolve, totalDelay));
      attempt++;
    }
  }
}