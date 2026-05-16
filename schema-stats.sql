-- Per-(card, example) miss counts for adversarial example picking.
-- JSON: { "0": 3, "1": 0, "2": 1 } where key is example index, value is miss count.
ALTER TABLE user_card_progress
  ADD COLUMN IF NOT EXISTS example_misses JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Most recent 5 results per card, oldest-to-newest as '1' (correct) / '0' (wrong).
ALTER TABLE user_card_progress
  ADD COLUMN IF NOT EXISTS recent_results TEXT NOT NULL DEFAULT '';

-- Daily streak: number of consecutive days with at least one review.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS last_review_date TEXT NOT NULL DEFAULT '';
