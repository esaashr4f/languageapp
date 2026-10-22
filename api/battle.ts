// POST /api/battle: rate a reply to a legend that the local answer list didn't recognise.
// Responds 204 when the AI isn't configured, so the game keeps its scripted grading.

import { CHARACTERS } from '../src/content/characters';
import { battleSystemPrompt, battleTurnMessage } from '../src/ai/prompts';
import { BattleTurnSchema, type BattleTurnRequest } from '../src/ai/schema';
import { identify } from '../server/accounts';
import { aiConfigured, MODELS, runStructured } from '../server/gameMaster';
import { bearer, json, MAX_HISTORY, MAX_REPLY_CHARS } from '../server/http';

const PHASES = ['corrupted', 'wavering', 'remembering'];

function valid(body: unknown): body is BattleTurnRequest {
  const b = body as BattleTurnRequest;
  return (
    !!b &&
    typeof b.legendId === 'string' && !!CHARACTERS[b.legendId]?.phases &&
    PHASES.includes(b.phase) &&
    typeof b.country === 'string' && b.country.length <= 40 &&
    typeof b.playerName === 'string' && b.playerName.length <= 32 &&
    typeof b.playerLevel === 'string' && b.playerLevel.length <= 8 &&
    typeof b.legendLine === 'string' && b.legendLine.length <= 300 &&
    typeof b.goal === 'string' && b.goal.length <= 300 &&
    typeof b.reply === 'string' && b.reply.trim().length > 0 && b.reply.length <= MAX_REPLY_CHARS &&
    Array.isArray(b.history) && b.history.length <= MAX_HISTORY
  );
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!valid(body)) return json({ error: 'bad_request' }, 400);
  if (!aiConfigured()) return new Response(null, { status: 204 });
  const userId = await identify(bearer(request));
  if (!userId) return json({ error: 'sign_in_required' }, 401);
  try {
    const result = await runStructured({
      model: body.phase === 'remembering' ? MODELS.legend : MODELS.rater,
      system: battleSystemPrompt(body.legendId, body.country),
      user: battleTurnMessage(body),
      schema: BattleTurnSchema,
    });
    return result ? json({ result }) : new Response(null, { status: 204 });
  } catch (error) {
    console.error('battle turn failed', error);
    return json({ error: 'ai_unavailable' }, 503);
  }
}
