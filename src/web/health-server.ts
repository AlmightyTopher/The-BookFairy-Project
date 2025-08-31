import fastify from 'fastify';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class HealthServer {
  private server = fastify({ logger: false });
  private getHealthStatus: () => Promise<any>;

  constructor({ getHealthStatus }: { getHealthStatus: () => Promise<any> }) {
    this.getHealthStatus = getHealthStatus;

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
