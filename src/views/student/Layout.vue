<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Header -->
    <header class="bg-white shadow-sm lg:hidden">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center space-x-2">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="font-bold text-gray-800">智忆单词</span>
        </div>
        <button @click="showMobileMenu = !showMobileMenu" class="p-2 text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar - Desktop -->
      <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div class="flex flex-col flex-1 overflow-y-auto">
          <!-- Logo -->
          <div class="flex items-center h-16 px-6 border-b border-gray-200">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="ml-3 font-bold text-gray-800">智忆单词</span>
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
                <p class="text-xs text-gray-500">学生账号</p>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="showMobileMenu = false"></div>
        <div class="fixed top-0 right-0 w-64 h-full bg-white shadow-lg">
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-800">菜单</span>
              <button @click="showMobileMenu = false" class="p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav class="p-4 space-y-2">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="showMobileMenu = false"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition"
              :class="$route.path === item.path 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </router-link>
            <button
              @click="handleLogout"
              class="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64 min-h-screen">
        <div class="p-4 lg:p-8">
          <router-view :key="$route.fullPath" />
        </div>
      </main>

      <!-- Mobile Bottom Nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around z-40">
        <router-link
          v-for="item in mobileNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center py-2 px-3 text-xs"
          :class="$route.path.includes(item.path) 
            ? 'text-primary-600' 
            : 'text-gray-500'"
        >
          <component :is="item.icon" class="w-6 h-6 mb-1" />
          {{ item.name }}
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showMobileMenu = ref(false)

// Icon components
const DashboardIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
  ])
}

const StudyIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  ])
}

const WordsIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
  ])
}

const ImportIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' })
  ])
}

const ProfileIcon = {
  render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
  ])
}

const navItems = [
  { name: '学习面板', path: '/student/dashboard', icon: DashboardIcon },
  { name: '开始背诵', path: '/student/study', icon: StudyIcon },
  { name: '单词本', path: '/student/words', icon: WordsIcon },
  { name: '导入单词', path: '/student/import', icon: ImportIcon },
  { name: '个人中心', path: '/student/profile', icon: ProfileIcon }
]

const mobileNavItems = [
  { name: '学习', path: '/student/dashboard', icon: DashboardIcon },
  { name: '背诵', path: '/student/study', icon: StudyIcon },
  { name: '单词', path: '/student/words', icon: WordsIcon },
  { name: '我的', path: '/student/profile', icon: ProfileIcon }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
