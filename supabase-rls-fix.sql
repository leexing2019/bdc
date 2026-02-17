-- 智忆单词系统 - RLS 策略修复脚本
-- 执行时间: 2026-02-16

-- ============================================
-- 首先启用 RLS（如果尚未启用）
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- users 表策略
-- ============================================

-- 允许所有人读取用户信息（用于登录）
CREATE POLICY "Allow read users for auth" ON users
    FOR SELECT
    USING (true);

-- 允许管理员更新用户
CREATE POLICY "Allow admin update users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 允许用户更新自己的信息
CREATE POLICY "Allow users update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- words 表策略（核心词库表）
-- ============================================

-- 允许所有人读取单词
CREATE POLICY "Allow read words" ON words
    FOR SELECT
    USING (true);

-- 允许认证用户插入单词（管理员和学生都可以添加）
CREATE POLICY "Allow authenticated insert words" ON words
    FOR INSERT
    WITH CHECK (true);

-- 允许认证用户更新单词
CREATE POLICY "Allow authenticated update words" ON words
    FOR UPDATE
    USING (true);

-- 允许认证用户删除单词
CREATE POLICY "Allow authenticated delete words" ON words
    FOR DELETE
    USING (true);

-- ============================================
-- user_word_progress 表策略
-- ============================================

-- 允许用户读取自己的进度
CREATE POLICY "Allow read own progress" ON user_word_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- 允许用户插入自己的进度
CREATE POLICY "Allow insert own progress" ON user_word_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的进度
CREATE POLICY "Allow update own progress" ON user_word_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- study_logs 表策略
-- ============================================

-- 允许用户读取自己的学习记录
CREATE POLICY "Allow read own study logs" ON study_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- 允许用户插入自己的学习记录
CREATE POLICY "Allow insert own study logs" ON study_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的学习记录
CREATE POLICY "Allow update own study logs" ON study_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- user_custom_words 表策略
-- ============================================

-- 允许用户读取自己的自定义单词
CREATE POLICY "Allow read own custom words" ON user_custom_words
    FOR SELECT
    USING (auth.uid() = user_id);

-- 允许用户插入自己的自定义单词
CREATE POLICY "Allow insert own custom words" ON user_custom_words
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的自定义单词
CREATE POLICY "Allow delete own custom words" ON user_custom_words
    FOR DELETE
    USING (auth.uid() = user_id);

-- 允许管理员读取所有自定义单词
CREATE POLICY "Allow admin read all custom words" ON user_custom_words
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 允许管理员更新自定义单词状态
CREATE POLICY "Allow admin update custom words" ON user_custom_words
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- admin_logs 表策略
-- ============================================

-- 允许管理员读取所有操作日志
CREATE POLICY "Allow admin read all logs" ON admin_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 允许管理员插入操作日志
CREATE POLICY "Allow admin insert logs" ON admin_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- user_settings 表策略
-- ============================================

-- 允许用户读取自己的设置
CREATE POLICY "Allow read own settings" ON user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- 允许用户更新自己的设置
CREATE POLICY "Allow update own settings" ON user_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 允许用户插入自己的设置
CREATE POLICY "Allow insert own settings" ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 允许管理员读取所有用户设置
CREATE POLICY "Allow admin read all settings" ON user_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 允许管理员更新所有用户设置
CREATE POLICY "Allow admin update all settings" ON user_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- 创建服务角色策略（用于绕过RLS的管理操作）
-- ============================================

-- 允许 service role 完全访问 words 表
CREATE POLICY "Allow service role full access words" ON words
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 允许 service role 完全访问 users 表
CREATE POLICY "Allow service role full access users" ON users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 允许 service role 完全访问 user_word_progress 表
CREATE POLICY "Allow service role full access progress" ON user_word_progress
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 允许 service role 完全访问 study_logs 表
CREATE POLICY "Allow service role full access study_logs" ON study_logs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 允许 service role 完全访问 user_custom_words 表
CREATE POLICY "Allow service role full access custom_words" ON user_custom_words
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 允许 service role 完全访问 admin_logs 表
CREATE POLICY "Allow service role full access admin_logs" ON admin_logs
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 验证 RLS 策略
-- ============================================

-- 查看所有策略
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
