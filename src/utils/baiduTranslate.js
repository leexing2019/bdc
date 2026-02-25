// 百度翻译 API 服务
// 用于获取单词的中文释义

import { supabaseAdmin } from '@/lib/supabase'

// Supabase 项目配置
const SUPABASE_URL = 'https://aszsysdhmakczwwxabfr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTA2ODAsImV4cCI6MjA4NjcyNjY4MH0.RWYFx-qyyux6jV92K-AwHDdQo0L8R5PJmj4ERA3POmo'

/**
 * 翻译文本（英文→中文）
 * 通过 Edge Function 代理调用百度翻译 API
 * @param {string} text - 要翻译的英文文本
 * @returns {Promise<{success: boolean, translation?: string, error?: string}>}
 */
export async function translateToChinese(text) {
  if (!text) {
    return { success: false, error: '缺少翻译文本' }
  }

  try {
    // 调用 Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/baidu-translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        text: text,
        from: 'en',
        to: 'zh'
      })
    })

    const data = await response.json()

    if (!data.success) {
      return { success: false, error: data.error || '翻译失败' }
    }

    return { success: true, translation: data.translation }
  } catch (error) {
    console.error('百度翻译失败:', error)
    return { success: false, error: error.message || '翻译请求失败' }
  }
}

/**
 * 检查百度翻译 API 是否可用
 * @returns {Promise<{available: boolean, message: string}>}
 */
export async function checkBaiduTranslationAvailable() {
  try {
    console.log('[百度翻译] 开始检查配置...')
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['baidu_translate_appid', 'baidu_translate_secret'])
    
    console.log('[百度翻译] 完整查询结果:', JSON.stringify(data))
    
    if (error) {
      console.error('[百度翻译] 查询错误:', error)
      return { available: false, message: '查询失败: ' + error.message }
    }
    
    if (!data || data.length === 0) {
      console.log('[百度翻译] 没有找到配置数据')
      return { available: false, message: '未配置百度翻译 API' }
    }
    
    const appid = data.find(s => s.setting_key === 'baidu_translate_appid')?.setting_value
    const secret = data.find(s => s.setting_key === 'baidu_translate_secret')?.setting_value
    
    console.log('[百度翻译] appid 值:', appid ? '已设置' : '未设置', '长度:', appid?.length)
    console.log('[百度翻译] secret 值:', secret ? '已设置' : '未设置', '长度:', secret?.length)
    
    if (!appid || !secret) {
      return { available: false, message: '未配置百度翻译 API' }
    }
    
    // Edge Function 会自动从数据库读取配置，所以这里返回已配置
    return { available: true, message: '已配置', appid, secret }
  } catch (error) {
    console.error('检查百度翻译配置失败:', error)
    return { available: false, message: '检查配置失败: ' + error.message }
  }
}
