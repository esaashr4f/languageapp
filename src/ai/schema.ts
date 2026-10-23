// Contracts between the game and the AI game master. The server constrains the model's
// answer to these schemas (structured outputs), so the game can rely on every field.

import { z } from 'zod';
import type { PhaseId } from '../content/types';
import { RATING_LEVELS } from './rubric';

const Rating = z.object({
  level: z.enum(RATING_LEVELS),
  /** What the learner meant, in English. */
  understood_as: z.string(),
  /** One encouraging sentence in English. */
  feedback: z.string(),
  /** Corrected version of the reply, or null if there was nothing to correct. */
  correction: z.string().nullable(),
  /** One more natural or more local way to say it, or null if already LOCAL. */
  better: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Battle turns: rate the reply to a legend.

export interface BattleTurnRequest {
  country: string;
  legendId: string;
  phase: PhaseId;
  playerName: string;
  /** Rough CEFR estimate, e.g. "A1". */
  playerLevel: string;
  history: { speaker: 'legend' | 'player'; text: string }[];
  legendLine: string;
  /** What the legend needs to hear (OMNI's current goal). */
  goal: string;
  reply: string;
}

export const BattleTurnSchema = z.object({
  rating: Rating,
  legend: z.object({
    /** The legend's reaction, in the target language. */
    line: z.string(),
    gloss: z.string(),
    mood: z.enum(['hostile', 'wary', 'confused', 'softening', 'warm', 'grateful']),
  }),
  omni: z.object({
    /** Coaching for the next reply: a goal, not an answer. */
    goal: z.string(),
  }),
});
export type BattleTurnResult = z.infer<typeof BattleTurnSchema>;

// ---------------------------------------------------------------------------
// Free conversation with an NPC.

export interface ChatRequest {
  country: string;
  npcId: string;
  playerName: string;
  playerLevel: string;
  /** The conversation so far, oldest first (the NPC's opener included). */
  history: { speaker: 'npc' | 'player'; text: string }[];
  reply: string;
}

export const ChatTurnSchema = z.object({
  rating: Rating,
  npc: z.object({
    /** The NPC's reply, in the target language, in character. */
    line: z.string(),
    gloss: z.string(),
    mood: z.enum(['happy', 'curious', 'amused', 'confused', 'thoughtful', 'sad', 'busy']),
  }),
  /** OMNI's aside about a mistake worth fixing, in English; null when there's nothing to say. */
  omni_note: z.string().nullable(),
  /** Two or three short ideas (English) for what the learner could talk about next. */
  ideas: z.array(z.string()),
  /** True when the NPC has said goodbye (the learner ended it, or the NPC has to go). */
  ended: z.boolean(),
});
export type ChatTurnResult = z.infer<typeof ChatTurnSchema>;

/** Why the server refused a turn; the game turns these into OMNI's lines. */
export type LimitReason = 'sign_in_required' | 'no_signal' | 'conversation_limit';

export interface QuotaStatus {
  plan: 'free' | 'basic' | 'premium';
  /** Whole bars available now. */
  signal: number;
  capacity: number;
  /** Battery-pack bars on top. */
  credits: number;
  /** When the next bar is ready, if the signal is empty. */
  nextBarAt: string | null;
}

export type ChatResponse =
  | { ok: true; result: ChatTurnResult; quota: QuotaStatus | null; mock?: boolean }
  | { ok: false; reason: LimitReason; quota: QuotaStatus | null };
