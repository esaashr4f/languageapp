import Phaser from 'phaser';
import { sfx } from '../audio';
import { STORY, type Vignette } from '../content/intro';
import { ui } from '../ui/panel';

const W = 480;
const H = 272;
const FONT = 'VT323, "Noto Sans", sans-serif';

/**
 * OMNI's "from the beginning" flashback: one illustrated panel per part of the story,
 * narrated in the bottom-screen dialogue box. Launched on top of the overworld.
 */
export class StoryScene extends Phaser.Scene {
  private stage!: Phaser.GameObjects.Container;

  constructor() {
    super('Story');
  }

  create(): void {
    this.add.rectangle(0, 0, W, H, 0x05030c).setOrigin(0);
    this.stage = this.add.container(0, 0);
    // A soft vignette frame so it reads as a memory.
    const frame = this.add.graphics();
    frame.lineStyle(2, 0x2a2350, 1).strokeRect(6, 6, W - 12, H - 12);
    void this.run();
  }

  private async run(): Promise<void> {
    for (const vignette of STORY) {
      await this.show(vignette);
      await ui.say(vignette.lines);
    }
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.game.events.emit('story-done'));
  }

  private show(v: Vignette): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.tweens.add({
        targets: this.stage,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          this.stage.removeAll(true);
          this.draw(v);
          const caption = this.text(W / 2, 22, v.caption, '#ffc247', 18).setOrigin(0.5);
          caption.setLetterSpacing(4);
          this.stage.add(caption);
          this.tweens.add({ targets: this.stage, alpha: 1, duration: 350, onComplete: () => resolve() });
        },
      });
    });
  }

  private text(x: number, y: number, s: string, color: string, size: number): Phaser.GameObjects.Text {
    return this.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color });
  }

  private g(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    this.stage.add(g);
    return g;
  }

  private draw(v: Vignette): void {
    switch (v.id) {
      case 'network':
        return this.drawGlobe(false);
      case 'voices':
        return this.drawVoices(false);
      case 'quiet':
        return this.drawVoices(true);
      case 'datacentre':
        return this.drawDatacentre();
      case 'islands':
        return this.drawGlobe(true);
      case 'stories':
        return this.drawStories();
      case 'pocket':
        return this.drawPocket();
    }
  }

  private stars(): void {
    const g = this.g();
    for (let i = 0; i < 50; i++) {
      g.fillStyle(0xffffff, 0.2 + Math.random() * 0.6).fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
  }

  /** The planet with OMNI's network; when `broken`, the links snap and English dissolves. */
  private drawGlobe(broken: boolean): void {
    this.stars();
    const cx = W / 2;
    const cy = 150;
    const g = this.g();
    g.fillStyle(0x1d3a6e, 1).fillCircle(cx, cy, 86);
    g.fillStyle(0x2f9e44, 1);
    [[-40, -30, 46, 30], [10, -46, 40, 24], [24, 4, 52, 40], [-52, 20, 34, 44], [-8, 52, 30, 14]].forEach(([x, y, w, h]) =>
      g.fillEllipse(cx + x, cy + y, w, h),
    );
    g.lineStyle(2, 0x05030c, 0.5).strokeCircle(cx, cy, 86);

    const cities = [[-46, -32], [16, -48], [40, 2], [-56, 26], [6, 40], [-12, -6], [56, -24]].map(([x, y]) => [cx + x, cy + y]);
    const links = this.g();
    const drawLinks = (colour: number, alpha: number, gap: boolean) => {
      links.clear();
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j += 2) {
          const [x1, y1] = cities[i];
          const [x2, y2] = cities[j];
          links.lineStyle(1, colour, alpha);
          if (!gap) links.lineBetween(x1, y1, x2, y2);
          else links.lineBetween(x1, y1, x1 + (x2 - x1) * 0.35, y1 + (y2 - y1) * 0.35);
        }
      }
      for (const [x, y] of cities) links.fillStyle(gap ? 0x8b86a8 : 0xffc247, 1).fillRect(x - 2, y - 2, 4, 4);
    };
    drawLinks(0x59c8ff, 0.9, false);
    this.tweens.add({ targets: links, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });

    if (!broken) {
      this.omniLogo(cx, 52, 0.8);
      return;
    }
    sfx.glitch();
    this.time.delayedCall(700, () => {
      drawLinks(0x3b3560, 0.8, true);
      this.cameras.main.shake(200, 0.005);
    });
    const word = 'ENGLISH';
    const label = this.text(cx, 58, word, '#f1ecff', 34).setOrigin(0.5);
    this.stage.add(label);
    let erased = 0;
    this.time.addEvent({
      delay: 260,
      repeat: word.length,
      startAt: 0,
      callback: () => {
        erased++;
        label.setText(word.slice(0, Math.max(0, word.length - erased)) + '█'.repeat(Math.min(erased, 2)));
        label.setColor(erased > 2 ? '#ff5252' : '#f1ecff');
        if (erased > word.length) label.setText('');
      },
    });
  }

  /** People talking in many languages through OMNI; when `quiet`, they stop and stare at phones. */
  private drawVoices(quiet: boolean): void {
    const g = this.g();
    g.fillStyle(0x151030, 1).fillRect(0, 196, W, 76);
    const words = ['Hola', 'Bonjour', 'Hallo', 'Ciao', 'Hello', 'Olá'];
    const colours = [0xd9480f, 0x3b5bdb, 0x2f9e44, 0xb18cff, 0xffc247, 0x59c8ff];
    this.omniLogo(W / 2, 64, 1);
    words.forEach((word, i) => {
      const x = 50 + i * 76;
      const p = this.g();
      p.fillStyle(colours[i], quiet ? 0.5 : 1).fillRect(x - 8, 172, 16, 26);
      p.fillStyle(0xe8b48a, quiet ? 0.5 : 1).fillCircle(x, quiet ? 166 : 162, 8);
      if (quiet) {
        p.fillStyle(0x59c8ff, 1).fillRect(x - 3, 178, 6, 9);
        return;
      }
      p.lineStyle(1, 0x59c8ff, 0.5).lineBetween(x, 128, W / 2, 84);
      const bubble = this.g();
      bubble.fillStyle(0xf1ecff, 1).fillRoundedRect(x - 30, 112, 60, 22, 4);
      bubble.fillTriangle(x - 4, 134, x + 4, 134, x, 140);
      const t = this.text(x, 123, word, '#151030', 18).setOrigin(0.5);
      this.stage.add(t);
      bubble.setAlpha(0);
      t.setAlpha(0);
      this.tweens.add({ targets: [bubble, t], alpha: 1, delay: 200 + i * 180, duration: 200 });
    });
    if (quiet) {
      const hush = this.text(W / 2, 128, '. . .', '#9a90c4', 28).setOrigin(0.5);
      this.stage.add(hush);
    }
  }

  /** Server racks going from green to ANTI red, then ANTI's name. */
  private drawDatacentre(): void {
    const g = this.g();
    g.fillStyle(0x0b0718, 1).fillRect(0, 0, W, H);
    const leds: Phaser.GameObjects.Rectangle[] = [];
    for (let r = 0; r < 7; r++) {
      const x = 34 + r * 62;
      g.fillStyle(0x2a2350, 1).fillRect(x, 60, 44, 170);
      g.lineStyle(1, 0x3b3560, 1).strokeRect(x, 60, 44, 170);
      for (let row = 0; row < 14; row++) {
        g.fillStyle(0x151030, 1).fillRect(x + 4, 66 + row * 11, 36, 8);
        for (let k = 0; k < 3; k++) {
          const led = this.add.rectangle(x + 30 + k * 3, 70 + row * 11, 2, 2, 0x7cf5b0);
          this.stage.add(led);
          leds.push(led);
        }
      }
    }
    // Blinking healthy servers...
    const blink = this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => leds.forEach((l) => l.fillColor !== 0xff5252 && l.setAlpha(Math.random() < 0.8 ? 1 : 0.2)),
    });
    // ...then infection sweeps left to right.
    this.time.delayedCall(900, () => {
      sfx.glitch();
      const sorted = [...leds].sort((a, b) => a.x - b.x);
      this.time.addEvent({
        delay: 12,
        repeat: sorted.length - 1,
        callback: () => sorted.shift()?.setFillStyle(0xff5252).setAlpha(1),
      });
    });
    this.time.delayedCall(2700, () => {
      blink.remove();
      this.cameras.main.shake(300, 0.01);
      sfx.hit();
      const shade = this.add.rectangle(0, 0, W, H, 0x05030c, 0.7).setOrigin(0);
      this.stage.add(shade);
      this.antiLogo(W / 2, 140);
    });
  }

  /** A book whose words vanish, and a legend rising from it, corrupted. */
  private drawStories(): void {
    this.stars();
    const g = this.g();
    const bx = 110;
    const by = 110;
    g.fillStyle(0x5c3d2e, 1).fillRect(bx - 4, by - 4, 172, 116);
    g.fillStyle(0xf2e7c6, 1).fillRect(bx, by, 80, 108).fillRect(bx + 84, by, 80, 108);
    const lines: Phaser.GameObjects.Rectangle[] = [];
    for (let p = 0; p < 2; p++) {
      for (let i = 0; i < 9; i++) {
        const line = this.add
          .rectangle(bx + 8 + p * 84, by + 12 + i * 10, 50 + ((i * 13) % 16), 3, 0x8b86a8)
          .setOrigin(0, 0.5);
        this.stage.add(line);
        lines.push(line);
      }
    }
    this.time.addEvent({
      delay: 140,
      repeat: lines.length - 1,
      startAt: 0,
      callback: () => {
        const line = lines.splice(Math.floor(Math.random() * lines.length), 1)[0];
        if (line) this.tweens.add({ targets: line, alpha: 0, duration: 200 });
      },
    });
    const legend = this.add.image(340, 150, 'duende_corrupt').setScale(5).setAlpha(0);
    this.stage.add(legend);
    this.tweens.add({ targets: legend, alpha: 1, y: 130, delay: 900, duration: 900, ease: 'Sine.out' });
    this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => {
        legend.x = 340 + (Math.random() - 0.5) * 6;
        if (Math.random() < 0.15) legend.setTintFill(0xff5252);
        else legend.clearTint();
      },
    });
  }

  /** Your phone, with OMNI's little face on the screen. */
  private drawPocket(): void {
    this.stars();
    const g = this.g();
    const x = W / 2 - 50;
    const y = 52;
    g.fillStyle(0x1a1026, 1).fillRoundedRect(x, y, 100, 190, 10);
    g.lineStyle(3, 0x2a2350, 1).strokeRoundedRect(x, y, 100, 190, 10);
    const screen = this.add.rectangle(x + 8, y + 18, 84, 150, 0x0d1c35).setOrigin(0);
    this.stage.add(screen);
    const face = this.g();
    face.fillStyle(0x59c8ff, 1).fillRect(W / 2 - 18, 118, 8, 12).fillRect(W / 2 + 10, 118, 8, 12);
    face.fillRect(W / 2 - 14, 146, 28, 4).fillRect(W / 2 - 18, 142, 4, 4).fillRect(W / 2 + 14, 142, 4, 4);
    const glow = this.add.circle(W / 2, 134, 70, 0x59c8ff, 0.12);
    this.stage.add(glow);
    this.tweens.add({ targets: glow, scale: 1.15, alpha: 0.05, duration: 900, yoyo: true, repeat: -1 });
    this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: () => {
        face.setAlpha(0.2);
        this.time.delayedCall(120, () => face.setAlpha(1));
      },
    });
  }

  private omniLogo(x: number, y: number, scale: number): void {
    const g = this.g();
    g.lineStyle(4 * scale, 0x59c8ff, 1).strokeCircle(x, y, 20 * scale);
    g.fillStyle(0x59c8ff, 1).fillCircle(x, y, 6 * scale);
    const label = this.text(x, y + 32 * scale, 'OMNI', '#59c8ff', 18).setOrigin(0.5);
    this.stage.add(label);
    this.tweens.add({ targets: g, alpha: 0.6, duration: 600, yoyo: true, repeat: -1 });
  }

  private antiLogo(x: number, y: number): void {
    const back = this.text(x + 3, y + 2, 'ANTI', '#05030c', 96).setOrigin(0.5);
    const offset = this.text(x - 3, y, 'ANTI', '#59c8ff', 96).setOrigin(0.5).setAlpha(0.5);
    const main = this.text(x, y, 'ANTI', '#ff5252', 96).setOrigin(0.5);
    this.stage.add([back, offset, main]);
    const g = this.g();
    g.fillStyle(0xff5252, 1).fillTriangle(x - 14, y + 58, x + 14, y + 58, x, y + 76);
    this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        const jitter = Math.random() < 0.3 ? (Math.random() - 0.5) * 10 : 0;
        main.x = x + jitter;
        offset.x = x - 3 - jitter;
      },
    });
  }
}
