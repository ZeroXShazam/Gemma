-- Run in Supabase Dashboard > SQL Editor (or via pg client).
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS card (
  id          TEXT PRIMARY KEY,
  language    TEXT NOT NULL,
  type        TEXT NOT NULL,
  level       TEXT NOT NULL,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_lang_type_level_idx ON card (language, type, level);

-- Per-user active language (defaults to German for existing users).
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS active_language TEXT NOT NULL DEFAULT 'de';
