/**
 * Apply a SQL file to the database.
 * Usage: pnpm exec tsx --env-file=.env.local scripts/apply-sql.ts <path-to-sql>
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx scripts/apply-sql.ts <path-to-sql>');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const sql = readFileSync(resolve(filePath), 'utf8');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    await pool.query(sql);
    console.log(`Applied ${filePath}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
