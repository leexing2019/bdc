<template>
  <div class="space-y-6">
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
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">词库管理</h1>
          <p class="text-gray-500 mt-1">管理系统词汇和批量导入</p>
        </div>
        <!-- DeepSeek API Key 设置 - 移动端隐藏，点击按钮显示 -->
        <div class="hidden lg:flex items-center space-x-2">
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
      
      <!-- 操作按钮栏 - 移动端堆叠 -->
      <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3">
        <button
          @click="downloadTemplate"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载模板
        </button>
        <button
          @click="batchUpdateExamples"
          :disabled="updatingExamples"
          class="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center justify-center disabled:opacity-50"
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
          @click="openImportModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center"
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
        <div class="flex items-center space-x-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
          <button
            @click.stop="renameCategory(cat)"
            class="p-1 text-gray-400 hover:text-blue-600"
            title="重命名词库"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            @click.stop="deleteCategory(cat)"
            class="p-1 text-gray-400 hover:text-red-600"
            title="删除词库"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
          @click="openAddWordModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          添加单词
        </button>
        <button
          v-if="selectedWords.length > 0"
          @click="batchDeleteWords"
          :disabled="deleting"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
        >
          <svg v-if="deleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ deleting ? '删除中...' : '删除选中 (' + selectedWords.length + ')' }}
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
            <select
              v-model="wordForm.part_of_speech"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option v-for="item in partOfSpeechOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
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
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
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
            :disabled="importing || validatingWords || !importWords.length || waitingForApiKey || showDeepseekPrompt"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            <svg v-if="importing || validatingWords || waitingForApiKey || showDeepseekPrompt" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ showDeepseekPrompt ? '请在弹窗中操作...' : (waitingForApiKey ? '处理中...' : (validatingWords ? '验证中...' : importing ? '导入中...' : '确认导入 ' + importWords.length + ' 个单词')) }}
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
            :disabled="!newCategory.trim() || importing || creatingCategory || waitingForApiKey || showDeepseekPrompt"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            <svg v-if="importing || creatingCategory || waitingForApiKey || showDeepseekPrompt" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ showDeepseekPrompt ? '请在弹窗中操作...' : (waitingForApiKey ? '处理中...' : (creatingCategory ? '创建中...' : (importing ? '导入中...' : '创建词库'))) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Category Modal -->
    <div v-if="showRenameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">重命名词库</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前词库名称</label>
            <input
              :value="renamingCategory"
              type="text"
              disabled
              class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新词库名称</label>
            <input
              v-model="newCategoryName"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="请输入新名称"
            />
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <button
            @click="showRenameModal = false; renamingCategory = ''; newCategoryName = ''"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="confirmRenameCategory"
            :disabled="!newCategoryName.trim() || newCategoryName === renamingCategory"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            确认重命名
          </button>
        </div>
      </div>
    </div>

    <!-- DeepSeek API 提示弹窗 -->
    <div v-if="showDeepseekPrompt" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">💡 提升导入体验</h3>
        <p class="text-sm text-gray-600 mb-4">
          为提升例句获取成功率，建议配置 DeepSeek API Key。配置后系统可以为单词自动生成英文例句，帮助更好地学习。
        </p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">DeepSeek API Key</label>
          <input
            v-model="promptApiKey"
            type="password"
            placeholder="请输入 API Key（可选）"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            @keyup.enter="closeDeepseekPromptAndImport"
          />
          <p class="text-xs text-gray-400 mt-1">
            获取方式：访问 <a href="https://platform.deepseek.com" target="_blank" class="text-primary-600 hover:underline">DeepSeek Platform</a> 注册并获取 API Key
          </p>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center text-sm text-gray-600">
            <input
              v-model="noMorePrompt"
              type="checkbox"
              class="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            不再提示
          </label>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="skipDeepseekPrompt"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            跳过
          </button>
          <button
            @click="closeDeepseekPromptAndImport"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            {{ promptApiKey ? '保存并继续' : '继续导入' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 单词验证结果弹窗 -->
    <div v-if="showValidationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[80vh] flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          ⚠️ 单词验证结果（共 {{ wordValidationResults.length }} 个）
        </h3>
        <p class="text-sm text-gray-500 mb-4">无效单词可以点击"修改"按钮更正拼写，然后点击"验证"重新检查</p>
        
        <!-- 验证统计 -->
        <div class="flex space-x-4 mb-4 text-sm">
          <span class="text-green-600">✓ 有效: {{ wordValidationResults.filter(w => w.valid).length }} 个</span>
          <span class="text-red-600">✗ 无效: {{ wordValidationResults.filter(w => !w.valid).length }} 个</span>
        </div>
        
        <!-- 问题单词列表 -->
        <div ref="validationListRef" class="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="text-left py-2 px-3">单词</th>
                <th class="text-left py-2 px-3">词性</th>
                <th class="text-left py-2 px-3">中文释义</th>
                <th class="text-left py-2 px-3">问题/状态</th>
                <th class="text-left py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(word, index) in wordValidationResults" 
                :key="index" 
                :ref="el => { if (el) wordRefs[index] = el }"
                class="border-t" 
                :class="word.valid ? 'bg-green-50' : 'bg-red-50'"
              >
                <!-- 单词编辑模式 -->
                <td class="py-2 px-3" v-if="editingWordIndex === index">
                  <input
                    v-model="editingWordText"
                    @keyup.enter="saveAndRevalidateWord(index)"
                    @keyup.escape="cancelEditWord"
                    class="w-full px-2 py-1 border border-primary-500 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="输入正确拼写"
                  />
                </td>
                <td class="py-2 px-3 font-medium" v-else>
                  {{ word.spelling }}
                </td>
                
                <!-- 词性（只读） -->
                <td class="py-2 px-3 text-gray-600">
                  {{ word.part_of_speech || '-' }}
                </td>
                
                <!-- 中文释义（只读） -->
                <td class="py-2 px-3 text-gray-600 max-w-[150px] truncate">
                  {{ word.meaning || '-' }}
                </td>
                
                <!-- 问题/状态 -->
                <td class="py-2 px-3">
                  <span v-if="word.valid" class="text-green-600">✓ 有效</span>
                  <span v-else class="text-red-600">{{ word.reason || word.warning || '无效' }}</span>
                </td>
                
                <!-- 操作 -->
                <td class="py-2 px-3">
                  <!-- 编辑模式下的操作 -->
                  <div v-if="editingWordIndex === index" class="flex space-x-1">
                    <button
                      @click="saveAndRevalidateWord(index)"
                      :disabled="validatingSingleWord"
                      class="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50 flex items-center"
                    >
                      <svg v-if="validatingSingleWord" class="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ validatingSingleWord ? '验证中' : '验证' }}
                    </button>
                    <button
                      @click="cancelEditWord"
                      class="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      取消
                    </button>
                  </div>
                  <!-- 非编辑模式 -->
                  <div v-else class="flex space-x-1">
                    <button
                      v-if="!word.valid"
                      @click="startEditWord(index, word)"
                      class="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      修改
                    </button>
                    <button
                      v-if="!word.valid"
                      @click="removeWordFromImport(index)"
                      class="text-red-600 hover:text-red-800 text-xs"
                    >
                      移除
                    </button>
                    <span v-if="word.valid" class="text-green-600 text-xs">✓ 有效</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 flex space-x-3">
          <button
            @click="cancelImport"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            取消导入
          </button>
          <button
            v-if="wordValidationResults.some(w => !w.valid)"
            @click="forceImportAll"
            class="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition"
            title="忽略验证问题，导入全部单词"
          >
            强制导入全部 ({{ wordValidationResults.length }})
          </button>
          <button
            @click="confirmImport"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            {{ wordValidationResults.every(w => w.valid) 
                ? '全部导入 (' + wordValidationResults.length + ' 个)' 
                : '仅导入有效 (' + wordValidationResults.filter(w => w.valid).length + ' 个)' }}
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
import * as XLSX from 'xlsx'
import { fetchWordData, fetchWordDataBatch, testDeepSeekApi } from '@/utils/dictionaryService'

const words = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterCategory = ref('all')
const showAddWordModal = ref(false)
const showImportModal = ref(false)
const showCategoryModal = ref(false)
const showRenameModal = ref(false)
const renamingCategory = ref('')
const newCategoryName = ref('')
const editingWord = ref(null)
const saving = ref(false)
const fetchingWord = ref(false)
const updatingExamples = ref(false)
const importing = ref(false)
const deleting = ref(false) // 批量删除中状态
const importWords = ref([])
const importCategory = ref('CET-4')
const fileInput = ref(null)
const importFileInput = ref(null)
const wordForm = ref({
  spelling: '',
  part_of_speech: '',
  meaning: '',
  phonetic: '',
  category: 'CET-4',
  example_sentence: ''
})

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

// 拼写验证相关
const validatingWords = ref(false)
const validatingSingleWord = ref(false) // 单个单词验证中的状态
const wordValidationResults = ref([])
const showValidationModal = ref(false)
const pendingImportWords = ref([]) // 待导入的单词列表（验证通过后）
const editingWordIndex = ref(-1) // 当前编辑的单词索引
const editingWordText = ref('') // 编辑中的单词文本
const validationListRef = ref(null) // 验证列表容器引用
const wordRefs = ref({}) // 单词行引用
const targetCategoryForImport = ref(null) // 新建词库时导入的目标词库名称

// DeepSeek API Key
const deepseekApiKey = ref(localStorage.getItem('deepseek_api_key') || '')
const testingApi = ref(false)

// DeepSeek API 提示弹窗相关
const showDeepseekPrompt = ref(false)
const promptApiKey = ref('')
const noMorePrompt = ref(localStorage.getItem('smartmemo_no_deepseek_prompt') === 'true')
const waitingForApiKey = ref(false)
const pendingWords = ref([])
const creatingCategory = ref(false) // 新建词库按钮的等待状态

// 保存 DeepSeek API Key 并测试连接
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
      localStorage.setItem('deepseek_api_key', apiKey)
      // 同时更新ref，确保立即生效
      deepseekApiKey.value = apiKey
      alert(`✅ ${result.message}\n\n测试回复: "${result.example}"`)
    } else {
      // 清除无效的 API Key
      localStorage.removeItem('deepseek_api_key')
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('测试 API 失败:', error)
    alert('测试失败，请重试')
  } finally {
    testingApi.value = false
  }
}

