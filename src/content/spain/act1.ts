import type { Answer, Prompt, Slots } from '../../engine/grader';
import type { TierId } from '../../engine/tiers';
import type { LegendBattle, Line } from '../types';

const ans = (tier: TierId, ...texts: string[]): Answer[] => texts.map((text) => ({ tier, text }));
/** A common learner mistake: rates Faint, and shows the fix and why. */
const faint = (text: string, fix: string, why: string): Answer => ({ tier: 'faint', text, fix, why });

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
  goal: "She's asking what you'd like. Order something from her stall, like a coffee or some churros.",
  answers: [
    faint('yo querer {item}', 'quiero {item}', 'Conjugate the verb: "yo quiero", not "yo querer".'),
    faint('quiero {item} please', 'quiero {item}, por favor', 'Nobody here understands English anymore: "por favor".'),
    ...ans('clear', '{item}', 'quiero {item}', '{item}, por favor', 'quiero {item}, por favor', 'quisiera {item}', 'quisiera {item}, por favor'),
    ...ans('natural', 'ponme {item}', '¿me das {item}?', '¿me das {item}, por favor?', '¿me pones {item}?', '¿me pones {item}, por favor?', 'póngame {item}, por favor', '¿me pone {item}?'),
    ...ans('local', 'ponme {item}, porfa', '¿me pones {item}, porfa?', '¿me pones {item} cuando puedas?'),
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

export const CARMEN_SERVED_FAINT: Line[] = [
  { who: 'carmen', text: '¿Cómo? Ah, ¡que quieres decir...! Jaja, no pasa nada, cariño. ¡Marchando!', gloss: "What? Oh, you mean...! Haha, no problem, love. Coming right up!" },
];

export const CARMEN_SERVED: Line[] = [
  { who: 'carmen', text: '¡Marchando!', gloss: 'Coming right up!' },
];

export const CARMEN_AFTER_ORDER: Line[] = [
  { who: 'carmen', text: 'Toma, y unos churros. ¡Invita la casa!', gloss: "Here, and some churros. They're on the house!" },
  { text: 'You got 2× Churros! (+8 seconds on an answer in battle)' },
  { who: 'carmen', text: 'Y toma, mi número. Si necesitas algo, me llamas, ¿vale?', gloss: "And here, my number. If you need anything, call me, okay?" },
  { text: "Carmen's number was saved to your phone (📱 → Contacts)." },
  { who: 'omni', text: "Nice. Keep numbers: friends can help in a fight. You can ask people for theirs while you chat, in Spanish. Not everyone will say yes, though." },
  { who: 'omni', text: "One problem: you can't call anyone yet. Your SIM is from back home, and roaming died with the network. You'll need a Spanish SIM. There's a phone stall in the market, MÓVILES." },
  { who: 'carmen', text: 'Pero ten cuidado... algo raro pasa en el puesto de fruta.', gloss: "But be careful... something strange is happening at the fruit stall." },
  { who: 'carmen', text: 'El duende del mercado... ya no es él.', gloss: "The market's duende... he's not himself anymore." },
  { who: 'omni', text: "A duende is a house spirit from Spanish folklore. ANTI must have corrupted him." },
  { who: 'omni', text: "He's part of Spain's stories. Talk to him in Spanish and we can bring him back. The static is up north." },
];

/** Asking for someone's number, in Spanish. */
export const ASK_NUMBER: Prompt = {
  line: '(Ask for their phone number.)',
  gloss: '',
  goal: 'Ask for their phone number, in Spanish.',
  answers: [
    faint('tu número por favor', '¿me das tu número, por favor?', 'Make it a question: "¿Me das...?" (Can you give me...?)'),
    faint('número teléfono', '¿me das tu número de teléfono?', 'Add the verb and "de": "¿Me das tu número de teléfono?"'),
    ...ans('clear', '¿me das tu número?', '¿cuál es tu número?', '¿me das tu número, por favor?', '¿me das tu número de teléfono?'),
    ...ans('natural', '¿me pasas tu número?', '¿me das tu teléfono?', '¿te puedo pedir tu número?', '¿me dejas tu número?'),
    ...ans('local', '¿me pasas tu móvil?', '¿me das tu móvil?', '¿me pasas tu whatsapp?'),
  ],
};

// ---------------------------------------------------------------------------
// Life event: buying a SIM card (Imran's phone stall)

export const SIM_PRICE = 20;

export const SIM_ASK: Prompt = {
  line: '¡Hola, buenas! ¿Qué necesitas?',
  gloss: 'Hi there! What do you need?',
  goal: 'Ask him for a SIM card for your phone.',
  answers: [
    faint('yo querer sim', 'quiero una tarjeta SIM', 'Conjugate the verb: "quiero".'),
    faint('sim por favor', 'una tarjeta SIM, por favor', 'Spanish says "una tarjeta SIM" (a SIM card).'),
    ...ans('clear', 'quiero una tarjeta sim', 'una tarjeta sim, por favor', 'quiero una sim', 'una sim, por favor', '¿tienes tarjetas sim?', 'necesito una tarjeta sim'),
    ...ans('natural', '¿me das una tarjeta sim?', '¿me vendes una sim?', '¿tienes una sim de prepago?', 'necesito una sim para el móvil'),
    ...ans('local', '¿me pones una sim de prepago?', '¿me pasas una sim de prepago?', 'me hace falta una sim para el móvil'),
  ],
};

export const SIM_PRICE_LINES: Line[] = [
  { who: 'npc', name: 'IMRAN', text: 'Claro. Una de prepago con llamadas y datos: son veinte.', gloss: 'Sure. A prepaid one with calls and data: that\'s twenty.' },
];

export const SIM_TOO_POOR: Line[] = [
  { text: `You check your pockets. Not enough coins (a SIM costs ${SIM_PRICE}).` },
  { who: 'npc', name: 'IMRAN', text: 'No pasa nada. Vuelve cuando puedas, aquí estoy.', gloss: "No worries. Come back when you can, I'm here." },
  { who: 'omni', text: "We're short. Helping people and winning fights earns coins. We'll come back." },
];

export const SIM_BOUGHT: Line[] = [
  { text: 'You hand over 20 coins. Imran swaps the SIM in your phone in two seconds flat.' },
  { who: 'npc', name: 'IMRAN', text: '¡Listo! Ya tienes número español. ¡Bienvenido a Madrid!', gloss: "Done! Now you've got a Spanish number. Welcome to Madrid!" },
  { who: 'omni', text: 'Now you can call your contacts. In a fight, CALL a friend once and they\'ll tell you what to say.' },
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
    { who: 'omni', text: "There he is. ANTI rewrote his story, and now it's using him to hold my relay." },
    { who: 'omni', text: "We give him an anchor outside the network: you. Every time you answer him in Spanish, you're telling his story again with living words." },
    { who: 'omni', text: "He'll attack with ANTI's static. It scrambles your words, so watch your VOICE. Every time he shouts, I'll tell you what he needs to hear." },
    { who: 'omni', text: 'Three steps: calm him down, help him remember who he is, then just talk with him. ITEM for food, CALL if you need a friend. Ready?' },
    { who: 'corrupt', text: '¡¿QUIÉN ANDA AHÍ?! ¡ESTE MERCADO ES DE ANTI!', gloss: "WHO'S THERE?! THIS MARKET BELONGS TO ANTI!" },
  ],
  phases: [
    {
      id: 'corrupted',
      label: 'CORRUPTED',
      step: 'CALM HIM DOWN',
      from: 100,
      enter: [],
      baseDamage: 6,
      faintReaction: { who: 'corrupt', text: '¿¡QUÉ!? ¡NI SIQUIERA SABES HABLAR!', gloss: "WHAT!? YOU CAN'T EVEN TALK PROPERLY!" },
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
          goal: "He's scared of strangers. Tell him who you are, and that you mean no harm.",
          answers: [
            faint('yo llamo {name}', 'me llamo {name}', 'Llamarse is reflexive: "me llamo" (literally "I call myself").'),
            faint('mi llamo {name}', 'me llamo {name}', '"Me", not "mi": "mi" means "my".'),
            ...ans('clear', 'me llamo {name}', 'mi nombre es {name}', 'yo soy {name}', 'yo me llamo {name}'),
            ...ans('natural', 'soy {name}', 'soy {name} y vengo en paz', 'tranquilo, soy {name}', 'soy {name}, tranquilo'),
            ...ans('local', 'tranqui, soy {name}', 'soy {name}, tranqui'),
          ],
        },
        {
          line: '¡FUERA DE MI MERCADO!',
          gloss: 'GET OUT OF MY MARKET!',
          goal: 'He wants you gone. Apologise, or calm him down.',
          answers: [
            faint('yo siento', 'lo siento', 'The fixed phrase is "lo siento" (literally "I feel it").'),
            faint('lo sentir', 'lo siento', 'Conjugate the verb: "siento".'),
            ...ans('clear', 'lo siento', 'perdón', 'lo siento mucho', 'disculpe', 'perdone'),
            ...ans('natural', 'vale, vale', 'tranquilo', 'perdona', 'tranquilo, no pasa nada', 'perdona, no quiero molestar', 'no te enfades', 'no te pongas así'),
            ...ans('local', 'no te rayes', 'tranqui, tronco', 'vale, vale, tranqui'),
          ],
        },
        {
          line: '¡¿QUÉ QUIERES DE MÍ?!',
          gloss: 'WHAT DO YOU WANT FROM ME?!',
          goal: "He's suspicious. Tell him you're here to help him.",
          answers: [
            faint('ayuda', 'quiero ayudarte', '"¡Ayuda!" on its own means "Help!". Say what you want to do.'),
            faint('yo querer ayudar', 'quiero ayudar', 'Conjugate the verb: "quiero".'),
            faint('quiero ayudar tú', 'quiero ayudarte', 'The "you" attaches to the verb: "ayudarte".'),
            ...ans('clear', 'quiero ayudar', 'quiero ayudarte', 'quiero ayudarle'),
            ...ans('natural', 'solo quiero ayudarte', 'vengo a ayudarte', 'solo quiero hablar contigo', 'he venido a ayudarte'),
            ...ans('local', 'te echo una mano', 'vengo a echarte una mano', 'quiero echarte una mano'),
          ],
        },
      ],
    },
    {
      id: 'wavering',
      label: 'WAVERING',
      step: 'HELP HIM REMEMBER',
      from: 60,
      enter: [
        { text: 'The duende flickers. For a moment, his true colours show through the static.' },
        { who: 'duende', text: '¿Q-qué...? Esa voz... ¿hablas mi idioma?', gloss: 'Wh-what...? That voice... you speak my language?' },
        { who: 'omni', text: "It's working! Step two: he's lost his memory. Answer his questions and help him remember who he is." },
      ],
      baseDamage: 4,
      faintReaction: { who: 'duende', text: '¿Eh...? Hablas... raro. Pero... te entiendo.', gloss: 'Huh...? You talk... funny. But... I understand you.' },
      timerSec: 25,
      attacks: [
        { who: 'corrupt', text: '¡A-ANTI... DICE QUE MIENTES!', gloss: 'A-ANTI... SAYS YOU ARE LYING!' },
        { who: 'corrupt', text: '¡MI CABEZA! ¡CÁLLATE!', gloss: 'MY HEAD! BE QUIET!' },
      ],
      prompts: [
        {
          line: '¿Tú... hablas... español?',
          gloss: 'You... speak... Spanish?',
          goal: "He's starting to hear you! Tell him whether you speak Spanish.",
          answers: [
            faint('si, yo hablo poco', 'sí, hablo un poco', '"Un poco" means "a little"; "poco" alone sounds like "hardly at all".'),
            faint('yo hablar español', 'hablo español', 'Conjugate the verb: "hablo".'),
            ...ans('clear', 'sí', 'sí, hablo español', 'hablo español', 'hablo un poco', 'sí, hablo un poco', 'sí, hablo un poco de español', 'un poco'),
            ...ans('natural', 'sí, un poquito', 'estoy aprendiendo', 'estoy aprendiendo español', 'estoy aprendiendo, poco a poco'),
            ...ans('local', 'me defiendo', 'me defiendo un poco'),
          ],
        },
        {
          line: 'No... recuerdo... ¿quién soy yo?',
          gloss: "I don't... remember... who am I?",
          goal: "He's forgotten who he is. Remind him: he's the market's duende.",
          answers: [
            faint('tú es un duende', 'tú eres un duende', 'With tú, "ser" becomes "eres".'),
            faint('eres duende', 'eres un duende', 'Add the article: "un duende".'),
            ...ans('clear', 'eres un duende', 'duende', 'tú eres un duende', 'eres el duende'),
            ...ans('natural', 'eres el duende del mercado', 'eres el duende de este mercado', 'eres el duende del puesto de fruta', 'eres el duende de la frutería'),
            ...ans('local', 'eres el duende de toda la vida'),
          ],
        },
        {
          line: 'Mi cabeza... ¿dónde estoy?',
          gloss: 'My head... where am I?',
          goal: "He's confused. Tell him where he is.",
          answers: [
            faint('tu esta en el mercado', 'estás en el mercado', 'With tú, "estar" becomes "estás".'),
            faint('tú estás en mercado', 'estás en el mercado', 'Spanish needs the article here: "en el mercado".'),
            ...ans('clear', 'en madrid', 'en el mercado', 'estás en el mercado', 'estás en madrid'),
            ...ans('natural', 'estás en el mercado de madrid', 'estás en casa', 'estás en tu mercado', 'estás en casa, en tu mercado'),
            ...ans('local', 'estás en tu casa'),
          ],
        },
      ],
    },
    {
      id: 'remembering',
      label: 'REMEMBERING',
      step: 'TALK WITH HIM',
      from: 25,
      enter: [
        { text: 'The static is fading. The duende stops attacking.' },
        { who: 'duende', text: 'Ya... ya me acuerdo un poco. Háblame más.', gloss: 'I... I remember a little now. Talk to me more.' },
        { who: 'omni', text: "Last step. He's not fighting anymore. Just chat with him like a friend." },
      ],
      baseDamage: 0,
      faintReaction: { who: 'duende', text: '¡Jeje! Casi, casi. Se dice así, ¿eh?', gloss: 'Hehe! Almost. You say it like this, see?' },
      timerSec: 35,
      attacks: [],
      prompts: [
        {
          line: 'Gracias... ¿cómo te llamas, amigo?',
          gloss: "Thank you... what's your name, friend?",
          goal: "He's back! He's asking your name. Introduce yourself, nicely this time.",
          answers: [
            faint('yo llamo {name}', 'me llamo {name}', 'Llamarse is reflexive: "me llamo".'),
            ...ans('clear', 'me llamo {name}', 'mi nombre es {name}'),
            ...ans('natural', 'soy {name}', 'me llamo {name}, encantado', 'me llamo {name}, encantada', 'soy {name}, encantado', 'soy {name}, encantada', 'soy {name}, un placer'),
            ...ans('local', 'soy {name}, encantado de la vida', 'soy {name}, encantada de la vida'),
          ],
        },
        {
          line: '¿Y qué te parece Madrid?',
          gloss: 'And what do you think of Madrid?',
          goal: 'Small talk! Tell him what you think of Madrid.',
          answers: [
            faint('yo gusta madrid', 'me gusta Madrid', 'Gustar works backwards: "me gusta" means "it pleases me".'),
            faint('me gusto', 'me gusta', '"Me gusto" means "I like myself"!'),
            ...ans('clear', 'bien', 'me gusta', 'me gusta madrid', 'bonito', 'me gusta mucho', 'me gusta mucho madrid', 'es muy bonito', 'es muy bonita'),
            ...ans('natural', 'me encanta', 'es genial', 'está genial', 'es precioso'),
            ...ans('local', 'es una pasada', 'me encanta, es una pasada', 'me flipa', 'mola mucho', 'mola un montón'),
          ],
        },
        {
          line: '¿Qué te gusta comer aquí?',
          gloss: 'What do you like to eat here?',
          goal: 'He wants to know your favourite food here.',
          answers: [
            faint('yo gusta {food}', 'me gusta {food}', 'Gustar works backwards: "me gusta".'),
            ...ans('clear', '{food}', 'me gusta {food}', 'me gusta comer {food}'),
            ...ans('natural', 'me encanta {food}', 'me encantan {food}', 'lo que más me gusta es {food}'),
            ...ans('local', 'me vuelve loco {food}', 'me vuelven locos {food}', 'me pirra {food}', 'me pirran {food}'),
          ],
        },
      ],
    },
  ],
  victory: [
    { text: 'The last of the static peels away like old paint.' },
    { who: 'duende', text: '¡Ay...! Por fin. ¡Gracias, amigo!', gloss: 'Oh...! Finally. Thank you, friend!' },
    { who: 'duende', text: 'Soy el duende del mercado. Desde hoy, cuenta conmigo.', gloss: "I'm the market's duende. From today on, you can count on me." },
    { text: 'The DUENDE is anchored in you now. He joined your spellbook! (+30 coins, +50 XP)' },
    { who: 'omni', text: "We did it. His story lives in your head now, and ANTI can't reach in there. He's let go of the relay." },
  ],
};
