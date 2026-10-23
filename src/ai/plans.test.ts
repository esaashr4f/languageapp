import { describe, expect, it } from 'vitest';
import { consume, freshUsage, nextBarAt, PLANS, refill, type Usage } from './plans';

const at = (iso: string) => new Date(iso);

describe('signal', () => {
  it('starts full and runs out after the capacity is spent', () => {
    let usage = freshUsage('free', at('2026-10-22T10:00:00Z'));
    for (let i = 0; i < PLANS.free.capacity; i++) {
      const r = consume(usage, at('2026-10-22T10:00:00Z'));
      expect(r.allowed).toBe(true);
      usage = r.usage;
    }
    expect(consume(usage, at('2026-10-22T10:00:00Z'))).toMatchObject({ allowed: false, reason: 'no_signal' });
  });

  it('refills steadily: a free bar every 48 minutes', () => {
    const empty: Usage = { plan: 'free', signal: 0, at: '2026-10-22T10:00:00.000Z', credits: 0 };
    expect(nextBarAt(empty)).toBe('2026-10-22T10:48:00.000Z');
    expect(consume(empty, at('2026-10-22T10:47:00Z')).allowed).toBe(false);
    expect(consume(empty, at('2026-10-22T10:48:00Z')).allowed).toBe(true);
  });

  it('never refills past capacity', () => {
    const usage: Usage = { plan: 'basic', signal: 99, at: '2026-10-01T00:00:00.000Z', credits: 0 };
    expect(refill(usage, at('2026-10-22T00:00:00Z')).signal).toBe(PLANS.basic.capacity);
  });

  it('spends battery packs once the signal is empty', () => {
    const usage: Usage = { plan: 'premium', signal: 0.2, at: '2026-10-22T10:00:00.000Z', credits: 2 };
    const r = consume(usage, at('2026-10-22T10:00:00Z'));
    expect(r).toMatchObject({ allowed: true });
    expect(r.usage.credits).toBe(1);
  });
});
