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

-- Optional per-user daily new-card cap. NULL = unlimited.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS daily_new_limit INTEGER;

-- UI theme preference ('dark' | 'light'). Defaults to 'dark'.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'dark';

-- Curriculum sections included in study queue. NULL = all sections enabled.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS enabled_sections TEXT[];

-- Trainer difficulty preferences (learning-quality plan Phase 1).
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS noun_hard_mode BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS hide_hints_after_new BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS reverse_rate_mature REAL NOT NULL DEFAULT 0.55;
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS prep_production BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS prefer_grammar_new BOOLEAN NOT NULL DEFAULT false;

-- Hide auto-generated "easy" vocab cards (Phase 6 two-tier deck).
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS hide_easy_gen BOOLEAN NOT NULL DEFAULT true;

-- Last example index shown per card (example cooldown).
ALTER TABLE user_card_progress
  ADD COLUMN IF NOT EXISTS last_example_idx INTEGER;
