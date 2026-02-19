<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">导入单词</h1>
        <p class="text-gray-500 mt-1">上传文件或手动添加单词到你的个人词库</p>
      </div>
      <!-- DeepSeek API Key 设置 -->
      <div class="flex items-center space-x-2">
        <input
          v-model="deepseekApiKey"
          type="password"
          placeholder="DeepSeek API Key（可选，用于生成例句）"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <button
          @click="saveDeepseekApiKey"
          :disabled="testingApi"
          class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
          :title="testingApi ? '测试中...' : '测试并保存API Key'"
        >
          <svg v-if="testingApi" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">我的词库</p>
        <p class="text-2xl font-bold text-gray-800">个人词库</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary-500 transition">
        <p class="text-sm text-gray-500">个人词库单词数</p>
        <p class="text-2xl font-bold text-blue-600">{{ customWordCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">教师分配词库</p>
        <p class="text-2xl font-bold text-green-600">{{ assignedCategories.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-center">
        <button
          @click="openImportModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          批量导入
        </button>
      </div>
    </div>

    <!-- Assigned Categories -->
    <div v-if="assignedCategories.length > 0" class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-medium text-gray-800 mb-3">教师分配的词库</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="cat in assignedCategories"
          :key="cat"
          class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
        >
          {{ cat }}
        </span>
      </div>
    </div>

    <!-- Add Single Word Card -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">添加单个单词到个人词库</h2>
      
      <!-- 验证错误提示 -->
      <div v-if="validationError" class="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-3">
        {{ validationError }}
      </div>
      
      <div class="flex items-center space-x-2">
        <input
          v-model="newWord.spelling"
          @blur="newWord.spelling && validateWord(newWord.spelling)"
          placeholder="英文"
          class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
          :class="{'border-orange-500': validationError}"
        />
        <select
          v-model="newWord.partOfSpeech"
          class="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
        >
          <option v-for="item in partOfSpeechOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
        <input
          v-model="newWord.meaning"
          placeholder="中文"
          class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <button
          @click="addSingleWord"
          :disabled="addingWord"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center"
        >
          <svg v-if="addingWord" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ addingWord ? '添加中' : '直接添加' }}
        </button>
      </div>
      
      <!-- 例句展示 -->
      <div v-if="currentExample" class="mt-3 p-3 bg-blue-50 rounded-lg">
        <p class="text-xs text-blue-600 mb-1">例句来源: {{ currentExample.source }}</p>
        <p class="text-sm text-gray-800">{{ currentExample.sentence }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ currentExample.translation }}</p>
      </div>
      
      <p class="text-xs text-gray-400 mt-2">输入单词后会自动验证拼写是否正确，系统会尝试获取例句</p>
    </div>

    <!-- Format Instructions -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">文件格式说明</h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>TXT 格式：</strong>每行一个单词，格式如下：</p>
        <code class="block bg-gray-100 p-2 rounded mt-1 text-xs">apple|n.|苹果</code>
        <code class="block bg-gray-100 p-2 rounded mt-1 text-xs">banana|n.|香蕉</code>
        <p class="mt-2"><strong>Excel 格式：</strong>三列依次为：英文、词性、中文</p>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[80vh] flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">批量导入单词</h3>
        
        <!-- 文件上传 -->
        <div v-if="!parsedWords.length && !processingFile" class="flex-1">
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer"
            @click="triggerImportFileInput"
          >
            <input
              ref="importFileInput"
              type="file"
              accept=".xlsx,.xls,.txt"
              class="hidden"
              @change="handleImportFileSelect"
            />
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-gray-600 mb-2">点击上传文件</p>
            <p class="text-sm text-gray-400">支持 .xlsx, .xls, .txt 格式</p>
          </div>
        </div>

        <!-- Processing -->
        <div v-if="processingFile" class="flex-1 flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto text-primary-500 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">正在解析文件...</p>
          </div>
        </div>

        <!-- Parsed Words Preview with Scroll -->
        <div v-if="parsedWords.length && !processingFile" class="flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-600">已解析 {{ parsedWords.length }} 个单词</p>
            <button @click="clearParsed" class="text-sm text-red-600 hover:text-red-700">清除</button>
          </div>
          
          <!-- 可滚动的单词列表 -->
          <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="text-left py-2 px-3 font-medium text-gray-500 w-12">#</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-500">英文</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-500">词性</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-500">中文</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-500 w-20">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(word, index) in parsedWords" :key="index" class="hover:bg-gray-50">
                  <td class="py-2 px-3 text-gray-400">{{ index + 1 }}</td>
                  <td class="py-2 px-3">
                    <input
                      v-model="word.spelling"
                      class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm"
                    />
                  </td>
                  <td class="py-2 px-3">
                    <select
                      v-model="word.partOfSpeech"
                      class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 outline-none bg-white text-sm"
                    >
                      <option v-for="item in partOfSpeechOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </option>
                    </select>
                  </td>
                  <td class="py-2 px-3">
                    <input
                      v-model="word.meaning"
                      class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm"
                    />
                  </td>
                  <td class="py-2 px-3">
                    <button
                      @click="removeWord(index)"
                      class="p-1 text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex space-x-3">
          <button
            @click="closeImportModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            v-if="parsedWords.length > 0"
            @click="submitWords"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ submitting ? '导入中...' : '导入 ' + parsedWords.length + ' 个单词' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-8 text-center max-w-sm">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">提交成功！</h3>
        <p class="text-gray-500 mb-6">单词已添加到你的个人词库中</p>
        <button
          @click="showSuccess = false"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { fetchWordData, testDeepSeekApi } from '@/utils/dictionaryService'

const wordStore = useWordStore()
const authStore = useAuthStore()

const importFileInput = ref(null)
const parsedWords = ref([])
const submitting = ref(false)
const showSuccess = ref(false)
const addingWord = ref(false)
const validationError = ref('')
const processingFile = ref(false)
const testingApi = ref(false)
const showImportModal = ref(false)
const currentExample = ref(null)

// 从本地存储获取API Key
const deepseekApiKey = ref(localStorage.getItem('smartmemo_deepseek_key') || '')

const newWord = ref({
  spelling: '',
  partOfSpeech: '',
  meaning: ''
})

// 用户分配的词库
const assignedCategories = ref([])

// 个人词库单词数量
const customWordCount = ref(0)

// 词性选项
const partOfSpeechOptions = [
  { value: '', label: '请选择' },
  { value: 'n.', label: '名词 (n.)' },
  { value: 'v.', label: '动词 (v.)' },
  { value: 'vt.', label: '及物动词 (vt.)' },
  { value: 'vi.', label: '不及物动词 (vi.)' },
  { value: 'adj.', label: '形容词 (adj.)' },
  { value: 'adv.', label: '副词 (adv.)' },
  { value: 'pron.', label: '代词 (pron.)' },
  { value: 'num.', label: '数词 (num.)' },
  { value: 'conj.', label: '连词 (conj.)' },
  { value: 'prep.', label: '介词 (prep.)' },
  { value: 'int.', label: '感叹词 (int.)' }
]

// 加载用户分配的词库
const loadUserAssignedCategories = async () => {
  if (!authStore.user) return
  
  try {
    // 从user_settings获取分配的词库
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('category')
      .eq('user_id', authStore.user.id)
      .maybeSingle()
    
    if (userSettings?.category && userSettings.category !== 'all') {
      assignedCategories.value = [userSettings.category]
    } else if (userSettings?.category === 'all') {
      // 如果是all，获取所有非custom的分类
      const { data: categories } = await supabase
        .from('words')
        .select('category')
        .neq('category', 'custom')
      
      const uniqueCategories = [...new Set(categories?.map(w => w.category) || [])]
      assignedCategories.value = uniqueCategories
    }
    
    // 获取个人词库单词数量
    const { count } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'custom')
      .eq('created_by', authStore.user.id)
    
    customWordCount.value = count || 0
  } catch (error) {
    console.error('加载用户词库失败:', error)
  }
}

