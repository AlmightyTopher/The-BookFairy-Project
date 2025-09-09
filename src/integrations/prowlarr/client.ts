// src/integrations/prowlarr/client.ts
// Minimal contract to satisfy tests. Real client can wire to your existing src/clients/prowlarr-client.ts later.

export type SearchOptions = { query: string; [k: string]: unknown };

export function toSearchOptions(q: string): SearchOptions {
  return { query: String(q ?? "").trim() };
}

export async function relaySearch(
  _opts: SearchOptions,
  ctx?: { correlationId?: string; [k: string]: unknown }
): Promise<{ ok: boolean; meta?: { correlationId?: string } }> {
  // Tests mock this; we keep a predictable shape.
  return { ok: true, meta: { correlationId: ctx?.correlationId } };
}