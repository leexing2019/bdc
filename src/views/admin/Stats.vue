<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
      <p class="text-gray-500 mt-1">查看用户学习数据和分析</p>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总用户数</p>
        <p class="text-2xl font-bold text-gray-800">{{ stats.totalUsers }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">今日活跃</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.todayActive }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总学习次数</p>
        <p class="text-2xl font-bold text-blue-600">{{ stats.totalStudyDays }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">人均掌握单词</p>
        <p class="text-2xl font-bold text-purple-600">{{ stats.avgMastered }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weekly Activity -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-4">本周学习情况</h3>
        <div class="h-48">
          <canvas ref="weeklyChartCanvas"></canvas>
        </div>
      </div>

      <!-- Proficiency Distribution -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-4">词汇掌握分布</h3>
        <div class="h-48">
          <canvas ref="proficiencyChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-800">最近学习记录</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">新词数</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">复习数</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">学习时长</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in recentLogs" :key="log.id" class="hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-primary-700 text-sm font-medium">{{ log.username?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ log.username }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ formatDate(log.date) }}</td>
              <td class="py-3 px-4 text-gray-600">{{ log.new_words_learned }}</td>
              <td class="py-3 px-4 text-gray-600">{{ log.words_reviewed }}</td>
              <td class="py-3 px-4 text-gray-600">{{ log.duration_minutes }} 分钟</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="recentLogs.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-gray-500">暂无学习记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabase'
import { Chart, BarController, DoughnutController, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, DoughnutController, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const stats = ref({
  totalUsers: 0,
  todayActive: 0,
  totalStudyDays: 0,
  avgMastered: 0
})

const recentLogs = ref([])
const weeklyChartCanvas = ref(null)
const proficiencyChartCanvas = ref(null)

let weeklyChart = null
let proficiencyChart = null

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchStats = async () => {
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  stats.value.totalUsers = totalUsers || 0

  // Today active
  const today = new Date().toISOString().split('T')[0]
  const { count: todayActive } = await supabase
    .from('study_logs')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)

  stats.value.todayActive = todayActive || 0

  // Total study days
  const { count: totalStudyDays } = await supabase
    .from('study_logs')
    .select('*', { count: 'exact', head: true })

  stats.value.totalStudyDays = totalStudyDays || 0

  // Average mastered
  const { data: progress } = await supabase
    .from('user_word_progress')
    .select('proficiency')

  if (progress) {
    const totalMastered = progress.filter(p => p.proficiency >= 5).length
    const totalUsersWithProgress = new Set(progress.map(p => p.user_id)).size
    stats.value.avgMastered = totalUsersWithProgress > 0 ? Math.round(totalMastered / totalUsersWithProgress) : 0
  }
}

const fetchRecentLogs = async () => {
  const { data: logs } = await supabase
    .from('study_logs')
    .select('*, users(username)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (logs) {
    recentLogs.value = logs.map(log => ({
      ...log,
      username: log.users?.username
    }))
  }
}

const fetchWeeklyData = async () => {
  const weekData = []
  const labels = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)

    const { count } = await supabase
      .from('study_logs')
      .select('*', { count: 'exact', head: true })
      .eq('date', dateStr)

    weekData.push(count || 0)
  }

  if (weeklyChart) weeklyChart.destroy()
  if (!weeklyChartCanvas.value) return

  weeklyChart = new Chart(weeklyChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '学习人数',
        data: weekData,
        backgroundColor: '#6366f1',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  })
}

const fetchProficiencyData = async () => {
  const { data: progress } = await supabase
    .from('user_word_progress')
    .select('proficiency')

  const distribution = {
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0
  }

  if (progress) {
    progress.forEach(p => {
      if (!p.proficiency || p.proficiency === 0) {
        distribution.new++
      } else if (p.proficiency < 3) {
        distribution.learning++
      } else if (p.proficiency < 5) {
        distribution.familiar++
      } else {
        distribution.mastered++
      }
    })
  }

  if (proficiencyChart) proficiencyChart.destroy()
  if (!proficiencyChartCanvas.value) return

  proficiencyChart = new Chart(proficiencyChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['新词', '学习中', '熟悉', '掌握'],
      datasets: [{
        data: [distribution.new, distribution.learning, distribution.familiar, distribution.mastered],
        backgroundColor: ['#9ca3af', '#f97316', '#3b82f6', '#22c55e'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  })
}

onMounted(async () => {
  await fetchStats()
  await fetchRecentLogs()
  await nextTick()
  await fetchWeeklyData()
  await fetchProficiencyData()
})
</script>
