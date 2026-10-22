// POST /api/chat: one reply in a free conversation with an NPC.

import { CHARACTERS } from '../src/content/characters';
import { chatSystemPrompt, chatTurnMessage } from '../src/ai/prompts';
import { ChatTurnSchema, type ChatRequest, type ChatResponse } from '../src/ai/schema';
import { identify, spendReply, status } from '../server/accounts';
import { aiConfigured, MODELS, runStructured } from '../server/gameMaster';
import { bearer, json, MAX_HISTORY, MAX_REPLY_CHARS } from '../server/http';
import { mockChat } from '../server/mock';

function valid(body: unknown): body is ChatRequest {
  const b = body as ChatRequest;
  return (
    !!b &&
    typeof b.npcId === 'string' && b.npcId in CHARACTERS && b.npcId !== 'omni' && b.npcId !== 'anti' &&
    typeof b.country === 'string' && b.country.length <= 40 &&
    typeof b.playerName === 'string' && b.playerName.length <= 32 &&
    typeof b.playerLevel === 'string' && b.playerLevel.length <= 8 &&
    typeof b.reply === 'string' && b.reply.trim().length > 0 && b.reply.length <= MAX_REPLY_CHARS &&
    Array.isArray(b.history) && b.history.length <= MAX_HISTORY &&
    b.history.every((h) => (h.speaker === 'npc' || h.speaker === 'player') && typeof h.text === 'string' && h.text.length <= 600)
  );
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!valid(body)) return json({ error: 'bad_request' }, 400);

  const userId = await identify(bearer(request));
  if (!userId) return json({ ok: false, reason: 'sign_in_required', quota: null } satisfies ChatResponse, 401);

  const playerTurns = body.history.filter((h) => h.speaker === 'player').length;
  const spend = await spendReply(userId, playerTurns);
  if (!spend.allowed) return json({ ok: false, reason: spend.reason!, quota: status(spend) } satisfies ChatResponse, 429);

  if (!aiConfigured()) {
    return json({ ok: true, result: mockChat(body), quota: status(spend), mock: true } satisfies ChatResponse);
  }
  try {
    const result = await runStructured({
      model: MODELS.chat,
      system: chatSystemPrompt(body.npcId, body.country),
      user: chatTurnMessage(body, CHARACTERS[body.npcId].name),
      schema: ChatTurnSchema,
    });
    return json({ ok: true, result: result ?? mockChat(body), quota: status(spend), mock: !result } satisfies ChatResponse);
  } catch (error) {
    console.error('chat turn failed', error);
    return json({ error: 'ai_unavailable' }, 503);
  }
}
