import { randomBytes } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<string>();

export function getCorrelationId(): string | undefined {
  return asyncLocalStorage.getStore();
}

export function runWithCorrelationId<T>(
  fn: () => T,
  correlationId?: string,
): T {
  const id = correlationId || `corr-${randomBytes(8).toString('hex')}`;
  return asyncLocalStorage.run(id, fn);
}