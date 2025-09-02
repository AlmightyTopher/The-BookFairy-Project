import http from "node:http";
import { collectDefaultMetrics, register, Counter, Histogram } from "prom-client";
import { logger } from "../lib/logger";

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ prefix: 'bookfairy_' });

// Custom metrics
export const requests = new Counter({ 
  name: "bookfairy_requests_total", 
  help: "Total Discord interactions processed",
  labelNames: ['type', 'command', 'status']
});

export const searchDuration = new Histogram({
  name: "bookfairy_search_duration_seconds",
  help: "Time spent on book searches",
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const downloadAttempts = new Counter({
  name: "bookfairy_downloads_total",
  help: "Total download attempts",
  labelNames: ['status', 'provider']
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/healthz") { 
      res.writeHead(200, { 'Content-Type': 'text/plain' }); 
      res.end("ok"); 
      return; 
    }
    
    if (req.url === "/metrics") {
      res.setHeader("Content-Type", register.contentType);
      const metrics = await register.metrics();
      res.end(metrics); 
      return;
    }
    
    res.writeHead(404, { 'Content-Type': 'text/plain' }); 
    res.end("Not Found");
  } catch (error) {
    logger.error({ error }, 'Metrics server error');
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end("Internal Server Error");
  }
});

let serverStarted = false;

export function startMetrics(port = 9090): void {
  if (serverStarted) {
    logger.info({ port }, 'Metrics server already started, skipping');
    return;
  }

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      logger.warn({ port, error: error.message }, 'Metrics port already in use, skipping server start');
      return;
    }
    logger.error({ port, error }, 'Metrics server error');
  });

  server.listen(port, () => {
    serverStarted = true;
    logger.info({ port }, 'Metrics server started');
  });
}
