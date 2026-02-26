<template>
  <div class="space-y-6 mobile-content-pb lg:pb-0">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-4 sm:p-6 text-white">
      <h1 class="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">欢迎回来，{{ authStore.user?.username }}！</h1>
      <p class="text-primary-100 text-sm sm:text-base">今天也要坚持背单词哦~</p>
    </div>

    <!-- Learning Plan Info -->
    <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-primary-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">当前学习计划</p>
          <p class="text-lg font-semibold text-gray-800">{{ categoryDisplay }}</p>
        </div>
        <div class="text-right whitespace-nowrap">
          <p class="text-sm text-gray-500">每日新词</p>
          <p class="text-lg font-semibold text-primary-600">{{ userDailyLimit }} 词/天</p>
        </div>
      </div>
      <!-- 多计划详情 -->
      <div v-if="learningPlans.length > 0" class="mt-3 pt-3 border-t">
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="plan in learningPlans" 
            :key="plan.id"
            class="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700"
          >
            {{ getCategoryLabel(plan.category) }}: {{ plan.daily_limit }}词/天
          </span>
          <!-- 个人词库显示 -->
          <span v-if="customDailyLimit > 0" class="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700">
            个人词库: {{ customDailyLimit }}词/天
          </span>
        </div>
      </div>
      <!-- 个人词库详情（当没有多计划时显示） -->
      <div v-if="learningPlans.length === 0 && customDailyLimit > 0" class="mt-3 pt-3 border-t">
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700">
            个人词库: {{ customDailyLimit }}词/天
          </span>
        </div>
      </div>
      <!-- 无计划时显示提示 -->
      <div v-if="userDailyLimit === 0" class="mt-3 pt-3 border-t">
        <p class="text-sm text-gray-400">暂无教师分配任务，可导入个人词库或联系教师分配学习内容</p>
      </div>
    </div>

    <!-- Today's Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <p v-else-if="userDailyLimit === 0" class="text-2xl font-bold text-gray-400">暂无计划</p>
            <p v-else-if="todayCompleted" class="text-2xl font-bold text-green-600">已完成</p>
            <p v-else class="text-2xl font-bold text-gray-800">{{ todayStats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg v-if="todayCompleted" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="userDailyLimit === 0" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <svg v-else class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p v-else class="text-2xl font-bold text-green-600">{{ userDailyLimit === 0 ? 0 : todayStats.new }}</p>
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
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">开始学习</h2>
      <div class="grid grid-cols-2 gap-3">
        <router-link
          to="/student/study"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition transform hover:scale-105"
        >
          <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-semibold">{{ todayCompleted ? '复习巩固' : '开始背诵' }}</span>
          <span class="text-sm text-primary-100 mt-1">{{ todayCompleted ? '巩固已学知识' : todayStats.total + ' 个单词' }}</span>
        </router-link>

        <router-link
          to="/student/import"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition transform hover:scale-105"
        >
          <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="font-semibold">导入单词</span>
          <span class="text-sm text-green-100 mt-1">上传文件</span>
        </router-link>
      </div>
    </div>

    <!-- Weekly Progress -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h2 class="text-base font-semibold text-gray-800 mb-3">本周进度</h2>
      <div class="flex items-end justify-between h-28">
        <div
          v-for="day in wordStore.weeklyStats"
          :key="day.date"
          class="flex flex-col items-center flex-1"
        >
          <div class="w-full flex items-end justify-center h-20 space-x-0.5">
            <div
              class="w-5 sm:w-6 lg:w-8 rounded-t transition-all duration-300"
              :class="day.completed ? 'bg-primary-500' : 'bg-gray-200'"
              :style="{ height: day.count > 0 ? `${Math.min(day.count * 10, 100)}%` : '4px' }"
            ></div>
          </div>
          <span class="text-[10px] sm:text-xs text-gray-500 mt-1.5">{{ day.day }}</span>
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
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h2 class="text-base font-semibold text-gray-800 mb-3">词汇掌握情况</h2>
      <div class="flex items-center justify-center">
        <div class="relative w-32 h-32 sm:w-40 sm:h-40">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:gap-4 mt-3">
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded-full mr-1.5 sm:mr-2"></div>
          <span class="text-xs sm:text-sm text-gray-600">新词 {{ wordStore.proficiencyStats.new }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-400 rounded-full mr-1.5 sm:mr-2"></div>
          <span class="text-xs sm:text-sm text-gray-600">学习中 {{ wordStore.proficiencyStats.learning }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full mr-1.5 sm:mr-2"></div>
          <span class="text-xs sm:text-sm text-gray-600">熟悉 {{ wordStore.proficiencyStats.familiar }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full mr-1.5 sm:mr-2"></div>
          <span class="text-xs sm:text-sm text-gray-600">掌握 {{ wordStore.proficiencyStats.mastered }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWordStore } from '@/stores/words'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const route = useRoute()
const authStore = useAuthStore()
const wordStore = useWordStore()
const chartCanvas = ref(null)
let chartInstance = null

// 今日任务是否完成
const todayCompleted = ref(false)

// Learning plan data
const userCategory = ref('')
const userDailyLimit = ref(0)  // 修改默认值为0
const customDailyLimit = ref(0) // 个人词库每日新词数量
const learningPlans = ref([])

// 检查今日是否已完成学习任务
const checkTodayCompletion = async () => {
  if (!authStore.user) return
  
  // 如果没有每日任务，不存在"完成"的概念
  if (userDailyLimit.value === 0) {
    todayCompleted.value = false
    return
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 查询今天学习的新词数量（repetitions = 1 表示第一次学习）
    const { count: newWordsLearned } = await supabase
      .from('user_word_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authStore.user.id)
      .gte('last_review_date', today)
      .eq('repetitions', 1)
    
    // 如果今天学习的新词数量 >= 每日限制，则认为已完成
    todayCompleted.value = newWordsLearned >= userDailyLimit.value
  } catch (error) {
    console.error('检查今日完成状态失败:', error)
    todayCompleted.value = false
  }
}

// 获取用户学习计划 - 使用supabaseAdmin绕过RLS
const fetchUserLearningPlan = async () => {
  if (!authStore.user) return
  
  try {
    // 首先尝试获取新的学习计划表 - 使用supabaseAdmin绕过RLS
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('user_learning_plans')
      .select('*')
      .eq('user_id', authStore.user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
    
    if (!plansError && plans && plans.length > 0) {
      // 使用新的多学习计划
      learningPlans.value = plans
      userDailyLimit.value = plans.reduce((sum, p) => sum + p.daily_limit, 0)
      
      // 仍然需要加载个人词库的每日新词数量
      const { data: settings } = await supabaseAdmin
        .from('user_settings')
        .select('custom_daily_limit')
        .eq('user_id', authStore.user.id)
        .maybeSingle()
      customDailyLimit.value = settings?.custom_daily_limit || 0
      userDailyLimit.value += customDailyLimit.value
      
      // 显示第一个计划的分类作为主要显示
      if (plans.length === 1) {
        userCategory.value = plans[0].category
      } else {
        userCategory.value = 'multiple'
      }
      return
    }
    
    // 回退到旧的user_settings逻辑
    // Get user settings for category - use admin client to bypass RLS
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('category, custom_daily_limit')
      .eq('user_id', authStore.user.id)
      .maybeSingle()
    
    userCategory.value = settings?.category || ''
    
    // Get daily limit from user (teacher assigned) - 默认为0表示没有分配
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('daily_limit')
      .eq('id', authStore.user.id)
      .maybeSingle()
    
    // 教师分配的每日新词（如果没有分配任务，默认为0）
    const teacherDailyLimit = userData?.daily_limit || 0
    customDailyLimit.value = settings?.custom_daily_limit || 0
    userDailyLimit.value = teacherDailyLimit + customDailyLimit.value
    learningPlans.value = []
  } catch (error) {
    console.error('Fetch learning plan error:', error)
    // 出错时也设置为0
    userDailyLimit.value = 0
    customDailyLimit.value = 0
    learningPlans.value = []
  }
}

const categoryDisplay = computed(() => {
  // 如果有多个学习计划，显示计划数量
  if (learningPlans.value.length > 1) {
    return `${learningPlans.value.length}个学习计划`
  }
  
  // 如果没有任何每日任务，显示暂无学习计划
  if (userDailyLimit.value === 0) {
    return '暂无学习计划'
  }
  
  // 存在学习计划的情况：
  // 1. 有学习计划（learningPlans.length === 1）
  // 2. 有教师分配的任务（teacherDailyLimit > 0）
  // 3. 有个人词库任务（customDailyLimit > 0）
  
  // 如果有1个学习计划，显示该计划分类
  if (learningPlans.value.length === 1) {
    return getCategoryLabel(learningPlans.value[0].category)
  }
  
  // 如果有教师分配的任务（userCategory存在且不是'all'或空）
  if (userCategory.value && userCategory.value !== 'all' && userCategory.value !== '') {
    return userCategory.value
  }
  
  // 如果有个人词库任务
  if (customDailyLimit.value > 0) {
    return '个人词库'
  }
  
  // 其他情况
  return '学习计划'
})

// 分类标签映射
const getCategoryLabel = (category) => {
  const labels = {
    'CET-4': 'CET-4',
    'CET-6': 'CET-6',
    'IELTS': 'IELTS',
    'TOEFL': 'TOEFL',
    'GRE': 'GRE',
    'custom': '个人词库',
    'all': '全部词库'
  }
  return labels[category] || category
}

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
  // fetchWords获取用户学习进度（用于词汇掌握统计）
  // fetchTodayWords获取今日学习单词
  await loadDashboardData()
  
  // 监听 localStorage 变化（从个人中心返回时刷新数据）
  window.addEventListener('storage', handleStorageChange)
})

// 处理 localStorage 变化
const handleStorageChange = (event) => {
  if (event.key === 'smartmemo_profile_updated') {
    loadDashboardData()
    // 清除标记
    localStorage.removeItem('smartmemo_profile_updated')
  }
}

// 加载首页数据
const loadDashboardData = async () => {
  await Promise.all([
    fetchUserLearningPlan(),
    wordStore.fetchWords(), // 获取学习进度用于统计
    wordStore.fetchTodayWords(),
    checkTodayCompletion()
  ])
  setTimeout(createChart, 100)
}

// 监听路由变化，刷新数据（从背诵页面或个人中心返回时）
watch(() => route.path, async (newPath) => {
  if (newPath === '/student/dashboard') {
    await loadDashboardData()
  }
})

watch(() => wordStore.proficiencyStats, () => {
  createChart()
}, { deep: true })
</script>
