import { describe, expect, it } from 'vitest';
import { fillSlots, grade, normalize, osa, type Prompt } from './grader';

const order: Prompt = {
  line: '¿Qué te pongo?',
  gloss: 'What can I get you?',
  answers: [
    { tier: 'clear', text: 'quiero {item}' },
    { tier: 'faint', text: 'yo querer {item}' },
    { tier: 'natural', text: '¿me pones {item}?' },
    { tier: 'local', text: '¿me pones {item}, porfa?' },
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
    expect(grade(order, '¿Me pones un café?', slots).tier).toBe('natural');
    expect(grade(order, 'me pones una tortilla porfa', slots).tier).toBe('local');
    expect(grade(order, 'Quiero un cafe', slots).tier).toBe('clear');
    expect(grade(order, 'yo querer un cafe', slots).tier).toBe('faint');
  });

  it('ignores leading fillers', () => {
    expect(grade(order, 'Hola, quiero un café', slots).tier).toBe('clear');
  });

  it('offers better answers above the matched tier', () => {
    const g = grade(order, 'quiero un cafe', slots);
    expect(g.better.map((a) => a.tier)).toEqual(['local', 'natural']);
  });

  it('returns examples on a miss', () => {
    const g = grade(order, 'I want coffee', slots);
    expect(g.tier).toBeNull();
    // Never suggest an answer with mistakes in it.
    expect(g.better.map((a) => a.tier)).toEqual(['local', 'clear']);
  });

  it('tolerates a single typo on fixed answers', () => {
    const p: Prompt = { line: '', gloss: '', answers: [{ tier: 'clear', text: 'lo siento mucho' }] };
    expect(grade(p, 'lo siento mucoh').tier).toBe('clear');
    expect(grade(p, 'lo siento').tier).toBeNull();
  });

  it('prefers an exact listed mistake over a fuzzy correct answer', () => {
    const p: Prompt = {
      line: '',
      gloss: '',
      answers: [
        { tier: 'faint', text: 'tú es un duende' },
        { tier: 'clear', text: 'tú eres un duende' },
      ],
    };
    expect(grade(p, 'tu es un duende').tier).toBe('faint');
    expect(grade(p, 'tu eres un duende').tier).toBe('clear');
  });
});

describe('fillSlots', () => {
  it('fills known slots and marks unknown ones', () => {
    expect(fillSlots('soy {name}, quiero {x}', { name: 'Alex' })).toBe('soy Alex, quiero …');
  });
});
