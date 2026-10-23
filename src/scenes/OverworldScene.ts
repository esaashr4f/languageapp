import Phaser from 'phaser';
import { sfx } from '../audio';
import {
  CARMEN_AFTER_ALL, CARMEN_AFTER_ORDER, CARMEN_GREETING, CARMEN_IDLE, CARMEN_MISS, CARMEN_ORDER, CARMEN_REWARD,
  CARMEN_SERVED, CARMEN_SERVED_FAINT, CARMEN_SERVED_NATIVE, DUENDE_BATTLE, DUENDE_RESTORED_IDLE, NEED_WORDS, SLOT_EXAMPLES, SLOTS,
} from '../content/spain/act1';
import {
  AFTER_BATTLE, ARRIVAL, ARRIVE_AT, BENCHES, DEAD_STALL, FOUNTAIN, GLITCH_ZONE, LAMPS, MAP_COLS, MAP_ROWS,
  MARKET_NPCS, PLANTS, STALLS, type MarketNpc,
} from '../content/spain/market';
import { sendChat } from '../ai/client';
import type { ChatRequest, LimitReason, QuotaStatus } from '../ai/schema';
import { CHARACTERS } from '../content/characters';
import type { Line } from '../content/types';
import { fillSlots, grade } from '../engine/grader';
import { tierById, tierRank, type TierId } from '../engine/tiers';
import { cefr, save, state } from '../state';
import { ui, type Dir } from '../ui/panel';

const TILE = 16;

/**
 * Tile codes: W wall, A awning, C counter, F the corrupted fruit stall, G glitch zone,
 * O fountain, B bench, L lamp, P plant, E entrance, . floor
 */
function buildMap(): { grid: string[][]; textures: string[][] } {
  const grid: string[][] = Array.from({ length: MAP_ROWS }, (_, y) =>
    Array.from({ length: MAP_COLS }, (_, x) =>
      x === 0 || y === 0 || x === MAP_COLS - 1 || y === MAP_ROWS - 1 ? 'W' : '.',
    ),
  );
  const textures: string[][] = grid.map((row) => row.map((ch) => (ch === 'W' ? 't_wall' : 't_floor')));
  const put = (x: number, y: number, ch: string, tex: string) => {
    grid[y][x] = ch;
    textures[y][x] = tex;
  };

  for (let y = GLITCH_ZONE.y; y < GLITCH_ZONE.y + GLITCH_ZONE.h; y++) {
    for (let x = GLITCH_ZONE.x; x < GLITCH_ZONE.x + GLITCH_ZONE.w; x++) put(x, y, 'G', 't_glitch0');
  }
  for (let i = 0; i < DEAD_STALL.w; i++) put(DEAD_STALL.x + i, DEAD_STALL.y, 'F', 't_counter_dead');
  for (const s of STALLS) {
    for (let i = 0; i < 4; i++) {
      put(s.x + i, s.y, 'A', `t_awning_${s.type}`);
      put(s.x + i, s.y + 1, 'C', `t_counter_${s.type}`);
    }
  }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) put(FOUNTAIN.x + i, FOUNTAIN.y + j, 'O', 't_floor');
  BENCHES.forEach(({ x, y }) => put(x, y, 'B', 't_bench'));
  LAMPS.forEach(({ x, y }) => put(x, y, 'L', 't_lamp'));
  PLANTS.forEach(({ x, y }) => put(x, y, 'P', 't_plant'));
  const mid = Math.floor(MAP_COLS / 2) - 1;
  put(mid, MAP_ROWS - 1, 'E', 't_entrance');
  put(mid + 1, MAP_ROWS - 1, 'E', 't_entrance');
  return { grid, textures };
}

const SOLID = new Set(['W', 'A', 'C', 'F', 'O', 'B', 'L', 'P', 'E']);
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

interface Npc {
  id: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Image;
  def?: MarketNpc;
  talkIndex: number;
  busy: boolean;
}

