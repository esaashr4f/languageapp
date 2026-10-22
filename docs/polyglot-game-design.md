# Polyglot daily game — design draft

This is the Daily Climb in the Language Tower (see `story-and-world.md`). Inspired by Krillion's rarity-scoring loop
(see `research/krillion/README.md`), rebuilt for language learning.

## Core loop

- **One daily round per language, 7 prompts.** Same prompts for everyone learning that
  language that day (seeded from date + language code), so scores are comparable and
  shareable.
- **3 s read, 25 s to answer** (configurable: 40 s for beginners / non-Latin scripts).
- **Free-text answers, many valid answers per prompt.** Rarer, more natural answers score
  more. Score is shown as **altitude**: 1 pt = 10 m, perfect round = 7,000 m.

## Rarity tiers (language version)

| Tier | Pts | What it means | Example — Spanish, "I'm running late" (casual) |
| --- | --- | --- | --- |
| Phrasebook | 10 | Correct, the first thing any course teaches | llego tarde |
| Textbook | 15 | Correct, a bit formal or wordy | voy a llegar tarde |
| Conversational | 30 | What people actually say | voy tarde |
| Native | 60 | Idiomatic, natural rhythm | se me hizo tarde |
| Regional | 85 | Correct and marked to a region | ando retrasado (Mexico) |
| Polyglot | 100 | Slang / idiom a native would smile at | voy pillado (Spain) |

Answers that are grammatically wrong score 0 but show the nearest valid answers, so a
miss still teaches something.

## Prompt types (mix 7 per round)

1. **Say it** — "How would you text 'I'm running late' to a friend?" (main type)
2. **Scenario** — "You're at a bakery in Lyon and they're out of croissants. Ask what
   they'd recommend instead."
3. **Name one** (straight Krillion format) — "Name a word for 'money' in Spanish slang",
   "Name a Japanese counter word", "Name a German compound with *Schaden*".
4. **Register flip** — rewrite a formal sentence casually, or the other way round.
5. **Respond** — a line of dialogue appears; type a natural reply.
6. **Cross-language bonus (polyglot mode)** — same prompt in 3 languages back-to-back;
   streak multiplier if all three are Conversational or better.

## Grading pipeline

1. **Normalise** (lowercase, strip accents/punctuation, leading articles, one-typo
   tolerance — same rules Krillion uses). For non-Latin scripts also accept common
   romanisations (pinyin, romaji, Arabic chat alphabet) at a lower tier.
2. **Exact/fuzzy match** against the editor-curated answer list for the prompt (fast,
   free, deterministic).
3. **LLM fallback** for unmatched answers: Claude grades validity + assigns a tier with a
   short reason. Valid new answers go into a review queue to be added to the list, so the
   bank grows over time.
4. **Explain** — after each prompt show the player's tier + 2–3 better answers with a
   one-line note ("*pillado* = 'caught', very Spain").

## Modes

- **Daily Climb** per language (free).
- **Polyglot Daily** — one prompt in each of your languages (the hook for polyglots).
- **Unlimited / packs** — themed: Travel, Food, Slang, Business, Romance, Idioms.
- **Battle** — room code, 2–50 players, same language or each in their own.
- **Yesterday's best finds** — rarest answer per prompt, anonymous nicknames.

## Progression

- Per-language altitude history + streaks.
- **Passport**: one stamp per language at each tier reached; a "Polyglot" badge for
  5+ languages at Native in the same week.
- CEFR-ish level (A1–C2) estimated from rolling average tier, used to pick prompt
  difficulty for Unlimited mode (Daily stays the same for everyone).

## Content sources (all reusable)

- Tatoeba sentence pairs (CC-BY 2.0 FR) for seed prompts.
- Wiktionary (CC-BY-SA) for slang/regional labels.
- LLM-generated scenarios, reviewed by native speakers before entering the daily pool.
- **Not** Krillion's questions/answers (copyrighted, and trivia anyway).

## Stack proposal

- Next.js + TypeScript, CSS variables (`research/krillion/design-tokens.css`), no UI kit.
- Postgres (Supabase) for prompts, answer lists, users, results; edge function for grading.
- Claude API for fallback grading + explanations (cache per prompt/answer pair).
- Auth: email magic link + Google/Apple.
- PWA, offline daily round cache, share card image (`/opengraph-image` per result).

## Monetisation (mirror what works)

No ads. 1 round without an account, all daily languages with a free account, paid
"unlimited + all packs + battle hosting" at a low monthly/yearly/lifetime price.

## MVP scope (first build)

1. Daily Climb for 3 languages (e.g. Spanish, French, Japanese), 7 prompts/day,
   30 days of hand-checked content.
2. Fuzzy match + LLM fallback grading, tier stamp + better-answers reveal.
3. Altitude score, local streaks, share text ("BABEL #12 🇪🇸 5,850 m 🟨🟪🟩🟪🟧🟨🟪").
4. Visual style from `research/krillion/look-demo.html`.
