import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { fetchWordData, generateExampleWithDeepSeek } from '@/utils/dictionaryService'

// SM-2 Algorithm Implementation
function calculateSM2(quality, repetitions, easeFactor, interval) {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)
  // 0 - complete blackout
  // 1 - incorrect response, but correct answer seemed easy to recall
  // 2 - incorrect response, but correct answer seemed easy to recall
  // 3 - correct response with serious difficulty
  // 4 - correct response after hesitation
  // 5 - perfect response
  
  let newRepetitions = repetitions
  let newEaseFactor = easeFactor
  let newInterval = interval

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0
    newInterval = 1
  } else {
    // Passed
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions++
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval
  }
}

export const useWordStore = defineStore('words', () => {
  const authStore = useAuthStore()
  
  const words = ref([])
  const userProgress = ref([])
  const todayWords = ref([])
  const loading = ref(false)
  const currentWordIndex = ref(0)
  const newWordsCompleted = ref(false) // 新词是否已完成
  const learningPlans = ref([]) // 用户的学习计划

  // Computed
  const currentWord = computed(() => todayWords.value[currentWordIndex.value] || null)
  
  const proficiencyStats = computed(() => {
    const stats = {
      new: 0,      // 未学习
      learning: 0, // 学习中
      familiar: 0, // 熟悉
      mastered: 0  // 掌握
    }
    
    userProgress.value.forEach(progress => {
      if (progress.repetitions === 0) {
        stats.new++
      } else if (progress.proficiency < 3) {
        stats.learning++
      } else if (progress.proficiency < 5) {
        stats.familiar++
      } else {
        stats.mastered++
      }
    })
    
    return stats
  })

  const weeklyStats = computed(() => {
    const stats = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLog = userProgress.value.find(log => 
        log.last_review_date === dateStr
      )
      
      stats.push({
        date: dateStr,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        count: dayLog ? dayLog.words_reviewed : 0,
        completed: dayLog && dayLog.words_reviewed > 0
      })
    }
    
    return stats
  })

  // Actions
  async function fetchWords() {
    if (!authStore.user) return
    
    loading.value = true
    try {
      const userId = authStore.user.id
      
      // 首先获取用户的词库设置 - 使用admin客户端绕过RLS
      const { data: userSettings } = await supabaseAdmin
        .from('user_settings')
        .select('category')
        .eq('user_id', userId)
        .maybeSingle()
      
      const userCategory = userSettings?.category
      
      // 查询1：获取公共词库单词
      // 只有当用户有特定词库分配时才加载（不是'all'也不是null）
      let commonQuery = supabase
        .from('words')
        .select('*')
        .neq('category', 'custom')
        .order('created_at', { ascending: false })
      
      // 如果用户有特定的词库分配，只加载该词库
      // 如果category是'all'或者null/undefined，说明没有分配具体词库，不加载教师分配的单词
      if (userCategory && userCategory !== 'all' && userCategory !== null) {
        commonQuery = commonQuery.eq('category', userCategory)
      } else {
        // 没有分配具体词库时，只返回空数组
        commonQuery = commonQuery.eq('id', 0) // 返回空结果
      }
      
      const { data: commonWords, error: commonError } = await commonQuery

      if (commonError) throw commonError
      
      // 查询2：获取用户自己添加的单词（custom分类且created_by = 当前用户）
      const { data: customWords, error: customError } = await supabase
        .from('words')
        .select('*')
        .eq('category', 'custom')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (customError) throw customError
      
      // 合并结果
      const allWords = [...(commonWords || []), ...(customWords || [])]
      
      // Add source field to distinguish between institution and custom words
      // custom category = user self-imported
      // other categories = teacher-assigned
      words.value = allWords.map(word => ({
        ...word,
        source: word.category === 'custom' ? 'custom' : 'institution'
      }))

      // Fetch user's progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', authStore.user.id)

      if (progressError) throw progressError
      userProgress.value = progressData || []
    } catch (error) {
      console.error('Fetch words error:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchTodayWords() {
    if (!authStore.user) return
    
    loading.value = true
    newWordsCompleted.value = false // 重置新词完成状态
    
    try {
      // 首先尝试获取用户的学习计划
      const plans = await fetchLearningPlans()
      
      // 如果有设置学习计划，使用新逻辑
      if (plans && plans.length > 0) {
        const planWords = await fetchTodayWordsByPlans(plans)
        if (planWords) {
          todayWords.value = planWords
          currentWordIndex.value = 0
          loading.value = false
          return
        }
      }
      
      // 回退到旧逻辑：从user_settings获取category
      // Get user's category preference and custom daily limit
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('category, custom_daily_limit')
        .eq('user_id', authStore.user.id)
        .maybeSingle()
      
      const userCategory = userSettings?.category || ''
      const customDailyLimit = userSettings?.custom_daily_limit || 0 // 个人词库每日数量
      const teacherDailyLimit = authStore.user.daily_limit || 0 // 教师分配数量
      
      // 每日新词总量 = 教师分配 + 个人设置
      const totalDailyLimit = teacherDailyLimit + customDailyLimit
      
      // 如果没有任何学习任务（教师分配为0且没有个人词库），直接返回空数组
      if (totalDailyLimit === 0) {
        todayWords.value = []
        currentWordIndex.value = 0
        loading.value = false
        return
      }
      
      const today = new Date().toISOString().split('T')[0]
      
      // Get words due for review today
      const { data: reviewWords, error: reviewError } = await supabase
        .from('user_word_progress')
        .select(`
          *,
          word:words(*)
        `)
        .eq('user_id', authStore.user.id)
        .lte('next_review_date', today)
        .order('next_review_date', { ascending: true })
        .limit(50)

      if (reviewError) {
        console.error('获取复习词失败:', reviewError)
      }

      // Get user's learned word IDs
      const { data: allProgress } = await supabase
        .from('user_word_progress')
        .select('word_id, word:words(category)')
        .eq('user_id', authStore.user.id)
      
      // 分类已学习单词ID
      const institutionLearnedIds = []
      const customLearnedIds = []
      
      allProgress?.forEach(p => {
        if (p.word?.category === 'custom') {
          customLearnedIds.push(p.word_id)
        } else {
          institutionLearnedIds.push(p.word_id)
        }
      })

      // 获取机构词库新词
      let institutionNewWordsQuery = supabase
        .from('words')
        .select('*')
        .neq('category', 'custom')
        .order('created_at', { ascending: false })

      if (userCategory && userCategory !== 'all') {
        institutionNewWordsQuery = institutionNewWordsQuery.eq('category', userCategory)
      }

      // 排除已学习的机构词库单词
      if (institutionLearnedIds.length > 0) {
        institutionNewWordsQuery = institutionNewWordsQuery.not('id', 'in', `(${institutionLearnedIds.join(',')})`)
      }

      const { data: institutionNewWords } = await institutionNewWordsQuery
        .limit(teacherDailyLimit)

      // 获取个人词库新词
      let customNewWordsQuery = supabase
        .from('words')
        .select('*')
        .eq('category', 'custom')
        .eq('created_by', authStore.user.id)
        .order('created_at', { ascending: false })

      // 排除已学习的个人单词
      if (customLearnedIds.length > 0) {
        customNewWordsQuery = customNewWordsQuery.not('id', 'in', `(${customLearnedIds.join(',')})`)
      }

      const { data: customNewWords } = await customNewWordsQuery
        .limit(customDailyLimit)

      // 合并新词：机构词库 + 个人词库
      const newWords = [
        ...(institutionNewWords || []),
        ...(customNewWords || [])
      ].slice(0, totalDailyLimit)

      // 检查是否已完成新词任务（当新词数量少于应该获取的数量时）
      const actualNewWordCount = newWords.length
      newWordsCompleted.value = actualNewWordCount < totalDailyLimit && 
        ((institutionNewWords?.length || 0) + (customNewWords?.length || 0)) > 0

      // Combine and format - ensure we always have some words to learn
      const combinedWords = [
        ...(reviewWords || []).map(p => ({
          ...p.word,
          source: p.word.category === 'custom' ? 'custom' : 'institution',
          progress: {
            id: p.id,
            ease_factor: p.ease_factor,
            interval_days: p.interval_days,
            repetitions: p.repetitions,
            next_review_date: p.next_review_date,
            proficiency: p.proficiency
          },
          isNew: false
        })),
        ...(newWords || []).map(w => ({
          ...w,
          source: w.category === 'custom' ? 'custom' : 'institution',
          progress: null,
          isNew: true
        }))
      ]

      todayWords.value = combinedWords
      currentWordIndex.value = 0
    } catch (error) {
      console.error('Fetch today words error:', error)
    } finally {
      loading.value = false
    }
  }

  async function submitReview(quality) {
    if (!currentWord.value) return

    const word = currentWord.value
    const today = new Date().toISOString().split('T')[0]
    
    try {
      if (word.isNew) {
        // New word - create progress record
        const sm2Result = calculateSM2(quality, 0, 2.5, 0)
        
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + sm2Result.interval)

        const { error } = await supabase
          .from('user_word_progress')
          .insert({
            user_id: authStore.user.id,
            word_id: word.id,
            ease_factor: sm2Result.easeFactor,
            interval_days: sm2Result.interval,
            repetitions: sm2Result.repetitions,
            next_review_date: nextDate.toISOString().split('T')[0],
            last_review_date: today,
            proficiency: quality
          })

        if (error) throw error
      } else {
        // Existing word - update progress
        const sm2Result = calculateSM2(
          quality,
          word.progress.repetitions,
          word.progress.ease_factor,
          word.progress.interval_days
        )

        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + sm2Result.interval)

        const { error } = await supabase
          .from('user_word_progress')
          .update({
            ease_factor: sm2Result.easeFactor,
            interval_days: sm2Result.interval,
            repetitions: sm2Result.repetitions,
            next_review_date: nextDate.toISOString().split('T')[0],
            last_review_date: today,
            proficiency: quality
          })
          .eq('id', word.progress.id)

        if (error) throw error
      }

      // Update local state
      currentWordIndex.value++
      
      // Record study log
      await recordStudyLog(word.isNew)
    } catch (error) {
      console.error('Submit review error:', error)
    }
  }

  async function recordStudyLog(isNewWord) {
    if (!authStore.user) return

    const today = new Date().toISOString().split('T')[0]
    
    try {
      // Check if log exists for today
      const { data: existingLog } = await supabase
        .from('study_logs')
        .select('*')
        .eq('user_id', authStore.user.id)
        .eq('date', today)
        .maybeSingle()

      if (existingLog) {
        // Update existing log
        await supabase
          .from('study_logs')
          .update({
            new_words_learned: existingLog.new_words_learned + (isNewWord ? 1 : 0),
            words_reviewed: existingLog.words_reviewed + 1
          })
          .eq('id', existingLog.id)
      } else {
        // Create new log
        await supabase
          .from('study_logs')
          .insert({
            user_id: authStore.user.id,
            date: today,
            new_words_learned: isNewWord ? 1 : 0,
            words_reviewed: 1
          })
      }
    } catch (error) {
      console.error('Record study log error:', error)
    }
  }

  async function addCustomWord(wordData) {
    if (!authStore.user) return { success: false, error: '请先登录' }

    try {
      // 检查单词是否已存在于当前用户的个人词库中（只检查custom分类）
      // 同时检查拼写和词性，相同拼写+相同词性视为重复
      const trimmedSpelling = wordData.spelling.trim().toLowerCase()
      const partOfSpeech = (wordData.partOfSpeech || '').trim()
      
      // 词性匹配逻辑：
      // 1. 如果用户提供了词性，匹配相同词性（包括空字符串）
      // 2. 如果用户没有提供词性，匹配词性为空或null的记录
      let query = supabase
        .from('words')
        .select('id, spelling, part_of_speech')
        .eq('category', 'custom')
        .eq('created_by', authStore.user.id)
        .ilike('spelling', trimmedSpelling)
      
      if (partOfSpeech) {
        // 有词性：使用 ilike 进行大小写不敏感匹配
        query = query.ilike('part_of_speech', partOfSpeech)
      } else {
        // 无词性：匹配空字符串或null
        query = query.or('part_of_speech.is.null,part_of_speech.eq.')
      }
      
      const { data: existingWord, error: checkError } = await query.maybeSingle()

      if (checkError) throw checkError

      if (existingWord) {
        return { success: false, error: `单词 "${wordData.spelling}"（${wordData.partOfSpeech || '未标注词性'}）已存在于您的个人词库中`, duplicate: true }
      }

      // 验证单词拼写并获取例句
      let exampleSentence = ''
      let phonetic = ''
      let audioUrl = ''
      
      // 如果用户已经提供了例句，直接使用（前端已根据词性获取）
      if (wordData.example_sentence) {
        exampleSentence = wordData.example_sentence
        // 同时尝试获取音标和音频
        const wordValidation = await fetchWordData(wordData.spelling.trim(), null, wordData.partOfSpeech || null)
        if (wordValidation.phonetic) {
          phonetic = wordValidation.phonetic
        }
        if (wordValidation.audio) {
          audioUrl = wordValidation.audio
        }
      } else {
        // 如果没有提供例句，则自动获取
        const wordValidation = await fetchWordData(wordData.spelling.trim(), null, wordData.partOfSpeech || null)
        
        if (wordValidation.definition || wordValidation.phonetic) {
          phonetic = wordValidation.phonetic || ''
          // 获取例句（注意：API返回的是example而非examples）
          if (wordValidation.example) {
            exampleSentence = wordValidation.example
          }
          // 获取音频URL
          if (wordValidation.audio) {
            audioUrl = wordValidation.audio
          }
        }

        // 如果没有从API获取到例句，尝试使用DeepSeek生成
        if (!exampleSentence) {
          const apiKey = localStorage.getItem('smartmemo_deepseek_key')
          if (apiKey) {
            try {
              const generatedExample = await generateExampleWithDeepSeek(
                wordData.spelling.trim(),
                wordData.meaning,
                apiKey,
                wordData.partOfSpeech || null
              )
              if (generatedExample) {
                exampleSentence = generatedExample
              }
            } catch (e) {
              console.warn('DeepSeek例句生成失败:', e)
            }
          }
        }
      }

      // 直接添加到words表（用户自定义单词），包含例句、音标和音频
      console.log('插入单词数据:', {
        spelling: wordData.spelling.trim(),
        part_of_speech: wordData.partOfSpeech || '',
        meaning: wordData.meaning,
        phonetic: phonetic,
        audio_url: audioUrl,
        example_sentence: exampleSentence,
        category: 'custom',
        created_by: authStore.user.id
      })
      
      const { error } = await supabase
        .from('words')
        .insert({
          spelling: wordData.spelling.trim(),
          part_of_speech: wordData.partOfSpeech || '',
          meaning: wordData.meaning,
          phonetic: phonetic,
          audio_url: audioUrl,
          example_sentence: exampleSentence,
          category: 'custom',
          created_by: authStore.user.id
        })

      if (error) {
        console.error('插入单词失败:', error)
        throw error
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 验证单词拼写是否正确
  async function validateWordSpelling(word) {
    if (!word || !word.trim()) {
      return { valid: false, message: '请输入单词' }
    }

    const cleanWord = word.trim().toLowerCase()
    
    // 使用 Dictionary API 验证
    const result = await fetchWordData(cleanWord)
    
    if (result.definition || result.phonetic) {
      return { 
        valid: true, 
        message: '单词拼写正确',
        phonetic: result.phonetic,
        definition: result.definition
      }
    } else {
      return { 
        valid: false, 
        message: `无法确认单词 "${cleanWord}" 的拼写是否正确，请检查后重试`
      }
    }
  }

  // 批量添加单词（带重复检查和验证）
  async function addCustomWordsBatch(wordsData) {
    if (!authStore.user) return { success: false, error: '请先登录' }

    const results = {
      success: [],
      duplicates: [],
      invalid: [],
      errors: []
    }

    for (const word of wordsData) {
      try {
        // 检查单词是否已存在于当前用户的个人词库中（只检查custom分类）
        // 同时检查拼写和词性，相同拼写+相同词性视为重复
        const trimmedSpelling = word.spelling.trim().toLowerCase()
        const partOfSpeech = (word.partOfSpeech || '').trim()
        
        // 词性匹配逻辑：
        // 1. 如果用户提供了词性，匹配相同词性（包括空字符串）
        // 2. 如果用户没有提供词性，匹配词性为空或null的记录
        let query = supabase
          .from('words')
          .select('id, spelling, part_of_speech')
          .eq('category', 'custom')
          .eq('created_by', authStore.user.id)
          .ilike('spelling', trimmedSpelling)
        
        if (partOfSpeech) {
          // 有词性：使用 ilike 进行大小写不敏感匹配，并处理可能的空格问题
          query = query.ilike('part_of_speech', partOfSpeech)
        } else {
          // 无词性：匹配空字符串或null
          query = query.or('part_of_speech.is.null,part_of_speech.eq.')
        }
        
        const { data: existingWord } = await query.maybeSingle()

        if (existingWord) {
          results.duplicates.push(`${word.spelling}（${word.partOfSpeech || '未标注词性'}）`)
          continue
        }

        // 验证单词拼写并获取例句
        let exampleSentence = ''
        let phonetic = ''
        let audioUrl = ''
        
        // 如果用户已经提供了例句，直接使用（前端已根据词性获取）
        if (word.example_sentence) {
          exampleSentence = word.example_sentence
        }
        
        // 无论是否有例句，都需要传递词性参数来验证和获取音标/音频
        const wordValidation = await fetchWordData(word.spelling.trim(), null, word.partOfSpeech || null)
        
        // 检查单词是否有效（必须有 definition 或 phonetic）
        const isValidWord = !!(wordValidation.definition || wordValidation.phonetic)
        
        if (!isValidWord) {
          // 单词拼写无效，记录为无效并跳过添加
          results.invalid.push(word.spelling)
          continue
        }
        
        // 单词有效，获取音标和例句
        if (wordValidation.phonetic) {
          phonetic = wordValidation.phonetic
        }
        // 获取例句（注意：API返回的是example而非examples）
        // 只有在没有用户提供例句的情况下，才使用API获取的例句
        if (!exampleSentence && wordValidation.example) {
          exampleSentence = wordValidation.example
        }
        // 获取音频URL
        if (wordValidation.audio) {
          audioUrl = wordValidation.audio
        }

        // 如果没有从API获取到例句，尝试使用DeepSeek生成
        if (!exampleSentence) {
          const apiKey = localStorage.getItem('smartmemo_deepseek_key')
          if (apiKey) {
            try {
              const generatedExample = await generateExampleWithDeepSeek(
                word.spelling.trim(),
                word.meaning,
                apiKey,
                word.partOfSpeech || null
              )
              if (generatedExample) {
                exampleSentence = generatedExample
              }
            } catch (e) {
              console.warn('DeepSeek例句生成失败:', e)
            }
          }
        }

        // 添加单词（包括音标、例句和音频）
        console.log('批量插入单词数据:', {
          spelling: word.spelling.trim(),
          part_of_speech: word.partOfSpeech || '',
          meaning: word.meaning,
          phonetic: phonetic,
          audio_url: audioUrl,
          example_sentence: exampleSentence,
          category: 'custom',
          created_by: authStore.user.id
        })
        
        const { error } = await supabase
          .from('words')
          .insert({
            spelling: word.spelling.trim(),
            part_of_speech: word.partOfSpeech || '',
            meaning: word.meaning,
            phonetic: phonetic,
            audio_url: audioUrl,
            example_sentence: exampleSentence,
            category: 'custom',
            created_by: authStore.user.id
          })

        if (error) {
          console.error('批量插入单词失败:', error)
          results.errors.push({ word: word.spelling, error: error.message })
        } else {
          results.success.push(word.spelling)
        }
      } catch (error) {
        results.errors.push({ word: word.spelling, error: error.message })
      }
    }

    return {
      success: results.success.length > 0,
      successCount: results.success.length,
      duplicatesCount: results.duplicates.length,
      invalidCount: results.invalid.length,
      errorCount: results.errors.length,
      results
    }
  }

  async function getCustomWords() {
    if (!authStore.user) return []

    try {
      const { data, error } = await supabase
        .from('user_custom_words')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get custom words error:', error)
      return []
    }
  }

  async function deleteCustomWord(wordId) {
    try {
      const { error } = await supabase
        .from('user_custom_words')
        .delete()
        .eq('id', wordId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function approveCustomWord(wordId) {
    try {
      // Get custom word data
      const { data: customWord, error: fetchError } = await supabase
        .from('user_custom_words')
        .select('*')
        .eq('id', wordId)
        .single()

      if (fetchError) throw fetchError

      // Add to main words table
      const { error: insertError } = await supabase
        .from('words')
        .insert({
          spelling: customWord.spelling,
          part_of_speech: customWord.part_of_speech,
          meaning: customWord.meaning,
          category: 'custom',
          created_by: authStore.user.id
        })

      if (insertError) throw insertError

      // Update custom word status
      const { error: updateError } = await supabase
        .from('user_custom_words')
        .update({ status: 'approved' })
        .eq('id', wordId)

      if (updateError) throw updateError

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===== 学习计划管理功能 =====
  
  // 获取用户的学习计划
  async function fetchLearningPlans() {
    if (!authStore.user) return []
    
    try {
      const { data, error } = await supabase
        .from('user_learning_plans')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('priority', { ascending: true })

      if (error) throw error
      learningPlans.value = data || []
      return data || []
    } catch (error) {
      console.error('获取学习计划失败:', error)
      return []
    }
  }

  // 添加或更新学习计划
  async function saveLearningPlan(plan) {
    if (!authStore.user) return { success: false, error: '请先登录' }
    
    try {
      const planData = {
        user_id: authStore.user.id,
        category: plan.category,
        daily_limit: plan.daily_limit || 0,
        priority: plan.priority || 1,
        status: plan.status || 'active',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_learning_plans')
        .upsert(planData, { 
          onConflict: 'user_id,category',
          ignoreDuplicates: false 
        })

      if (error) throw error
      
      // 刷新学习计划列表
      await fetchLearningPlans()
      return { success: true }
    } catch (error) {
      console.error('保存学习计划失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 暂停学习计划
  async function pauseLearningPlan(planId) {
    try {
      const { error } = await supabase
        .from('user_learning_plans')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', planId)

      if (error) throw error
      await fetchLearningPlans()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 恢复学习计划
  async function resumeLearningPlan(planId) {
    try {
      const { error } = await supabase
        .from('user_learning_plans')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', planId)

      if (error) throw error
      await fetchLearningPlans()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 删除学习计划
  async function deleteLearningPlan(planId) {
    try {
      const { error } = await supabase
        .from('user_learning_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      await fetchLearningPlans()
      return { success: true }
    } catch(error) {
      return { success: false, error: error.message }
    }
  }

  // 调整学习计划优先级
  async function updatePlanPriority(planId, newPriority) {
    try {
      const { error } = await supabase
        .from('user_learning_plans')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq('id', planId)

      if (error) throw error
      await fetchLearningPlans()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 根据学习计划获取今日单词（修改后的fetchTodayWords核心逻辑）
  async function fetchTodayWordsByPlans(plans) {
    if (!authStore.user) return []
    
    const today = new Date().toISOString().split('T')[0]
    const resultWords = []
    let totalDailyLimit = 0
    
    // 获取所有需要学习的分类
    const activePlans = plans.filter(p => p.status === 'active' && p.daily_limit > 0)
    const categories = activePlans.map(p => p.category)
    totalDailyLimit = activePlans.reduce((sum, p) => sum + p.daily_limit, 0)
    
    // 如果没有设置学习计划，回退到旧逻辑
    if (categories.length === 0 || totalDailyLimit === 0) {
      return [] // 没有学习任务，返回空数组
    }
    
    // 获取用户已学习的单词ID
    const { data: allProgress } = await supabase
      .from('user_word_progress')
      .select('word_id, word:words(category)')
      .eq('user_id', authStore.user.id)
    
    const learnedWordIds = new Set()
    const categoryLearnedMap = {} // 按分类记录已学单词
    
    categories.forEach(cat => categoryLearnedMap[cat] = new Set())
    
    allProgress?.forEach(p => {
      learnedWordIds.add(p.word_id)
      if (p.word?.category) {
        categoryLearnedMap[p.word.category]?.add(p.word_id)
      }
    })

    // 获取今日待复习单词
    const { data: reviewWords } = await supabase
      .from('user_word_progress')
      .select(`*, word:words(*)`)
      .eq('user_id', authStore.user.id)
      .lte('next_review_date', today)
      .order('next_review_date', { ascending: true })
      .limit(50)

    if (reviewWords?.length) {
      resultWords.push(...reviewWords.map(p => ({
        ...p.word,
        source: p.word.category === 'custom' ? 'custom' : 'institution',
        progress: {
          id: p.id,
          ease_factor: p.ease_factor,
          interval_days: p.interval_days,
          repetitions: p.repetitions,
          next_review_date: p.next_review_date,
          proficiency: p.proficiency
        },
        isNew: false
      })))
    }

    // 按优先级获取每个分类的新词
    for (const plan of activePlans) {
      const category = plan.category
      const limit = plan.daily_limit
      
      // 获取该分类的新词
      let newWordsQuery = supabase
        .from('words')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (category === 'custom') {
        newWordsQuery = newWordsQuery.eq('category', 'custom').eq('created_by', authStore.user.id)
      } else if (category !== 'all') {
        newWordsQuery = newWordsQuery.eq('category', category).neq('category', 'custom')
      } else {
        newWordsQuery = newWordsQuery.neq('category', 'custom')
      }
      
      // 排除已学习的单词
      const learnedIds = categoryLearnedMap[category] || new Set()
      if (learnedIds.size > 0) {
        newWordsQuery = newWordsQuery.not('id', 'in', `(${Array.from(learnedIds).join(',')})`)
      }
      
      const { data: newWords } = await newWordsQuery.limit(limit)
      
      if (newWords?.length) {
        resultWords.push(...newWords.map(w => ({
          ...w,
          source: w.category === 'custom' ? 'custom' : 'institution',
          progress: null,
          isNew: true,
          planCategory: category // 标记来自哪个学习计划
        })))
      }
    }

    return resultWords
  }

  return {
    words,
    userProgress,
    todayWords,
    loading,
    currentWordIndex,
    currentWord,
    proficiencyStats,
    weeklyStats,
    learningPlans,
    fetchWords,
    fetchTodayWords,
    submitReview,
    addCustomWord,
    validateWordSpelling,
    addCustomWordsBatch,
    getCustomWords,
    deleteCustomWord,
    approveCustomWord,
    // 学习计划相关
    fetchLearningPlans,
    saveLearningPlan,
    pauseLearningPlan,
    resumeLearningPlan,
    deleteLearningPlan,
    updatePlanPriority,
    fetchTodayWordsByPlans
  }
})
