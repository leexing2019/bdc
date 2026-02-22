-- Migration: Add custom_daily_limit column to user_settings
-- Run this to fix the missing column issue

-- Add custom_daily_limit column if it doesn't exist
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_daily_limit INTEGER DEFAULT 0;

-- Update existing records to have custom_daily_limit = 0
UPDATE user_settings SET custom_daily_limit = 0 WHERE custom_daily_limit IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
