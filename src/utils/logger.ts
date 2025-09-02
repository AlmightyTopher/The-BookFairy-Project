// Re-export from the main logger module for consistency
export { logger, withReqId } from '../lib/logger';
import { logger } from '../lib/logger';

export const createContextLogger = (context: string, correlationId?: string) => {
  return logger.child({ context, correlationId });
};

export const createRequestLogger = (correlationId: string, userId?: string) => {
  return logger.child({ correlationId, userId });
};