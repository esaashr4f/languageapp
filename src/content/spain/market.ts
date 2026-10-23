import type { Line } from '../types';

// Mercado de la Luz, Madrid: layout, stalls and the people in it.
// Coordinates are in tiles. Stalls are 4 wide: an awning row, then a counter row.

export const MAP_COLS = 40;
export const MAP_ROWS = 28;

export const ARRIVE_AT = { x: 19, y: 25 };
export const AFTER_BATTLE = { x: 19, y: 6 };
export const GLITCH_ZONE = { x: 17, y: 1, w: 6, h: 4 };
export const DEAD_STALL = { x: 19, y: 3, w: 2 };
export const FOUNTAIN = { x: 19, y: 13 };
/** The OMNI relay ANTI holds through the duende. */
export const RELAY = { x: 21, y: 5 };

export interface Stall {
  type: string;
  x: number;
  y: number;
  sign: string;
}

export const STALLS: Stall[] = [
  { type: 'fruit', x: 8, y: 7, sign: 'FRUTAS' },
  { type: 'spices', x: 13, y: 7, sign: 'ESPECIAS' },
  { type: 'pottery', x: 23, y: 7, sign: 'CERÁMICA' },
  { type: 'fish', x: 28, y: 7, sign: 'PESCADO' },
  { type: 'cheese', x: 3, y: 13, sign: 'QUESOS' },
  { type: 'churros', x: 33, y: 13, sign: 'CHURROS' },
  { type: 'bakery', x: 8, y: 20, sign: 'PANADERÍA' },
  { type: 'flowers', x: 28, y: 20, sign: 'FLORES' },
  { type: 'phones', x: 33, y: 20, sign: 'MÓVILES' },
];

export const BENCHES = [
  { x: 16, y: 16 },
  { x: 23, y: 16 },
];
export const LAMPS = [
  { x: 15, y: 11 },
  { x: 24, y: 11 },
  { x: 15, y: 17 },
  { x: 24, y: 17 },
];
export const PLANTS = [
  { x: 2, y: 2 },
  { x: 37, y: 2 },
  { x: 2, y: 25 },
  { x: 37, y: 25 },
  { x: 12, y: 25 },
  { x: 27, y: 25 },
];

export interface MarketNpc {
  id: string;
  sprite: string;
  name: string;
  x: number;
  y: number;
  /** Area the NPC strolls around in, if they walk. */
  wander?: { x: number; y: number; w: number; h: number };
  /** Each talk plays the next conversation, looping. */
  talks: Line[][];
}

const say = (text: string, gloss: string): Line => ({ who: 'npc', text, gloss });

