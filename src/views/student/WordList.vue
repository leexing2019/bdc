<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">单词本</h1>
      <div class="text-sm text-gray-500">
        共 {{ wordStore.words.length }} 个单词
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex space-x-2 overflow-x-auto pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition"
        :class="activeTab === tab.value 
          ? 'bg-primary-600 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs opacity-75">({{ getTabCount(tab.value) }})</span>
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索单词..."
        class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Word List -->
    <div class="space-y-3">
      <div
        v-for="word in filteredWords"
        :key="word.id"
        class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        @click="selectedWord = word"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ word.spelling }}</h3>
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ word.part_of_speech }}</span>
            </div>
            <p class="text-gray-600 mt-1">{{ word.meaning }}</p>
            <div class="flex items-center mt-2 space-x-4 text-xs text-gray-400">
              <span v-if="word.phonetic">{{ word.phonetic }}</span>
              <span class="px-2 py-0.5 rounded" :class="getProficiencyClass(word)">
                {{ getProficiencyLabel(word) }}
              </span>
              <!-- 例句标签 -->
              <span 
                v-if="word.example_sentence" 
                class="text-blue-500 flex items-center"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                有例句
              </span>
              <!-- 来源标签 -->
              <span 
                v-if="word.source" 
                class="px-2 py-0.5 rounded"
                :class="word.source === 'institution' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
              >
                {{ word.source === 'institution' ? '机构添加' : '自主添加' }}
              </span>
            </div>
          </div>
          <button
            @click.stop="playWord(word.spelling)"
            class="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <!-- 编辑和删除按钮（仅自行导入的单词显示） -->
          <button
            v-if="word.source === 'custom'"
            @click.stop="openEditModal(word)"
            class="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            v-if="word.source === 'custom'"
            @click.stop="deleteWord(word)"
            class="p-2 hover:bg-red-100 rounded-lg transition"
          >
            <svg class="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredWords.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p class="text-gray-500">暂无单词</p>
      </div>
    </div>

    <!-- Word Detail Modal -->
    <div v-if="selectedWord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="selectedWord = null">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6" @click.stop>
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedWord.spelling }}</h2>
            <p class="text-gray-500">{{ selectedWord.phonetic }}</p>
          </div>
          <button @click="selectedWord = null" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">{{ selectedWord.part_of_speech }}</span>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">释义</h3>
            <p class="text-gray-800">{{ selectedWord.meaning }}</p>
          </div>
          <div v-if="selectedWord.example_sentence">
            <h3 class="text-sm font-medium text-gray-500 mb-1">例句</h3>
            <p class="text-gray-600 italic">{{ selectedWord.example_sentence }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">掌握程度</h3>
            <span class="px-3 py-1 rounded-full text-sm" :class="getProficiencyClass(selectedWord)">
              {{ getProficiencyLabel(selectedWord) }}
            </span>
          </div>
          <!-- 来源 -->
          <div v-if="selectedWord.source">
            <h3 class="text-sm font-medium text-gray-500 mb-1">来源</h3>
            <span 
              class="px-3 py-1 rounded-full text-sm"
              :class="selectedWord.source === 'institution' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
            >
              {{ selectedWord.source === 'institution' ? '机构添加' : '自主添加' }}
            </span>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
@click="playWord(selectedWord.spelling)"
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
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showEditModal = false">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6" @click.stop>
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">编辑单词</h2>
          <button @click="showEditModal = false" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">英文</label>
            <input
              v-model="editingWord.spelling"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">词性</label>
            <select
              v-model="editingWord.part_of_speech"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
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
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="showEditModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="saveEditWord"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWordStore } from '@/stores/words'
import { supabase } from '@/lib/supabase'

const wordStore = useWordStore()

// 页面加载时获取单词数据
onMounted(async () => {
  if (wordStore.words.length === 0) {
    await wordStore.fetchWords()
  }
})

const activeTab = ref('all')
const searchQuery = ref('')
const selectedWord = ref(null)
const showEditModal = ref(false)
const editingWord = ref({})

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

const playWord = (word) => {
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
</script>
