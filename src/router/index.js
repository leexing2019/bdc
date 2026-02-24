import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/student',
    component: () => import('@/views/student/Layout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: '',
        redirect: '/student/dashboard'
      },
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('@/views/student/Dashboard.vue')
      },
      {
        path: 'study',
        name: 'Study',
        component: () => import('@/views/student/Study.vue')
      },
      {
        path: 'words',
        name: 'WordList',
        component: () => import('@/views/student/WordList.vue')
      },
      {
        path: 'import',
        name: 'ImportWords',
        component: () => import('@/views/student/ImportWords.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/student/Profile.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/users'
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue')
      },
      {
        path: 'words',
        name: 'AdminWords',
        component: () => import('@/views/admin/Words.vue')
      },
      {
        path: 'plans',
        name: 'AdminPlans',
        component: () => import('@/views/admin/Plans.vue')
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('@/views/admin/Stats.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue')
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Try to restore session
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }
    
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    
    // Check role
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      // Redirect to appropriate dashboard
      if (authStore.user?.role === 'admin') {
        return next({ name: 'AdminUsers' })
      } else {
        return next({ name: 'StudentDashboard' })
      }
    }
  }
  
  // Redirect authenticated users away from login
  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.user?.role === 'admin') {
      return next({ name: 'AdminUsers' })
    } else {
      return next({ name: 'StudentDashboard' })
    }
  }
  
  next()
})

export default router
