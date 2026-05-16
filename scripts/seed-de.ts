/**
 * Seed the `card` table with the German A1–A2 deck from src/lib/cards.ts.
 * Idempotent (UPSERTs by id).
 *
 * Usage:
 *   pnpm seed:de
 *   pnpm seed:de --truncate   # delete all de cards first (use after id renames)
 */

import { Pool } from 'pg';
import { CARDS_DATA } from '../src/lib/cards';

const LANGUAGE = 'de';

async function main() {
  const truncate = process.argv.includes('--truncate');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Run with `pnpm seed:de` (which loads .env.local).');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  const client = await pool.connect();
  try {
    if (truncate) {
      const { rowCount } = await client.query(`DELETE FROM card WHERE language = $1`, [LANGUAGE]);
      console.log(`Deleted ${rowCount} existing ${LANGUAGE} cards.`);
    }

    let upserted = 0;
    await client.query('BEGIN');
    for (const card of CARDS_DATA) {
      const { id, type, level, ...rest } = card;
      await client.query(
        `INSERT INTO card (id, language, type, level, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (id) DO UPDATE
           SET language = EXCLUDED.language,
               type = EXCLUDED.type,
               level = EXCLUDED.level,
               data = EXCLUDED.data,
               updated_at = NOW()`,
        [id, LANGUAGE, type, level, JSON.stringify(rest)],
      );
      upserted++;
    }
    await client.query('COMMIT');
    console.log(`Upserted ${upserted} ${LANGUAGE} cards.`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
