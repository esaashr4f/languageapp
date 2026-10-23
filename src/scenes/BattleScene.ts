import Phaser from 'phaser';
import { sfx } from '../audio';
import { ITEMS, type ItemId } from '../content/items';
import { DUENDE_BATTLE, SLOT_EXAMPLES, SLOTS } from '../content/spain/act1';
import type { BattlePhase, LegendBattle } from '../content/types';
import { rateBattleReply } from '../ai/client';
import { fillSlots, grade, type Prompt } from '../engine/grader';
import { tierById, tierRank, type TierId } from '../engine/tiers';
import { cefr, save, state } from '../state';
import { ui } from '../ui/panel';

const BATTLES: Record<string, LegendBattle> = { [DUENDE_BATTLE.id]: DUENDE_BATTLE };
const HINT_COST = 5;
const CENTER = { x: 240, y: 132 };

export class BattleScene extends Phaser.Scene {
  private battle!: LegendBattle;
  private corruption = 100;
  private phaseIndex = 0;
  private promptIndex: number[] = [];
  private bonusTime = 0;
  private ended = false;

  private corruptSprite!: Phaser.GameObjects.Image;
  private trueSprite!: Phaser.GameObjects.Image;
  private fx!: Phaser.GameObjects.Graphics;
  private corruptionFill!: Phaser.GameObjects.Rectangle;
  private hpFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private steps: Phaser.GameObjects.Text[] = [];
  /** The line the legend is about to say; shown with OMNI's goal before you act. */
  private current: Prompt | null = null;
  private history: { speaker: 'legend' | 'player'; text: string }[] = [];

  constructor() {
    super('Battle');
  }

  init(data: { battle: string }): void {
    this.battle = BATTLES[data.battle] ?? DUENDE_BATTLE;
    this.corruption = 100;
    this.phaseIndex = 0;
    this.promptIndex = this.battle.phases.map(() => 0);
    this.current = null;
    this.history = [];
    this.bonusTime = 0;
    this.ended = false;
    if (state.hp <= 0) state.hp = state.maxHp;
  }

  create(): void {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1d1442, 0x1d1442, 0x05030c, 0x05030c, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0x2a2350, 1).fillEllipse(CENTER.x, 196, 220, 36);
    bg.lineStyle(1, 0x2a2350, 0.6);
    for (let i = -8; i <= 8; i++) bg.lineBetween(CENTER.x + i * 18, 200, CENTER.x + i * 60, height);