// 关闭DeepSeek API提示弹窗并继续导入
const closeDeepseekPromptAndImport = async () => {
  const apiKey = promptApiKey.value.trim()
  
  if (apiKey) {
    // 保存用户输入的API Key
    localStorage.setItem('deepseek_api_key', apiKey)
    deepseekApiKey.value = apiKey
  }
  
  // 关闭弹窗，设置importing为true保持按钮禁用状态
  showDeepseekPrompt.value = false
  promptApiKey.value = ''
  importing.value = true
  
  // 如果用户选择不再提醒
  if (noMorePrompt.value) {
    localStorage.setItem('smartmemo_no_deepseek_prompt', 'true')
  }
  
  // 重置新建词库按钮状态
  creatingCategory.value = false
  
  // 继续执行导入，检查是否有待处理单词
  if (pendingWords.value.length > 0) {
    // 新建词库情况：pendingWords已有内容
    await doCategoryImportWithValidation()
  } else {
    // 批量导入情况：使用importWords
    await doImportWithValidation()
  }
}

// 跳过DeepSeek API继续导入
const skipDeepseekPrompt = async () => {
  showDeepseekPrompt.value = false
  promptApiKey.value = ''
  importing.value = true
  
  // 重置新建词库按钮状态
  creatingCategory.value = false
  
  // 继续执行导入，检查是否有待处理单词
  if (pendingWords.value.length > 0) {
    // 新建词库情况
    await doCategoryImportWithValidation()
  } else {
    // 批量导入情况
    await doImportWithValidation()
  }
}