// 保存并测试 DeepSeek API Key 到本地
const saveDeepseekApiKey = async () => {
  const apiKey = deepseekApiKey.value.trim()
  if (!apiKey) {
    alert('请输入 API Key')
    return
  }
  
  testingApi.value = true
  
  try {
    const result = await testDeepSeekApi(apiKey)
    
    if (result.success) {
      // 保存到本地存储
      localStorage.setItem('smartmemo_deepseek_key', apiKey)
      
      alert(`✅ ${result.message}\n\n测试回复: "${result.example}"\n\nAPI Key 已保存在本地浏览器中`)
    } else {
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('保存 API Key 失败:', error)
    alert('保存失败，请重试')
  } finally {
    testingApi.value = false
  }
}

// 验证单词并获取例句
const validateWord = async (spelling) => {
  if (!spelling || !spelling.trim()) {
    return { valid: false, message: '请输入单词' }
  }

  validationError.value = ''
  currentExample.value = null

  try {
    // 先验证拼写
    const validation = await wordStore.validateWordSpelling(spelling)
    
    if (!validation.valid) {
      validationError.value = validation.message
      return validation
    }
    
    // 尝试获取例句
    const apiKey = localStorage.getItem('smartmemo_deepseek_key')
    const wordData = await fetchWordData(spelling, apiKey)
    
    // 注意：API返回的是example而非examples
    if (wordData?.example) {
      currentExample.value = {
        source: 'Dictionary API',
        sentence: wordData.example,
        translation: ''
      }
    } else if (apiKey && wordData?.meaning) {
      // 使用DeepSeek生成例句
      currentExample.value = {
        source: 'DeepSeek (生成中...)',
        sentence: '正在生成例句...',
        translation: ''
      }
      
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: '你是一个英语学习助手。请根据给出的单词和中文释义，生成一个简单的英文例句，并给出中文翻译。'
              },
              {
                role: 'user',
                content: `单词: ${spelling}\n释义: ${wordData.meaning}\n请生成一个英文例句并给出中文翻译。格式如下：\n例句：\n翻译：`
              }
            ],
            max_tokens: 200
          })
        })
        
        const data = await response.json()
        if (data.choices && data.choices[0]) {
          const content = data.choices[0].message.content
          const sentenceMatch = content.match(/例句：?([^\n]+)/)
          const transMatch = content.match(/翻译：?([^\n]+)/)
          
          currentExample.value = {
            source: 'DeepSeek',
            sentence: sentenceMatch ? sentenceMatch[1].trim() : content,
            translation: transMatch ? transMatch[1].trim() : ''
          }
        }
      } catch (e) {
        console.error('DeepSeek例句生成失败:', e)
        currentExample.value = null
      }
    }
    
    return validation
  } catch (error) {
    console.error('验证失败:', error)
    validationError.value = '验证失败，请重试'
    return { valid: false, message: '验证失败' }
  }
}

