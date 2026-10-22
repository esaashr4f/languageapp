import Phaser from 'phaser';
import { profile } from '../account';
import { COUNTRIES } from '../content/countries';
import { hasStory, resetState, state } from '../state';
import { openLogin, openProfile } from '../ui/accountView';
import { ui, type Option } from '../ui/panel';

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

    const style = { fontFamily: 'VT323', fontSize: '96px' };
    const pink = this.add.text(width / 2 - 4, 92, 'ZABAN', { ...style, color: '#ff6b9d' }).setOrigin(0.5);
    const blue = this.add.text(width / 2 + 4, 88, 'ZABAN', { ...style, color: '#59c8ff' }).setOrigin(0.5);
    this.add.text(width / 2, 90, 'ZABAN', { ...style, color: '#f1ecff' }).setOrigin(0.5);
    this.add
      .text(width / 2, 150, 'A  L A N G U A G E  R P G', { fontFamily: 'VT323', fontSize: '20px', color: '#ffc247' })
      .setOrigin(0.5);

    // ANTI interference now and then.
    const glitch = this.add.graphics();
    this.time.addEvent({
      delay: 140,
      loop: true,
      callback: () => {
        glitch.clear();
        const hit = Math.random() < 0.08;
        pink.x = width / 2 - 4 + (hit ? (Math.random() - 0.5) * 10 : 0);
        blue.x = width / 2 + 4 - (hit ? (Math.random() - 0.5) * 10 : 0);
        if (!hit) return;
        glitch.fillStyle(0xff5252, 0.35).fillRect(0, 60 + Math.random() * 70, width, 2 + Math.random() * 3);
      },
    });

    ui.updateHud();
    void this.menu();
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
