import { logger } from '../../utils/logger';
import { config } from '../../config/config';
import axios from 'axios';
import { MAMFlowItem } from './mam-flow';

export interface ProwlarrRelayResult {
  success: boolean;
  message: string;
  title?: string;
  author?: string;
}

class ProwlarrRelay {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly indexerId: number;

  constructor() {
    this.baseUrl = config.prowlarr.baseUrl;
    this.apiKey = config.prowlarr.apiKey;
    this.indexerId = config.prowlarr.mamIndexerId || 1;
  }

  /**
   * Send MAM item to Prowlarr for download
   */
  async relayToDownload(item: MAMFlowItem): Promise<ProwlarrRelayResult> {
    try {
      // Validate that we have download metadata
      if (!item.magnetUrl && !item.torrentUrl) {
        throw new Error('No download URL available for this item');
      }

      const downloadUrl = item.magnetUrl || item.torrentUrl!;
      
      // Redact sensitive info in logs
      const redactedUrl = this.redactDownloadUrl(downloadUrl);
      logger.info({ 
        title: item.title, 
        author: item.author, 
        downloadUrl: redactedUrl,
        indexerId: this.indexerId 
      }, 'Relaying item to Prowlarr');

      // Prepare the payload for Prowlarr
      const payload = {
        indexerId: this.indexerId,
        downloadUrl: downloadUrl,
        title: item.title,
        categories: [config.prowlarr.categories[0]], // Use first configured category
        seeders: 1, // Default value
        size: 0, // Unknown size
        publishDate: new Date().toISOString()
      };

      // Send to Prowlarr API
      const response = await axios.post(
        `${this.baseUrl}/api/v1/indexer/${this.indexerId}/download`,
        payload,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status === 200 || response.status === 201) {
        logger.info({ 
          title: item.title, 
          author: item.author 
        }, 'Successfully relayed item to Prowlarr');

        return {
          success: true,
          message: 'Successfully sent to Prowlarr for download',
          title: item.title,
          author: item.author
        };
      } else {
        throw new Error(`Prowlarr API returned status ${response.status}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage, 
        title: item.title, 
        author: item.author 
      }, 'Failed to relay item to Prowlarr');

      return {
        success: false,
        message: `Failed to send to Prowlarr: ${errorMessage}`,
        title: item.title,
        author: item.author
      };
    }
  }

  /**
   * Test Prowlarr connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/health`, {
        headers: {
          'X-Api-Key': this.apiKey
        },
        timeout: 5000
      });

      return response.status === 200;
    } catch (error) {
      logger.error({ error }, 'Prowlarr connectivity test failed');
      return false;
    }
  }

  /**
   * Redact sensitive information from download URLs for logging
   */
  private redactDownloadUrl(url: string): string {
    if (url.startsWith('magnet:')) {
      // Show only the first 10 characters of the infohash
      const match = url.match(/btih:([a-f0-9]{40})/i);
      if (match) {
        const infohash = match[1];
        return `magnet:?xt=urn:btih:${infohash.substring(0, 10)}...`;
      }
      return 'magnet:[redacted]';
    }
    
    // For HTTP URLs, show only the domain
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}/[redacted]`;
    } catch {
      return '[redacted URL]';
    }
  }
}

export const prowlarrRelay = new ProwlarrRelay();