const openImportModal = () => {
  showImportModal.value = true
  parsedWords.value = []
}

const closeImportModal = () => {
  showImportModal.value = false
  parsedWords.value = []
  if (importFileInput.value) importFileInput.value.value = ''
}

const triggerImportFileInput = () => {
  importFileInput.value?.click()
}

const handleImportFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
}

const processFile = async (file) => {
  processingFile.value = true
  const extension = file.name.split('.').pop().toLowerCase()
  
  try {
    if (extension === 'txt') {
      const text = await file.text()
      parseTxt(text)
    } else if (extension === 'xlsx' || extension === 'xls') {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      parseExcel(json)
    }
  } catch (error) {
    console.error('File processing error:', error)
    alert('文件解析失败，请检查格式')
  } finally {
    processingFile.value = false
  }
}

const parseTxt = (text) => {
  const lines = text.split('\n').filter(line => line.trim())
  const words = []
  
  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length >= 3) {
      words.push({
        spelling: parts[0].trim(),
        partOfSpeech: parts[1].trim(),
        meaning: parts.slice(2).join('|').trim()
      })
    } else if (parts.length === 2) {
      words.push({
        spelling: parts[0].trim(),
        partOfSpeech: '',
        meaning: parts[1].trim()
      })
    }
  }
  
  parsedWords.value = words
}

