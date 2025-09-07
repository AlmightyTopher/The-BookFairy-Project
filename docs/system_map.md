# BookFairy Project - System Architecture Map

## Overview
The BookFairy Project is a Discord bot that provides automated audiobook search, recommendation, and download management through integration with various external services. The system follows a layered architecture with clear separation between Discord interaction handling, business logic orchestration, and external service integration.

## Core Architecture

### Entry Point & Discord Integration
- **`src/index.ts`** - Main application entry point
  - Initializes Discord.js client with required intents and partials
  - Registers event handlers for messages and button interactions
  - Sets up download monitoring, metrics server, and graceful shutdown
  - Bridges Discord client with message handler and services

### Message Processing Pipeline
- **`src/bot/message-handler.ts`** - Core Discord message orchestration
  - `MessageHandler` class - Central coordinator for all Discord interactions
  - User session management with conversation state tracking
  - Button enforcement logic to guide users through proper UI flows
  - Integration with Southern Belle personality for response formatting
  - Handles both text messages and button interactions
  - Manages search result pagination and download workflows

### Business Logic Orchestration
- **`src/orchestrator/audiobook-orchestrator.ts`** - Central business logic coordinator
  - `AudiobookOrchestrator` class - Main service orchestration layer
  - Intent parsing and audiobook request processing
  - Coordinates between search providers (Prowlarr, Hardcover)
  - Formats responses and manages recommendation logic
  - Handles download initiation and status tracking

## Feature Modules

### Book Discovery & Search
- **`src/integrations/hardcover/`** - Hardcover GraphQL API integration
  - `client.ts` - GraphQL client with authentication and error handling
  - `service.ts` - High-level search and book detail operations
  - `queries.ts` - GraphQL query definitions
- **`src/clients/prowlarr-client.ts`** - Prowlarr torrent indexer integration
- **`src/search/author.ts`** - Author-specific search logic
- **`src/utils/book-similarity.ts`** - Book recommendation algorithms

### User Interface & Navigation
- **`src/navigation/home-hub.ts`** - Unified home interface and navigation
- **`src/features/`** - Feature-specific UI components
  - `bookMenu.ts` - Book selection and download confirmation menus
  - `authorFlow.ts` - Author-based search workflows
  - `descriptionFlow.ts` - Description-based book discovery
- **`src/discord/interactions/`** - Discord interaction handlers
  - `bookDetails.ts` - Book detail display and interactions
  - `authorSearch.ts` - Author search interface and state management
- **`src/utils/discord-ui.ts`** - Discord UI component utilities

### Download Management
- **`src/services/download-monitor.ts`** - Download progress tracking and notifications
- **`src/services/downloads.ts`** - Download service coordination
- **`src/clients/qbittorrent-client.ts`** - qBittorrent torrent client integration
- **`src/clients/readarr-client.ts`** - Readarr media management integration

### Personality & User Experience
- **`src/personality/southern-belle-test.ts`** - Southern Belle personality implementation
- **`src/utils/phrasebook.ts`** - Phrase management and localization
- **`data/phrasebook.json`** - Personality phrase database

### Flow Engine & State Management
- **`src/flow/flow-engine.ts`** - State machine-based flow management
- **`src/flow/task-executor.ts`** - Task execution and workflow coordination
- **`src/state/`** - Application state management
  - `authorState.ts` - Author search session state
  - `buttonStore.ts` - Button interaction state tracking
  - `viewStore.ts` - UI view state management

### Security & Validation
- **`src/security/`** - Security and access control
  - `allowlist.ts` - User access control and permissions
  - `access-guard.ts` - Request authorization and validation
  - `paths.ts` - Path security and sanitization
- **`src/utils/sanitize.ts`** - Input sanitization utilities
- **`src/server/sanitize.ts`** - Server-side sanitization
- **`src/schemas/`** - Data validation schemas
  - `book_fairy_response.schema.ts` - Response validation with Zod

## External Integrations

### Discord Services
- **Discord.js v14** - Primary Discord API interaction
- **Message & Button Interactions** - User interface components
- **Slash Commands** - `/hc` command for Hardcover testing

### Book & Media Services
- **Hardcover API** - Book metadata and search (GraphQL)
- **Prowlarr** - Torrent indexer aggregation
- **Readarr** - Audiobook library management
- **qBittorrent** - Torrent download client
- **Audiobookshelf** - Media server integration (implied)

### Utility Services
- **Goodreads** - Book information and links (utilities)
- **Google Books** - Alternative book metadata source
- **OpenLibrary** - Open source book database

## Configuration & Environment
- **`src/config/`** - Application configuration management
  - `config.ts` - Main configuration aggregation
  - `env.ts` - Environment variable handling
  - `mam.ts` - MAM (MyAnonamouse) tracker configuration
  - `mango.ts` - Mango application settings
- **`.env.example`** - Environment variable template

## Quality Assurance & Testing

### Current Test Structure
- **`tests/`** - Test organization by feature area
  - `bot/` - Discord bot interaction tests
  - `clients/` - External service client tests
  - `fixtures/` - Test data and mock responses
  - `integration/` - End-to-end integration tests
  - `utils/` - Utility function tests

### Key Test Files
- **`vitest.config.ts`** - Vitest test framework configuration
- **`tests/setup.ts`** - Test environment setup
- **`tests/Test_Plan.md`** - Existing test documentation

## Monitoring & Operations
- **`src/metrics/server.ts`** - Prometheus metrics server
- **`src/utils/logger.ts`** - Application logging with Pino
- **`src/services/download-monitor.ts`** - Download progress monitoring

## Quick Actions & Legacy Support
- **`src/quick-actions/index.ts`** - Legacy quick action system
- **`src/bridge/dispatch.ts`** - Service bridging and dispatch

## Data & State Persistence
- **`data/`** - Application data storage
  - `phrasebook.json` - Personality phrases and responses
  - `prowlarr_state.json` - Prowlarr service state
- **`logs/`** - Application log storage
- **`downloads/audiobooks/`** - Download file storage

## Critical User Workflows

### 1. Book Search & Discovery
1. User sends message or uses buttons in Discord
2. Message handler processes intent and enforces UI guidelines
3. Orchestrator coordinates search across providers (Hardcover, Prowlarr)
4. Results formatted and presented with pagination and download options
5. User selects book for download confirmation

### 2. Download Management
1. User confirms book download selection
2. Download initiated through qBittorrent client
3. Download monitor tracks progress and notifies user
4. Readarr manages library integration upon completion

### 3. Recommendation Engine
1. User requests similar books or author exploration
2. Hardcover and similarity algorithms generate recommendations
3. Results presented with personality-enhanced messaging
4. Follow-up prompts for continued discovery

## External Dependencies
- **Node.js v20** - Runtime environment
- **TypeScript** - Type safety and compilation
- **Discord.js v14** - Discord API client
- **Vitest** - Testing framework
- **Zod** - Schema validation
- **Pino** - Structured logging
- **Fastify** - HTTP server for metrics
- **Axios/Undici** - HTTP clients
- **Bottleneck** - Rate limiting
- **p-retry** - Retry logic with backoff

## Security Considerations
- User access control through allowlists
- Input sanitization and validation
- Path traversal protection
- Rate limiting on external API calls
- Secure environment variable handling
- Request correlation and audit logging
