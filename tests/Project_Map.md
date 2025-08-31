# Book Fairy Project Map
*Comprehensive Repository Analysis for QA Testing*

## Executive Summary
Book Fairy is a Discord bot for audiobook discovery and acquisition, integrating LLM-based natural language processing with torrent indexers, media managers, and download clients. The system processes user requests through intelligent intent classification, searches multiple sources, and automatically downloads/organizes audiobooks.

## System Architecture

### Entry Points
1. **Main Application**: `src/index.ts`
   - Discord client initialization
   - Bot lifecycle management
   - Error handling and graceful shutdown

2. **Health Server**: `src/web/health-server.ts`
   - HTTP endpoint for system status monitoring
   - Service health aggregation
   - Operational metrics

3. **Test Entry**: Various test files under `tests/`
   - Integration tests
   - Unit tests for individual components

### Core Components

#### 1. Discord Bot Layer
- **File**: `src/bot/discord-bot.ts`
- **Purpose**: Discord client setup and event handling
- **Dependencies**: Discord.js v14.22.1
- **Key Features**:
  - Message event routing
  - Bot presence management
  - Guild-specific command handling

- **File**: `src/bot/message-handler.ts`
- **Purpose**: Message processing pipeline
- **Key Features**:
  - Spell correction using Natural NLP
  - Query preprocessing (regex cleanup, number selection)
  - Orchestrator integration
  - Error response handling

#### 2. LLM Intelligence Layer
- **File**: `src/llm/ollama-client.ts`
- **Purpose**: Ollama LLM communication
- **Models Supported**:
  - qwen3:4b (intent classification)
  - qwen2.5-coder:14b (response generation)
  - gpt-oss:20b (fallback)
- **Features**:
  - Retry logic with exponential backoff
  - Health checking
  - Response validation with Zod schemas

- **File**: `src/llm/intent-classifier.ts`
- **Purpose**: Natural language intent classification
- **Supported Intents**:
  - FIND_SIMILAR (similarity-based recommendations)
  - FIND_BY_TITLE (exact title searches)
  - FIND_BY_AUTHOR (author-based searches)
  - FIND_BY_METADATA (genre/theme searches)
  - GET_AUTHOR_MORE (more books by author)
  - GET_METADATA (book details)
  - UNKNOWN (fallback)
- **Features**:
  - JSON extraction from LLM responses
  - Confidence scoring
  - Fallback to rule-based parsing

- **File**: `src/llm/rule-parser.ts`
- **Purpose**: Keyword-based fallback parser
- **Features**:
  - Regex-based title/author extraction
  - Simple intent classification
  - Backup when LLM fails

#### 3. Orchestration Layer
- **File**: `src/orchestrator/audiobook-orchestrator.ts`
- **Purpose**: Central business logic coordinator
- **Key Responsibilities**:
  - Request preprocessing and spell checking
  - LLM intent classification
  - Multi-source searching (Readarr, Prowlarr)
  - Download coordination (qBittorrent)
  - Response formatting
  - Similarity-based recommendations
- **External Integrations**: All client services

#### 4. External Service Clients

##### Readarr Client
- **File**: `src/clients/readarr-client.ts`
- **Purpose**: Media library management
- **API Operations**:
  - Book metadata lookup
  - Library addition
  - Health monitoring
- **Configuration**: Base URL, API key, quality profiles

##### Prowlarr Client
- **File**: `src/clients/prowlarr-client.ts`
- **Purpose**: Torrent indexer aggregation
- **API Operations**:
  - Multi-indexer searching
  - Result filtering (seeders, format, language)
  - Intelligent format selection (M4B preferred, MP3 fallback)
  - State management for duplicate detection
- **Features**:
  - Configurable search parameters
  - MyAnonamouse indexer integration
  - Quality-based result ranking

##### qBittorrent Client
- **File**: `src/clients/qbittorrent-client.ts`
- **Purpose**: Torrent download management
- **API Operations**:
  - Torrent addition via URL
  - Authentication handling
  - Category-based organization
- **Configuration**: Web UI credentials, download paths, categories

#### 5. Utility Layer

