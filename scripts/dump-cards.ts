/**
 * Dump all cards from the `card` table to JSON files for offline evaluation.
 * Writes one chunked JSON file per language under scripts/.cache/cards-dump/.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/dump-cards.ts [--chunk=40] [--lang=de]
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

interface Row {
  id: string;
  language: string;
  type: string;
  level: string;
  data: unknown;
}

async function main() {
  const args = process.argv.slice(2);
  const chunkArg = args.find((a) => a.startsWith('--chunk='));
  const langArg = args.find((a) => a.startsWith('--lang='));
  const chunkSize = chunkArg ? Math.max(1, Number(chunkArg.split('=')[1]) || 40) : 40;
  const lang = langArg ? langArg.split('=')[1] : null;

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
    const sql = lang
      ? `SELECT id, language, type, level, data FROM card WHERE language = $1 ORDER BY language, type, level, id`
      : `SELECT id, language, type, level, data FROM card ORDER BY language, type, level, id`;
    const { rows } = await pool.query<Row>(sql, lang ? [lang] : []);

    const byLang = new Map<string, Row[]>();
    for (const r of rows) {
      if (!byLang.has(r.language)) byLang.set(r.language, []);
      byLang.get(r.language)!.push(r);
    }

    const outDir = resolve('scripts/.cache/cards-dump');
    mkdirSync(outDir, { recursive: true });

    const manifest: Record<string, { total: number; chunks: string[] }> = {};
    for (const [language, cards] of byLang) {
      const chunks: string[] = [];
      for (let i = 0; i < cards.length; i += chunkSize) {
        const slice = cards.slice(i, i + chunkSize).map((r) => ({
          id: r.id,
          type: r.type,
          level: r.level,
          ...(r.data as object),
        }));
        const chunkIdx = String(Math.floor(i / chunkSize) + 1).padStart(3, '0');
        const fname = `${language}-chunk-${chunkIdx}.json`;
        writeFileSync(resolve(outDir, fname), JSON.stringify(slice, null, 2));
        chunks.push(fname);
      }
      manifest[language] = { total: cards.length, chunks };
      console.log(`[${language}] ${cards.length} cards → ${chunks.length} chunks of <=${chunkSize}`);
    }

    writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`\nWrote ${outDir}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
