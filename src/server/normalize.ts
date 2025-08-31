import vocab from "../normalization/vocab_maps.json";

export function normalizeValue(val?: string): string {
  if (!val) return "";
  const v = val.trim().toLowerCase();
  for (const [canon, syns] of Object.entries(vocab.genre)) if (syns.includes(v)) return canon;
  for (const [canon, syns] of Object.entries(vocab.audience)) if (syns.includes(v)) return canon;
  for (const [canon, syns] of Object.entries(vocab.tone_style)) if (syns.includes(v)) return canon;
  return v;
}

export function normalizeArray(arr?: string[]): string[] {
  if (!arr || !arr.length) return [];
  const out = new Set<string>();
  for (const raw of arr) {
    const n = normalizeValue(raw);
    if (n) out.add(n);
  }
  return Array.from(out);
}