export const MARKET_NPCS: MarketNpc[] = [
  {
    id: 'paco', sprite: 'paco', name: 'PACO', x: 29, y: 9,
    talks: [
      [say('¡Pescado fresco! ¡Recién traído de la costa!', 'Fresh fish! Just brought in from the coast!')],
      [say('¿Te gusta el marisco? Las gambas están buenísimas hoy.', 'Do you like seafood? The prawns are amazing today.')],
    ],
  },
  {
    id: 'lucia', sprite: 'lucia', name: 'LUCÍA', x: 9, y: 22,
    talks: [
      [say('¡Buenos días! El pan sale del horno a las nueve.', 'Good morning! The bread comes out of the oven at nine.')],
      [say('Prueba una napolitana de chocolate. ¡Están calentitas!', "Try a chocolate napolitana. They're nice and warm!")],
      [say('Todo ha subido: la harina, la luz... ¡y no quiero subir el precio del pan!', "Everything's gone up: flour, electricity... and I don't want to raise the price of bread!")],
    ],
  },
  {
    id: 'ines', sprite: 'ines', name: 'INÉS', x: 29, y: 22,
    talks: [
      [say('Las flores no necesitan traducción, ¿verdad?', "Flowers don't need translating, do they?")],
      [say('Hoy tengo claveles, rosas y girasoles.', 'Today I have carnations, roses and sunflowers.')],
      [say('Cada verano hace más calor. Mis flores ya no aguantan.', 'Every summer is hotter. My flowers just can\'t take it anymore.')],
    ],
  },
  {
    id: 'marta', sprite: 'marta', name: 'MARTA', x: 4, y: 15,
    talks: [
      [say('¿Quieres probar un poco de manchego?', 'Want to try a little manchego?')],
      [say('Este jamón es ibérico de bellota. ¡Lo mejor de lo mejor!', 'This ham is acorn-fed Iberian. The best of the best!')],
      [say('Los turistas compran mucho jamón, sí... pero el barrio ya no es para los vecinos.', "Tourists buy plenty of ham, sure... but the neighbourhood isn't for locals anymore.")],
    ],
  },
  {
    id: 'churrero', sprite: 'churrero', name: 'TOÑO', x: 34, y: 15,
    talks: [
      [say('¡Churros recién hechos! Con chocolate, ¡claro!', 'Freshly made churros! With chocolate, of course!')],
      [say('Aquí los churros se mojan en el chocolate. Así se hace en Madrid.', "Here you dip churros in the chocolate. That's how it's done in Madrid.")],
      [say('Con tantas normas de ruido, Madrid se está volviendo aburrido.', 'With all these noise rules, Madrid is getting boring.')],
    ],
  },
  {
    id: 'amina', sprite: 'amina', name: 'AMINA', x: 14, y: 9,
    talks: [
      [say('¡Bienvenido! Prueba el ras el hanout. Es de Marruecos, como yo.', "Welcome! Try the ras el hanout. It's from Morocco, like me.")],
      [say('Llegué a Madrid hace quince años sin hablar nada de español. ¡Poco a poco!', 'I came to Madrid fifteen years ago without a word of Spanish. Little by little!')],
      [say('Hay gente que dice que sobramos los inmigrantes... Pues este mercado no funcionaría sin nosotros.', "Some people say there are too many of us immigrants... Well, this market wouldn't run without us.")],
    ],
  },
  {
    id: 'fermin', sprite: 'fermin', name: 'FERMÍN', x: 24, y: 9,
    talks: [
      [say('¿Qué miras? Si no vas a comprar, ¡fuera!', "What are you looking at? If you're not buying, out!")],
      [say('Mi alquiler se ha triplicado. ¡Todo el edificio son pisos turísticos!', 'My rent has tripled. The whole building is tourist flats!')],
      [say('Y con las elecciones, todos prometen de todo. Luego, nada. Como siempre.', 'And with the elections, they all promise everything. Then nothing. As always.')],
      [say('El barrio ha cambiado tanto que ya no reconozco a nadie.', "The neighbourhood has changed so much I don't recognise anyone anymore.")],
    ],
  },
  {
    id: 'imran', sprite: 'imran', name: 'IMRAN', x: 34, y: 22,
    talks: [
      [say('¡Fundas, cargadores, tarjetas SIM! ¡Lo que necesites!', 'Cases, chargers, SIM cards! Whatever you need!')],
      [say('Desde que llegó eso de ANTI, todo el mundo quiere un número nuevo.', 'Since this ANTI thing arrived, everyone wants a new number.')],
      [say('Mi familia está en Lahore. Antes hablábamos con OMNI... ahora mis hijos les hablan en urdu.', 'My family is in Lahore. We used to talk through OMNI... now my kids speak to them in Urdu.')],
    ],
  },
  {
    id: 'ramon', sprite: 'ramon', name: 'DON RAMÓN', x: 21, y: 16, wander: { x: 16, y: 11, w: 8, h: 7 },
    talks: [
      [say('En mis tiempos, nadie usaba esos aparatos para hablar.', 'In my day, nobody used those gadgets to talk.')],
      [say('Si quieres aprender español, habla con la gente. ¡Así se aprende!', "If you want to learn Spanish, talk to people. That's how you learn!")],
      [say('¿Y las pensiones? A ver qué os queda a los jóvenes...', "And pensions? We'll see what's left for you young people...")],
    ],
  },
  {
    id: 'pablo', sprite: 'pablo', name: 'PABLO', x: 12, y: 17, wander: { x: 10, y: 15, w: 20, h: 9 },
    talks: [
      [say('¡Hola! ¿Por qué hablas tan raro?', 'Hi! Why do you talk so weird?')],
      [say('Mi móvil solo dice ANTI. ¡Qué rollo!', 'My phone only says ANTI. What a drag!')],
    ],
  },
  {
    id: 'sergio', sprite: 'sergio', name: 'SERGIO', x: 21, y: 11,
    talks: [
      [say('♪ ...Madrid, Madrid, Madrid... ♪', '(He is singing an old song about Madrid.)')],
      [say('La música también es un idioma, amigo.', 'Music is a language too, friend.')],
    ],
  },
  {
    id: 'traveller', sprite: 'traveller', name: 'TRAVELLER', x: 17, y: 16,
    talks: [
      [
        { text: 'A traveller sits by the bench, staring at a dead translation app.' },
        say('Yo... no... hablar... español... bien.', 'I... no... speak... Spanish... well.'),
        { who: 'omni', text: "Another traveller cut off by ANTI. They can't understand anyone here either. Maybe we can help them later." },
      ],
      [say('¿Tú... también... perdido?', 'You... also... lost?')],
    ],
  },
  {
    id: 'cat', sprite: 'cat', name: 'GATO', x: 6, y: 25, wander: { x: 3, y: 23, w: 8, h: 3 },
    talks: [[say('Miau.', 'Meow.')], [{ text: 'The cat stares at you. It does not need a translator.' }]],
  },
];

