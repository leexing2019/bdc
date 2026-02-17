// Dictionary API Service
// Fetches word definitions and examples from Free Dictionary API

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'

/**
 * Fetch word data from Dictionary API
 * @param {string} word - The word to look up
 * @returns {Promise<{definition: string|null, example: string|null, phonetic: string|null}>}
 */
export async function fetchWordData(word) {
  if (!word || !word.trim()) {
    return { definition: null, example: null, phonetic: null }
  }

  const cleanWord = word.trim().toLowerCase()

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(cleanWord)}`)

    if (!response.ok) {
      // Word not found or API error
      return { definition: null, example: null, phonetic: null }
    }

    const data = await response.json()

    if (!data || !data[0]) {
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
          // Return first definition with example if available
          return {
            definition: def.definition,
            example: def.example || null,
            phonetic: phonetic
          }
        }
      }
    }

    return { definition: null, example: null, phonetic: phonetic }
  } catch (error) {
    console.error('Dictionary API error:', error)
    return { definition: null, example: null, phonetic: null }
  }
}

/**
 * Batch fetch word data with rate limiting
 * @param {string[]} words - Array of words to look up
 * @param {Function} onProgress - Progress callback (current, total, word)
 * @param {number} delayMs - Delay between requests (default 300ms)
 * @returns {Promise<Array<{word: string, success: boolean, data: any}>>}
 */
export async function fetchWordDataBatch(words, onProgress = null, delayMs = 300) {
  const results = []
  const total = words.length

  // Helper function for delay
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    if (onProgress) {
      onProgress(i + 1, total, word)
    }

    const data = await fetchWordData(word)
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
