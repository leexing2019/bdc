<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div class="flex flex-col flex-1 overflow-y-auto">
        <!-- Logo -->
        <div class="flex items-center h-16 px-6 border-b border-gray-200">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="ml-3 font-bold text-gray-800">智忆单词</span>
          <span class="ml-auto px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">管理</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition"
            :class="$route.path === item.path 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-gray-600 hover:bg-gray-50'"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-medium">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-800">{{ authStore.user?.username }}</p>
              <p class="text-xs text-gray-500">管理员</p>
            </div>
          </div>
          <div class="mt-3 flex space-x-2">
            <button
              @click="showPasswordModal = true"
              class="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              修改密码
            </button>
            <button
              @click="handleLogout"
              class="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
      <div class="p-4 lg:p-8">
        <router-view />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div class="flex justify-around items-center h-16">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center flex-1 h-full"
          :class="$route.path === item.path 
            ? 'text-primary-600' 
            : 'text-gray-500'"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span class="text-xs mt-1">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请再次输入新密码"
            />
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="showPasswordModal = false; newPassword = ''; confirmPassword = ''"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="changePassword"
            :disabled="changingPassword"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ changingPassword ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabaseAdmin } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()

// 修改密码相关状态
const showPasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

// 修改密码
const changePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    alert('密码长度至少6位')
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }
  
  changingPassword.value = true
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ password: newPassword.value })
      .eq('id', authStore.user.id)
    
    if (error) throw error
    
    alert('密码修改成功！')
    showPasswordModal.value = false
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('修改密码失败，请重试')
  } finally {
    changingPassword.value = false
  }
}

// Icon components
const UsersIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
  ])
}

const WordsIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  ])
}

const PlansIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
  ])
}

const StatsIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
  ])
}

const navItems = [
  { name: '用户管理', path: '/admin/users', icon: UsersIcon },
  { name: '词库管理', path: '/admin/words', icon: WordsIcon },
  { name: '学习计划', path: '/admin/plans', icon: PlansIcon },
  { name: '数据统计', path: '/admin/stats', icon: StatsIcon }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
