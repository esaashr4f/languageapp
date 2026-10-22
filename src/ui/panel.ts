// The bottom screen: dialogue boxes, menus, the answer input and the HUD.
// Plain DOM so text stays crisp at any size and works with phone keyboards / IMEs.

import { isMuted, setMuted, sfx } from '../audio';
import { ITEMS, type ItemId } from '../content/items';
import type { Line, SpeakerId } from '../content/types';
import { tierById, type TierId } from '../engine/tiers';
import { level, state } from '../state';

const SPEAKERS: Record<SpeakerId, { name: string; color: string; pitch: number }> = {
  omni: { name: 'OMNI', color: '#59c8ff', pitch: 880 },
  carmen: { name: 'CARMEN', color: '#ffc247', pitch: 520 },
  duende: { name: 'DUENDE', color: '#7cf5b0', pitch: 700 },
  corrupt: { name: '???', color: '#ff5252', pitch: 170 },
  system: { name: '', color: '#f1ecff', pitch: 440 },
};

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Option {
  id: string;
  label: string;
  note?: string;
  disabled?: boolean;
}

export interface AskOpts {
  who?: SpeakerId;
  line: string;
  gloss?: string;
  timerSec?: number;
  placeholder?: string;
  accents?: boolean;
}

export interface ResultView {
  tier: TierId | null;
  headline: string;
  detail?: string;
  better: string[];
}

const ADVANCE_KEYS = ['Enter', 'Space', 'KeyZ'];
const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function readPref(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // ignore
  }
}

class Panel {
  private hud!: HTMLElement;
  private body!: HTMLElement;
  private toastEl!: HTMLElement;
  private toastTimer = 0;

  /** True while a dialogue, menu or question is on screen. */
  busy = false;
  /** When the panel last became idle, so the key that closed a box doesn't also reopen one. */
  idleSince = 0;
  dpadDir: Dir | null = null;
  onA: (() => void) | null = null;
  showGloss = readPref('langrpg.gloss', true);

  mount(root: HTMLElement): void {
    root.innerHTML = '';
    this.hud = el('div', 'hud');
    this.body = el('div', 'body');
    this.toastEl = el('div', 'toast');
    this.toastEl.hidden = true;
    root.append(this.hud, this.body, this.toastEl);
    this.updateHud();
  }

  private begin(): void {
    this.busy = true;
  }

  private end(): void {
    this.busy = false;
    this.idleSince = performance.now();
  }

  private onKeys(handler: (e: KeyboardEvent) => void): () => void {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }

  // -------------------------------------------------------------------------
  // HUD

  updateHud(): void {
    if (!this.hud) return;
    this.hud.innerHTML = '';
    const stats = el('div', 'stats');
    const hpPct = Math.max(0, Math.round((state.hp / state.maxHp) * 100));
    stats.innerHTML =
      `<span class="hp"><b>HP</b> <i class="bar"><i style="width:${hpPct}%"></i></i> ${state.hp}/${state.maxHp}</span>` +
      `<span>🪙 ${state.coins}</span><span>ES Lv${level()}</span>` +
      (Object.keys(ITEMS) as ItemId[]).map((id) => `<span title="${ITEMS[id].name}">${ITEMS[id].icon}×${state.items[id]}</span>`).join('');
    const toggles = el('div', 'toggles');
    const gloss = el('button', 'chip' + (this.showGloss ? ' on' : ''), 'EN');
    gloss.title = 'English subtitles';
    gloss.onclick = () => {
      this.showGloss = !this.showGloss;
      writePref('langrpg.gloss', this.showGloss);
      this.updateHud();
    };
    const sound = el('button', 'chip' + (isMuted() ? '' : ' on'), '♪');
    sound.title = 'Sound';
    sound.onclick = () => {
      setMuted(!isMuted());
      this.updateHud();
    };
    toggles.append(gloss, sound);
    this.hud.append(stats, toggles);
  }

  toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toastEl.hidden = true), 2400);
  }

  // -------------------------------------------------------------------------
  // Dialogue

  async say(lines: Line[]): Promise<void> {
    this.begin();
    try {
      for (const line of lines) await this.sayOne(line);
    } finally {
      this.end();
    }
  }

  private box(who: SpeakerId | undefined): HTMLElement {
    const speaker = SPEAKERS[who ?? 'system'];
    const box = el('div', `box speaker-${who ?? 'system'}`);
    if (speaker.name) {
      const tag = el('div', 'who', speaker.name);
      tag.style.color = speaker.color;
      box.append(tag);
    }
    this.body.replaceChildren(box);
    return box;
  }

  private sayOne(line: Line): Promise<void> {
    return new Promise((resolve) => {
      const pitch = SPEAKERS[line.who ?? 'system'].pitch;
      const box = this.box(line.who);
      const text = el('p', 'text');
      const next = el('span', 'next', '▼');
      next.hidden = true;
      box.append(text);
      let gloss: HTMLElement | null = null;
      if (line.gloss && this.showGloss) {
        gloss = el('p', 'gloss', line.gloss);
        gloss.hidden = true;
        box.append(gloss);
      }
      box.append(next);

      const chars = [...line.text];
      let shown = 0;
      let done = false;
      const finish = () => {
        window.clearInterval(timer);
        text.textContent = line.text;
        if (gloss) gloss.hidden = false;
        next.hidden = false;
        done = true;
      };
      const timer = window.setInterval(() => {
        shown++;
        text.textContent = chars.slice(0, shown).join('');
        if (shown % 2 === 0 && chars[shown - 1] !== ' ') sfx.blip(pitch);
        if (shown >= chars.length) finish();
      }, 22);

      const advance = () => {
        if (!done) return finish();
        off();
        box.removeEventListener('click', advance);
        sfx.select();
        resolve();
      };
      const off = this.onKeys((e) => {
        if (!ADVANCE_KEYS.includes(e.code)) return;
        e.preventDefault();
        if (!e.repeat) advance();
      });
      box.addEventListener('click', advance);
    });
  }

  // -------------------------------------------------------------------------
  // Menus

  async choose(title: string, options: Option[], cols = 2): Promise<string> {
    this.begin();
    try {
      return await new Promise<string>((resolve) => {
        const box = this.box(undefined);
        if (title) box.append(el('p', 'text', title));
        const grid = el('div', 'menu');
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        const buttons = options.map((opt) => {
          const b = el('button', 'opt', opt.label);
          if (opt.note) b.append(el('small', '', opt.note));
          b.disabled = !!opt.disabled;
          grid.append(b);
          return b;
        });
        box.append(grid);

        let sel = options.findIndex((o) => !o.disabled);
        const render = () => buttons.forEach((b, i) => b.classList.toggle('sel', i === sel));
        render();

        const pick = (i: number) => {
          if (options[i].disabled) return;
          off();
          sfx.confirm();
          resolve(options[i].id);
        };
        const move = (delta: number) => {
          let i = sel;
          do i = (i + delta + options.length) % options.length;
          while (options[i].disabled && i !== sel);
          if (i !== sel) sfx.move();
          sel = i;
          render();
        };
        buttons.forEach((b, i) => {
          b.onclick = () => pick(i);
          b.onpointerenter = () => {
            if (!options[i].disabled) {
              sel = i;
              render();
            }
          };
        });
        const off = this.onKeys((e) => {
          const moves: Record<string, number> = {
            ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1, ArrowUp: -cols, KeyW: -cols, ArrowDown: cols, KeyS: cols,
          };
          if (e.code in moves) {
            e.preventDefault();
            move(moves[e.code]);
          } else if (ADVANCE_KEYS.includes(e.code) && !e.repeat) {
            e.preventDefault();
            pick(sel);
          }
        });
      });
    } finally {
      this.end();
    }
  }

  // -------------------------------------------------------------------------
  // Typed answers

  async ask(opts: AskOpts): Promise<string | null> {
    this.begin();
    try {
      return await new Promise<string | null>((resolve) => {
        const box = this.box(opts.who);
        box.classList.add('asking');
        box.append(el('p', 'text', opts.line));
        if (opts.gloss && this.showGloss) box.append(el('p', 'gloss', opts.gloss));

        let timeout = 0;
        if (opts.timerSec) {
          const bar = el('div', 'timer');
          const fill = el('i');
          fill.style.animationDuration = `${opts.timerSec}s`;
          bar.append(fill);
          box.append(bar);
          timeout = window.setTimeout(() => finish(null), opts.timerSec * 1000);
        }

        const form = el('form', 'answer');
        const input = el('input');
        Object.assign(input, {
          type: 'text', autocomplete: 'off', spellcheck: false, lang: 'es',
          placeholder: opts.placeholder ?? 'Escribe tu respuesta…',
        });
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('aria-label', 'Your answer');
        const submit = el('button', 'btn', 'SAY ▶');
        submit.type = 'submit';
        form.append(input, submit);
        box.append(form);

        if (opts.accents !== false) {
          const row = el('div', 'accents');
          for (const ch of ACCENTS) {
            const key = el('button', 'chip', ch);
            key.type = 'button';
            // Keep focus (and the phone keyboard) on the input.
            key.onpointerdown = (e) => e.preventDefault();
            key.onclick = () => {
              const start = input.selectionStart ?? input.value.length;
              const end = input.selectionEnd ?? input.value.length;
              input.setRangeText(ch, start, end, 'end');
              input.focus();
            };
            row.append(key);
          }
          box.append(row);
        }

        const finish = (value: string | null) => {
          window.clearTimeout(timeout);
          form.onsubmit = null;
          input.disabled = true;
          resolve(value);
        };
        form.onsubmit = (e) => {
          e.preventDefault();
          const value = input.value.trim();
          if (value) finish(value);
        };
        input.focus();
      });
    } finally {
      this.end();
    }
  }

  async result(view: ResultView): Promise<void> {
    this.begin();
    try {
      await new Promise<void>((resolve) => {
        const box = this.box(undefined);
        box.classList.add('result');
        const tier = view.tier ? tierById(view.tier) : null;
        const stamp = el('div', 'stamp', tier ? tier.label : 'No signal');
        stamp.style.setProperty('--tc', tier ? tier.color : '#ff5252');
        box.append(stamp, el('p', 'text', view.headline));
        if (view.detail) box.append(el('p', 'gloss', view.detail));
        if (view.better.length) {
          box.append(el('p', 'label', tier ? 'Even more natural:' : 'You could say:'));
          const list = el('ul', 'better');
          for (const b of view.better) list.append(el('li', '', b));
          box.append(list);
        }
        const next = el('span', 'next', '▼');
        box.append(next);

        // Ignore input for a moment so the Enter that submitted the answer doesn't skip this.
        const shownAt = performance.now();
        const advance = () => {
          if (performance.now() - shownAt < 350) return;
          off();
          box.removeEventListener('click', advance);
          sfx.select();
          resolve();
        };
        const off = this.onKeys((e) => {
          if (!ADVANCE_KEYS.includes(e.code)) return;
          e.preventDefault();
          if (!e.repeat) advance();
        });
        box.addEventListener('click', advance);
      });
    } finally {
      this.end();
    }
  }

  // -------------------------------------------------------------------------
  // Exploring: hint text plus a touch d-pad

  explore(hint: string): void {
    const wrap = el('div', 'explore');
    wrap.append(el('p', 'hint', hint));
    const pad = el('div', 'pad');
    const dirs: [Dir, string][] = [['up', '▲'], ['left', '◀'], ['right', '▶'], ['down', '▼']];
    for (const [dir, label] of dirs) {
      const b = el('button', `dpad dpad-${dir}`, label);
      b.setAttribute('aria-label', dir);
      const release = () => {
        if (this.dpadDir === dir) this.dpadDir = null;
      };
      b.onpointerdown = (e) => {
        e.preventDefault();
        this.dpadDir = dir;
      };
      b.onpointerup = release;
      b.onpointerleave = release;
      b.onpointercancel = release;
      pad.append(b);
    }
    const a = el('button', 'abtn', 'A');
    a.setAttribute('aria-label', 'Talk / interact');
    a.onclick = () => this.onA?.();
    pad.append(a);
    wrap.append(pad);
    this.body.replaceChildren(wrap);
  }
}

export const ui = new Panel();
