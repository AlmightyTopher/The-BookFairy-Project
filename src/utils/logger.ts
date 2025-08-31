import pino from 'pino';

export const logger = {
  info: (data: any, message?: string) => {
    console.log(message || '', data);
  },
  warn: (data: any, message?: string) => {
    console.warn(message || '', data);
  },
  error: (data: any, message?: string) => {
    console.error(message || '', data);
  },
  debug: (data: any, message?: string) => {
    console.log(message || '', data);
  },
  child: (context: any) => {
    return {
      info: (data: any, message?: string) => {
        console.log(message || '', { ...context, ...data });
      },
      warn: (data: any, message?: string) => {
        console.warn(message || '', { ...context, ...data });
      },
      error: (data: any, message?: string) => {
        console.error(message || '', { ...context, ...data });
      },
      debug: (data: any, message?: string) => {
        console.log(message || '', { ...context, ...data });
      }
    };
  }
};

export const createContextLogger = (context: string, correlationId?: string) => {
  return logger.child({ context, correlationId });
};

export const createRequestLogger = (correlationId: string, userId?: string) => {
  return logger.child({ correlationId, userId });
};