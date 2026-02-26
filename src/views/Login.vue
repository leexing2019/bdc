<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-3 sm:px-4 py-8">
    <div class="max-w-md w-full">
      <!-- Logo & Title -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg mb-3 sm:mb-4">
          <svg class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">智忆单词</h1>
        <p class="text-primary-100 mt-1 sm:mt-2 text-sm sm:text-base">SmartMemo - 科学背单词</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">登录账号</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-base"
              placeholder="请输入用户名"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-base"
              placeholder="请输入密码"
            />
          </div>

          <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            <span v-if="loading">登录中...</span>
            <span v-else>登 录</span>
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-xs sm:text-sm text-gray-500 text-center mb-2 sm:mb-3">演示账号</p>
          <div class="grid grid-cols-1 gap-2 sm:gap-3">
            <button
              @click="fillDemo('student', 'student123')"
              class="px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition"
            >
              学生账号
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-primary-200 text-sm mt-8">
        © 2026 智忆单词 SmartMemo
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const fillDemo = (user, pwd) => {
  username.value = user
  password.value = pwd
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.login(username.value, password.value)
  
  loading.value = false

  if (result.success) {
    // Redirect to appropriate dashboard
    const redirect = route.query.redirect
    if (authStore.user.role === 'admin') {
      router.push(redirect || '/admin/users')
    } else {
      router.push(redirect || '/student/dashboard')
    }
  } else {
    error.value = result.error
  }
}
</script>
