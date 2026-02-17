<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">词库管理</h1>
        <p class="text-gray-500 mt-1">管理系统词汇和批量导入</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="downloadTemplate"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载模板
        </button>
        <button
          @click="batchUpdateExamples"
          :disabled="updatingExamples"
          class="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center disabled:opacity-50"
        >
          <svg v-if="updatingExamples" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          批量更新例句
        </button>
        <button
          @click="showImportModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          批量导入
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">总词汇量</p>
        <p class="text-2xl font-bold text-gray-800">{{ words.length }}</p>
      </div>
      <div 
        v-for="(cat, index) in categories" 
        :key="cat" 
        class="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary-500 transition relative group"
        :class="filterCategory === cat ? 'ring-2 ring-primary-500' : ''"
        @click="filterCategory = filterCategory === cat ? 'all' : cat"
      >
        <button
          @click.stop="deleteCategory(cat)"
          class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
          title="删除词库"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <p class="text-sm text-gray-500">{{ cat }}</p>
        <p class="text-2xl font-bold" :class="index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'">{{ getCategoryCount(cat) }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-center">
        <button
          @click="showCategoryModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建词库
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索单词..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="filterCategory"
          class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="all">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button
          @click="showAddWordModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          添加单词
        </button>
        <button
          v-if="selectedWords.length > 0"
          @click="batchDeleteWords"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          删除选中 ({{ selectedWords.length }})
        </button>
      </div>
    </div>

    <!-- Words Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">单词</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">词性</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">释义</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">分类</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="word in filteredWords" :key="word.id" class="hover:bg-gray-50">
              <td class="py-3 px-4">
                <input
                  type="checkbox"
                  :value="word.id"
                  v-model="selectedWords"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-gray-800">{{ word.spelling }}</span>
                <span v-if="word.phonetic" class="ml-2 text-gray-400 text-sm">{{ word.phonetic }}</span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ word.part_of_speech }}</td>
              <td class="py-3 px-4 text-gray-600 max-w-xs truncate">{{ word.meaning }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full" :class="getCategoryClass(word.category)">
                  {{ word.category }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  @click="editWord(word)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteWord(word)"
                  class="p-2 text-gray-400 hover:text-red-600 transition"
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

    <!-- Add/Edit Word Modal -->
    <div v-if="showAddWordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ editingWord ? '编辑单词' : '添加单词' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">英文单词</label>
            <div class="flex space-x-2">
              <input
                v-model="wordForm.spelling"
                type="text"
                class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请输入英文单词"
              />
              <button
                @click="fetchWordInfo"
                :disabled="fetchingWord || !wordForm.spelling.trim()"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                title="自动获取释义和例句"
              >
                <svg v-if="fetchingWord" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">词性</label>
            <input
              v-model="wordForm.part_of_speech"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="如：n., v., adj."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中文释义</label>
            <input
              v-model="wordForm.meaning"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入中文释义"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">音标</label>
            <input
              v-model="wordForm.phonetic"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="如：/əˈbændən/"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              v-model="wordForm.category"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="CET-4">CET-4</option>
              <option value="CET-6">CET-6</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">例句（可选）</label>
            <textarea
              v-model="wordForm.example_sentence"
              rows="2"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入例句"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="closeWordModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="saveWord"
            :disabled="saving"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">批量导入单词</h3>
        
        <!-- 词库选择 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择词库</label>
          <select
            v-model="importCategory"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.txt"
            class="hidden"
            @change="handleFileSelect"
          />
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600">点击上传文件</p>
          <p class="text-sm text-gray-400 mt-1">支持 .xlsx, .xls, .txt 格式</p>
        </div>

        <div v-if="importWords.length" class="mt-4">
          <p class="text-sm text-gray-500 mb-2">已解析 {{ importWords.length }} 个单词</p>
          <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left py-2 px-3">单词</th>
                  <th class="text-left py-2 px-3">词性</th>
                  <th class="text-left py-2 px-3">释义</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(word, index) in importWords" :key="index" class="border-t">
                  <td class="py-1 px-3">{{ word.spelling }}</td>
                  <td class="py-1 px-3">{{ word.part_of_speech }}</td>
                  <td class="py-1 px-3">{{ word.meaning }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="showImportModal = false; importWords = []"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="importWordsToDb"
            :disabled="importing || !importWords.length"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ importing ? '导入中...' : '确认导入' }}
          </button>
        </div>
      </div>
    </div>

    <!-- New Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">新建词库</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">词库名称</label>
            <input
              v-model="newCategory"
              type="text"
              placeholder="例如：考研词汇、雅思词汇"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">批量上传单词</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition cursor-pointer"
              @click="triggerImportFileInput"
            >
              <input
                ref="importFileInput"
                type="file"
                accept=".xlsx,.xls,.txt"
                class="hidden"
                @change="handleImportFileSelect"
              />
              <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm text-gray-600">点击上传文件</p>
              <p class="text-xs text-gray-400 mt-1">支持 .xlsx, .xls, .txt 格式</p>
            </div>
          </div>

          <div v-if="importWords.length" class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <p class="text-sm text-gray-500 mb-2">已解析 {{ importWords.length }} 个单词</p>
            <div class="text-xs text-gray-400">
              {{ importWords.slice(0, 5).map(w => w.spelling).join(', ') }}{{ importWords.length > 5 ? '...' : '' }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="showCategoryModal = false; newCategory = ''; importWords = []"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="createCategory"
            :disabled="!newCategory.trim() || importing"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ importing ? '创建中...' : '创建词库' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { fetchWordData, fetchWordDataBatch } from '@/utils/dictionaryService'

const words = ref([])
const searchQuery = ref('')
const filterCategory = ref('all')
const showAddWordModal = ref(false)
const showImportModal = ref(false)
const showCategoryModal = ref(false)
const editingWord = ref(null)
const saving = ref(false)
const fetchingWord = ref(false)
const updatingExamples = ref(false)
const importing = ref(false)
const importWords = ref([])
const importCategory = ref('CET-4')
const fileInput = ref(null)
const importFileInput = ref(null)

// 选中单词
const selectedWords = ref([])

// 全选状态
const isAllSelected = computed(() => {
  return filteredWords.value.length > 0 && selectedWords.value.length === filteredWords.value.length
})

// 新词库表单
const newCategory = ref('')

// 动态词库列表（默认包含基础词库）
const categories = ref(['CET-4', 'CET-6', 'custom'])

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
      const uniqueCategories = [...new Set(data.map(w => w.category).filter(c => c && c.trim()))]
      // 合并默认分类和数据库中的分类
      const defaultCategories = ['CET-4', 'CET-6', 'custom']
      categories.value = [...new Set([...defaultCategories, ...uniqueCategories])]
    }
  } catch (error) {
    console.error('加载词库分类失败:', error)
  }
}

