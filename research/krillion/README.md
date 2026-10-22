# Krillion teardown — reference for a polyglot language game

Scraped 2026-10-22 with Firecrawl (`krillion.to/en`, `/how-to-play`, `/faq`, `/packs`,
`/yesterday`, `/battle`) plus the site's public CSS. These are notes and analysis, not
copied content: their questions, answer lists, art, mascot and name are theirs.

Files here:

- `screenshots/home-desktop-full.png`, `screenshots/home-mobile.png` — landing page
- `look-demo.html` — open in a browser: an original recreation of the *visual techniques*
  (not their assets), re-themed for a language game
- `design-tokens.css` — a palette and token set in the same spirit
- `../../docs/polyglot-game-design.md` (game design) — the game design for our version

---

## 1. What Krillion is

A free, browser-only daily trivia game (Next.js, English + French). The hook is
**"name one of the N things in this set — the rarer your valid answer, the more you score."**

| Mechanic | Detail |
| --- | --- |
| Round | 7 questions, same for everyone each day ("The Daily Dive", numbered, e.g. #295) |
| Timing | 3 s preview of the prompt, then 25 s to type one answer |
| Input | Free text, not multiple choice. Fuzzy matching: accents, capitals, leading articles, numbers-as-words, one adjacent-letter swap. Ambiguous matches aren't credited |
| Validity | Every answer must be on one editor-curated list per question |
| Scoring | 6 rarity tiers set by editors (not by player stats): 10 / 15 / 30 / 60 / 85 / 100 pts. Max 700 |
| Theme as score | 1 point = 10 m of depth. Perfect game = 7,000 m. Depth zones have names ("Twilight Zone", "Midnight Waters", "Trench Code") with little flavour lines |
| Daily seed | Questions derived from the calendar date, so it works with no server state |
| Social | "Yesterday's best finds": rarest answer per question with a random diver nickname. Battle mode: 2–50 players, room code, live, needs an account |
| Modes | Daily Dive, Unlimited, 4 free themed packs (824 games), 4 paid packs (+422 games) |
| Monetisation | No ads. 1 game without account, 3/day with a free account; unlimited = $3.50/mo, $30/yr (15-day trial), or $29.90 once |
| Retention | Countdown "Next dive in 2h 04m", local save in browser + backup/restore page |
| Polish | Sound toggle, mascot (Krill) reacting to answers, per-pack "worlds" that reskin the UI (e.g. a notebook/paper theme, a cinema theme) |

**Why it works:** the obvious answer always scores *something*, so nobody feels stupid;
the rarity ladder rewards deep knowledge, so experts keep coming back; one short daily
round gives a shared, comparable, shareable number.

**Why it maps perfectly to languages:** "say X" has many valid answers — a textbook
phrase, a casual one, a regional idiom, a slang one. Rewarding the *natural, rarer*
answer is exactly what separates a polyglot from a phrasebook.

## 2. How the look is built (from screenshots + CSS)

The aesthetic is **retro pixel / CRT terminal on a deep-ocean gradient**:

1. **Typography: one pixel font everywhere.** `VT323` (free, SIL OFL, on Google Fonts)
   for headings, body and buttons. Huge title (~124px), all-caps labels with wide
   letter-spacing (`letter-spacing: .3em`). They also ship a tiny custom glyph font for
   arrows/× so icons match the pixel style.
2. **Palette (CSS variables):** near-black navy background `#050914` (deeper `#02040a`),
   cyan accent `#4de3ff`, pink `#ff5d8f`, amber `#ffd166`, foam-white text `#e8f1ff`,
   muted blue-grey secondary text `#7d93b8`, hairlines `#1c2f4f`. Each rarity tier has its
   own colour (grey → cyan → violet `#9d7bff` → amber, red for a miss signal).
3. **Chromatic-aberration wordmark:** the title is dark navy with a pink/cyan offset
   shadow — `text-shadow: -3px 3px var(--pink), 3px -2px var(--cyan)`.
4. **Sky → sea → abyss scene:** the page is a vertical gradient (light sky blue at top,
   haze at the horizon line, then dark navy), with pixel-block clouds, a dashed waterline,
   a small pixel boat, faint light shafts and fish silhouettes. As your score rises the
   scene scrolls down ("dives") with a custom easing over ~1.25 s.
5. **CRT texture:** scanlines via `repeating-linear-gradient(0deg, rgba(232,241,255,.07) 0 2px, transparent 2px 4px)`
   overlaid on the page, and a short "static" animation on wrong answers.
6. **Chunky pixel buttons:** zero border-radius, stacked box-shadows for a pixel bevel and
   glow — e.g. `box-shadow: 0 0 0 3px #050914, 0 0 0 6px #4de3ff, 0 6px 0 6px #18475c, 0 0 28px rgba(77,227,255,.34)`.
   Secondary buttons are just 1px light outlines on the dark background.
7. **Pixel art:** sprites (boat, mascot, creatures) are small PNGs scaled up with
   `image-rendering: pixelated`.
8. **Motion vocabulary:** ~40 named keyframes — score "slam", depth counter "crank",
   tier "stamp", timer pulse, mascot happy/sad, board jolt on a miss, CRT zap. Short
   (.18–.42 s) with springy easing `cubic-bezier(.2,1.3,.4,1)`.
9. **Layout:** a single centred column, max ~600px, same on mobile (see
   `home-mobile.png`): title → "how does it work" disclosure → one giant primary CTA →
   row of secondary outline buttons → countdown → small footer. Language switcher and
   sign-in sit top-right.
10. **Copy voice:** everything is themed ("Start transmission", "Signal 1/7", "Echoes",
    "Diver 59F84"). The theme carries the whole personality.

## 3. How to make ours look like that (without cloning it)

Keep the *techniques*, change the *identity*:

- **Pick our own metaphor** instead of depth/ocean. Ideas that fit languages:
  *altitude* (climbing the Tower of Babel, floors = points), *distance* (a passport/train
  journey, km travelled across a map), or *signal* (radio tuning across frequencies).
  The score-as-a-physical-quantity trick is the important part.
- **Same tech stack works:** Next.js (or plain Vite + React), CSS variables, no UI
  library. VT323 or another OFL pixel font (Press Start 2P, Silkscreen, Pixelify Sans) —
  check the font supports the scripts you'll show (VT323 is Latin-only; for Cyrillic,
  Greek, Arabic, CJK etc. you'll need a fallback such as "Unifont" or Noto fonts).
- **Our own palette:** `design-tokens.css` keeps the same structure (dark base, one
  bright accent, one warm accent, a colour per tier), with different hues.
- **Our own pixel art** (commission it or use Aseprite) rather than their sprites/mascot.
- See `look-demo.html` for working CSS of the wordmark, scanlines, gradient scene,
  pixel buttons, timer and tier stamp.
