import Phaser from 'phaser';
import { SPRITES } from './sprites';

/** Stall types in the market: awning stripes and the goods on the counter. */
export const STALL_STYLES: Record<string, { stripes: [string, string]; goods: string[] }> = {
  fruit: { stripes: ['#d9480f', '#f1ecff'], goods: ['#ff9f43', '#7cc243', '#e03131', '#ffd43b'] },
  fish: { stripes: ['#1c7ed6', '#f1ecff'], goods: ['#a5d8ff', '#ced4da', '#74c0fc', '#f1ecff'] },
  cheese: { stripes: ['#f59f00', '#fff3bf'], goods: ['#ffd43b', '#fff3bf', '#a0522d', '#c92a2a'] },
  churros: { stripes: ['#c2255c', '#f1ecff'], goods: ['#d4a373', '#7f4f24', '#e9c46a'] },
  bakery: { stripes: ['#8a5a2b', '#f2e7c6'], goods: ['#e9c46a', '#d4a373', '#a0522d'] },
  flowers: { stripes: ['#2f9e44', '#f1ecff'], goods: ['#ff6b9d', '#e03131', '#ffd43b', '#b18cff'] },
  spices: { stripes: ['#7048e8', '#f1ecff'], goods: ['#e03131', '#f59f00', '#ffd43b', '#2b8a3e'] },
  pottery: { stripes: ['#0b7285', '#f1ecff'], goods: ['#1c7ed6', '#f1ecff', '#c2410c'] },
};

type Ctx = CanvasRenderingContext2D;

function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  draw(tex.getContext());
  tex.refresh();
}

function px(ctx: Ctx, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Deterministic noise so tiles look the same on every load. */
function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawFloor(ctx: Ctx, seed = 1): void {
  rect(ctx, 0, 0, 16, 16, '#d6b48c');
  const r = rng(seed);
  for (let i = 0; i < 14; i++) px(ctx, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? '#c49a6c' : '#e6c9a0');
  rect(ctx, 0, 15, 16, 1, '#c9a47c');
  rect(ctx, 15, 0, 1, 16, '#c9a47c');
}

function drawCounter(ctx: Ctx, fruit: string[], wood = ['#8a5a2b', '#b07a3f', '#6b4220']): void {
  rect(ctx, 0, 0, 16, 16, wood[0]);
  rect(ctx, 0, 0, 16, 4, wood[1]);
  rect(ctx, 5, 4, 1, 12, wood[2]);
  rect(ctx, 10, 4, 1, 12, wood[2]);
  const r = rng(7);
  for (let i = 0; i < 6; i++) {
    const x = 1 + ((r() * 13) | 0);
    rect(ctx, x, 0, 2, 2, fruit[i % fruit.length]);
  }
}

export function makeSprites(scene: Phaser.Scene): void {
  for (const [key, def] of Object.entries(SPRITES)) {
    canvasTexture(scene, key, 16, 16, (ctx) => {
      def.rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
          const color = def.palette[ch];
          if (color) px(ctx, x, y, color);
        });
      });
    });
  }
}

