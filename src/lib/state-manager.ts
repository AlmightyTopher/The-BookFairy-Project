import { logger } from '../utils/logger.js';

// In-memory storage with TTL (could be replaced with Redis later)
interface StoredItem<T> {
  data: T;
  expiresAt: number;
}

interface PageMapping {
  mode: string;
  page: number;
  ids: string[];
  timestamp: number;
}

interface DescribeSession {
  userId: string;
  originalQuery: string;
  clarifications: string[];
  currentResults?: any[];
  state: 'active' | 'waiting_clarifier' | 'completed';
  timestamp: number;
}

interface WishlistItem {
  id: string;
  bookId: string;
  title: string;
  authors: string[];
  addedAt: number;
}

export class StateManager {
  private pageMapping = new Map<string, StoredItem<PageMapping>>();
  private describeSessions = new Map<string, StoredItem<DescribeSession>>();
  private wishlists = new Map<string, StoredItem<WishlistItem[]>>();
  
  private readonly PAGE_MAP_TTL = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours
  private readonly WISHLIST_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  constructor() {
    // Clean up expired items every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  // Page mapping for numeric button choices (S2.1)
  setPageMap(userId: string, mode: string, page: number, ids: string[]): void {
    const key = `${userId}:${mode}`;
    const mapping: PageMapping = {
      mode,
      page,
      ids: [...ids], // Clone array
      timestamp: Date.now()
    };
    
    this.pageMapping.set(key, {
      data: mapping,
      expiresAt: Date.now() + this.PAGE_MAP_TTL
    });
    
    logger.debug({ userId, mode, page, idCount: ids.length }, 'Page mapping set');
  }
  
  resolveChoice(userId: string, mode: string, page: number, choice: number): string | null {
    const key = `${userId}:${mode}`;
    const stored = this.pageMapping.get(key);
    
    if (!stored || Date.now() > stored.expiresAt) {
      logger.warn({ userId, mode, page, choice }, 'Page mapping expired or not found');
      return null;
    }
    
    const mapping = stored.data;
    if (mapping.page !== page) {
      logger.warn({ userId, mode, expectedPage: page, actualPage: mapping.page }, 'Page mismatch in mapping');
      return null;
    }
    
    // Convert 1-based choice to 0-based index
    const index = choice - 1;
    if (index < 0 || index >= mapping.ids.length) {
      logger.warn({ userId, mode, page, choice, idsLength: mapping.ids.length }, 'Choice out of range');
      return null;
    }
    
    const selectedId = mapping.ids[index];
    logger.debug({ userId, mode, page, choice, selectedId }, 'Choice resolved');
    return selectedId;
  }
  
  // Describe session persistence (S2.2)
  startDescribe(userId: string, query: string): void {
    const session: DescribeSession = {
      userId,
      originalQuery: query,
      clarifications: [],
      state: 'active',
      timestamp: Date.now()
    };
    
    this.describeSessions.set(userId, {
      data: session,
      expiresAt: Date.now() + this.SESSION_TTL
    });
    
    logger.info({ userId, query }, 'Describe session started');
  }
  
  getDescribe(userId: string): DescribeSession | null {
    const stored = this.describeSessions.get(userId);
    
    if (!stored || Date.now() > stored.expiresAt) {
      if (stored) {
        this.describeSessions.delete(userId);
        logger.debug({ userId }, 'Describe session expired');
      }
      return null;
    }
    
    return stored.data;
  }
  
  updateDescribe(userId: string, patch: Partial<DescribeSession>): void {
    const stored = this.describeSessions.get(userId);
    
    if (!stored || Date.now() > stored.expiresAt) {
      logger.warn({ userId }, 'Cannot update non-existent or expired describe session');
      return;
    }
    
    const updated = { ...stored.data, ...patch };
    this.describeSessions.set(userId, {
      data: updated,
      expiresAt: stored.expiresAt // Keep original expiry
    });
    
    logger.debug({ userId, patch }, 'Describe session updated');
  }
  
  endDescribe(userId: string): void {
    this.describeSessions.delete(userId);
    logger.info({ userId }, 'Describe session ended');
  }
  
  // Check if user has resumable session on startup
  hasResumableSession(userId: string): boolean {
    const session = this.getDescribe(userId);
    return session !== null && session.state !== 'completed';
  }
  
  // Wishlist persistence (S2.3)
  wishlistAdd(userId: string, bookId: string, title: string, authors: string[]): void {
    let stored = this.wishlists.get(userId);
    let items: WishlistItem[] = [];
    
    if (stored && Date.now() <= stored.expiresAt) {
      items = stored.data;
    }
    
    // Check if already exists
    const exists = items.some(item => item.bookId === bookId);
    if (exists) {
      logger.debug({ userId, bookId }, 'Book already in wishlist');
      return;
    }
    
    const newItem: WishlistItem = {
      id: `${userId}:${bookId}:${Date.now()}`,
      bookId,
      title,
      authors: [...authors],
      addedAt: Date.now()
    };
    
    items.push(newItem);
    
    this.wishlists.set(userId, {
      data: items,
      expiresAt: Date.now() + this.WISHLIST_TTL
    });
    
    logger.info({ userId, bookId, title }, 'Book added to wishlist');
  }
  
  wishlistList(userId: string, limit: number = 10, offset: number = 0): WishlistItem[] {
    const stored = this.wishlists.get(userId);
    
    if (!stored || Date.now() > stored.expiresAt) {
      return [];
    }
    
    const items = stored.data;
    // Sort by addedAt desc (newest first)
    const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);
    
    return sorted.slice(offset, offset + limit);
  }
  
