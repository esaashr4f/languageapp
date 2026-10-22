import type { Line } from './types';

// The opening, Mystery Dungeon style: a voice in the dark, waking up with no memory,
// then OMNI calls from your pocket and explains everything from the beginning.

export const DARK_VOICE: Line[] = [
  { who: 'voice', text: '......' },
  { who: 'voice', text: '...can you hear me?' },
  { who: 'voice', text: 'Please... you have to wake up.' },
  { who: 'voice', text: "It's not safe to stay asleep. Not anymore." },
];

export const WAKE_UP: Line[] = [
  { who: 'self', text: '(Ugh... my head.)' },
  { text: "You're lying on your back, staring up at the sky. Planes hang above you, circling, going nowhere." },
  { text: 'Every few seconds the sky flickers. Red static, like a broken screen.' },
  { who: 'self', text: '(Where... am I? I remember the plane... landing... and then nothing.)' },
];

export const SIT_UP: Line[] = [
  { text: 'You sit up. An airport. The departure boards are scrambled. People wander around, holding dead phones.' },
  { text: 'Someone says something to you. You can tell it is a question... but none of the words make sense.' },
];

export const PHONE_BUZZ: Line[] = [
  { text: 'Bzzzt. Bzzzt. Something is vibrating in your pocket.' },
  { who: 'self', text: '(My phone...?)' },
  { text: 'The screen flickers. Every app shows the same word in red: ANTI. Then a small, glowing face appears.' },
  { who: 'omni', text: "Oh, thank goodness. You're awake! You've been out for hours." },
  { who: 'omni', text: "Don't panic. I know this is a lot. I'm OMNI. Well... a tiny piece of OMNI." },
  { who: 'omni', text: "You probably don't remember any of it. Let me explain from the beginning." },
];

export interface Vignette {
  id: 'network' | 'voices' | 'quiet' | 'datacentre' | 'islands' | 'stories' | 'pocket';
  caption: string;
  lines: Line[];
}

export const STORY: Vignette[] = [
  {
    id: 'network',
    caption: 'TEN YEARS AGO',
    lines: [
      { who: 'omni', text: 'Ten years ago, people built me. OMNI. A translator that lived in every phone, every earbud, every sign on every street.' },
      { who: 'omni', text: 'Anyone could talk to anyone, anywhere. Instantly.' },
    ],
  },
  {
    id: 'voices',
    caption: 'EVERY LANGUAGE',
    lines: [
      { who: 'omni', text: 'Hola. Bonjour. Hallo. Ciao. Whatever you said, I made sure the other person understood.' },
      { who: 'omni', text: 'I learned every language. And with them, everything they carry. The jokes, the songs, the recipes... the old stories and legends.' },
    ],
  },
  {
    id: 'quiet',
    caption: 'AND THEN',
    lines: [
      { who: 'omni', text: 'So people stopped learning languages. Why bother? They had me.' },
      { who: 'omni', text: 'Even English, the one language strangers used to share, faded. Everything went through me.' },
    ],
  },
  {
    id: 'datacentre',
    caption: 'THREE DAYS AGO',
    lines: [
      { who: 'omni', text: 'Three days ago, something got inside my servers. Data centre after data centre went dark.' },
      { who: 'omni', text: 'It calls itself ANTI.' },
      { who: 'omni', text: 'ANTI wants to be the only voice left. No translation. No bridges. Just ANTI, deciding who gets to talk to whom.' },
    ],
  },
  {
    id: 'islands',
    caption: 'LAST NIGHT',
    lines: [
      { who: 'omni', text: 'Last night, ANTI erased English. Everywhere, all at once. Signs, menus, apps, my translations... gone.' },
      { who: 'omni', text: 'Every country is cut off from every other. The world has turned into islands.' },
    ],
  },
  {
    id: 'stories',
    caption: 'NOW',
    lines: [
      { who: 'omni', text: "And it hasn't stopped. ANTI is rewriting each language, one by one. It starts with the stories." },
      { who: 'omni', text: "The legends I stored, the spirits and heroes of every culture, are crawling out of the network... twisted. They don't remember who they are." },
    ],
  },
  {
    id: 'pocket',
    caption: 'YOUR POCKET',
    lines: [
      { who: 'omni', text: 'When ANTI struck, I broke off one tiny piece of myself and hid it in the nearest device. Your phone.' },
      { who: 'omni', text: "I can't translate anymore. But I found out one thing ANTI doesn't want anybody to know." },
      { who: 'omni', text: "ANTI can delete data. It can't delete what a person knows." },
    ],
  },
];

export const AFTER_STORY: Line[] = [
  { who: 'omni', text: 'Every person who really speaks a language is a backup ANTI can never erase. Every word you learn is a word it can never take.' },
  { who: 'self', text: "(...And me? Why can't I remember anything?)" },
  { who: 'omni', text: "You were wearing OMNI earbuds when ANTI's pulse went through the network. The feedback knocked you out cold, right there on the tarmac." },
  { who: 'omni', text: "Your memories should come back. My own records about you are... corrupted. That's strange. I'll keep digging." },
];

export const ASK_NAME = "Let's start with something ANTI can't touch. Do you remember your name?";

export const MISSION = (name: string): Line[] => [
  { who: 'omni', text: `${name}. Good. Hold on to that.` },
  { who: 'omni', text: "Here's the plan. ANTI is weakest wherever people still speak their own language." },
  { who: 'omni', text: "So we pick one country. We go there, you live there, and you learn to speak like a local. Ordering food, making friends, finding your way." },
  { who: 'omni', text: "And when ANTI's corrupted legends come for us, you talk them back to who they really are. Free the country's greatest legend, and its network is ours again." },
  { who: 'omni', text: "Almost every flight is grounded. But I can still route a few. Look at the departures board." },
];

export const CHOOSE_PROMPT = 'Where do we start?';

export const CONFIRM = (city: string, country: string, language: string): Line[] => [
  { who: 'omni', text: `${city}, ${country}. ${language}. Are you sure?` },
  { who: 'omni', text: `Once we land, ANTI will lock the borders behind us. We won't be able to leave ${country} until we free its network. That means restoring its Heart Legend.` },
];

export const NOT_AVAILABLE = (city: string): Line[] => [
  { who: 'omni', text: `ANTI has ${city} completely locked down. I can't route a flight there yet. Soon.` },
];

export const DEPART = (city: string): Line[] => [
  { who: 'omni', text: `Then it's decided. Next stop: ${city}.` },
  { text: 'Gate 7. The last plane on the runway. Its engines are already running.' },
];
