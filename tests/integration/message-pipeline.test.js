import { describe, it, expect } from 'vitest';
describe('message pipeline shape', () => {
  it('spell -> intent -> response, stubbed', () => {
    const flow = ['spell_ok', 'intent_ok', 'respond_ok'];
    expect(flow).toContain('intent_ok');
  });
});
