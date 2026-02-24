-- 系统设置表 - 存储百度翻译API Key等系统配置
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认的百度翻译API配置（空值，表示未配置）
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('baidu_translate_appid', '', '百度翻译API AppID')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('baidu_translate_secret', '', '百度翻译API Secret Key')
ON CONFLICT (setting_key) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
