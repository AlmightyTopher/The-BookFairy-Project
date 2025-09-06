// Filename: src/state/buttonStore.ts
// Purpose: singleton short-lived mapping from tiny token -> BookMeta,
// so button customIds stay <100 chars and survive tsx reloads.

import crypto from "node:crypto";
import type { BookMeta } from "../integrations/hardcover/client";

type Entry = { meta: BookMeta; expires: number };

class ButtonStore {
  private store = new Map<string, Entry>();
  private ttlMs: number;
  private sweeper: NodeJS.Timeout;

  constructor(ttlMinutes = 15) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.sweeper = setInterval(() => this.sweep(), 60 * 1000);
    this.sweeper.unref?.();
  }

  put(meta: BookMeta): string {
    const id = crypto.randomBytes(12).toString("base64url"); // 16 chars
    this.store.set(id, { meta, expires: Date.now() + this.ttlMs });
    return id;
  }

  get(id: string): BookMeta | null {
    const hit = this.store.get(id);
    if (!hit) return null;
    if (hit.expires <= Date.now()) {
      this.store.delete(id);
      return null;
    }
    hit.expires = Date.now() + this.ttlMs; // touch
    return hit.meta;
  }

  private sweep() {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (v.expires <= now) this.store.delete(k);
    }
  }
}

// ---- GLOBAL SINGLETON to avoid duplicate instances during tsx watch ----
declare global {
  // eslint-disable-next-line no-var
  var __bookfairy_button_store__: ButtonStore | undefined;
}

const instance =
  globalThis.__bookfairy_button_store__ ??
  (globalThis.__bookfairy_button_store__ = new ButtonStore());

export const buttonStore = instance;
