import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DISCORD_TOKEN: z.string().min(1, "Discord token is required"),
  DISCORD_CLIENT_ID: z.string().min(1, "Discord client ID is required"),
  DISCORD_GUILD_ID: z.string().optional(),
  
  // Ollama Configuration
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_CLASSIFY_MODEL: z.string().default("qwen3:4b"),
  OLLAMA_GENERATE_MODEL: z.string().default("qwen2.5-coder:14b"),
  OLLAMA_FALLBACK_MODEL: z.string().default("gpt-oss:20b"),
  OLLAMA_TIMEOUT: z.string().default("30000"),
  OLLAMA_MAX_RETRIES: z.string().default("3"),
  
  // Prowlarr Configuration
  PROWLARR_URL: z.string().url().optional(),
  PROWLARR_API_KEY: z.string().optional(),
  PROWLARR_MAX_RETRIES: z.string().default("3"),
  PROWLARR_MAM_INDEXER_ID: z.string().default("1"),
  
  // qBittorrent Configuration
  QBITTORRENT_URL: z.string().url().optional(),
  QBITTORRENT_USERNAME: z.string().optional(),
  QBITTORRENT_PASSWORD: z.string().optional(),
  QBITTORRENT_TIMEOUT: z.string().default("10000"),
  QBITTORRENT_MAX_RETRIES: z.string().default("3"),
  QBITTORRENT_CATEGORY: z.string().default("audiobooks"),
  QBITTORRENT_SAVE_PATH: z.string().default("/downloads/audiobooks"),
  QBITTORRENT_SEQUENTIAL: z.string().default("false"),
  QBITTORRENT_FIRST_LAST_PRIO: z.string().default("true"),
  
  // Readarr Configuration
  READARR_URL: z.string().url().optional(),
  READARR_API_KEY: z.string().optional(),
  READARR_TIMEOUT: z.string().default("10000"),
  READARR_MAX_RETRIES: z.string().default("3"),
  READARR_QUALITY_PROFILE: z.string().default("1"),
  READARR_METADATA_PROFILE: z.string().default("1"),
  READARR_ROOT_PATH: z.string().default("/audiobooks"),
  READARR_MONITORED: z.string().default("true"),
  READARR_AUTO_SEARCH: z.string().default("true"),
  
  // Web Configuration
  WEB_PORT: z.string().default("3000"),
  WEB_HOST: z.string().default("0.0.0.0"),
  
  // Application Configuration
  PREFERRED_LANGUAGE: z.string().default("en"),
  AUDIOBOOK_ONLY: z.string().default("true"),
  POLLING_INTERVAL: z.string().default("30000"),
  DOWNLOAD_TIMEOUT: z.string().default("3600000"),
  DUPLICATE_WINDOW: z.string().default("300000"),
  
  // Retry Configuration
  RETRY_MAX_ATTEMPTS: z.string().default("3"),
  RETRY_BASE_DELAY: z.string().default("1000"),
  RETRY_MAX_DELAY: z.string().default("30000"),
  RETRY_BACKOFF_MULTIPLIER: z.string().default("2"),
  RETRY_JITTER_MAX: z.string().default("1000"),
  
  // Logging Configuration
  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
})();
