// The phone: OMNI lives here. Signal, past chats, phrasebook, contacts, legends, bag and
// the map of Madrid. Opened with the 📱 button (or P while exploring).

import { fetchSignal, lastQuota, signalLabel } from '../ai/client';
import { PLANS } from '../ai/plans';
import { sfx } from '../audio';
import { CHARACTERS } from '../content/characters';
import { ITEMS, type ItemId } from '../content/items';
import { areaStatus, MADRID } from '../content/spain/madrid';
import { state } from '../state';

type App = 'home' | 'signal' | 'chats' | 'phrasebook' | 'contacts' | 'legends' | 'bag' | 'map';

const APPS: { id: Exclude<App, 'home'>; icon: string; label: string }[] = [
  { id: 'signal', icon: '📶', label: 'Signal' },
  { id: 'chats', icon: '💬', label: 'Chats' },
  { id: 'phrasebook', icon: '📖', label: 'Phrasebook' },
  { id: 'map', icon: '🗺️', label: 'Map' },
  { id: 'contacts', icon: '👥', label: 'Contacts' },
  { id: 'legends', icon: '✨', label: 'Legends' },
  { id: 'bag', icon: '🎒', label: 'Bag' },
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

let open = false;
export const phoneIsOpen = (): boolean => open;

export function openPhone(start: App = 'home'): Promise<void> {
  if (open) return Promise.resolve();
  open = true;
  sfx.select();
  const overlay = el('div', 'overlay phone-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Phone');
  const phone = el('div', 'phone');
  const status = el('div', 'phone-status');
  const screen = el('div', 'phone-screen');
  const home = el('button', 'phone-home', '');
  home.setAttribute('aria-label', 'Close phone');
  phone.append(status, screen, home);
  overlay.append(phone);
  document.getElementById('console')!.append(overlay);

  let done!: () => void;
  const closed = new Promise<void>((resolve) => (done = resolve));
  const close = () => {
    window.removeEventListener('keydown', onKey, true);
    overlay.remove();
    open = false;
    sfx.select();
    done();
  };
  let current: App = start;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || (e.key.toLowerCase() === 'p' && (e.target as HTMLElement).tagName !== 'INPUT')) {
      e.preventDefault();
      e.stopPropagation();
      if (current === 'home') close();
      else show('home');
    }
  };
  window.addEventListener('keydown', onKey, true);
  home.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  const renderStatus = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    status.textContent = '';
    status.append(el('span', '', time), el('span', '', 'OMNI'), el('span', '', signalLabel()));
  };

  const header = (title: string) => {
    const bar = el('div', 'app-bar');
    const back = el('button', 'app-back', '◀');
    back.setAttribute('aria-label', 'Back');
    back.onclick = () => show('home');
    bar.append(back, el('h3', '', title));
    return bar;
  };

  const show = (app: App) => {
    current = app;
    renderStatus();
    screen.replaceChildren();
    if (app === 'home') {
      const omni = el('div', 'omni-face');
      omni.append(el('span', 'eyes', '▮ ▮'), el('span', 'mouth', '‿'));
      const hello = el('p', 'muted small', state.name ? `Hi, ${state.name}. What do you need?` : 'Hi. What do you need?');
      const grid = el('div', 'app-grid');
      for (const a of APPS) {
        const b = el('button', 'app-icon');
        b.append(el('span', 'icon', a.icon), el('span', 'label', a.label));
        b.onclick = () => show(a.id);
        grid.append(b);
      }
      screen.append(omni, hello, grid);
      grid.querySelector('button')?.focus();
      return;
    }
    const title = APPS.find((a) => a.id === app)!.label;
    screen.append(header(title));
    const body = el('div', 'app-body');
    screen.append(body);
    renderApp(app, body, renderStatus);
  };

  show(start);
  return closed;
}

function empty(text: string): HTMLElement {
  return el('p', 'muted small empty', text);
}

