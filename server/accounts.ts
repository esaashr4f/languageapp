// Who is calling, and how many replies they have left. Uses Supabase with the service-role
// key (server only). Without Supabase configured, runs in dev mode: everyone is "dev" and
// usage lives in memory, so the game can be tried locally.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { consume, PLANS, type ConsumeResult, type PlanId, type Usage } from '../src/ai/plans';
import type { QuotaStatus } from '../src/ai/schema';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin: SupabaseClient | null = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;

export const accountsConfigured = (): boolean => !!admin;

/** The signed-in user's id, "dev" in dev mode, or null if a sign-in is required. */
export async function identify(token: string | null): Promise<string | null> {
  if (!admin) return 'dev';
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}

const devUsage = new Map<string, Usage>();

function fresh(now: Date): Usage {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return { plan: 'free', periodStart: start.toISOString(), used: 0, credits: 0 };
}

/** Replies left without spending one. */
function consumeQuote(usage: Usage, now: Date): number {
  const r = consume(usage, now);
  return r.allowed ? r.remaining + 1 : 0;
}

export function status(result: SpendResult): QuotaStatus {
  return { plan: result.usage.plan, remaining: result.remaining, credits: result.usage.credits, resetsAt: result.resetsAt };
}

interface Row {
  user_id: string;
  plan: PlanId;
  period_start: string;
  replies_used: number;
  credits: number;
}

export type SpendResult = ConsumeResult | { allowed: false; reason: 'conversation_limit'; usage: Usage; remaining: number; resetsAt: string };

/**
 * Spend one reply for this user (plan allowance first, then credits). A conversation that
 * has reached the plan's per-conversation length is refused without being charged.
 */
export async function spendReply(userId: string, conversationTurns: number, now = new Date()): Promise<SpendResult> {
  const tooLong = (usage: Usage): SpendResult | null =>
    conversationTurns >= PLANS[usage.plan].perConversation
      ? { allowed: false, reason: 'conversation_limit', usage, remaining: consumeQuote(usage, now), resetsAt: consume(usage, now).resetsAt }
      : null;
  if (!admin) {
    const before = devUsage.get(userId) ?? fresh(now);
    const capped = tooLong(before);
    if (capped) return capped;
    const result = consume(before, now);
    if (result.allowed) devUsage.set(userId, result.usage);
    return result;
  }
  // Optimistic update: retry if another request changed the row in between.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await admin.from('entitlements').select('*').eq('user_id', userId).maybeSingle<Row>();
    const before: Usage = data
      ? { plan: data.plan, periodStart: data.period_start, used: data.replies_used, credits: data.credits }
      : fresh(now);
    const capped = tooLong(before);
    if (capped) return capped;
    const result = consume(before, now);
    if (!result.allowed) return result;
    const next = {
      user_id: userId,
      plan: result.usage.plan,
      period_start: result.usage.periodStart,
      replies_used: result.usage.used,
      credits: result.usage.credits,
      updated_at: now.toISOString(),
    };
    if (!data) {
      const { error } = await admin.from('entitlements').insert(next);
      if (!error) return result;
      continue;
    }
    const { data: updated } = await admin
      .from('entitlements')
      .update(next)
      .eq('user_id', userId)
      .eq('replies_used', data.replies_used)
      .eq('credits', data.credits)
      .eq('period_start', data.period_start)
      .select('user_id');
    if (updated && updated.length) return result;
  }
  throw new Error('Could not record usage, please try again.');
}

