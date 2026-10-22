import Phaser from 'phaser';
import { sfx } from '../audio';
import {
  CARMEN_AFTER_ALL, CARMEN_AFTER_ORDER, CARMEN_GREETING, CARMEN_IDLE, CARMEN_MISS, CARMEN_ORDER, CARMEN_REWARD,
  CARMEN_SERVED, CARMEN_SERVED_NATIVE, DUENDE_BATTLE, DUENDE_RESTORED_IDLE, NEED_WORDS, SLOT_EXAMPLES, SLOTS,
} from '../content/spain/act1';
import { AFTER_NAME, AFTER_STORY, ASK_NAME, DARK_VOICE, PHONE_BUZZ, WAKE_UP } from '../content/intro';
import { fillSlots, grade } from '../engine/grader';
import { tierRank } from '../engine/tiers';
import { save, state } from '../state';
import { ui, type Dir } from '../ui/panel';

const TILE = 16;
const COLS = 30;
const ROWS = 17;
const START = { x: 14, y: 14 };
const AFTER_BATTLE = { x: 15, y: 6 };

/**
 * W wall, A awning, C counter, F fruit stall (in the glitch zone), G glitch zone,
 * P plant, E entrance, . floor
 */
function buildMap(): string[][] {
  const grid: string[][] = Array.from({ length: ROWS }, (_, y) =>
    Array.from({ length: COLS }, (_, x) => (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 ? 'W' : '.')),
  );
  const fill = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) grid[j][i] = ch;
  };
  const stall = (x: number, y: number) => {
    fill(x, y, 4, 1, 'A');
    fill(x, y + 1, 4, 1, 'C');
  };
  fill(13, 1, 6, 4, 'G');
  fill(15, 3, 2, 1, 'F');
  [[5, 3], [22, 3], [8, 7], [19, 7], [5, 11], [19, 11]].forEach(([x, y]) => stall(x, y));
  [[26, 5], [3, 6], [3, 13], [26, 13]].forEach(([x, y]) => (grid[y][x] = 'P'));
  fill(14, 16, 2, 1, 'E');
  return grid;
}

const SOLID = new Set(['W', 'A', 'C', 'F', 'P', 'E']);
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

interface Npc {
  id: 'carmen' | 'duende';
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Image;
}

export class OverworldScene extends Phaser.Scene {
  private map!: string[][];
  private player!: Phaser.GameObjects.Image;
  private pos = { ...START };
  private facing: Dir = 'up';
  private moving = false;
  private scripting = false;
  private npcs: Npc[] = [];
  private glitchTiles: Phaser.GameObjects.Image[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor() {
    super('Overworld');
  }

  init(data: { from?: string }): void {
    this.pos = data.from === 'battle' ? { ...AFTER_BATTLE } : { ...START };
    this.facing = data.from === 'battle' ? 'down' : 'up';
    this.npcs = [];
    this.glitchTiles = [];
    this.moving = false;
    this.scripting = false;
  }

  create(): void {
    this.map = buildMap();
    this.drawMap();

    this.addNpc('carmen', 9, 9);
    this.addNpc('duende', 15, 2);

    this.player = this.add.image(0, 0, 'player').setOrigin(0.5, 1);
    this.placePlayer();
    this.cameras.main
      .setBounds(0, 0, COLS * TILE, ROWS * TILE)
      .setZoom(2)
      .setRoundPixels(true)
      .startFollow(this.player, true, 0.25, 0.25, 0, TILE / 2);

    // No key capture, so typing spaces in the answer box still works.
    const kb = this.input.keyboard!;
    kb.clearCaptures();
    this.keys = kb.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER,Z', false) as Record<string, Phaser.Input.Keyboard.Key>;
    kb.on('keydown', (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'KeyZ'].includes(e.code)) this.interact();
    });
    ui.onA = () => this.interact();
    ui.dpadDir = null;

    this.time.addEvent({ delay: 120, loop: true, callback: () => this.animateGlitch() });