const parseExcel = (data) => {
  const words = []
  // Skip header row if exists
  const startIndex = data[0] && data[0][0] === '英文' ? 1 : 0
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i]
    if (row && row[0]) {
      words.push({
        spelling: String(row[0]).trim(),
        partOfSpeech: row[1] ? String(row[1]).trim() : '',
        meaning: row[2] ? String(row[2]).trim() : ''
      })
    }
  }
  
  parsedWords.value = words
}

const removeWord = (index) => {
  parsedWords.value.splice(index, 1)
}

const clearParsed = () => {
  parsedWords.value = []
  if (importFileInput.value) importFileInput.value.value = ''
}

// 直接添加单个单词到数据库
const addSingleWord = async () => {
  if (!newWord.value.spelling || !newWord.value.meaning) {
    alert('请填写单词和释义')
    return
  }
  
  addingWord.value = true
  validationError.value = ''
  
  try {
    // 验证单词拼写
    const validation = await wordStore.validateWordSpelling(newWord.value.spelling)
    if (!validation.valid) {
      const confirmed = confirm(`${validation.message}\n\n是否仍然添加该单词？`)
      if (!confirmed) {
        addingWord.value = false
        return
      }
    }
    
    // 直接添加到数据库，使用 'custom' 分类
    const result = await wordStore.addCustomWordsBatch([{ ...newWord.value }])
    
    if (result.successCount > 0) {
      alert(`✅ 单词 "${newWord.value.spelling}" 添加成功！`)
      newWord.value = { spelling: '', partOfSpeech: '', meaning: '' }
      validationError.value = ''
      currentExample.value = null
      // 刷新单词列表和个人词库数量
      await wordStore.fetchWords()
      await loadUserAssignedCategories()
    } else if (result.duplicatesCount > 0) {
      alert('❌ 该单词已存在，请勿重复添加')
    } else if (result.invalidCount > 0) {
      alert('❌ 单词拼写验证失败')
    } else {
      alert('❌ 添加失败，请重试')
    }
  } catch (error) {
    console.error('添加单词失败:', error)
    alert('❌ 添加失败，请重试')
  } finally {
    addingWord.value = false
  }
}

const submitWords = async () => {
  if (parsedWords.value.length === 0) {
    alert('请先添加单词')
    return
  }

  submitting.value = true
  
  try {
    // 使用批量添加函数，会自动检查重复和验证
    const result = await wordStore.addCustomWordsBatch(parsedWords.value)
    
    // 显示结果
    let message = ''
    if (result.successCount > 0) {
      message += `成功添加 ${result.successCount} 个单词\n`
    }
    if (result.duplicatesCount > 0) {
      message += `跳过 ${result.duplicatesCount} 个重复单词\n`
    }
    if (result.invalidCount > 0) {
      message += `跳过 ${result.invalidCount} 个拼写错误的单词\n`
    }
    if (result.errorCount > 0) {
      message += `${result.errorCount} 个单词添加失败\n`
    }
    
    if (message) {
      alert(message)
    }
    
    showSuccess.value = true
    closeImportModal()
    await wordStore.fetchWords()
    await loadUserAssignedCategories()
  } catch (error) {
    console.error('Submit error:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadUserAssignedCategories()
})
</script>
