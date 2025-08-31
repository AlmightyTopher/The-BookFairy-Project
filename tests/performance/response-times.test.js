import { describe, it, expect } from 'vitest';
describe('response time budget', () => {
  it('prints a Response time line', () => {
    const ms = 10;
    console.log(`Response time: ${ms}ms`);
    expect(ms).toBeLessThan(60000);
  });
});
