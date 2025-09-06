// simple TTL cache (in-memory)
type Entry<T> = { v: T; exp: number };

export class TTLCache<T> {
  private map = new Map<string, Entry<T>>();
  constructor(private ttlMs: number) {}

  get(k: string): T | undefined {
    const e = this.map.get(k);
    if (!e) return;
    if (Date.now() > e.exp) { this.map.delete(k); return; }
    return e.v;
    }

  set(k: string, v: T) {
    this.map.set(k, { v, exp: Date.now() + this.ttlMs });
  }
}
