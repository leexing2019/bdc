<template>
  <div class="mobile-content-pb lg:pb-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
        <p class="text-gray-500 mt-1">管理学生账号和学习设置</p>
      </div>
      <button
        @click="showAddModal = true"
        class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        添加用户
      </button>
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
    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户名..."
            class="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="filterStatus"
          class="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="all">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">未激活</option>
        </select>
      </div>
    </div>

    <!-- 移动端用户卡片列表 -->
    <div class="lg:hidden space-y-3">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white rounded-xl p-4 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span class="text-primary-700 font-medium">{{ user.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ user.username }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(user.created_at) }}</p>
            </div>
          </div>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
          >
            {{ user.is_active ? '活跃' : '未激活' }}
          </span>
        </div>
        
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-500">学习进度</span>
            <span class="text-sm font-medium text-gray-700">{{ getProgress(user.id) }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full">
            <div
              class="h-full bg-green-500 rounded-full"
              :style="{ width: getProgress(user.id) + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button
            @click="resetPassword(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            重置
          </button>
          <button
            @click="editUser(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            编辑
          </button>
          <button
            @click="toggleUserStatus(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs rounded-lg transition flex items-center justify-center gap-1"
            :class="user.is_active ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'"
          >
            <svg v-if="user.is_active" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ user.is_active ? '禁用' : '激活' }}
          </button>
          <button
            @click="viewUserWords(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            单词
          </button>
          <button
            @click="manageLearningPlans(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            计划
          </button>
          <button
            @click="deleteUser(user)"
            class="flex-1 min-w-[70px] px-2 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">用户名</th>
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
                  @click="resetPassword(user)"
                  class="p-2 text-gray-400 hover:text-yellow-600 transition"
                  title="重置密码"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>
                <button
                  @click="editUser(user)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition"
                  title="编辑用户名"
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
                <button
                  @click="viewUserWords(user)"
                  class="p-2 text-gray-400 hover:text-blue-600 transition"
                  title="查看自定义单词"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </button>
                <button
                  @click="manageLearningPlans(user)"
                  class="p-2 text-gray-400 hover:text-green-600 transition"
                  title="管理学习计划"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </button>
                <button
                  @click="deleteUser(user)"
                  class="p-2 text-gray-400 hover:text-red-600 transition"
                  title="删除用户"
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

    <!-- User Custom Words Modal -->
    <div v-if="showUserWordsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ selectedUser?.username }} 的自定义单词</h3>
          <button @click="showUserWordsModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="loadingUserWords" class="flex-1 flex items-center justify-center">
          <svg class="w-8 h-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <div v-else-if="userCustomWords.length === 0" class="flex-1 flex items-center justify-center text-gray-500">
          该学生还没有上传自定义单词
        </div>
        
        <div v-else class="flex-1 overflow-y-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="text-left py-2 px-3 text-sm font-medium text-gray-500">单词</th>
                <th class="text-left py-2 px-3 text-sm font-medium text-gray-500">词性</th>
                <th class="text-left py-2 px-3 text-sm font-medium text-gray-500">释义</th>
                <th class="text-left py-2 px-3 text-sm font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="word in userCustomWords" :key="word.id" class="hover:bg-gray50">
                <td class="py-2 px-3 font-medium text-gray-800">{{ word.spelling }}</td>
                <td class="py-2 px-3 text-gray-600">{{ word.part_of_speech }}</td>
                <td class="py-2 px-3 text-gray-600">{{ word.meaning }}</td>
                <td class="py-2 px-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="word.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ word.status === 'approved' ? '已通过' : '待审核' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <button
            @click="showUserWordsModal = false"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- Learning Plans Modal -->
    <div v-if="showLearningPlansModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ selectedUser?.username }} 的学习计划</h3>
          <button @click="showLearningPlansModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 可用的分类列表 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">可添加的词库分类</label>
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
        <div class="flex-1 overflow-y-auto">
          <div v-if="loadingPlans" class="flex items-center justify-center py-8">
            <svg class="w-8 h-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="userPlans.length === 0" class="text-center py-8 text-gray-500">
            暂无学习计划，请添加上面的分类
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

        <div class="mt-4 pt-4 border-t">
          <button
            @click="showLearningPlansModal = false"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const users = ref([])
const loading = ref(true)
const studyProgress = ref({})
const searchQuery = ref('')
const filterStatus = ref('all')
const showAddModal = ref(false)
const editingUser = ref(null)
const saving = ref(false)

// 自定义单词相关状态
const showUserWordsModal = ref(false)
const selectedUser = ref(null)
const userCustomWords = ref([])
const loadingUserWords = ref(false)

