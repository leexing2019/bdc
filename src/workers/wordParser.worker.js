// Word Parser Worker
// 在后台线程解析单词，避免阻塞主线程

// 简化的智能解析逻辑（从 smartWordParser.js 移植）
const COMMON_PHRASES = [
  'account for', 'add up', 'add up to', 'addicted to', 'adequate for',
  'afraid of', 'agree with', 'aim at', 'angry with', 'apply for',
  'approve of', 'ashamed of', 'ask for', 'attach to', 'attend to',
  'back up', 'based on', 'believe in', 'belong to', 'benefit from',
  'blame for', 'boast about', 'borrow from', 'care about', 'care for',
  'carry on', 'carry out', 'catch up', 'check in', 'check out',
  'cheer up', 'clean up', 'collide with', 'come across', 'come up with',
  'comment on', 'compare to', 'compare with', 'compete with', 'complain about',
  'concentrate on', 'consist of', 'contribute to', 'cope with', 'count on',
  'cut down', 'deal with', 'decide on', 'depend on', 'die of',
  'dream of', 'dress up', 'drive away', 'drop out', 'engage in'
]

function isNonWordContent(text) {
  if (!text || typeof text !== 'string') return true
  const trimmed = text.trim()
  if (!trimmed) return true

  const nonWordPatterns = [
    /^day\s*\d+[a-z]*$/i,
    /^week\s*\d+[a-z]*$/i,
    /^unit\s*\d+[a-z]*$/i,
    /^chapter\s*\d+[a-z]*$/i,
    /^lesson\s*\d+[a-z]*$/i,
    /^section\s*\d+[a-z]*$/i,
    /^part\s*\d+[a-z]*$/i,
    /^(module|module\s*\d+)$/i,
    /^(review|test|exam|quiz)$/i,
    /^page\s*\d+$/i,
    /^\d+\.$/i,
  ]

  for (const pattern of nonWordPatterns) {
    if (pattern.test(trimmed)) return true
  }
  return false
}

function isPhraseVerb(text) {
  const lower = text.toLowerCase().trim()
  for (const phrase of COMMON_PHRASES) {
    if (lower === phrase) return true
  }
  return false
}

function parseWordsIntelligently(text) {
  const lines = text.split(/\n/)
  const words = []
  const seen = new Set()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || isNonWordContent(line)) continue

    // 简单解析：第一列为单词
    const parts = line.split(/[\t\s]+/)
    const spelling = parts[0]?.trim().toLowerCase()

    if (spelling && !seen.has(spelling) && !isNonWordContent(spelling)) {
      seen.add(spelling)
      words.push({
        spelling,
        line: i + 1,
        isPhrase: isPhraseVerb(spelling)
      })
    }
  }

  return words
}

// Worker 消息处理
self.onmessage = function(e) {
  const { text, id } = e.data

  try {
    const startTime = performance.now()
    const words = parseWordsIntelligently(text)
    const duration = performance.now() - startTime

    self.postMessage({
      id,
      success: true,
      words,
      stats: {
        total: words.length,
        phrases: words.filter(w => w.isPhrase).length,
        duration: Math.round(duration)
      }
    })
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    })
  }
}
