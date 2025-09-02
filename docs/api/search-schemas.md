# API Reference - Discord Mobile Browse Flow

## Search Schemas

### SearchItem Interface

The core data structure representing a single search result.

```typescript
interface SearchItem {
  id: string;              // Unique identifier for the item
  title: string;           // Book title
  author: string;          // Author name(s)
  format: 'MP3' | 'M4B' | 'EPUB' | 'MOBI' | 'PDF';  // File format
  sizeMB: number;          // File size in megabytes
  seeders: number;         // Number of seeders
  leechers: number;        // Number of leechers
  addedAt: Date;           // When item was added to indexer
  source: 'prowlarr' | 'mam';  // Source indexer
  downloadUrl: string;     // Direct download URL
  infoUrl?: string;        // Optional info/details URL
}
```

### SearchResultPage Interface

Container for paginated search results with metadata.

```typescript
interface SearchResultPage {
  items: SearchItem[];              // Array of search results
  pagination: {
    page: number;                   // Current page (1-based)
    totalPages: number;             // Total number of pages
    totalItems: number;             // Total number of items
    hasNext: boolean;               // Whether next page exists
    hasPrev: boolean;               // Whether previous page exists
  };
  filters: {
    genre: string;                  // Selected genre ID
    timeframe: string;              // Selected timeframe preset
    query?: string;                 // Optional search query
  };
  cacheToken: string;               // Token for cache/state management
}
```

## Genre System

### Genre Definition

```typescript
interface Genre {
  id: string;                       // Unique genre identifier
  label: string;                    // Display name
  synonyms: string[];               // Alternative terms
}
```

### Predefined Genres

The system includes 150+ predefined genres covering:

- **Fiction**: fantasy, sci-fi, mystery, thriller, romance, horror
- **Non-Fiction**: biography, history, science, self-help, business
- **Specialized**: audiobook originals, young adult, children's books

## Timeframe System

### Preset Values

```typescript
type TimeframePreset = '24h' | '3d' | '7d' | '30d' | '90d' | 'all';
```

### Conversion Logic

```typescript
function presetToMaxAgeDays(preset: TimeframePreset): number | null {
  const mapping = {
    '24h': 1,
    '3d': 3, 
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': null    // No age restriction
  };
  return mapping[preset];
}
```

## Cache Management

### Cache Token Format

Cache tokens are base64-encoded strings containing:
- Genre ID
- Timeframe preset
- Page number
- Timestamp

```typescript
interface CacheEntry {
  token: string;
  data: SearchResultPage;
  expiresAt: Date;          // TTL: 10 minutes
}
```

### Cache Operations

```typescript
interface CacheManager {
  get(token: string): SearchResultPage | null;
  set(token: string, data: SearchResultPage): void;
  invalidate(pattern: string): void;
  cleanup(): void;          // Remove expired entries
}
```

## Error Handling

### Error Types

```typescript
interface SearchError {
  type: 'network' | 'rate_limit' | 'not_found' | 'validation' | 'internal';
  message: string;
  code?: string;
  retryAfter?: number;      // For rate limits
}
```

### Error Responses

All errors return user-friendly messages without exposing internal details:

- **Network errors**: "Search service temporarily unavailable"
- **Rate limits**: "Too many requests, please wait {seconds} seconds"
- **No results**: "No results found for {genre} in {timeframe}"
- **Invalid input**: "Please select a valid genre and timeframe"

## Metrics and Monitoring

### Prometheus Metrics

```typescript
// Search request metrics
bookfairy_search_requests_total{genre, timeframe, source}

// Search failure metrics  
bookfairy_search_failures_total{genre, timeframe, error_type}

// Queue request metrics
bookfairy_queue_requests_total{source, format}

// Cache performance metrics
bookfairy_cache_hit_ratio
bookfairy_cache_size_bytes
```

### Logging Format

```typescript
interface LogEntry {
  timestamp: string;        // ISO 8601 format
  level: 'info' | 'warn' | 'error';
  correlationId: string;    // Request tracking ID
  userId: string;           // Hashed user ID (privacy-safe)
  action: string;           // Action being performed
  metadata: Record<string, any>;  // Additional context
}
```

## Performance Specifications

### Response Time Targets

- **Search requests**: < 3 seconds
- **UI interactions**: < 1 second  
- **Cache retrieval**: < 100ms
- **Page navigation**: < 500ms

### Scalability Limits

- **Concurrent searches**: 100+ simultaneous users
- **Cache size**: 10,000 entries max
- **Results per page**: 5 items (mobile optimized)
- **Genre autocomplete**: Sub-second filtering

### Memory Usage

- **Base memory**: < 100MB
- **Cache overhead**: < 500MB
- **Per-user session**: < 1MB
- **Total limit**: < 1GB

## Security Considerations

### Input Validation

All user inputs are validated using Zod schemas:

```typescript
const GenreInputSchema = z.string().min(1).max(50);
const TimeframeInputSchema = z.enum(['24h', '3d', '7d', '30d', '90d', 'all']);
const PageInputSchema = z.number().int().min(1).max(1000);
```

### Privacy Protection

- User IDs are hashed before logging
- Search queries are not stored long-term
- Cache tokens expire automatically
- No PII is exposed in error messages

### Rate Limiting

- Discord's built-in interaction rate limits
- Custom rate limiting for API endpoints
- Exponential backoff for failed requests
- Circuit breaker pattern for external services

---

*This API reference provides the technical specifications for integrating with and extending the Discord Mobile Browse Flow feature.*
