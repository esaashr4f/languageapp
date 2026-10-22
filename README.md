# Language RPG (title TBD)

A language-learning RPG for polyglots. A virus called ANTI has broken into OMNI, the
world's translation AI, erased English and started rewriting every language. Live
through each country, restore its corrupted legends by speaking to them, and become
the living backup ANTI can't delete. Casual modes (Daily Climb, Tower, Bridge Rush,
Duels) and a story mode share one profile.

## Prototype: Spain, Act 1 (El Mercado)

A playable slice: the opening (wake up with no memory, OMNI explains everything in an illustrated flashback), a market in Madrid, Carmen's "first order" life
event, and a legend battle against the corrupted market duende.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # grader, sprite and content tests
npm run build    # static build in dist/
```

Controls: arrows/WASD to move, SPACE/ENTER to talk and advance; on phones, the d-pad
and A button. Type answers in Spanish (accent buttons included; accents are optional).
The EN chip toggles English subtitles.

| Quest | Battle (corrupted) | Battle (remembering) | Phone |
| --- | --- | --- | --- |
| ![](docs/screenshots/quest-carmen.png) | ![](docs/screenshots/battle-corrupted.png) | ![](docs/screenshots/battle-remembering.png) | ![](docs/screenshots/mobile-market.png) |

### How it's built

- `src/engine/`: the speaking engine shared by every mode. Normalises answers (case,
  accents, punctuation, leading fillers, one typo), matches them against curated lists
  with slots like `{name}` / `{food}`, and ranks them in six tiers from Phrasebook to
  Polyglot. An AI fallback for unlisted answers comes later.
- `src/content/spain/act1.ts`: all script, prompts and accepted answers for the slice.
  `content.test.ts` checks every listed answer is actually accepted.
- `src/scenes/`: Phaser 3 scenes (title, overworld, battle). The battle uses a
  corruption bar and three phases: Corrupted → Wavering → Remembering.
- `src/ui/panel.ts`: the bottom screen (DS-style): typewriter dialogue boxes, menus,
  the answer box with a timer, result stamps, d-pad. Plain DOM for crisp text and
  phone keyboards.
- `src/art/`: original placeholder pixel art drawn from text grids; no asset files.

## Docs

- `docs/story-and-world.md`: lore, why legends attack, country stories, life events, ending
- `docs/gamification.md`: casual vs story mode, battles, food, coins, progression, build order
- `docs/ai-integration.md`: how Claude grades answers and voices the legends (Haiku + Opus)
- `docs/polyglot-game-design.md`: daily round, rarity tiers and grading
- `research/krillion/`: teardown of Krillion (the inspiration) plus a style demo