const wordForm = ref({
  spelling: '',
  part_of_speech: '',
  meaning: '',
  phonetic: '',
  category: 'CET-4',
  example_sentence: ''
})

const filteredWords = computed(() => {
  return words.value.filter(word => {
    const matchSearch = word.spelling.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = filterCategory.value === 'all' || word.category === filterCategory.value
    return matchSearch && matchCategory
  })
})

const getCategoryCount = (category) => {
  return words.value.filter(w => w.category === category).length
}

const getCategoryClass = (category) => {
  const classes = {
    'CET-4': 'text-blue-600',
    'CET-6': 'text-green-600',
    'custom': 'text-purple-600'
  }
  return classes[category] || 'text-gray-600'
}

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取单词列表失败:', error)
    return
  }
  
  if (data) {
    words.value = data || []
  }
  // 加载完单词后也加载词库分类
  await loadCategories()
}

const editWord = (word) => {
  editingWord.value = word
  wordForm.value = {
    spelling: word.spelling,
    part_of_speech: word.part_of_speech,
    meaning: word.meaning,
    phonetic: word.phonetic || '',
    category: word.category,
    example_sentence: word.example_sentence || ''
  }
  showAddWordModal.value = true
}

const closeWordModal = () => {
  showAddWordModal.value = false
  editingWord.value = null
  wordForm.value = {
    spelling: '',
    part_of_speech: '',
    meaning: '',
    phonetic: '',
    category: 'CET-4',
    example_sentence: ''
  }
}

const fetchWordInfo = async () => {
  if (!wordForm.value.spelling.trim()) return
  
  fetchingWord.value = true
  try {
    const data = await fetchWordData(wordForm.value.spelling)
    
    if (data.definition) {
      // 自动填充释义（如果为空）
      if (!wordForm.value.meaning) {
        wordForm.value.meaning = data.definition
      }
    }
    
    if (data.phonetic && !wordForm.value.phonetic) {
      wordForm.value.phonetic = data.phonetic
    }
    
    if (data.example && !wordForm.value.example_sentence) {
      wordForm.value.example_sentence = data.example
    }
  } catch (error) {
    console.error('获取单词信息失败:', error)
  } finally {
    fetchingWord.value = false
  }
}

