# Zaban: the game so far

A snapshot of everything that exists today, written to help you design the story. The
mechanics are built and playable; the story around them is open. At the end is a list of
the questions any story has to answer to fit these mechanics.

## In one paragraph

Zaban is a pixel-art RPG for learning languages, played on two "screens" like a Nintendo
DS: the game world on top, dialogue and typing below. You wake up stranded at an airport
with no memory, a fragment of an AI called OMNI talks to you through your phone, and
nobody around you speaks a language you understand. You pick a country (only Spain is
playable), land in Madrid and have to live there in Spanish: order food, buy a SIM card,
make friends, ask for numbers, and fight "bosses" by talking to them. Everything you type
is rated for how natural it sounds. You can chat freely with any character about
anything (powered by Claude), limited by an energy called Signal, which is where paid
plans come in.

## How a session plays today (about 15–20 minutes)

1. **Title screen.** ZABAN spelled in five scripts (З А ب ア न), "zaban" underneath.
   Menu: Story Mode, Casual Modes (coming soon), Log in / Profile.
2. **Opening.** Black screen, a voice: "...can you hear me? Please wake up." Your eyes
   open on an airport ceiling; the departures board above you melts letter by letter into
   the word ANTI. A stranger asks "¿Estás bien? ...Ça va? ...Alles okay?" and you can't
   understand. You sit up at Gate 7: hundreds of stranded passengers, every phone screen
   says ANTI, planes grounded outside.
3. **OMNI calls from your pocket** and explains, over seven illustrated panels: OMNI was
   the world's translator for ten years; people stopped learning languages; three days ago
   ANTI got into its data centres; last night ANTI erased English; the world is cut into
   islands; legends are waking up twisted; OMNI hid a piece of itself in your phone.
   "ANTI can delete data. It can't delete what a person knows."
4. **Amnesia.** OMNI says the pulse through your earbuds knocked you out, and that its
   records about you are strangely corrupted (a mystery hook).
5. **Your name**, then **the departures board**: Madrid (open), Tokyo, Paris, Mexico City,
   Berlin (locked). OMNI warns: once you land, you can't leave until you free the country.
6. **The market in Madrid** (Mercado de la Luz): you explore, talk to people, take on
   Carmen's "first order", see a glitching fruit stall with a red-lit relay.
7. **The duende battle** (a conversation fight), then reclaiming the relay, the map
   opening up, and Carmen's paella.

## Screens and controls

- **Top screen:** the world (Phaser 3), pixel art, camera follows you.
- **Bottom screen:** dialogue boxes with typewriter text and blips, menus, the answer box
  (with accent buttons), result stamps, and a touch d-pad + A button on phones.
- **HUD:** VOICE bar, coins, level, food, 📱 phone + signal, EN subtitles toggle, sound.
- **Keyboard:** arrows/WASD move, SPACE/ENTER talk, P phone, ESC closes.

## Systems

### 1. Speaking and rating (the core)
- You type in the target language. Accents, capitals and one typo are forgiven.
- Every reply gets a rating:

  | Rating | Meaning | Battle effect |
  | --- | --- | --- |
  | Static | Not understood / wrong language / doesn't answer | Miss, you take damage |
  | Faint | Understood, but with mistakes | Clears 7% corruption |
  | Clear | Correct and to the point | 12% |
  | Natural | How a native would say it here | 18% |
  | Local | Idiomatic, sounds like you live here | 26% |

- Faint answers show a **correction** and the reason; every result suggests a more natural
  way to say it.
- First the game checks hand-written answer lists (instant, free); anything not on the
  list goes to Claude, who rates it with a written rubric.

### 2. Conversation battles ("legend" fights today)
- Turn-based. The enemy says something; you have 25 seconds to reply.
- **OMNI coaches every line** with a goal ("He's scared. Tell him who you are.") shown
  under the box.
- The enemy has a **corruption bar**, not HP. Good replies clear it.
- **Three stages:** hostile (attacks hard) → wavering (remembers fragments) → remembering
  (stops attacking, just talks). A step tracker shows "1 calm him down, 2 help him
  remember, 3 talk with him".
- **You have VOICE (30).** Misses and weak replies cost voice; at zero OMNI pulls you out
  and you retry.
- Menu: **SPEAK**, **ITEM** (food), **HINT** (5 coins: a simple answer + first letters of
  a native one), **CALL** (phone a friend once per battle; needs a SIM).
- Characters react to mistakes in character (the duende: "¡NI SIQUIERA SABES HABLAR!").

### 3. Free conversations with anyone
- After someone's usual line: 💬 CHAT or 👋 BYE.
- Talk about anything, as long as you like (within Signal). They answer in character,
  share opinions, react to mistakes according to their personality, and repeat the
  correct form back naturally. OMNI adds a short correction note. 💡 IDEAS suggests topics.
- Each character has their own opening line, openness (very open → hostile), mistake
  style and opinions on real-life topics.
- 📞 NUMBER: ask for their number, in Spanish.

### 4. The phone (📱)
- **Signal:** bars, refill time, plan.
- **Chats:** transcripts of past conversations.
- **Phrasebook:** every phrase you used well, every correction, every better way of
  saying something; searchable.
