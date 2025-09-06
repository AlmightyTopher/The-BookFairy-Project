// tiny state bucket for sort/pagination
import crypto from "crypto";

type Any = Record<string, unknown>;
type Bucket = Map<string, { data: Any; exp: number }>;

const TTL_MS = 15 * 60 * 1000;
const SWEEP_MS = 60 * 1000;

declare global { var __bookfairy_view_store__: Bucket | undefined; } // eslint-disable-line no-var
const bucket: Bucket = global.__bookfairy_view_store__ ?? new Map();
global.__bookfairy_view_store__ = bucket;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of bucket) if (v.exp < now) bucket.delete(k);
}, SWEEP_MS).unref?.();

export function vput<T extends Any>(data: T): string {
  const id = crypto.randomBytes(9).toString("base64url"); // ~12 chars
  bucket.set(id, { data, exp: Date.now() + TTL_MS });
  return id;
}
export function vget<T extends Any>(id: string): T | null {
  const v = bucket.get(id); if (!v) return null;
  if (v.exp < Date.now()) { bucket.delete(id); return null; }
  v.exp = Date.now() + TTL_MS;
  return v.data as T;
}
