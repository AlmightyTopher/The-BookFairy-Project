import { request } from "undici";
import Bottleneck from "bottleneck";
import pRetry, { AbortError } from "p-retry";
import { logger } from "./logger";

const limiter = new Bottleneck({ 
  minTime: 150, 
  maxConcurrent: 4,
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // 1 minute
});

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
}

export async function http<T = unknown>(url: string, opts: HttpOptions = {}): Promise<T> {
  const { 
    method = "GET", 
    headers = {}, 
    body, 
    timeout = 10000,
    retries = 3 
  } = opts;

  return pRetry(async () => {
    const startTime = Date.now();
    
    try {
      const res = await limiter.schedule(() => request(url, {
        method,
        headers: {
          'User-Agent': 'BookFairy/1.0.0',
          ...headers
        },
        body,
        headersTimeout: timeout,
        bodyTimeout: timeout,
      }));
      
      const duration = Date.now() - startTime;
      
      if (res.statusCode >= 500) {
        logger.warn({ url, statusCode: res.statusCode, duration }, 'Server error, retrying');
        throw new Error(`Upstream ${res.statusCode}`);
      }
      
      if (res.statusCode === 429) {
        logger.warn({ url, duration }, 'Rate limited');
        throw new AbortError("Rate limited");
      }
      
      if (res.statusCode >= 400) {
        logger.error({ url, statusCode: res.statusCode, duration }, 'Client error');
        throw new AbortError(`Client error ${res.statusCode}`);
      }
      
      const data = await res.body.json();
      logger.debug({ url, statusCode: res.statusCode, duration }, 'HTTP request completed');
      
      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: errorMessage, duration }, 'HTTP request failed');
      throw error;
    }
  }, { 
    retries, 
    factor: 2, 
    minTimeout: 300,
    maxTimeout: 5000,
    onFailedAttempt: (error) => {
      logger.warn({ 
        url, 
        attempt: error.attemptNumber, 
        retriesLeft: error.retriesLeft 
      }, 'HTTP request attempt failed');
    }
  });
}
