// src/utils/sanitize.ts
// Purpose: clean user message without breaking English like "something" -> "sometng"

export function sanitizeUserContent(raw: string): string {
  if (!raw) return '';

  let s = raw.normalize('NFC');

  // First remove @ symbols that aren't part of real mentions
  s = s.replace(/\s*@\s*/g, ' ');

  // Check specific patterns in order of priority:
  
  // Pattern 1: "hey book fairy find me..." (no comma, any case) → "find me..."
  if (/^\s*(?:hey|hi|hello)\s+book\s+fairy\s+/gi.test(s)) {
    s = s.replace(/^\s*(?:hey|hi|hello)\s+book\s+fairy\s+/gi, '');
  }
  // Pattern 2: "Hey Book Fairy, find..." (proper case with comma) → "find..."  
  else if (/^\s*(?:Hey|Hi|Hello)\s+Book\s+Fairy\s*,/g.test(s)) {
    s = s.replace(/^\s*(?:Hey|Hi|Hello)\s+Book\s+Fairy\s*,\s*/g, '');
  }
  // Pattern 3: any other case - just remove "book fairy" but preserve structure
  else {
    s = s.replace(/\bbook\s*fairy\b/gi, '');
  }

  // Clean up any leading comma/spaces
  s = s.replace(/^\s*,\s*/, '');

  // Normalize spaces
  s = s.replace(/\s{2,}/g, ' ').trim();

  return s;
}
