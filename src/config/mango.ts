export const mangoConfig = {
  baseUrl: process.env.MANGO_BASE_URL || 'https://mango-mushroom-0d3dde80f.azurestaticapps.net',
  timeout: parseInt(process.env.MANGO_TIMEOUT || '3000'), // Reduced from 10s to 3s
  maxRetries: parseInt(process.env.MANGO_MAX_RETRIES || '1'), // Reduced from 3 to 1 for faster fallback
  rateLimit: {
    requestsPerMinute: parseInt(process.env.MANGO_RATE_LIMIT || '30'),
    burstSize: parseInt(process.env.MANGO_BURST_SIZE || '10'),
  },
  cache: {
    genresTtlMs: parseInt(process.env.MANGO_GENRES_CACHE_TTL || '600000'), // 10 minutes
    topListTtlMs: parseInt(process.env.MANGO_TOP_LIST_CACHE_TTL || '300000'), // 5 minutes
  },
} as const;
