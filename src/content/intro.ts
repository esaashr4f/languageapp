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
  { text: 'Bright lights. A ceiling. One of the lights keeps flickering, like it can\'t decide.' },
  { text: 'Above you hangs a departures board. As you watch, every line melts into the same red word.' },
];

export const STRANGER: Line[] = [
  { text: 'A face leans over you.' },
  { who: 'npc', name: '???', text: '¿Estás bien? ...Ça va ? ...Alles okay? ...Tudo bem?' },
  { who: 'self', text: "(I... I can't understand a word.)" },
  { text: 'The stranger gives up, shaking their head, and hurries away.' },
];

export const SIT_UP: Line[] = [
  { who: 'self', text: '(Where am I? I remember the plane landing... and then nothing.)' },
  { text: "You sit up. You're on the floor of an airport terminal, by Gate 7." },
  { text: 'Hundreds of people, all staring at their phones. Every screen shows the same thing.' },
  { text: 'An announcement starts on the speakers, in four languages at once... then dissolves into static.' },
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
      { who: 'omni', text: "You need to know something about this world. Legends are real. Spirits, heroes, monsters... they're made of the stories people tell about them." },
      { who: 'omni', text: 'For centuries those stories were told at kitchen tables, in their own languages. That kept the legends strong, and kept them themselves.' },
      { who: 'omni', text: 'Then everyone started asking me instead. For ten years, almost every story was told through me. The legends ended up living in my network.' },
      { who: 'omni', text: "So when ANTI got in, it could reach them. It's rewriting their stories, and they're waking up twisted. Angry. Not knowing who they are." },
    ],
  },
  {
    id: 'pocket',
    caption: 'YOUR POCKET',
    lines: [
      { who: 'omni', text: 'When ANTI struck, I broke off one tiny piece of myself and hid it in the nearest device. Your phone.' },
      { who: 'omni', text: "I can't translate anymore. But I found out one thing ANTI doesn't want anybody to know." },
      { who: 'omni', text: "ANTI can delete data. It can't delete what a person knows." },
      { who: 'omni', text: "It can't touch people, either. Nobody out there is corrupted. They're just cut off, like you." },
    ],
  },
];

export const AFTER_STORY: Line[] = [
  { who: 'omni', text: "And here's the thing. ANTI isn't in one place. It hides across the network, and it holds each country through its corrupted legends. They're its anchors. It feeds on their power." },
  { who: 'omni', text: "Every legend we bring back is an anchor ANTI loses. Free a country's greatest legend, its Heart Legend, and ANTI's grip on that country breaks." },
  { who: 'omni', text: 'Free enough countries, and ANTI has nowhere left to hide. Then we can reach it.' },
  { who: 'omni', text: "And there's only one way to fix a story: tell it again, in its own language, with living words. That's where you come in." },
  { who: 'self', text: "(...And me? Why can't I remember anything?)" },
  { who: 'omni', text: "You were wearing OMNI earbuds when ANTI's pulse went through the network. The feedback knocked you out cold, right here at the gate." },
  { who: 'omni', text: "Your memories should come back. My own records about you are... corrupted. That's strange. I'll keep digging." },
];

export const ASK_NAME = "Let's start with something ANTI can't touch. Do you remember your name?";

export const MISSION = (name: string): Line[] => [
  { who: 'omni', text: `${name}. Good. Hold on to that.` },
  { who: 'omni', text: "Here's the plan. We pick one country. We go there, you live there, and you learn to speak like a local. Ordering food, making friends, finding your way." },
  { who: 'omni', text: "And when ANTI's legends come for us, you talk them back to who they really are, one by one, until we reach the Heart Legend." },
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
