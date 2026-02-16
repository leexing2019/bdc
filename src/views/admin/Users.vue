<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
        <p class="text-gray-500 mt-1">管理学生账号和学习设置</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加用户
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总用户数</p>
        <p class="text-2xl font-bold text-gray-800">{{ users.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">活跃用户</p>
        <p class="text-2xl font-bold text-green-600">{{ activeUsers }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">今日学习</p>
        <p class="text-2xl font-bold text-blue-600">{{ todayStudyCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">本周学习</p>
        <p class="text-2xl font-bold text-purple-600">{{ weekStudyCount }}</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户名..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="all">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">未激活</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户名</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">每日任务</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">注册时间</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">学习进度</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-primary-700 text-sm font-medium">{{ user.username.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ user.username }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ user.daily_limit }} 词/天</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ user.is_active ? '活跃' : '未激活' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-sm">{{ formatDate(user.created_at) }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-24 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      :style="{ width: `${getProgress(user.id)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ getProgress(user.id) }}%</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  @click="editUser(user)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  class="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <svg v-if="user.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              v-model="userForm.username"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入用户名"
            />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-1">初始密码</label>
            <input
              v-model="userForm.password"
              type="password"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">每日新词数量</label>
            <input
              v-model.number="userForm.daily_limit"
              type="number"
              min="5"
              max="100"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="saveUser"
            :disabled="saving"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const users = ref([])
const studyProgress = ref({})
const searchQuery = ref('')
const filterStatus = ref('all')
const showAddModal = ref(false)
const editingUser = ref(null)
const saving = ref(false)

const userForm = ref({
  username: '',
  password: '',
  daily_limit: 20
})

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchSearch = user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = filterStatus.value === 'all' || 
      (filterStatus.value === 'active' && user.is_active) ||
      (filterStatus.value === 'inactive' && !user.is_active)
    return matchSearch && matchStatus
  })
})

const activeUsers = computed(() => users.value.filter(u => u.is_active).length)

const todayStudyCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return Object.values(studyProgress.value).filter(p => p.last_date === today).length
})

const weekStudyCount = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  return Object.values(studyProgress.value).filter(p => p.last_date >= weekAgoStr).length
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getProgress = (userId) => {
  const progress = studyProgress.value[userId]
  if (!progress || progress.total === 0) return 0
  return Math.round((progress.mastered / progress.total) * 100)
}

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  if (!error) {
    users.value = data || []
  }
}

const fetchStudyProgress = async () => {
  // Get all user progress
  const { data: progress } = await supabase
    .from('user_word_progress')
    .select('user_id, proficiency')

  if (progress) {
    const grouped = {}
    progress.forEach(p => {
      if (!grouped[p.user_id]) {
        grouped[p.user_id] = { total: 0, mastered: 0 }
      }
      grouped[p.user_id].total++
      if (p.proficiency >= 5) {
        grouped[p.user_id].mastered++
      }
    })
    
    // Get last study date
    const { data: logs } = await supabase
      .from('study_logs')
      .select('user_id, date')
      .order('date', { ascending: false })

    if (logs) {
      logs.forEach(log => {
        if (grouped[log.user_id]) {
          grouped[log.user_id].last_date = log.date
        }
      })
    }
    
    studyProgress.value = grouped
  }
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    daily_limit: user.daily_limit
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    password: '',
    daily_limit: 20
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      // Update existing user
      const updateData = {
        username: userForm.value.username,
        daily_limit: userForm.value.daily_limit
      }
      if (userForm.value.password) {
        updateData.password = userForm.value.password
      }
      
      await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.value.id)
    } else {
      // Create new user
      await supabase
        .from('users')
        .insert({
          username: userForm.value.username,
          password: userForm.value.password,
          role: 'student',
          daily_limit: userForm.value.daily_limit
        })
    }
    
    await fetchUsers()
    closeModal()
  } catch (error) {
    console.error('Save user error:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (user) => {
  await supabase
    .from('users')
    .update({ is_active: !user.is_active })
    .eq('id', user.id)
  
  await fetchUsers()
}

onMounted(() => {
  fetchUsers()
  fetchStudyProgress()
})
</script>
