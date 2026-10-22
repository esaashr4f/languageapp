import Phaser from 'phaser';
import { makeSprites, makeTiles } from '../art/textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    makeSprites(this);
    makeTiles(this);
    this.scene.start('Title');
  }
}
