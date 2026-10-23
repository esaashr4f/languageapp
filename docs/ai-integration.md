# Claude integration

The AI game master lives on the server (`/api`, Vercel functions). The browser never
sees the API key.

## What it does

| Where | Endpoint | Roles in one call | Model (default) |
| --- | --- | --- | --- |
| Battles: a reply the answer list doesn't know | `POST /api/battle` | Rater (rubric) + legend's reaction + OMNI's next goal | Claude Haiku 5.5; Claude Opus 5.5 in the Remembering phase |
| Free conversations with any NPC | `POST /api/chat` | Rater + NPC reply in character (recasts mistakes naturally) + OMNI's correction note + topic ideas | Claude Haiku 5.5 |

Override with `ZABAN_CHAT_MODEL`, `ZABAN_RATER_MODEL`, `ZABAN_LEGEND_MODEL`. Chat runs on
Haiku by default because it's the highest-volume call (every reply); try
`ZABAN_CHAT_MODEL=claude-opus-5-5` to compare quality against cost before launch.

- **Local grader first.** Answers on the curated lists are rated instantly and free.
  Claude is only called for unlisted answers and conversations.
- **Structured output.** Responses are validated against Zod schemas
  (`src/ai/schema.ts`), so every field the game reads is guaranteed.
- **The game owns the numbers.** Claude returns a rating level; the game turns it into
  damage, XP and corruption cleared.
- **Cached prompts.** The system prompt (character card + rubric) is identical for every
  turn with the same character, so it's served from Anthropic's prompt cache.
- **Prompt injection.** Player text is wrapped in `<reply>`/`<message>` tags and treated as
  data; characters never break character or change ratings on request.
- **Refusals.** Opus calls use `fallbacks: "default"` (server-side fallback beta); if a
  call is still declined, the game falls back to its scripted lines.
- **No key?** `/api/battle` returns 204 (game keeps local grading) and `/api/chat` returns
  canned demo replies marked `mock`, so everything runs locally.

## The rubric

`src/ai/rubric.ts`, shared by the curated answer lists and the AI rater:

| Level | Meaning |
| --- | --- |
| Static | Not the target language, not understandable, or doesn't respond |
| Faint | Meaning gets through, but with mistakes a native would notice |
| Clear | Correct and on task, basic or textbook |
| Natural | How a native would say it here, right register |
| Local | Natural plus a real idiom/colloquialism (country-specific slang is the clearest case) |

Caps: grammar errors → max Faint; English words → max Faint; wrong register or not doing
what the speaker needs → max Clear. Accents, capitals and one typo are never penalised.

## Characters

`src/content/characters.ts` holds a card per character (voice, backstory, what they know,
phase behaviour for legends, cultural notes, rules, example lines). Prompts are built from
these cards in `src/ai/prompts.ts`; `docs/characters.md` is generated from them
(`npm run docs:characters`).

## Conversation allowances

Defined in `src/ai/plans.ts`, enforced on the server (`server/accounts.ts`, table
`entitlements`):

| Plan | Replies | Per conversation | When it runs out |
| --- | --- | --- | --- |
| Free | 30 per day | 10 | OMNI: "we need to go" until tomorrow |
| Zaban+ | 1,500 per month | 100 | Credit packs (+500 replies), or wait for renewal |

Free conversations need a signed-in account (so limits can't be dodged). Payments
(Stripe for web; App Store / Google Play billing if it ships as a mobile app) are the next
step: a webhook sets `plan`, `period_start` and `credits` on the player's row.

## Choosing a model provider

Claude is a strong fit here: multilingual nuance (register, regional slang), staying in
character, following a rubric consistently, and structured output. Other frontier models
could also do it. The right way to choose is to test: collect a few hundred real player
replies with the rating a native speaker would give, run them through each candidate and
compare agreement, tone and cost. All model calls go through one function
(`server/gameMaster.ts`), so swapping is contained.
