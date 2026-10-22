// The contract between the game and the AI for one battle turn. The server sends a
// BattleTurnRequest to the model and constrains its answer to BATTLE_TURN_SCHEMA
// (structured outputs), so the game can rely on every field being there.

import type { PhaseId } from '../content/types';
import { RATING_LEVELS, type RatingLevel } from './rubric';

export interface BattleTurnRequest {
  country: string;
  legendId: string;
  phase: PhaseId;
  playerName: string;
  /** Rough CEFR estimate, e.g. "A1". */
  playerLevel: string;
  /** Conversation so far, oldest first. */
  history: { speaker: 'legend' | 'player'; text: string }[];
  /** What the legend just said, and what it needs to hear (OMNI's current goal). */
  legendLine: string;
  goal: string;
  reply: string;
}

export interface BattleTurnResult {
  rating: {
    level: RatingLevel;
    /** What the player meant, in English. */
    understood_as: string;
    /** One encouraging sentence in English. */
    feedback: string;
    /** Corrected version of the reply, or null if there was nothing to correct. */
    correction: string | null;
    /** One more natural or more local way to say it, or null if already LOCAL. */
    better: string | null;
  };
  legend: {
    /** The legend's next line, in the target language, ending with something to respond to. */
    line: string;
    gloss: string;
    mood: 'hostile' | 'wary' | 'confused' | 'softening' | 'warm' | 'grateful';
  };
  omni: {
    /** OMNI's coaching for the player's next reply: a goal, not an answer. */
    goal: string;
  };
}

const text = { type: 'string' } as const;
const nullableText = { type: ['string', 'null'] } as const;

export const BATTLE_TURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['rating', 'legend', 'omni'],
  properties: {
    rating: {
      type: 'object',
      additionalProperties: false,
      required: ['level', 'understood_as', 'feedback', 'correction', 'better'],
      properties: {
        level: { type: 'string', enum: [...RATING_LEVELS] },
        understood_as: text,
        feedback: text,
        correction: nullableText,
        better: nullableText,
      },
    },
    legend: {
      type: 'object',
      additionalProperties: false,
      required: ['line', 'gloss', 'mood'],
      properties: {
        line: text,
        gloss: text,
        mood: { type: 'string', enum: ['hostile', 'wary', 'confused', 'softening', 'warm', 'grateful'] },
      },
    },
    omni: {
      type: 'object',
      additionalProperties: false,
      required: ['goal'],
      properties: { goal: text },
    },
  },
} as const;
