/**
 * One-shot diagnostic: print queue stats for all users.
 * Usage: pnpm exec tsx --env-file=.env.local scripts/diag-queue.ts
 */
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const now = Date.now();
  try {
    const users = await pool.query(`SELECT id, email FROM "user"`);
    for (const u of users.rows) {
      console.log(`\n=== ${u.email} (${u.id}) ===`);
      const s = await pool.query(`SELECT * FROM user_settings WHERE user_id = $1`, [u.id]);
      const set = s.rows[0];
      if (set) {
        console.log(`  active_language = ${set.active_language}`);
        console.log(`  enabled_types   = ${(set.enabled_types ?? []).length} types enabled`);
        console.log(`  new_cards_today = ${set.new_cards_today}  (today=${set.today_date})`);
        console.log(`  total_reviewed  = ${set.total_reviewed}`);
        console.log(`  streak          = ${set.streak_days} (last ${set.last_review_date})`);
      } else {
        console.log('  (no user_settings row yet)');
      }

      const lang = set?.active_language ?? 'de';
      const totalCards = await pool.query(`SELECT COUNT(*)::int AS n FROM card WHERE language = $1`, [lang]);
      console.log(`  cards in language '${lang}': ${totalCards.rows[0].n}`);

      const p = await pool.query(`SELECT state, COUNT(*)::int AS n,
        SUM(CASE WHEN due <= $2 THEN 1 ELSE 0 END)::int AS due_now
        FROM user_card_progress WHERE user_id = $1 GROUP BY state ORDER BY state`,
        [u.id, now]);
      console.log(`  progress states:`);
      let touched = 0;
      for (const row of p.rows) {
        console.log(`    ${row.state.padEnd(10)} count=${String(row.n).padStart(4)}  due_now=${row.due_now}`);
        touched += row.n;
      }
      console.log(`    (untouched: ${totalCards.rows[0].n - touched})`);

      const nextDue = await pool.query(
        `SELECT card_id, state, due FROM user_card_progress
         WHERE user_id = $1 AND due > $2 ORDER BY due ASC LIMIT 5`,
        [u.id, now]);
      if (nextDue.rows.length > 0) {
        console.log(`  next 5 due:`);
        for (const row of nextDue.rows) {
          const mins = Math.round((Number(row.due) - now) / 60000);
          console.log(`    ${row.card_id.padEnd(28)} ${row.state.padEnd(10)} in ${mins}m`);
        }
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