const saveWord = async () => {
  saving.value = true
  try {
    // 管理员添加的单词
    const wordData = { ...wordForm.value }
    
    if (editingWord.value) {
      const { error } = await supabase
        .from('words')
        .update(wordData)
        .eq('id', editingWord.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('words')
        .insert(wordData)
      if (error) throw error
    }
    
    await fetchWords()
    closeWordModal()
  } catch (error) {
    console.error('Save word error:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const deleteWord = async (word) => {
  if (confirm(`确定删除单词 "${word.spelling}" 吗？`)) {
    await supabase
      .from('words')
      .delete()
      .eq('id', word.id)
    
    await fetchWords()
  }
}

// 切换全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedWords.value = []
  } else {
    selectedWords.value = filteredWords.value.map(w => w.id)
  }
}

// 批量删除选中的单词
const batchDeleteWords = async () => {
  if (selectedWords.value.length === 0) return
  
  if (confirm(`确定删除选中的 ${selectedWords.value.length} 个单词吗？`)) {
    try {
      for (const wordId of selectedWords.value) {
        await supabase
          .from('words')
          .delete()
          .eq('id', wordId)
      }
      selectedWords.value = []
      await fetchWords()
      alert('删除成功！')
    } catch (error) {
      console.error('批量删除失败:', error)
      alert('删除失败，请重试')
    }
  }
}

// 删除整个词库
const deleteCategory = async (category) => {
  if (!confirm(`确定删除整个词库 "${category}" 吗？这将删除该词库下的所有单词！`)) {
    return
  }
  
  try {
    // 删除该分类下的所有单词
    await supabase
      .from('words')
      .delete()
      .eq('category', category)
    
    await fetchWords()
    alert('词库删除成功！')
  } catch (error) {
    console.error('删除词库失败:', error)
    alert('删除失败，请重试')
  }
}

const downloadTemplate = () => {
  const template = [
    ['英文', '词性', '中文', '音标', '例句'],
    ['example', 'n.', '例子', '/ɪɡˈzæmpəl/', 'This is an example sentence.']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '单词模板')
  XLSX.writeFile(wb, '单词导入模板.xlsx')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const extension = file.name.split('.').pop().toLowerCase()
  
  try {
    // TXT文件处理
    if (extension === 'txt') {
      const text = await file.text()
      const parsed = parseTxtFile(text)
      importWords.value = parsed
    } else {
      // Excel文件处理
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const parsed = []
      const startIndex = json[0] && json[0][0] === '英文' ? 1 : 0

      for (let i = startIndex; i < json.length; i++) {
        const row = json[i]
        if (row && row[0]) {
          parsed.push({
            spelling: String(row[0]).trim(),
            part_of_speech: row[1] ? String(row[1]).trim() : '',
            meaning: row[2] ? String(row[2]).trim() : '',
            phonetic: row[3] ? String(row[3]).trim() : '',
            example_sentence: row[4] ? String(row[4]).trim() : '',
            category: 'CET-4',
          })
        }
      }

      importWords.value = parsed
    }
  } catch (error) {
    console.error('File parse error:', error)
    alert('文件解析失败')
  }
}

// 解析TXT文件
const parseTxtFile = (text) => {
  const lines = text.split('\n').filter(line => line.trim())
  const words = []
  
  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length >= 3) {
      words.push({
        spelling: parts[0].trim(),
        part_of_speech: parts[1].trim(),
        meaning: parts.slice(2).join('|').trim(),
        phonetic: '',
        example_sentence: '',
        category: 'CET-4'
      })
    } else if (parts.length === 2) {
      words.push({
        spelling: parts[0].trim(),
        part_of_speech: '',
        meaning: parts[1].trim(),
        phonetic: '',
        example_sentence: '',
        category: 'CET-4'
      })
    }
  }
  
  return words
}

const importWordsToDb = async () => {
  importing.value = true
  try {
    // 显示进度
    const total = importWords.value.length
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < total; i++) {
      const word = importWords.value[i]
      
      // 如果没有例句，自动获取
      let exampleSentence = word.example_sentence
      let phonetic = word.phonetic
      
      if (!exampleSentence || !phonetic) {
        const data = await fetchWordData(word.spelling)
        if (!exampleSentence && data.example) {
          exampleSentence = data.example
        }
        if (!phonetic && data.phonetic) {
          phonetic = data.phonetic
        }
      }
      
      const { error } = await supabase
        .from('words')
        .insert({ 
          spelling: word.spelling,
          part_of_speech: word.part_of_speech || '',
          meaning: word.meaning,
          phonetic: phonetic || '',
          example_sentence: exampleSentence || '',
          category: importCategory.value 
        })
      
      if (error) {
        failCount++
      } else {
        successCount++
      }
    }
    
    await fetchWords()
    showImportModal.value = false
    importWords.value = []
    alert(`导入完成！成功: ${successCount} 个，失败: ${failCount} 个`)
  } catch (error) {
    console.error('Import error:', error)
    alert('导入失败，请重试')
  } finally {
    importing.value = false
  }
}

