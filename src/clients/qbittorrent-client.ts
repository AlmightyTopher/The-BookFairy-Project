import axios from 'axios';
import { config } from '../config/config';
import { retry } from '../utils/retry';
import { logger } from '../utils/logger';

const qbittorrentClient = axios.create({
  baseURL: config.qbittorrent.baseUrl,
  timeout: config.qbittorrent.timeout,
});

// Authenticate and get a session cookie
async function getAuthCookie() {
  const params = new URLSearchParams();
  params.append('username', config.qbittorrent.username);
  params.append('password', config.qbittorrent.password);
  
  const authResponse = await qbittorrentClient.post(
    '/api/v2/auth/login',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (authResponse.data === 'Ok.') {
    return authResponse.headers['set-cookie']?.[0];
  }
  throw new Error('qBittorrent authentication failed');
}

export async function addTorrent(downloadUrl: string) {
  // No authentication needed for local connections
  const response = await retry(() =>
    qbittorrentClient.post(
      '/api/v2/torrents/add',
      `urls=${encodeURIComponent(downloadUrl)}&category=${config.qbittorrent.category}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
  );
  
  // Get the hash of the added torrent by finding the most recently added torrent
  // qBittorrent API doesn't return hash directly, so we need to find it
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for torrent to be added
    const torrents = await getTorrentList();
    
    // Find the most recently added torrent with our category
    const recentTorrent = torrents
      .filter((t: TorrentInfo) => t.category === config.qbittorrent.category)
      .sort((a: TorrentInfo, b: TorrentInfo) => b.added_on - a.added_on)[0];
    
    return {
      success: response.data === 'Ok.',
      hash: recentTorrent?.hash,
      name: recentTorrent?.name
    };
  } catch (error) {
    logger.error({ error }, 'Error getting torrent hash after adding');
    return {
      success: response.data === 'Ok.',
      hash: undefined,
      name: undefined
    };
  }
}

export async function getTorrentList(filter?: string) {
  const response = await retry(() =>
    qbittorrentClient.get('/api/v2/torrents/info', {
      params: {
        filter: filter || 'all',
        category: config.qbittorrent.category
      }
    })
  );
  return response.data;
}

export async function getTorrentProperties(hash: string) {
  const response = await retry(() =>
    qbittorrentClient.get('/api/v2/torrents/properties', {
      params: { hash }
    })
  );
  return response.data;
}

export interface TorrentInfo {
  hash: string;
  name: string;
  size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  priority: number;
  num_seeds: number;
  num_leechs: number;
  ratio: number;
  eta: number;
  state: string;
  seq_dl: boolean;
  f_l_piece_prio: boolean;
  category: string;
  tags: string;
  super_seeding: boolean;
  force_start: boolean;
  save_path: string;
  completion_on: number;
  tracker: string;
  downloaded_session: number;
  uploaded_session: number;
  downloaded: number;
  uploaded: number;
  time_active: number;
  seeding_time: number;
  availability: number;
  added_on: number;
  completed_on: number;
}

export async function getCompletedTorrents(): Promise<TorrentInfo[]> {
  const response = await retry(() =>
    qbittorrentClient.get('/api/v2/torrents/info', {
      params: {
        filter: 'completed',
        category: config.qbittorrent.category
      }
    })
  );
  return response.data;
}

export async function getActiveTorrents(): Promise<TorrentInfo[]> {
  const response = await retry(() =>
    qbittorrentClient.get('/api/v2/torrents/info', {
      params: {
        filter: 'downloading',
        category: config.qbittorrent.category
      }
    })
  );
  return response.data;
}

export async function checkQbittorrentHealth() {
  const startTime = Date.now();
  try {
    // No authentication needed for local connections
    const response = await qbittorrentClient.get('/api/v2/app/version', {
      timeout: 2000
    });
    return {
      status: 'up' as 'up' | 'down' | 'degraded',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'down' as 'up' | 'down' | 'degraded',
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}
