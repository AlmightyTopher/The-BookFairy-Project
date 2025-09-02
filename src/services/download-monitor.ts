import { getActiveTorrents, getCompletedTorrents, TorrentInfo } from '../clients/qbittorrent-client';
import { searchProwlarr } from '../clients/prowlarr-client';
import { addTorrent } from '../clients/qbittorrent-client';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { Client, TextChannel, User } from 'discord.js';
import { EventEmitter } from 'events';

/**
 * Tracks download progress and manages retry attempts for failed/stalled downloads
 */
export interface DownloadTracker {
  /** Unique hash identifier for the torrent */
  hash: string;
  /** Display name of the download */
  name: string;
  /** Discord user ID who initiated the download */
  userId: string;
  /** Discord channel ID where notifications should be sent */
  channelId: string;
  /** Timestamp when download tracking started */
  startTime: number;
  /** Whether completion notification has been sent */
  notified: boolean;
  /** Number of retry attempts made for stalled downloads */
  retryCount: number;
  /** Whether stall detection has been triggered */
  stallDetected: boolean;
  /** Last time progress was checked */
  lastProgressCheck: number;
  /** Last recorded progress percentage */
  lastProgress: number;
  /** Original search query for finding alternative sources */
  searchQuery?: string;
}

/**
 * Monitors audiobook downloads and provides automatic retry functionality.
 * Features include stall detection, progress tracking, and Discord notifications.
 * 
 * @emits downloadComplete - When a download finishes successfully
 * @emits downloadStalled - When a download appears to be stalled
 * @emits retryAttempted - When an automatic retry is initiated
 */
export class DownloadMonitor extends EventEmitter {
  private trackedDownloads: Map<string, DownloadTracker> = new Map();
  private monitorInterval: NodeJS.Timeout | null = null;
  private discordClient: Client | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    super();
    this.startMonitoring();
    
    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for download monitoring
   */
  private setupEventHandlers(): void {
    // Handle stalled downloads by attempting retries
    this.on('downloadStalled', this.handleStalledDownload.bind(this));
  }

  /**
   * Handle a stalled download by attempting to find and start an alternative
   */
  private async handleStalledDownload(tracker: DownloadTracker, torrentInfo: TorrentInfo): Promise<void> {
    if (!tracker.searchQuery) {
      logger.warn({ hash: tracker.hash, name: tracker.name }, 'Cannot retry download - no search query stored');
      return;
    }

    try {
      logger.info({ 
        originalHash: tracker.hash, 
        searchQuery: tracker.searchQuery,
        retryAttempt: tracker.retryCount 
      }, 'Attempting to find alternative source for stalled download');

      // Search for alternatives
      const searchResult = await searchProwlarr(tracker.searchQuery, {
        preferredFormat: 'M4B',
        fallbackToMP3: true,
        language: 'ENG',
        minSeeders: 3 // Higher seeders for better reliability
      });

      if (!searchResult.results || searchResult.results.length === 0) {
        logger.warn({ searchQuery: tracker.searchQuery }, 'No alternative sources found for retry');
        return;
      }

      // Find an alternative that's not the same as the stalled one
      const alternatives = searchResult.results.filter((result: any) => 
        result.downloadUrl !== torrentInfo.tracker && 
        result.seeders >= 2 &&
        result.title.toLowerCase().includes(tracker.name.split(' ')[0].toLowerCase()) // Match first word of title
      );

      if (alternatives.length === 0) {
        logger.warn({ searchQuery: tracker.searchQuery }, 'No suitable alternatives found for retry');
        return;
      }

      // Try the best alternative (highest seeders)
      const bestAlternative = alternatives.sort((a: any, b: any) => b.seeders - a.seeders)[0];
      
      logger.info({ 
        originalHash: tracker.hash,
        alternativeTitle: bestAlternative.title,
        alternativeSeeders: bestAlternative.seeders 
      }, 'Starting alternative download');

      const result = await addTorrent(bestAlternative.downloadUrl);
      
      if (result.success && result.hash) {
        // Track the new download with the same user info
        this.trackDownload(
          result.hash, 
          result.name || bestAlternative.title, 
          tracker.userId, 
          tracker.channelId, 
          tracker.searchQuery
        );
        
        // Remove the old stalled download from tracking
        this.removeTracking(tracker.hash);
        
        logger.info({ 
          oldHash: tracker.hash, 
          newHash: result.hash,
          retryAttempt: tracker.retryCount 
        }, 'Successfully started alternative download');

        // Notify user about successful retry
        await this.notifyRetrySuccess(tracker, bestAlternative.title);
      } else {
        logger.error({ 
          alternativeTitle: bestAlternative.title,
          retryAttempt: tracker.retryCount 
        }, 'Failed to start alternative download');
      }
      
    } catch (error) {
      logger.error({ 
        error, 
        hash: tracker.hash, 
        searchQuery: tracker.searchQuery,
        retryAttempt: tracker.retryCount 
      }, 'Error handling stalled download retry');
    }
  }

