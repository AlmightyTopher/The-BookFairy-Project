# Discord Mobile Browse Flow - Technical Documentation

## 📋 Feature Overview

The Discord Mobile Browse Flow introduces a modern slash command interface that provides genre-based browsing with timeframe filtering, optimized for mobile Discord users.

### Core Functionality

- `/bookfairy browse` slash command with autocomplete
- Genre selection with 150+ predefined categories
- Timeframe filtering (24h, 3d, 7d, 30d, 90d, all)
- Mobile-optimized ephemeral UI with pagination
- Enhanced search results with queue functionality
- Unified indexer routing (Prowlarr + optional MAM)

## 🏗️ Architecture Overview

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Discord UI    │    │   Bot Service    │    │   Indexers      │
│                 │    │                  │    │                 │
│ /bookfairy      │───▶│ Slash Commands   │───▶│ Prowlarr        │
│ browse          │    │ Handler          │    │ MAM Proxy       │
│                 │    │                  │    │ (optional)      │
│ Ephemeral UI    │◀───│ Results          │◀───│                 │
│ • Genre Select  │    │ Formatter        │    │                 │
│ • Timeframe     │    │                  │    │                 │
│ • Pagination    │    │ Queue Endpoint   │───▶│ Download Queue  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```text
book-fairy/
├── data/
│   ├── genres.json              # Genre definitions with synonyms
│   └── timeframes.json          # Timeframe preset definitions
├── src/
│   ├── schemas/
│   │   └── search.ts           # Zod schemas for search types
│   ├── services/
│   │   └── indexers/
│   │       └── router.ts       # Unified indexer routing
│   ├── commands/
│   │   └── browse.ts           # Slash command implementation
│   ├── ui/
│   │   ├── genre-selector.ts   # Genre selection components
│   │   ├── timeframe-selector.ts # Timeframe selection components
│   │   └── results-presenter.ts # Results pagination UI
│   └── utils/
│       ├── timeframe-mapper.ts # Preset to days conversion
│       └── cache-manager.ts    # In-memory result caching
├── tests/
│   ├── unit/
│   │   ├── schemas.test.ts     # Schema validation tests
│   │   ├── timeframe-mapper.test.ts
│   │   └── indexer-router.test.ts
│   └── integration/
│       └── browse-flow.test.ts # End-to-end flow tests
├── scripts/
│   └── smoke-search.ts         # Smoke test script
└── docs/
    ├── api/
    │   ├── search-schemas.md    # API schema documentation
    │   └── queue-endpoint.md    # Queue API documentation
    └── user-guides/
        └── mobile-browsing.md   # User guide for mobile interface
```

## 🗂️ Data Structures

### Genre Definition (`data/genres.json`)

```json
{
  "genres": [
    {
      "id": "fantasy",
      "label": "Fantasy",
      "synonyms": ["fantasy fiction", "epic fantasy", "urban fantasy", "magical realism"]
    },
    {
      "id": "sci-fi",
      "label": "Science Fiction",
      "synonyms": ["science fiction", "sci-fi", "scifi", "space opera", "cyberpunk"]
    }
    // ... 148+ more entries
  ]
}
```

### Timeframe Presets (`data/timeframes.json`)

```json
{
  "presets": ["24h", "3d", "7d", "30d", "90d", "all"],
  "descriptions": {
    "24h": "Last 24 hours",
    "3d": "Last 3 days", 
    "7d": "Last week",
    "30d": "Last month",
    "90d": "Last 3 months",
    "all": "All time"
  }
}
```

### Search Result Schema (`src/schemas/search.ts`)

```typescript
import { z } from 'zod';

export const SearchItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  format: z.enum(['MP3', 'M4B', 'EPUB', 'MOBI', 'PDF']),
  sizeMB: z.number(),
  seeders: z.number(),
  leechers: z.number(),
  addedAt: z.date(),
  source: z.enum(['prowlarr', 'mam']),
  downloadUrl: z.string(),
  infoUrl: z.string().optional()
});

export const SearchResultPageSchema = z.object({
  items: z.array(SearchItemSchema),
  pagination: z.object({
    page: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: z.object({
    genre: z.string(),
    timeframe: z.string(),
    query: z.string().optional()
  }),
  cacheToken: z.string()
});

export type SearchItem = z.infer<typeof SearchItemSchema>;
export type SearchResultPage = z.infer<typeof SearchResultPageSchema>;
```

## 🔧 Core Components

### 1. Slash Command Handler (`src/commands/browse.ts`)

