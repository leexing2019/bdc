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
      .select('setting_key, setting_value')
      .in('setting_key', ['baidu_translate_appid', 'baidu_translate_secret'])

    // 调试日志
    console.log('Settings query result:', JSON.stringify({ settings, error }))
    console.log('Settings count:', settings?.length)

    if (error || !settings || settings.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: '未配置百度翻译API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appid = settings.find(s => s.setting_key === 'baidu_translate_appid')?.setting_value
    const secret = settings.find(s => s.setting_key === 'baidu_translate_secret')?.setting_value

    // 调试日志 - 不输出完整值，只输出长度
    console.log('AppID length:', appid?.length, 'Secret length:', secret?.length)

    if (!appid || !secret) {
      return new Response(
        JSON.stringify({ success: false, error: '百度翻译API未配置完整' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 生成签名
    const salt = Math.random().toString(36).substring(2, 15)
    const sign = generateMD5(appid + text + salt + secret)
    
    // 调试日志 - 输出签名原文和结果
    console.log('Sign input:', appid + text + salt + secret)
    console.log('Generated sign:', sign)

    // 调用百度翻译 API
    const formData = new URLSearchParams()
    formData.append('q', text)
    formData.append('from', from)
    formData.append('to', to)
    formData.append('appid', appid)
    formData.append('salt', salt)
    formData.append('sign', sign)

    // 调试日志 - 输出完整的请求参数
    console.log('Request formData:', formData.toString())

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

// 生成 MD5 签名 (纯JavaScript实现)
function generateMD5(str: string): string {
  const rotateLeft = (value: number, shift: number): number => {
    return (value << shift) | (value >>> (32 - shift))
  }

  const addUnsigned = (x: number, y: number): number => {
    const result = (x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)
    if (x & 0x80000000) {
      if (y & 0x80000000) {
        return result ^ 0x80000000 ^ 0x80000000
      } else {
        return result ^ 0x80000000
      }
    } else {
      if (y & 0x80000000) {
        return result ^ 0x80000000
      } else {
        return result
      }
    }
  }

  const F = (x: number, y: number, z: number): number => (x & y) | (~x & z)
  const G = (x: number, y: number, z: number): number => (x & z) | (y & ~z)
  const H = (x: number, y: number, z: number): number => x ^ y ^ z
  const I = (x: number, y: number, z: number): number => y ^ (x | ~z)

  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number => {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number => {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number => {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number => {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const convertToWordArray = (str: string): number[] => {
    const lWordCount: number[] = []
    const lMessageLength = str.length
    const lNumberOfWords = (((lMessageLength + 8) >>> 6) + 1) * 16

    for (let i = 0; i < lNumberOfWords; i++) {
      lWordCount[i] = 0
    }

    let lBytePosition = 0
    let lByteCount = 0
    while (lByteCount < lMessageLength) {
      const lWordIndex = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordCount[lWordIndex] = lWordCount[lWordIndex] | (str.charCodeAt(lByteCount) << lBytePosition)
      lByteCount++
    }

    const lWordIndex = (lByteCount - (lByteCount % 4)) / 4
    lBytePosition = (lByteCount % 4) * 8
    lWordCount[lWordIndex] = lWordCount[lWordIndex] | (0x80 << lBytePosition)
    lWordCount[lNumberOfWords - 2] = lMessageLength * 8

    return lWordCount
  }

  const wordToHex = (value: number): string => {
    let hex = ''
    for (let i = 0; i <= 3; i++) {
      const byte = (value >>> (i * 8)) & 255
      hex += ('0' + byte.toString(16)).slice(-2)
    }
    return hex
  }

  let x = convertToWordArray(str)
  let a = 0x67452301
  let b = 0xEFCDAB89
  let c = 0x98BADCFE
  let d = 0x10325476

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21

  for (let k = 0; k < x.length; k += 16) {
    const AA = a
    const BB = b
    const CC = c
    const DD = d

    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821)

    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)

    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)

    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244)
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314)
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391)

    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
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
