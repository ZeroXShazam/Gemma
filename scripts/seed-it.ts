/**
 * Seed the `card` table with the Italian A1–A2 hand-curated deck.
 *
 * Usage:
 *   pnpm seed:it
 *   pnpm seed:it --truncate
 */

import { Pool } from 'pg';
import { CARDS_IT } from '../src/lib/cards-it';

const LANGUAGE = 'it';

async function main() {
  const truncate = process.argv.includes('--truncate');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Run with `pnpm seed:it` (loads .env.local).');
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
    for (const card of CARDS_IT) {
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
