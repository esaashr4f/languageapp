import type { Prompt } from '../engine/grader';

export type SpeakerId = 'omni' | 'voice' | 'self' | 'carmen' | 'duende' | 'corrupt' | 'system';

export interface Line {
  who?: SpeakerId;
  text: string;
  /** English subtitle for target-language lines (toggle with the EN button). */
  gloss?: string;
}

export type PhaseId = 'corrupted' | 'wavering' | 'remembering';

export interface BattlePhase {
  id: PhaseId;
  label: string;
  /** Phase starts when corruption drops to or below this value. */
  from: number;
  enter: Line[];
  prompts: Prompt[];
  /** Damage on a miss; good answers reduce it, 0 means the legend has stopped attacking. */
  baseDamage: number;
  timerSec: number;
  attacks: Line[];
}

export interface LegendBattle {
  id: string;
  corruptName: string;
  trueName: string;
  intro: Line[];
  phases: BattlePhase[];
  victory: Line[];
}
