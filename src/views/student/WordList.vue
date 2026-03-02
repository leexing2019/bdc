<template>
  <div class="wordlist-page space-y-3 mobile-content-pb lg:pb-0 px-3 sm:px-4">
    <!-- Header -->
    <div class="flex items-center justify-between pt-1">
      <h1 class="text-xl font-bold text-gray-800">单词本</h1>
      <div class="text-xs text-gray-500 flex-shrink-0 ml-2">
        共 {{ wordStore.words.length }} 个
      </div>
    </div>


    <!-- Filter Tabs - 使用 flex-wrap 换行显示所有标签 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="word-tag px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition shadow-sm"
        :class="activeTab === tab.value 
          ? 'bg-primary-600 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        {{ tab.label }}
        <span class="ml-0.5 text-xs opacity-75">({{ getTabCount(tab.value) }})</span>
      </button>
    </div>


    <!-- Search & Batch Actions -->
    <div class="space-y-2">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索单词..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-base"
        />
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <!-- 批量删除按钮（仅在自行导入标签下显示） -->
      <button
        v-if="activeTab === 'custom' && selectedWords.length > 0"
        @click="batchDeleteWords"
        class="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center text-sm"
      >
        <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="truncate">删除选中 ({{ selectedWords.length }})</span>
      </button>
    </div>


    <!-- Word List -->
    <!-- 加载动画 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-primary-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-500">加载中...</p>
      </div>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="word in paginatedWords"
        :key="word.id"
        class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
        :class="{'ring-2 ring-primary-500': selectedWords.includes(word.id)}"
        @click="selectedWord = word"
      >
        <!-- 第一行：复选框 + 单词 + 词性 -->
        <div class="flex items-center gap-2">
          <div class="flex-shrink-0" v-if="word.source === 'custom'">
            <input
              type="checkbox"
              :value="word.id"
              v-model="selectedWords"
              @click.stop
              class="word-checkbox w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <h3 class="text-base font-semibold text-gray-800">{{ word.spelling }}</h3>
          <span class="word-tag px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ word.part_of_speech }}</span>
        </div>
        <!-- 第二行：中文释义 -->
        <p class="text-gray-600 mt-1 text-sm leading-relaxed break-words">{{ word.meaning }}</p>
        <!-- 第三行：音标 + 掌握程度 + 来源等标签 -->
        <div class="flex items-center mt-1.5 gap-1.5 flex-wrap text-xs text-gray-400">
          <span v-if="word.phonetic">{{ word.phonetic }}</span>
          <span class="word-tag px-1.5 py-0.5 rounded" :class="getProficiencyClass(word)">
            {{ getProficiencyLabel(word) }}
          </span>
          <span v-if="word.example_sentence" class="word-tag text-blue-500 flex items-center">
            <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            例句
          </span>
          <span 
            v-if="word.source" 
            class="word-tag px-1.5 py-0.5 rounded"
            :class="word.source === 'institution' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
          >
            {{ word.source === 'institution' ? '机构' : '自主' }}
          </span>
        </div>
        <!-- 第四行：操作按钮 -->
        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
          <button
            @click.stop="playWord(word)"
            class="word-action-btn flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            发音
          </button>
          <button
            v-if="word.source === 'custom'"
            @click.stop="openEditModal(word)"
            class="word-action-btn flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          <button
            v-if="word.source === 'custom'"
            @click.stop="deleteWord(word)"
            class="word-action-btn flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除
          </button>
        </div>
      </div>


      <!-- Empty State -->
      <div v-if="paginatedWords.length === 0" class="text-center py-16">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p class="text-sm text-gray-500">暂无单词</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 pb-2">
      <p class="text-xs text-gray-500 text-center sm:text-left whitespace-nowrap">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        （{{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredWords.length) }} / {{ filteredWords.length }}）
      </p>
      <div class="flex items-center gap-0.5">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="px-2 py-1.5 text-xs font-medium rounded border transition disabled:opacity-30 disabled:cursor-not-allowed"
          :class="currentPage === 1
            ? 'bg-gray-50 text-gray-400 border-gray-200'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-2 py-1.5 text-xs font-medium rounded border transition disabled:opacity-30 disabled:cursor-not-allowed"
          :class="currentPage === 1
            ? 'bg-gray-50 text-gray-400 border-gray-200'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <template v-for="(page, idx) in pageNumbers" :key="idx">
          <button
            v-if="typeof page === 'number'"
            @click="currentPage = page"
            class="w-7 h-7 text-xs font-medium rounded border transition"
            :class="currentPage === page
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
          <span v-else class="px-1 text-gray-400 text-xs">{{ page }}</span>
        </template>

        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-2 py-1.5 text-xs font-medium rounded border transition disabled:opacity-30 disabled:cursor-not-allowed"
          :class="currentPage === totalPages
            ? 'bg-gray-50 text-gray-400 border-gray-200'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="px-2 py-1.5 text-xs font-medium rounded border transition disabled:opacity-30 disabled:cursor-not-allowed"
          :class="currentPage === totalPages
            ? 'bg-gray-50 text-gray-400 border-gray-200'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>


    <!-- Word Detail Modal -->
    <div v-if="selectedWord" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" @click="selectedWord = null">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-4 sm:p-6 max-h-[85vh] overflow-y-auto" @click.stop>
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 pr-2">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{{ selectedWord.spelling }}</h2>
            <p class="text-sm text-gray-500">{{ selectedWord.phonetic }}</p>
          </div>
          <button @click="selectedWord = null" class="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-3">
          <div>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{{ selectedWord.part_of_speech }}</span>
          </div>
          <div>
            <h3 class="text-xs font-medium text-gray-500 mb-1">释义</h3>
            <p class="text-sm text-gray-800">{{ selectedWord.meaning }}</p>
          </div>
          <div v-if="selectedWord.example_sentence">
            <h3 class="text-xs font-medium text-gray-500 mb-1">例句</h3>
            <p class="text-xs text-gray-600 italic">{{ selectedWord.example_sentence }}</p>
          </div>
          <div>
            <h3 class="text-xs font-medium text-gray-500 mb-1">掌握程度</h3>
            <span class="px-2.5 py-1 rounded-full text-xs" :class="getProficiencyClass(selectedWord)">
              {{ getProficiencyLabel(selectedWord) }}
            </span>
          </div>
          <!-- 来源 -->
          <div v-if="selectedWord.source">
            <h3 class="text-xs font-medium text-gray-500 mb-1">来源</h3>
            <span 
              class="px-2.5 py-1 rounded-full text-xs"
              :class="selectedWord.source === 'institution' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
            >
              {{ selectedWord.source === 'institution' ? '机构添加' : '自主添加' }}
            </span>
          </div>
        </div>


        <div class="mt-4 flex space-x-2">
          <button
            @click="playWord(selectedWord)"
            class="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            播放发音
          </button>
          <router-link
            to="/student/study"
            class="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
          >
            开始背诵
          </router-link>
        </div>
      </div>
    </div>


    <!-- Edit Word Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" @click="showEditModal = false">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-4 sm:p-6 max-h-[85vh] overflow-y-auto" @click.stop>
        <div class="flex items-start justify-between mb-3">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">编辑单词</h2>
          <button @click="showEditModal = false" class="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">英文</label>
            <input
              v-model="editingWord.spelling"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-base"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">词性</label>
            <select
              v-model="editingWord.part_of_speech"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white text-base"
            >
              <option value="">请选择</option>
              <option value="n.">名词 (n.)</option>
              <option value="v.">动词 (v.)</option>
              <option value="vt.">及物动词 (vt.)</option>
              <option value="vi.">不及物动词 (vi.)</option>
              <option value="adj.">形容词 (adj.)</option>
              <option value="adv.">副词 (adv.)</option>
              <option value="pron.">代词 (pron.)</option>
              <option value="num.">数词 (num.)</option>
              <option value="conj.">连词 (conj.)</option>
              <option value="prep.">介词 (prep.)</option>
              <option value="int.">感叹词 (int.)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中文释义</label>
            <input
              v-model="editingWord.meaning"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-base"
            />
          </div>
        </div>


        <div class="mt-4 flex space-x-2">
          <button
            @click="showEditModal = false"
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            取消
          </button>
          <button
            @click="saveEditWord"
            class="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWordStore } from '@/stores/words'
