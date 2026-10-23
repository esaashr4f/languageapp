// POST /api/signal: how much signal the player has (doesn't spend any).

import { identify, peekSignal, status } from '../server/accounts';
import { bearer, json } from '../server/http';

export async function POST(request: Request): Promise<Response> {
  const userId = await identify(bearer(request));
  if (!userId) return json({ error: 'sign_in_required' }, 401);
  return json({ quota: status(await peekSignal(userId)) });
}
