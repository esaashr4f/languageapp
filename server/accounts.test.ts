import { describe, expect, it } from 'vitest';
import { PLANS } from '../src/ai/plans';
import { spendSignal } from './accounts';

// No Supabase env in tests, so this exercises the in-memory dev store.
describe('spendSignal (dev store)', () => {
  const now = new Date('2026-10-22T12:00:00Z');

  it('refuses an over-long conversation without charging for it', async () => {
    const capped = await spendSignal('user-a', PLANS.free.perConversation, now);
    expect(capped).toMatchObject({ allowed: false, reason: 'conversation_limit' });
    expect(capped.usage.signal).toBe(PLANS.free.capacity);
    const next = await spendSignal('user-a', 0, now);
    expect(next.allowed).toBe(true);
    expect(next.usage.signal).toBe(PLANS.free.capacity - 1);
  });

  it('stops a free player when the signal is empty', async () => {
    for (let i = 0; i < PLANS.free.capacity; i++) expect((await spendSignal('user-b', 0, now)).allowed).toBe(true);
    expect(await spendSignal('user-b', 0, now)).toMatchObject({ allowed: false, reason: 'no_signal' });
  });
});
