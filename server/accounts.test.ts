import { describe, expect, it } from 'vitest';
import { PLANS } from '../src/ai/plans';
import { spendReply } from './accounts';

// No Supabase env in tests, so this exercises the in-memory dev store.
describe('spendReply (dev store)', () => {
  const now = new Date('2026-10-22T12:00:00Z');

  it('refuses an over-long conversation without charging for it', async () => {
    const capped = await spendReply('user-a', PLANS.free.perConversation, now);
    expect(capped).toMatchObject({ allowed: false, reason: 'conversation_limit', remaining: PLANS.free.replies });
    const next = await spendReply('user-a', 0, now);
    expect(next).toMatchObject({ allowed: true, remaining: PLANS.free.replies - 1 });
  });

  it('stops a free player after the daily allowance', async () => {
    for (let i = 0; i < PLANS.free.replies; i++) expect((await spendReply('user-b', 0, now)).allowed).toBe(true);
    expect(await spendReply('user-b', 0, now)).toMatchObject({ allowed: false, reason: 'free_limit' });
  });
});