    this.trueSprite = this.add.image(CENTER.x, CENTER.y, 'duende_true').setScale(7).setAlpha(0);
    this.corruptSprite = this.add.image(CENTER.x, CENTER.y, 'duende_corrupt').setScale(7);
    this.tweens.add({ targets: [this.trueSprite, this.corruptSprite], y: CENTER.y - 5, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.fx = this.add.graphics().setDepth(5);

    const text = (x: number, y: number, s: string, color = '#f1ecff', size = 18) =>
      this.add.text(x, y, s, { fontFamily: 'VT323', fontSize: `${size}px`, color }).setDepth(10);

    this.nameText = text(16, 8, this.battle.corruptName, '#ff5252', 20);
    this.phaseText = text(width - 16, 8, '', '#ff5252', 20).setOrigin(1, 0);
    text(16, 30, 'CORRUPTION', '#9a90c4', 16);
    this.add.rectangle(16, 52, 200, 10, 0x2a2350).setOrigin(0, 0.5).setDepth(10);
    this.corruptionFill = this.add.rectangle(16, 52, 200, 10, 0xff5252).setOrigin(0, 0.5).setDepth(11);

    // Step tracker: what you're trying to do, right now and next.
    this.steps = this.battle.phases.map((p, i) => text(width - 16, 30 + i * 16, `${i + 1} ${p.step}`, '#9a90c4', 15).setOrigin(1, 0));

    text(16, height - 46, (state.name || 'YOU').toUpperCase(), '#7cf5b0', 18);
    this.add.rectangle(16, height - 20, 150, 8, 0x2a2350).setOrigin(0, 0.5).setDepth(10);
    this.hpFill = this.add.rectangle(16, height - 20, 150, 8, 0x7cf5b0).setOrigin(0, 0.5).setDepth(11);
    this.hpText = text(174, height - 30, '', '#f1ecff', 18);
    this.time.addEvent({ delay: 90, loop: true, callback: () => this.glitchTick() });

    this.refreshBars(false);
    this.cameras.main.fadeIn(300, 0, 0, 0);
    void this.run();
  }

  private get phase(): BattlePhase {
    return this.battle.phases[this.phaseIndex];
  }

  // ---------------------------------------------------------------------------
  // Battle loop

  private async run(): Promise<void> {
    await ui.say(this.battle.intro);
    while (!this.ended) {
      this.current ??= this.nextPrompt();
      const command = await ui.choose(`OMNI: ${this.current.goal ?? 'Answer him in Spanish.'}`, [
        { id: 'speak', label: 'SPEAK' },
        { id: 'item', label: 'ITEM', disabled: !Object.values(state.items).some((n) => n > 0) },
        { id: 'hint', label: 'HINT', note: `${HINT_COST} coins`, disabled: state.coins < HINT_COST },
      ], 3);
      if (command === 'item') await this.useItem();
      else await this.speakTurn(command === 'hint');
    }
  }

  private nextPrompt() {
    const i = this.phaseIndex;
    const prompts = this.phase.prompts;
    const prompt = prompts[this.promptIndex[i] % prompts.length];
    this.promptIndex[i]++;
    return prompt;
  }

  private async speakTurn(withHint: boolean): Promise<void> {
    const prompt = this.current ?? this.nextPrompt();
    this.current = null;
    const examples = SLOT_EXAMPLES(state.name);
    const who = this.phaseIndex === 0 ? 'corrupt' : 'duende';

    if (withHint) {
      state.coins -= HINT_COST;
      ui.updateHud();
      const easiest = prompt.answers.find((a) => a.tier === 'clear') ?? prompt.answers[0];
      const best = [...prompt.answers].sort((a, b) => tierRank(b.tier) - tierRank(a.tier))[0];
      const firstLetters = fillSlots(best.text, examples).replace(/([\p{L}])([\p{L}]+)/gu, (_, a: string, rest: string) => a + '_'.repeat(rest.length));
      await ui.say([{ who: 'omni', text: `Hint: "${fillSlots(easiest.text, examples)}" works. A native would say something like: ${firstLetters}` }]);
    }

    const timerSec = this.phase.timerSec + this.bonusTime;
    this.bonusTime = 0;
    const answer = await ui.ask({ who, line: prompt.line, gloss: prompt.gloss, timerSec, coach: prompt.goal });
    const result = grade(prompt, answer ?? '', SLOTS);
    let better = result.better.map((a) => fillSlots(a.text, examples));
    let detail = '';
    let correction: { text: string; why?: string } | undefined = result.matched?.fix
      ? { text: fillSlots(result.matched.fix, examples), why: result.matched.why }
      : undefined;

    // Not on the answer list? Ask the AI rater before calling it a miss.
    if (!result.tier && answer) {
      ui.waiting('omni', undefined, 'Checking your Spanish');
      const ai = await rateBattleReply({
        country: 'Spain', legendId: this.battle.id, phase: this.phase.id, playerName: state.name, playerLevel: cefr(),
        history: this.history.slice(-10), legendLine: prompt.line, goal: prompt.goal ?? '', reply: answer,
      });
      if (ai) {
        result.tier = ai.rating.level === 'NO_SIGNAL' ? null : (ai.rating.level.toLowerCase() as TierId);
        better = ai.rating.better ? [ai.rating.better] : [];
        correction = ai.rating.correction ? { text: ai.rating.correction } : undefined;
        detail = ai.rating.feedback;
      }
    }
    this.history.push({ speaker: 'legend', text: prompt.line });
    if (answer) this.history.push({ speaker: 'player', text: answer });

    if (!result.tier) {
      sfx.miss();
      await ui.result({
        tier: null,
        headline: answer === null ? 'Too slow! ANTI scrambled the moment.' : `"${answer}" didn't get through the static.`,
        detail: detail || undefined,
        correction,
        better,
      });
      await this.enemyAttack(this.phase.baseDamage + 2);
      return;
    }

    const tier = tierById(result.tier);
    const rank = tierRank(result.tier);
    state.xp += Math.round(tier.points / 2);
    this.clearCorruption(tier.clear, tier.color);
    sfx.tier(rank);
    await ui.result({
      tier: result.tier,
      headline: `"${answer}"`,
      detail: `${detail || tier.blurb} · Corruption −${tier.clear}%`,
      correction,
      better,
    });
    ui.updateHud();
    if (result.tier === 'faint') await ui.say([this.phase.faintReaction]);

    if (this.corruption <= 0) return this.victory();
    await this.checkPhase();
    if (this.ended) return;
    // Corrupted legends still lash out, but natural answers soften the blow.
    const damage = Math.max(0, this.phase.baseDamage - rank * 2);
    if (damage > 0) await this.enemyAttack(damage);
  }

  private async useItem(): Promise<void> {
    const owned = (Object.keys(ITEMS) as ItemId[]).filter((id) => state.items[id] > 0);
    const choice = await ui.choose('Use which item?', [
      ...owned.map((id) => ({ id, label: `${ITEMS[id].icon} ${ITEMS[id].name} ×${state.items[id]}`, note: ITEMS[id].desc })),
      { id: 'back', label: '← BACK' },
    ], 1);
    if (choice === 'back') return;
    const id = choice as ItemId;
    state.items[id] -= 1;
    if (id === 'churros') {
      this.bonusTime += 8;
      await ui.say([{ text: 'You eat the churros. Sugar rush! +8 seconds on your next answer.' }]);
    } else {
      const healed = Math.min(15, state.maxHp - state.hp);
      state.hp += healed;
      this.refreshBars();
      await ui.say([{ text: `You eat the paella. Delicious! +${healed} HP.` }]);
    }
    save();
    ui.updateHud();
  }

  private async checkPhase(): Promise<void> {
    let next = this.phaseIndex;
    while (next + 1 < this.battle.phases.length && this.corruption <= this.battle.phases[next + 1].from) next++;
    if (next === this.phaseIndex) return;
    this.phaseIndex = next;
    this.refreshBars();
    sfx.glitch();
    this.cameras.main.shake(200, 0.006);
    if (this.phase.id !== 'corrupted') this.nameText.setText(this.battle.trueName).setColor('#7cf5b0');
    await ui.say(this.phase.enter);
  }

  private async enemyAttack(damage: number): Promise<void> {
    if (damage <= 0) return;
    const line = this.phase.attacks[Math.floor(Math.random() * this.phase.attacks.length)];
    if (line) await ui.say([line]);
    state.hp = Math.max(0, state.hp - damage);
    this.attackFx(damage);
    ui.updateHud();
    await ui.say([{ text: `The static hits you! −${damage} HP` }]);
    if (state.hp <= 0) await this.defeat();
  }

  private async victory(): Promise<void> {
    this.ended = true;
    this.corruption = 0;
    this.refreshBars();
    sfx.restore();
    this.cameras.main.flash(600, 241, 236, 255);
    this.tweens.add({ targets: this.corruptSprite, alpha: 0, duration: 800 });
    this.tweens.add({ targets: this.trueSprite, alpha: 1, duration: 800 });
    this.sparkle(0x7cf5b0, 40);
    this.nameText.setText(this.battle.trueName).setColor('#7cf5b0');
    this.phaseText.setText('RESTORED').setColor('#7cf5b0');

    state.coins += 30;
    state.xp += 50;
    state.hp = state.maxHp;
    if (!state.legends.includes(this.battle.id)) state.legends.push(this.battle.id);
    state.flags.duendeRestored = true;
    save();
    ui.updateHud();

    await ui.say(this.battle.victory);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Overworld', { from: 'battle' }));
  }

  private async defeat(): Promise<void> {
    this.ended = true;
    this.cameras.main.fade(500, 0, 0, 0);
    await ui.say([
      { text: 'Everything goes grey...' },
      { who: 'omni', text: "I've got you! I pulled you out of the static. Eat something, catch your breath, and let's try again." },
    ]);
    state.hp = state.maxHp;
    save();
    ui.updateHud();
    this.scene.restart({ battle: this.battle.id });
  }

  // ---------------------------------------------------------------------------
  // Visuals

  private refreshBars(animate = true): void {
    const phaseColor = [0xff5252, 0xffc247, 0x7cf5b0][this.phaseIndex];
    const scale = Math.max(0, this.corruption) / 100;
    const hp = state.hp / state.maxHp;
    this.corruptionFill.setFillStyle(phaseColor);
    this.phaseText.setText(this.phase.label).setColor(`#${phaseColor.toString(16)}`);
    this.steps.forEach((t, i) => {
      const done = i < this.phaseIndex || this.corruption <= 0;
      const now = i === this.phaseIndex && !done;
      t.setText(`${done ? 'OK' : now ? '>' : ' '} ${i + 1} ${this.battle.phases[i].step}`);
      t.setColor(done ? '#7cf5b0' : now ? '#ffc247' : '#6b6490');
    });
    this.hpText.setText(`${state.hp}/${state.maxHp}`);
    this.hpFill.setFillStyle(hp < 0.3 ? 0xff5252 : 0x7cf5b0);
    if (!animate) {
      this.corruptionFill.scaleX = scale;
      this.hpFill.scaleX = hp;
      return;
    }
    this.tweens.add({ targets: this.corruptionFill, scaleX: scale, duration: 500, ease: 'Cubic.out' });
    this.tweens.add({ targets: this.hpFill, scaleX: hp, duration: 400, ease: 'Cubic.out' });
  }

  private glitchTick(): void {
    if (this.ended && this.corruption <= 0) {
      this.fx.clear();
      return;
    }
    const r = Math.max(0, this.corruption) / 100;
    this.corruptSprite.setAlpha(Math.max(0.15, r));
    this.trueSprite.setAlpha(1 - r);
    this.corruptSprite.x = CENTER.x + (Math.random() - 0.5) * 14 * r;
    if (Math.random() < r * 0.15) this.corruptSprite.setTintFill(0xff5252);
    else this.corruptSprite.clearTint();

    this.fx.clear();
    const bars = Math.round(r * 6);
    const colors = [0xff5252, 0x59c8ff, 0x7cf5b0, 0xf1ecff];
    for (let i = 0; i < bars; i++) {
      this.fx.fillStyle(colors[(Math.random() * colors.length) | 0], 0.15 + Math.random() * 0.3);
      this.fx.fillRect(0, Math.random() * this.scale.height, this.scale.width, 1 + Math.random() * 3);
    }
  }

  private clearCorruption(amount: number, color: string): void {
    this.corruption = Math.max(0, this.corruption - amount);
    this.refreshBars();
    this.trueSprite.setTintFill(0xffffff);
    this.time.delayedCall(90, () => this.trueSprite.clearTint());
    const tint = Phaser.Display.Color.HexStringToColor(color).color;
    this.sparkle(tint, 18);
    const label = this.add
      .text(CENTER.x + 84, 96, `−${amount}%`, { fontFamily: 'VT323', fontSize: '28px', color })
      .setOrigin(0.5)
      .setDepth(15);
    this.tweens.add({ targets: label, y: 70, alpha: 0, duration: 900, onComplete: () => label.destroy() });
  }

  private sparkle(tint: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(CENTER.x, CENTER.y, 't_px').setTint(tint).setDepth(12).setScale(1 + Math.random() * 2);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 70;
      this.tweens.add({
        targets: p,
        x: CENTER.x + Math.cos(angle) * dist,
        y: CENTER.y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 500 + Math.random() * 400,
        ease: 'Cubic.out',
        onComplete: () => p.destroy(),
      });
    }
  }

  private attackFx(damage: number): void {
    sfx.hit();
    this.tweens.add({ targets: this.corruptSprite, scale: 8.2, duration: 90, yoyo: true });
    this.cameras.main.shake(250, 0.012);
    const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff5252, 0.35).setOrigin(0).setDepth(18);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    const label = this.add
      .text(90, this.scale.height - 60, `−${damage}`, { fontFamily: 'VT323', fontSize: '26px', color: '#ff5252' })
      .setDepth(15);
    this.tweens.add({ targets: label, y: label.y - 24, alpha: 0, duration: 800, onComplete: () => label.destroy() });
    this.refreshBars();
  }
}
