// Browser side of the AI game master: calls our /api functions (never Claude directly;
// the API key lives on the server).

import { accessToken } from '../account';
import type { BattleTurnRequest, BattleTurnResult, ChatRequest, ChatResponse } from './schema';

async function post(path: string, body: unknown): Promise<Response> {
  const token = accessToken();
  return fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

export type ChatOutcome = ChatResponse | { ok: false; reason: 'offline' };

export async function sendChat(req: ChatRequest): Promise<ChatOutcome> {
  try {
    const res = await post('/api/chat', req);
    if (res.status === 200 || res.status === 401 || res.status === 429) return (await res.json()) as ChatResponse;
  } catch {
    // Network error: fall through.
  }
  return { ok: false, reason: 'offline' };
}

/** AI rating for a battle reply the answer list didn't know; null means "use the local grader". */
export async function rateBattleReply(req: BattleTurnRequest): Promise<BattleTurnResult | null> {
  try {
    const res = await post('/api/battle', req);
    if (res.status !== 200) return null;
    return ((await res.json()) as { result: BattleTurnResult }).result;
  } catch {
    return null;
  }
}
