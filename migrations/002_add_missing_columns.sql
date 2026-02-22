-- Migration: Add missing columns to words table
-- Run this to fix the missing columns issue

-- Add missing columns if they don't exist
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic VARCHAR(100);
ALTER TABLE words ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS example_sentence TEXT;

-- Also ensure user_settings has custom_daily_limit
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_daily_limit INTEGER DEFAULT 0;
