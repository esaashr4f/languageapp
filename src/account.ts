// Sign-in (Supabase Auth: Google, Apple, Facebook, Discord) and cloud saves.
// Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the game runs in guest mode
// and keeps progress on this device only.

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { replaceState, save, saveListeners, state, type GameState } from './state';

export type Provider = 'google' | 'apple' | 'facebook' | 'discord';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

let session: Session | null = null;
const listeners: Array<(profile: Profile | null) => void> = [];

export const accountsEnabled = !!supabase;

export function profile(): Profile | null {
  const user = session?.user;
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'Traveller',
    email: user.email ?? '',
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    provider: user.app_metadata?.provider ?? 'email',
  };
}

export function onAccountChange(fn: (profile: Profile | null) => void): void {
  listeners.push(fn);
}

export async function signIn(provider: Provider): Promise<void> {
  if (!supabase) throw new Error('Sign-in is not configured on this build.');
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

// ---------------------------------------------------------------------------
// Cloud saves: one row per user in `saves` (see supabase/schema.sql).

let uploadTimer = 0;

async function upload(): Promise<void> {
  if (!supabase || !session) return;
  await supabase
    .from('saves')
    .upsert({ user_id: session.user.id, data: state, updated_at: new Date(state.updatedAt).toISOString() });
}

/** On sign-in, keep whichever save is newer: this device's or the account's. */
async function syncOnSignIn(): Promise<void> {
  if (!supabase || !session) return;
  const { data, error } = await supabase.from('saves').select('data').eq('user_id', session.user.id).maybeSingle();
  if (error) return;
  const cloud = data?.data as GameState | undefined;
  if (cloud && (cloud.updatedAt ?? 0) > state.updatedAt) replaceState(cloud);
  else if (state.updatedAt > 0) await upload();
}

export async function initAccount(): Promise<void> {
  if (!supabase) return;
  saveListeners.push(() => {
    window.clearTimeout(uploadTimer);
    uploadTimer = window.setTimeout(() => void upload(), 1500);
  });
  const { data } = await supabase.auth.getSession();
  session = data.session;
  if (session) await syncOnSignIn();
  supabase.auth.onAuthStateChange((event, next) => {
    const wasSignedIn = !!session;
    session = next;
    if (event === 'SIGNED_IN' && !wasSignedIn) {
      void syncOnSignIn().then(() => listeners.forEach((fn) => fn(profile())));
      return;
    }
    listeners.forEach((fn) => fn(profile()));
  });
}

/** Push the current save immediately (e.g. before signing out). */
export async function flushSave(): Promise<void> {
  save();
  window.clearTimeout(uploadTimer);
  await upload();
}
