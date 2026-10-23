// Pixel sprites as text grids: one character per pixel, '.' is transparent.
// Pure data (no Phaser) so it can be unit-tested.

export interface SpriteDef {
  rows: string[];
  palette: Record<string, string>;
}

const OUTLINE = '#1a1026';

const PLAYER_ROWS = [
  '................',
  '.....oooooo.....',
  '....occcccco....',
  '...occcccccco...',
  '...oooooooooo...',
  '....osesseso....',
  '....ossssssobb..',
  '...ojjjjjjjjobb.',
  '..ojjjjjjjjjjob.',
  '..osjjjjjjjjsob.',
  '..osjjjjjjjjsob.',
  '...ojjjjjjjjo...',
  '...oppppppppo...',
  '...opppoopppo...',
  '...owwwo.owwwo..',
  '................',
];

const CARMEN_ROWS = [
  '................',
  '......ooo.......',
  '.....ogggo......',
  '....ogggggggo...',
  '...ogggggggggo..',
  '...ogsesssesgo..',
  '...ogssssssso...',
  '....ooossooo....',
  '...oddddddddo...',
  '..osddaaaaddso..',
  '..osdaaaaaadso..',
  '...odaaaaaado...',
  '...oddddddddo...',
  '...oddddddddo...',
  '....owwo.owwo...',
  '................',
];

const DUENDE_ROWS = [
  '........o.......',
  '.......oto......',
  '......ottto.....',
  '.....otttttoo...',
  '....ottttttto...',
  '...ohhhhhhhhho..',
  '...osesssssseso.',
  '...osssbbbsssso.',
  '....obbbbbbbbo..',
  '...oggobbbboggo.',
  '..osggggggggggso',
  '..osgggllllgggso',
  '...ogggggggggo..',
  '....oggoooggo...',
  '...owwwo.owwwo..',
  '................',
];


const VILLAGER_ROWS = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohssssssho...',
  '....osesseso....',
  '....osssssso....',
  '...otttttttto...',
  '..otttaaaattto..',
  '..osttaaaattso..',
  '..osttaaaattso..',
  '...otttttttto...',
  '...oppppppppo...',
  '...opppoopppo...',
  '...owwwo.owwwo..',
  '................',
];

const HAT_ROWS = [
  '.....oooooo.....',
  '....occcccco....',
  '....occcccco....',
  '...oooooooooo...',
  ...VILLAGER_ROWS.slice(4),
];

const CAT_ROWS = [
  '................',
  '................',
  '................',
  '................',
  '..o.....o.......',
  '..oo...oo.......',
  '..occccco.......',
  '..ocececo.......',
  '..occpcco.......',
  '...occco....o...',
  '..occccco...o...',
  '..occcccco.o....',
  '..occcccco.o....',
  '..occcccccoo....',
  '..oooooooo......',
  '................',
];

/** Villagers share one body; palettes make them distinct people. */
function villager(rows: string[], colours: Record<string, string>): SpriteDef {
  return { rows, palette: { o: OUTLINE, e: OUTLINE, s: '#e8b48a', w: '#3b2a20', h: '#3b2a20', ...colours } };
}

export const SPRITES: Record<string, SpriteDef> = {
  player: {
    rows: PLAYER_ROWS,
    palette: {
      o: OUTLINE, c: '#2aa198', s: '#f2c29b', e: OUTLINE, j: '#3b5bdb',
      b: '#b5651d', p: '#2d2a4a', w: '#f1ecff',
    },
  },
  carmen: {
    rows: CARMEN_ROWS,
    palette: {
      o: OUTLINE, g: '#c9c4d6', s: '#e8b48a', e: OUTLINE, d: '#b91c1c',
      a: '#f1ecff', w: '#3b2a20',
    },
  },
  paco: villager(VILLAGER_ROWS, { h: '#2b2b2b', t: '#1c7ed6', a: '#f1ecff', p: '#2d2a4a' }),
  lucia: villager(HAT_ROWS, { c: '#f1ecff', t: '#f2e7c6', a: '#d4a373', p: '#5c3d2e', s: '#c68e67' }),
  ines: villager(VILLAGER_ROWS, { h: '#7f3b1e', t: '#2f9e44', a: '#ff6b9d', p: '#2d2a4a' }),
  ramon: villager(HAT_ROWS, { c: '#5c3d2e', t: '#8b86a8', a: '#6b6490', p: '#3b3560', s: '#d9a07a' }),
  pablo: villager(VILLAGER_ROWS, { h: '#3b2a20', t: '#e03131', a: '#ffd43b', p: '#1c7ed6' }),
  sergio: villager(VILLAGER_ROWS, { h: '#111111', t: '#2d2a4a', a: '#b5651d', p: '#111111', s: '#b07a52' }),
  marta: villager(VILLAGER_ROWS, { h: '#c92a2a', t: '#f59f00', a: '#fff3bf', p: '#5c3d2e' }),
  churrero: villager(HAT_ROWS, { c: '#c2255c', t: '#f1ecff', a: '#c2255c', p: '#2d2a4a', s: '#d9a07a' }),
  amina: villager(VILLAGER_ROWS, { h: '#2b1a12', t: '#c2255c', a: '#ffd43b', p: '#3b2a20', s: '#c68e67' }),
  fermin: villager(HAT_ROWS, { c: '#3b3560', t: '#6b4220', a: '#8a5a2b', p: '#2d2a4a', s: '#e0a98a' }),
  traveller: villager(VILLAGER_ROWS, { h: '#ffd43b', t: '#7048e8', a: '#b18cff', p: '#3b5bdb', s: '#f2c29b' }),
  cat: { rows: CAT_ROWS, palette: { o: OUTLINE, c: '#f59f00', e: '#2f9e44', p: '#ff6b9d' } },
  duende_true: {
    rows: DUENDE_ROWS,
    palette: {
      o: OUTLINE, t: '#d9480f', h: '#ffc247', s: '#e8b48a', e: OUTLINE,
      b: '#f1ecff', g: '#2f9e44', l: '#5c3d2e', w: '#5c3d2e',
    },
  },
  duende_corrupt: {
    rows: DUENDE_ROWS,
    palette: {
      o: '#05030c', t: '#3b3560', h: '#ff5252', s: '#8b86a8', e: '#ff5252',
      b: '#2a2350', g: '#4a4370', l: '#ff5252', w: '#2a2350',
    },
  },
};
