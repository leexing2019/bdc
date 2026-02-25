// 百度翻译 API 服务
// 用于获取单词的中文释义

import { supabaseAdmin } from '@/lib/supabase'

/**
 * 翻译文本（英文→中文）
 * @param {string} text - 要翻译的英文文本
 * @param {string} appid - 百度翻译 AppID
 * @param {string} secret - 百度翻译 Secret Key
 * @returns {Promise<{success: boolean, translation?: string, error?: string}>}
 */
export async function translateToChinese(text, appid, secret) {
  if (!text || !appid || !secret) {
    return { success: false, error: '缺少必要参数' }
  }


  try {
    // 生成签名
    const salt = Math.random().toString(36).substring(2, 15)
    const sign = await generateSign(text, appid, secret, salt)
    
    const response = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        q: text,
        from: 'en',
        to: 'zh',
        appid: appid,
        salt: salt,
        sign: sign
      })
    })

    const data = await response.json()

    // 检查错误码
    if (data.error_code) {
      const errorMsg = getErrorMessage(data.error_code)
      return { success: false, error: errorMsg }
    }


    // 提取翻译结果
    if (data.trans_result && data.trans_result.length > 0) {
      return { success: true, translation: data.trans_result[0].dst }
    }

    return { success: false, error: '未获取到翻译结果' }
  } catch (error) {
    console.error('百度翻译失败:', error)
    return { success: false, error: error.message || '翻译请求失败' }
  }
}

/**
 * 生成百度翻译签名
 */
async function generateSign(query, appid, salt, secret) {
  const str = appid + query + salt + secret
  // 使用 Web Crypto API 进行 MD5 哈希
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
const hashBuffer = await crypto.subtle.digest('MD5', data).catch(() => {
    // 如果 crypto.subtle 不支持 MD5，使用简单的哈希
    return simpleMD5(str)
  })
  
  if (hashBuffer instanceof ArrayBuffer) {
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  return hashBuffer
}

/**
 * 简单的 MD5 替代方案
 */
function simpleMD5(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  // 转换为 16 进制字符串
  let result = ''
  const hex = Math.abs(hash).toString(16)
  for (let i = 0; i < 32 - hex.length; i++) {
    result += '0'
  }
  return result + hex
}

/**
 * 获取错误码对应的错误信息
 */
function getErrorMessage(errorCode) {
  const errorMessages = {
    52001: '请求超时，请重试',
    52002: '系统错误，请重试',
    52003: '未授权用户，请检查 AppID 和 SecretKey',
    54000: '签名错误，请检查签名算法',
    54001: '签名错误，MD5 签名错误',
    54003: '访问频率受限，请降低调用频率',
    54004: '账户余额不足',
    54005: '长query请求频繁，请降低调用频率或使用单次翻译',
    54006: '无效的请求类型',
    58000: '客户端 IP 非法',
    58001: "译文语言方向不支持",
    58002: '服务当前已关闭',
    54007: '无有效访问凭证'
  }
  
  return errorMessages[errorCode] || `翻译失败 (错误码: ${errorCode})`
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
      .select('setting_value')
      .in('setting_key', ['baidu_translate_appid', 'baidu_translate_secret'])
    
    console.log('[百度翻译] 查询结果:', { data, error })
    
    const appid = data?.find(s => s.setting_key === 'baidu_translate_appid')?.setting_value
    const secret = data?.find(s => s.setting_key === 'baidu_translate_secret')?.setting_value
    
    console.log('[百度翻译] appid:', appid ? '已设置' : '未设置')
    console.log('[百度翻译] secret:', secret ? '已设置' : '未设置')
    
    if (!appid || !secret) {
      return { available: false, message: '未配置百度翻译 API' }
    }
    
    return { available: true, message: '已配置', appid, secret }
  } catch (error) {
    console.error('检查百度翻译配置失败:', error)
    return { available: false, message: '检查配置失败: ' + error.message }
  }
}
