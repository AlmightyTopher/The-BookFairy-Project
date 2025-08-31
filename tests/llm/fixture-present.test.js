import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('fixture presence', () => {
  it('test-data.json exists and is valid JSON', () => {
    const p = path.resolve(process.cwd(), 'test-data.json');
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    expect(typeof data).toBe('object');
  });
});
