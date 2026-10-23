import type { ItemId } from './content/items';

export type CountryId = 'spain' | 'japan' | 'france' | 'mexico' | 'germany';

export interface ChatLog {
  npcId: string;
  name: string;
  at: number;
  lines: { speaker: 'npc' | 'player' | 'omni'; text: string; gloss?: string }[];
}

export interface Phrase {
  text: string;
  /** What it means or when to use it, in English. */
  meaning: string;
  /** Where you picked it up, e.g. "Carmen's stall" or "Correction". */
  source: string;
  at: number;
}

export interface GameState {
  name: string;
  /** The country the story is locked to until its Heart Legend is restored. */
  country: CountryId | null;
  /** VOICE in the UI: how many words you have left before ANTI's static silences you. */
  hp: number;
  maxHp: number;
  coins: number;
  xp: number;
  items: Record<ItemId, number>;
  legends: string[];
  /** Characters whose number is in your phone (for calls in battle). */
  contacts: string[];
  /** Good exchanges with each character so far (some only give their number after a few). */
  rapport: Record<string, number>;
  chats: ChatLog[];
  phrasebook: Phrase[];
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
    contacts: [],
    rapport: {},
    chats: [],
    phrasebook: [],
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

/** Rough CEFR estimate from level, used to pitch AI characters at the player. */
export function cefr(): string {
  const lv = level();
  return lv <= 2 ? 'A1' : lv <= 5 ? 'A2' : lv <= 9 ? 'B1' : lv <= 14 ? 'B2' : 'C1';
}

export function addContact(id: string): void {
  if (!state.contacts.includes(id)) state.contacts.push(id);
}

/** Save a phrase to the phone's phrasebook (newest first, no duplicates). */
export function learnPhrase(text: string, meaning: string, source: string): void {
  const clean = text.trim();
  if (!clean) return;
  state.phrasebook = [
    { text: clean, meaning, source, at: Date.now() },
    ...state.phrasebook.filter((p) => p.text.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, 300);
}

export function logChat(log: ChatLog): void {
  if (log.lines.length < 2) return;
  state.chats = [log, ...state.chats].slice(0, 20);
}
