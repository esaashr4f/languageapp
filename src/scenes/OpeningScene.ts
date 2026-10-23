import Phaser from 'phaser';
import { sfx } from '../audio';
import { AFTER_STORY, ASK_NAME, DARK_VOICE, MISSION, PHONE_BUZZ, SIT_UP, STRANGER, WAKE_UP } from '../content/intro';
import { save, state } from '../state';
import { ui } from '../ui/panel';

const W = 480;
const H = 272;
const FONT = 'VT323';

/**
 * Story mode opening: a voice in the dark; you open your eyes on an airport ceiling with a
 * departures board melting into ANTI; a stranger asks if you're okay in languages you can't
 * follow; you sit up at Gate 7 among hundreds of stranded people; OMNI calls.
 */
export class OpeningScene extends Phaser.Scene {
  private board: Phaser.GameObjects.Text[] = [];
  private stranger!: Phaser.GameObjects.Container;
  private phoneGlow!: Phaser.GameObjects.Arc;

  constructor() {
    super('Opening');
  }

  create(): void {
    this.board = [];
    this.drawCeiling();
    this.drawTerminal();
    this.cameras.main.setBounds(0, 0, W, H * 2).setScroll(0, 0);
    this.cameras.main.fadeOut(0, 0, 0, 0);
    void this.run();
  }

  private fade(kind: 'in' | 'out', ms: number): Promise<void> {
    const cam = this.cameras.main;
    return new Promise((resolve) => {
      cam.once(kind === 'in' ? 'camerafadeincomplete' : 'camerafadeoutcomplete', () => resolve());
      if (kind === 'in') cam.fadeIn(ms, 0, 0, 0);
      else cam.fadeOut(ms, 0, 0, 0);
    });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => this.tweens.add({ ...config, onComplete: () => resolve() }));
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

  private async run(): Promise<void> {
    await ui.say(DARK_VOICE);

    // Eyes opening on the ceiling: blink, blink, awake.
    await this.fade('in', 700);
    await this.fade('out', 200);
    await this.fade('in', 1200);
    await ui.say(WAKE_UP);
    this.scrambleBoard();

    // A stranger leans in from the side.
    await this.tween({ targets: this.stranger, x: 110, duration: 500, ease: 'Back.out' });
    await ui.say(STRANGER);
    await this.tween({ targets: this.stranger, x: -140, duration: 400, ease: 'Sine.in' });

    // Sit up: the view tilts down from the ceiling to the terminal.
    sfx.move();
    await this.tween({ targets: this.cameras.main, scrollY: H, duration: 1400, ease: 'Sine.inOut' });
    await ui.say(SIT_UP);
    sfx.glitch();

    sfx.buzz();
    this.cameras.main.shake(300, 0.003);
    this.tweens.add({ targets: this.phoneGlow, alpha: 0.9, scale: 1.4, duration: 400, yoyo: true, repeat: -1 });
    await ui.say(PHONE_BUZZ);

    await this.playStory();
    await this.fade('in', 600);
    await ui.say(AFTER_STORY);

    const name = await ui.ask({ who: 'omni', line: ASK_NAME, placeholder: 'Your name', accents: false });
    state.name = (name ?? 'Alex').trim().slice(0, 16) || 'Alex';
    state.flags.opening = true;
    save();
    ui.updateHud();
    await ui.say(MISSION(state.name));
    await this.fade('out', 400);
    this.scene.start('Departures');
  }

  // ---------------------------------------------------------------------------
  // Looking up: the ceiling, the lights, the board above you.

  private drawCeiling(): void {
    const g = this.add.graphics();
    g.fillStyle(0xc9cfdc, 1).fillRect(0, 0, W, H);
    g.lineStyle(1, 0xaeb5c6, 1);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);

