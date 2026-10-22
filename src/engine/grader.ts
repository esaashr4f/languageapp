import { tierRank, type TierId } from './tiers';

export interface Answer {
  tier: TierId;
  /** Display form, with accents. May contain slots like {name} or {food}. */
  text: string;
}

export interface Prompt {
  line: string;
  gloss: string;
  /** What the speaker needs to hear, in English. OMNI coaches with it; the AI rater checks it. */
  goal?: string;
  answers: Answer[];
}

export interface Grade {
  tier: TierId | null;
  matched?: Answer;
  /** Answers from higher tiers than the one matched (or a spread of examples on a miss). */
  better: Answer[];
}

/** Slot name -> regex source, written against normalised text. */
export type Slots = Record<string, string>;

const DEFAULT_SLOT = '[a-z]+(?: [a-z]+)?';
const FILLERS = new Set(['hola', 'bueno', 'pues', 'oye', 'mira', 'ey', 'eh', 'ah', 'vale', 'si']);

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¡!¿?.,;:"“”«»'’()\-…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Drop leading filler words ("hola, ...", "pues ...") as long as something remains. */
function stripFillers(s: string): string {
  const words = s.split(' ');
  while (words.length > 1 && FILLERS.has(words[0])) words.shift();
  return words.join(' ');
}

/** Optimal string alignment distance: edits plus adjacent swaps. */
export function osa(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function typoAllowance(len: number): number {
  if (len >= 12) return 2;
  if (len >= 4) return 1;
  return 0;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function compile(pattern: string, slots: Slots): RegExp {
  const source = pattern
    .split(/(\{[a-z]+\})/)
    .map((part) => {
      const slot = part.match(/^\{([a-z]+)\}$/);
      return slot ? `(?:${slots[slot[1]] ?? DEFAULT_SLOT})` : escape(part);
    })
    .join('');
  return new RegExp(`^${source}$`);
}

export function matches(input: string, answer: Answer, slots: Slots = {}, fuzzy = true): boolean {
  const pattern = normalize(answer.text);
  if (pattern.includes('{')) return compile(pattern, slots).test(input);
  if (pattern === input) return true;
  return fuzzy && osa(pattern, input) <= typoAllowance(pattern.length);
}

/** One answer per tier, most natural first. */
function spread(answers: Answer[], aboveRank: number, limit: number): Answer[] {
  const seen = new Set<TierId>();
  return [...answers]
    .filter((a) => tierRank(a.tier) > aboveRank)
    .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
    .filter((a) => (seen.has(a.tier) ? false : (seen.add(a.tier), true)))
    .slice(0, limit);
}

export function grade(prompt: Prompt, raw: string, slots: Slots = {}): Grade {
  const input = normalize(raw);
  if (!input) return { tier: null, better: spread(prompt.answers, tierRank('faint'), 2) };
  const candidates = [...new Set([input, stripFillers(input)])];

  // Exact matches win over typo-tolerant ones, so a listed mistake ("tú es") isn't
  // fuzzily upgraded to the correct answer it is one edit away from ("tú eres").
  const find = (fuzzy: boolean) => {
    let best: Answer | undefined;
    for (const answer of prompt.answers) {
      if (best && tierRank(answer.tier) <= tierRank(best.tier)) continue;
      if (candidates.some((c) => matches(c, answer, slots, fuzzy))) best = answer;
    }
    return best;
  };
  const best = find(false) ?? find(true);
  if (!best) {
    // On a miss, show the simplest correct way plus the most natural one.
    const correct = prompt.answers.filter((a) => tierRank(a.tier) >= tierRank('clear'));
    const simplest = [...correct].sort((a, b) => tierRank(a.tier) - tierRank(b.tier))[0];
    const top = spread(correct, tierRank(simplest.tier), 1);
    return { tier: null, better: [...top, simplest] };
  }
  return { tier: best.tier, matched: best, better: spread(prompt.answers, tierRank(best.tier), 2) };
}

/** Replace {slot} placeholders with readable examples for display. */
export function fillSlots(text: string, examples: Record<string, string>): string {
  return text.replace(/\{([a-z]+)\}/g, (_, name: string) => examples[name] ?? '…');
}
