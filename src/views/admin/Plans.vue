<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">学习计划</h1>
        <p class="text-gray-500 mt-1">为用户布置学习任务</p>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Assign Task Card -->
    <div v-else class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">布置学习任务</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择用户</label>
          <div class="relative">
            <input
              v-model="userSearch"
              @focus="showUserDropdown = true"
              @blur="hideUserDropdown"
              type="text"
              placeholder="搜索用户..."
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <div
              v-if="showUserDropdown && filteredStudents.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="user in filteredStudents"
                :key="user.id"
                @mousedown="selectUser(user)"
                class="px-4 py-2 hover:bg-primary-50 cursor-pointer flex items-center"
              >
                <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                  <span class="text-primary-700 text-xs font-medium">{{ user.username.charAt(0).toUpperCase() }}</span>
                </div>
                <span>{{ user.username }}</span>
              </div>
            </div>
            <div
              v-if="selectedUserName"
              class="absolute right-8 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >
              {{ selectedUserName }}
            </div>
            <svg
              v-if="selectedUser"
              @click="clearUser"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择词书</label>
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="all">全部词汇</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }} ({{ getCategoryCount(cat) }}词)
            </option>
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
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
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
                <span class="px-2 py-1 text-xs rounded-full" :class="getCategoryBadgeClass(plan.category)">
                  {{ getCategoryDisplay(plan.category) }}
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
              <td class="py-3 px-4 text-right">
                <button
                  @click="editPlan(plan)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition"
                  title="编辑"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deletePlan(plan)"
                  class="p-2 text-gray-400 hover:text-red-600 transition"
                  title="删除"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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
import { ref, computed, onMounted } from 'vue'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const students = ref([])
const userPlans = ref([])
const loading = ref(true)
const categories = ref([])
const categoryCounts = ref({})
const selectedUser = ref('')
const userSearch = ref('')
const showUserDropdown = ref(false)
const selectedCategory = ref('all')
const dailyLimit = ref(20)
const assigning = ref(false)

const filteredStudents = computed(() => {
  if (!userSearch.value) return students.value
  const search = userSearch.value.toLowerCase()
  return students.value.filter(user => 
    user.username.toLowerCase().includes(search)
  )
})

const selectedUserName = computed(() => {
  if (!selectedUser.value) return ''
  const user = students.value.find(u => u.id === selectedUser.value)
  return user ? user.username : ''
})

const selectUser = (user) => {
  selectedUser.value = user.id
  userSearch.value = user.username
  showUserDropdown.value = false
}

const clearUser = () => {
  selectedUser.value = ''
  userSearch.value = ''
}

const hideUserDropdown = () => {
  setTimeout(() => {
    showUserDropdown.value = false
  }, 200)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('words')
    .select('category')
  
  if (error) {
    console.error('获取词书分类失败:', error)
    return
  }
  
  if (data) {
    const uniqueCategories = [...new Set(data.map(w => w.category).filter(c => c && c.trim()))]
    categories.value = uniqueCategories
    
    // 计算每个分类的单词数量
    const counts = {}
    data.forEach(w => {
      if (w.category) {
        counts[w.category] = (counts[w.category] || 0) + 1
      }
    })
    categoryCounts.value = counts
  }
}

const getCategoryCount = (category) => {
  return categoryCounts.value[category] || 0
}

const getCategoryDisplay = (category) => {
  if (!category || category === 'all') return '全部词汇'
  return category
}

const getCategoryBadgeClass = (category) => {
  if (!category || category === 'all') return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
}

const fetchStudents = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, daily_limit')
    .eq('role', 'student')
    .eq('is_active', true)

  if (!error) {
    students.value = data || []
  }
}

const fetchUserPlans = async () => {
  loading.value = true
  try {
    // Get users who have settings (assigned learning plans)
    const { data: settingsWithUsers, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select(`
        user_id,
        category,
        users!inner(id, username, daily_limit, role, is_active)
      `)
    
    if (settingsError) {
      console.error('获取用户设置失败:', settingsError)
      return
    }

    if (!settingsWithUsers || settingsWithUsers.length === 0) {
      userPlans.value = []
      return
    }

    const plans = []

    for (const setting of settingsWithUsers) {
      const user = setting.users
      // Skip if user not found or not active
      if (!user || user.role !== 'student' || !user.is_active) continue

      // Get word progress
      const { data: progress } = await supabaseAdmin
        .from('user_word_progress')
        .select('proficiency')
        .eq('user_id', user.id)

      const totalWords = progress?.length || 0
      const masteredWords = progress?.filter(p => p.proficiency >= 5).length || 0
      const masteredRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0

      // Get last study date
      const { data: lastLog } = await supabaseAdmin
        .from('study_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()

      plans.push({
        user_id: user.id,
        username: user.username,
        daily_limit: user.daily_limit,
        category: setting.category,
        total_words: totalWords,
        mastered_rate: masteredRate,
        last_study_date: lastLog?.date
      })
    }

    userPlans.value = plans
  } finally {
    loading.value = false
  }
}

const assignTask = async () => {
  if (!selectedUser.value) return

  assigning.value = true
  try {
    // Update daily limit
    await supabase
      .from('users')
      .update({ daily_limit: dailyLimit.value })
      .eq('id', selectedUser.value)

    // Save category preference to user_settings
    // First check if settings exist
    const { data: existingSettings } = await supabaseAdmin
      .from('user_settings')
      .select('id')
      .eq('user_id', selectedUser.value)
      .maybeSingle()

    if (existingSettings) {
      // Update existing settings
      await supabaseAdmin
        .from('user_settings')
        .update({ category: selectedCategory.value })
        .eq('user_id', selectedUser.value)
    } else {
      // Create new settings
      await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: selectedUser.value,
          category: selectedCategory.value
        })
    }

    alert('任务分配成功！')
    
    selectedUser.value = ''
    selectedCategory.value = 'all'
    dailyLimit.value = 20
    await fetchUserPlans()
  } catch (error) {
    console.error('Assign task error:', error)
    alert('分配失败，请重试')
  } finally {
    assigning.value = false
  }
}

const editPlan = (plan) => {
  // 填充表单数据
  selectedUser.value = plan.user_id
  userSearch.value = plan.username
  selectedCategory.value = plan.category === 'all' ? 'all' : plan.category
  dailyLimit.value = plan.daily_limit
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deletePlan = async (plan) => {
  if (!confirm(`确定要删除用户 "${plan.username}" 的学习计划吗？\n\n这将清除该用户的词书设置，但保留学习记录。`)) {
    return
  }
  
  try {
    // 删除用户设置
    await supabaseAdmin
      .from('user_settings')
      .delete()
      .eq('user_id', plan.user_id)
    
    await fetchUserPlans()
    alert('删除成功！')
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  }
}

onMounted(() => {
  fetchCategories()
  fetchStudents()
  fetchUserPlans()
})
</script>
