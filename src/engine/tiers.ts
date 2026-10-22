export type TierId = 'faint' | 'clear' | 'natural' | 'local';

export interface Tier {
  id: TierId;
  label: string;
  /** One-line meaning shown to players. */
  blurb: string;
  points: number;
  /** Corruption cleared in battle (out of 100). */
  clear: number;
  color: string;
}

// Signal strength through ANTI's static, weakest to strongest; index doubles as rank.
// The full rubric (what qualifies for each, and what caps an answer) is in src/ai/rubric.ts.
export const TIERS: Tier[] = [
  { id: 'faint', label: 'Faint', blurb: 'Understood, but with mistakes', points: 10, clear: 7, color: '#8b86a8' },
  { id: 'clear', label: 'Clear', blurb: 'Correct and to the point', points: 25, clear: 12, color: '#59c8ff' },
  { id: 'natural', label: 'Natural', blurb: 'How a native would say it here', points: 50, clear: 18, color: '#7cf5b0' },
  { id: 'local', label: 'Local', blurb: 'Idiomatic, sounds like you live here', points: 100, clear: 26, color: '#ffc247' },
];

export function tierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id)!;
}

export function tierRank(id: TierId): number {
  return TIERS.findIndex((t) => t.id === id);
}
