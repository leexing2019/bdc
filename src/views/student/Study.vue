<template>
  <div class="min-h-[calc(100vh-8rem)] pb-20 lg:pb-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-800">单词背诵</h1>
      <div class="flex items-center space-x-2">
        <select
          v-model="studyMode"
          class="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="recall">识记模式</option>
          <option value="dictation">默写模式</option>
          <option value="pos">词性选择</option>
          <option value="cloze">填空模式</option>
        </select>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full h-2 bg-gray-200 rounded-full mb-6">
      <div
        class="h-full bg-primary-500 rounded-full transition-all duration-300 progress-animate"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Empty State -->
    <div v-if="wordStore.todayWords.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">太棒了！</h2>
      <p class="text-gray-500 mb-6">今天的任务已经完成啦~</p>
      <router-link
        to="/student/dashboard"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        返回主页
      </router-link>
    </div>

    <!-- Study Content -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Mode Badge -->
      <div class="flex justify-center mb-4">
        <span
          class="px-4 py-1 rounded-full text-sm font-medium"
          :class="currentWord?.isNew ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
        >
          {{ currentWord?.isNew ? '新词' : '复习' }}
        </span>
      </div>

      <!-- Mode: Recall (识记模式) - 看英文说中文 -->
      <div v-if="studyMode === 'recall'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <button
            @click="playPronunciation"
            class="w-16 h-16 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 transition"
          >
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          
          <h2 class="text-4xl font-bold text-gray-800 mb-2">{{ currentWord?.spelling }}</h2>
          <p v-if="currentWord?.phonetic" class="text-gray-400 mb-6">{{ currentWord?.phonetic }}</p>
          
          <button
            @click="showAnswer = true"
            v-if="!showAnswer"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            显示答案
          </button>
          
          <div v-else class="mt-6 animate-fade-in">
            <p class="text-lg text-gray-600 mb-2">{{ currentWord?.part_of_speech }}</p>
            <p class="text-2xl font-semibold text-gray-800 mb-6">{{ currentWord?.meaning }}</p>
            
            <p v-if="currentWord?.example_sentence" class="text-sm text-gray-500 italic mb-6">
              {{ currentWord?.example_sentence }}
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div v-if="showAnswer" class="mt-8">
          <p class="text-center text-gray-500 mb-4">你对这个单词的掌握程度是？</p>
          <div class="grid grid-cols-3 gap-4">
            <button
              @click="handleResponse(1)"
              class="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-xl transition"
            >
              <span class="text-red-700 font-medium">不认识</span>
            </button>
            <button
              @click="handleResponse(3)"
              class="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition"
            >
              <span class="text-yellow-700 font-medium">模糊</span>
            </button>
            <button
              @click="handleResponse(5)"
              class="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
            >
              <span class="text-green-700 font-medium">认识</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mode: Dictation (默写模式) - 看中文默写英文 -->
      <div v-else-if="studyMode === 'dictation'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">请默写出这个单词</p>
          
          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <p class="text-2xl font-semibold text-gray-800">{{ currentWord?.meaning }}</p>
            <p v-if="currentWord?.phonetic" class="text-gray-400 mt-2">{{ currentWord?.phonetic }}</p>
          </div>
          
          <input
            ref="dictationInput"
            v-model="dictationAnswer"
            type="text"
            @keyup.enter="checkDictation"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
            placeholder="请输入英文单词"
            :disabled="dictationResult !== null"
          />
          
          <!-- Result Feedback -->
          <div v-if="dictationResult !== null" class="mb-4 animate-fade-in">
            <div v-if="dictationResult" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-2xl font-bold mt-2">{{ currentWord?.spelling }}</p>
            </div>
          </div>
          
          <button
            v-if="dictationResult === null"
            @click="checkDictation"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            提交
          </button>
          <button
            v-else
            @click="nextWord"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            下一个
          </button>
        </div>
      </div>

      <!-- Mode: POS (词性选择) -->
      <div v-else-if="studyMode === 'pos'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-4">请选择正确的词性</p>
          
          <h2 class="text-4xl font-bold text-gray-800 mb-6">{{ currentWord?.spelling }}</h2>
          <p class="text-xl text-gray-600 mb-8">{{ currentWord?.meaning }}</p>
          
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="pos in posOptions"
              :key="pos.value"
              @click="checkPOS(pos.value)"
              class="p-4 rounded-xl border-2 transition text-lg font-medium"
              :class="getPOSButtonClass(pos.value)"
              :disabled="posResult !== null"
            >
              {{ pos.label }}
            </button>
          </div>
          
          <!-- Result Feedback -->
          <div v-if="posResult !== null" class="mt-6 animate-fade-in">
            <div v-if="posResult" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-xl font-bold mt-2">{{ currentWord?.part_of_speech }}</p>
            </div>
            
            <button
              @click="nextWord"
              class="mt-4 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              下一个
            </button>
          </div>
        </div>
      </div>

      <!-- Mode: Cloze (填空模式) -->
      <div v-else-if="studyMode === 'cloze'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-4">请填写空白处的单词</p>
          
          <!-- Cloze Sentence -->
          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <p class="text-lg text-gray-800 leading-relaxed">
              {{ clozeSentence }}
            </p>
          </div>
          
          <p class="text-gray-500 mb-4">中文释义：{{ currentWord?.meaning }}</p>
          
          <input
            v-model="clozeAnswer"
            type="text"
            @keyup.enter="checkCloze"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
            placeholder="请填写单词"
            :disabled="clozeResult !== null"
          />
          
          <!-- Result Feedback -->
          <div v-if="clozeResult !== null" class="mb-4 animate-fade-in">
            <div v-if="clozeResult" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-2xl font-bold mt-2">{{ currentWord?.spelling }}</p>
            </div>
          </div>
          
          <button
            v-if="clozeResult === null"
            @click="checkCloze"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            提交
          </button>
          <button
            v-else
            @click="nextWord"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            下一个
          </button>
        </div>
      </div>

      <!-- Progress Info -->
      <div class="text-center mt-6 text-gray-500">
        {{ currentIndex + 1 }} / {{ wordStore.todayWords.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useWordStore } from '@/stores/words'

const wordStore = useWordStore()

const studyMode = ref('recall')
const currentIndex = ref(0)
const showAnswer = ref(false)

// Dictation mode
const dictationAnswer = ref('')
const dictationResult = ref(null)

// POS mode
const posOptions = [
  { value: 'n.', label: '名词 (n.)' },
  { value: 'v.', label: '动词 (v.)' },
  { value: 'adj.', label: '形容词 (adj.)' },
  { value: 'adv.', label: '副词 (adv.)' }
]
const posResult = ref(null)

// Cloze mode
const clozeAnswer = ref('')
const clozeResult = ref(null)

const currentWord = computed(() => wordStore.todayWords[currentIndex.value])

const progressPercent = computed(() => {
  if (wordStore.todayWords.length === 0) return 100
  return ((currentIndex.value) / wordStore.todayWords.length) * 100
})

const clozeSentence = computed(() => {
  if (!currentWord.value?.example_sentence) {
    return 'No example sentence available'
  }
  const word = currentWord.value.spelling
  const regex = new RegExp(word, 'gi')
  return currentWord.value.example_sentence.replace(regex, '______')
})

const playPronunciation = () => {
  if (currentWord.value?.spelling) {
    const utterance = new SpeechSynthesisUtterance(currentWord.value.spelling)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

const handleResponse = async (quality) => {
  await wordStore.submitReview(quality)
  resetState()
  currentIndex.value++
  checkCompleted()
}

const checkDictation = () => {
  if (!dictationAnswer.value.trim()) return
  
  const correct = dictationAnswer.value.trim().toLowerCase() === currentWord.value.spelling.toLowerCase()
  dictationResult.value = correct
  
  // Auto advance after delay
  setTimeout(() => {
    if (correct) {
      handleResponse(5) // Correct = know it well
    } else {
      handleResponse(1) // Wrong = don't know
    }
  }, 1500)
}

const checkPOS = (selectedPOS) => {
  const correct = selectedPOS === currentWord.value.part_of_speech
  posResult.value = correct
  
  if (correct) {
    handleResponse(5)
  }
}

const checkCloze = () => {
  if (!clozeAnswer.value.trim()) return
  
  const correct = clozeAnswer.value.trim().toLowerCase() === currentWord.value.spelling.toLowerCase()
  clozeResult.value = correct
  
  setTimeout(() => {
    if (correct) {
      handleResponse(5)
    } else {
      handleResponse(1)
    }
  }, 1500)
}

const getPOSButtonClass = (pos) => {
  if (posResult.value === null) {
    return 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
  }
  if (pos === currentWord.value.part_of_speech) {
    return 'border-green-500 bg-green-50 text-green-700'
  }
  return 'border-gray-200 opacity-50'
}

const nextWord = () => {
  resetState()
  currentIndex.value++
  checkCompleted()
}

const resetState = () => {
  showAnswer.value = false
  dictationAnswer.value = ''
  dictationResult.value = null
  posResult.value = null
  clozeAnswer.value = ''
  clozeResult.value = null
}

const checkCompleted = async () => {
  if (currentIndex.value >= wordStore.todayWords.length) {
    await wordStore.fetchTodayWords()
    currentIndex.value = 0
  }
}

onMounted(async () => {
  if (wordStore.todayWords.length === 0) {
    await wordStore.fetchTodayWords()
  }
})
</script>
