-- Migration: Add user_learning_plans table for multi-learning plan support
-- Run this to enable multiple learning plans per user

-- Create user_learning_plans table
CREATE TABLE IF NOT EXISTS user_learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    daily_limit INTEGER DEFAULT 20,
    priority INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_learning_plans_user_id ON user_learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_plans_status ON user_learning_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_learning_plans_priority ON user_learning_plans(priority);

-- Insert default learning plans for existing users who don't have any
-- This will be handled by the application logic