    if (!state.flags.prologue) void this.script(() => this.intro());
    else if (state.flags.duendeRestored && !state.flags.gotPaella) {
      void this.script(() => ui.say([{ who: 'omni', text: 'Carmen will want to hear about this. Go talk to her!' }]));
    } else this.idle();
  }

  // ---------------------------------------------------------------------------
  // Drawing

  private drawMap(): void {
    const restored = !!state.flags.duendeRestored;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const ch = this.map[y][x];
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        const key = {
          W: 't_wall', A: 't_awning', C: 't_counter', P: 't_plant', E: 't_entrance', '.': 't_floor',
          F: restored ? 't_counter' : 't_counter_dead', G: restored ? 't_floor' : 't_glitch0',
        }[ch]!;
        const img = this.add.image(cx, cy, key);
        if (ch === 'G' && !restored) this.glitchTiles.push(img);
      }
    }
  }

  private addNpc(id: Npc['id'], x: number, y: number): void {
    const key = id === 'duende' ? (state.flags.duendeRestored ? 'duende_true' : 'duende_corrupt') : id;
    const sprite = this.add.image(x * TILE + TILE / 2, (y + 1) * TILE, key).setOrigin(0.5, 1).setDepth(y);
    this.tweens.add({ targets: sprite, y: sprite.y - 1, duration: 500, yoyo: true, repeat: -1, ease: 'Stepped' });
    this.npcs.push({ id, x, y, sprite });
  }

  private placePlayer(): void {
    this.player.setPosition(this.pos.x * TILE + TILE / 2, (this.pos.y + 1) * TILE).setDepth(this.pos.y + 0.5);
  }

  private animateGlitch(): void {
    for (const img of this.glitchTiles) {
      if (Math.random() < 0.5) img.setTexture(`t_glitch${(Math.random() * 3) | 0}`);
    }
    const duende = this.npcs.find((n) => n.id === 'duende');
    if (duende && !state.flags.duendeRestored) {
      duende.sprite.x = duende.x * TILE + TILE / 2 + (Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0);
    }
  }

  // ---------------------------------------------------------------------------
  // Movement

  update(): void {
    if (this.moving || this.scripting || ui.busy) return;
    const k = this.keys;
    const dir: Dir | null =
      k.UP.isDown || k.W.isDown ? 'up'
      : k.DOWN.isDown || k.S.isDown ? 'down'
      : k.LEFT.isDown || k.A.isDown ? 'left'
      : k.RIGHT.isDown || k.D.isDown ? 'right'
      : ui.dpadDir;
    if (dir) this.step(dir);
  }

  private tileAt(x: number, y: number): string {
    return this.map[y]?.[x] ?? 'W';
  }

  private step(dir: Dir): void {
    this.facing = dir;
    if (dir === 'left') this.player.setFlipX(true);
    if (dir === 'right') this.player.setFlipX(false);
    const [dx, dy] = DELTA[dir];
    const nx = this.pos.x + dx;
    const ny = this.pos.y + dy;
    const tile = this.tileAt(nx, ny);
    if (SOLID.has(tile) || this.npcs.some((n) => n.x === nx && n.y === ny)) return;

    if (tile === 'G' && !state.flags.duendeRestored && !state.flags.metCarmen) {
      void this.script(() => ui.say(NEED_WORDS));
      return;
    }

    this.moving = true;
    this.pos = { x: nx, y: ny };
    this.tweens.add({
      targets: this.player,
      x: nx * TILE + TILE / 2,
      y: (ny + 1) * TILE,
      duration: 150,
      onComplete: () => {
        this.player.setDepth(ny + 0.5);
        this.moving = false;
        if (tile === 'G' && !state.flags.duendeRestored) void this.script(() => this.startBattle());
      },
    });
    this.tweens.add({ targets: this.player, scaleY: 0.92, duration: 75, yoyo: true });
  }

  // ---------------------------------------------------------------------------
  // Interaction and scripts

  private idle(): void {
    ui.explore(
      state.flags.duendeRestored
        ? 'The market is coming back to life.'
        : state.flags.metCarmen
          ? 'Head north to the static at the fruit stall.'
          : matchMedia('(pointer: coarse)').matches
            ? 'Find someone to talk to. D-pad to move, A to talk.'
            : 'Find someone to talk to. Arrows/WASD to move, SPACE to talk.',
    );
  }

  private async script(run: () => Promise<void>): Promise<void> {
    if (this.scripting) return;
    this.scripting = true;
    ui.dpadDir = null;
    try {
      await run();
    } finally {
      this.scripting = false;
      if (this.scene.isActive()) this.idle();
    }
  }

  private interact(): void {
    if (this.scripting || this.moving || ui.busy || performance.now() - ui.idleSince < 250) return;
    const [dx, dy] = DELTA[this.facing];
    const npc = this.npcs.find((n) => n.x === this.pos.x + dx && n.y === this.pos.y + dy);
    if (!npc) return;
    if (npc.id === 'carmen') void this.script(() => this.talkToCarmen());
    else if (state.flags.duendeRestored) void this.script(() => ui.say(DUENDE_RESTORED_IDLE));
  }

  // ---------------------------------------------------------------------------
  // Opening: a voice in the dark, waking up, OMNI calling from your pocket.

  private cameraFade(kind: 'in' | 'out', ms: number): Promise<void> {
    const cam = this.cameras.main;
    return new Promise((resolve) => {
      cam.once(kind === 'in' ? 'camerafadeincomplete' : 'camerafadeoutcomplete', () => resolve());
      if (kind === 'in') cam.fadeIn(ms, 0, 0, 0);
      else cam.fadeOut(ms, 0, 0, 0);
    });
  }

  private playStory(): Promise<void> {
    return new Promise((resolve) => {
      this.game.events.once('story-done', () => {
        this.scene.stop('Story');
        resolve();
      });
      this.scene.launch('Story');
    });
  }

  private async intro(): Promise<void> {
    const cam = this.cameras.main;
    cam.fadeOut(0, 0, 0, 0);
    this.player.setAngle(-90).setOrigin(0.5, 0.5).setY(this.player.y - 6);
    await ui.say(DARK_VOICE);

    // Eyes opening: blink, blink, then awake.
    await this.cameraFade('in', 700);
    await this.cameraFade('out', 200);
    await this.cameraFade('in', 1100);
    await ui.say(WAKE_UP);

    // Get up.
    sfx.move();
    await new Promise<void>((resolve) =>
      this.tweens.add({
        targets: this.player,
        angle: 0,
        y: this.player.y - 4,
        duration: 260,
        ease: 'Back.out',
        onComplete: () => {
          this.player.setOrigin(0.5, 1);
          this.placePlayer();
          resolve();
        },
      }),
    );

    sfx.buzz();
    this.tweens.add({ targets: this.player, x: this.player.x + 1, duration: 40, yoyo: true, repeat: 5 });
    await ui.say(PHONE_BUZZ);

    await this.playStory();
    await this.cameraFade('in', 600);
    await ui.say(AFTER_STORY);

    const name = await ui.ask({ who: 'omni', line: ASK_NAME, placeholder: 'Your name', accents: false });
    state.name = (name ?? 'Alex').slice(0, 16);
    state.flags.prologue = true;
    save();
    await ui.say(AFTER_NAME(state.name));
  }

  private async talkToCarmen(): Promise<void> {
    if (state.flags.gotPaella) return ui.say(CARMEN_AFTER_ALL);
    if (state.flags.duendeRestored) {
      await ui.say(CARMEN_REWARD);
      state.items.paella += 1;
      state.flags.gotPaella = true;
      save();
      ui.updateHud();
      ui.toast('+1 🥘 Paella');
      return;
    }
    if (state.flags.metCarmen) return ui.say(CARMEN_IDLE);

    await ui.say(CARMEN_GREETING);
    for (;;) {
      const answer = await ui.ask({ who: 'carmen', line: CARMEN_ORDER.line, gloss: CARMEN_ORDER.gloss });
      const result = grade(CARMEN_ORDER, answer ?? '', SLOTS);
      const examples = SLOT_EXAMPLES(state.name);
      if (!result.tier) {
        sfx.miss();
        await ui.say(CARMEN_MISS);
        continue;
      }
      sfx.tier(tierRank(result.tier));
      state.xp += Math.round(tierRank(result.tier) * 5 + 10);
      await ui.result({
        tier: result.tier,
        headline: `"${answer}"`,
        detail: 'Your first order in Spanish!',
        better: result.better.map((a) => fillSlots(a.text, examples)),
      });
      await ui.say(tierRank(result.tier) >= tierRank('native') ? CARMEN_SERVED_NATIVE : CARMEN_SERVED);
      break;
    }
    await ui.say(CARMEN_AFTER_ORDER);
    state.items.churros += 2;
    state.coins += 5;
    state.flags.metCarmen = true;
    save();
    ui.updateHud();
    ui.toast('+2 🥖 Churros');
  }

  private async startBattle(): Promise<void> {
    await ui.say([{ who: 'omni', text: "Static everywhere... That's the duende. Careful!" }]);
    this.cameras.main.flash(250, 255, 82, 82);
    sfx.glitch();
    this.scene.start('Battle', { battle: DUENDE_BATTLE.id });
  }
}
