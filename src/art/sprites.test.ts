import { describe, expect, it } from 'vitest';
import { SPRITES } from './sprites';

describe('sprites', () => {
  for (const [key, def] of Object.entries(SPRITES)) {
    it(`${key} is a 16x16 grid with every colour defined`, () => {
      expect(def.rows).toHaveLength(16);
      for (const row of def.rows) {
        expect(row).toHaveLength(16);
        for (const ch of row) if (ch !== '.') expect(def.palette[ch], `${key}: '${ch}'`).toBeDefined();
      }
    });
  }
});
