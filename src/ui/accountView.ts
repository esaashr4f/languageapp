// Full-screen log-in and profile pages, layered over both "screens".

import { accountsEnabled, entitlement, flushSave, profile, signIn, signOut, type Provider } from '../account';
import { CREDIT_PACK_REPLIES, PLANS } from '../ai/plans';
import { sfx } from '../audio';
import { ITEMS, type ItemId } from '../content/items';
import { COUNTRIES } from '../content/countries';
import { level, state } from '../state';

const PROVIDERS: { id: Provider; label: string; badge: string; cls: string }[] = [
  { id: 'google', label: 'Continue with Google', badge: 'G', cls: 'google' },
  { id: 'apple', label: 'Continue with Apple', badge: 'A', cls: 'apple' },
  { id: 'facebook', label: 'Continue with Facebook', badge: 'f', cls: 'facebook' },
  { id: 'discord', label: 'Continue with Discord', badge: 'D', cls: 'discord' },
];

function overlay(): { root: HTMLElement; close: () => void; closed: Promise<void> } {
  const root = document.createElement('div');
  root.className = 'overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  document.getElementById('console')!.append(root);
  let done!: () => void;
  const closed = new Promise<void>((resolve) => (done = resolve));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  const close = () => {
    window.removeEventListener('keydown', onKey, true);
    root.remove();
    sfx.select();
    done();
  };
  window.addEventListener('keydown', onKey, true);
  return { root, close, closed };
}

export function openLogin(): Promise<void> {
  const { root, close, closed } = overlay();
  root.innerHTML = `
    <div class="sheet">
      <p class="eyebrow">ZABAN</p>
      <h2>Sign in</h2>
      <p class="muted">Save your journey to your account and pick it up on any device.</p>
      ${accountsEnabled ? '' : '<p class="warn">Sign-in isn\'t switched on for this build yet. You can still play as a guest; progress stays on this device.</p>'}
      <div class="providers"></div>
      <p class="error" hidden></p>
      <button class="link guest" type="button">Play as guest</button>
    </div>`;
  const list = root.querySelector('.providers')!;
  const error = root.querySelector<HTMLElement>('.error')!;
  for (const p of PROVIDERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `provider ${p.cls}`;
    b.disabled = !accountsEnabled;
    b.innerHTML = `<span class="badge">${p.badge}</span><span>${p.label}</span>`;
    b.onclick = async () => {
      sfx.confirm();
      try {
        await signIn(p.id); // Redirects to the provider and back.
      } catch (e) {
        error.textContent = e instanceof Error ? e.message : 'Sign-in failed. Please try again.';
        error.hidden = false;
      }
    };
    list.append(b);
  }
  root.querySelector<HTMLButtonElement>('.guest')!.onclick = close;
  root.querySelector<HTMLButtonElement>('.provider:not(:disabled), .guest')?.focus();
  return closed;
}

export function openProfile(): Promise<void> {
  const me = profile();
  const { root, close, closed } = overlay();
  if (!me) {
    close();
    return closed;
  }
  const country = state.country ? COUNTRIES.find((c) => c.id === state.country) : null;
  const avatar = me.avatarUrl
    ? `<img class="avatar" src="${encodeURI(me.avatarUrl)}" alt="" referrerpolicy="no-referrer">`
    : `<div class="avatar">${(me.name[0] ?? '?').toUpperCase()}</div>`;
  const dishes = (Object.keys(ITEMS) as ItemId[]).map((id) => `${ITEMS[id].icon} ${state.items[id]}`).join('  ');
  root.innerHTML = `
    <div class="sheet">
      <div class="who-card">
        ${avatar}
        <div>
          <h2></h2>
          <p class="muted email"></p>
          <p class="muted small">Signed in with ${me.provider}</p>
        </div>
      </div>
      <div class="stats-grid">
        <div><span>Traveller</span><b class="tname"></b></div>
        <div><span>Country</span><b>${country ? `${country.flag} ${country.city}` : 'Not chosen yet'}</b></div>
        <div><span>Spanish level</span><b>Lv ${level()}</b></div>
        <div><span>Legends restored</span><b>${state.legends.length}</b></div>
        <div><span>Coins</span><b>🪙 ${state.coins}</b></div>
        <div><span>Food bag</span><b>${dishes}</b></div>
      </div>
      <div class="plan-card">
        <span>Plan</span>
        <b class="plan-name">…</b>
        <p class="muted small plan-detail"></p>
        <button class="btn upgrade" type="button" disabled>UPGRADE TO ZABAN+ · SOON</button>
      </div>
      <div class="row">
        <button class="btn back" type="button">BACK</button>
        <button class="link signout" type="button">Sign out</button>
      </div>
    </div>`;
  // User-provided strings go in as text, never HTML.
  root.querySelector('h2')!.textContent = me.name;
  root.querySelector('.email')!.textContent = me.email;
  root.querySelector('.tname')!.textContent = state.name || '—';
  void entitlement().then((e) => {
    if (!e) return;
    const plan = PLANS[e.plan];
    const left = Math.max(0, plan.replies - e.replies_used);
    root.querySelector('.plan-name')!.textContent = plan.label;
    root.querySelector('.plan-detail')!.textContent =
      `Conversations: ${plan.replies} replies per ${plan.period}` +
      ` (${left} left${e.credits ? ` + ${e.credits} credits` : ''}). ` +
      (e.plan === 'free'
        ? 'Zaban+ lets you talk for much longer.'
        : `Need more? Credit packs add ${CREDIT_PACK_REPLIES} replies.`);
  });
  root.querySelector<HTMLButtonElement>('.back')!.onclick = close;
  root.querySelector<HTMLButtonElement>('.signout')!.onclick = async () => {
    await flushSave();
    await signOut();
    close();
  };
  root.querySelector<HTMLButtonElement>('.back')!.focus();
  return closed;
}
