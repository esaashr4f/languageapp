export type TierId = 'phrasebook' | 'textbook' | 'conversational' | 'native' | 'regional' | 'polyglot';

export interface Tier {
  id: TierId;
  label: string;
  points: number;
  /** Corruption cleared in battle (out of 100). */
  clear: number;
  color: string;
}

// Ordered from least to most natural; index doubles as rank.
export const TIERS: Tier[] = [
  { id: 'phrasebook', label: 'Phrasebook', points: 10, clear: 8, color: '#8b86a8' },
  { id: 'textbook', label: 'Textbook', points: 15, clear: 10, color: '#59c8ff' },
  { id: 'conversational', label: 'Conversational', points: 30, clear: 14, color: '#7cf5b0' },
  { id: 'native', label: 'Native', points: 60, clear: 20, color: '#b18cff' },
  { id: 'regional', label: 'Regional', points: 85, clear: 24, color: '#ff9f5a' },
  { id: 'polyglot', label: 'Polyglot', points: 100, clear: 28, color: '#ffc247' },
];

export function tierById(id: TierId): Tier {
  return TIERS.find((t) => t.id === id)!;
}

export function tierRank(id: TierId): number {
  return TIERS.findIndex((t) => t.id === id);
}
