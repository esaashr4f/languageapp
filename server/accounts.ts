// Who is calling, and how much signal they have. Uses Supabase with the service-role key
// (server only). Without Supabase configured, runs in dev mode: everyone is "dev" and
// signal lives in memory, so the game can be tried locally.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { consume, freshUsage, nextBarAt, PLANS, refill, type ConsumeResult, type PlanId, type Usage } from '../src/ai/plans';
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

export function status(usage: Usage): QuotaStatus {
  return {
    plan: usage.plan,
    signal: Math.floor(usage.signal),
    capacity: PLANS[usage.plan].capacity,
    credits: usage.credits,
    nextBarAt: nextBarAt(usage),
  };
}

export type SpendResult = ConsumeResult | { allowed: false; reason: 'conversation_limit'; usage: Usage };

interface Row {
  user_id: string;
  plan: PlanId;
  signal: number;
  signal_at: string;
  credits: number;
}

const devUsage = new Map<string, Usage>();

/**
 * Spend one bar of signal for this user. A conversation that has reached the plan's
 * per-conversation length is refused without being charged.
 */
export async function spendSignal(userId: string, conversationTurns: number, now = new Date()): Promise<SpendResult> {
  const tooLong = (usage: Usage): SpendResult | null =>
    conversationTurns >= PLANS[usage.plan].perConversation
      ? { allowed: false, reason: 'conversation_limit', usage: refill(usage, now) }
      : null;

  if (!admin) {
    const before = devUsage.get(userId) ?? freshUsage('free', now);
    const result = tooLong(before) ?? consume(before, now);
    if (result.allowed) devUsage.set(userId, result.usage);
    return result;
  }
  // Optimistic update: retry if another request changed the row in between.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await admin.from('entitlements').select('*').eq('user_id', userId).maybeSingle<Row>();
    const before: Usage = data
      ? { plan: data.plan, signal: data.signal, at: data.signal_at, credits: data.credits }
      : freshUsage('free', now);
    const result = tooLong(before) ?? consume(before, now);
    if (!result.allowed) return result;
    const next = {
      user_id: userId,
      plan: result.usage.plan,
      signal: result.usage.signal,
      signal_at: result.usage.at,
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
      .eq('signal_at', data.signal_at)
      .eq('credits', data.credits)
      .select('user_id');
    if (updated && updated.length) return result;
  }
  throw new Error('Could not record signal use, please try again.');
}

/** Current signal without spending any (for the phone and HUD). */
export async function peekSignal(userId: string, now = new Date()): Promise<Usage> {
  if (!admin) return refill(devUsage.get(userId) ?? freshUsage('free', now), now);
  const { data } = await admin.from('entitlements').select('*').eq('user_id', userId).maybeSingle<Row>();
  const usage: Usage = data
    ? { plan: data.plan, signal: data.signal, at: data.signal_at, credits: data.credits }
    : freshUsage('free', now);
  return refill(usage, now);
}
