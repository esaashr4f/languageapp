import type { Prompt } from '../engine/grader';

export type SpeakerId = 'omni' | 'voice' | 'self' | 'npc' | 'carmen' | 'duende' | 'corrupt' | 'system';

export interface Line {
  who?: SpeakerId;
  /** Overrides the speaker's nameplate (used for market NPCs). */
  name?: string;
  text: string;
  /** English subtitle for target-language lines (toggle with the EN button). */
  gloss?: string;
}

export type PhaseId = 'corrupted' | 'wavering' | 'remembering';

export interface BattlePhase {
  id: PhaseId;
  label: string;
  /** What the player is trying to do in this phase, shown as a step tracker. */
  step: string;
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
