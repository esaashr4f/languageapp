import Phaser from 'phaser';
import { profile } from '../account';
import { COUNTRIES } from '../content/countries';
import { hasStory, resetState, state } from '../state';
import { openLogin, openProfile } from '../ui/accountView';
import { ui, type Option } from '../ui/panel';

/** Each letter of ZABAN in scripts that make the same sound. The first entry is the logo's resting form. */
const LETTERS: { glyph: string; font: string }[][] = [
  [g('Ζ', 'greek'), g('Z', 'latin'), g('З', 'cyrillic'), g('ز', 'arabic'), g('ザ', 'jp')],
  [g('А', 'cyrillic'), g('A', 'latin'), g('Α', 'greek'), g('ا', 'arabic'), g('अ', 'hindi')],
  [g('ب', 'arabic'), g('B', 'latin'), g('Β', 'greek'), g('Б', 'cyrillic'), g('ब', 'hindi')],
  [g('ア', 'jp'), g('A', 'latin'), g('А', 'cyrillic'), g('Α', 'greek'), g('अ', 'hindi')],
  [g('न', 'hindi'), g('N', 'latin'), g('Ν', 'greek'), g('Н', 'cyrillic'), g('ン', 'jp')],
];

function g(glyph: string, script: 'latin' | 'greek' | 'cyrillic' | 'arabic' | 'jp' | 'hindi') {
  const font = {
    latin: 'VT323',
    greek: '"Noto Sans"',
    cyrillic: '"Noto Sans"',
    arabic: '"Noto Sans Arabic"',
    jp: '"Noto Sans JP"',
    hindi: '"Noto Sans Devanagari"',
  }[script];
  return { glyph, font };
}

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const { width, height } = this.scale;
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0b0718, 0x0b0718, 0xe0607e, 0xffb77a, 1);
    sky.fillRect(0, 0, width, height);
    for (let i = 0; i < 40; i++) {
      this.add.rectangle(Math.random() * width, Math.random() * height * 0.5, 1, 1, 0xffffff, 0.4 + Math.random() * 0.6);
    }
    // City skyline silhouette.
    const city = this.add.graphics().fillStyle(0x12082a, 1);
    for (let x = 0; x < width; x += 18) {
      const h = 30 + ((x * 37) % 70);
      city.fillRect(x, height - h, 16, h);
    }

    this.drawLogo(width);
    this.add
      .text(width / 2, 142, 'zaban', { fontFamily: 'VT323', fontSize: '34px', color: '#f1ecff' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 168, 'A  L A N G U A G E  R P G', { fontFamily: 'VT323', fontSize: '16px', color: '#ffc247' })
      .setOrigin(0.5);

    ui.updateHud();
    void this.menu();
  }

  /** ZABAN spelled in five scripts, with a chromatic glitch; ANTI now and then scrambles a letter. */
  private drawLogo(width: number): void {
    const spacing = 74;
    const left = width / 2 - spacing * 2;
    const y = 82;
    LETTERS.forEach((forms, i) => {
      const x = left + i * spacing;
      const layer = (color: string, dx: number, dy: number) =>
        this.add
          .text(x + dx, y + dy, forms[0].glyph, { fontFamily: forms[0].font, fontSize: '64px', fontStyle: 'bold', color })
          .setOrigin(0.5);
      const pink = layer('#ff6b9d', -3, 2);
      const blue = layer('#59c8ff', 3, -2);
      const main = layer('#f1ecff', 0, 0);
      const layers = [pink, blue, main];
      const show = (form: { glyph: string; font: string }) =>
        layers.forEach((t) => t.setText(form.glyph).setFontFamily(form.font));

      // Every few seconds, cycle this letter through its other scripts, then settle back.
      this.time.addEvent({
        delay: 2600 + i * 700,
        loop: true,
        callback: () => {
          forms.slice(1).forEach((form, k) => this.time.delayedCall(k * 110, () => show(form)));
          this.time.delayedCall(forms.length * 110, () => show(forms[0]));
        },
      });
    });
  }

  private storySummary(): string {
    const country = COUNTRIES.find((c) => c.id === state.country);
    if (!state.flags.opening) return 'Pick up where you left off';
    if (!country) return `${state.name} · choosing a country`;
    return `${state.name} · ${country.flag} ${country.city}`;
  }

  private async menu(): Promise<void> {
    for (;;) {
      const me = profile();
      const options: Option[] = [
        ...(hasStory()
          ? [
              { id: 'continue', label: 'CONTINUE STORY', note: this.storySummary() },
              { id: 'new', label: 'NEW STORY' },
            ]
          : [{ id: 'new', label: 'STORY MODE', note: 'Begin your journey' }]),
        { id: 'casual', label: 'CASUAL MODES', note: 'Daily Climb · Bridge Rush · coming soon', disabled: true },
        me
          ? { id: 'profile', label: 'PROFILE', note: me.name }
          : { id: 'login', label: 'LOG IN', note: 'Save your progress to your account' },
      ];
      const choice = await ui.choose('', options, 1);

      if (choice === 'login') {
        await openLogin();
        continue;
      }
      if (choice === 'profile') {
        await openProfile();
        ui.updateHud();
        continue;
      }
      if (choice === 'new' && hasStory()) {
        const sure = await ui.choose('Start a new story? This replaces your current journey.', [
          { id: 'yes', label: 'YES, START OVER' },
          { id: 'no', label: 'CANCEL' },
        ]);
        if (sure !== 'yes') continue;
      }
      if (choice === 'new') resetState();
      ui.updateHud();
      this.scene.start(!state.flags.opening ? 'Opening' : !state.country ? 'Departures' : 'Overworld');
      return;
    }
  }
}
