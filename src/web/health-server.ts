import fastify from 'fastify';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { listGenres, getTopByGenre, TimeframeSchema } from '../integrations/mango';
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';

// Export build function for testing
export function build(opts: any = {}) {
  const server = fastify(opts);
  
  // Default health endpoint
  server.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mango API endpoints
  server.get('/api/mango/genres', async (request, reply) => {
    try {
      const genres = await listGenres();
      reply.send({ success: true, genres });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch Mango genres');
      reply.code(502).send({ 
        success: false,
        error: 'Failed to fetch genres'
      });
    }
  });

  // Top items endpoint with validation
  const topQuerySchema = z.object({
    genre: z.string().min(1).max(100),
    timeframe: TimeframeSchema.optional().default('1m'),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional().default('10'),
  });

  server.get('/api/mango/top', async (request, reply) => {
    try {
      const validation = topQuerySchema.safeParse(request.query);
      
      if (!validation.success) {
        reply.code(400).send({ 
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.errors
        });
        return;
      }

      const { genre, timeframe, limit } = validation.data;
      const items = await getTopByGenre(genre, timeframe, limit);
      reply.send({ success: true, items });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch Mango top items');
      reply.code(502).send({ 
        success: false,
        error: 'Failed to fetch top books'
      });
    }
  });

  return server;
}

export class HealthServer {
  private server = fastify({ logger: false });
  private getHealthStatus: () => Promise<any>;

  constructor({ getHealthStatus }: { getHealthStatus: () => Promise<any> }) {
    this.getHealthStatus = getHealthStatus;

    // Health endpoint
    this.server.get('/healthz', async (request, reply) => {
      try {
        const health = await this.getHealthStatus();
        const statusCode = health.overall ? 200 : 503;
        reply.code(statusCode).send(health);
      } catch (error) {
        logger.error({ error }, 'Failed to get health status');
        reply.code(500).send({ healthy: false, message: 'Internal Server Error' });
      }
    });

    // Mango API endpoints
    this.server.get('/api/mango/genres', async (request, reply) => {
      try {
        const genres = await listGenres();
        reply.send(genres);
      } catch (error) {
        logger.error({ error }, 'Failed to fetch Mango genres');
        reply.code(502).send({ 
          error: 'Failed to fetch genres from upstream service',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Top items endpoint with validation
    const topQuerySchema = z.object({
      genre: z.string().min(1).max(100),
      timeframe: TimeframeSchema,
      limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional().default('25'),
    });

    this.server.get('/api/mango/top', async (request, reply) => {
      try {
        const validation = topQuerySchema.safeParse(request.query);
        
        if (!validation.success) {
          reply.code(400).send({ 
            error: 'Invalid query parameters',
            details: validation.error.errors
          });
          return;
        }

        const { genre, timeframe, limit } = validation.data;
        const items = await getTopByGenre(genre, timeframe, limit);
        reply.send(items);
      } catch (error) {
        logger.error({ error }, 'Failed to fetch Mango top items');
        reply.code(502).send({ 
          error: 'Failed to fetch top items from upstream service',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  async start() {
    try {
      await this.server.listen({
        port: config.web.port,
        host: config.web.host,
      });
    } catch (err) {
      logger.error(err, 'Health server failed to start');
      process.exit(1);
    }
  }

  async stop() {
    await this.server.close();
  }
}
