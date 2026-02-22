<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">个人中心</h1>
    </div>

    <!-- User Info Card -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-2xl font-bold text-primary-700">
            {{ authStore.user?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-800">{{ authStore.user?.username }}</h2>
          <p class="text-gray-500">学生账号</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <!-- 加载动画 -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-8 w-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-3xl font-bold text-primary-600">{{ totalWordsCount }}</p>
        <p class="text-sm text-gray-500">总单词数</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-3xl font-bold text-green-600">{{ wordStore.proficiencyStats.mastered }}</p>
        <p class="text-sm text-gray-500">已掌握</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-3xl font-bold text-blue-600">{{ wordStore.proficiencyStats.familiar }}</p>
        <p class="text-sm text-gray-500">熟悉</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-3xl font-bold text-orange-600">{{ wordStore.proficiencyStats.learning }}</p>
        <p class="text-sm text-gray-500">学习中</p>
      </div>
    </div>

    <!-- Settings -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-800">学习设置</h3>
      </div>
      <div class="divide-y divide-gray-100">
        <!-- 学习计划（多计划模式） -->
        <div v-if="learningPlans.length > 0" class="p-4">
          <div class="mb-3">
            <p class="font-medium text-gray-800">当前学习计划</p>
            <p class="text-sm text-gray-500">每日任务总量: {{ totalDailyLimit }} 词/天</p>
          </div>
          <div class="space-y-2">
            <div 
              v-for="plan in learningPlans" 
              :key="plan.id"
              class="flex items-center justify-between p-3 rounded-lg"
              :class="plan.status === 'paused' ? 'bg-gray-50' : 'bg-primary-50'"
            >
              <div class="flex items-center gap-3">
                <span class="font-medium text-gray-800">{{ getCategoryLabel(plan.category) }}</span>
                <span 
                  class="px-2 py-0.5 text-xs rounded-full"
                  :class="plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'"
                >
                  {{ plan.status === 'active' ? '进行中' : '已暂停' }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">{{ plan.daily_limit }}词/天</span>
                <button
                  v-if="plan.status === 'active'"
                  @click="togglePlanStatus(plan)"
                  class="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-100"
                >
                  暂停
                </button>
                <button
                  v-else
                  @click="togglePlanStatus(plan)"
                  class="px-2 py-1 text-xs text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50"
                >
                  恢复
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 教师分配每日新词数量 -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-800">每日新词数量（教师分配）</p>
            <p class="text-sm text-gray-500">
              教师分配: {{ authStore.user?.admin_daily_limit || authStore.user?.daily_limit || 20 }} 词/天
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="updateDailyLimitDecrease"
              :disabled="(authStore.user?.daily_limit || 20) <= (authStore.user?.admin_daily_limit || 20)"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span class="w-12 text-center font-medium">{{ authStore.user?.daily_limit || 20 }}</span>
            <button
              @click="updateDailyLimitIncrease"
              :disabled="(authStore.user?.daily_limit || 20) >= 50"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        <!-- 个人词库每日新词数量 -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-800">每日新词数量（个人词库）</p>
            <p class="text-sm text-gray-500">
              个人词库每日新增: {{ customDailyLimit }} 词/天
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="updateCustomDailyLimitDecrease"
              :disabled="customDailyLimit <= 0"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span class="w-12 text-center font-medium">{{ customDailyLimit }}</span>
            <button
              @click="updateCustomDailyLimitIncrease"
              :disabled="customDailyLimit >= 30"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        <!-- 每日任务总量 -->
        <div class="p-4 bg-blue-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">每日任务总量</p>
              <p class="text-sm text-gray-500">
                每日学习新词总数 = 教师分配 + 个人词库
              </p>
            </div>
            <div class="text-2xl font-bold text-blue-600">
              {{ (authStore.user?.daily_limit || 20) + customDailyLimit }} 词/天
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-800">修改密码</h3>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请输入当前密码"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请输入新密码"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请再次输入新密码"
          />
        </div>
        <div v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="text-green-600 text-sm">{{ passwordSuccess }}</div>
        <button
          @click="changePassword"
          :disabled="passwordLoading"
          class="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          {{ passwordLoading ? '修改中...' : '修改密码' }}
        </button>
      </div>
    </div>

    <!-- Logout -->
    <button
      @click="handleLogout"
      class="w-full py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
    >
      退出登录
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWordStore } from '@/stores/words'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const wordStore = useWordStore()

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordLoading = ref(false)
const customDailyLimit = ref(0) // 个人词库每日背诵数量
const totalWordsCount = ref(0) // 总单词数
const loading = ref(true) // 加载状态

// 学习计划相关
const learningPlans = ref([])

// 计算每日任务总量
const totalDailyLimit = computed(() => {
  if (learningPlans.value.length > 0) {
    return learningPlans.value.reduce((sum, p) => sum + p.daily_limit, 0)
  }
  return (authStore.user?.daily_limit || 20) + customDailyLimit.value
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

// 加载学习计划
const loadLearningPlans = async () => {
  try {
    const { data: plans, error } = await supabase
      .from('user_learning_plans')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('priority', { ascending: true })
    
    if (!error && plans) {
      learningPlans.value = plans
    }
  } catch (error) {
    console.error('加载学习计划失败:', error)
  }
}

// 切换计划状态
const togglePlanStatus = async (plan) => {
  const newStatus = plan.status === 'active' ? 'paused' : 'active'
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    if (!error) {
      plan.status = newStatus
    }
  } catch (error) {
    console.error('切换计划状态失败:', error)
  }
}

const updateDailyLimitDecrease = async () => {
  const currentLimit = authStore.user?.daily_limit || 20
  const adminLimit = authStore.user?.admin_daily_limit || 20
  
  // 只能大于或等于教师分配的量
  if (currentLimit <= adminLimit) {
    return
  }
  
  const newLimit = Math.max(adminLimit, currentLimit - 5)
  await updateDailyLimit(newLimit)
}

const updateDailyLimitIncrease = async () => {
  const currentLimit = authStore.user?.daily_limit || 20
  
  // 最大只能调整到50
  if (currentLimit >= 50) {
    return
  }
  
  const newLimit = Math.min(50, currentLimit + 5)
  await updateDailyLimit(newLimit)
}

const updateCustomDailyLimitDecrease = async () => {
  if (customDailyLimit.value <= 0) return
  const newLimit = Math.max(0, customDailyLimit.value - 5)
  await updateCustomDailyLimit(newLimit)
}

const updateCustomDailyLimitIncrease = async () => {
  if (customDailyLimit.value >= 30) return
  const newLimit = Math.min(30, customDailyLimit.value + 5)
  await updateCustomDailyLimit(newLimit)
}

const updateCustomDailyLimit = async (newLimit) => {
  try {
    // 使用supabaseAdmin确保数据一致性
    // 检查user_settings是否存在
    const { data: existingSettings } = await supabaseAdmin
      .from('user_settings')
      .select('id')
      .eq('user_id', authStore.user.id)
      .maybeSingle()

    if (existingSettings) {
      // 更新现有设置
      const { error } = await supabaseAdmin
        .from('user_settings')
        .update({ custom_daily_limit: newLimit })
        .eq('user_id', authStore.user.id)
      
      if (!error) {
        customDailyLimit.value = newLimit
      } else {
        console.error('Update error:', error)
      }
    } else {
      // 创建新设置
      const { error } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: authStore.user.id,
          custom_daily_limit: newLimit
        })
      
      if (!error) {
        customDailyLimit.value = newLimit
      }
    }
  } catch (error) {
    console.error('Update custom daily limit error:', error)
  }
}

// 加载用户设置
const loadUserSettings = async () => {
  try {
    // 使用supabaseAdmin确保数据一致性
    const { data: userSettings } = await supabaseAdmin
      .from('user_settings')
      .select('category, custom_daily_limit')
      .eq('user_id', authStore.user.id)
      .maybeSingle()
    
    if (userSettings?.custom_daily_limit) {
      customDailyLimit.value = userSettings.custom_daily_limit
    }

    // 计算总单词数（教师分配 + 个人词库）
    // 修改：直接查询 words 表，获取所有分配给该学生的单词
    const userCategory = userSettings?.category
    
    let assignedWordCount = 0
    
    if (userCategory && userCategory !== 'all') {
      // 特定词库
      const { count } = await supabaseAdmin
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('category', userCategory)
      assignedWordCount = count || 0
    } else {
      // 全部词库（包括 'all' 和 null/未设置的情况）- 查询所有非 custom 的单词
      // 这样可以显示教师分配的所有单词，不管学生是否已经开始学习
      const { count } = await supabaseAdmin
        .from('words')
        .select('*', { count: 'exact', head: true })
        .neq('category', 'custom')
      assignedWordCount = count || 0
    }
    
    // 个人词库单词数
    const { count: customCount } = await supabaseAdmin
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'custom')
      .eq('created_by', authStore.user.id)
    
    const customWordCount = customCount || 0
    
    // 总单词数 = 教师分配 + 个人词库
    totalWordsCount.value = assignedWordCount + customWordCount
  } catch (error) {
    console.error('Load user settings error:', error)
  } finally {
    loading.value = false
  }
}

const updateDailyLimit = async (newLimit) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ daily_limit: newLimit })
      .eq('id', authStore.user.id)

    if (!error) {
      authStore.user.daily_limit = newLimit
      localStorage.setItem('smartmemo_user', JSON.stringify(authStore.user))
    }
  } catch (error) {
    console.error('Update daily limit error:', error)
  }
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    passwordError.value = '请填写所有字段'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return
  }

  if (passwordForm.newPassword.length < 6) {
    passwordError.value = '密码长度至少6位'
    return
  }

  passwordLoading.value = true

  try {
    const result = await authStore.updatePassword(passwordForm.oldPassword, passwordForm.newPassword)
    
    if (result.success) {
      passwordSuccess.value = '密码修改成功'
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      passwordError.value = result.error
    }
  } catch (error) {
    passwordError.value = '修改密码失败'
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadUserSettings()
  loadLearningPlans()
})
</script>
