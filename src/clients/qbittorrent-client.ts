import axios from 'axios';
import { config } from '../config/config';
import { retry } from '../utils/retry';

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
