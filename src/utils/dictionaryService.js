// Dictionary API Service
// Fetches word definitions and examples from Free Dictionary API
// Falls back to DeepSeek API for example generation when needed

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

// 常见国家名称列表（允许专有名词）
const commonCountries = [
  'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'antigua and barbuda', 'argentina', 'armenia', 'australia', 'austria',
  'azerbaijan', 'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan',
  'bolivia', 'bosnia and herzegovina', 'botswana', 'brazil', 'brunei darussalam', 'bulgaria', 'burkina faso', 'burundi', 'cabo verde', 'cambodia',
  'cameroon', 'canada', 'central african republic', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo', 'costa rica',
  'croatia', 'cuba', 'cyprus', 'czechia', 'democratic republic of the congo', 'denmark', 'djibouti', 'dominica', 'dominican republic', 'ecuador',
  'egypt', 'el salvador', 'equatorial guinea', 'eritrea', 'estonia', 'eswatini', 'ethiopia', 'fiji', 'finland', 'france',
  'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guinea-bissau',
  'guyana', 'haiti', 'honduras', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland',
  'israel', 'italy', 'ivory coast', 'jamaica', 'japan', 'jordan', 'kazakhstan', 'kenya', 'kiribati', 'kosovo',
  'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania',
  'luxembourg', 'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall islands', 'mauritania', 'mauritius',
  'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar', 'namibia',
  'nauru', 'nepal', 'netherlands', 'new zealand', 'nicaragua', 'niger', 'nigeria', 'north korea', 'north macedonia', 'norway',
  'oman', 'pakistan', 'palau', 'palestine', 'panama', 'papua new guinea', 'paraguay', 'peru', 'philippines', 'poland',
  'portugal', 'qatar', 'romania', 'russia', 'rwanda', 'saint kitts and nevis', 'saint lucia', 'saint vincent and the grenadines', 'samoa', 'san marino',
  'sao tome and principe', 'saudi arabia', 'senegal', 'serbia', 'seychelles', 'sierra leone', 'singapore', 'slovakia', 'slovenia', 'solomon islands',
  'somalia', 'south africa', 'south korea', 'south sudan', 'spain', 'sri lanka', 'sudan', 'suriname', 'sweden', 'switzerland',
  'syria', 'tajikistan', 'tanzania', 'thailand', 'timor-leste', 'togo', 'tonga', 'trinidad and tobago', 'tunisia', 'turkey',
  'turkmenistan', 'tuvalu', 'uganda', 'ukraine', 'united arab emirates', 'united kingdom', 'united states', 'uruguay', 'uzbekistan', 'vanuatu',
  'vatican city', 'venezuela', 'vietnam', 'yemen', 'zambia', 'zimbabwe',
  'america', 'united states of america',
  'people\'s republic of china', 'republic of korea', 'democratic people\'s republic of korea'
]

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
 * @param {string} partOfSpeech - Optional part of speech (e.g., 'intransitive verb', 'transitive verb')
 * @returns {Promise<string|null>}
 */
