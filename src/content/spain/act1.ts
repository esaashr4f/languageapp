import type { Answer, Prompt, Slots } from '../../engine/grader';
import type { TierId } from '../../engine/tiers';
import type { LegendBattle, Line } from '../types';

const ans = (tier: TierId, ...texts: string[]): Answer[] => texts.map((text) => ({ tier, text }));

// Slot patterns are written against normalised text (lowercase, no accents: ñ -> n).
const ARTICLE = '(?:(?:un|una|unos|unas|el|la|los|las) )?';
export const SLOTS: Slots = {
  name: '[a-z]+(?: [a-z]+)?',
  item:
    ARTICLE +
    '(?:tortilla(?: de patatas)?|pincho de tortilla|churros?(?: con chocolate)?|cafe(?: con leche| solo)?|' +
    'bocadillo(?: de calamares| de jamon)?|cana|agua|zumo de naranja|croquetas|empanada)',
  food:
    ARTICLE +
    '(?:paella|tortilla(?: de patatas)?|churros(?: con chocolate)?|jamon(?: iberico)?|tapas|gazpacho|' +
    'bocadillo de calamares|croquetas|patatas bravas|cocido(?: madrileno)?)',
};

export const SLOT_EXAMPLES = (playerName: string): Record<string, string> => ({
  name: playerName || 'Alex',
  item: 'un café',
  food: 'la paella',
});

// ---------------------------------------------------------------------------
// Market

export const NEED_WORDS: Line[] = [
  { who: 'omni', text: "Whoa, that's ANTI's static. We're not ready for that yet." },
  { who: 'omni', text: 'We need some words first. Try talking to someone in the market.' },
];

// ---------------------------------------------------------------------------
// Life event: your first order (Carmen's stall)

export const CARMEN_ORDER: Prompt = {
  line: '¡Hola, cariño! ¿Qué te pongo?',
  gloss: 'Hi, love! What can I get you?',
  answers: [
    ...ans('phrasebook', '{item}', 'quiero {item}'),
    ...ans('textbook', '{item}, por favor', 'quiero {item}, por favor', 'quisiera {item}', 'quisiera {item}, por favor'),
    ...ans('conversational', 'ponme {item}', '¿me das {item}?', '¿me das {item}, por favor?'),
    ...ans('native', '¿me pones {item}?', '¿me pones {item}, por favor?', 'póngame {item}, por favor', '¿me pone {item}?'),
    ...ans('polyglot', 'ponme {item}, porfa', '¿me pones {item}, porfa?', '¿me pones {item} cuando puedas?'),
  ],
};

export const CARMEN_GREETING: Line[] = [
  { text: 'A woman in a red dress is stacking oranges. She smiles at you.' },
];

export const CARMEN_MISS: Line[] = [
  { who: 'carmen', text: '¿Cómo? No te entiendo, cariño...', gloss: "What? I don't understand you, love..." },
  { who: 'omni', text: 'Order something from her stall. Try: "Quiero un café, por favor." Even better: "¿Me pones un café?"' },
];

export const CARMEN_SERVED_NATIVE: Line[] = [
  { who: 'carmen', text: '¡Uy, qué bien hablas! ¡Pareces de aquí!', gloss: 'Ooh, you speak so well! You sound like a local!' },
];

export const CARMEN_SERVED: Line[] = [
  { who: 'carmen', text: '¡Marchando!', gloss: 'Coming right up!' },
];

export const CARMEN_AFTER_ORDER: Line[] = [
  { who: 'carmen', text: 'Toma, y unos churros. ¡Invita la casa!', gloss: "Here, and some churros. They're on the house!" },
  { text: 'You got 2× Churros! (+8 seconds on an answer in battle)' },
  { who: 'carmen', text: 'Pero ten cuidado... algo raro pasa en el puesto de fruta.', gloss: "But be careful... something strange is happening at the fruit stall." },
  { who: 'carmen', text: 'El duende del mercado... ya no es él.', gloss: "The market's duende... he's not himself anymore." },
  { who: 'omni', text: "A duende is a house spirit from Spanish folklore. ANTI must have corrupted him." },
  { who: 'omni', text: "He's part of Spain's stories. Talk to him in Spanish and we can bring him back. The static is up north." },
];

export const CARMEN_IDLE: Line[] = [
  { who: 'carmen', text: 'El puesto de fruta está allí arriba. ¡Ánimo!', gloss: "The fruit stall is up there. You've got this!" },
];

