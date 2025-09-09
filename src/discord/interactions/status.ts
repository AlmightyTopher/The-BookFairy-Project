// src/discord/interactions/status.ts
import { getRecentRelays } from "../../lib/relay-store"; // tests mock this

function ageFrom(ts: number) {
  const ms = Math.max(0, Date.now() - ts);
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${Math.round(ms / 3_600_000)}h`;
}

export async function buildStatusView() {
  const relays = getRecentRelays() ?? [];
  const items = relays.slice(0, 5).map(r => ({
    id: r.id,
    state: r.state,
    age: ageFrom(r.at),
  }));
  return { items };
}