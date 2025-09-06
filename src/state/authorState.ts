// ephemeral state for paging/sorting author results
import crypto from "crypto";
import { BookLite } from "../integrations/books/types";

type AuthorState = {
  author: string;
  sort: string;
  page: number;
  items: BookLite[];
};

type Entry = { v: AuthorState; exp: number };

const TTL_MS = 15 * 60 * 1000;

class Store {
  private map = new Map<string, Entry>();

  put(v: AuthorState): string {
    const id = crypto.randomBytes(9).toString("base64url"); // 12 chars-ish
    this.map.set(id, { v, exp: Date.now() + TTL_MS });
    return id;
  }
  get(id: string): AuthorState | null {
    const e = this.map.get(id);
    if (!e) return null;
    if (Date.now() > e.exp) { this.map.delete(id); return null; }
    return e.v;
  }
  set(id: string, v: AuthorState) {
    const e = this.map.get(id);
    if (!e) return;
    this.map.set(id, { v, exp: Date.now() + TTL_MS });
  }
}

declare global { // eslint-disable-next-line no-var
  var __bookfairy_author_state__: Store | undefined;
}
export const authorState = global.__bookfairy_author_state__ ?? (global.__bookfairy_author_state__ = new Store());
