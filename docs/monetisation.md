# Monetisation

**Decided:** energy is OMNI's Signal; tiers Free / Basic $14.99 / Premium $34.99 (implemented in
`src/ai/plans.ts`, enforced on the server). Still to build: Stripe checkout and battery packs.

## Principles

1. **Never paywall the story or the basics of learning.** Story mode, battles, scripted
   NPC lines and the answer-list grading cost almost nothing to run, so they stay free and
   unlimited. Paywalls on learning feel bad and get punished in reviews.
2. **Meter what costs money: AI conversations.** Each reply in a free conversation is an
   AI call. That's the thing tiers should differ on.
3. **Keep it inside the story.** We already explain limits as OMNI's *signal*: long
   conversations make OMNI traceable by ANTI. "Energy" should be that same thing.

## Energy = OMNI's Signal

- Shown as signal bars in the HUD (📶), like a phone.
- Spent only by AI conversations (and maybe Heart Legend assessments), 1 bar per reply.
- Refills on its own over time; paid tiers have a bigger tank and refill faster.
- **Food stays separate:** food is HP and time in battles; signal is conversation. No overlap.
- **Recharging:** I'd avoid making the character auto-walk to a bench and wait on a timer:
  forced waiting reads as "pay to skip", and it blocks play that costs us nothing (story,
  battles). Instead, offer optional flavour: sitting at a café with a plug, or on a bench,
  gives a small once-a-day signal bonus, and OMNI chats while it charges. A timer in the
  corner only shows when signal is empty.

## Tiers (prices to test)

| | Free | Basic, $14.99/mo | Premium, $34.99/mo |
| --- | --- | --- | --- |
| Story, battles, scripted chats | ✔ | ✔ | ✔ |
| AI conversation replies | ~30/day (3 short chats) | ~1,500/month (~50/day) | ~3,000/month, fair use |
| Conversation quality | Fast model | Fast model | Best model (most natural partners) |
| Voice conversations (later) | | | ✔ |
| New countries | When released | When released | Early access |
| Top-up credits | ✔ | ✔ | ✔ |

- Annual plans at roughly 40% off (e.g. $99/yr, $229/yr).
- Credit packs for anyone who runs out: e.g. $4.99 for 500 replies.

### Market check (approximate)

Duolingo Super ≈ $13/mo and Max ≈ $30/mo; Babbel ≈ $14/mo; AI-conversation apps
(Speak, Praktika) ≈ $15–20/mo. $14.99 is in line; $34.99 is top of the market, so
Premium needs visible extra value (best-model conversations, voice, early countries).

### Cost check (rough, to be measured)

- Fast model (Claude Haiku 5.5): well under $0.001 per reply with prompt caching.
  Free users cost cents per month.
- Best model (Claude Opus 5.5): roughly $0.01–0.02 per reply. 3,000 replies could cost
  up to ~$30–60, so Premium needs a fair-use cap or a middle model (Claude Sonnet 5.5 is
  roughly half of Opus) to keep cost well under the $34.99 price. Most users never hit caps.

## Payments

- **Web: Stripe.** Checkout for subscriptions and credit packs, Customer Portal for
  upgrades/cancellations, Stripe Tax for VAT/sales tax. A webhook (`/api/stripe-webhook`)
  updates the player's `entitlements` row (plan, period start, credits). The game already
  reads that row and enforces limits on the server.
- **Mobile apps (later):** Apple and Google require their own in-app purchases for
  digital goods (15–30% fee). A service like RevenueCat can unify web and store
  subscriptions so one account works everywhere.
- Needed from you: a Stripe account, final prices, and the energy decision above.
