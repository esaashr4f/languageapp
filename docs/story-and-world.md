# BABEL — story and world

## The premise

Long ago the Tower of Babel reached the sky, and every language lived on its own floor.
Then **the Hush** came: a grey silence that eats words. Floors went quiet, people forgot
how to talk to their neighbours, and the Tower crumbled into scattered ruins.

You are a **Wayfinder**, one of the few people who can still hear the old words. Every
word, phrase and idiom you speak correctly relights a little of the Tower. The more
*natural* your answer, the brighter it burns: a phrasebook answer is a candle, a native
idiom is a lighthouse.

**Score = altitude.** Each daily climb takes you up the Tower; 7,000 m is the summit for
that day. Over weeks, your climbs rebuild floors permanently.

## Your companion: Pip

A small paper crane folded from dictionary pages. Every new word you learn adds a page;
Pip visibly grows, changes colour and gains ink markings in each script you study
(kanji on one wing, Cyrillic on the tail, Arabic calligraphy on the crest).

- Cheers on rare answers, droops on misses, panics when the Hush is near.
- Speaks only in fragments of the languages you've learned, so its dialogue literally
  gets richer as you do.
- Can be customised with folds and ink colours earned through play.

## The floors (one per language)

Each language is a floor of the Tower with its own city, look, music and resident cast.
Examples:

| Floor | Language | Setting | Resident (the friend you're helping) |
| --- | --- | --- | --- |
| La Plaza | Spanish | a rooftop market at sunset | **Lola**, a street-food cook who's lost her recipe words |
| Le Quai | French | rainy riverside cafés and bookstalls | **Marcel**, a bouquiniste whose books have gone blank |
| Yokochō | Japanese | neon alleyways and a quiet shrine | **Hana**, a radio DJ whose station has gone silent |
| Das Werk | German | a clockwork workshop | **Otto**, an inventor missing his compound-word parts |
| Souk | Arabic | a lantern-lit souk | **Yasmin**, a storyteller who's forgotten her endings |

Every resident has a **friendship meter**. Scenario prompts are conversations with
them ("Lola's out of chorizo; a customer is angry. Help her calm them down."). Higher
friendship unlocks their story chapters, new slang and new areas of the floor.

## The antagonist: the Hush

- Appears as grey static creeping over the edges of a floor (fits the CRT style).
- **Words you miss feed the Hush.** They come back later as "Hushed words": enemies in
  review rounds. Defeat them by answering correctly. This is spaced repetition with
  a story attached.
- If you skip days, the Hush creeps back over your floors (gently: it never deletes
  progress, it only dims it until you return).

## Story structure

- **Prologue (first session):** Pip finds you in the ruins and teaches you to "speak a
  word to the light". This is the tutorial, in your first chosen language.
- **Chapters per floor:** 10 chapters per language, unlocked by total altitude on that
  floor and the resident's friendship level. Each ends on a small cliffhanger.
- **The Polyglot arc:** residents of different floors need each other (Lola needs a
  French recipe from Marcel). Cross-language quests unlock only for players studying
  both languages, which is a story reason to learn more languages.
- **Seasons (6–8 weeks):** a new Hush threat with a themed event (Festival of Lanterns,
  the Great Flood of Silence) and limited cosmetics.
- **The summit:** a long-term goal. The top of the Tower is sealed and opens only when
  the whole community reaches a collective altitude target each season.

## Look and graphics

- **Style:** pixel art with a CRT glow (see `research/krillion/look-demo.html`). Each
  floor has its own palette over the shared dark-night base.
- **Asset list for the MVP:**
  - Pip: idle, happy, sad, scared, growing (5 sizes), each about 32×32 px
  - 3 floor backdrops (parallax layers: sky, skyline, foreground)
  - 3 residents: portrait + 4 expressions each
  - Hush static overlay + 3 Hushed-word enemy sprites
  - tier stamps and icons, a passport, stamps for each language
  - Tower map (vertical scroll, floors light up as you rebuild them)
- **How to make them:** Aseprite by hand, a commissioned pixel artist (best quality and
  consistency), or AI image generation for concept art first, then cleaned up in
  Aseprite. Keep every sprite on the same pixel grid and palette.
- **Sound:** chiptune theme per floor, a bright "ping" per tier, low static hiss
  for the Hush.
