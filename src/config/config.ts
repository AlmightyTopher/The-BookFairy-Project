import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  // Discord Bot Configuration
  discord: {
    token: process.env.DISCORD_TOKEN || 'your-discord-token-here',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    guildId: process.env.DISCORD_GUILD_ID || '',
  },

  // Ollama LLM Configuration
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    classifyModel: process.env.OLLAMA_CLASSIFY_MODEL || 'qwen3:4b',
    generateModel: process.env.OLLAMA_GENERATE_MODEL || 'qwen2.5-coder:14b',
    fallbackModel: process.env.OLLAMA_FALLBACK_MODEL || 'gpt-oss:20b',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || '3'),
  },

  // Readarr Configuration
  readarr: {
    baseUrl: process.env.READARR_URL || 'http://localhost:8787',
    apiKey: process.env.READARR_API_KEY || '',
    timeout: parseInt(process.env.READARR_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.READARR_MAX_RETRIES || '3'),
    defaultQualityProfileId: parseInt(process.env.READARR_QUALITY_PROFILE || '1'),
    defaultMetadataProfileId: parseInt(process.env.READARR_METADATA_PROFILE || '1'),
    rootFolderPath: process.env.READARR_ROOT_PATH || '/audiobooks',
    monitored: process.env.READARR_MONITORED !== 'false',
    searchForMissingAudiobooks: process.env.READARR_AUTO_SEARCH !== 'false',
  },

  // Prowlarr Configuration
  prowlarr: {
    baseUrl: process.env.PROWLARR_URL || 'http://localhost:9696',
    apiKey: process.env.PROWLARR_API_KEY || 'your-api-key-here',
    timeout: 30000,
    categories: [3000, 3030], // Audiobook categories
    maxRetries: parseInt(process.env.PROWLARR_MAX_RETRIES || '3'),
    mamIndexerId: parseInt(process.env.PROWLARR_MAM_INDEXER_ID || '1'),
  },

  // qBittorrent Configuration
  qbittorrent: {
    baseUrl: process.env.QBITTORRENT_URL || 'http://localhost:8080',
    username: process.env.QBITTORRENT_USERNAME || '',
    password: process.env.QBITTORRENT_PASSWORD || '',
    timeout: parseInt(process.env.QBITTORRENT_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.QBITTORRENT_MAX_RETRIES || '3'),
    category: process.env.QBITTORRENT_CATEGORY || 'audiobooks',
    savePath: process.env.QBITTORRENT_SAVE_PATH || '/downloads/audiobooks',
    sequentialDownload: process.env.QBITTORRENT_SEQUENTIAL === 'true',
    firstLastPiecePriority: process.env.QBITTORRENT_FIRST_LAST_PRIO !== 'false',
  },

  // Health Server Configuration
  web: {
    port: parseInt(process.env.WEB_PORT || '3000'),
    host: process.env.WEB_HOST || '0.0.0.0',
  },

  // Application Configuration
  app: {
    preferredLanguage: process.env.PREFERRED_LANGUAGE || 'en',
    audiobookOnly: process.env.AUDIOBOOK_ONLY !== 'false',
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || '30000'),
    downloadTimeout: parseInt(process.env.DOWNLOAD_TIMEOUT || '3600000'),
    duplicateRequestWindow: parseInt(process.env.DUPLICATE_WINDOW || '300000'),
  },

  // Retry Configuration
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY || '1000'),
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY || '30000'),
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
    jitterMaxMs: parseInt(process.env.RETRY_JITTER_MAX || '1000'),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    redactKeys: ['apiKey', 'token', 'password', 'key'],
  },
} as const;