// 新建词库时的导入验证和导入
const doCategoryImportWithValidation = async () => {
  const categoryName = targetCategoryForImport.value || newCategory.value
  
  validatingWords.value = true
  
  try {
    // 验证所有单词
    console.log('新建词库：开始验证单词，共', pendingWords.value.length, '个')
    const results = await validateWordsList(pendingWords.value, categoryName)
    wordValidationResults.value = results
    
    // 统计有效和无效单词
    const validCount = results.filter(w => w.valid).length
    const invalidCount = results.filter(w => !w.valid).length
    
    console.log('验证完成：有效', validCount, '个，无效', invalidCount, '个')
    
    if (invalidCount > 0) {
      // 显示验证结果弹窗，让用户确认
      showValidationModal.value = true
      setTimeout(() => {
        scrollToFirstInvalid()
      }, 300)
      alert(`验证完成！发现 ${invalidCount} 个问题单词，请检查确认后再导入。`)
    } else {
      // 所有单词都有效，直接导入到新词库
      console.log('所有单词验证通过，直接导入到新词库:', categoryName)
      await importWordsToDbWithValidation(results, categoryName)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    alert('验证失败: ' + error.message + '\n将直接导入所有单词。')
    await importWordsToDbWithValidation(pendingWords.value, categoryName)
  } finally {
    validatingWords.value = false
    waitingForApiKey.value = false
    pendingWords.value = []
    importing.value = false
  }
}

// 常见短语动词列表（允许包含空格的词组）
const commonPhrasalVerbs = [
  'allude to', 'amount to', 'appeal to', 'apply to', 'approve of',
  'argue with', 'arise from', 'ask for', 'attend to', 'attribute to',
  'back up', 'bear with', 'belong to', 'break down', 'break up',
  'bring up', 'call off', 'call on', 'carry out', 'catch up',
  'check in', 'check out', 'come across', 'come from', 'come to',
  'come up with', 'compare to', 'compare with', 'consist of', 'consist in',
  'count on', 'cover up', 'cut off', 'deal with', 'depend on',
  'die of', 'die from', 'disagree with', 'do without', 'draw on',
  'dress up', 'drop in', 'drop out', 'end up', 'enjoy doing',
  'enter into', 'escape from', 'even though', 'every time', 'explain to',
  'face up to', 'fall apart', 'fall down', 'fall out', 'feel like',
  'figure out', 'fill in', 'fill out', 'find out', 'focus on',
  'get across', 'get along', 'get at', 'get away', 'get by',
  'get down', 'get into', 'get off', 'get on', 'get out',
  'get over', 'get rid of', 'get through', 'get together', 'get up',
  'give away', 'give back', 'give in', 'give out', 'give up',
  'go ahead', 'go along', 'go away', 'go back', 'go by',
  'go down', 'go for', 'go in', 'go into', 'go off',
  'go on', 'go out', 'go over', 'go through', 'go up',
  'grow up', 'hand in', 'hand out', 'hang on', 'hang up',
  'have to', 'hear about', 'hear of', 'help with', 'hold back',
  'hold on', 'hold out', 'hurry up', 'improve on', 'insist on',
  'keep on', 'keep up', 'knock out', 'laugh at', 'lay off',
  'lead to', 'learn from', 'leave out', 'let down', 'let in',
  'let out', 'lie down', 'listen to', 'live on', 'live through',
  'look after', 'look at', 'look for', 'look forward to', 'look into',
  'look like', 'look out', 'look over', 'look up', 'make for',
  'make out', 'make up', 'mix up', 'move in', 'move out',
  'occur to', 'pass away', 'pass on', 'pass out', 'pay back',
  'pay for', 'pick out', 'pick up', 'point out', 'put away',
  'put back', 'put down', 'put forward', 'put in', 'put off',
  'put on', 'put out', 'put up', 'put up with',
  'read about', 'read through', 'refer to', 'rely on', 'respond to',
  'run across', 'run away', 'run into', 'run out', 'run over',
  'save up', 'search for', 'see about', 'see off', 'see through',
  'see to', 'seek out', 'seem like', 'sell out', 'send in',
  'send out', 'set aside', 'set off', 'set out', 'set up',
  'settle down', 'show off', 'show up', 'shut down', 'shut off',
  'shut up', 'sigh for', 'sign up', 'sit down', 'sit up',
  'slow down', 'smooth over', 'speak about', 'speak to', 'speed up',
  'spread out', 'stand by', 'stand for', 'stand out', 'stand up',
  'start off', 'start out', 'start over', 'stay away', 'stay in',
  'stay out', 'stay up', 'step up', 'stick to', 'stop over',
  'stumble on', 'subscribe to', 'succeed in', 'suffer from', 'sum up',
  'switch off', 'switch on',
  'take after', 'take apart', 'take away', 'take back', 'take down',
  'take in', 'take off', 'take on', 'take out', 'take over',
  'take up', 'talk about', 'talk to', 'tell about', 'tell off',
  'think about', 'think of', 'think over', 'throw away', 'throw out',
  'tide over', 'touch on', 'try on', 'try out', 'turn down',
  'turn in', 'turn into', 'turn off', 'turn on', 'turn out',
  'turn over', 'turn up',
  'use up', 'wait for', 'wait on', 'wake up', 'walk out',
  'wander from', 'warm up', 'wash up', 'watch out', 'wear away',
  'wear out', 'weep for', 'whip up', 'win over', 'wipe out',
  'wonder about', 'work out', 'worry about', 'worship at',
  'yield to'
]

// 验证单词拼写（使用 Dictionary API）
const validateWordSpelling = async (word) => {
  if (!word || !word.trim()) {
    return { valid: false, reason: '单词为空' }
  }
  
  const cleanWord = word.trim().toLowerCase()
  
  // 检查是否包含非法字符（只允许字母、空格和连字符）
  if (!/^[a-z\s\-]+$/.test(cleanWord)) {
    return { valid: false, reason: '包含非法字符', original: word }
  }
  
  // 检查是否有连续的特殊字符
  if (/[-]{2,}/.test(cleanWord)) {
    return { valid: false, reason: '包含连续连字符', original: word }
  }
  
  // 检查是否以连字符开头或结尾
  if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
    return { valid: false, reason: '以连字符开头或结尾', original: word }
  }
  
  // 检查是否包含空格（可能是短语动词）
  if (cleanWord.includes(' ')) {
    // 检查是否是常见的短语动词
    if (commonPhrasalVerbs.includes(cleanWord)) {
      return { valid: true, original: word, isPhrasalVerb: true, warning: '短语动词' }
    }
    // 尝试验证短语中的主要动词
    const mainVerb = cleanWord.split(' ')[0]
    const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
    try {
      const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(mainVerb)}`)
      if (response.ok) {
        return { valid: true, original: word, isPhrasalVerb: true, warning: '短语动词（未完全验证）' }
      }
    } catch (e) {
      // API 调用失败，允许通过
    }
    // 其他包含空格的词组，标记为需要确认
    return { valid: true, original: word, warning: '包含空格，请确认是否为短语动词', needsConfirmation: true }
  }
  
  // 使用 Dictionary API 验证单词是否存在
  try {
    const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
    const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
    
    if (!response.ok) {
      // 单词不存在，返回可能的建议
      return { 
        valid: false, 
        reason: '字典中未找到该单词', 
        original: word,
        suggestion: cleanWord
      }
    }
    
    const data = await response.json()
    if (!data || !data[0]) {
      return { 
        valid: false, 
        reason: '字典中未找到该单词', 
        original: word 
      }
    }
    
    return { valid: true, original: word, phonetic: data[0].phonetic || null }
  } catch (error) {
    console.error('验证单词出错:', error)
    // API 出错时不阻止导入，但标记为警告
    return { valid: true, original: word, warning: '无法验证拼写' }
  }
}

// 批量验证单词列表
const validateWordsList = async (words, categoryForValidation = null) => {
  const results = []
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  
  // 获取该词库中已存在的单词，用于去重检查（同时检查拼写和词性）
  const targetCategory = categoryForValidation || importCategory.value
  const { data: existingWords } = await supabase
    .from('words')
    .select('spelling, part_of_speech')
    .eq('category', targetCategory)
  
  // 使用 拼写|词性 作为唯一键，词性为空时视为同一词性
  const existingSpellings = new Set(
    (existingWords || []).map(w => `${w.spelling.toLowerCase()}|${(w.part_of_speech || '').toLowerCase()}`)
  )
  
  alert(`开始验证 ${words.length} 个单词，请等待...`)
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const spelling = word.spelling ? word.spelling.trim() : ''
    
    if (!spelling) {
      results.push({ ...word, valid: false, reason: '单词为空' })
      continue
    }
    
    const cleanWord = spelling.toLowerCase()
    
    // 基本格式验证（允许空格和连字符）
    if (!/^[a-z\s\-]+$/.test(cleanWord)) {
      results.push({ ...word, valid: false, reason: '包含非法字符' })
      continue
    }
    
    // 检查是否有连续的特殊字符
    if (/[-]{2,}/.test(cleanWord)) {
      results.push({ ...word, valid: false, reason: '包含连续连字符' })
      continue
    }
    
    // 检查是否以连字符开头或结尾
    if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
      results.push({ ...word, valid: false, reason: '以连字符开头或结尾' })
      continue
    }
    
    // 检查是否已存在于词库中（同时检查拼写和词性）
    const wordKey = `${cleanWord}|${(word.part_of_speech || '').toLowerCase()}`
    if (existingSpellings.has(wordKey)) {
      results.push({ ...word, valid: false, reason: '该词库中已存在' })
      continue
    }
    
    // 检查是否包含空格（可能是短语动词）
    if (cleanWord.includes(' ')) {
      // 检查是否是常见的短语动词
      if (commonPhrasalVerbs.includes(cleanWord)) {
        results.push({ ...word, valid: true, phonetic: null, isPhrasalVerb: true })
        continue
      }
      // 尝试验证短语中的主要动词
      const mainVerb = cleanWord.split(' ')[0]
      try {
        const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(mainVerb)}`)
        if (response.ok) {
          results.push({ ...word, valid: true, phonetic: null, isPhrasalVerb: true, warning: '短语动词' })
          continue
        }
      } catch (e) {
        // API 调用失败
      }
      // 其他包含空格的词组，标记为有效但需要确认
      results.push({ ...word, valid: true, phonetic: null, warning: '包含空格（短语动词）' })
      continue
    }
    
    if (cleanWord.length < 2) {
      results.push({ ...word, valid: false, reason: '单词太短' })
      continue
    }
    
    // 查询 Dictionary API
    try {
      const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
      
      if (response.status === 404 || !response.ok) {
        results.push({ ...word, valid: false, reason: '字典中未找到（拼写错误）' })
      } else {
        const data = await response.json()
        if (!data || !data[0] || !data[0].meanings || data[0].meanings.length === 0) {
          results.push({ ...word, valid: false, reason: '字典中未找到' })
        } else {
          results.push({ ...word, valid: true, phonetic: data[0].phonetic || null })
        }
      }
    } catch (error) {
      results.push({ ...word, valid: true, warning: '验证出错: ' + error.message })
    }
    
    // 添加延迟避免 API 限流（增加延迟时间）
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  const validCount = results.filter(w => w.valid).length
  const invalidCount = results.filter(w => !w.valid).length
  alert(`验证完成！有效: ${validCount} 个，无效: ${invalidCount} 个`)
  
  return results
}

