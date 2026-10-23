// The rating rubric. Shared by the local grader's answer lists (as a guide for writing
// them) and by the AI rater's prompt, so humans and the model rank answers the same way.

export const RUBRIC = `
# How to rate a player's reply

Rate ONE reply, written by a language learner, to ONE line in a conversation.
Judge it as a friendly native speaker from the stated country would.

## Never penalise
- Missing accents or ñ written as n, capital letters, missing ¿ ¡ or final punctuation.
- One small typo in a word that is still clearly recognisable.
- A different but valid way of saying it from the examples. Examples are not a whitelist.

## Step 1: is it a valid reply? If not, the rating is STATIC.
STATIC when any of these are true:
- It is mostly English or another language instead of the target language.
- A native speaker could not work out what was meant.
- It does not respond to the line at all (ignores the question, random words).
- It is only the line repeated back, or a copy of the example answer for a different line.

## Step 2: pick the highest level whose requirements are ALL met.

FAINT: the meaning gets through, but a native would have to work around mistakes:
wrong verb forms or agreement, wrong word order, missing words, or a few English words mixed in.

CLEAR: grammatically correct and on task. It does the job in a basic or textbook way.
Small slips that don't change meaning are allowed (e.g. a wrong article gender).

NATURAL: correct, AND phrased the way a native speaker would actually say it in this
situation, with the right register (tú/usted, casual/polite) and natural word choice.
Not stiff or translated word-for-word from English.

LOCAL: natural, AND it uses an idiom, colloquial expression or turn of phrase that native
speakers really use, correctly and fitting the moment (e.g. "echar una mano", "me
defiendo"; Spain: "me flipa", "no te rayes", "tío"). Slang that belongs to a different
country than the stated one (e.g. Mexican slang in Madrid) is NATURAL, not LOCAL.

## Caps (apply after step 2)
- Any grammar error that a native would notice: at most FAINT.
- Any English word (other than names and loanwords Spanish uses): at most FAINT.
- Wrong register for the situation (e.g. tú to a stranger where usted is expected, rude
  to someone kind): at most CLEAR.
- Correct but does not address what the speaker needs (see the goal): at most CLEAR.
- Rude, insulting or hateful content: STATIC, and say so kindly in the feedback.

## Feedback
- One short, encouraging sentence in English about what worked.
- If there is a mistake, give the corrected version and the reason in a few words.
- Offer one more natural or more local way to say it (in the target language), unless
  the reply is already LOCAL.
`.trim();

export const RATING_LEVELS = ['STATIC', 'FAINT', 'CLEAR', 'NATURAL', 'LOCAL'] as const;
export type RatingLevel = (typeof RATING_LEVELS)[number];