export async function generateExampleWithDeepSeek(word, definition, apiKey, partOfSpeech = null) {
  if (!apiKey || !word) {
    return null
  }

  // 构建prompt，包含词性信息
  let prompt = ''
  if (partOfSpeech && definition) {
    prompt = `Generate one natural English example sentence using the word "${word}" as a ${partOfSpeech}. The word means: "${definition}". Just return the example sentence, nothing else.`
  } else if (partOfSpeech) {
    prompt = `Generate one natural English example sentence using the word "${word}" as a ${partOfSpeech}. Just return the example sentence, nothing else.`
  } else if (definition) {
    prompt = `Generate one natural English example sentence using the word "${word}" in context. The word means: "${definition}". Just return the example sentence, nothing else.`
  } else {
    prompt = `Generate one natural English example sentence using the word "${word}" in context. Just return the example sentence, nothing else.`
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
 * 词性映射表：用户输入的词性 -> Dictionary API 返回的词性
 */
const partOfSpeechMapping = {
  'vi.': 'intransitive verb',
  'vt.': 'transitive verb',
  'v.': 'verb',
  'verb': 'verb',
  'n.': 'noun',
  'noun': 'noun',
  'adj.': 'adjective',
  'adjective': 'adjective',
  'adv.': 'adverb',
  'adverb': 'adverb',
  'pron.': 'pronoun',
  'pronoun': 'pronoun',
  'num.': 'numeral',
  'numeral': 'numeral',
  'prep.': 'preposition',
  'preposition': 'preposition',
  'conj.': 'conjunction',
  'conjunction': 'conjunction',
  'interj.': 'interjection',
  'interjection': 'interjection'
}

/**
 * 将用户输入的词性转换为Dictionary API格式
 * @param {string} pos - 用户输入的词性 (如 vi., vt., n., adj.)
 * @returns {string} - 转换后的词性 (如 verb, noun, adjective)
 */
function normalizePartOfSpeech(pos) {
  if (!pos) return null
  const normalized = pos.toLowerCase().trim()
  return partOfSpeechMapping[normalized] || normalized
}

/**
 * Fetch word data from Dictionary API, with DeepSeek fallback for examples
 * @param {string} word - The word to look up
 * @param {string} deepseekApiKey - Optional DeepSeek API key for example generation
 * @param {string} partOfSpeech - Optional part of speech to match (e.g., 'vi.', 'vt.', 'n.')
 * @returns {Promise<{definition: string|null, example: string|null, phonetic: string|null, audio: string|null, exampleSource: string|null>}
 *          exampleSource can be: 'dictionary' | 'deepseek' | null
 */
export async function fetchWordData(word, deepseekApiKey = null, partOfSpeech = null) {
  if (!word || !word.trim()) {
    return { definition: null, example: null, phonetic: null, audio: null, exampleSource: null }
  }

  // 清理单词：移除空格、下划线等，只保留纯单词
  let cleanWord = word.trim().toLowerCase()
  
  // 如果包含空格（下短语）或下划线，尝试只取第一个单词
  const hasSpaceOrUnderscore = cleanWord.includes(' ') || cleanWord.includes('_')
  const originalWord = cleanWord
  if (hasSpaceOrUnderscore) {
    cleanWord = cleanWord.split(/[\s_]/)[0]
  }

  // 转换用户输入的词性
  const targetPOS = normalizePartOfSpeech(partOfSpeech)
  console.log('目标词性:', partOfSpeech, '->', targetPOS)

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(cleanWord)}`)

    if (!response.ok) {
      // Word not found or API error (including 429 rate limit)
      console.warn(`Dictionary API error for ${cleanWord}: ${response.status}`)

      // 检查是否是国家名称（使用原始输入）
      if (commonCountries.includes(originalWord)) {
        return { definition: '国家名称', example: null, phonetic: null, audio: null, exampleSource: null, isCountry: true }
      }

      // Try DeepSeek if API key provided
      if (deepseekApiKey) {
        // 使用原始输入词生成例句，带上词性信息
        const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey, targetPOS)
        return { definition: null, example: example, phonetic: null, audio: null, exampleSource: example ? 'deepseek' : null }
      }
      return { definition: null, example: null, phonetic: null, audio: null, exampleSource: null }
    }

    const data = await response.json()

    if (!data || !data[0]) {
      // No data returned
      // 检查是否是国家名称（使用原始输入）
      if (commonCountries.includes(originalWord)) {
        return { definition: '国家名称', example: null, phonetic: null, audio: null, exampleSource: null, isCountry: true }
      }

      if (deepseekApiKey) {
        const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey, targetPOS)
        return { definition: null, example: example, phonetic: null, audio: null, exampleSource: example ? 'deepseek' : null }
      }
      return { definition: null, example: null, phonetic: null, audio: null, exampleSource: null }
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

    // Extract audio URL
    let audio = null
    if (wordData.audio) {
      audio = wordData.audio
    } else if (wordData.phonetics && wordData.phonetics.length > 0) {
      // Find first non-empty audio
      for (const p of wordData.phonetics) {
        if (p.audio) {
          audio = p.audio
          break
        }
      }
    }

    // Extract definition and example from meanings, matching the part of speech
    const meanings = wordData.meanings || []
    
    // 首先尝试匹配用户指定的词性
    if (targetPOS) {
      for (const meaning of meanings) {
        const meaningPOS = meaning.partOfSpeech?.toLowerCase()
        // 检查词性是否匹配（包括模糊匹配）
        if (meaningPOS && (meaningPOS === targetPOS || meaningPOS.includes(targetPOS) || targetPOS.includes(meaningPOS))) {
          const definitions = meaning.definitions || []
          for (const def of definitions) {
            if (def.definition) {
              let example = def.example || null
              let exampleSource = example ? 'dictionary' : null
              
              // If no example from Dictionary API, try DeepSeek
              if (!example && deepseekApiKey) {
                example = await generateExampleWithDeepSeek(originalWord, def.definition, deepseekApiKey, targetPOS)
                exampleSource = example ? 'deepseek' : null
              }
              
              return {
                definition: def.definition,
                example: example,
                phonetic: phonetic,
                audio: audio,
                exampleSource: exampleSource
              }
            }
          }
        }
      }
    }
    
    // 如果没有匹配到指定词性，返回第一个有例句的
    for (const meaning of meanings) {
      const definitions = meaning.definitions || []

      for (const def of definitions) {
        if (def.definition) {
          let example = def.example || null
          let exampleSource = example ? 'dictionary' : null
          
          // If no example from Dictionary API, try DeepSeek
          if (!example && deepseekApiKey) {
            example = await generateExampleWithDeepSeek(originalWord, def.definition, deepseekApiKey, targetPOS)
            exampleSource = example ? 'deepseek' : null
          }
          
          return {
            definition: def.definition,
            example: example,
            phonetic: phonetic,
            audio: audio,
            exampleSource: exampleSource
          }
        }
      }
    }

    // No definition found, try DeepSeek for example
    if (deepseekApiKey) {
      const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey, targetPOS)
      return { definition: null, example: example, phonetic: phonetic, audio: audio, exampleSource: example ? 'deepseek' : null }
    }

    return { definition: null, example: null, phonetic: phonetic, audio: audio, exampleSource: null }
  } catch (error) {
    console.error('Dictionary API error:', error.message)
    // Try DeepSeek as fallback on error (网络错误、CORS错误等)
    try {
      if (deepseekApiKey) {
        const example = await generateExampleWithDeepSeek(originalWord, null, deepseekApiKey, targetPOS)
        return { definition: null, example: example, phonetic: null, audio: null, exampleSource: example ? 'deepseek' : null }
      }
    } catch (deepseekError) {
      console.error('DeepSeek fallback also failed:', deepseekError.message)
    }
    return { definition: null, example: null, phonetic: null, audio: null, exampleSource: null }
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