// 移除问题单词
const removeWordFromImport = (index) => {
  wordValidationResults.value.splice(index, 1)
}

// 编辑单词
const startEditWord = (index, word) => {
  editingWordIndex.value = index
  editingWordText.value = word.spelling
}

// 取消编辑
const cancelEditWord = () => {
  editingWordIndex.value = -1
  editingWordText.value = ''
}

// 滚动到第一个无效单词
const scrollToFirstInvalid = () => {
  const firstInvalidIndex = wordValidationResults.value.findIndex(w => !w.valid)
  if (firstInvalidIndex !== -1) {
    scrollToWord(firstInvalidIndex)
  }
}

// 滚动到指定索引的单词
const scrollToWord = (index) => {
  // 等待 DOM 更新
  setTimeout(() => {
    const rowEl = wordRefs.value[index]
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 滚动到下一个无效单词
const scrollToNextInvalid = (currentIndex) => {
  // 从当前索引之后查找下一个无效单词
  for (let i = currentIndex + 1; i < wordValidationResults.value.length; i++) {
    if (!wordValidationResults.value[i].valid) {
      scrollToWord(i)
      return
    }
  }
  // 如果后面没有，从头开始查找
  for (let i = 0; i < currentIndex; i++) {
    if (!wordValidationResults.value[i].valid) {
      scrollToWord(i)
      return
    }
  }
}

// 保存编辑并重新验证
const saveAndRevalidateWord = async (index) => {
  const newSpelling = editingWordText.value.trim()
  if (!newSpelling) {
    alert('单词不能为空')
    return
  }
  
  const cleanWord = newSpelling.toLowerCase()
  
  // 基本格式验证
  if (!/^[a-z\-]+$/.test(cleanWord)) {
    alert('单词只允许包含字母和连字符')
    return
  }
  
  // 检查是否有连续的特殊字符
  if (/[-]{2,}/.test(cleanWord)) {
    alert('单词不能包含连续连字符')
    return
  }
  
  // 检查是否以连字符开头或结尾
  if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
    alert('单词不能以连字符开头或结尾')
    return
  }
  
  if (cleanWord.length < 2) {
    alert('单词太短')
    return
  }
  
  // 设置验证中状态
  validatingSingleWord.value = true
  
  // 重新验证单词
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  
  try {
    let isValidWord = true
    let isPhrasalVerb = false
    let phonetic = null
    
    // 检查是否包含空格（可能是短语动词）
    if (cleanWord.includes(' ')) {
      // 检查是否是常见的短语动词
      if (commonPhrasalVerbs.includes(cleanWord)) {
        isPhrasalVerb = true
      } else {
        // 尝试验证短语中的主要动词
        const mainVerb = cleanWord.split(' ')[0]
        const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(mainVerb)}`)
        if (response.ok) {
          isPhrasalVerb = true
        } else {
          isValidWord = false
        }
      }
    } else {
      // 验证单个单词
      const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
      
      if (response.status === 404 || !response.ok) {
        isValidWord = false
      } else {
        const data = await response.json()
        if (!data || !data[0] || !data[0].meanings || data[0].meanings.length === 0) {
          isValidWord = false
        } else {
          phonetic = data[0].phonetic || null
        }
      }
    }
    
    // 更新验证结果
    const word = wordValidationResults.value[index]
    wordValidationResults.value[index] = {
      ...word,
      spelling: newSpelling,
      valid: isValidWord,
      reason: isValidWord ? null : '字典中未找到（拼写错误）',
      phonetic: phonetic,
      isPhrasalVerb: isPhrasalVerb || undefined
    }
    
    // 关闭编辑状态
    editingWordIndex.value = -1
    editingWordText.value = ''
    
    // 提示结果并滚动到下一个无效单词
    if (!isValidWord) {
      alert(`❌ 单词 "${newSpelling}" 验证失败：字典中未找到该单词`)
      // 保持在当前行继续修改
    } else if (isPhrasalVerb) {
      alert(`✅ 单词 "${newSpelling}" 验证通过！（短语动词）`)
      // 滚动到下一个无效单词
      scrollToNextInvalid(index)
    } else {
      alert(`✅ 单词 "${newSpelling}" 验证通过！`)
      // 滚动到下一个无效单词
      scrollToNextInvalid(index)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    alert('验证失败: ' + error.message)
  } finally {
    validatingSingleWord.value = false
  }
}

// 取消导入
const cancelImport = () => {
  showValidationModal.value = false
  wordValidationResults.value = []
  pendingImportWords.value = []
}

// 确认导入
const confirmImport = async () => {
  // 判断是否全部有效
  const allValid = wordValidationResults.value.every(w => w.valid)
  
  // 获取目标词库（可能是新建词库的情况）
  const targetCat = targetCategoryForImport.value
  
  if (!allValid) {
    // 过滤出有效的单词
    const validWords = wordValidationResults.value.filter(w => w.valid)
    
    if (validWords.length === 0) {
      alert('没有有效的单词可以导入')
      return
    }
    
    showValidationModal.value = false
    // 执行导入
    await importWordsToDbWithValidation(validWords, targetCat)
  } else {
    // 全部有效，导入全部
    showValidationModal.value = false
    await importWordsToDbWithValidation(wordValidationResults.value, targetCat)
  }
  
  // 如果是从新建词库导入的，导入完成后关闭新建词库弹窗
  if (targetCat) {
    showCategoryModal.value = false
    newCategory.value = ''
    importWords.value = []
    filterCategory.value = targetCat
    // 清除目标词库标记
    targetCategoryForImport.value = null
  }
}

// 强制导入全部单词（包括验证失败的）
const forceImportAll = async () => {
  if (!confirm('确定要导入全部单词吗？包含拼写错误的单词可能会导致学习问题。')) {
    return
  }
  
  // 获取目标词库（可能是新建词库的情况）
  const targetCat = targetCategoryForImport.value
  
  showValidationModal.value = false
  
  // 执行导入全部单词
  await importWordsToDbWithValidation(wordValidationResults.value, targetCat)
  
  // 如果是从新建词库导入的，导入完成后关闭新建词库弹窗
  if (targetCat) {
    showCategoryModal.value = false
    newCategory.value = ''
    importWords.value = []
    filterCategory.value = targetCat
    // 清除目标词库标记
    targetCategoryForImport.value = null
  }
}

// 带验证的导入函数
const importWordsToDbWithValidation = async (wordsToImport, targetCategory = null) => {
  importing.value = true
  // 如果传入了目标词库名称，使用它；否则使用默认的导入分类
  const categoryToUse = targetCategory || importCategory.value
  
  try {
    // 先获取该词库中已存在的单词，用于去重检查（同时检查拼写和词性）
    const { data: existingWords } = await supabase
      .from('words')
      .select('spelling, part_of_speech')
      .eq('category', categoryToUse)
    
    // 使用 拼写|词性 作为唯一键
    const existingSpellings = new Set(
      (existingWords || []).map(w => `${w.spelling.toLowerCase()}|${(w.part_of_speech || '').toLowerCase()}`)
    )
    
    const total = wordsToImport.length
    let successCount = 0
    let failCount = 0
    let duplicateCount = 0
    
    for (let i = 0; i < total; i++) {
      const word = wordsToImport[i]
      const spellingLower = word.spelling.toLowerCase()
      const partOfSpeech = (word.part_of_speech || '').toLowerCase()
      const wordKey = `${spellingLower}|${partOfSpeech}`
      
      // 检查是否已存在（同时检查拼写和词性）
      if (existingSpellings.has(wordKey)) {
        duplicateCount++
        continue
      }
      
      // 如果没有例句或音标，自动获取
      let exampleSentence = word.example_sentence
      let phonetic = word.phonetic
      
      if (!exampleSentence || !phonetic) {
        try {
          console.log('开始获取单词数据:', word.spelling, '词性:', word.part_of_speech, 'API Key:', deepseekApiKey.value ? '已配置' : '未配置')
          const data = await fetchWordData(word.spelling, deepseekApiKey.value, word.part_of_speech)
          console.log('获取到的数据:', word.spelling, data)
          
          if (!phonetic && data.phonetic) {
            phonetic = data.phonetic
          }
          
          if (!exampleSentence && data.example) {
            exampleSentence = data.example
            console.log('获取到例句:', exampleSentence)
          }
        } catch (apiError) {
          console.error('获取单词数据失败:', word.spelling, apiError.message)
          // 继续导入，不因为API失败而中断
        }
        
        // 添加延迟避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const { error } = await supabase
        .from('words')
        .insert({ 
          spelling: word.spelling,
          part_of_speech: word.part_of_speech || '',
          meaning: word.meaning,
          phonetic: phonetic || '',
          example_sentence: exampleSentence || '',
          category: categoryToUse 
        })
      
      if (error) {
        failCount++
      } else {
        successCount++
        // 添加到已存在集合中，避免同一批次中重复导入（使用拼写|词性作为键）
        existingSpellings.add(wordKey)
      }
    }
    
    await fetchWords()
    
    // 如果导入了新词库，确保它在分类列表中显示
    if (targetCategory && !categories.value.includes(targetCategory)) {
      categories.value.push(targetCategory)
    }
    
    showImportModal.value = false
    importWords.value = []
    wordValidationResults.value = []
    pendingImportWords.value = []
    
    let message = `导入完成！成功: ${successCount} 个，失败: ${failCount} 个`
    if (duplicateCount > 0) {
      message += `，重复: ${duplicateCount} 个`
    }
    alert(message)
  } catch (error) {
    console.error('Import error:', error)
    alert('导入失败，请重试')
  } finally {
    importing.value = false
  }
}

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
      // 只显示公共词库分类，不显示custom（学生自定义）
      const defaultCategories = ['CET-4', 'CET-6']
      categories.value = [...new Set([...defaultCategories, ...uniqueCategories])]
    }
  } catch (error) {
    console.error('加载词库分类失败:', error)
  }
}

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
  loading.value = true
  try {
    // 只获取公共词库，不显示学生自定义单词（custom分类）
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .neq('category', 'custom')
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
  } finally {
    loading.value = false
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

const fetchWordInfo = async () => {
  if (!wordForm.value.spelling.trim()) return
  
  // 检查是否选择了词性
  if (!wordForm.value.part_of_speech) {
    alert('请先选择词性，以便获取对应词性的例句')
    return
  }
  
  fetchingWord.value = true
  try {
    console.log('开始获取单词信息:', wordForm.value.spelling, '词性:', wordForm.value.part_of_speech, 'API Key:', deepseekApiKey.value ? '已配置' : '未配置')
    const data = await fetchWordData(wordForm.value.spelling, deepseekApiKey.value, wordForm.value.part_of_speech)
    console.log('获取到的完整数据:', JSON.stringify(data, null, 2))
    
    // 音标填充到音标字段
    if (data.phonetic && !wordForm.value.phonetic) {
      wordForm.value.phonetic = data.phonetic
      console.log('获取到音标:', data.phonetic)
    }
    
    // 只填充真正的例句到例句字段，不包含释义
    if (data.example && !wordForm.value.example_sentence) {
      wordForm.value.example_sentence = data.example
      console.log('成功获取例句:', data.example)
    } else {
      console.log('未能获取例句 - Dictionary API返回例句:', data.example, 'DeepSeek API Key:', deepseekApiKey.value ? '已配置' : '未配置')
    }
  } catch (error) {
    console.error('获取单词信息失败:', error)
  } finally {
    fetchingWord.value = false
  }
}

const saveWord = async () => {
  // 验证单词拼写
  const spelling = wordForm.value.spelling.trim()
  if (!spelling) {
    alert('请输入英文单词')
    return
  }
  
  // 基本格式验证（允许空格和连字符）
  const cleanWord = spelling.toLowerCase()
  if (!/^[a-z\s\-]+$/.test(cleanWord)) {
    alert('单词只允许包含字母、空格和连字符')
    return
  }
  
  // 检查是否有连续的特殊字符
  if (/[-]{2,}/.test(cleanWord)) {
    alert('单词不能包含连续连字符')
    return
  }
  
  // 检查是否以连字符开头或结尾
  if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
    alert('单词不能以连字符开头或结尾')
    return
  }
  
  if (cleanWord.length < 2) {
    alert('单词太短')
    return
  }
  
  // 检查是否已存在相同单词
  const existingWord = words.value.find(w => w.spelling.toLowerCase() === cleanWord)
  if (existingWord) {
    alert(`单词 "${cleanWord}" 已存在于词库中！`)
    return
  }
  
  saving.value = true
  
  try {
    // 直接验证单词拼写，不弹窗询问
    let isValidWord = true
    let isPhrasalVerb = false
    
    // 检查是否包含空格（可能是短语动词）
    if (cleanWord.includes(' ')) {
      // 检查是否是常见的短语动词
      if (commonPhrasalVerbs.includes(cleanWord)) {
        isPhrasalVerb = true
      } else {
        // 尝试验证短语中的主要动词
        const mainVerb = cleanWord.split(' ')[0]
        const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
        const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(mainVerb)}`)
        if (response.ok) {
          isPhrasalVerb = true
        }
      }
    } else {
      // 验证单个单词
      const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
      const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
      
      if (response.status === 404) {
        isValidWord = false
      } else if (response.ok) {
        const data = await response.json()
        if (!data || !data[0] || !data[0].meanings || data[0].meanings.length === 0) {
          isValidWord = false
        }
      } else {
        isValidWord = false
      }
    }
    
    // 直接弹窗显示验证结果
    if (!isValidWord) {
      alert(`❌ 单词 "${cleanWord}" 验证失败：在字典中未找到该单词，请检查拼写是否正确`)
      saving.value = false
      return
    } else if (isPhrasalVerb) {
      alert(`✅ 单词 "${cleanWord}" 验证通过！（短语动词）`)
    } else {
      alert(`✅ 单词 "${cleanWord}" 验证通过！`)
    }
    
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
    alert('单词保存成功！')
  } catch (error) {
    console.error('Save word error:', error)
    alert('保存失败，请重试: ' + error.message)
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
    deleting.value = true
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
    } finally {
      deleting.value = false
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

// 打开重命名词库弹窗
const renameCategory = (category) => {
  renamingCategory.value = category
  newCategoryName.value = category
  showRenameModal.value = true
}

// 确认重命名词库
const confirmRenameCategory = async () => {
  const oldName = renamingCategory.value
  const newName = newCategoryName.value.trim()
  
  if (!newName || newName === oldName) return
  
  // 检查新名称是否已存在
  if (categories.value.includes(newName)) {
    alert('该词库名称已存在！')
    return
  }
  
  try {
    // 更新该分类下所有单词的category（使用admin权限）
    const { error } = await supabaseAdmin
      .from('words')
      .update({ category: newName })
      .eq('category', oldName)
    
    if (error) throw error
    
    // 刷新分类列表
    await fetchWords()
    showRenameModal.value = false
    renamingCategory.value = ''
    newCategoryName.value = ''
    alert('词库重命名成功！')
  } catch (error) {
    console.error('重命名词库失败:', error)
    alert('重命名失败，请重试')
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

// 打开添加单词弹窗，并设置默认分类为当前选中的词库
const openAddWordModal = () => {
  // 如果当前选择了特定词库（不是"全部"），则设置默认分类
  if (filterCategory.value && filterCategory.value !== 'all') {
    wordForm.value.category = filterCategory.value
  }
  showAddWordModal.value = true
}

// 打开批量导入弹窗，并设置默认分类为当前选中的词库
const openImportModal = () => {
  // 如果当前选择了特定词库（不是"全部"），则设置默认导入分类
  if (filterCategory.value && filterCategory.value !== 'all') {
    importCategory.value = filterCategory.value
  }
  showImportModal.value = true
}

const importWordsToDb = async () => {
  // 检查是否需要弹出API提示（没有API Key且没有选择不再提醒）
  const hasApiKey = !!deepseekApiKey.value || !!localStorage.getItem('deepseek_api_key')
  const noPrompt = noMorePrompt.value
  
  // 如果没有API Key且没有选择不再提醒，弹出DeepSeek API提示
  if (!hasApiKey && !noPrompt) {
    // 保存待导入的单词列表
    pendingWords.value = importWords.value
    waitingForApiKey.value = true
    showDeepseekPrompt.value = true
    return
  }
  
  // 继续执行导入流程
  await doImportWithValidation()
}

// 执行导入验证和导入
const doImportWithValidation = async () => {
  // 先进行拼写验证
  validatingWords.value = true
  
  try {
    // 验证所有单词
    console.log('开始验证单词，共', importWords.value.length, '个')
    const results = await validateWordsList(importWords.value, importCategory.value)
    wordValidationResults.value = results
    
    // 统计有效和无效单词
    const validCount = results.filter(w => w.valid).length
    const invalidCount = results.filter(w => !w.valid).length
    
    console.log('验证完成：有效', validCount, '个，无效', invalidCount, '个')
    
    if (invalidCount > 0) {
      // 显示验证结果弹窗，让用户确认
      console.log('显示验证弹窗，有', invalidCount, '个无效单词')
      showValidationModal.value = true
      // 滚动到第一个无效单词
      setTimeout(() => {
        scrollToFirstInvalid()
      }, 300)
      alert(`验证完成！发现 ${invalidCount} 个问题单词，请检查确认后再导入。`)
    } else {
      // 所有单词都有效，直接导入
      console.log('所有单词验证通过，直接导入')
      await importWordsToDbWithValidation(results)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    alert('验证失败: ' + error.message + '\n将直接导入所有单词。')
    // 验证失败时也允许导入
    await importWordsToDbWithValidation(importWords.value)
  } finally {
    validatingWords.value = false
    waitingForApiKey.value = false
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
  creatingCategory.value = true
  
  // 如果有导入的单词，先检查是否需要弹出API提示
  if (importWords.value.length > 0) {
    const hasApiKey = !!deepseekApiKey.value || !!localStorage.getItem('deepseek_api_key')
    const noPrompt = noMorePrompt.value
    
    // 如果没有API Key且没有选择不再提醒，弹出DeepSeek API提示
    if (!hasApiKey && !noPrompt) {
      // 保存待导入的单词列表
      pendingWords.value = importWords.value
      targetCategoryForImport.value = categoryName
      waitingForApiKey.value = true
      showDeepseekPrompt.value = true
      // 保持按钮等待状态
      return
    }
    
    // 继续执行验证和导入
    validatingWords.value = true
    
    try {
      // 验证所有单词（与批量导入相同的验证逻辑）
      console.log('新建词库：开始验证单词，共', importWords.value.length, '个')
      const results = await validateWordsList(importWords.value, categoryName)
      wordValidationResults.value = results
      
      // 统计有效和无效单词
      const validCount = results.filter(w => w.valid).length
      const invalidCount = results.filter(w => !w.valid).length
      
      console.log('验证完成：有效', validCount, '个，无效', invalidCount, '个')
      
      if (invalidCount > 0) {
        // 显示验证结果弹窗，让用户确认
        // 保存目标词库名称到临时变量
        targetCategoryForImport.value = categoryName
        console.log('显示验证弹窗，有', invalidCount, '个无效单词，目标是新词库:', categoryName)
        showValidationModal.value = true
        // 滚动到第一个无效单词
        setTimeout(() => {
          scrollToFirstInvalid()
        }, 300)
        alert(`验证完成！发现 ${invalidCount} 个问题单词，请检查确认后再导入。`)
        // 不关闭弹窗，等待用户在验证弹窗中确认
        return
      } else {
        // 所有单词都有效，直接导入到新词库
        console.log('所有单词验证通过，直接导入到新词库:', categoryName)
        await importWordsToDbWithValidation(results, categoryName)
      }
    } catch (error) {
      console.error('验证单词失败:', error)
      alert('验证失败: ' + error.message + '\n将直接导入所有单词。')
      // 验证失败时也允许导入
      await importWordsToDbWithValidation(importWords.value, categoryName)
    } finally {
      validatingWords.value = false
      creatingCategory.value = false
    }
  } else {
    // 没有导入单词，只创建空词库
    try {
      // 确保新词库在分类列表中显示
      if (!categories.value.includes(categoryName)) {
        categories.value.push(categoryName)
      }
      
      // 刷新分类下拉选项
      filterCategory.value = categoryName
      
      showCategoryModal.value = false
      newCategory.value = ''
      alert('词库创建成功！')
    } catch (error) {
      console.error('Create category error:', error)
      alert('创建失败: ' + (error.message || JSON.stringify(error)))
    } finally {
      importing.value = false
      creatingCategory.value = false
    }
    return
  }
  
  // 刷新单词列表
  await fetchWords()
  
  // 确保新词库在分类列表中显示
  if (!categories.value.includes(categoryName)) {
    categories.value.push(categoryName)
  }
  
  // 刷新分类下拉选项
  filterCategory.value = categoryName
  
  showCategoryModal.value = false
  newCategory.value = ''
  importWords.value = []
  importing.value = false
  creatingCategory.value = false
  alert('词库创建成功！')
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
      
      // 获取API数据（传递词性以获取对应词性的例句）
      const data = await fetchWordData(word.spelling, deepseekApiKey.value, word.part_of_speech)
      
      const updateData = {}
      
      // 获取音标
      if (!word.phonetic && data.phonetic) {
        updateData.phonetic = data.phonetic
      }
      
      // 只填充真正的例句，不包含释义
      if (!word.example_sentence && data.example) {
        updateData.example_sentence = data.example
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
