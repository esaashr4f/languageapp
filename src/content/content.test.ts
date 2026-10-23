import { describe, expect, it } from 'vitest';
import { fillSlots, grade, type Prompt } from '../engine/grader';
import { tierRank } from '../engine/tiers';
import { ASK_NUMBER, CARMEN_ORDER, DUENDE_BATTLE, SLOT_EXAMPLES, SLOTS } from './spain/act1';

const prompts: Prompt[] = [CARMEN_ORDER, ASK_NUMBER, ...DUENDE_BATTLE.phases.flatMap((p) => p.prompts)];
const examples = SLOT_EXAMPLES('Alex');

describe('Spain Act 1 content', () => {
  for (const prompt of prompts) {
    it(`"${prompt.line}" accepts its own example answers`, () => {
      for (const answer of prompt.answers) {
        const typed = fillSlots(answer.text, examples);
        const result = grade(prompt, typed, SLOTS);
        expect(result.tier, typed).not.toBeNull();
        expect(tierRank(result.tier!), typed).toBeGreaterThanOrEqual(tierRank(answer.tier));
      }
    });

    it(`"${prompt.line}" has a goal, a simple correct answer and a natural-or-better answer`, () => {
      const ranks = prompt.answers.map((a) => tierRank(a.tier));
      expect(prompt.goal).toBeTruthy();
      expect(ranks).toContain(tierRank('clear'));
      expect(Math.max(...ranks)).toBeGreaterThanOrEqual(tierRank('natural'));
    });
  }

  it('every listed mistake comes with a fix that is itself correct', () => {
    for (const prompt of prompts) {
      for (const answer of prompt.answers.filter((a) => a.tier === 'faint')) {
        expect(answer.fix, answer.text).toBeTruthy();
        expect(answer.why, answer.text).toBeTruthy();
        const fixed = grade(prompt, fillSlots(answer.fix!, examples), SLOTS);
        expect(tierRank(fixed.tier ?? 'faint'), answer.fix).toBeGreaterThanOrEqual(tierRank('clear'));
      }
    }
  });

  it('phases are ordered by corruption threshold', () => {
    const froms = DUENDE_BATTLE.phases.map((p) => p.from);
    expect(froms).toEqual([...froms].sort((a, b) => b - a));
  });
});
