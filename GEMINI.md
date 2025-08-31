
# Project: Book Fairy

## Project Overview

Book Fairy is an audiobook automation pipeline that integrates with Discord, an LLM, and various torrent management tools. It's designed to simplify the process of finding, downloading, and managing audiobooks.

The application is built with Node.js and TypeScript, and it uses a variety of services to achieve its functionality:

- **Discord:** The primary user interface is a Discord bot, allowing users to request audiobooks and check the status of their downloads.
- **Ollama:** An LLM is used to classify user requests, determining whether they are asking for a book, a status update, or something else.
- **Readarr:** This service is used to manage the audiobook library, including adding new books and monitoring their status.
- **Prowlarr:** Prowlarr is used to search for audiobooks on various indexers.
- **qBittorrent:** This is the torrent client used to download the audiobooks.
- **Fastify:** A simple web server is used to provide health checks for the various services.

## Building and Running

### Prerequisites

- Node.js (>=20)
- A `.env` file with the necessary API keys and URLs for the various services. You can use `.env.example` as a template.

### Installation

```bash
npm install
```

### Development

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the application using `tsx`, which will automatically transpile and run the TypeScript code.

### Production

To build and run the application in production, use the following commands:

```bash
npm run build
npm run start
```

This will compile the TypeScript code to JavaScript and then run the application.

### Testing

To run the tests, use the following command:

```bash
npm run test
```

## Development Conventions

### Coding Style

The project uses ESLint and Prettier to enforce a consistent coding style. It's recommended to use an editor extension to automatically format your code on save.

### Testing

The project uses `vitest` for testing. All new features should be accompanied by tests.

### Configuration

All configuration is done through environment variables. The `.env.example` file shows all the available options. The configuration is loaded in `config/config.ts` and validated in `src/index.ts`.