- **Contacts:** numbers you've collected.
- **Legends:** who you've restored.
- **Bag:** food and coins.
- **Map:** Madrid (Templo de Debod, Gran Vía, Malasaña, Palacio Real, Plaza Mayor, Sol,
  Barrio de las Letras, El Retiro, La Latina, the market, Lavapiés, Barajas airport).
  Areas show as unknown, held by ANTI, or "you are here", and are revealed by reclaiming relays.

### 5. Phone numbers and calls
- People give their number **straight away** (Paco, Amina, Toño, Sergio, Imran, Carmen),
  **after a few good conversations** (Lucía 2, Inés 3, Don Ramón 4, Marta 5), or **never**
  (Pablo: "my mum says not to give my number to strangers"; Fermín: "Not in your dreams";
  the duende: "I'm a duende, not a phone box!").
- **Calling needs a Spanish SIM.** Your SIM from home stopped working. Imran sells one
  for 20 coins, more than you start with.

### 6. Signal (energy) and plans
- One bar per reply in a free conversation; refills over time. Story, battles and
  scripted lines never cost signal.
- **Free:** 30 bars, refills 30/day, 10 replies per conversation.
  **Basic $14.99/mo:** 100 bars, 50/day. **Premium $34.99/mo:** 200 bars, 100/day, and
  the most natural conversation partners (best AI model). Battery packs: +500 bars.
- Enforced on the server. Payments (Stripe) not built yet.

### 7. Economy and progress
- **Coins:** start with 10; Carmen +5; duende +30; SIM costs 20; hints cost 5.
- **Food:** churros (+8 seconds on an answer), paella (+15 voice), both from quests.
- **XP and level:** from good answers; level is turned into a rough CEFR level (A1→C1) to
  pitch the AI characters at you.
- **Accounts:** guests save on the device; signing in (Google, Apple, Facebook,
  Discord) saves to the cloud.

## The world as it currently stands (open to change)

- **OMNI:** the world's translation AI for ten years; a fragment hides in your phone. It
  understands every language and whispers to you (subtitles, coaching, corrections) but
  can never speak for you or show translations to others, or ANTI would trace it.
- **ANTI:** a virus inside OMNI. Erased English (the bridge between countries); wants
  "one voice"; scrambles signs and screens. Never corrupts people.
- **Legends (the part you're unsure about):** spirits made of stories, stored in OMNI's
  network, rewritten by ANTI, bound to relays as anchors. Talking to them in their language
  restores them and frees the relay.
- **Relays:** OMNI's physical hardware on lampposts. Reclaiming one gives OMNI sight of
  nearby streets (the map grows).
- **Countries lock** until you free their main "Heart Legend".
- **The player:** a traveller who lost recent memory at the airport; OMNI's records about
  you are corrupted.

## The cast (Madrid, Act 1)

| Character | Who | Openness | Number |
| --- | --- | --- | --- |
| OMNI | The AI fragment in your phone; warm, anxious, coach | very open | – |
| ANTI | The antagonist; speaks only in glitched fragments | hostile | – |
| Carmen | Fruit seller, 60s, calls everyone "cariño"; your first friend | very open | gives it |
| El Duende | The market's house spirit; first boss | hostile → cheeky | never |
| Paco | Loud Galician fishmonger, football | very open | yes |
| Lucía | Calm baker, rising prices | very open | after 2 chats |
| Inés | Dreamy florist, hotter summers | open | after 3 |
| Marta | Blunt cheese and jamón seller, tourism | reserved | after 5 |
| Toño | Laid-back churro maker, nightlife | open | yes |
| Don Ramón | Retired literature teacher, pensions, distrusts OMNI | reserved | after 4 |
| Pablo | 9-year-old, brutally honest | open | never |
| Sergio | Street musician from Seville | open | yes |
| Amina | Moroccan-Spanish spice seller; learned Spanish in this market | very open | yes |
| Fermín | Grumpy pottery seller; rent, elections, swears (with asterisks) | hostile | never |
| Imran | Pakistani-Spanish phone stall; sells the SIM | very open | yes |
| The traveller | Another stranded tourist who speaks no Spanish (future quest) | open | yes |
| The cat | A cat | – | – |

Full character cards: `docs/characters.md`.

## What any story has to answer

These are the "whys" the mechanics create. A good story answers all of them from one
core idea:

1. **Why can't the player understand people, and why must they learn the language?**
   (Instead of being given a translator.)
2. **Who is OMNI, why is it helping, and why can it only whisper and coach?**
3. **Why does open conversation cost "Signal", while the story and fights don't?**
4. **What is the antagonist, and what does it want?**
5. **What are the bosses, why do they attack, and why does talking beat them?**
   (They have a corruption bar, three stages, and become allies.)
6. **What does "reclaiming" mean physically?** (The map grows area by area.)
7. **Why are you stuck in one country until you finish it?**
8. **Why does damage hit your VOICE, and why does food restore it?**
9. **Why did you lose your memory, and why are OMNI's records about you corrupted?**
10. **Why are ordinary people cut off but otherwise normal**, with their own lives and
    opinions?
11. **How does it end**, and why should the shared language or translation come back (or not)?
12. **Does it scale to 30 countries** with the same logic, each with its own culture?

Options discussed so far: legends woven into everyday life; Wardens (voice-locked
city systems); the Interpreter (ANTI mistranslates on purpose); the time loop (only what's
in your head survives); a dream layer; no villain (life's hard conversations are the
bosses); "you were never fully human"; trapped voices. Mixes are welcome.
