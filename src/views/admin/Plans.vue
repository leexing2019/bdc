<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">学习计划</h1>
        <p class="text-gray-500 mt-1">为用户布置多个学习任务</p>
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

    <!-- 实际内容 -->
    <template v-else>
    <!-- 选择用户区域 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">选择学生</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索用户</label>
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
        
        <div class="lg:col-span-2 flex items-end">
          <div v-if="selectedUserName" class="text-primary-600 font-medium">
            已选择: {{ selectedUserName }}
          </div>
          <div v-else class="text-gray-400">
            请在上方搜索并选择学生
          </div>
        </div>
      </div>
    </div>

    <!-- 学习计划管理区域 -->
    <div v-if="selectedUser" class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">{{ selectedUserName }} 的学习计划</h2>
      </div>

      <!-- 可添加的词库分类 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">添加学习计划</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in availableCategories"
            :key="cat.value"
            @click="addPlanCategory(cat.value)"
            :disabled="userPlans.some(p => p.category === cat.value)"
            class="px-3 py-1 text-sm rounded-full border transition"
            :class="userPlans.some(p => p.category === cat.value) 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'"
          >
            + {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 当前学习计划列表 -->
      <div v-if="loadingPlans" class="flex items-center justify-center py-8">
        <svg class="w-8 h-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="userPlans.length === 0" class="text-center py-8 text-gray-500">
        暂无学习计划，请点击上方按钮添加
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="(plan, index) in userPlans" 
          :key="plan.id"
          class="border rounded-lg p-4"
          :class="plan.status === 'paused' ? 'bg-gray-50' : 'bg-white'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg font-medium text-gray-800">{{ getCategoryLabel(plan.category) }}</span>
              <span 
                class="px-2 py-0.5 text-xs rounded-full"
                :class="plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ plan.status === 'active' ? '进行中' : '已暂停' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- 优先级调整 -->
              <button
                @click="movePlanPriority(plan, -1)"
                :disabled="index === 0"
                class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="上移"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span class="text-sm text-gray-500">优先级 {{ plan.priority }}</span>
              <button
                @click="movePlanPriority(plan, 1)"
                :disabled="index === userPlans.length - 1"
                class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="下移"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">每日新词:</label>
              <input
                v-model.number="plan.daily_limit"
                type="number"
                min="1"
                max="100"
                class="w-20 px-2 py-1 border rounded text-center"
                @change="updatePlanDailyLimit(plan)"
              />
            </div>

            <button
              v-if="plan.status === 'active'"
              @click="pausePlan(plan)"
              class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50"
            >
              暂停
            </button>
            <button
              v-else
              @click="resumePlan(plan)"
              class="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50"
            >
              恢复
            </button>

            <button
              @click="removePlan(plan)"
              class="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户学习计划总览 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="font-semibold text-gray-800">所有学生的学习计划</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">学习计划</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">每日任务</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">已学单词</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">掌握率</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">最近学习</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="plan in allUserPlans" :key="plan.id" class="hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-primary-700 text-sm font-medium">{{ plan.username?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ plan.username }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="cat in plan.categories" 
                    :key="cat"
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="getCategoryBadgeClass(cat)"
                  >
                    {{ getCategoryLabel(cat) }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ plan.total_daily_limit }} 词/天</td>
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
                  @click="editUserPlans(plan)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition"
                  title="编辑"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="allUserPlans.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-500">暂无学习计划</p>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const students = ref([])
const allUserPlans = ref([])
const loading = ref(true)
const loadingPlans = ref(false)
const categories = ref([])
const categoryCounts = ref({})

// 用户选择相关
const selectedUser = ref('')
const selectedUserName = ref('')
const userSearch = ref('')
const showUserDropdown = ref(false)

// 当前编辑用户的学习计划
const userPlans = ref([])

// 可用的分类选项（从数据库动态加载）
const availableCategories = ref([
  { value: 'CET-4', label: 'CET-4' },
  { value: 'CET-6', label: 'CET-6' },
  { value: 'custom', label: '个人词库' },
  { value: 'all', label: '全部词库' }
])

const filteredStudents = computed(() => {
  if (!userSearch.value) return students.value
  const search = userSearch.value.toLowerCase()
  return students.value.filter(user => 
    user.username.toLowerCase().includes(search)
  )
})

const selectUser = async (user) => {
  selectedUser.value = user.id
  selectedUserName.value = user.username
  userSearch.value = user.username
  showUserDropdown.value = false
  await fetchUserPlans(user.id)
}

const clearUser = () => {
  selectedUser.value = ''
  selectedUserName.value = ''
  userSearch.value = ''
  userPlans.value = []
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
    day: '2-digit'
  })
}

// 从数据库加载词库分类
const loadCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('category')
    
    if (error) {
      console.error('加载词库分类失败:', error)
      return
    }
    
    if (data) {
      const uniqueCategories = [...new Set(data.map(w => w.category).filter(c => c && c.trim() && c !== 'custom'))]
      // 更新分类列表，保留特殊选项
      const specialCategories = [
        { value: 'custom', label: '个人词库' },
        { value: 'all', label: '全部词库' }
      ]
      const newCategories = [
        ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
        ...specialCategories
      ]
      availableCategories.value = newCategories
      
      // 同时更新旧的categories变量用于兼容性
      categories.value = uniqueCategories
    }
  } catch (error) {
    console.error('加载词库分类失败:', error)
  }
}

