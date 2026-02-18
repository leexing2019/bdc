<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">导入单词</h1>
      <p class="text-gray-500 mt-1">上传文件或手动添加单词到你的学习计划</p>
    </div>

    <!-- DeepSeek API Key 设置 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-start space-x-3">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-gray-800">例句生成设置</span>
          </div>
          <p class="text-sm text-gray-500 mb-3">
            系统会尝试从词典API获取例句。如果无法获取，你可以输入 DeepSeek API Key 来生成例句。
          </p>
          <div class="flex items-center space-x-2">
            <input
              v-model="deepseekApiKey"
              type="password"
              placeholder="DeepSeek API Key（可选）"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              @click="saveDeepseekApiKey"
              :disabled="testingApi"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm disabled:opacity-50 flex items-center"
            >
              <svg v-if="testingApi" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ testingApi ? '测试中' : '保存' }}
            </button>
            <a
              href="https://platform.deepseek.com/"
              target="_blank"
              class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              申请API Key
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">上传文件</h2>
      
      <!-- File Input -->
      <div
        v-if="!parsedWords.length && !processingFile"
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer"
        @click="triggerFileInput"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".txt,.doc,.docx,.xlsx"
          class="hidden"
          @change="handleFileSelect"
        />
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-gray-600 mb-2">点击或拖拽文件到此处上传</p>
        <p class="text-sm text-gray-400">支持 TXT, DOC, DOCX, XLSX 格式</p>
      </div>

      <!-- Processing File Loading -->
      <div
        v-if="processingFile"
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center"
      >
        <svg class="w-12 h-12 mx-auto text-primary-500 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">正在处理文件...</p>
      </div>

      <!-- Format Instructions -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium text-blue-800 mb-2">文件格式说明</h3>
        <div class="text-sm text-blue-700 space-y-1">
          <p><strong>TXT 格式：</strong>每行一个单词，格式如下：</p>
          <code class="block bg-white p-2 rounded mt-1 text-xs">apple|n.|苹果</code>
          <code class="block bg-white p-2 rounded mt-1 text-xs">banana|n.|香蕉</code>
          <p class="mt-2"><strong>Excel 格式：</strong>三列依次为：英文、词性、中文</p>
        </div>
      </div>
    </div>

    <!-- Parsed Words Preview -->
    <div v-if="parsedWords.length" class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">
          解析结果 ({{ parsedWords.length }} 个单词)
        </h2>
        <button
          @click="clearParsed"
          class="text-sm text-red-600 hover:text-red-700"
        >
          清除
        </button>
      </div>

      <!-- Words Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">英文</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">词性</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">中文</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(word, index) in parsedWords" :key="index" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4">
                <input
                  v-model="word.spelling"
                  class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </td>
              <td class="py-3 px-4">
                <input
                  v-model="word.partOfSpeech"
                  class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="n./v."
                />
              </td>
              <td class="py-3 px-4">
                <input
                  v-model="word.meaning"
                  class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  @click="removeWord(index)"
                  class="p-1 text-red-500 hover:text-red-700"
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

      <!-- Add Manual Word -->
      <div class="mt-4 space-y-2">
        <!-- 验证错误提示 -->
        <div v-if="validationError" class="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
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
          <input
            v-model="newWord.partOfSpeech"
            placeholder="词性"
            class="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <input
            v-model="newWord.meaning"
            placeholder="中文"
            class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <button
            @click="addManualWord"
            :disabled="validatingWord"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center"
          >
            <svg v-if="validatingWord" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ validatingWord ? '验证中' : '添加' }}
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="clearParsed"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          取消
        </button>
        <button
          @click="submitWords"
          :disabled="submitting"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          {{ submitting ? '提交中...' : '确认提交' }}
        </button>
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
        <p class="text-gray-500 mb-6">单词已添加到你的学习计划中</p>
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
import { ref } from 'vue'
import { useWordStore } from '@/stores/words'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import { fetchWordData, testDeepSeekApi } from '@/utils/dictionaryService'

const wordStore = useWordStore()

const fileInput = ref(null)
const parsedWords = ref([])
const submitting = ref(false)
const showSuccess = ref(false)
const validatingWord = ref(false)
const validationError = ref('')
const processingFile = ref(false)
const testingApi = ref(false)
const deepseekApiKey = ref(localStorage.getItem('deepseek_api_key') || '')
const newWord = ref({
  spelling: '',
  partOfSpeech: '',
  meaning: ''
})

// 保存并测试 DeepSeek API Key
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
      localStorage.setItem('deepseek_api_key', apiKey)
      alert(`✅ ${result.message}\n\n测试回复: "${result.example}"`)
    } else {
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('测试 API 失败:', error)
    alert('测试失败，请重试')
  } finally {
    testingApi.value = false
  }
}

// 验证单个单词
const validateWord = async (spelling) => {
  if (!spelling || !spelling.trim()) {
    return { valid: false, message: '请输入单词' }
  }

  validatingWord.value = true
  validationError.value = ''

  try {
    const result = await wordStore.validateWordSpelling(spelling)
    validatingWord.value = false
    
    if (!result.valid) {
      validationError.value = result.message
      return result
    }
    return result
  } catch (error) {
    validatingWord.value = false
    validationError.value = '验证失败，请重试'
    return { valid: false, message: '验证失败' }
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

const handleFileSelect = (event) => {
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
    } else if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      parseTxt(result.value)
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
  if (fileInput.value) fileInput.value.value = ''
}

const addManualWord = async () => {
  if (!newWord.value.spelling || !newWord.value.meaning) {
    alert('请填写单词和释义')
    return
  }

  // 验证单词拼写
  const validation = await validateWord(newWord.value.spelling)
  if (!validation.valid) {
    // 显示警告但不阻止添加（用户可以选择确认添加）
    const confirmed = confirm(`${validation.message}\n\n是否仍然添加该单词？`)
    if (!confirmed) return
  }

  // 检查是否已存在
  const isDuplicate = parsedWords.value.some(
    w => w.spelling.toLowerCase() === newWord.value.spelling.toLowerCase()
  )
  
  if (isDuplicate) {
    alert('该单词已存在于当前列表中')
    return
  }

  parsedWords.value.push({ ...newWord.value })
  newWord.value = { spelling: '', partOfSpeech: '', meaning: '' }
  validationError.value = ''
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
    clearParsed()
    await wordStore.fetchWords()
  } catch (error) {
    console.error('Submit error:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>
