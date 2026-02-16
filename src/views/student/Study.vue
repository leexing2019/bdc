<template>
  <div class="min-h-[calc(100vh-8rem)] pb-20 lg:pb-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">单词背诵</h1>
      <div class="text-sm text-gray-500">
        {{ currentIndex + 1 }} / {{ wordStore.todayWords.length }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full h-2 bg-gray-200 rounded-full mb-8">
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

    <!-- Flashcard -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Word Type Badge -->
      <div class="flex justify-center mb-4">
        <span
          class="px-4 py-1 rounded-full text-sm font-medium"
          :class="currentWord?.isNew ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
        >
          {{ currentWord?.isNew ? '新词' : '复习' }}
        </span>
      </div>

      <!-- Card -->
      <div
        class="flip-card w-full h-80 cursor-pointer"
        :class="{ flipped: isFlipped }"
        @click="flipCard"
      >
        <div class="flip-card-inner relative w-full h-full">
          <!-- Front -->
          <div class="flip-card-front absolute inset-0 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 border border-gray-100">
            <button
              @click.stop="playPronunciation"
              class="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            
            <h2 class="text-4xl font-bold text-gray-800 mb-4 text-center">{{ currentWord?.spelling }}</h2>
            <p class="text-gray-400 text-sm">点击卡片查看释义</p>
          </div>

          <!-- Back -->
          <div class="flip-card-back absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 text-white">
            <div class="text-center">
              <p class="text-3xl font-bold mb-2">{{ currentWord?.spelling }}</p>
              <p class="text-primary-100 mb-4">{{ currentWord?.part_of_speech }}</p>
              <p class="text-xl mb-6">{{ currentWord?.meaning }}</p>
              
              <div v-if="currentWord?.example_sentence" class="mt-4 pt-4 border-t border-primary-400">
                <p class="text-sm text-primary-100">例句</p>
                <p class="text-sm italic">{{ currentWord?.example_sentence }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="isFlipped" class="mt-8">
        <p class="text-center text-gray-500 mb-4">你对这个单词的掌握程度是？</p>
        <div class="grid grid-cols-3 gap-4">
          <button
            @click="handleResponse(1)"
            class="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-xl transition"
          >
            <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span class="text-red-700 font-medium">不认识</span>
            <span class="text-xs text-red-500 mt-1">再来一次</span>
          </button>

          <button
            @click="handleResponse(3)"
            class="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition"
          >
            <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-yellow-700 font-medium">模糊</span>
            <span class="text-xs text-yellow-500 mt-1">稍后复习</span>
          </button>

          <button
            @click="handleResponse(5)"
            class="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
          >
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-green-700 font-medium">认识</span>
            <span class="text-xs text-green-500 mt-1">太棒了</span>
          </button>
        </div>
      </div>

      <!-- Flip Hint -->
      <div v-else class="mt-8 text-center">
        <p class="text-gray-400">点击卡片查看释义</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordStore } from '@/stores/words'

const wordStore = useWordStore()

const isFlipped = ref(false)
const currentIndex = ref(0)

const currentWord = computed(() => wordStore.todayWords[currentIndex.value])

const progressPercent = computed(() => {
  if (wordStore.todayWords.length === 0) return 100
  return ((currentIndex.value) / wordStore.todayWords.length) * 100
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

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
  
  // Reset card state
  isFlipped.value = false
  
  // Move to next word
  currentIndex.value++
  
  // Check if completed
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
