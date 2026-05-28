/**
 * Audit deck quality metrics (Phase 0 baseline).
 *
 * Usage:
 *   pnpm audit:deck                    # from src/lib/cards.ts
 *   pnpm audit:deck --db               # from DATABASE_URL
 *   pnpm audit:deck --save             # write JSON to scripts/.cache/
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { auditDeck, formatAuditReport } from '../src/lib/deck-audit';
import { CARDS_DATA } from '../src/lib/cards';
import type { CardDef } from '../src/lib/types';

async function loadFromDb(): Promise<CardDef[]> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  try {
    const { rows } = await pool.query<{ id: string; type: string; level: string; data: unknown }>(
      `SELECT id, type, level, data FROM card WHERE language = 'de' ORDER BY id`,
    );
    return rows.map((r) => ({ id: r.id, type: r.type, level: r.level, ...(r.data as object) })) as CardDef[];
  } finally {
    await pool.end();
  }
}

async function main() {
  const fromDb = process.argv.includes('--db');
  const save = process.argv.includes('--save');

  const cards = fromDb ? await loadFromDb() : CARDS_DATA;
  const report = auditDeck(cards);
  const text = formatAuditReport(report);

  console.log(`Source: ${fromDb ? 'database (de)' : 'CARDS_DATA'}\n`);
  console.log(text);

  if (save) {
    const dir = resolve('scripts/.cache');
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    const base = resolve(dir, `audit-${fromDb ? 'db' : 'local'}-${stamp}`);
    writeFileSync(`${base}.json`, JSON.stringify(report, null, 2));
    writeFileSync(`${base}.md`, `# Deck audit (${stamp})\n\n\`\`\`\n${text}\n\`\`\`\n`);
    console.log(`\nWrote ${base}.json and ${base}.md`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
