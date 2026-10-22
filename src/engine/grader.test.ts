import { describe, expect, it } from 'vitest';
import { fillSlots, grade, normalize, osa, type Prompt } from './grader';

const order: Prompt = {
  line: '¿Qué te pongo?',
  gloss: 'What can I get you?',
  answers: [
    { tier: 'phrasebook', text: 'quiero {item}' },
    { tier: 'textbook', text: 'quiero {item}, por favor' },
    { tier: 'native', text: '¿me pones {item}?' },
    { tier: 'polyglot', text: '¿me pones {item}, porfa?' },
  ],
};
const slots = { item: '(?:(?:un|una) )?(?:cafe|tortilla)' };

describe('normalize', () => {
  it('strips accents, punctuation and case', () => {
    expect(normalize('¡¿Me PONES un café, porfa?!')).toBe('me pones un cafe porfa');
  });
});

describe('osa', () => {
  it('counts an adjacent swap as one edit', () => {
    expect(osa('perdon', 'pedron')).toBe(1);
    expect(osa('hola', 'hola')).toBe(0);
  });
});

describe('grade', () => {
  it('picks the highest tier that matches', () => {
    expect(grade(order, '¿Me pones un café?', slots).tier).toBe('native');
    expect(grade(order, 'me pones una tortilla porfa', slots).tier).toBe('polyglot');
    expect(grade(order, 'Quiero un cafe', slots).tier).toBe('phrasebook');
  });

  it('ignores leading fillers', () => {
    expect(grade(order, 'Hola, quiero un café, por favor', slots).tier).toBe('textbook');
  });

  it('offers better answers above the matched tier', () => {
    const g = grade(order, 'quiero un cafe', slots);
    expect(g.better.map((a) => a.tier)).toEqual(['polyglot', 'native']);
  });

  it('returns examples on a miss', () => {
    const g = grade(order, 'I want coffee', slots);
    expect(g.tier).toBeNull();
    expect(g.better.length).toBeGreaterThan(0);
  });

  it('tolerates a single typo on fixed answers', () => {
    const p: Prompt = { line: '', gloss: '', answers: [{ tier: 'textbook', text: 'lo siento mucho' }] };
    expect(grade(p, 'lo siento mucoh').tier).toBe('textbook');
    expect(grade(p, 'lo siento').tier).toBeNull();
  });
});

describe('fillSlots', () => {
  it('fills known slots and marks unknown ones', () => {
    expect(fillSlots('soy {name}, quiero {x}', { name: 'Alex' })).toBe('soy Alex, quiero …');
  });
});