```typescript
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { genreSelector } from '../ui/genre-selector';
import { searchByGenre } from '../services/indexers/router';

export const browseCommand = new SlashCommandBuilder()
  .setName('browse')
  .setDescription('Browse audiobooks by genre and timeframe')
  .addStringOption(option =>
    option
      .setName('genre')
      .setDescription('Genre to browse')
      .setAutocomplete(true)
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('timeframe')
      .setDescription('Time period to search')
      .setRequired(false)
      .addChoices(
        { name: 'Last 24 hours', value: '24h' },
        { name: 'Last 3 days', value: '3d' },
        { name: 'Last week', value: '7d' },
        { name: 'Last month', value: '30d' },
        { name: 'Last 3 months', value: '90d' },
        { name: 'All time', value: 'all' }
      )
  );

export async function handleBrowseCommand(interaction: CommandInteraction) {
  const genre = interaction.options.getString('genre');
  const timeframe = interaction.options.getString('timeframe');

  if (genre && timeframe) {
    // Direct search with both parameters
    return await performSearch(interaction, genre, timeframe);
  } else {
    // Show ephemeral UI for selection
    return await showBrowseInterface(interaction, genre, timeframe);
  }
}
```

### 2. Genre Selector UI (`src/ui/genre-selector.ts`)

```typescript
import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { genres } from '../../data/genres.json';

export class GenreSelector {
  private static readonly ITEMS_PER_PAGE = 25;

  static createGenrePage(page: number = 0): ActionRowBuilder[] {
    const startIdx = page * this.ITEMS_PER_PAGE;
    const endIdx = startIdx + this.ITEMS_PER_PAGE;
    const pageGenres = genres.slice(startIdx, endIdx);
    const totalPages = Math.ceil(genres.length / this.ITEMS_PER_PAGE);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`genre_select_${page}`)
      .setPlaceholder(`Select genre (Page ${page + 1} of ${totalPages})`)
      .addOptions(
        pageGenres.map(genre => ({
          label: genre.label,
          value: genre.id,
          description: genre.synonyms.slice(0, 2).join(', ')
        }))
      );

    const navigationRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`genre_prev_${page}`)
          .setLabel('Previous')
          .setStyle(2)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId(`genre_next_${page}`)
          .setLabel('Next')
          .setStyle(2)
          .setDisabled(page >= totalPages - 1),
        new ButtonBuilder()
          .setCustomId('genre_cancel')
          .setLabel('Cancel')
          .setStyle(4)
      );

    return [
      new ActionRowBuilder().addComponents(selectMenu),
      navigationRow
    ];
  }

  static createEmbed(page: number): EmbedBuilder {
    const totalPages = Math.ceil(genres.length / this.ITEMS_PER_PAGE);
    return new EmbedBuilder()
      .setTitle('📚 Select a Genre')
      .setDescription(`Choose from ${genres.length} available genres`)
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
      .setColor(0x7c3aed);
  }
}
```

### 3. Indexer Router (`src/services/indexers/router.ts`)

```typescript
import { SearchResultPage, SearchItem } from '../../schemas/search';
import { prowlarrClient } from '../../clients/prowlarr-client';
import { mamProxyClient } from '../../clients/mam-proxy-client';
import { presetToMaxAgeDays } from '../../utils/timeframe-mapper';

export class IndexerRouter {
  async searchByGenre(
    genre: string, 
    timeframe: string, 
    page: number = 1
  ): Promise<SearchResultPage> {
    const maxAgeDays = presetToMaxAgeDays(timeframe);
    const pageSize = 5;

    try {
      // Primary search through Prowlarr
      const prowlarrResults = await this.searchProwlarr(genre, maxAgeDays, page, pageSize);
      
      // Optional MAM search if configured and Prowlarr results insufficient
      let mamResults: SearchItem[] = [];
      if (prowlarrResults.items.length < pageSize && process.env.MAM_COOKIE) {
        mamResults = await this.searchMAM(genre, maxAgeDays, page, pageSize);
      }

      // Combine and normalize results
      const combinedItems = [...prowlarrResults.items, ...mamResults]
        .slice(0, pageSize)
        .sort((a, b) => b.seeders - a.seeders); // Sort by seeders desc

      const totalItems = prowlarrResults.pagination.totalItems + mamResults.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        items: combinedItems,
        pagination: {
          page,
          totalPages,
          totalItems,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: { genre, timeframe },
        cacheToken: this.generateCacheToken(genre, timeframe, page)
      };
    } catch (error) {
      logger.error('Indexer router search failed', { genre, timeframe, page, error });
      throw new Error('Search service temporarily unavailable');
    }
  }

  private async searchProwlarr(genre: string, maxAgeDays: number, page: number, pageSize: number) {
    // Implementation details for Prowlarr search
    // Convert genre to Prowlarr category mappings
    // Apply age filters and pagination
  }

  private async searchMAM(genre: string, maxAgeDays: number, page: number, pageSize: number) {
    // Implementation details for MAM proxy search
    // Convert genre to MAM category mappings
    // Apply age filters and pagination
  }

  private generateCacheToken(genre: string, timeframe: string, page: number): string {
    return Buffer.from(`${genre}:${timeframe}:${page}:${Date.now()}`).toString('base64');
  }
}
```

