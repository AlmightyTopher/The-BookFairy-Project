import axios from 'axios';
import { config } from '../config/config';
import { retry } from '../utils/retry';

const readarrClient = axios.create({
  baseURL: config.readarr.baseUrl,
  headers: {
    'X-Api-Key': config.readarr.apiKey,
  },
  timeout: config.readarr.timeout,
});

export async function searchReadarr(term: string) {
  const response = await retry(
    () => readarrClient.get('/api/v1/book/lookup', { params: { term } }),
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      shouldRetry: (error: any) => {
        // Retry on 503 Service Unavailable or network errors
        return error.response?.status === 503 || !error.response;
      },
    }
  );
  return response.data;
}

export async function addBookToReadarr(book: any) {
  // Format the book object according to Readarr API requirements
  const formattedBook = {
    ...book,
    addOptions: {
      monitor: true,
      searchForNewBook: true,
      type: 'automatic'
    },
    monitored: true,
    qualityProfileId: 1, // Default quality profile
    rootFolderPath: '/books', // Default root folder for books
    minimumAvailability: 'announced'
  };

  const response = await retry(
    () => readarrClient.post('/api/v1/book', formattedBook),
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      shouldRetry: (error: any) => {
        // Retry on 500, 503, or network errors
        return (
          error.response?.status === 500 ||
          error.response?.status === 503 ||
          !error.response
        );
      },
    }
  );
  return response.data;
}

export async function checkReadarrHealth() {
  const startTime = Date.now();
  try {
    const response = await readarrClient.get('/api/v1/system/status', {
      timeout: 2000,
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
