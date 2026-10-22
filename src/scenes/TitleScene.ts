import Phaser from 'phaser';
import { resetState, state } from '../state';
import { ui } from '../ui/panel';

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

    const title = 'SPAIN · ACT 1';
    const style = { fontFamily: 'VT323', fontSize: '64px' };
    this.add.text(width / 2 - 3, 92, title, { ...style, color: '#ff6b9d' }).setOrigin(0.5);
    this.add.text(width / 2 + 3, 88, title, { ...style, color: '#59c8ff' }).setOrigin(0.5);
    this.add.text(width / 2, 90, title, { ...style, color: '#f1ecff' }).setOrigin(0.5);
    this.add
      .text(width / 2, 132, 'E L   M E R C A D O', { fontFamily: 'VT323', fontSize: '22px', color: '#ffc247' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 156, 'language RPG prototype', { fontFamily: 'VT323', fontSize: '18px', color: '#f1ecff' })
      .setOrigin(0.5)
      .setAlpha(0.7);
    void this.menu();
  }

  private async menu(): Promise<void> {
    const hasSave = !!state.flags.prologue;
    const options = hasSave
      ? [
          { id: 'continue', label: 'CONTINUE' },
          { id: 'new', label: 'NEW GAME' },
        ]
      : [{ id: 'new', label: 'START' }];
    const choice = await ui.choose('', options, 1);
    if (choice === 'new') resetState();
    ui.updateHud();
    this.scene.start('Overworld');
  }
}
