import { vi } from 'vitest';

export interface MockTorrent {
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
  state: 'allocating' | 'downloading' | 'pausedDL' | 'queuedDL' | 'stalledDL' | 'uploading' | 'pausedUP' | 'queuedUP' | 'stalledUP' | 'checkingUP' | 'checkingDL' | 'error' | 'missingFiles' | 'queuedForChecking' | 'checkingResumeData';
  category: string;
  tags: string;
  save_path: string;
  completed: number;
  max_ratio: number;
  max_seeding_time: number;
  ratio_limit: number;
  seeding_time_limit: number;
  seen_complete: number;
  last_activity: number;
  time_active: number;
  total_size: number;
}

export interface MockLoginResponse {
  success: boolean;
  cookie?: string;
}

export interface MockAddTorrentResponse {
  success: boolean;
  hash?: string;
  error?: string;
}

export class MockQBittorrentClient {
  private torrents: Map<string, MockTorrent> = new Map();
  private isLoggedIn = false;
  private connectionStatus: 'connected' | 'disconnected' | 'unauthorized' = 'connected';
  private responseDelay = 0;

  constructor() {
    this.setupDefaultTorrents();
  }

  private setupDefaultTorrents(): void {
    // Add some sample torrents in various states
    this.torrents.set('hash001', {
      hash: 'hash001',
      name: 'Dune by Frank Herbert [ENG MP3] [Narrated by Scott Brick]',
      size: 687865856,
      progress: 1.0,
      dlspeed: 0,
      upspeed: 1024000,
      priority: 1,
      num_seeds: 47,
      num_leechs: 3,
      ratio: 1.5,
      eta: 8640000,
      state: 'uploading',
      category: 'audiobooks',
      tags: 'book-fairy',
      save_path: '/downloads/audiobooks/',
      completed: 687865856,
      max_ratio: -1,
      max_seeding_time: -1,
      ratio_limit: -2,
      seeding_time_limit: -2,
      seen_complete: Date.now() - 3600000,
      last_activity: Date.now() - 300000,
      time_active: 7200000,
      total_size: 687865856
    });

    this.torrents.set('hash002', {
      hash: 'hash002',
      name: 'Harry Potter and the Sorcerers Stone by J.K. Rowling [ENG MP3]',
      size: 456789012,
      progress: 0.75,
      dlspeed: 2048000,
      upspeed: 0,
      priority: 1,
      num_seeds: 89,
      num_leechs: 12,
      ratio: 0.1,
      eta: 900,
      state: 'downloading',
      category: 'audiobooks',
      tags: 'book-fairy',
      save_path: '/downloads/audiobooks/',
      completed: 342591759,
      max_ratio: -1,
      max_seeding_time: -1,
      ratio_limit: -2,
      seeding_time_limit: -2,
      seen_complete: 0,
      last_activity: Date.now() - 60000,
      time_active: 1800000,
      total_size: 456789012
    });
  }

  setConnectionStatus(status: 'connected' | 'disconnected' | 'unauthorized'): void {
    this.connectionStatus = status;
    if (status === 'disconnected' || status === 'unauthorized') {
      this.isLoggedIn = false;
    }
  }

  setResponseDelay(ms: number): void {
    this.responseDelay = ms;
  }

