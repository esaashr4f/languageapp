// Stand-in replies when ANTHROPIC_API_KEY isn't set, so the conversation UI can be tried
// locally. Clearly simpler than the real thing: it doesn't understand what you say.

import { CHARACTERS } from '../src/content/characters';
import type { ChatRequest, ChatTurnResult } from '../src/ai/schema';

const ENGLISH = /\b(the|and|you|is|are|what|how|my|your|hello|please|thanks|yes|no)\b/i;

const FOLLOW_UPS = [
  { line: '¡Qué interesante! Cuéntame más.', gloss: "How interesting! Tell me more." },
  { line: '¿Ah, sí? ¿Y tú de dónde eres?', gloss: 'Oh really? And where are you from?' },
  { line: '¡Me encanta hablar contigo! ¿Qué más quieres saber?', gloss: 'I love talking with you! What else do you want to know?' },
];

export function mockChat(req: ChatRequest): ChatTurnResult {
  const npc = CHARACTERS[req.npcId];
  const turn = req.history.filter((h) => h.speaker === 'player').length;
  const bye = /\b(adi[oó]s|hasta luego|chao|bye)\b/i.test(req.reply);
  const english = ENGLISH.test(req.reply);
  const sample = npc.sampleLines[turn % npc.sampleLines.length];
  const follow = FOLLOW_UPS[turn % FOLLOW_UPS.length];
  return {
    rating: {
      level: english ? 'STATIC' : 'CLEAR',
      understood_as: '(offline demo: not actually understood)',
      feedback: english ? 'Try saying it in Spanish!' : 'Nice, keep going!',
      correction: null,
      better: null,
    },
    npc: bye
      ? { line: '¡Hasta luego! Vuelve pronto.', gloss: 'See you later! Come back soon.', mood: 'happy' }
      : english
        ? { line: '¿Cómo? Perdona, no te entiendo.', gloss: "Sorry? I don't understand you.", mood: 'confused' }
        : turn % 2 === 0
          ? { line: sample.text, gloss: sample.gloss, mood: 'happy' }
          : { line: follow.line, gloss: follow.gloss, mood: 'curious' },
    omni_note: english ? "They can't understand English anymore. Try it in Spanish!" : null,
    ideas: npc.knows.slice(0, 3).map((k) => `Ask about: ${k}`),
    ended: bye,
  };
}