    // Fluorescent tubes; one of them is dying.
    const tubes = [
      [40, 24],
      [320, 24],
      [40, 216],
      [320, 216],
    ].map(([x, y]) => {
      this.add.rectangle(x + 60, y + 6, 136, 22, 0xffffff, 0.35);
      return this.add.rectangle(x + 60, y + 6, 120, 8, 0xf6fbff);
    });
    const dying = tubes[3];
    this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => {
        const r = Math.random();
        dying.setAlpha(r < 0.25 ? 0.1 : 1);
        dying.setFillStyle(r < 0.06 ? 0xff5252 : 0xf6fbff);
      },
    });

    // The departures board, hanging right above you.
    g.fillStyle(0x3b3560, 1).fillRect(236, 52, 4, 26).fillRect(250, 52, 4, 26);
    g.fillStyle(0x111111, 1).fillRect(110, 78, 260, 116);
    g.lineStyle(3, 0x2a2350, 1).strokeRect(110, 78, 260, 116);
    const rows = ['DEPARTURES · SALIDAS', 'ZB101  MADRID    07:00', 'ZB202  TOKYO     08:17', 'ZB303  PARIS     09:34', 'ZB404  MÉXICO    10:51'];
    rows.forEach((row, i) => {
      this.board.push(
        this.add.text(122, 86 + i * 21, row, { fontFamily: FONT, fontSize: '18px', color: i === 0 ? '#ffc247' : '#ffd166' }),
      );
    });

    // A face leaning in from the left (off screen until the stranger speaks).
    // Just the head, cropped from a sprite, peering down at you.
    const face = this.add.image(0, 0, 'pax4').setCrop(0, 0, 16, 9).setScale(10).setOrigin(0.5, 0.2);
    this.stranger = this.add.container(-140, 200, [face]);

    // ANTI static now and then.
    const glitch = this.add.graphics().setDepth(10);
    this.time.addEvent({
      delay: 130,
      loop: true,
      callback: () => {
        glitch.clear();
        if (Math.random() > 0.1) return;
        for (let i = 0; i < 3; i++) {
          glitch.fillStyle(i % 2 ? 0xff5252 : 0x59c8ff, 0.35).fillRect(0, Math.random() * H * 2, W, 1 + Math.random() * 3);
        }
      },
    });
  }

  /** Every line of the board melts into ANTI, letter by letter. */
  private scrambleBoard(): void {
    sfx.glitch();
    const junk = '█▒░';
    this.board.forEach((line, i) => {
      const original = line.text;
      const target = i === 0 ? '▒▒▒ ANTI ▒▒▒' : 'ANTI ANTI ANTI ANTI';
      for (let step = 0; step <= 8; step++) {
        this.time.delayedCall(i * 140 + step * 90, () => {
          if (step === 8) {
            line.setText(target).setColor('#ff5252');
            return;
          }
          const mixed = [...original]
            .map((ch) => (Math.random() < step / 8 ? junk[(Math.random() * junk.length) | 0] : ch))
            .join('');
          line.setText(mixed);
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Sitting up: Gate 7, full of stranded people.

  private drawTerminal(): void {
    const y0 = H;
    const g = this.add.graphics();
    // Back wall and windows onto the runway.
    g.fillStyle(0x4a4370, 1).fillRect(0, y0, W, 130);
    const outside = this.add.graphics();
    outside.fillGradientStyle(0x3b7dd8, 0x3b7dd8, 0xa9d6f5, 0xa9d6f5, 1).fillRect(20, y0 + 26, W - 40, 70);
    outside.fillStyle(0x6b6490, 1).fillRect(20, y0 + 96, W - 40, 14);
    // Grounded planes on the runway outside.
    [[70, 84], [290, 86]].forEach(([x, y]) => {
      outside.fillStyle(0xf1ecff, 1).fillRect(x, y0 + y, 90, 10).fillRect(x + 34, y0 + y - 10, 14, 30).fillRect(x + 80, y0 + y - 12, 8, 14);
      outside.fillStyle(0x59c8ff, 1).fillRect(x + 6, y0 + y + 3, 60, 2);
    });
    const frames = this.add.graphics();
    for (let x = 20; x <= W - 20; x += 73) frames.fillStyle(0x2a2350, 1).fillRect(x, y0 + 26, 4, 84);
    // Red static in the sky outside.
    const skyGlitch = this.add.graphics();
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        skyGlitch.clear();
        if (Math.random() < 0.3) skyGlitch.fillStyle(0xff5252, 0.35).fillRect(20, y0 + 26 + Math.random() * 80, W - 40, 2);
      },
    });

    // Wall board, already gone.
    g.fillStyle(0x111111, 1).fillRect(170, y0 + 4, 140, 20);
    const wallBoard = this.add.text(240, y0 + 14, 'ANTI ANTI ANTI', { fontFamily: FONT, fontSize: '16px', color: '#ff5252' }).setOrigin(0.5);
    this.tweens.add({ targets: wallBoard, alpha: 0.3, duration: 300, yoyo: true, repeat: -1, ease: 'Stepped' });
    // Gate sign.
    g.fillStyle(0xffc247, 1).fillRect(24, y0 + 4, 64, 18);
    this.add.text(56, y0 + 13, 'GATE 7 →', { fontFamily: FONT, fontSize: '16px', color: '#1a1026' }).setOrigin(0.5);

    // Floor.
    g.fillStyle(0xd8d4e3, 1).fillRect(0, y0 + 130, W, 142);
    g.lineStyle(1, 0xbcb6cc, 1);
    for (let x = 0; x <= W; x += 32) g.lineBetween(x, y0 + 130, x, y0 + H);
    for (let y = y0 + 130; y <= y0 + H; y += 24) g.lineBetween(0, y, W, y);

    // Rows of seats.
    for (const [sx, sy] of [[30, 150], [30, 196], [300, 150], [300, 196]]) {
      for (let i = 0; i < 6; i++) {
        g.fillStyle(0x1c7ed6, 1).fillRect(sx + i * 25, y0 + sy, 20, 12);
        g.fillStyle(0x1864ab, 1).fillRect(sx + i * 25, y0 + sy - 8, 20, 8);
      }
    }

    // Stranded travellers staring at dead phones.
    const people: [string, number, number][] = [
      ['pax1', 60, 150], ['pax2', 130, 196], ['pax3', 340, 150], ['pax4', 420, 196],
      ['pax5', 210, 170], ['pax6', 280, 220], ['pax2', 380, 236], ['pax5', 160, 240],
    ];
    for (const [key, x, y] of people) {
      const p = this.add.image(x, y0 + y, key).setScale(2.5).setOrigin(0.5, 1);
      this.add.rectangle(x + 7, y0 + y - 22, 4, 6, 0xff5252).setAlpha(0.9);
      this.tweens.add({ targets: p, y: p.y - 2, duration: 600 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Stepped' });
    }

    // You, sitting on the floor, with a phone about to light up.
    this.add.image(240, y0 + 250, 'player').setScale(3).setOrigin(0.5, 1);
    this.phoneGlow = this.add.circle(258, y0 + 228, 6, 0x59c8ff, 0);
  }
}
