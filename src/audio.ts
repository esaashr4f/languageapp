// Tiny chiptune-style effects with WebAudio, so the prototype needs no audio files.

let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem('langrpg.muted') === '1';
  } catch {
    return false;
  }
}

function audio(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.035, delay = 0): void {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const sfx = {
  blip: (pitch: number) => tone(pitch, 0.03, 'square', 0.02),
  select: () => tone(660, 0.05),
  move: () => tone(440, 0.03, 'triangle', 0.03),
  confirm: () => {
    tone(880, 0.06);
    tone(1320, 0.08, 'square', 0.035, 0.06);
  },
  /** Rising arpeggio; longer for better tiers. */
  tier: (rank: number) => {
    const notes = [523, 659, 784, 1047, 1319, 1568];
    for (let i = 0; i <= rank; i++) tone(notes[i], 0.09, 'square', 0.035, i * 0.06);
  },
  hit: () => {
    tone(140, 0.18, 'sawtooth', 0.05);
    tone(90, 0.22, 'square', 0.04, 0.04);
  },
  miss: () => tone(180, 0.25, 'sawtooth', 0.04),
  glitch: () => {
    for (let i = 0; i < 5; i++) tone(200 + Math.random() * 900, 0.03, 'square', 0.02, i * 0.03);
  },
  buzz: () => {
    for (let i = 0; i < 2; i++) tone(70, 0.18, 'sawtooth', 0.05, i * 0.28);
  },
  restore: () => {
    [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.14, 'triangle', 0.05, i * 0.09));
  },
};

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem('langrpg.muted', value ? '1' : '0');
  } catch {
    // ignore
  }
}
