-- ============================================
-- 智忆单词系统 - RLS 策略完整修复
-- 执行方式：在 Supabase SQL Editor 中运行
-- ============================================

-- ============================================
-- 1. user_settings 表策略
-- ============================================

-- 删除可能存在的旧策略（防止重复创建报错）
DROP POLICY IF EXISTS "Allow read user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow update own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow insert own user_settings" ON user_settings;

-- 添加：允许认证用户读取自己的设置
CREATE POLICY "Allow read user_settings" ON user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- 添加：允许用户更新自己的设置
CREATE POLICY "Allow update own user_settings" ON user_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 添加：允许用户插入自己的设置
CREATE POLICY "Allow insert own user_settings" ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 添加：允许管理员读取所有设置
CREATE POLICY "Allow admin read all user_settings" ON user_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 添加：允许管理员更新所有设置
CREATE POLICY "Allow admin update all user_settings" ON user_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- 2. user_learning_plans 表策略
-- ============================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Allow read own learning plans" ON user_learning_plans;
DROP POLICY IF EXISTS "Allow insert own learning plans" ON user_learning_plans;
DROP POLICY IF EXISTS "Allow update own learning plans" ON user_learning_plans;
DROP POLICY IF EXISTS "Allow delete own learning plans" ON user_learning_plans;

-- 添加：允许用户读取自己的学习计划
CREATE POLICY "Allow read own learning plans" ON user_learning_plans
    FOR SELECT
    USING (auth.uid() = user_id);

-- 添加：允许用户插入自己的学习计划
CREATE POLICY "Allow insert own learning plans" ON user_learning_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 添加：允许用户更新自己的学习计划
CREATE POLICY "Allow update own learning plans" ON user_learning_plans
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 添加：允许用户删除自己的学习计划
CREATE POLICY "Allow delete own learning plans" ON user_learning_plans
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. 验证结果
-- ============================================

-- 查看所有表的策略
SELECT 
    tablename, 
    policyname, 
    cmd, 
    CASE 
        WHEN permissive = 't' THEN 'PERMISSIVE' 
        ELSE 'RESTRICTIVE' 
    END as type
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 测试查询（应该在返回结果中看到 user_settings 和 user_learning_plans 的策略）
