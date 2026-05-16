-- Run this in Supabase Dashboard > SQL Editor
-- User per-card SRS progress
CREATE TABLE IF NOT EXISTS user_card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  ease FLOAT NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  due BIGINT NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'new',
  step INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- User global settings and daily counters
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  enabled_types TEXT[] NOT NULL DEFAULT ARRAY['verb','noun','prep','wh','pronoun','possessive','adjective','modal','perfekt','negation','comparative','reflexive','conjunction'],
  new_cards_today INTEGER NOT NULL DEFAULT 0,
  today_date TEXT NOT NULL DEFAULT '',
  total_reviewed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