  async login(username: string, password: string): Promise<MockLoginResponse> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.connectionStatus === 'disconnected') {
      throw new Error('Connection refused');
    }

    if (this.connectionStatus === 'unauthorized') {
      return { success: false };
    }

    if (username === 'testuser' && password === 'testpass') {
      this.isLoggedIn = true;
      return { success: true, cookie: 'session_cookie_123' };
    }

    return { success: false };
  }

  async addTorrent(magnet: string, options: any = {}): Promise<MockAddTorrentResponse> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      return { success: false, error: 'Not authenticated' };
    }

    if (this.connectionStatus !== 'connected') {
      return { success: false, error: 'Connection error' };
    }

    // Generate a new hash for the torrent
    const hash = `hash${Date.now().toString(36)}`;
    
    // Extract name from magnet link or use provided name
    let name = options.name || 'Unknown Torrent';
    const dnMatch = magnet.match(/dn=([^&]+)/);
    if (dnMatch) {
      name = decodeURIComponent(dnMatch[1].replace(/\+/g, ' '));
    }

    // Create new torrent entry
    const newTorrent: MockTorrent = {
      hash,
      name,
      size: 500000000, // Default 500MB
      progress: 0,
      dlspeed: 0,
      upspeed: 0,
      priority: 1,
      num_seeds: 10,
      num_leechs: 2,
      ratio: 0,
      eta: 3600,
      state: 'queuedDL',
      category: options.category || 'audiobooks',
      tags: options.tags || 'book-fairy',
      save_path: options.savepath || '/downloads/audiobooks/',
      completed: 0,
      max_ratio: -1,
      max_seeding_time: -1,
      ratio_limit: -2,
      seeding_time_limit: -2,
      seen_complete: 0,
      last_activity: Date.now(),
      time_active: 0,
      total_size: 500000000
    };

    this.torrents.set(hash, newTorrent);

    // Simulate starting download after a short delay
    setTimeout(() => {
      const torrent = this.torrents.get(hash);
      if (torrent) {
        torrent.state = 'downloading';
        torrent.dlspeed = 1024000; // 1MB/s
      }
    }, 1000);

    return { success: true, hash };
  }

  async getTorrents(): Promise<MockTorrent[]> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      throw new Error('Not authenticated');
    }

    return Array.from(this.torrents.values());
  }

  async getTorrentInfo(hash: string): Promise<MockTorrent | null> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      throw new Error('Not authenticated');
    }

    return this.torrents.get(hash) || null;
  }

  async deleteTorrent(hash: string, deleteFiles: boolean = false): Promise<boolean> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      throw new Error('Not authenticated');
    }

    return this.torrents.delete(hash);
  }

  async pauseTorrent(hash: string): Promise<boolean> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      throw new Error('Not authenticated');
    }

    const torrent = this.torrents.get(hash);
    if (torrent) {
      torrent.state = torrent.progress < 1 ? 'pausedDL' : 'pausedUP';
      torrent.dlspeed = 0;
      torrent.upspeed = 0;
      return true;
    }

    return false;
  }

  async resumeTorrent(hash: string): Promise<boolean> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (!this.isLoggedIn) {
      throw new Error('Not authenticated');
    }

    const torrent = this.torrents.get(hash);
    if (torrent) {
      torrent.state = torrent.progress < 1 ? 'downloading' : 'uploading';
      if (torrent.progress < 1) {
        torrent.dlspeed = 1024000;
      } else {
        torrent.upspeed = 512000;
      }
      return true;
    }

    return false;
  }

  // Simulate torrent completion
  completeTorrent(hash: string): void {
    const torrent = this.torrents.get(hash);
    if (torrent) {
      torrent.progress = 1.0;
      torrent.completed = torrent.total_size;
      torrent.state = 'uploading';
      torrent.dlspeed = 0;
      torrent.upspeed = 512000;
      torrent.seen_complete = Date.now();
    }
  }

  // Simulate download progress
  updateProgress(hash: string, progress: number): void {
    const torrent = this.torrents.get(hash);
    if (torrent && progress >= 0 && progress <= 1) {
      torrent.progress = progress;
      torrent.completed = Math.floor(torrent.total_size * progress);
      
      if (progress >= 1) {
        this.completeTorrent(hash);
      }
    }
  }

  // Test utility methods
  reset(): void {
    this.torrents.clear();
    this.setupDefaultTorrents();
    this.isLoggedIn = false;
    this.connectionStatus = 'connected';
    this.responseDelay = 0;
  }

  simulateNetworkError(): void {
    this.setConnectionStatus('disconnected');
  }

  simulateAuthFailure(): void {
    this.setConnectionStatus('unauthorized');
  }

  simulateSlowResponse(ms: number = 5000): void {
    this.setResponseDelay(ms);
  }

  // Force login for tests
  forceLogin(): void {
    this.isLoggedIn = true;
  }
}

export const mockQBittorrentClient = new MockQBittorrentClient();

// Vitest mock functions
export const mockLogin = vi.fn().mockImplementation(mockQBittorrentClient.login.bind(mockQBittorrentClient));
export const mockAddTorrent = vi.fn().mockImplementation(mockQBittorrentClient.addTorrent.bind(mockQBittorrentClient));
export const mockGetTorrents = vi.fn().mockImplementation(mockQBittorrentClient.getTorrents.bind(mockQBittorrentClient));
export const mockGetTorrentInfo = vi.fn().mockImplementation(mockQBittorrentClient.getTorrentInfo.bind(mockQBittorrentClient));
export const mockDeleteTorrent = vi.fn().mockImplementation(mockQBittorrentClient.deleteTorrent.bind(mockQBittorrentClient));
export const mockPauseTorrent = vi.fn().mockImplementation(mockQBittorrentClient.pauseTorrent.bind(mockQBittorrentClient));
export const mockResumeTorrent = vi.fn().mockImplementation(mockQBittorrentClient.resumeTorrent.bind(mockQBittorrentClient));
