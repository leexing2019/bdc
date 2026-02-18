// Dictionary API Service
// Fetches word definitions and examples from Free Dictionary API
// Falls back to DeepSeek API for example generation when needed

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

/**
 * Test DeepSeek API connectivity
 * @param {string} apiKey - DeepSeek API key
 * @returns {Promise<{success: boolean, message: string, example?: string}>}
 */
export async function testDeepSeekApi(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: '请输入 API Key' }
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello" in exactly one word to confirm the connection is working. Just reply with the single word.'
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'API Key 无效，请检查后重试' }
      }
      if (response.status === 403) {
        return { success: false, message: 'API Key 没有访问权限' }
      }
      return { success: false, message: `API 请求失败 (${response.status})` }
    }

    const data = await response.json()
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const reply = data.choices[0].message.content.trim()
      return { 
        success: true, 
        message: '连接成功！DeepSeek API 可以正常使用',
        example: reply
      }
    }
    
    return { success: false, message: 'API 响应格式异常' }
  } catch (error) {
    console.error('DeepSeek API test error:', error)
    return { success: false, message: `连接失败: ${error.message}` }
  }
}

/**
 * Generate example sentence using DeepSeek API
 * @param {string} word - The word to generate example for
 * @param {string} definition - Optional definition to provide context
 * @param {string} apiKey - DeepSeek API key
 * @returns {Promise<string|null>}
 */
export async function generateExampleWithDeepSeek(word, definition, apiKey) {
  if (!apiKey || !word) {
    return null
  }

  const prompt = definition
    ? `Generate one natural English example sentence using the word "${word}" in context. The word means: "${definition}". Just return the example sentence, nothing else.`
    : `Generate one natural English example sentence using the word "${word}" in context. Just return the example sentence, nothing else.`

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status)
      return null
    }

    const data = await response.json()
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim()
    }
    return null
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return null
  }
}

/**
 * Fetch word data from Dictionary API, with DeepSeek fallback for examples
 * @param {string} word - The word to look up
 * @param {string} deepseekApiKey - Optional DeepSeek API key for example generation
 * @returns {Promise<{definition: string|null, example: string|null, phonetic: string|null}>}
 */
export async function fetchWordData(word, deepseekApiKey = null) {
  if (!word || !word.trim()) {
    return { definition: null, example: null, phonetic: null }
  }

  // 清理单词：移除空格、下划线等，只保留纯单词
  let cleanWord = word.trim().toLowerCase()
  
  // 如果包含空格（下短语）或下划线，尝试只取第一个单词
  const hasSpaceOrUnderscore = cleanWord.includes(' ') || cleanWord.includes('_')
  const originalWord = cleanWord
  if (hasSpaceOrUnderscore) {
    cleanWord = cleanWord.split(/[\s_]/)[0]
  }

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(cleanWord)}`)

    if (!response.ok) {
      // Word not found or API error, try DeepSeek if API key provided
      if (deepseekApiKey) {
        // 使用原始输入词生成例句
        const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey)
        return { definition: null, example: example, phonetic: null }
      }
      return { definition: null, example: null, phonetic: null }
    }

    const data = await response.json()

    if (!data || !data[0]) {
      if (deepseekApiKey) {
        const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey)
        return { definition: null, example: example, phonetic: null }
      }
      return { definition: null, example: null, phonetic: null }
    }

    const wordData = data[0]

    // Extract phonetic
    let phonetic = null
    if (wordData.phonetic) {
      phonetic = wordData.phonetic
    } else if (wordData.phonetics && wordData.phonetics.length > 0) {
      // Find first non-empty phonetic
      for (const p of wordData.phonetics) {
        if (p.text) {
          phonetic = p.text
          break
        }
      }
    }

    // Extract definition and example from meanings
    const meanings = wordData.meanings || []

    for (const meaning of meanings) {
      const definitions = meaning.definitions || []

      for (const def of definitions) {
        if (def.definition) {
          let example = def.example || null
          
          // If no example from Dictionary API, try DeepSeek
          if (!example && deepseekApiKey) {
            example = await generateExampleWithDeepSeek(originalWord, def.definition, deepseekApiKey)
          }
          
          return {
            definition: def.definition,
            example: example,
            phonetic: phonetic
          }
        }
      }
    }

    // No definition found, try DeepSeek for example
    if (deepseekApiKey) {
      const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey)
      return { definition: null, example: example, phonetic: phonetic }
    }

    return { definition: null, example: null, phonetic: phonetic }
  } catch (error) {
    console.error('Dictionary API error:', error)
    // Try DeepSeek as fallback on error
    if (deepseekApiKey) {
      const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey)
      return { definition: null, example: example, phonetic: null }
    }
    return { definition: null, example: null, phonetic: null }
  }
}

/**
 * Batch fetch word data with rate limiting
 * @param {string[]} words - Array of words to look up
 * @param {Function} onProgress - Progress callback (current, total, word)
 * @param {number} delayMs - Delay between requests (default 300ms)
 * @param {string} deepseekApiKey - Optional DeepSeek API key for example generation
 * @returns {Promise<Array<{word: string, success: boolean, data: any}>>}
 */
export async function fetchWordDataBatch(words, onProgress = null, delayMs = 300, deepseekApiKey = null) {
  const results = []
  const total = words.length

  // Helper function for delay
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    if (onProgress) {
      onProgress(i + 1, total, word)
    }

    const data = await fetchWordData(word, deepseekApiKey)
    results.push({
      word: word,
      success: !!data.definition,
      data: data
    })

    // Add delay to avoid rate limiting (except for last item)
    if (i < words.length - 1 && delayMs > 0) {
      await sleep(delayMs)
    }
  }

  return results
}