export const ARRIVAL: Line[] = [
  { text: 'Madrid. The bus from the airport drops you outside the Mercado de la Luz.' },
  { text: 'The market is busy. People shout prices, laugh, argue about football. All of it in Spanish.' },
  { who: 'omni', text: "Listen to them. Real Spanish, all around you. This is where you'll learn." },
  { who: 'omni', text: "See the lamppost up north, by the fruit stall, with the red light? That's one of my relays. ANTI has it." },
  { who: 'omni', text: "It's holding it through a legend. Wherever ANTI binds a legend to a relay, its static leaks out. That's the glitch you can see." },
  { who: 'omni', text: "We're not ready for that yet. First, let's talk to people. See the woman at the fruit stall? Say hello to her." },
];

export const RELAY_HELD: Line[] = [
  { who: 'omni', text: "That's my relay. ANTI's holding it through the duende: his power is jamming it, so nobody can reset it." },
  { who: 'omni', text: "We can't touch it until he's free. Talk him back to who he is, and he'll let go." },
];

export const RELAY_PROMPT: Line[] = [
  { who: 'omni', text: "Look, the relay! The red light's gone dim. The duende's not holding it for ANTI anymore." },
  { who: 'omni', text: 'Quick, walk me over to it and hold me up. I can take it back.' },
];

export const RELAY_RECLAIM: Line[] = [
  { text: 'You hold the phone up to the relay. Static crackles... then the light turns blue.' },
  { text: 'OMNI reclaimed the market relay!' },
  { who: 'omni', text: "I can see again! The streets around the market: Plaza Mayor, Puerta del Sol, La Latina..." },
  { who: 'omni', text: "ANTI's static is all over them. Every patch of it is another legend it's using as an anchor. Check the map on your phone (📱)." },
  { who: 'omni', text: "That's how we win this. One legend, one relay, one street at a time. Now let's go tell Carmen." },
];

export const RELAY_MINE: Line[] = [
  { who: 'omni', text: 'This relay is mine again. ANTI can\'t come back here: the duende is anchored in you now, not in the network.' },
];
