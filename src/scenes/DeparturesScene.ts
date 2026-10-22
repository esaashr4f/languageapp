import Phaser from 'phaser';
import { sfx } from '../audio';
import { COUNTRIES, type Country } from '../content/countries';
import { CHOOSE_PROMPT, CONFIRM, DEPART, NOT_AVAILABLE } from '../content/intro';
import { save, state } from '../state';
import { ui } from '../ui/panel';

const W = 480;
const H = 272;
const AMBER = '#ffc247';

/** The departures board: choosing (and locking in) the country for story mode. */
export class DeparturesScene extends Phaser.Scene {
  private rows: Phaser.GameObjects.Text[][] = [];

  constructor() {
    super('Departures');
  }

  create(): void {
    this.rows = [];
    this.add.rectangle(0, 0, W, H, 0x05030c).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0x111111, 1).fillRect(16, 16, W - 32, H - 32);
    g.lineStyle(3, 0x2a2350, 1).strokeRect(16, 16, W - 32, H - 32);

    const text = (x: number, y: number, s: string, color = AMBER, size = 18) =>
      this.add.text(x, y, s, { fontFamily: 'VT323, "Noto Sans", sans-serif', fontSize: `${size}px`, color });

    text(32, 26, 'DEPARTURES · SALIDAS · DÉPARTS', AMBER, 22);
    const cols = [32, 86, 152, 330];
    ['TIME', 'FLIGHT', 'DESTINATION', 'STATUS'].forEach((h, i) => text(cols[i], 58, h, '#9a90c4', 16));
    g.fillStyle(0x2a2350, 1).fillRect(28, 76, W - 56, 1);

    COUNTRIES.forEach((c, i) => {
      const y = 86 + i * 30;
      g.fillStyle(0x1a1a1a, 1).fillRect(28, y - 2, W - 56, 24);
      const time = `${String(7 + i).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`;
      const row = [
        text(cols[0], y, time),
        text(cols[1], y, c.flight),
        text(cols[2], y, `${c.flag} ${c.city.toUpperCase()}`),
        text(cols[3], y, c.available ? 'BOARDING' : 'LOCKED', c.available ? '#7cf5b0' : '#ff5252'),
      ];
      this.rows.push(row);
      if (c.available) this.tweens.add({ targets: row[3], alpha: 0.3, duration: 500, yoyo: true, repeat: -1, ease: 'Stepped' });
    });

    // Locked rows glitch like a split-flap board stuck between letters.
    const junk = '█▒░ANTI';
    this.time.addEvent({
      delay: 160,
      loop: true,
      callback: () => {
        COUNTRIES.forEach((c, i) => {
          if (c.available || Math.random() > 0.15) return;
          const dest = this.rows[i][2];
          const real = `${c.flag} ${c.city.toUpperCase()}`;
          dest.setText(
            [...real].map((ch) => (Math.random() < 0.3 ? junk[(Math.random() * junk.length) | 0] : ch)).join(''),
          );
          this.time.delayedCall(140, () => dest.setText(real));
        });
      },
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
    void this.choose();
  }

  private async choose(): Promise<void> {
    for (;;) {
      const id = await ui.choose(
        CHOOSE_PROMPT,
        COUNTRIES.map((c) => ({ id: c.id, label: `${c.flag} ${c.city}`, note: c.available ? c.language : `${c.language} · locked` })),
        1,
      );
      const country = COUNTRIES.find((c) => c.id === id)!;
      this.highlight(country);
      if (!country.available) {
        await ui.say(NOT_AVAILABLE(country.city));
        continue;
      }
      await ui.say(CONFIRM(country.city, country.name, country.language));
      const sure = await ui.choose(`Lock in ${country.city}?`, [
        { id: 'yes', label: 'YES, LET\'S GO' },
        { id: 'no', label: 'NOT YET' },
      ]);
      if (sure === 'yes') return this.depart(country);
    }
  }

  private highlight(country: Country): void {
    const i = COUNTRIES.indexOf(country);
    this.rows.forEach((row, j) => row.forEach((t) => t.setAlpha(j === i ? 1 : 0.45)));
  }

  private async depart(country: Country): Promise<void> {
    state.country = country.id;
    save();
    sfx.confirm();
    await ui.say(DEPART(country.city));

    // Take-off: the board fades to a sky with the plane climbing away.
    const sky = this.add.graphics().setAlpha(0);
    sky.fillGradientStyle(0xe0607e, 0xe0607e, 0xffb77a, 0xffb77a, 1).fillRect(0, 0, W, H);
    this.tweens.add({ targets: sky, alpha: 1, duration: 500 });
    const plane = this.add.graphics();
    plane.fillStyle(0xf1ecff, 1).fillRect(-16, -2, 32, 5).fillRect(-4, -12, 6, 24).fillRect(-16, -6, 4, 8);
    plane.setPosition(-30, H - 40).setRotation(-0.25);
    sfx.restore();
    await new Promise<void>((resolve) =>
      this.tweens.add({ targets: plane, x: W + 40, y: 40, duration: 2200, ease: 'Sine.in', onComplete: () => resolve() }),
    );
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Overworld', { from: 'arrive' }));
  }
}
