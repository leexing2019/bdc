-- ============================================================
-- Smart Memo 数据库索引优化
-- 在 Supabase SQL Editor 中执行以下语句
-- ============================================================

-- 1. 优化单词查询（按分类和创建时间排序）
CREATE INDEX IF NOT EXISTS idx_words_category_created
  ON words(category, created_at DESC);

-- 2. 优化用户自定义单词查询
CREATE INDEX IF NOT EXISTS idx_words_custom_user
  ON words(category, created_by)
  WHERE category = 'custom';

-- 3. 优化单词学习进度查询（核心查询）
CREATE INDEX IF NOT EXISTS idx_progress_user_review
  ON user_word_progress(user_id, next_review_date)
  INCLUDE (word_id, ease_factor, interval_days, repetitions, proficiency);

-- 4. 优化学习记录查询
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date
  ON study_logs(user_id, date DESC);

-- 5. 优化学习计划查询（只索引活跃计划）
CREATE INDEX IF NOT EXISTS idx_learning_plans_active
  ON user_learning_plans(user_id, priority)
  WHERE status = 'active';

-- 6. 优化用户设置查询
CREATE INDEX IF NOT EXISTS idx_user_settings_user
  ON user_settings(user_id);

-- 7. 优化单词ID关联查询
CREATE INDEX IF NOT EXISTS idx_progress_word
  ON user_word_progress(word_id);

-- ============================================================
-- 性能分析查询（执行查看索引使用情况）
-- ============================================================

-- 分析常用查询的执行计划
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM words
WHERE category != 'custom'
  AND category IN ('cet4', 'cet6')
ORDER BY created_at DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM user_word_progress
WHERE user_id = 'your-user-id'
  AND next_review_date <= CURRENT_DATE
ORDER BY next_review_date;