function renderApp(app: App, body: HTMLElement, refreshStatus: () => void): void {
  switch (app) {
    case 'signal': {
      const draw = () => {
        body.replaceChildren();
        const q = lastQuota;
        const bars = el('div', 'signal-bars');
        const ratio = q ? Math.min(1, (q.signal + q.credits) / q.capacity) : 0;
        for (let i = 0; i < 5; i++) {
          const bar = el('i');
          bar.style.height = `${12 + i * 10}px`;
          if (ratio > i / 5) bar.classList.add('on');
          bars.append(bar);
        }
        body.append(bars, el('p', 'big', signalLabel(q)));
        if (q) {
          const plan = PLANS[q.plan];
          body.append(el('p', 'muted small', `${plan.label} plan: ${plan.capacity} bars, refilling ${plan.perDay} a day.`));
        } else {
          body.append(el('p', 'muted small', 'Sign in to use conversations and see your signal.'));
        }
        body.append(
          el('p', 'small', 'Every reply in a free conversation uses one bar. Story, battles and scripted chats never do.'),
          el('p', 'muted small', '"Scripted things I already have on your phone. Open conversations I have to work out live through the network, and that\'s what ANTI can trace. So I ration it, and it refills as the trail goes cold." OMNI'),
        );
        const row = el('div', 'row');
        const up = el('button', 'btn', 'UPGRADE · SOON');
        up.disabled = true;
        const pack = el('button', 'btn', 'BATTERY PACK · SOON');
        pack.disabled = true;
        row.append(up, pack);
        body.append(row);
      };
      draw();
      void fetchSignal().then(() => {
        draw();
        refreshStatus();
      });
      return;
    }

    case 'chats': {
      if (!state.chats.length) return void body.append(empty('No conversations yet. Talk to someone and choose CHAT.'));
      for (const chat of state.chats) {
        const b = el('button', 'list-item');
        const last = chat.lines[chat.lines.length - 1];
        b.append(el('b', '', chat.name), el('small', '', `${new Date(chat.at).toLocaleDateString()} · ${last?.text ?? ''}`));
        b.onclick = () => {
          body.replaceChildren();
          const back = el('button', 'link', '← All chats');
          back.onclick = () => {
            body.replaceChildren();
            renderApp('chats', body, refreshStatus);
          };
          body.append(back);
          for (const line of chat.lines) {
            const bubble = el('div', `bubble ${line.speaker}`);
            bubble.append(el('span', '', line.text));
            if (line.gloss) bubble.append(el('small', '', line.gloss));
            body.append(bubble);
          }
        };
        body.append(b);
      }
      return;
    }

    case 'phrasebook': {
      if (!state.phrasebook.length) return void body.append(empty('Phrases you use well, corrections and new ways of saying things collect here.'));
      const search = el('input', 'search');
      search.placeholder = 'Search…';
      const list = el('div');
      const draw = () => {
        list.replaceChildren();
        const q = search.value.toLowerCase();
        for (const p of state.phrasebook.filter((p) => !q || p.text.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q))) {
          const item = el('div', 'list-item');
          item.append(el('b', '', p.text), el('small', '', `${p.meaning} · ${p.source}`));
          list.append(item);
        }
      };
      search.oninput = draw;
      body.append(search, list);
      draw();
      return;
    }

    case 'contacts': {
      if (!state.contacts.length) return void body.append(empty('Nobody yet. Meet people and their numbers will show up here.'));
      body.append(el('p', 'muted small', state.flags.sim ? 'In a battle, use CALL once to ask a contact for help.' : 'No Spanish SIM yet, so no calls. Imran sells them at the MÓVILES stall.'));
      for (const id of state.contacts) {
        const c = CHARACTERS[id];
        if (!c) continue;
        const item = el('div', 'list-item');
        item.append(el('b', '', c.name), el('small', '', c.role));
        body.append(item);
      }
      return;
    }

    case 'legends': {
      if (!state.legends.length) body.append(empty('No legends restored yet.'));
      for (const id of state.legends) {
        const c = CHARACTERS[id];
        if (!c) continue;
        const item = el('div', 'list-item');
        item.append(el('b', '', `✨ ${c.name}`), el('small', '', 'Anchored in you. ANTI can\'t reach this one anymore.'));
        body.append(item);
      }
      body.append(el('p', 'muted small', 'Every legend you restore is an anchor ANTI loses.'));
      return;
    }

    case 'bag': {
      for (const id of Object.keys(ITEMS) as ItemId[]) {
        const item = el('div', 'list-item');
        item.append(el('b', '', `${ITEMS[id].icon} ${ITEMS[id].name} ×${state.items[id]}`), el('small', '', ITEMS[id].desc));
        body.append(item);
      }
      body.append(el('p', 'muted small', `🪙 ${state.coins} coins`));
      return;
    }

    case 'map': {
      const grid = el('div', 'map-grid');
      let selected: HTMLElement | null = null;
      const info = el('p', 'small map-info', 'Tap an area.');
      for (const area of MADRID) {
        const status = areaStatus(area, state);
        const cell = el('button', `map-cell ${status}`);
        cell.style.gridColumn = `${area.col + 1} / span ${area.w ?? 1}`;
        cell.style.gridRow = `${area.row + 1} / span ${area.h ?? 1}`;
        cell.textContent = status === 'unknown' ? '???' : area.name;
        cell.onclick = () => {
          selected?.classList.remove('sel');
          cell.classList.add('sel');
          selected = cell;
          info.textContent =
            status === 'unknown'
              ? 'OMNI can\'t see this area yet. Reclaim a relay nearby.'
              : status === 'static'
                ? `${area.name}: ANTI is holding this area. (Coming in the next chapter.)`
                : `${area.name}: ${area.blurb}`;
        };
        grid.append(cell);
      }
      body.append(el('p', 'muted small', 'MADRID'), grid, info);
      return;
    }

    case 'home':
      return;
  }
}
