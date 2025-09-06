import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

export interface DownloadRequest {
  title: string;
  author?: string;
  downloadUrl?: string;
  userId: string;
  channelId?: string;
}

export async function requestDownload(req: DownloadRequest): Promise<void> {
  try {
    // Try to find and call existing downloader
    try {
      const { AudiobookOrchestrator } = await import('../orchestrator/audiobook-orchestrator');
      const orchestrator = new AudiobookOrchestrator();
      
      await orchestrator.downloadBook(
        req.title,
        req.downloadUrl || '',
        req.userId,
        req.channelId
      );
      
      logger.info({ title: req.title, userId: req.userId }, 'Download requested via orchestrator');
      return;
    } catch (orchestratorError) {
      logger.warn({ error: orchestratorError }, 'Orchestrator not available, falling back to JSONL');
    }

    // Fallback to JSONL logging
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const queueFile = path.join(dataDir, 'download-queue.jsonl');
    const entry = {
      timestamp: new Date().toISOString(),
      title: req.title,
      author: req.author,
      downloadUrl: req.downloadUrl,
      userId: req.userId,
      channelId: req.channelId
    };

    fs.appendFileSync(queueFile, JSON.stringify(entry) + '\n');
    logger.info({ title: req.title, userId: req.userId }, 'Download request logged to JSONL');
  } catch (error) {
    logger.error({ error, req }, 'Failed to process download request');
    // Never crash - this is a fire-and-forget operation
  }
}
