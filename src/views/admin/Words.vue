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
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">CET-4</p>
        <p class="text-2xl font-bold text-blue-600">{{ getCategoryCount('CET-4') }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">CET-6</p>
        <p class="text-2xl font-bold text-green-600">{{ getCategoryCount('CET-6') }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">自定义</p>
        <p class="text-2xl font-bold text-purple-600">{{ getCategoryCount('custom') }}</p>
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
          <option value="CET-4">CET-4</option>
          <option value="CET-6">CET-6</option>
          <option value="custom">自定义</option>
        </select>
        <button
          @click="showAddWordModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          添加单词
        </button>
      </div>
    </div>

    <!-- Words Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
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
            <input
              v-model="wordForm.spelling"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入英文单词"
            />
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
        
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileSelect"
          />
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600">点击上传 Excel 文件</p>
          <p class="text-sm text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

const words = ref([])
const searchQuery = ref('')
const filterCategory = ref('all')
const showAddWordModal = ref(false)
const showImportModal = ref(false)
const editingWord = ref(null)
const saving = ref(false)
const importing = ref(false)
const importWords = ref([])
const fileInput = ref(null)

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
    'CET-4': 'bg-blue-100 text-blue-700',
    'CET-6': 'bg-green-100 text-green-700',
    'custom': 'bg-purple-100 text-purple-700'
  }
  return classes[category] || 'bg-gray-100 text-gray-700'
}

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) {
    words.value = data || []
  }
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

const saveWord = async () => {
  saving.value = true
  try {
    if (editingWord.value) {
      await supabase
        .from('words')
        .update(wordForm.value)
        .eq('id', editingWord.value.id)
    } else {
      await supabase
        .from('words')
        .insert(wordForm.value)
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

  try {
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
          category: 'CET-4'
        })
      }
    }

    importWords.value = parsed
  } catch (error) {
    console.error('File parse error:', error)
    alert('文件解析失败')
  }
}

const importWordsToDb = async () => {
  importing.value = true
  try {
    for (const word of importWords.value) {
      await supabase
        .from('words')
        .insert(word)
    }
    
    await fetchWords()
    showImportModal.value = false
    importWords.value = []
    alert('导入成功！')
  } catch (error) {
    console.error('Import error:', error)
    alert('导入失败，请重试')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  fetchWords()
})
</script>
