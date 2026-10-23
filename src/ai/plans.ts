// Signal: OMNI's hidden connection, the game's energy. Every reply in a free AI
// conversation costs one bar; bars refill steadily over time up to the plan's capacity.
// (In the story: the more OMNI listens and whispers, the easier it is for ANTI to trace.)
// Story, battles and scripted lines never cost signal.

export type PlanId = 'free' | 'basic' | 'premium';

export interface Plan {
  label: string;
  /** USD per month. */
  price: number;
  /** Maximum bars. */
  capacity: number;
  /** Bars refilled per day (spread evenly). */
  perDay: number;
  /** Replies per single conversation before OMNI says it's time to go. */
  perConversation: number;
  /** Conversations run on the most capable model. */
  bestModel: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: { label: 'Free', price: 0, capacity: 30, perDay: 30, perConversation: 10, bestModel: false },
  basic: { label: 'Basic', price: 14.99, capacity: 100, perDay: 50, perConversation: 60, bestModel: false },
  premium: { label: 'Premium', price: 34.99, capacity: 200, perDay: 100, perConversation: 150, bestModel: true },
};

/** Extra bars in one purchasable battery pack, used after the signal runs out. */
export const BATTERY_PACK_BARS = 500;

export interface Usage {
  plan: PlanId;
  /** Bars at `at` (fractional while refilling). */
  signal: number;
  /** ISO timestamp the signal value was measured at. */
  at: string;
  credits: number;
}

export function freshUsage(plan: PlanId, now: Date): Usage {
  return { plan, signal: PLANS[plan].capacity, at: now.toISOString(), credits: 0 };
}

/** Signal now, after refilling since the last measurement. */
export function refill(usage: Usage, now: Date): Usage {
  const plan = PLANS[usage.plan];
  const hours = Math.max(0, (now.getTime() - new Date(usage.at).getTime()) / 3_600_000);
  const signal = Math.min(plan.capacity, usage.signal + (hours * plan.perDay) / 24);
  return { ...usage, signal, at: now.toISOString() };
}

/** When the next whole bar will be ready, or null if there's at least one now. */
export function nextBarAt(usage: Usage): string | null {
  if (usage.signal >= 1) return null;
  const hoursToBar = ((1 - usage.signal) * 24) / PLANS[usage.plan].perDay;
  return new Date(new Date(usage.at).getTime() + hoursToBar * 3_600_000).toISOString();
}

export interface ConsumeResult {
  allowed: boolean;
  usage: Usage;
  reason?: 'no_signal';
}

/** Spend one bar: from the signal first, then from battery packs. */
export function consume(before: Usage, now: Date): ConsumeResult {
  const usage = refill(before, now);
  if (usage.signal >= 1) return { allowed: true, usage: { ...usage, signal: usage.signal - 1 } };
  if (usage.credits > 0) return { allowed: true, usage: { ...usage, credits: usage.credits - 1 } };
  return { allowed: false, usage, reason: 'no_signal' };
}