##### Spell Checker
- **File**: `src/utils/spell-checker.ts`
- **Purpose**: Query correction for book searches
- **Algorithm**: Levenshtein distance with book-specific vocabulary
- **Vocabulary**: 4000+ terms including common words, book titles, author names
- **Features**:
  - Intelligent correction thresholds
  - Book-domain specific corrections
  - False positive prevention

##### Correlation System
- **File**: `src/utils/correlation.ts`
- **Purpose**: Request tracking across system boundaries
- **Features**:
  - Unique correlation ID generation
  - Cross-service tracing
  - Debugging support

##### Retry Logic
- **File**: `src/utils/retry.ts`
- **Purpose**: Resilient external service communication
- **Features**:
  - Exponential backoff
  - Configurable retry conditions
  - Circuit breaker patterns

##### Logging
- **File**: `src/utils/logger.ts`
- **Purpose**: Structured application logging
- **Features**:
  - JSON formatting
  - Log level configuration
  - Child logger support
  - Correlation ID integration

#### 6. Configuration Management
- **File**: `src/config/config.ts`
- **Purpose**: Centralized environment variable management
- **Configuration Domains**:
  - Discord (tokens, client IDs)
  - Ollama (models, endpoints)
  - Readarr (API credentials, paths)
  - Prowlarr (API credentials, indexers)
  - qBittorrent (credentials, categories)
  - Application (ports, languages, logging)

#### 7. Type System
- **File**: `src/types/schemas.ts`
- **Purpose**: Zod-based type validation
- **Schema Categories**:
  - LLM request/response validation
  - Audiobook request structures
  - Health check formats
  - Intent classification types

### Data Flow Architecture

```
User Message → Discord Bot → Message Handler → Spell Checker → Orchestrator
                                                                    ↓
LLM Intent Classifier ← Orchestrator → Rule Parser (fallback)
         ↓                    ↓
    Confidence Check → Search Coordination
                            ↓
         ┌─────────────────────────────────────┐
         ▼                 ▼                   ▼
    Readarr Client   Prowlarr Client    qBittorrent Client
         ↓                 ↓                   ↓
    Book Metadata    Torrent Results      Download Queue
         ↓                 ↓                   ↓
         └─────────────────────────────────────┘
                            ↓
              Response Formatting → Discord Reply
```

### Test Structure

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: Complete system workflows
- **Includes**: Bot message processing, LLM integration, client coordination

#### Unit Tests
- **Clients**: `tests/clients/`
  - Prowlarr search functionality
  - Readarr library operations
  - qBittorrent download management
- **LLM**: `tests/llm/`
  - Intent classification accuracy
  - Rule parser fallbacks
- **Orchestrator**: `tests/orchestrator/`
  - Business logic validation
  - Error handling scenarios

#### Test Framework
- **Runner**: Vitest
- **Mocking**: Comprehensive service mocking
- **Coverage**: 56 total tests (29 passing)

### Environment Dependencies

#### Required Services
1. **Ollama LLM Server** (localhost:11434)
   - Models: qwen3:4b, qwen2.5-coder:14b, gpt-oss:20b
2. **Readarr** (localhost:8787)
   - Audiobook library management
3. **Prowlarr** (localhost:9696)
   - Torrent indexer aggregation
4. **qBittorrent** (localhost:8080)
   - Download client with Web UI

#### Configuration Requirements
- Discord bot token and permissions
- API keys for Readarr/Prowlarr
- qBittorrent Web UI credentials
- MyAnonamouse indexer configuration

### Security Considerations
- API keys stored in environment variables
- Discord bot permissions scoped to necessary functions
- No credential logging or exposure
- Input validation through Zod schemas
- Rate limiting on external API calls

### Performance Characteristics
- LLM processing: 30-60 seconds per request
- Search operations: 2-5 seconds aggregate
- Memory usage: ~100MB baseline
- Concurrent request handling: Single-threaded Node.js

### Operational Features
- Health monitoring endpoints
- Structured logging with correlation IDs
- Graceful degradation when services unavailable
- Retry logic for transient failures
- Spell correction for user input quality

This project represents a sophisticated integration of modern NLP, torrent indexing, and media management technologies, designed for reliable audiobook discovery and acquisition automation.
