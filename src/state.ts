import type { ItemId } from './content/items';

export type CountryId = 'spain' | 'japan' | 'france' | 'mexico' | 'germany';

export interface GameState {
  name: string;
  /** The country the story is locked to until its Heart Legend is restored. */
  country: CountryId | null;
  hp: number;
  maxHp: number;
  coins: number;
  xp: number;
  items: Record<ItemId, number>;
  legends: string[];
  flags: Record<string, boolean>;
  /** Milliseconds since epoch; used to pick the newer of the local and cloud saves. */
  updatedAt: number;
}

const KEY = 'zaban.save.v2';

function fresh(): GameState {
  return {
    name: '',
    country: null,
    hp: 30,
    maxHp: 30,
    coins: 10,
    xp: 0,
    items: { churros: 0, paella: 0 },
    legends: [],
    flags: {},
    updatedAt: 0,
  };
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return fresh();
}

export const state: GameState = load();

/** Called after every save (the cloud sync registers here). */
export const saveListeners: Array<() => void> = [];

export function save(): void {
  state.updatedAt = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode etc.: progress lasts for this session only.
  }
  saveListeners.forEach((fn) => fn());
}

/** Replace the whole save (e.g. with a newer one from the cloud) without notifying listeners. */
export function replaceState(next: Partial<GameState>): void {
  Object.assign(state, fresh(), next);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function resetState(): void {
  Object.assign(state, fresh());
  save();
}

export function hasStory(): boolean {
  return !!state.flags.opening;
}

export function level(): number {
  return 1 + Math.floor(state.xp / 100);
}
