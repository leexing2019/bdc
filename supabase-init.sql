-- 智忆单词系统 - 数据库初始化脚本
-- 创建时间: 2026-02-15

-- 1. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    daily_limit INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 2. 单词表 (words)
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spelling VARCHAR(100) NOT NULL,
    part_of_speech VARCHAR(20),
    meaning TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'custom',
    phonetic VARCHAR(100),
    audio_url TEXT,
    example_sentence TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 用户单词进度表 (user_word_progress) - SM-2算法
CREATE TABLE IF NOT EXISTS user_word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    ease_factor DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE DEFAULT CURRENT_DATE,
    last_review_date DATE,
    proficiency INTEGER DEFAULT 0 CHECK (proficiency BETWEEN 0 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

-- 4. 学习记录表 (study_logs)
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    new_words_learned INTEGER DEFAULT 0,
    words_reviewed INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 用户自定义单词表 (user_custom_words) - 用户上传的单词
CREATE TABLE IF NOT EXISTS user_custom_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spelling VARCHAR(100) NOT NULL,
    part_of_speech VARCHAR(20),
    meaning TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 管理员操作日志表 (admin_logs)
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES users(id),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 用户设置表 (user_settings)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    category VARCHAR(50) DEFAULT 'all',
    custom_daily_limit INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_next_review ON user_word_progress(next_review_date);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON study_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_words_spelling ON words(spelling);
CREATE INDEX IF NOT EXISTS idx_user_custom_words_user_id ON user_custom_words(user_id);

-- 插入默认管理员账号 (密码: admin123, 使用bcrypt加密)
-- 注意: 实际使用时密码应该通过后端加密存储
INSERT INTO users (username, password, role, daily_limit) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 0)
ON CONFLICT (username) DO NOTHING;

-- 插入示例学生账号 (密码: student123)
INSERT INTO users (username, password, role, daily_limit) 
VALUES ('student', '$2a$10$UQo.VcR4Qv2G4J.6pJHjLeIxM4jLz6p5WzK8h3qNxP5xN7vK8yLmO', 'student', 20)
ON CONFLICT (username) DO NOTHING;

-- 插入示例单词数据
INSERT INTO words (spelling, part_of_speech, meaning, category, phonetic, example_sentence) VALUES
('abandon', 'v.', '放弃，遗弃', 'CET-4', '/əˈbændən/', 'The scientists had to abandon their research due to lack of funding.'),
('ability', 'n.', '能力', 'CET-4', '/əˈbɪləti/', 'She has the ability to speak three languages fluently.'),
('able', 'adj.', '能够的', 'CET-4', '/ˈeɪbl/', 'He was able to finish the project ahead of schedule.'),
('about', 'prep.', '关于', 'CET-4', '/əˈbaʊt/', 'We talked about the new movie last night.'),
('above', 'prep.', '在...上面', 'CET-4', '/əˈbʌv/', 'The birds flew above the clouds.'),
('abroad', 'adv.', '在国外', 'CET-4', '/əˈbrɔːd/', 'She decided to study abroad in France.'),
('absence', 'n.', '缺席，不在', 'CET-4', '/ˈæbsəns/', 'His absence from the meeting was noted.'),
('absolute', 'adj.', '绝对的', 'CET-4', '/ˈæbsəluːt/', 'There is no absolute truth in this matter.'),
('accept', 'v.', '接受', 'CET-4', '/əkˈsept/', 'Please accept my sincere apologies.'),
('accident', 'n.', '事故', 'CET-4', '/ˈæksɪdənt/', 'The accident happened on the highway.'),
('account', 'n.', '账户', 'CET-4', '/əˈkaʊnt/', 'She opened a bank account yesterday.'),
('achieve', 'v.', '达到，获得', 'CET-4', '/əˈtʃiːv/', 'He achieved great success in his career.'),
('across', 'prep.', '穿过', 'CET-4', '/əˈkrɒs/', 'Walk across the street to find the store.'),
('active', 'adj.', '积极的，主动的', 'CET-4', '/ˈæktɪv/', 'She takes an active part in community activities.'),
('activity', 'n.', '活动', 'CET-4', '/ækˈtɪvəti/', 'The children enjoyed outdoor activities.'),
('actual', 'adj.', '实际的', 'CET-4', '/ˈæktʃuəl/', 'What was the actual cost of the project?'),
('adapt', 'v.', '适应，改编', 'CET-4', '/əˈdæpt/', 'The movie was adapted from a novel.'),
('add', 'v.', '添加', 'CET-4', '/æd/', 'Please add some sugar to the mixture.'),
('address', 'n.', '地址', 'CET-4', '/əˈdres/', 'Please write your address clearly.'),
('advance', 'v.', '前进，进步', 'CET-4', '/ədˈvɑːns/', 'Technology has advanced rapidly in recent years.')
ON CONFLICT DO NOTHING;
