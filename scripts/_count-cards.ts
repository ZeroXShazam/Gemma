import { CARDS_DATA } from '../src/lib/cards';
const counts: Record<string, number> = {};
const lvl: Record<string, number> = {};
for (const c of CARDS_DATA) {
  counts[c.type] = (counts[c.type] || 0) + 1;
  lvl[c.level] = (lvl[c.level] || 0) + 1;
}
console.log('TOTAL:', CARDS_DATA.length);
console.log('by type:', counts);
console.log('by level:', lvl);
