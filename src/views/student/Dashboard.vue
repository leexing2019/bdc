<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
      <h1 class="text-2xl font-bold mb-2">欢迎回来，{{ authStore.user?.username }}！</h1>
      <p class="text-primary-100">今天也要坚持背单词哦~</p>
    </div>

    <!-- Learning Plan Info -->
    <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-primary-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">当前学习计划</p>
          <p class="text-lg font-semibold text-gray-800">{{ categoryDisplay }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">每日新词</p>
          <p class="text-lg font-semibold text-primary-600">{{ userDailyLimit }} 词/天</p>
        </div>
      </div>
    </div>

    <!-- Today's Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">今日任务</p>
            <p v-if="wordStore.loading" class="text-2xl font-bold text-gray-400">
              <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </p>
            <p v-else class="text-2xl font-bold text-gray-800">{{ todayStats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待复习</p>
            <p v-if="wordStore.loading" class="text-2xl font-bold text-gray-400">
              <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </p>
            <p v-else class="text-2xl font-bold text-orange-600">{{ todayStats.review }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">新词</p>
            <p v-if="wordStore.loading" class="text-2xl font-bold text-gray-400">
              <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </p>
            <p v-else class="text-2xl font-bold text-green-600">{{ todayStats.new }}</p>
          </div>
          <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已掌握</p>
            <p v-if="wordStore.loading" class="text-2xl font-bold text-gray-400">
              <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </p>
            <p v-else class="text-2xl font-bold text-purple-600">{{ wordStore.proficiencyStats.mastered }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">开始学习</h2>
      <div class="grid grid-cols-2 gap-4">
        <router-link
          to="/student/study"
          class="flex flex-col items-center p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition transform hover:scale-105"
        >
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-semibold">开始背诵</span>
          <span class="text-sm text-primary-100 mt-1">{{ todayStats.total }} 个单词</span>
        </router-link>

        <router-link
          to="/student/import"
          class="flex flex-col items-center p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition transform hover:scale-105"
        >
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="font-semibold">导入单词</span>
          <span class="text-sm text-green-100 mt-1">上传文件</span>
        </router-link>
      </div>
    </div>

    <!-- Weekly Progress -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">本周进度</h2>
      <div class="flex items-end justify-between h-32">
        <div
          v-for="day in wordStore.weeklyStats"
          :key="day.date"
          class="flex flex-col items-center flex-1"
        >
          <div class="w-full flex items-end justify-center h-24 space-x-1">
            <div
              class="w-6 lg:w-8 rounded-t transition-all duration-300"
              :class="day.completed ? 'bg-primary-500' : 'bg-gray-200'"
              :style="{ height: day.count > 0 ? `${Math.min(day.count * 10, 100)}%` : '4px' }"
            ></div>
          </div>
          <span class="text-xs text-gray-500 mt-2">{{ day.day }}</span>
        </div>
      </div>
      <div class="flex items-center justify-center mt-4 space-x-4">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-500">已完成</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
          <span class="text-sm text-gray-500">未完成</span>
        </div>
      </div>
    </div>

    <!-- Proficiency Distribution -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">词汇掌握情况</h2>
      <div class="flex items-center justify-center">
        <div class="relative w-40 h-40">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">新词 {{ wordStore.proficiencyStats.new }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">学习中 {{ wordStore.proficiencyStats.learning }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">熟悉 {{ wordStore.proficiencyStats.familiar }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">掌握 {{ wordStore.proficiencyStats.mastered }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWordStore } from '@/stores/words'
import { supabase } from '@/lib/supabase'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const authStore = useAuthStore()
const wordStore = useWordStore()
const chartCanvas = ref(null)
let chartInstance = null

// Learning plan data
const userCategory = ref('')
const userDailyLimit = ref(20)

const fetchUserLearningPlan = async () => {
  if (!authStore.user) return
  
  try {
    // Get user settings for category
    const { data: settings } = await supabase
      .from('user_settings')
      .select('category')
      .eq('user_id', authStore.user.id)
      .maybeSingle()
    
    userCategory.value = settings?.category || 'all'
    
    // Get daily limit from user
    const { data: userData } = await supabase
      .from('users')
      .select('daily_limit')
      .eq('id', authStore.user.id)
      .maybeSingle()
    
    userDailyLimit.value = userData?.daily_limit || 20
  } catch (error) {
    console.error('Fetch learning plan error:', error)
  }
}

const categoryDisplay = computed(() => {
  if (!userCategory.value || userCategory.value === 'all') {
    return '全部词汇'
  }
  return userCategory.value
})

const todayStats = computed(() => {
  const stats = {
    total: wordStore.todayWords.length,
    review: 0,
    new: 0
  }
  
  wordStore.todayWords.forEach(word => {
    if (word.isNew) {
      stats.new++
    } else {
      stats.review++
    }
  })
  
  return stats
})

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  if (!chartCanvas.value) return
  
  const stats = wordStore.proficiencyStats
  const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1
  
  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['新词', '学习中', '熟悉', '掌握'],
      datasets: [{
        data: [stats.new, stats.learning, stats.familiar, stats.mastered],
        backgroundColor: ['#9ca3af', '#f97316', '#3b82f6', '#22c55e'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '60%',
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

onMounted(async () => {
  // 每次加载都获取最新数据
  await Promise.all([
    fetchUserLearningPlan(),
    wordStore.fetchTodayWords()
  ])
  setTimeout(createChart, 100)
})

watch(() => wordStore.proficiencyStats, () => {
  createChart()
}, { deep: true })
</script>
