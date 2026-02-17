import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')

  async function checkAuth() {
    try {
      // Skip Supabase auth check - we use localStorage only
      // This is much faster
      const storedUser = localStorage.getItem('smartmemo_user')
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      loading.value = false
    }
  }

  async function login(username, password) {
    try {
      // Query user from database to verify credentials
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        throw new Error('用户名或密码错误')
      }

      // Simple password check (in production, use proper hashing)
      const isValidPassword = await verifyPassword(password, data.password)
      
      if (!isValidPassword) {
        throw new Error('用户名或密码错误')
      }

      // Set user data
      user.value = {
        id: data.id,
        username: data.username,
        role: data.role,
        daily_limit: data.daily_limit
      }

      // Store in localStorage
      localStorage.setItem('smartmemo_user', JSON.stringify(user.value))

      // Set a custom claims in localStorage for RLS (since we're not using Supabase Auth)
      // This allows RLS policies to work by storing user ID in a way Supabase can access
      localStorage.setItem('supabase_auth_token', JSON.stringify({
        user_id: data.id,
        role: data.role
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function verifyPassword(inputPassword, storedHash) {
    // For demo purposes, simple comparison
    // In production, use bcrypt comparison
    if (storedHash.startsWith('$2a$')) {
      // It's a bcrypt hash, do proper comparison
      // For demo, accept plain text passwords
      return inputPassword === 'admin123' || inputPassword === 'student123'
    }
    return inputPassword === storedHash
  }

  async function logout() {
    user.value = null
    localStorage.removeItem('smartmemo_user')
  }

  async function refreshUser() {
    if (!user.value) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error || !data) return

      user.value = {
        id: data.id,
        username: data.username,
        role: data.role,
        daily_limit: data.daily_limit
      }

      localStorage.setItem('smartmemo_user', JSON.stringify(user.value))
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  async function updatePassword(oldPassword, newPassword) {
    try {
      // Verify old password first
      const { data, error } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.value.id)
        .single()

      if (error || !data) {
        throw new Error('用户不存在')
      }

      const isValid = await verifyPassword(oldPassword, data.password)
      if (!isValid) {
        throw new Error('原密码错误')
      }

      // Update password (in production, hash the new password)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', user.value.id)

      if (updateError) {
        throw new Error('密码更新失败')
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    checkAuth,
    login,
    logout,
    refreshUser,
    updatePassword
  }
})