  /**
   * Notify user about successful retry with alternative source
   */
  private async notifyRetrySuccess(tracker: DownloadTracker, alternativeTitle: string): Promise<void> {
    if (!this.discordClient) return;

    try {
      const channel = await this.discordClient.channels.fetch(tracker.channelId) as TextChannel;
      if (!channel || !('send' in channel)) return;

      const user = await this.discordClient.users.fetch(tracker.userId);
      const message = `✅ <@${user.id}> Good news! I found an alternative source for **"${tracker.name}"** and started a new download: **"${alternativeTitle}"**. This one should work better!`;

      await channel.send(message);
      
      logger.info({ 
        userId: tracker.userId, 
        originalName: tracker.name,
        alternativeTitle 
      }, 'Retry success notification sent');
      
    } catch (error) {
      logger.error({ error }, 'Failed to send retry success notification');
    }
  }

  /**
   * Sets the Discord client for sending notifications
   * @param client - Discord.js client instance
   */
  public setDiscordClient(client: Client): void {
    this.discordClient = client;
    logger.info('Discord client set for download monitor');
  }

  /**
   * Starts the download monitoring service with periodic checks
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    logger.info('Starting download monitor');
    
    // Check every 30 seconds for completed downloads and stalls
    this.monitorInterval = setInterval(() => {
      Promise.all([
        this.checkForCompletedDownloads(),
        this.checkForStalledDownloads()
      ]).catch(error => {
        logger.error({ error }, 'Error in download monitoring cycle');
      });
    }, 30000);
  }

  /**
   * Stops the download monitoring service and clears active timers
   */
  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    logger.info('Download monitor stopped');
  }

  /**
   * Begins tracking a new download with automatic retry capabilities
   * @param hash - Torrent hash identifier
   * @param name - Display name of the download
   * @param userId - Discord user ID who initiated the download
   * @param channelId - Discord channel ID for notifications
   * @param searchQuery - Original search query for finding alternatives
   */

  public trackDownload(hash: string, name: string, userId: string, channelId: string, searchQuery?: string): void {
    const tracker: DownloadTracker = {
      hash,
      name,
      userId,
      channelId,
      startTime: Date.now(),
      notified: false,
      retryCount: 0,
      stallDetected: false,
      lastProgressCheck: Date.now(),
      lastProgress: 0,
      searchQuery
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

  /**
   * Check for stalled downloads and trigger retry logic
   */
  private async checkForStalledDownloads(): Promise<void> {
    try {
      if (this.trackedDownloads.size === 0) {
        return;
      }

      // Get active torrents to check progress
      const activeTorrents = await getActiveTorrents();
      const activeTorrentMap = new Map(activeTorrents.map(t => [t.hash, t]));

      const now = Date.now();
      const stallThreshold = 10 * 60 * 1000; // 10 minutes with no progress
      const maxRetries = 2;

      for (const [hash, tracker] of this.trackedDownloads.entries()) {
        if (tracker.notified || tracker.stallDetected) {
          continue; // Skip completed or already handled downloads
        }

        const torrentInfo = activeTorrentMap.get(hash);
        if (!torrentInfo) {
          continue; // Torrent not found in active list
        }

        // Check if progress has stalled
        const progressChanged = torrentInfo.progress !== tracker.lastProgress;
        const timeSinceLastCheck = now - tracker.lastProgressCheck;

        if (progressChanged) {
          // Progress is happening, update tracking
          tracker.lastProgress = torrentInfo.progress;
          tracker.lastProgressCheck = now;
        } else if (timeSinceLastCheck > stallThreshold && tracker.retryCount < maxRetries) {
          // Stall detected and retries available
          logger.warn({ 
            hash, 
            name: tracker.name, 
            progress: torrentInfo.progress,
            retryCount: tracker.retryCount 
          }, 'Download stall detected, attempting retry');

          tracker.stallDetected = true;
          tracker.retryCount++;
          
          // Emit event for retry handling
          this.emit('downloadStalled', tracker, torrentInfo);
          
          // Notify user about retry attempt
          await this.notifyRetryAttempt(tracker);
        } else if (tracker.retryCount >= maxRetries && !tracker.stallDetected) {
          // Max retries reached, give up
          logger.error({ 
            hash, 
            name: tracker.name, 
            retryCount: tracker.retryCount 
          }, 'Download failed after maximum retries');

          tracker.stallDetected = true;
          await this.notifyDownloadFailed(tracker);
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error checking for stalled downloads');
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
      
      // Add Audiobookshelf link if enabled
      if (config.audiobookshelf.enabled && config.audiobookshelf.baseUrl) {
        const audiobookshelfUrl = this.generateAudiobookshelfLink(tracker.name);
        message += `\n\n� **Listen Now:**`;
        message += `\n🎧 [Open in Audiobookshelf](${audiobookshelfUrl})`;
        message += `\n\n*The book should appear in your library shortly. You may need to refresh or trigger a library scan.*`;
      }
      
      message += `\n\n�🔍 Ready for another book? Just ask me to search for something!`;

      await channel.send(message);
      
      logger.info({ 
        userId: tracker.userId, 
        bookName: tracker.name, 
        downloadTime,
        audiobookshelfEnabled: config.audiobookshelf.enabled
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

  /**
   * Generate Audiobookshelf deep link for a book
   */
  private generateAudiobookshelfLink(bookName: string): string {
    const baseUrl = config.audiobookshelf.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const libraryId = config.audiobookshelf.libraryId;
    
    if (libraryId) {
      // Link to specific library with search for the book
      return `${baseUrl}/library/${libraryId}?search=${encodeURIComponent(bookName)}`;
    } else {
      // Link to general libraries view with search
      return `${baseUrl}/libraries?search=${encodeURIComponent(bookName)}`;
    }
  }

  /**
   * Notify user about retry attempt for stalled download
   */
  private async notifyRetryAttempt(tracker: DownloadTracker): Promise<void> {
    if (!this.discordClient) {
      logger.warn('Cannot send retry notification - Discord client not set');
      return;
    }

    try {
      const channel = await this.discordClient.channels.fetch(tracker.channelId) as TextChannel;
      if (!channel || !('send' in channel)) {
        logger.warn({ channelId: tracker.channelId }, 'Invalid channel for retry notification');
        return;
      }

      const user = await this.discordClient.users.fetch(tracker.userId);
      const message = `⚠️ <@${user.id}> Your download of **"${tracker.name}"** seems to have stalled. I'm trying to find an alternative source (attempt ${tracker.retryCount}/2)...`;

      await channel.send(message);
      
      logger.info({ 
        userId: tracker.userId, 
        bookName: tracker.name,
        retryCount: tracker.retryCount 
      }, 'Retry attempt notification sent');
      
    } catch (error) {
      logger.error({ 
        error, 
        userId: tracker.userId, 
        channelId: tracker.channelId,
        bookName: tracker.name 
      }, 'Failed to send retry notification');
    }
  }

  /**
   * Notify user about failed download after max retries
   */
  private async notifyDownloadFailed(tracker: DownloadTracker): Promise<void> {
    if (!this.discordClient) {
      logger.warn('Cannot send failure notification - Discord client not set');
      return;
    }

    try {
      const channel = await this.discordClient.channels.fetch(tracker.channelId) as TextChannel;
      if (!channel || !('send' in channel)) {
        logger.warn({ channelId: tracker.channelId }, 'Invalid channel for failure notification');
        return;
      }

      const user = await this.discordClient.users.fetch(tracker.userId);
      const message = `❌ <@${user.id}> Sorry, your download of **"${tracker.name}"** failed after ${tracker.retryCount} retry attempts. This might be due to low seed availability or network issues.\n\n🔍 Would you like me to search for this book again or try a different title?`;

      await channel.send(message);
      
      logger.info({ 
        userId: tracker.userId, 
        bookName: tracker.name,
        retryCount: tracker.retryCount 
      }, 'Download failure notification sent');
      
    } catch (error) {
      logger.error({ 
        error, 
        userId: tracker.userId, 
        channelId: tracker.channelId,
        bookName: tracker.name 
      }, 'Failed to send failure notification');
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
