// src/utils/sanitize.ts
// Purpose: clean user message without breaking English like "something" -> "sometng"

export function sanitizeUserContent(raw: string): string {
  if (!raw) return '';

  let s = raw.normalize('NFC');

  // Trim leading salutations only at the start (do NOT remove 'hi' inside words)
  // Examples removed: "hey", "hi", "hello" with optional punctuation/space
  s = s.replace(/^\s*(?:hey|hi|hello)\b[,\s!.-]*/i, '');

  // Remove bot name anywhere
  s = s.replace(/\bbook\s*fairy\b/gi, '');

  // Collapse leftover punctuation gaps like "hey ,"
  s = s.replace(/\s+,/g, ',').replace(/,\s+/g, ', ');

  // Keep question marks and commas, just normalize spaces
  s = s.replace(/\s{2,}/g, ' ').trim();

  return s;
}