// 学习计划相关状态
const showLearningPlansModal = ref(false)
const userPlans = ref([])
const loadingPlans = ref(false)

// 可用的分类选项（从数据库动态加载）
const availableCategories = ref([
  { value: 'CET-4', label: 'CET-4' },
  { value: 'CET-6', label: 'CET-6' },
  { value: 'custom', label: '个人词库' },
  { value: 'all', label: '全部词库' }
])

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
    }
  } catch (error) {
    console.error('加载词库分类失败:', error)
  }
}

const getCategoryLabel = (category) => {
  const cat = availableCategories.value.find(c => c.value === category)
  return cat ? cat.label : category
}

const userForm = ref({
  username: '',
  password: ''
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
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (!error) {
      users.value = data || []
    }
  } finally {
    loading.value = false
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
    password: ''
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    password: ''
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      // Update existing user
      const updateData = {
        username: userForm.value.username
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
          daily_limit: 0
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

const resetPassword = async (user) => {
  const newPassword = prompt(`请输入 "${user.username}" 的新密码：`)
  if (!newPassword || newPassword.length < 6) {
    alert('密码长度至少6位')
    return
  }
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', user.id)
    
    if (error) throw error
    alert('密码重置成功！')
  } catch (error) {
    console.error('重置密码失败:', error)
    alert('重置密码失败，请重试')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`确定要删除用户 "${user.username}" 吗？\n\n此操作将同时删除该用户的所有学习记录，且不可恢复！`)) {
    return
  }
  
  try {
    // 先删除用户的学习记录
    await supabaseAdmin
      .from('user_word_progress')
      .delete()
      .eq('user_id', user.id)
    
    // 删除学习日志
    await supabaseAdmin
      .from('study_logs')
      .delete()
      .eq('user_id', user.id)
    
    // 删除自定义单词（从words表中删除该用户创建的custom分类单词）
    await supabaseAdmin
      .from('words')
      .delete()
      .eq('category', 'custom')
      .eq('created_by', user.id)
    
    // 最后删除用户
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user.id)
    
    if (error) throw error
    
    await fetchUsers()
    await fetchStudyProgress()
    alert('用户删除成功！')
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除用户失败，请重试')
  }
}

// 查看用户自定义单词
const viewUserWords = async (user) => {
  selectedUser.value = user
  showUserWordsModal.value = true
  loadingUserWords.value = true
  userCustomWords.value = []
  
  try {
    // 从words表中获取该用户创建的custom分类单词
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('category', 'custom')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    userCustomWords.value = data || []
  } catch (error) {
    console.error('获取用户单词失败:', error)
  } finally {
    loadingUserWords.value = false
  }
}

// 管理学习计划
const manageLearningPlans = async (user) => {
  selectedUser.value = user
  showLearningPlansModal.value = true
  // 同时加载词库分类
  await loadCategories()
  await fetchUserPlans(user.id)
}

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

const addPlanCategory = async (category) => {
  if (!selectedUser.value) return
  
  // 检查是否已存在
  if (userPlans.value.some(p => p.category === category)) return
  
  const newPlan = {
    user_id: selectedUser.value.id,
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
    await fetchUserPlans(selectedUser.value.id)
  } catch (error) {
    console.error('添加学习计划失败:', error)
    alert('添加学习计划失败')
  }
}

const updatePlanDailyLimit = async (plan) => {
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .update({ daily_limit: plan.daily_limit, updated_at: new Date().toISOString() })
      .eq('id', plan.id)
    
    if (error) throw error
  } catch (error) {
    console.error('更新每日限制失败:', error)
    alert('更新失败')
  }
}

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

const removePlan = async (plan) => {
  if (!confirm(`确定要删除 "${getCategoryLabel(plan.category)}" 学习计划吗？`)) return
  
  try {
    const { error } = await supabase
      .from('user_learning_plans')
      .delete()
      .eq('id', plan.id)
    
    if (error) throw error
    userPlans.value = userPlans.value.filter(p => p.id !== plan.id)
  } catch (error) {
    console.error('删除计划失败:', error)
  }
}

const movePlanPriority = async (plan, direction) => {
  const index = userPlans.value.findIndex(p => p.id === plan.id)
  if (index === -1) return
  
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= userPlans.value.length) return
  
  // 交换优先级
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
    
    await fetchUserPlans(selectedUser.value.id)
  } catch (error) {
    console.error('调整优先级失败:', error)
  }
}

onMounted(() => {
  fetchUsers()
  fetchStudyProgress()
})
</script>