export class OverworldScene extends Phaser.Scene {
  private map!: string[][];
  private player!: Phaser.GameObjects.Image;
  private pos = { ...ARRIVE_AT };
  private facing: Dir = 'up';
  private moving = false;
  private scripting = false;
  private npcs: Npc[] = [];
  private glitchTiles: Phaser.GameObjects.Image[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private from = '';

  constructor() {
    super('Overworld');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? '';
    this.pos = this.from === 'battle' ? { ...AFTER_BATTLE } : { ...ARRIVE_AT };
    this.facing = this.from === 'battle' ? 'down' : 'up';
    this.npcs = [];
    this.glitchTiles = [];
    this.moving = false;
    this.scripting = false;
  }

  create(): void {
    const { grid, textures } = buildMap();
    this.map = grid;
    this.drawMap(textures);

    this.addNpc('carmen', 'carmen', 9, 9);
    this.addNpc('duende', state.flags.duendeRestored ? 'duende_true' : 'duende_corrupt', 19, 2);
    for (const def of MARKET_NPCS) this.addNpc(def.id, def.sprite, def.x, def.y, def);

    this.player = this.add.image(0, 0, 'player').setOrigin(0.5, 1);
    this.placePlayer();
    this.cameras.main
      .setBounds(0, 0, MAP_COLS * TILE, MAP_ROWS * TILE)
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
    this.time.addEvent({ delay: 900, loop: true, callback: () => this.wander() });
    this.cameras.main.fadeIn(500, 0, 0, 0);

    if (!state.flags.arrived) void this.script(() => this.arrive());
    else if (state.flags.duendeRestored && !state.flags.gotPaella) {
      void this.script(() => ui.say([{ who: 'omni', text: 'Carmen will want to hear about this. Go talk to her!' }]));
    } else this.idle();
  }

  // ---------------------------------------------------------------------------
  // Drawing

  private drawMap(textures: string[][]): void {
    const restored = !!state.flags.duendeRestored;
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        const ch = this.map[y][x];
        let key = textures[y][x];
        if (ch === 'G' && restored) key = 't_floor';
        if (ch === 'F' && restored) key = 't_counter_fruit';
        const img = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key);
        if (ch === 'G' && !restored) this.glitchTiles.push(img);
      }
    }
    this.add.image((FOUNTAIN.x + 1) * TILE, (FOUNTAIN.y + 1) * TILE, 't_fountain').setDepth(FOUNTAIN.y + 1);

    // Hand-painted signs above each stall, in Spanish.
    for (const s of STALLS) {
      this.add
        .text((s.x + 2) * TILE, s.y * TILE + 1, s.sign, {
          fontFamily: 'VT323', fontSize: '10px', color: '#f1ecff', backgroundColor: '#1a1026', padding: { x: 2, y: 0 },
        })
        .setOrigin(0.5, 1)
        .setResolution(2)
        .setDepth(s.y + 0.6);
    }
  }

  private addNpc(id: string, texture: string, x: number, y: number, def?: MarketNpc): void {
    const sprite = this.add.image(x * TILE + TILE / 2, (y + 1) * TILE, texture).setOrigin(0.5, 1).setDepth(y);
    this.tweens.add({ targets: sprite, scaleY: 0.96, duration: 500 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Stepped' });
    this.npcs.push({ id, x, y, sprite, def, talkIndex: 0, busy: false });
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

  private occupied(x: number, y: number): boolean {
    return SOLID.has(this.tileAt(x, y)) || this.npcs.some((n) => n.x === x && n.y === y);
  }

  private step(dir: Dir): void {
    this.facing = dir;
    if (dir === 'left') this.player.setFlipX(true);
    if (dir === 'right') this.player.setFlipX(false);
    const [dx, dy] = DELTA[dir];
    const nx = this.pos.x + dx;
    const ny = this.pos.y + dy;
    const tile = this.tileAt(nx, ny);
    if (this.occupied(nx, ny)) return;

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

  /** Strollers take a step now and then, staying in their area and out of everyone's way. */
  private wander(): void {
    if (this.scripting || ui.busy) return;
    for (const npc of this.npcs) {
      const area = npc.def?.wander;
      if (!area || npc.busy || Math.random() < 0.5) continue;
      const dirs = Object.values(DELTA);
      const [dx, dy] = dirs[(Math.random() * dirs.length) | 0];
      const nx = npc.x + dx;
      const ny = npc.y + dy;
      const inArea = nx >= area.x && nx < area.x + area.w && ny >= area.y && ny < area.y + area.h;
      const onPlayer = nx === this.pos.x && ny === this.pos.y;
      if (!inArea || onPlayer || this.tileAt(nx, ny) === 'G' || this.occupied(nx, ny)) continue;
      npc.x = nx;
      npc.y = ny;
      npc.busy = true;
      if (dx) npc.sprite.setFlipX(dx < 0);
      this.tweens.add({
        targets: npc.sprite,
        x: nx * TILE + TILE / 2,
        y: (ny + 1) * TILE,
        duration: 260,
        onComplete: () => {
          npc.sprite.setDepth(ny);
          npc.busy = false;
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Interaction and scripts

  private idle(): void {
    const touch = matchMedia('(pointer: coarse)').matches;
    ui.explore(
      state.flags.duendeRestored
        ? 'The market is coming back to life. Chat with the stallholders!'
        : state.flags.metCarmen
          ? "Head north to ANTI's static by the fruit stall. Or chat with people first."
          : touch
            ? 'Talk to Carmen at the fruit stall. D-pad to move, A to talk.'
            : 'Talk to Carmen at the fruit stall. Arrows/WASD to move, SPACE to talk.',
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
    // Face the player while talking.
    if (dx) npc.sprite.setFlipX(dx > 0);
    if (npc.id === 'carmen') {
      void this.script(async () => {
        const canChat = state.flags.metCarmen && !(state.flags.duendeRestored && !state.flags.gotPaella);
        await this.talkToCarmen();
        if (canChat) await this.offerChat('carmen', 'CARMEN');
      });
    } else if (npc.id === 'duende') {
      if (state.flags.duendeRestored) {
        void this.script(async () => {
          await ui.say(DUENDE_RESTORED_IDLE);
          await this.offerChat('duende', 'DUENDE');
        });
      }
    } else if (npc.def) {
      const talk = npc.def.talks[npc.talkIndex % npc.def.talks.length];
      npc.talkIndex++;
      const def = npc.def;
      void this.script(async () => {
        await ui.say(talk.map((line) => (line.who === 'npc' ? { ...line, name: def.name } : line)));
        if (CHARACTERS[def.id]) await this.offerChat(def.id, def.name);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Free conversations (AI): talk about anything, for as long as the plan allows.

  private quota: QuotaStatus | null = null;
  private mockNoted = false;

  private meter(): string | undefined {
    if (!this.quota) return undefined;
    return `💬 ${this.quota.remaining} left ${this.quota.plan === 'free' ? 'today' : 'this month'}`;
  }

  private async offerChat(npcId: string, name: string): Promise<void> {
    const choice = await ui.choose('', [
      { id: 'chat', label: '💬 CHAT', note: 'Talk about anything, in Spanish' },
      { id: 'bye', label: '👋 BYE' },
    ]);
    if (choice === 'chat') await this.converse(npcId, name);
  }

  private limitLines(reason: LimitReason | 'offline', name: string): Line[] {
    const resets = this.quota ? new Date(this.quota.resetsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) : 'soon';
    const goodbye: Line = { who: 'npc', name, text: '¡Bueno, tengo que seguir trabajando! ¡Hasta luego!', gloss: 'Well, I have to get back to work! See you later!' };
    switch (reason) {
      case 'sign_in_required':
        return [{ who: 'omni', text: 'To keep long conversations going I need a secure line. Sign in from the title menu and I can open one.' }];
      case 'conversation_limit':
        return [goodbye, { who: 'omni', text: "Time to move on. ANTI's static creeps closer whenever we stay in one place too long." }];
      case 'free_limit':
        return [
          goodbye,
          { who: 'omni', text: "We need to go. Long conversations make my signal easy for ANTI to trace, and I've used up today's safe signal." },
          { who: 'omni', text: 'It recharges tomorrow. (Free plan: a few conversations a day. Zaban+ lets us talk for much longer.)' },
        ];
      case 'plan_limit':
        return [
          goodbye,
          { who: 'omni', text: `That's this month's signal used up. It recharges on ${resets}. If we need more before then, we can top up with conversation credits.` },
        ];
      case 'offline':
        return [{ who: 'omni', text: "I can't reach the network right now. Let's try again in a bit." }];
    }
  }

  private async converse(npcId: string, name: string): Promise<void> {
    const opener = CHARACTERS[npcId].chatOpener ?? { text: '¿Qué tal? ¿De qué quieres hablar?', gloss: 'How are you? What do you want to talk about?' };
    let line = opener.text;
    let gloss = opener.gloss;
    let note: string | null = 'Chat about anything you like. Tap IDEAS if you get stuck, BYE to leave.';
    let ideas = CHARACTERS[npcId].knows.slice(0, 3).map((k) => `Ask about ${k.toLowerCase()}`);
    const history: ChatRequest['history'] = [{ speaker: 'npc', text: line }];

    for (;;) {
      const step = await ui.talk({
        who: 'npc', name, line, gloss, note, meter: this.meter(),
        actions: [{ id: 'ideas', label: '💡 IDEAS' }, { id: 'bye', label: '👋 BYE' }],
      });
      note = null;
      if ('action' in step) {
        if (step.action === 'bye') {
          await ui.say([{ who: 'npc', name, text: '¡Hasta luego! Vuelve cuando quieras.', gloss: 'See you later! Come back any time.' }]);
          return;
        }
        note = `Ideas: ${ideas.join(' · ')}`;
        continue;
      }

      ui.waiting('npc', name, '');
      const out = await sendChat({ country: 'Spain', npcId, playerName: state.name, playerLevel: cefr(), history, reply: step.text });
      if ('quota' in out && out.quota) this.quota = out.quota;
      if (!out.ok) {
        await ui.say(this.limitLines(out.reason, name));
        return;
      }

      const r = out.result;
      history.push({ speaker: 'player', text: step.text }, { speaker: 'npc', text: r.npc.line });
      const tier = r.rating.level === 'NO_SIGNAL' ? null : tierById(r.rating.level.toLowerCase() as TierId);
      state.xp += tier ? Math.round(tier.points / 5) : 0;
      save();
      ui.updateHud();
      ui.toast(tier ? `${tier.label}: ${tier.blurb}` : 'No signal: try it in Spanish');
      if (tier) sfx.tier(tierRank(tier.id));
      else sfx.miss();

      line = r.npc.line;
      gloss = r.npc.gloss;
      if (r.ideas.length) ideas = r.ideas;
      note = r.omni_note ?? (r.rating.correction ? `Try: "${r.rating.correction}"` : null);
      if (out.mock && !this.mockNoted) {
        note = `${note ? `${note} ` : ''}(Offline demo: replies are canned until the AI is connected.)`;
        this.mockNoted = true;
      }
      if (r.ended) {
        await ui.say([{ who: 'npc', name, text: line, gloss }]);
        return;
      }
    }
  }

  private async arrive(): Promise<void> {
    await ui.say(ARRIVAL);
    state.flags.arrived = true;
    save();
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
      const answer = await ui.ask({ who: 'carmen', line: CARMEN_ORDER.line, gloss: CARMEN_ORDER.gloss, coach: CARMEN_ORDER.goal });
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
        detail: `${tierById(result.tier).blurb}. Your first order in Spanish!`,
        correction: result.matched?.fix ? { text: fillSlots(result.matched.fix, examples), why: result.matched.why } : undefined,
        better: result.better.map((a) => fillSlots(a.text, examples)),
      });
      await ui.say(
        result.tier === 'faint'
          ? CARMEN_SERVED_FAINT
          : tierRank(result.tier) >= tierRank('natural')
            ? CARMEN_SERVED_NATIVE
            : CARMEN_SERVED,
      );
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