import { supabase } from '@/lib/supabase'


const wordStore = useWordStore()


const activeTab = ref('all')
const searchQuery = ref('')
const selectedWord = ref(null)
const showEditModal = ref(false)
const editingWord = ref({})
const selectedWords = ref([]) // 批量选择
const loading = ref(true) // 加载状态

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10) // 每页显示 10 条

// 页面加载时获取单词数据
onMounted(async () => {
  loading.value = true
  // 每次都重新获取数据，确保显示加载动画
  await wordStore.fetchWords()
  // 添加短暂延迟确保加载动画可见（至少300ms）
  await new Promise(resolve => setTimeout(resolve, 300))
  loading.value = false
})


// 切换标签时清除选择
watch(() => activeTab.value, () => {
  selectedWords.value = []
  currentPage.value = 1 // 重置页码
})

// 搜索时重置页码
watch(() => searchQuery.value, () => {
  currentPage.value = 1
})


const tabs = [
  { label: '全部', value: 'all' },
  { label: '教师布置', value: 'institution' },
  { label: '自行导入', value: 'custom' },
  { label: '新词', value: 'new' },
  { label: '学习中', value: 'learning' },
  { label: '熟悉', value: 'familiar' },
  { label: '掌握', value: 'mastered' }
]


const getTabCount = (tab) => {
  if (tab === 'all') return wordStore.words.length
  if (tab === 'institution') return wordStore.words.filter(w => w.source === 'institution').length
  if (tab === 'custom') return wordStore.words.filter(w => w.source === 'custom').length
  return wordStore.proficiencyStats[tab] || 0
}


