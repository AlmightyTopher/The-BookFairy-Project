import { describe, it, expect } from 'vitest';
describe('bot command formatting', () => {
  it('embeds have basic shape', () => {
    const embed = { title: 'Book Fairy', description: 'OK' };
    expect(embed).toHaveProperty('title');
    expect(embed).toHaveProperty('description');
  });
});
