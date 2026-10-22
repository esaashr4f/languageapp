// Conversation allowances. One "reply" = one message the player sends in a free
// conversation (one AI call). Numbers are a starting point: tune them once real cost per
// reply is measured.

export type PlanId = 'free' | 'plus';

export interface Plan {
  label: string;
  period: 'day' | 'month';
  /** Replies per period. */
  replies: number;
  /** Replies per single conversation before OMNI says it's time to go. */
  perConversation: number;
}

export const PLANS: Record<PlanId, Plan> = {
  free: { label: 'Free', period: 'day', replies: 30, perConversation: 10 },
  plus: { label: 'Zaban+', period: 'month', replies: 1500, perConversation: 100 },
};

/** Extra replies in one purchasable credit pack (used after the plan's allowance runs out). */
export const CREDIT_PACK_REPLIES = 500;

export interface Usage {
  plan: PlanId;
  /** ISO timestamp when the current period started. */
  periodStart: string;
  used: number;
  credits: number;
}

export function periodEnd(plan: PlanId, start: Date): Date {
  const end = new Date(start);
  if (PLANS[plan].period === 'day') {
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() + 1);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }
  return end;
}

/** Roll the period forward if it has ended (a new day for free, the next month for plus). */
export function current(usage: Usage, now: Date): Usage {
  let start = new Date(usage.periodStart);
  if (now < periodEnd(usage.plan, start)) return usage;
  if (PLANS[usage.plan].period === 'day') {
    start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
  } else {
    while (periodEnd(usage.plan, start) <= now) start = periodEnd(usage.plan, start);
  }
  return { ...usage, periodStart: start.toISOString(), used: 0 };
}

export interface ConsumeResult {
  allowed: boolean;
  usage: Usage;
  remaining: number;
  resetsAt: string;
  reason?: 'free_limit' | 'plan_limit';
}

/** Spend one reply: from the plan's allowance first, then from purchased credits. */
export function consume(before: Usage, now: Date): ConsumeResult {
  const usage = current(before, now);
  const limit = PLANS[usage.plan].replies;
  const resetsAt = periodEnd(usage.plan, new Date(usage.periodStart)).toISOString();
  if (usage.used < limit) {
    const next = { ...usage, used: usage.used + 1 };
    return { allowed: true, usage: next, remaining: limit - next.used + next.credits, resetsAt };
  }
  if (usage.credits > 0) {
    const next = { ...usage, credits: usage.credits - 1 };
    return { allowed: true, usage: next, remaining: next.credits, resetsAt };
  }
  return {
    allowed: false,
    usage,
    remaining: 0,
    resetsAt,
    reason: usage.plan === 'free' ? 'free_limit' : 'plan_limit',
  };
}
