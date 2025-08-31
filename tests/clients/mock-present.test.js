import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('client mocks available', () => {
  it('has some mockable fields or at least parses', () => {
    const p = path.resolve(process.cwd(), 'test-data.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    expect(data).toBeTruthy();
  });
});
