// Generates docs/characters.md from src/content/characters.ts.
// Run with: npm run docs:characters
import { writeFileSync } from 'node:fs';
import { CHARACTERS } from '../src/content/characters';

const out: string[] = [
  '# Characters',
  '',
  '_Generated from `src/content/characters.ts` by `npm run docs:characters`. Edit that file, not this one._',
  '',
  'These cards are what the AI game master is given when it voices a character (see `src/ai/prompts.ts`).',
  '',
];
for (const c of Object.values(CHARACTERS)) {
  out.push(`## ${c.name}`, '', `**${c.role}**`, '', c.summary, '');
  out.push(`- **Where:** ${c.where}`);
  out.push(`- **Backstory:** ${c.backstory}`);
  out.push(`- **Personality:** ${c.personality.join(', ')}`);
  out.push(`- **Voice:** ${c.voice}`);
  out.push(`- **Speaks:** ${c.language.speaks} (pitched at ${c.language.pitchAt})`);
  if (c.language.signaturePhrases.length) out.push(`- **Signature phrases:** ${c.language.signaturePhrases.map((p) => `"${p}"`).join(', ')}`);
  if (c.language.avoid.length) out.push(`- **Avoids:** ${c.language.avoid.join('; ')}`);
  out.push(`- **Wants:** ${c.wants}`);
  out.push(`- **Knows:** ${c.knows.join('; ')}`);
  out.push(`- **Doesn't know:** ${c.doesNotKnow.join('; ')}`);
  if (c.phases) {
    out.push('- **In battle:**');
    out.push(`  - *Corrupted:* ${c.phases.corrupted}`);
    out.push(`  - *Wavering:* ${c.phases.wavering}`);
    out.push(`  - *Remembering:* ${c.phases.remembering}`);
  }
  if (c.culturalNotes.length) out.push(`- **Cultural notes:** ${c.culturalNotes.join(' ')}`);
  if (c.rules.length) out.push(`- **Rules:** ${c.rules.join(' ')}`);
  out.push('- **Example lines:**');
  for (const l of c.sampleLines) out.push(`  - ${l.text}${l.gloss ? ` _(${l.gloss})_` : ''}`);
  out.push('');
}
writeFileSync(new URL('../docs/characters.md', import.meta.url), out.join('\n'));
console.log(`Wrote ${Object.keys(CHARACTERS).length} characters to docs/characters.md`);