// 新建词库
const createCategory = async () => {
  console.log('createCategory 函数被调用')
  const categoryName = newCategory.value.trim()
  if (!categoryName) {
    alert('请输入词库名称')
    return
  }
  
  // 检查是否已存在
  if (categories.value.includes(categoryName)) {
    alert('该词库已存在')
    return
  }
  
  importing.value = true
  try {
    // 如果有导入的单词，导入到新词库
    if (importWords.value.length > 0) {
      for (const word of importWords.value) {
        const { error } = await supabase
          .from('words')
          .insert({
            spelling: word.spelling,
            part_of_speech: word.part_of_speech || '',
            meaning: word.meaning,
            phonetic: word.phonetic || '',
            example_sentence: word.example_sentence || '',
            category: categoryName,
          })
        
        if (error) {
          console.error('插入单词失败:', error)
          throw error
        }
      }
    } else {
      // 如果没有导入单词，创建一个占位单词以确保词库分类被保存
      const insertData = {
        spelling: categoryName + '_dict',
        part_of_speech: '',
        meaning: categoryName + ' Dictionary',
        category: categoryName
      }
      
      console.log('准备插入数据:', insertData)
      
      const { error } = await supabase
        .from('words')
        .insert(insertData)
      
      console.log('插入结果:', error)
      if (error) {
        console.error('创建词库失败:', error)
        alert('创建失败: ' + error.message)
        return
      }
    }
    
    // 刷新单词列表和分类
    await fetchWords()
    
    // 刷新分类下拉选项
    filterCategory.value = categoryName
    
    showCategoryModal.value = false
    newCategory.value = ''
    importWords.value = []
    alert('词库创建成功！')
  } catch (error) {
    console.error('Create category error:', error)
    alert('创建失败: ' + (error.message || JSON.stringify(error)))
  } finally {
    importing.value = false
  }
}

// 触发新建词库的文件选择
const triggerImportFileInput = () => {
  importFileInput.value?.click()
}

// 处理新建词库时的文件选择
const handleImportFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const extension = file.name.split('.').pop().toLowerCase()
  
  try {
    // TXT文件处理
    if (extension === 'txt') {
      const text = await file.text()
      const parsed = parseTxtFile(text)
      importWords.value = parsed
    } else {
      // Excel文件处理
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const parsed = []
      const startIndex = json[0] && json[0][0] === '英文' ? 1 : 0

      for (let i = startIndex; i < json.length; i++) {
        const row = json[i]
        if (row && row[0]) {
          parsed.push({
            spelling: String(row[0]).trim(),
            part_of_speech: row[1] ? String(row[1]).trim() : '',
            meaning: row[2] ? String(row[2]).trim() : '',
            phonetic: row[3] ? String(row[3]).trim() : '',
            example_sentence: row[4] ? String(row[4]).trim() : ''
          })
        }
      }

      importWords.value = parsed
    }
  } catch (error) {
    console.error('File parse error:', error)
    alert('文件解析失败')
  }
}

// 批量更新缺失例句的单词
const batchUpdateExamples = async () => {
  // 找出没有例句的单词
  const wordsWithoutExamples = words.value.filter(w => !w.example_sentence || !w.phonetic)
  
  if (wordsWithoutExamples.length === 0) {
    alert('所有单词都已包含例句和音标！')
    return
  }
  
  if (!confirm(`将为 ${wordsWithoutExamples.length} 个缺少例句的单词自动获取例句和音标，是否继续？`)) {
    return
  }
  
  updatingExamples.value = true
  let successCount = 0
  let failCount = 0
  
  try {
    for (let i = 0; i < wordsWithoutExamples.length; i++) {
      const word = wordsWithoutExamples[i]
      
      // 获取API数据
      const data = await fetchWordData(word.spelling)
      
      const updateData = {}
      if (!word.example_sentence && data.example) {
        updateData.example_sentence = data.example
      }
      if (!word.phonetic && data.phonetic) {
        updateData.phonetic = data.phonetic
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('words')
          .update(updateData)
          .eq('id', word.id)
        
        if (error) {
          failCount++
        } else {
          successCount++
        }
      }
      
      // 添加延迟避免API限流
      if (i < wordsWithoutExamples.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
    
    await fetchWords()
    alert(`更新完成！成功: ${successCount} 个，失败: ${failCount} 个`)
  } catch (error) {
    console.error('批量更新失败:', error)
    alert('批量更新失败，请重试')
  } finally {
    updatingExamples.value = false
  }
}

onMounted(async () => {
  await fetchWords()
  // 确保加载词库分类
  await loadCategories()
})
</script>
