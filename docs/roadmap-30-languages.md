# Scaling Zaban to 30 countries, aiming at B2 in each

## The honest size of the goal

- **B2 takes a lot of practice.** Rough published estimates: ~500–600 guided learning
  hours to reach B2 from zero for languages close to English (Spanish, French, Italian,
  Portuguese), and two to three times that for Japanese, Korean, Mandarin or Arabic. A
  game can't hand-craft 600+ hours per language, times 30.
- **What we have today is a vertical slice:** ~15–20 minutes of story in one market. It
  proves the loop (story, conversation, rating, legends), not the volume.

So the plan is: a **hand-crafted spine** per country (story, places, characters, legends,
life events, about 30–50 hours of play) plus **unlimited practice that scales by itself**
(AI conversations with the cast, Daily Climb, Tower, Bridge Rush, spaced-repetition
"Glitched words"), with **Heart Legend conversations** as the B2 checkpoint.

## What one country needs

| Part | What it is | Who/what makes it |
| --- | --- | --- |
| Curriculum map | A1→B2 functions, grammar and ~3,000–4,000 words, mapped onto acts and life events | Designer + native teacher; Claude drafts |
| Story | 4 acts, ~30–40 life events, 6–10 legends + a Heart Legend, 20–30 characters | Writer; Claude drafts, native speakers review |
| Answer lists + rubric examples | Seed answers per scripted prompt; AI handles the rest | Claude drafts, natives review, tests check |
| Places and art | 4–6 areas (maps), sprites, legend art, signs in the language | Pixel artist (biggest bottleneck) |
| Language tech | Normaliser (accents, scripts, romanisation), word splitting for languages without spaces, fonts, right-to-left layout (Arabic, Hebrew, Persian, Urdu), keyboard/IME testing | Engineer, once per script family |
| AI quality check | ~300 real learner replies rated by natives; check Claude agrees | Native reviewer + eval script |
| Cultural review | Legends, opinions, humour, slang: respectful and accurate | 1–2 native consultants |
| Voice (later) | Text-to-speech voices and speech recognition per language | Vendor integration |

## Engine work to do before country #2

Right now Spain's content is partly wired into the scenes. Before adding more:

1. **Data-driven content:** maps from the Tiled editor, quests/dialogue/battles as data
   files per country, so new countries need no new code.
2. **A language plug-in interface:** normalise, split words, accent keyboard, fonts,
   text direction, per language.
3. **Localised UI** in the player's own language (OMNI speaks it, not only English).
4. **Content tooling:** Claude drafts a life event or legend → native reviewer approves in
   a simple web tool → tests check every answer.
5. **Analytics:** where players get stuck, which prompts are too hard, real time-to-level.

## Rough timeline (big assumptions)

- **Spain, complete (all 4 acts + Heart Legend):** ~2–3 months, including the engine work above.
- **Each new country after that:** ~4–8 weeks with a small team (designer/writer, pixel
  artist, native reviewer, plus Claude for drafting), faster for languages sharing a
  script and structure with one already done. Several countries can run in parallel.
- **30 countries:** realistically 2–3 years with a small team, or faster with parallel
  country teams. Shipping a few excellent countries first (e.g. 1 → 3 → 10 → 30) matters
  more than speed.

AI makes the drafting fast (as today showed); the real limits are art, native review,
playtesting, and the hours of practice B2 genuinely needs.

## A possible 30

Spain, Mexico, Argentina, France, Quebec, Germany, Italy, Portugal, Brazil, Netherlands,
Sweden, Poland, Greece, Turkey, Egypt, Morocco, Japan, South Korea, China, Taiwan,
Vietnam, Thailand, Indonesia, Philippines, India (Hindi), Pakistan (Urdu), Iran (Persian),
Kenya (Swahili), Ukraine, Israel (Hebrew). Same language in several countries (Spain,
Mexico, Argentina) is a cheap way to add countries and teach regional variety.

## On claiming "B2"

Say the game *aims at* B2 and is aligned to CEFR descriptors. Don't claim certification.
Validate by having a sample of players sit a recognised external test after finishing a
country, and publish the results honestly.