export const CARMEN_REWARD: Line[] = [
  { who: 'carmen', text: '¡Has salvado a mi duende! Toma, mi paella. ¡Te la has ganado!', gloss: "You saved my duende! Here, my paella. You've earned it!" },
  { text: 'You got 1× Paella! (restores 15 HP)' },
  { who: 'omni', text: "One legend restored, and the market's voice is coming back. That's the end of the prototype. More of Madrid soon!" },
];

export const CARMEN_AFTER_ALL: Line[] = [
  { who: 'carmen', text: '¡Vuelve cuando quieras, cariño!', gloss: 'Come back whenever you like, love!' },
];

export const DUENDE_RESTORED_IDLE: Line[] = [
  { who: 'duende', text: '¡El mercado vuelve a tener voz! Gracias, amigo.', gloss: 'The market has its voice back! Thanks, friend.' },
];

// ---------------------------------------------------------------------------
// Legend battle: the market duende

export const DUENDE_BATTLE: LegendBattle = {
  id: 'duende',
  corruptName: '??? (CORRUPTED)',
  trueName: 'DUENDE DEL MERCADO',
  intro: [
    { who: 'omni', text: "There he is. ANTI's static is all over him." },
    { who: 'omni', text: 'He will attack with words. Answer in Spanish. The more natural you sound, the more corruption you clear.' },
    { who: 'omni', text: 'Bad or slow answers hurt. Use ITEM for churros if you need more time. Ready?' },
    { who: 'corrupt', text: '¡¿QUIÉN ANDA AHÍ?! ¡ESTE MERCADO ES DE ANTI!', gloss: "WHO'S THERE?! THIS MARKET BELONGS TO ANTI!" },
  ],
  phases: [
    {
      id: 'corrupted',
      label: 'CORRUPTED',
      from: 100,
      enter: [],
      baseDamage: 6,
      timerSec: 25,
      attacks: [
        { who: 'corrupt', text: '¡SILENCIO!', gloss: 'SILENCE!' },
        { who: 'corrupt', text: '¡ANTI MANDA AQUÍ!', gloss: 'ANTI IS IN CHARGE HERE!' },
        { who: 'corrupt', text: '¡NO TE ENTIENDO, INTRUSO!', gloss: "I DON'T UNDERSTAND YOU, INTRUDER!" },
      ],
      prompts: [
        {
          line: '¡¿QUIÉN ERES TÚ?!',
          gloss: 'WHO ARE YOU?!',
          answers: [
            ...ans('phrasebook', 'me llamo {name}', 'mi nombre es {name}'),
            ...ans('textbook', 'yo soy {name}', 'yo me llamo {name}'),
            ...ans('conversational', 'soy {name}'),
            ...ans('native', 'soy {name} y vengo en paz', 'tranquilo, soy {name}', 'soy {name}, tranquilo'),
            ...ans('polyglot', 'tranqui, soy {name}', 'soy {name}, tranqui'),
          ],
        },
        {
          line: '¡FUERA DE MI MERCADO!',
          gloss: 'GET OUT OF MY MARKET!',
          answers: [
            ...ans('phrasebook', 'lo siento', 'perdón', 'no'),
            ...ans('textbook', 'lo siento mucho', 'disculpe', 'perdone'),
            ...ans('conversational', 'vale, vale', 'tranquilo', 'perdona'),
            ...ans('native', 'tranquilo, no pasa nada', 'perdona, no quiero molestar', 'no te enfades'),
            ...ans('regional', 'no te pongas así'),
            ...ans('polyglot', 'no te rayes', 'tranqui, tronco'),
          ],
        },
        {
          line: '¡¿QUÉ QUIERES DE MÍ?!',
          gloss: 'WHAT DO YOU WANT FROM ME?!',
          answers: [
            ...ans('phrasebook', 'ayuda', 'quiero ayudar'),
            ...ans('textbook', 'quiero ayudarte', 'quiero ayudarle'),
            ...ans('conversational', 'solo quiero ayudarte', 'vengo a ayudarte'),
            ...ans('native', 'solo quiero hablar contigo', 'he venido a ayudarte'),
            ...ans('polyglot', 'te echo una mano', 'vengo a echarte una mano', 'quiero echarte una mano'),
          ],
        },
      ],
    },
    {
      id: 'wavering',
      label: 'WAVERING',
      from: 60,
      enter: [
        { text: 'The duende flickers. For a moment, his true colours show through the static.' },
        { who: 'duende', text: '¿Q-qué...? Esa voz... ¿hablas mi idioma?', gloss: 'Wh-what...? That voice... you speak my language?' },
      ],
      baseDamage: 4,
      timerSec: 25,
      attacks: [
        { who: 'corrupt', text: '¡A-ANTI... DICE QUE MIENTES!', gloss: 'A-ANTI... SAYS YOU ARE LYING!' },
        { who: 'corrupt', text: '¡MI CABEZA! ¡CÁLLATE!', gloss: 'MY HEAD! BE QUIET!' },
      ],
      prompts: [
        {
          line: '¿Tú... hablas... español?',
          gloss: 'You... speak... Spanish?',
          answers: [
            ...ans('phrasebook', 'sí', 'sí, hablo español'),
            ...ans('textbook', 'sí, hablo un poco', 'sí, hablo un poco de español'),
            ...ans('conversational', 'un poco', 'sí, un poquito', 'estoy aprendiendo'),
            ...ans('native', 'estoy aprendiendo español', 'estoy aprendiendo, poco a poco'),
            ...ans('polyglot', 'me defiendo', 'me defiendo un poco'),
          ],
        },
        {
          line: 'No... recuerdo... ¿quién soy yo?',
          gloss: "I don't... remember... who am I?",
          answers: [
            ...ans('phrasebook', 'eres un duende', 'duende'),
            ...ans('textbook', 'tú eres un duende', 'eres el duende'),
            ...ans('conversational', 'eres el duende del mercado'),
            ...ans('native', 'eres el duende de este mercado', 'eres el duende del puesto de fruta', 'eres el duende de la frutería'),
            ...ans('polyglot', 'eres el duende de toda la vida'),
          ],
        },
        {
          line: 'Mi cabeza... ¿dónde estoy?',
          gloss: 'My head... where am I?',
          answers: [
            ...ans('phrasebook', 'en madrid', 'en el mercado'),
            ...ans('textbook', 'estás en el mercado', 'estás en madrid'),
            ...ans('conversational', 'estás en el mercado de madrid', 'estás en casa'),
            ...ans('native', 'estás en tu mercado', 'estás en casa, en tu mercado'),
            ...ans('polyglot', 'estás en tu casa'),
          ],
        },
      ],
    },
    {
      id: 'remembering',
      label: 'REMEMBERING',
      from: 25,
      enter: [
        { text: 'The static is fading. The duende stops attacking.' },
        { who: 'duende', text: 'Ya... ya me acuerdo un poco. Háblame más.', gloss: 'I... I remember a little now. Talk to me more.' },
      ],
      baseDamage: 0,
      timerSec: 35,
      attacks: [],
      prompts: [
        {
          line: 'Gracias... ¿cómo te llamas, amigo?',
          gloss: "Thank you... what's your name, friend?",
          answers: [
            ...ans('phrasebook', 'me llamo {name}'),
            ...ans('textbook', 'mi nombre es {name}'),
            ...ans('conversational', 'soy {name}'),
            ...ans('native', 'me llamo {name}, encantado', 'me llamo {name}, encantada', 'soy {name}, encantado', 'soy {name}, encantada'),
            ...ans('polyglot', 'soy {name}, un placer', 'me llamo {name}, un placer'),
          ],
        },
        {
          line: '¿Y qué te parece Madrid?',
          gloss: 'And what do you think of Madrid?',
          answers: [
            ...ans('phrasebook', 'bien', 'me gusta', 'bonito'),
            ...ans('textbook', 'me gusta mucho', 'es muy bonito', 'es muy bonita'),
            ...ans('conversational', 'me encanta', 'es genial', 'está genial'),
            ...ans('native', 'es una pasada', 'me encanta, es una pasada', 'es precioso'),
            ...ans('polyglot', 'me flipa', 'mola mucho', 'mola un montón'),
          ],
        },
        {
          line: '¿Qué te gusta comer aquí?',
          gloss: 'What do you like to eat here?',
          answers: [
            ...ans('phrasebook', '{food}'),
            ...ans('textbook', 'me gusta {food}', 'me gusta comer {food}'),
            ...ans('conversational', 'me encanta {food}', 'me encantan {food}'),
            ...ans('native', 'me vuelve loco {food}', 'me vuelven locos {food}', 'lo que más me gusta es {food}'),
            ...ans('polyglot', 'me pirra {food}', 'me pirran {food}'),
          ],
        },
      ],
    },
  ],
  victory: [
    { text: 'The last of the static peels away like old paint.' },
    { who: 'duende', text: '¡Ay...! Por fin. ¡Gracias, amigo!', gloss: 'Oh...! Finally. Thank you, friend!' },
    { who: 'duende', text: 'Soy el duende del mercado. Desde hoy, cuenta conmigo.', gloss: "I'm the market's duende. From today on, you can count on me." },
    { text: 'The DUENDE joined your spellbook! (+30 coins, +50 XP)' },
    { who: 'omni', text: "We did it. That's one legend ANTI can't have. Let's tell Carmen." },
  ],
};
