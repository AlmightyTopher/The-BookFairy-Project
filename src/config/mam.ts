// MAM configuration
export const mamConfig = {
  cookiesFile: process.env.MAM_COOKIES_FILE || './cookies.txt',
  enabled: process.env.MAM_ENABLED === 'true',
  timeout: parseInt(process.env.MAM_TIMEOUT || '10000'),
  maxRetries: parseInt(process.env.MAM_MAX_RETRIES || '3'),
  
  // Prowlarr fallback
  prowlarr: {
    url: process.env.PROWLARR_URL || '',
    apiKey: process.env.PROWLARR_API_KEY || '',
    mamIndexerId: parseInt(process.env.PROWLARR_MAM_INDEXER_ID || '1'),
  },
} as const;
