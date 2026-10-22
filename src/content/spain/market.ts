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
    ],
  },
  {
    id: 'ines', sprite: 'ines', name: 'INÉS', x: 29, y: 22,
    talks: [
      [say('Las flores no necesitan traducción, ¿verdad?', "Flowers don't need translating, do they?")],
      [say('Hoy tengo claveles, rosas y girasoles.', 'Today I have carnations, roses and sunflowers.')],
    ],
  },
  {
    id: 'marta', sprite: 'marta', name: 'MARTA', x: 4, y: 15,
    talks: [
      [say('¿Quieres probar un poco de manchego?', 'Want to try a little manchego?')],
      [say('Este jamón es ibérico de bellota. ¡Lo mejor de lo mejor!', 'This ham is acorn-fed Iberian. The best of the best!')],
    ],
  },
  {
    id: 'churrero', sprite: 'churrero', name: 'TOÑO', x: 34, y: 15,
    talks: [
      [say('¡Churros recién hechos! Con chocolate, ¡claro!', 'Freshly made churros! With chocolate, of course!')],
      [say('Aquí los churros se mojan en el chocolate. Así se hace en Madrid.', "Here you dip churros in the chocolate. That's how it's done in Madrid.")],
    ],
  },
  {
    id: 'ramon', sprite: 'ramon', name: 'DON RAMÓN', x: 21, y: 16, wander: { x: 16, y: 11, w: 8, h: 7 },
    talks: [
      [say('En mis tiempos, nadie usaba esos aparatos para hablar.', 'In my day, nobody used those gadgets to talk.')],
      [say('Si quieres aprender español, habla con la gente. ¡Así se aprende!', "If you want to learn Spanish, talk to people. That's how you learn!")],
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
  { who: 'omni', text: "Up north, by the fruit stall, I'm picking up ANTI's static. But we're not ready for that yet." },
  { who: 'omni', text: "First, let's talk to people. See the woman at the fruit stall with the oranges? Say hello to her." },
];