### 4. Results Presenter (`src/ui/results-presenter.ts`)

```typescript
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { SearchResultPage } from '../schemas/search';

export class ResultsPresenter {
  static createResultsEmbed(results: SearchResultPage): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`📖 ${results.filters.genre.toUpperCase()} Audiobooks`)
      .setDescription(`Found ${results.pagination.totalItems} results`)
      .setColor(0x10b981)
      .setFooter({ 
        text: `Page ${results.pagination.page} of ${results.pagination.totalPages} • ${results.filters.timeframe}` 
      });

    results.items.forEach((item, index) => {
      const fieldName = `${index + 1}. ${item.title}`;
      const fieldValue = [
        `👤 **Author:** ${item.author}`,
        `📦 **Format:** ${item.format} • **Size:** ${item.sizeMB}MB`,
        `🌱 **Seeds:** ${item.seeders} • **Leech:** ${item.leechers}`,
        `📅 **Added:** ${item.addedAt.toLocaleDateString()}`,
        `🔗 **Source:** ${item.source.toUpperCase()}`
      ].join('\n');

      embed.addFields({ name: fieldName, value: fieldValue, inline: false });
    });

    return embed;
  }

  static createNavigationButtons(results: SearchResultPage): ActionRowBuilder[] {
    const navigationRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`results_prev_${results.cacheToken}`)
          .setLabel('◀ Previous')
          .setStyle(2)
          .setDisabled(!results.pagination.hasPrev),
        new ButtonBuilder()
          .setCustomId(`results_next_${results.cacheToken}`)
          .setLabel('Next ▶')
          .setStyle(2)
          .setDisabled(!results.pagination.hasNext),
        new ButtonBuilder()
          .setCustomId('results_cancel')
          .setLabel('Cancel')
          .setStyle(4)
      );

    const actionRows = [navigationRow];

    // Add queue buttons for each result (max 5 per row)
    const queueButtons = results.items.map((item, index) => 
      new ButtonBuilder()
        .setCustomId(`queue_${item.id}_${results.cacheToken}`)
        .setLabel(`Queue ${index + 1}`)
        .setStyle(3)
    );

    const moreInfoButtons = results.items.map((item, index) => 
      new ButtonBuilder()
        .setCustomId(`info_${item.id}_${results.cacheToken}`)
        .setLabel(`Info ${index + 1}`)
        .setStyle(1)
    );

    // Split buttons into rows of 5
    for (let i = 0; i < queueButtons.length; i += 5) {
      actionRows.push(
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(queueButtons.slice(i, i + 5))
      );
    }

    for (let i = 0; i < moreInfoButtons.length; i += 5) {
      actionRows.push(
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(moreInfoButtons.slice(i, i + 5))
      );
    }

    return actionRows;
  }
}
```

## 🔌 API Endpoints

### Queue Endpoint (`POST /api/bookfairy/queue`)

```typescript
// Extends existing HTTP server in src/web/health-server.ts

app.post('/api/bookfairy/queue', async (req, res) => {
  const { itemId, cacheToken, userId } = req.body;
  
  try {
    // Validate request
    const queueRequest = QueueRequestSchema.parse(req.body);
    
    // Retrieve item from cache
    const cachedResults = cacheManager.get(cacheToken);
    if (!cachedResults) {
      return res.status(404).json({ error: 'Search results expired' });
    }
    
    const item = cachedResults.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Add to download queue
    await downloadQueue.add(item, userId);
    
    // Increment metrics
    prometheus.queueRequestsTotal.inc();
    
    res.json({ 
      success: true, 
      message: `${item.title} queued for download`,
      estimatedTime: '2-5 minutes'
    });
    
  } catch (error) {
    logger.error('Queue request failed', { error, body: req.body });
    res.status(500).json({ error: 'Queue request failed' });
  }
});
```

## 📊 Metrics & Monitoring

### Prometheus Metrics
```typescript
// Add to existing metrics in src/utils/metrics.ts

export const browseMetrics = {
  searchRequestsTotal: new Counter({
    name: 'bookfairy_search_requests_total',
    help: 'Total number of search requests',
    labelNames: ['genre', 'timeframe', 'source']
  }),
  
  searchFailuresTotal: new Counter({
    name: 'bookfairy_search_failures_total', 
    help: 'Total number of failed search requests',
    labelNames: ['genre', 'timeframe', 'error_type']
  }),
  
  queueRequestsTotal: new Counter({
    name: 'bookfairy_queue_requests_total',
    help: 'Total number of queue requests',
    labelNames: ['source', 'format']
  }),
  
  cacheHitRatio: new Histogram({
    name: 'bookfairy_cache_hit_ratio',
    help: 'Cache hit ratio for search results',
    buckets: [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1.0]
  })
};
```

