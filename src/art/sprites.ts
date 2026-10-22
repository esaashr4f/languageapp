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
