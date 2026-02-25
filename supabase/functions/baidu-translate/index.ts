// 百度翻译代理函数
// 用于绕过 CORS 限制

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, from = 'en', to = 'zh' } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少翻译文本' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 从数据库获取百度翻译配置
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .in('setting_key', ['baidu_translate_appid', 'baidu_translate_secret'])

    if (error || !settings || settings.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: '未配置百度翻译API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appid = settings.find(s => s.setting_key === 'baidu_translate_appid')?.setting_value
    const secret = settings.find(s => s.setting_key === 'baidu_translate_secret')?.setting_value

    if (!appid || !secret) {
      return new Response(
        JSON.stringify({ success: false, error: '百度翻译API未配置完整' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 生成签名
    const salt = Math.random().toString(36).substring(2, 15)
    const sign = await generateMD5(appid + text + salt + secret)

    // 调用百度翻译 API
    const formData = new URLSearchParams()
    formData.append('q', text)
    formData.append('from', from)
    formData.append('to', to)
    formData.append('appid', appid)
    formData.append('salt', salt)
    formData.append('sign', sign)

    const response = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await response.json()

    // 检查错误码
    if (data.error_code) {
      const errorMsg = getErrorMessage(data.error_code)
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 返回翻译结果
    if (data.trans_result && data.trans_result.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          translation: data.trans_result[0].dst
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: '未获取到翻译结果' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 生成 MD5 签名
async function generateMD5(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 获取错误信息
function getErrorMessage(errorCode: number): string {
  const errorMessages: Record<number, string> = {
    52001: '请求超时，请重试',
    52002: '系统错误，请重试',
    52003: '未授权用户，请检查AppID和SecretKey',
    54000: '签名错误，请检查签名算法',
    54001: '签名错误，MD5签名错误',
    54003: '访问频率受限，请降低调用频率',
    54004: '账户余额不足',
    54005: '长query请求频繁，请降低调用频率',
    54006: '无效的请求类型',
    58000: '客户端IP非法',
    58001: '译文语言方向不支持',
    58002: '服务当前已关闭',
  }
  return errorMessages[errorCode] || `翻译失败 (错误码: ${errorCode})`
}