  wishlistClear(userId: string): number {
    const stored = this.wishlists.get(userId);
    const count = stored ? stored.data.length : 0;
    
    this.wishlists.delete(userId);
    logger.info({ userId, clearedCount: count }, 'Wishlist cleared');
    
    return count;
  }
  
  wishlistRemove(userId: string, itemId: string): boolean {
    const stored = this.wishlists.get(userId);
    
    if (!stored || Date.now() > stored.expiresAt) {
      return false;
    }
    
    const items = stored.data;
    const initialLength = items.length;
    const filtered = items.filter(item => item.id !== itemId);
    
    if (filtered.length < initialLength) {
      this.wishlists.set(userId, {
        data: filtered,
        expiresAt: stored.expiresAt
      });
      
      logger.info({ userId, itemId }, 'Item removed from wishlist');
      return true;
    }
    
    return false;
  }
  
  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean page mappings
    const pageMappingKeys = Array.from(this.pageMapping.keys());
    for (const key of pageMappingKeys) {
      const stored = this.pageMapping.get(key);
      if (stored && now > stored.expiresAt) {
        this.pageMapping.delete(key);
        cleaned++;
      }
    }
    
    // Clean describe sessions
    const sessionKeys = Array.from(this.describeSessions.keys());
    for (const key of sessionKeys) {
      const stored = this.describeSessions.get(key);
      if (stored && now > stored.expiresAt) {
        this.describeSessions.delete(key);
        cleaned++;
      }
    }
    
    // Clean wishlists
    const wishlistKeys = Array.from(this.wishlists.keys());
    for (const key of wishlistKeys) {
      const stored = this.wishlists.get(key);
      if (stored && now > stored.expiresAt) {
        this.wishlists.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug({ cleaned }, 'Cleaned up expired state items');
    }
  }
  
  // Stats for monitoring
  getStats(): { pageMappings: number; describeSessions: number; wishlists: number } {
    return {
      pageMappings: this.pageMapping.size,
      describeSessions: this.describeSessions.size,
      wishlists: this.wishlists.size
    };
  }
}

// Global singleton instance
export const stateManager = new StateManager();