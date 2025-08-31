import { describe, it, expect } from 'vitest';
describe('api service integration stub', () => {
  it('responds with mocked api service info', () => {
    const mockData = { status: 'ok', services: ['prowlarr', 'readarr', 'qbittorrent'] };
    expect(mockData.status).toBe('ok');
    expect(mockData.services).toHaveLength(3);
  });
});