export function makeTiles(scene: Phaser.Scene): void {
  canvasTexture(scene, 't_floor', 16, 16, (ctx) => drawFloor(ctx));

  canvasTexture(scene, 't_wall', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#7a4b3a');
    rect(ctx, 0, 0, 16, 1, '#9a634d');
    for (const y of [3, 7, 11, 15]) rect(ctx, 0, y, 16, 1, '#5c3529');
    [0, 1, 2, 3].forEach((row) => rect(ctx, row % 2 ? 12 : 4, row * 4, 1, 3, '#5c3529'));
  });

  for (const [type, style] of Object.entries(STALL_STYLES)) {
    canvasTexture(scene, `t_awning_${type}`, 16, 16, (ctx) => {
      drawFloor(ctx, 3);
      for (let x = 0; x < 16; x++) {
        const color = Math.floor(x / 4) % 2 ? style.stripes[1] : style.stripes[0];
        rect(ctx, x, 0, 1, 12, color);
        if (x % 4 === 1 || x % 4 === 2) rect(ctx, x, 12, 1, 2, color);
      }
      rect(ctx, 0, 0, 16, 1, '#1a1026');
    });
    canvasTexture(scene, `t_counter_${type}`, 16, 16, (ctx) => drawCounter(ctx, style.goods));
  }
  canvasTexture(scene, 't_counter_dead', 16, 16, (ctx) =>
    drawCounter(ctx, ['#2a2350', '#3b3560'], ['#4a4370', '#5b5480', '#3b3560']),
  );

  canvasTexture(scene, 't_plant', 16, 16, (ctx) => {
    drawFloor(ctx, 5);
    rect(ctx, 5, 10, 6, 6, '#b5651d');
    rect(ctx, 4, 10, 8, 2, '#8a4513');
    rect(ctx, 6, 3, 4, 7, '#2f9e44');
    rect(ctx, 4, 5, 3, 4, '#51cf66');
    rect(ctx, 9, 4, 3, 4, '#51cf66');
  });

  canvasTexture(scene, 't_entrance', 16, 16, (ctx) => {
    rect(ctx, 0, 0, 16, 16, '#a8835c');
    for (const y of [4, 9, 14]) rect(ctx, 0, y, 16, 1, '#8f6c47');
  });

  // Three frames of ANTI static, cycled at random for the glitch zone.
  const glitchColors = ['#ff5252', '#59c8ff', '#7cf5b0', '#3b3560', '#f1ecff'];
  for (let f = 0; f < 3; f++) {
    canvasTexture(scene, `t_glitch${f}`, 16, 16, (ctx) => {
      rect(ctx, 0, 0, 16, 16, '#140d30');
      for (let y = 1; y < 16; y += 2) rect(ctx, 0, y, 16, 1, '#1a1240');
      const r = rng(100 + f);
      rect(ctx, 0, (r() * 16) | 0, 16, 1, '#3b3560');
      for (let i = 0; i < 22; i++) px(ctx, (r() * 16) | 0, (r() * 16) | 0, glitchColors[(r() * glitchColors.length) | 0]);
    });
  }

  canvasTexture(scene, 't_px', 2, 2, (ctx) => rect(ctx, 0, 0, 2, 2, '#ffffff'));

  // Fountain: one 32x32 image covering a 2x2 block of tiles.
  canvasTexture(scene, 't_fountain', 32, 32, (ctx) => {
    for (let y = 0; y < 32; y += 16) for (let x = 0; x < 32; x += 16) {
      ctx.save();
      ctx.translate(x, y);
      drawFloor(ctx, 9 + x + y);
      ctx.restore();
    }
    rect(ctx, 2, 4, 28, 26, '#8b86a8');
    rect(ctx, 4, 6, 24, 22, '#c9c4d6');
    rect(ctx, 6, 8, 20, 18, '#1c7ed6');
    rect(ctx, 8, 10, 4, 2, '#a5d8ff');
    rect(ctx, 18, 18, 5, 2, '#a5d8ff');
    rect(ctx, 14, 2, 4, 14, '#c9c4d6');
    rect(ctx, 13, 0, 6, 3, '#a5d8ff');
  });

  canvasTexture(scene, 't_bench', 16, 16, (ctx) => {
    drawFloor(ctx, 11);
    rect(ctx, 1, 6, 14, 3, '#8a5a2b');
    rect(ctx, 1, 10, 14, 3, '#b07a3f');
    rect(ctx, 2, 13, 2, 3, '#3b2a20');
    rect(ctx, 12, 13, 2, 3, '#3b2a20');
  });

  canvasTexture(scene, 't_lamp', 16, 16, (ctx) => {
    drawFloor(ctx, 13);
    rect(ctx, 7, 3, 2, 13, '#2d2a4a');
    rect(ctx, 5, 0, 6, 4, '#2d2a4a');
    rect(ctx, 6, 1, 4, 2, '#ffd43b');
    rect(ctx, 5, 14, 6, 2, '#2d2a4a');
  });

}
