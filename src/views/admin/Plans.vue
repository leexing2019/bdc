<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">学习计划</h1>
        <p class="text-gray-500 mt-1">为用户布置学习任务</p>
      </div>
    </div>

    <!-- Assign Task Card -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">布置学习任务</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
          <select
            v-model="selectedUser"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">请选择用户</option>
            <option v-for="user in students" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择词书</label>
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="all">全部词汇</option>
            <option value="CET-4">CET-4</option>
            <option value="CET-6">CET-6</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">每日新词数</label>
          <input
            v-model.number="dailyLimit"
            type="number"
            min="5"
            max="100"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="assignTask"
          :disabled="!selectedUser || assigning"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          {{ assigning ? '分配中...' : '确认分配' }}
        </button>
      </div>
    </div>

    <!-- User Plans -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="font-semibold text-gray-800">用户学习计划</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">每日任务</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">词书范围</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">已学单词</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">掌握率</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">最近学习</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="plan in userPlans" :key="plan.user_id" class="hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-primary-700 text-sm font-medium">{{ plan.username?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ plan.username }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ plan.daily_limit }} 词/天</td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {{ plan.category || '全部' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ plan.total_words }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      :style="{ width: `${plan.mastered_rate}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ plan.mastered_rate }}%</span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-500 text-sm">
                {{ plan.last_study_date ? formatDate(plan.last_study_date) : '从未学习' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="userPlans.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-500">暂无学习计划</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const students = ref([])
const userPlans = ref([])
const selectedUser = ref('')
const selectedCategory = ref('all')
const dailyLimit = ref(20)
const assigning = ref(false)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchStudents = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, daily_limit')
    .eq('role', 'student')
    .eq('is_active', true)

  if (!error) {
    students.value = data || []
  }
}

const fetchUserPlans = async () => {
  // Get all students with their progress
  const { data: users } = await supabase
    .from('users')
    .select('id, username, daily_limit')
    .eq('role', 'student')
    .eq('is_active', true)

  if (!users) return

  const plans = []

  for (const user of users) {
    // Get word progress
    const { data: progress } = await supabase
      .from('user_word_progress')
      .select('proficiency')
      .eq('user_id', user.id)

    const totalWords = progress?.length || 0
    const masteredWords = progress?.filter(p => p.proficiency >= 5).length || 0
    const masteredRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0

    // Get last study date
    const { data: lastLog } = await supabase
      .from('study_logs')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    plans.push({
      user_id: user.id,
      username: user.username,
      daily_limit: user.daily_limit,
      category: 'all',
      total_words: totalWords,
      mastered_rate: masteredRate,
      last_study_date: lastLog?.date
    })
  }

  userPlans.value = plans
}

const assignTask = async () => {
  if (!selectedUser.value) return

  assigning.value = true
  try {
    await supabase
      .from('users')
      .update({ daily_limit: dailyLimit.value })
      .eq('id', selectedUser.value)

    // Create a notification or log (optional)
    alert('任务分配成功！')
    
    selectedUser.value = ''
    await fetchUserPlans()
  } catch (error) {
    console.error('Assign task error:', error)
    alert('分配失败，请重试')
  } finally {
    assigning.value = false
  }
}

onMounted(() => {
  fetchStudents()
  fetchUserPlans()
})
</script>
