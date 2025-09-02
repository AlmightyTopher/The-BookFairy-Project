import { getActiveTorrents, getCompletedTorrents, TorrentInfo } from '../clients/qbittorrent-client';
import { logger } from '../utils/logger';
import { Client, TextChannel, User } from 'discord.js';
import { EventEmitter } from 'events';

export interface DownloadTracker {
  hash: string;
  name: string;
  userId: string;
  channelId: string;
  startTime: number;
  notified: boolean;
}

export class DownloadMonitor extends EventEmitter {
  private trackedDownloads: Map<string, DownloadTracker> = new Map();
  private monitorInterval: NodeJS.Timeout | null = null;
  private discordClient: Client | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    super();
    this.startMonitoring();
  }

  public setDiscordClient(client: Client): void {
    this.discordClient = client;
    logger.info('Discord client set for download monitor');
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    logger.info('Starting download monitor');
    
    // Check every 30 seconds for completed downloads
    this.monitorInterval = setInterval(() => {
      this.checkForCompletedDownloads().catch(error => {
        logger.error({ error }, 'Error checking for completed downloads');
      });
    }, 30000);
  }

  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    logger.info('Download monitor stopped');
  }

  public trackDownload(hash: string, name: string, userId: string, channelId: string): void {
    const tracker: DownloadTracker = {
      hash,
      name,
      userId,
      channelId,
      startTime: Date.now(),
      notified: false
    };
    
    this.trackedDownloads.set(hash, tracker);
    logger.info({ hash, name, userId }, 'Added download to tracking');
    
    this.emit('downloadTracked', tracker);
  }

  public removeTracking(hash: string): void {
    const tracker = this.trackedDownloads.get(hash);
    if (tracker) {
      this.trackedDownloads.delete(hash);
      logger.info({ hash, name: tracker.name }, 'Removed download from tracking');
      this.emit('downloadUntracked', tracker);
    }
  }

  public getTrackedDownloads(): DownloadTracker[] {
    return Array.from(this.trackedDownloads.values());
  }

  public getTrackedDownload(hash: string): DownloadTracker | undefined {
    return this.trackedDownloads.get(hash);
  }

  private async checkForCompletedDownloads(): Promise<void> {
    try {
      if (this.trackedDownloads.size === 0) {
        return; // No downloads to check
      }

      // Get completed torrents from qBittorrent
      const completedTorrents = await getCompletedTorrents();
      const completedHashes = new Set(completedTorrents.map(t => t.hash));

      // Check tracked downloads against completed torrents
      for (const [hash, tracker] of this.trackedDownloads.entries()) {
        if (!tracker.notified && completedHashes.has(hash)) {
          await this.notifyDownloadComplete(tracker, completedTorrents.find(t => t.hash === hash));
          tracker.notified = true;
        }
      }

      // Clean up old completed downloads (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const [hash, tracker] of this.trackedDownloads.entries()) {
        if (tracker.notified && tracker.startTime < oneHourAgo) {
          this.removeTracking(hash);
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error in download monitoring cycle');
    }
  }

  private async notifyDownloadComplete(tracker: DownloadTracker, torrentInfo?: TorrentInfo): Promise<void> {
    if (!this.discordClient) {
      logger.warn('Cannot send notification - Discord client not set');
      return;
    }

    try {
      const channel = await this.discordClient.channels.fetch(tracker.channelId) as TextChannel;
      if (!channel || !('send' in channel)) {
        logger.warn({ channelId: tracker.channelId }, 'Invalid channel for notification');
        return;
      }

      const user = await this.discordClient.users.fetch(tracker.userId);
      const downloadTime = Math.round((Date.now() - tracker.startTime) / 1000 / 60); // minutes
      
      let message = `🎉 <@${user.id}> Your audiobook **"${tracker.name}"** has finished downloading!`;
      
      if (torrentInfo) {
        const sizeGB = (torrentInfo.size / (1024 * 1024 * 1024)).toFixed(1);
        message += `\n\n📊 **Download Stats:**`;
        message += `\n• Size: ${sizeGB} GB`;
        message += `\n• Time: ${downloadTime} minutes`;
        message += `\n• Seeds: ${torrentInfo.num_seeds}`;
        
        if (torrentInfo.save_path) {
          message += `\n• Location: \`${torrentInfo.save_path}\``;
        }
      }
      
      message += `\n\n🔍 Ready for another book? Just ask me to search for something!`;

      await channel.send(message);
      
      logger.info({ 
        userId: tracker.userId, 
        bookName: tracker.name, 
        downloadTime 
      }, 'Download completion notification sent');
      
      this.emit('notificationSent', tracker, torrentInfo);
      
    } catch (error) {
      logger.error({ 
        error, 
        userId: tracker.userId, 
        channelId: tracker.channelId,
        bookName: tracker.name 
      }, 'Failed to send download completion notification');
    }
  }

  // Method to get download status for a specific user
  public getUserDownloads(userId: string): DownloadTracker[] {
    return Array.from(this.trackedDownloads.values())
      .filter(tracker => tracker.userId === userId);
  }

  // Method to get active downloads count
  public getActiveDownloadsCount(): number {
    return Array.from(this.trackedDownloads.values())
      .filter(tracker => !tracker.notified).length;
  }

  // Method to manually check a specific download
  public async checkDownloadStatus(hash: string): Promise<{ completed: boolean; torrentInfo?: TorrentInfo }> {
    try {
      const completedTorrents = await getCompletedTorrents();
      const torrentInfo = completedTorrents.find(t => t.hash === hash);
      
      return {
        completed: !!torrentInfo,
        torrentInfo
      };
    } catch (error) {
      logger.error({ error, hash }, 'Error checking download status');
      return { completed: false };
    }
  }
}

// Singleton instance
export const downloadMonitor = new DownloadMonitor();
