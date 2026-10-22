import type { ItemId } from './content/items';

export interface GameState {
  name: string;
  hp: number;
  maxHp: number;
  coins: number;
  xp: number;
  items: Record<ItemId, number>;
  legends: string[];
  flags: Record<string, boolean>;
}

const KEY = 'langrpg.save.v1';

function fresh(): GameState {
  return {
    name: '',
    hp: 30,
    maxHp: 30,
    coins: 10,
    xp: 0,
    items: { churros: 0, paella: 0 },
    legends: [],
    flags: {},
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

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode etc.: progress lasts for this session only.
  }
}

export function resetState(): void {
  Object.assign(state, fresh());
  save();
}

export function level(): number {
  return 1 + Math.floor(state.xp / 100);
}
