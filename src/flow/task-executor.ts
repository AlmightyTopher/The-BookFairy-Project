import { logger } from '../utils/logger.js';

interface TaskContext {
  userId: string;
  query?: string;
  selectedGenre?: string;
  timeWindow?: string;
  selectedBook?: any;
  searchResults?: any[];
}

interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class TaskExecutor {
  private mamCredentials: {
    username?: string;
    password?: string;
  };

  constructor() {
    // Load MAM credentials from environment
    this.mamCredentials = {
      username: process.env.MAM_USERNAME,
      password: process.env.MAM_PASSWORD
    };
    
    if (!this.mamCredentials.username || !this.mamCredentials.password) {
      logger.warn('MAM credentials not found in environment variables');
    }
  }

  public async executeTask(taskName: string, context: TaskContext): Promise<TaskResult> {
    // Define task requirements locally to avoid circular dependency
    const taskRequirements: Record<string, string[]> = {
      'fowler_search_title': ['MAM_USERNAME', 'MAM_PASSWORD'],
      'fowler_search_author': ['MAM_USERNAME', 'MAM_PASSWORD'],
      'fowler_search_description': ['MAM_USERNAME', 'MAM_PASSWORD'],
      'mam_fetch_genre': ['MAM_USERNAME', 'MAM_PASSWORD'],
      'fowler_fuzzy_match': ['MAM_USERNAME', 'MAM_PASSWORD'],
      'goodreads_lookup': [],
      'help_dm_admin': []
    };

    if (!taskRequirements[taskName]) {
      logger.error({ taskName }, 'Unknown task');
      return { success: false, error: 'Unknown task' };
    }

    // Check if required environment variables are available
    const requiredEnvVars = taskRequirements[taskName];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logger.error({ taskName, envVar }, 'Missing required environment variable');
        return { success: false, error: `Missing required environment variable: ${envVar}` };
      }
    }

    try {
      switch (taskName) {
        case 'fowler_search_title':
          return await this.fowlerSearchTitle(context);
        case 'fowler_search_author':
          return await this.fowlerSearchAuthor(context);
        case 'fowler_search_description':
          return await this.fowlerSearchDescription(context);
        case 'mam_fetch_genre':
          return await this.mamFetchGenre(context);
        case 'goodreads_lookup':
          return await this.goodreadsLookup(context);
        case 'fowler_fuzzy_match':
          return await this.fowlerFuzzyMatch(context);
        case 'help_dm_admin':
          return await this.helpDmAdmin(context);
        default:
          logger.warn({ taskName }, 'Task not implemented');
          return { success: false, error: 'Task not implemented' };
      }
    } catch (error) {
      logger.error({ error, taskName }, 'Task execution failed');
      return { success: false, error: 'Task execution failed' };
    }
  }

  private async fowlerSearchTitle(context: TaskContext): Promise<TaskResult> {
    logger.info({ query: context.query }, 'Executing fowler_search_title');
    
    // TODO: Implement actual Fowler/Prowlarr search
    // For now, return mock data
    const mockResults = [
      {
        title: `${context.query} - Mock Result 1`,
        author: 'Mock Author 1',
        series: 'Mock Series',
        rating: 4.5
      },
      {
        title: `${context.query} - Mock Result 2`, 
        author: 'Mock Author 2',
        series: null,
        rating: 4.2
      }
    ];

    return {
      success: true,
      data: mockResults
    };
  }

  private async fowlerSearchAuthor(context: TaskContext): Promise<TaskResult> {
    logger.info({ query: context.query }, 'Executing fowler_search_author');
    
    // TODO: Implement actual Fowler/Prowlarr search
    // For now, return mock data
    const mockResults = [
      {
        title: 'Book 1',
        author: context.query,
        series: 'Series A',
        rating: 4.7
      },
      {
        title: 'Book 2',
        author: context.query,
        series: 'Series B', 
        rating: 4.3
      }
    ];

    return {
      success: true,
      data: mockResults
    };
  }

  private async fowlerSearchDescription(context: TaskContext): Promise<TaskResult> {
    logger.info({ query: context.query }, 'Executing fowler_search_description');
    
    // TODO: Implement actual Fowler/Prowlarr search
    // For now, return mock data
    const mockResults = [
      {
        title: 'Book matching description',
        author: 'Description Author',
        series: null,
        rating: 4.1
      }
    ];

    return {
      success: true,
      data: mockResults
    };
  }

  private async mamFetchGenre(context: TaskContext): Promise<TaskResult> {
    logger.info({ 
      genre: context.selectedGenre, 
      timeWindow: context.timeWindow 
    }, 'Executing mam_fetch_genre');
    
    // TODO: Implement actual MAM genre fetching
    // For now, return mock data
    const mockResults = [
      {
        title: `${context.selectedGenre} Book 1`,
        author: 'Genre Author 1',
        series: 'Genre Series',
        rating: 4.6
      },
      {
        title: `${context.selectedGenre} Book 2`,
        author: 'Genre Author 2', 
        series: null,
        rating: 4.4
      }
    ];

    return {
      success: true,
      data: mockResults
    };
  }

  private async goodreadsLookup(context: TaskContext): Promise<TaskResult> {
    logger.info({ book: context.selectedBook?.title }, 'Executing goodreads_lookup');
    
    // TODO: Implement actual Goodreads lookup
    // For now, return mock enhanced data
    const enhancedBook = {
      ...context.selectedBook,
      summary: 'This is a mock summary from Goodreads. In a real implementation, this would be fetched from the Goodreads API.',
      series_number: context.selectedBook?.series ? 1 : null,
      goodreads_url: 'https://goodreads.com/mock-book'
    };

    return {
      success: true,
      data: enhancedBook
    };
  }

  private async fowlerFuzzyMatch(context: TaskContext): Promise<TaskResult> {
    logger.info({ book: context.selectedBook?.title }, 'Executing fowler_fuzzy_match');
    
    // TODO: Implement actual fuzzy matching and download initiation
    // For now, simulate download start
    const downloadId = `dl_${Date.now()}`;
    
    logger.info({ 
      downloadId, 
      title: context.selectedBook?.title,
      author: context.selectedBook?.author 
    }, 'Download started');

    return {
      success: true,
      data: {
        downloadId,
        status: 'started',
        title: context.selectedBook?.title,
        estimatedSize: '125 MB'
      }
    };
  }

  private async helpDmAdmin(context: TaskContext): Promise<TaskResult> {
    logger.info({ userId: context.userId }, 'Executing help_dm_admin');
    
    // TODO: Implement actual admin DM functionality
    // For now, just log the request
    logger.info({ userId: context.userId }, 'User requested admin help');

    return {
      success: true,
      data: {
        message: 'Admin has been notified'
      }
    };
  }

  public validateEnvironment(): { valid: boolean; missingVars: string[] } {
    const requiredVars = ['MAM_USERNAME', 'MAM_PASSWORD'];
    const missingVars: string[] = [];

    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    return {
      valid: missingVars.length === 0,
      missingVars
    };
  }
}

// Export class only, avoid module-level instantiation
