-- ============================================
-- STEM Attendance Tracker — Supabase Setup
-- ============================================
-- Run this ENTIRE script in:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================

-- 1. Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id         BIGSERIAL PRIMARY KEY,
  category   TEXT NOT NULL,           -- 'lego', 'snap', or 'vex'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id         BIGSERIAL PRIMARY KEY,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Logs table (activity audit trail)
CREATE TABLE IF NOT EXISTS logs (
  id         BIGSERIAL PRIMARY KEY,
  action     TEXT NOT NULL,           -- 'checkin' or 'rating'
  detail     TEXT,                    -- e.g. 'lego' or '5 stars'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settings table (single-row config, shared across all tablets)
CREATE TABLE IF NOT EXISTS settings (
  id               INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- enforce single row
  checkin_cooldown  INT DEFAULT 5000,   -- milliseconds
  rating_cooldown   INT DEFAULT 2000,   -- milliseconds
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id, checkin_cooldown, rating_cooldown)
VALUES (1, 5000, 2000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables (required by Supabase)
-- Then allow all operations with the anon key.
-- This is fine for a kiosk app on a trusted network.
-- For tighter security, restrict to INSERT-only on checkins/ratings.

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Checkins: anyone can insert and read
CREATE POLICY "Allow insert checkins" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read checkins"   ON checkins FOR SELECT USING (true);

-- Ratings: anyone can insert and read
CREATE POLICY "Allow insert ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read ratings"   ON ratings FOR SELECT USING (true);

-- Logs: anyone can insert and read
CREATE POLICY "Allow insert logs" ON logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read logs"   ON logs FOR SELECT USING (true);

-- Settings: anyone can read, anyone can update/insert (admin page)
CREATE POLICY "Allow read settings"   ON settings FOR SELECT USING (true);
CREATE POLICY "Allow upsert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update settings" ON settings FOR UPDATE USING (true);

-- ============================================
-- REALTIME (so Dashboard updates live)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;

-- ============================================
-- DONE! Your database is ready.
-- ============================================
