import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "*.apiKey", 
      "*.password",
      "*.token",
      "config.discord.token",
      "config.prowlarr.apiKey",
      "config.readarr.apiKey",
      "config.qbittorrent.password"
    ],
    remove: true
  },
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: process.env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname"
    }
  } : undefined
});

export const withReqId = (id: string) => logger.child({ reqId: id });