### Logging Format
```typescript
// Correlation ID implementation
export class CorrelationLogger {
  static generateId(): string {
    return crypto.randomUUID().substring(0, 8);
  }
  
  static createContext(userId: string, interaction: string): LogContext {
    return {
      correlationId: this.generateId(),
      userId: crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16),
      interaction,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/unit/timeframe-mapper.test.ts
describe('presetToMaxAgeDays', () => {
  test('converts presets to correct day values', () => {
    expect(presetToMaxAgeDays('24h')).toBe(1);
    expect(presetToMaxAgeDays('3d')).toBe(3);
    expect(presetToMaxAgeDays('7d')).toBe(7);
    expect(presetToMaxAgeDays('30d')).toBe(30);
    expect(presetToMaxAgeDays('90d')).toBe(90);
    expect(presetToMaxAgeDays('all')).toBe(null);
  });
  
  test('handles invalid presets', () => {
    expect(() => presetToMaxAgeDays('invalid')).toThrow();
  });
});
```

### Integration Tests
```typescript
// tests/integration/browse-flow.test.ts
describe('Browse Flow Integration', () => {
  test('complete browse flow from command to results', async () => {
    const interaction = createMockInteraction('/bookfairy browse');
    const response = await handleBrowseCommand(interaction);
    
    expect(response.ephemeral).toBe(true);
    expect(response.embeds).toHaveLength(1);
    expect(response.components).toHaveLength(2); // Genre select + navigation
  });
  
  test('handles genre selection and pagination', async () => {
    const genreInteraction = createMockSelectInteraction('genre_select_0', 'fantasy');
    const response = await handleGenreSelection(genreInteraction);
    
    expect(response.embeds[0].title).toContain('FANTASY');
    expect(response.components).toContain('queue_');
  });
});
```

### Smoke Test
```typescript
// scripts/smoke-search.ts
async function smokeTest() {
  console.log('🧪 Running browse flow smoke test...');
  
  try {
    const result = await searchByGenre('fantasy', '7d', 1);
    
    console.log(`✅ Search completed: ${result.items.length} items found`);
    console.log(`📊 Pagination: ${result.pagination.page}/${result.pagination.totalPages}`);
    console.log(`🎯 Filters: ${result.filters.genre} (${result.filters.timeframe})`);
    
    if (result.items.length === 0) {
      console.warn('⚠️ No results found - check indexer connectivity');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Smoke test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  smokeTest();
}
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Discord app scopes include `applications.commands`
- [ ] Slash commands registered in target guilds
- [ ] Environment variables configured (Prowlarr, optional MAM)
- [ ] Database migrations completed (if needed)
- [ ] Metrics endpoint accessible

### Post-deployment
- [ ] Verify `/bookfairy browse` appears in Discord
- [ ] Test genre autocomplete functionality
- [ ] Validate mobile responsiveness
- [ ] Monitor error rates and response times
- [ ] Confirm queue endpoint functionality

### Rollback Plan
- [ ] Disable slash command registration if needed
- [ ] Existing message-based search remains functional
- [ ] Feature flag for gradual rollout
- [ ] Database rollback scripts prepared

## 📚 User Documentation

### Mobile Usage Guide
```markdown
# Using BookFairy Browse on Mobile

## Quick Start
1. Type `/bookfairy browse` in any channel
2. Select a genre from the dropdown (tap to expand)
3. Choose a timeframe (24h, 3d, 7d, 30d, 90d, all)
4. Browse results and tap "Queue" to download

## Pro Tips
- Use autocomplete for faster genre selection
- Swipe left/right on result embeds for easier reading
- Tap "Info" for book details and reviews
- Results auto-refresh every 10 minutes

## Troubleshooting
- If genres don't load: Check your internet connection
- If searches fail: Try a broader timeframe
- For help: Contact server administrators
```

## 🔒 Security Considerations

- **Input Validation**: All user inputs validated with Zod schemas
- **Rate Limiting**: Built-in Discord interaction rate limits respected
- **Privacy**: User IDs hashed in logs, no PII stored
- **Error Handling**: No stack traces exposed to users
- **Cache Security**: Short TTL to prevent stale data issues
- **API Security**: Queue endpoint requires valid cache tokens

## 📈 Performance Targets

- **Response Time**: < 3 seconds for search requests
- **Cache Hit Rate**: > 80% for repeated searches
- **Mobile Load Time**: < 2 seconds for UI components
- **Concurrent Users**: Support 100+ simultaneous searches
- **Memory Usage**: < 500MB for cache and session data

---

*This documentation serves as the comprehensive guide for implementing and maintaining the Discord Mobile Browse Flow feature. All code examples are illustrative and should be adapted to match existing codebase patterns and standards.*
