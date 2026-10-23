// The only place that talks to Claude. Everything else goes through runStructured().

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { z } from 'zod';

/**
 * Model routing (override with env vars to experiment):
 * - chat and rating: Claude Haiku 5.5, fast and cheap enough for every reply;
 * - Premium conversations and legends' big conversations: Claude Opus 5.5.
 */
export const MODELS = {
  chat: process.env.ZABAN_CHAT_MODEL ?? 'claude-haiku-5-5',
  /** Premium plan conversations: the most natural partners. */
  premiumChat: process.env.ZABAN_PREMIUM_CHAT_MODEL ?? 'claude-opus-5-5',
  rater: process.env.ZABAN_RATER_MODEL ?? 'claude-haiku-5-5',
  legend: process.env.ZABAN_LEGEND_MODEL ?? 'claude-opus-5-5',
};

export const aiConfigured = (): boolean => !!process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;

/**
 * One structured turn: a cached system prompt (character card + rubric), one user message,
 * and a JSON answer validated against `schema`. Returns null if the model declined or the
 * answer didn't parse, so callers can fall back to the scripted game.
 */
export async function runStructured<T extends z.ZodType>(opts: {
  model: string;
  system: string;
  user: string;
  schema: T;
}): Promise<z.infer<T> | null> {
  client ??= new Anthropic();
  // Opus can rescue a safety-classifier decline on another model; Haiku has no server-side fallback.
  const fallback = opts.model.startsWith('claude-opus')
    ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
    : {};
  const response = await client.beta.messages.parse({
    model: opts.model,
    max_tokens: 4000,
    system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: opts.user }],
    output_config: { format: betaZodOutputFormat(opts.schema), effort: 'low' },
    ...fallback,
  });
  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null;
  return (response.parsed_output as z.infer<T> | null) ?? null;
}
