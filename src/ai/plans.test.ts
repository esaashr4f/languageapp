import { describe, expect, it } from 'vitest';
import { consume, PLANS, type Usage } from './plans';

const at = (iso: string) => new Date(iso);

describe('conversation allowance', () => {
  it('lets free players use their daily replies, then stops them', () => {
    let usage: Usage = { plan: 'free', periodStart: '2026-10-22T00:00:00.000Z', used: 0, credits: 0 };
    for (let i = 0; i < PLANS.free.replies; i++) {
      const r = consume(usage, at('2026-10-22T15:00:00Z'));
      expect(r.allowed).toBe(true);
      usage = r.usage;
    }
    const blocked = consume(usage, at('2026-10-22T16:00:00Z'));
    expect(blocked).toMatchObject({ allowed: false, reason: 'free_limit', remaining: 0 });
    expect(blocked.resetsAt).toBe('2026-10-23T00:00:00.000Z');
  });

  it('refills free replies the next day', () => {
    const usage: Usage = { plan: 'free', periodStart: '2026-10-22T00:00:00.000Z', used: 30, credits: 0 };
    const r = consume(usage, at('2026-10-23T08:00:00Z'));
    expect(r.allowed).toBe(true);
    expect(r.usage.used).toBe(1);
    expect(r.usage.periodStart).toBe('2026-10-23T00:00:00.000Z');
  });

  it('spends purchased credits after a paid plan runs out, then waits for renewal', () => {
    const usage: Usage = { plan: 'plus', periodStart: '2026-10-05T10:00:00.000Z', used: 1500, credits: 1 };
    const withCredit = consume(usage, at('2026-10-20T10:00:00Z'));
    expect(withCredit).toMatchObject({ allowed: true, remaining: 0 });
    expect(withCredit.usage.credits).toBe(0);
    const blocked = consume(withCredit.usage, at('2026-10-21T10:00:00Z'));
    expect(blocked).toMatchObject({ allowed: false, reason: 'plan_limit' });
    expect(blocked.resetsAt).toBe('2026-11-05T10:00:00.000Z');
  });

  it('renews a paid plan monthly from its start date', () => {
    const usage: Usage = { plan: 'plus', periodStart: '2026-08-05T10:00:00.000Z', used: 1500, credits: 0 };
    const r = consume(usage, at('2026-10-06T00:00:00Z'));
    expect(r.allowed).toBe(true);
    expect(r.usage.periodStart).toBe('2026-10-05T10:00:00.000Z');
  });
});
