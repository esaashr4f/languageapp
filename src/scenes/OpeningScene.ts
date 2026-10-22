import Phaser from 'phaser';
import { sfx } from '../audio';
import { AFTER_STORY, ASK_NAME, DARK_VOICE, MISSION, PHONE_BUZZ, SIT_UP, WAKE_UP } from '../content/intro';
import { save, state } from '../state';
import { ui } from '../ui/panel';

const W = 480;
const H = 272;

/**
 * Story mode opening: a voice in the dark, waking up on your back under a glitching sky,
 * sitting up at a stranded airport, then OMNI explains everything.
 */
export class OpeningScene extends Phaser.Scene {
  constructor() {
    super('Opening');
  }

  create(): void {
    this.drawSky();
    this.drawAirport();
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

    // Eyes opening onto the sky: blink, blink, awake.
    await this.fade('in', 700);
    await this.fade('out', 200);
    await this.fade('in', 1200);
    await ui.say(WAKE_UP);

    // Sit up: the view tilts down from the sky to the airport.
    sfx.move();
    await new Promise<void>((resolve) =>
      this.tweens.add({ targets: this.cameras.main, scrollY: H, duration: 1400, ease: 'Sine.inOut', onComplete: () => resolve() }),
    );
    await ui.say(SIT_UP);

    sfx.buzz();
    this.cameras.main.shake(300, 0.003);
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
  // Art

  private drawSky(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x3b7dd8, 0x3b7dd8, 0xa9d6f5, 0xa9d6f5, 1);
    g.fillRect(0, 0, W, H);

    // Pixel clouds drifting.
    for (let i = 0; i < 7; i++) {
      const cloud = this.add.graphics();
      const w = 40 + ((i * 37) % 60);
      cloud.fillStyle(0xffffff, 0.9).fillRect(0, 8, w, 10).fillRect(8, 0, w - 20, 10).fillRect(4, 16, w - 8, 6);
      cloud.setPosition((i * 83) % W, 20 + ((i * 53) % 200));
      this.tweens.add({ targets: cloud, x: cloud.x + 60, duration: 9000 + i * 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // Planes circling, going nowhere.
    for (let i = 0; i < 3; i++) {
      const plane = this.plane(0xf1ecff).setScale(0.6 + i * 0.2);
      const cx = 120 + i * 130;
      const cy = 70 + i * 50;
      const r = 30 + i * 10;
      let t = i * 2;
      this.time.addEvent({
        delay: 40,
        loop: true,
        callback: () => {
          t += 0.012;
          plane.setPosition(cx + Math.cos(t) * r * 1.6, cy + Math.sin(t) * r * 0.6);
          plane.setRotation(t + Math.PI / 2);
        },
      });
    }

    // ANTI static flickering across the sky.
    const glitch = this.add.graphics();
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        glitch.clear();
        if (Math.random() > 0.12) return;
        for (let i = 0; i < 4; i++) {
          glitch.fillStyle(i % 2 ? 0xff5252 : 0x59c8ff, 0.4).fillRect(0, Math.random() * H, W, 1 + Math.random() * 4);
        }
        if (Math.random() < 0.3) sfx.glitch();
      },
    });
  }

  private plane(colour: number): Phaser.GameObjects.Graphics {
    const p = this.add.graphics();
    p.fillStyle(colour, 1);
    p.fillRect(-2, -14, 4, 28); // fuselage
    p.fillRect(-14, -2, 28, 5); // wings
    p.fillRect(-6, 10, 12, 3); // tail
    return p;
  }

  private drawAirport(): void {
    const y0 = H;
    const g = this.add.graphics();
    g.fillGradientStyle(0xa9d6f5, 0xa9d6f5, 0xe0d4c0, 0xe0d4c0, 1).fillRect(0, y0, W, 120);
    // Terminal building.
    g.fillStyle(0x4a4370, 1).fillRect(40, y0 + 50, 400, 80);
    g.fillStyle(0x2a2350, 1).fillRect(40, y0 + 46, 400, 6);
    for (let x = 52; x < 430; x += 22) g.fillStyle(0x59c8ff, 0.5).fillRect(x, y0 + 64, 14, 22);
    // Control tower.
    g.fillStyle(0x3b3560, 1).fillRect(400, y0 + 6, 16, 50);
    g.fillStyle(0x59c8ff, 0.7).fillRect(392, y0, 32, 12);
    // Scrambled sign on the terminal.
    const sign = this.add
      .text(240, y0 + 30, 'A▒R█O ANTI T', { fontFamily: 'VT323', fontSize: '22px', color: '#ff5252' })
      .setOrigin(0.5);
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => sign.setText(Math.random() < 0.5 ? 'A▒R█O ANTI T' : '█▒▒ ANTI ▒█▒'),
    });
    // Tarmac with grounded planes.
    g.fillStyle(0x5b5480, 1).fillRect(0, y0 + 130, W, 142);
    for (let x = 0; x < W; x += 40) g.fillStyle(0xf1ecff, 0.6).fillRect(x, y0 + 200, 20, 3);
    [90, 250, 400].forEach((x, i) => this.plane(0xf1ecff).setPosition(x, y0 + 165 + (i % 2) * 40).setScale(1.6).setRotation(Math.PI / 2));
  }
}