// 获取分类标签
const getCategoryLabel = (category) => {
  const cat = availableCategories.value.find(c => c.value === category)
  return cat ? cat.label : category
}

const getCategoryBadgeClass = (category) => {
  if (category === 'CET-4') return 'bg-blue-100 text-blue-700'
  if (category === 'CET-6') return 'bg-green-100 text-green-700'
  if (category === 'custom') return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}

const getCategoryCount = (category) => {
  return categoryCounts.value[category] || 0
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

// 获取单个用户的学习计划
const fetchUserPlans = async (userId) => {
  loadingPlans.value = true
  userPlans.value = []
  try {
    const { data, error } = await supabase
      .from('user_learning_plans')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true })
    
    if (error) throw error
    userPlans.value = data || []
  } catch (error) {
    console.error('获取学习计划失败:', error)
  } finally {
    loadingPlans.value = false
  }
}

// 获取所有用户的学习计划
const fetchAllUserPlans = async () => {
  loading.value = true
  try {
    // 获取所有有学习计划的用户
    const { data: plansData, error: plansError } = await supabase
      .from('user_learning_plans')
      .select('*')
      .order('user_id', { ascending: true })
      .order('priority', { ascending: true })

    if (plansError) {
      console.error('获取学习计划失败:', plansError)
      allUserPlans.value = []
      loading.value = false
      return
    }

    // 按用户分组
    const userPlansMap = {}
    plansData?.forEach(plan => {
      if (!userPlansMap[plan.user_id]) {
        userPlansMap[plan.user_id] = []
      }
      userPlansMap[plan.user_id].push(plan)
    })

    // 获取用户信息和学习进度
    const result = []
    for (const userId of Object.keys(userPlansMap)) {
      const plans = userPlansMap[userId]
      
      // 获取用户信息
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .single()

      if (!userData) continue

      // 获取学习进度
      const { data: progress } = await supabaseAdmin
        .from('user_word_progress')
        .select('proficiency')
        .eq('user_id', userId)

      const totalWords = progress?.length || 0
      const masteredWords = progress?.filter(p => p.proficiency >= 5).length || 0
      const masteredRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0

      // 获取最近学习日期
      const { data: lastLog } = await supabaseAdmin
        .from('study_logs')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()

      result.push({
        id: userId,
        username: userData.username,
        categories: plans.map(p => p.category),
        total_daily_limit: plans.reduce((sum, p) => sum + p.daily_limit, 0),
        total_words: totalWords,
        mastered_rate: masteredRate,
        last_study_date: lastLog?.date
      })
    }

    allUserPlans.value = result
  } catch (error) {
    console.error('获取所有用户学习计划失败:', error)
    allUserPlans.value = []
  } finally {
    loading.value = false
  }
}

// 添加学习计划
const addPlanCategory = async (category) => {
  if (!selectedUser.value) return
  
  if (userPlans.value.some(p => p.category === category)) return
  
  const newPlan = {
    user_id: selectedUser.value,
    category: category,
    daily_limit: 20,
    priority: userPlans.value.length + 1,
    status: 'active'
  }
  
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .insert(newPlan)
    
    if (error) throw error
    await fetchUserPlans(selectedUser.value)
    await fetchAllUserPlans()
  } catch (error) {
    console.error('添加学习计划失败:', error)
    alert('添加学习计划失败')
  }
}

// 更新每日限制
const updatePlanDailyLimit = async (plan) => {
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .update({ daily_limit: plan.daily_limit, updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    if (error) throw error
    await fetchAllUserPlans()
  } catch (error) {
    console.error('更新每日限制失败:', error)
    alert('更新失败')
  }
}

// 暂停计划
const pausePlan = async (plan) => {
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    if (error) throw error
    plan.status = 'paused'
  } catch (error) {
    console.error('暂停计划失败:', error)
  }
}

// 恢复计划
const resumePlan = async (plan) => {
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    if (error) throw error
    plan.status = 'active'
  } catch (error) {
    console.error('恢复计划失败:', error)
  }
}

// 删除计划
const removePlan = async (plan) => {
  if (!confirm(`确定要删除 "${getCategoryLabel(plan.category)}" 学习计划吗？`)) return
  
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .delete()
      .eq('id', plan.id)
    
    if (error) throw error
    userPlans.value = userPlans.value.filter(p => p.id !== plan.id)
    await fetchAllUserPlans()
  } catch (error) {
    console.error('删除计划失败:', error)
  }
}

// 调整优先级
const movePlanPriority = async (plan, direction) => {
  const index = userPlans.value.findIndex(p => p.id === plan.id)
  if (index === -1) return
  
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= userPlans.value.length) return
  
  const otherPlan = userPlans.value[newIndex]
  const tempPriority = plan.priority
  
  try {
    await supabase
      .from('user_learning_plans')
      .update({ priority: otherPlan.priority, updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    await supabase
      .from('user_learning_plans')
      .update({ priority: tempPriority, updated_at: new Date().toISOString() })
      .eq('id', otherPlan.id)
    
    await fetchUserPlans(selectedUser.value)
    await fetchAllUserPlans()
  } catch (error) {
    console.error('调整优先级失败:', error)
  }
}

// 编辑用户计划（跳转到该用户）
const editUserPlans = async (plan) => {
  const user = students.value.find(s => s.id === plan.id)
  if (user) {
    await selectUser(user)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(async () => {
  await loadCategories()
  await fetchStudents()
  await fetchAllUserPlans()
})
</script>
