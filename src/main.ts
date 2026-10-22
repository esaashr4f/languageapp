import Phaser from 'phaser';
import './style.css';
import { BattleScene } from './scenes/BattleScene';
import { BootScene } from './scenes/BootScene';
import { OverworldScene } from './scenes/OverworldScene';
import { StoryScene } from './scenes/StoryScene';
import { TitleScene } from './scenes/TitleScene';
import { ui } from './ui/panel';

async function start(): Promise<void> {
  ui.mount(document.getElementById('screen-bottom')!);
  try {
    // Canvas text needs the pixel font loaded before the first scene draws.
    await document.fonts.load('16px VT323');
  } catch {
    // Fall back to monospace.
  }
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 480,
    height: 272,
    pixelArt: true,
    backgroundColor: '#05030c',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, TitleScene, OverworldScene, StoryScene, BattleScene],
  });
}

void start();