const filteredWords = computed(() => {
  let words = [...wordStore.words]
  
  // Filter by source tab (教师布置/自行导入)
  if (activeTab.value === 'institution') {
    words = words.filter(word => word.source === 'institution')
  } else if (activeTab.value === 'custom') {
    words = words.filter(word => word.source === 'custom')
  } else if (activeTab.value !== 'all') {
    // Filter by proficiency tab
    words = words.filter(word => {
      const progress = wordStore.userProgress.find(p => p.word_id === word.id)
      if (activeTab.value === 'new') return !progress || progress.repetitions === 0
      if (activeTab.value === 'learning') return progress && progress.proficiency < 3
      if (activeTab.value === 'familiar') return progress && progress.proficiency >= 3 && progress.proficiency < 5
      if (activeTab.value === 'mastered') return progress && progress.proficiency >= 5
      return true
    })
  }
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    words = words.filter(word =>
      word.spelling.toLowerCase().includes(query) ||
      word.meaning.toLowerCase().includes(query)
    )
  }

  return words
})

// 总页数
const totalPages = computed(() => {
  const total = filteredWords.value.length
  return Math.ceil(total / pageSize.value) || 1
})

// 当前页的单词数据
const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredWords.value.slice(start, end)
})

// 页码显示列表（用于分页控件）
const pageNumbers = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  // 总是显示第一页
  if (current > 3) {
    pages.push(1)
    if (current > 4) {
      pages.push('...')
    }
  }

  // 显示当前页附近
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    pages.push(i)
  }

  // 总是显示最后一页
  if (current < total - 2) {
    if (current < total - 3) {
      pages.push('...')
    }
    pages.push(total)
  }

  // 如果只有一页，也显示
  if (total <= 5 && pages.length === 0) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  }

  return pages
})


const getProficiencyClass = (word) => {
  const progress = wordStore.userProgress.find(p => p.word_id === word.id)
  if (!progress || progress.repetitions === 0) return 'bg-gray-100 text-gray-600'
  if (progress.proficiency < 3) return 'bg-orange-100 text-orange-700'
  if (progress.proficiency < 5) return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
}


const getProficiencyLabel = (word) => {
  const progress = wordStore.userProgress.find(p => p.word_id === word.id)
  if (!progress || progress.repetitions === 0) return '新词'
  if (progress.proficiency < 3) return '学习中'
  if (progress.proficiency < 5) return '熟悉'
  return '已掌握'
}


const playWord = async (word) => {
  // 支持传入单词对象，优先使用数据库中存储的音频URL
  const wordText = word.spelling
  const audioUrl = word.audio_url
  
  // 优先使用数据库中存储的音频URL
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play().catch(e => {
      console.error('Audio play failed:', e)
      // 播放失败则使用浏览器TTS
      speakWithBrowser(wordText)
    })
    return
  }
  
  // 没有数据库音频，使用浏览器TTS
  speakWithBrowser(wordText)
}


const speakWithBrowser = (word) => {
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  speechSynthesis.speak(utterance)
}


const openEditModal = (word) => {
  editingWord.value = { ...word }
  showEditModal.value = true
}


const saveEditWord = async () => {
  try {
    const { error } = await supabase
      .from('words')
      .update({
        spelling: editingWord.value.spelling,
        part_of_speech: editingWord.value.part_of_speech,
        meaning: editingWord.value.meaning
      })
      .eq('id', editingWord.value.id)
    
    if (error) throw error
    
    // Refresh words list
    await wordStore.fetchWords()
    showEditModal.value = false
    alert('单词更新成功！')
  } catch (error) {
    console.error('更新单词失败:', error)
    alert('更新失败，请重试')
  }
}


const deleteWord = async (word) => {
  if (!confirm(`确定要删除单词 "${word.spelling}" 吗？`)) {
    return
  }
  
  try {
    // Delete word
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', word.id)
    
    if (error) throw error
    
    // Delete user's progress for this word
    await supabase
      .from('user_word_progress')
      .delete()
      .eq('word_id', word.id)
    
    // Refresh words list
    await wordStore.fetchWords()
    alert('单词删除成功！')
  } catch (error) {
    console.error('删除单词失败:', error)
    alert('删除失败，请重试')
  }
}


// 批量删除单词
const batchDeleteWords = async () => {
  if (selectedWords.value.length === 0) return
  
  if (!confirm(`确定要删除选中的 ${selectedWords.value.length} 个单词吗？此操作不可恢复。`)) {
    return
  }
  
  try {
    // 批量删除单词
    const { error } = await supabase
      .from('words')
      .delete()
      .in('id', selectedWords.value)
    
    if (error) throw error
    
    // 批量删除用户进度
    await supabase
      .from('user_word_progress')
      .delete()
      .in('word_id', selectedWords.value)
    
    // 清空选择
    selectedWords.value = []
    
    // 刷新单词列表
    await wordStore.fetchWords()
    alert('批量删除成功！')
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('删除失败，请重试')
  }
}
</script>
