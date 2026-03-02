<template>
  <div class="space-y-6 mobile-content-pb lg:pb-0">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">导入单词</h1>
        <p class="text-gray-500 mt-1">上传文件或手动添加单词到你的个人词库</p>
      </div>
      <!-- DeepSeek API Key 设置 -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
        <input
          v-model="deepseekApiKey"
          type="password"
          placeholder="DeepSeek API Key（可选）"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40 lg:w-48 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <button
          @click="saveDeepseekApiKey"
          :disabled="testingApi"
          class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50 w-full sm:w-auto"
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
        <div v-if="statsLoading" class="flex items-center">
          <svg class="w-5 h-5 animate-spin text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-400">加载中...</span>
        </div>

        <p v-else class="text-2xl font-bold text-blue-600">{{ customWordCount }}</p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <p class="text-sm text-gray-500">教师分配单词数</p>
        <div v-if="statsLoading" class="flex items-center">
          <svg class="w-5 h-5 animate-spin text-green-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-400">加载中...</span>
        </div>
        <p v-else class="text-2xl font-bold text-green-600">{{ assignedWordsCount }}</p>
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
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h2 class="text-base font-semibold text-gray-800 mb-3">添加单个单词到个人词库</h2>
      
      <!-- 验证错误提示 -->
      <div v-if="validationError" class="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-3">
        {{ validationError }}
      </div>
      
      <!-- 表单：移动端垂直排列，桌面端水平排列 -->
      <div class="flex flex-col gap-2">
        <input
          v-model="newWord.spelling"
          @blur="newWord.spelling && validateWordSpellingOnly(newWord.spelling)"
          @input="onSpellingInput"
          placeholder="英文"
          class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none w-full text-base"
          :class="{'border-orange-500': validationError}"
        />
        <div class="flex gap-2">
          <select
            v-model="newWord.partOfSpeech"
            @change="onPartOfSpeechChange"
            class="w-28 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white text-sm flex-shrink-0"
          >
            <option v-for="item in partOfSpeechOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <input
              v-model="newWord.meaning"
              placeholder="中文"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-base"
            />
        </div>
        <button
          @click="addSingleWord"
          :disabled="addingWord || translating || !newWord.spelling || !newWord.meaning"
          class="w-full px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center text-base"
        >
          <svg v-if="addingWord || translating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ translating ? '获取中...' : (addingWord ? '添加中' : '直接添加') }}
        </button>
      </div>
      
      <!-- 例句展示 -->
      <div v-if="currentExample" class="mt-3 p-3 bg-blue-50 rounded-lg">
        <p class="text-xs text-blue-600 mb-1">例句来源: {{ currentExample.source }}</p>
        <p class="text-sm text-gray-800">{{ currentExample.sentence }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ currentExample.translation }}</p>
      </div>
      
      <!-- 百度翻译状态提示 -->
      <div v-if="!baiduConfig.available && newWord.spelling" class="mt-2 text-xs text-orange-600">
        提示：百度翻译API未配置，请手动输入中文释义或联系管理员配置
      </div>
      
      <p class="text-xs text-gray-400 mt-2">输入英文后选择词性，将自动获取中文释义和例句（需管理员配置百度翻译API）</p>
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
            @click="handleImportClick"
            :disabled="submitting || waitingForApiKey || showDeepseekPrompt || validatingWords"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            <svg v-if="submitting || waitingForApiKey || showDeepseekPrompt || validatingWords" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ getImportButtonText() }}
          </button>
        </div>

      </div>
    </div>


    <!-- Success Message -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-md max-h-[80vh] overflow-y-auto">
        <div class="text-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">导入完成</h3>
        </div>
        
        <!-- 成功信息 -->
        <div v-if="successCount > 0" class="mb-4 p-3 bg-green-50 rounded-lg">
          <p class="text-green-700">成功添加 {{ successCount }} 个单词</p>
        </div>
        
        <!-- 重复信息 -->
        <div v-if="duplicateWords.length > 0" class="mb-4">
          <p class="text-orange-600 font-medium mb-2">以下 {{ duplicateWords.length }} 个单词已存在（重复）：</p>
          <div class="max-h-40 overflow-y-auto border border-orange-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-orange-50 sticky top-0">
                <tr>
                  <th class="text-left py-2 px-3 font-medium text-orange-700">英文</th>
                  <th class="text-left py-2 px-3 font-medium text-orange-700">词性</th>
                </tr>

              </thead>
              <tbody class="divide-y divide-orange-100">
                <tr v-for="(word, index) in duplicateWords" :key="index" class="hover:bg-orange-50">
                  <td class="py-2 px-3 text-gray-700">{{ word.spelling }}</td>
                  <td class="py-2 px-3 text-gray-500">{{ word.partOfSpeech || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        <!-- 无效单词信息 -->
        <div v-if="invalidWords.length > 0" class="mb-4">
          <p class="text-red-600 font-medium mb-2">以下 {{ invalidWords.length }} 个单词拼写无效（已跳过）：</p>
          <div class="max-h-40 overflow-y-auto border border-red-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-red-50 sticky top-0">
                <tr>
                  <th class="text-left py-2 px-3 font-medium text-red-700">英文</th>
                </tr>

              </thead>
              <tbody class="divide-y divide-red-100">
                <tr v-for="(word, index) in invalidWords" :key="index" class="hover:bg-red-50">
                  <td class="py-2 px-3 text-gray-700">{{ word }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <button
          @click="showSuccess = false"
          class="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          确定
        </button>
      </div>
    </div>


    <!-- DeepSeek API 提示弹窗 -->
    <div v-if="showDeepseekPrompt" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          例句获取失败
        </h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-3">
            很抱歉，未能从 Dictionary API 获取到例句。系统可以通过 DeepSeek API 为您生成例句，用于背诵时的填空题型。
          </p>
          <p class="text-sm text-gray-600">
            如需启用此服务，请填写 DeepSeek API Key。此 Key 将存储在本地浏览器中，不会上传至服务器。
          </p>
        </div>
        
        <!-- API Key 输入 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">DeepSeek API Key</label>
          <input
            v-model="promptApiKey"
            type="password"
            placeholder="请输入 API Key"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            @keyup.enter="saveApiKeyAndContinue"
          />
        </div>
        
        <!-- 按钮组 -->
        <div class="flex space-x-3 mb-4">
          <button
            @click="openDeepseekWebsite"
            class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            申请 API Key
          </button>
          <button
            @click="saveApiKeyAndContinue"
            :disabled="testingApi"
            class="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm disabled:opacity-50"
          >
            {{ testingApi ? '测试中...' : '保存并继续' }}
          </button>
        </div>
        
        <!-- 不再提醒 -->
        <div class="flex items-center">
          <input
            v-model="noMorePrompt"
            type="checkbox"
            id="noMorePrompt"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label for="noMorePrompt" class="ml-2 text-sm text-gray-600">
            不再提醒
          </label>
        </div>
        
        <!-- 忽略按钮 -->
        <button
          @click="ignorePrompt"
          class="w-full mt-4 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          暂不需要，跳过
        </button>
      </div>
    </div>


    <!-- 单词验证结果弹窗 -->
    <div v-if="showValidationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[80vh] flex flex-col">
        
        <!-- 验证中加载状态 -->
        <div v-if="validatingWords" class="flex-1 flex flex-col items-center justify-center py-12">
          <svg class="w-12 h-12 text-primary-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75"fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 text-center">{{ validatingProgress || '正在验证单词...' }}</p>
          <p class="text-sm text-gray-400 mt-2">请稍候，不要关闭此窗口</p>
        </div>
        
        <!-- 验证完成结果 -->
        <div v-else class="flex flex-col flex-1 overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            单词验证结果（共 {{ wordValidationResults.length }} 个）
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

                
                <!-- 词性 -->
                <td class="py-2 px-3 text-gray-600">
                  {{ word.partOfSpeech || '-' }}
                </td>

                
                <!-- 中文释义 -->
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
                  <div v-if="editingWordIndex === index" class="flex space-x-1">
                    <button
                      @click="saveAndRevalidateWord(index)"
                      class="text-green-600 hover:text-green-800 text-xs font-medium"
                    >
                      验证
                    </button>
                    <button
                      @click="cancelEditWord"
                      class="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      取消
                    </button>
                  </div>
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
            {{ wordValidationResults.every(w => w.valid) ? '确认导入' : `导入有效单词 (${wordValidationResults.filter(w => w.valid).length})` }}
          </button>
        </div>

      </div>
    </div>

  </div>

</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWordStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { fetchWordData, testDeepSeekApi } from '@/utils/dictionaryService'
import { translateToChinese, checkBaiduTranslationAvailable } from '@/utils/baiduTranslate'


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
// 存储重复的单词列表
const duplicateWords = ref([])
// 无效单词列表
const invalidWords = ref([])
// 成功导入的数量
const successCount = ref(0)

// 验证弹窗相关
const showValidationModal = ref(false)
const wordValidationResults = ref([])
const validatingWords = ref(false)
const waitingForApiKey = ref(false)  // 等待API Key输入时显示加载状态
const validatingProgress = ref('')  // 验证进度文本
const editingWordIndex = ref(-1)
const editingWordText = ref('')
const validationListRef = ref(null)

// DeepSeek API 提示弹窗相关
const showDeepseekPrompt = ref(false)
const promptApiKey = ref('')
const noMorePrompt = ref(localStorage.getItem('smartmemo_no_deepseek_prompt') === 'true')
const pendingWords = ref([])  // 等待API Key的单词列表
const currentPromptWordIndex = ref(0)  // 当前处理的单词索引
const isSingleWordImport = ref(false)  // 是否是单个单词导入模式

// 从本地存储获取API Key
const deepseekApiKey = ref(localStorage.getItem('smartmemo_deepseek_key') || '')

const newWord = ref({
  spelling: '',
  partOfSpeech: '',
  meaning: '',
  phonetic: ''
})

// 用户分配的词库
const assignedCategories = ref([])

// 教师分配单词数
const assignedWordsCount = ref(0)

// 个人词库单词数量
const customWordCount = ref(0)

// 统计数据加载状态
const statsLoading = ref(true)

// ========== 百度翻译相关状态 ==========
const baiduConfig = ref({ available: false, appid: '', secret: '', message: '检查中...' })
const translating = ref(false)

// 防抖定时器
let spellingInputTimer = null

// 词性映射：Dictionary API返回的词性 -> 用户友好的词性
const dictionaryPOSMapping = {
  'noun': 'n.', 'verb': 'v.', 'transitive verb': 'vt.', 'intransitive verb': 'vi.',
  'adjective': 'adj.', 'adverb': 'adv.', 'pronoun': 'pron.', 'numeral': 'num.',
  'conjunction': 'conj.', 'preposition': 'prep.', 'interjection': 'int.'
}

// 默认词性选项
const defaultPartOfSpeechOptions = [
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

// 动态词性选项
const dynamicPartOfSpeechOptions = ref([])

// 计算属性：当前使用的词性选项
const partOfSpeechOptions = computed(() => {
  if (dynamicPartOfSpeechOptions.value.length > 0) {
    return [{ value: '', label: '请选择' }, ...dynamicPartOfSpeechOptions.value]
  }
  return defaultPartOfSpeechOptions
})

// 加载百度翻译配置
const loadBaiduConfig = async () => {
  const result = await checkBaiduTranslationAvailable()
  baiduConfig.value = {
    available: result.available,
    appid: result.appid || '',
    secret: result.secret || '',
    message: result.message
  }
}

// 从Dictionary API获取词性列表
const fetchPartOfSpeechList = async (spelling) => {
  if (!spelling || !spelling.trim()) {
    dynamicPartOfSpeechOptions.value = []
    return
  }
  
  const cleanWord = spelling.trim().toLowerCase()
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
    
    if (!response.ok) {
      dynamicPartOfSpeechOptions.value = []
      return
    }
    
    const data = await response.json()
    if (!data || !data[0] || !data[0].meanings) {
      dynamicPartOfSpeechOptions.value = []
      return
    }
    
    // 提取所有词性并去重
    const posSet = new Set()
    for (const meaning of data[0].meanings) {
      if (meaning.partOfSpeech) {
        const mappedPOS = dictionaryPOSMapping[meaning.partOfSpeech.toLowerCase()]
        if (mappedPOS) {
          posSet.add(mappedPOS)
        }
      }
    }
    
    // 转换为选项格式
    const labelMap = {
      'n.': '名词 (n.)', 'v.': '动词 (v.)', 'vt.': '及物动词 (vt.)',
      'vi.': '不及物动词 (vi.)', 'adj.': '形容词 (adj.)', 'adv.': '副词 (adv.)',
      'pron.': '代词 (pron.)', 'num.': '数词 (num.)', 'conj.': '连词 (conj.)',
      'prep.': '介词 (prep.)', 'int.': '感叹词 (int.)'
    }
    
    const posOptions = [...posSet].map(pos => ({
      value: pos,
      label: labelMap[pos] || pos
    }))
    
    // 按固定顺序排序
    const order = ['n.', 'v.', 'vt.', 'vi.', 'adj.', 'adv.', 'pron.', 'num.', 'conj.', 'prep.', 'int.']
    posOptions.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value))
    
    dynamicPartOfSpeechOptions.value = posOptions
  } catch (error) {
    console.error('获取词性列表失败:', error)
    dynamicPartOfSpeechOptions.value = []
  }
}

// 英文输入时获取词性列表（带防抖）
const onSpellingInput = () => {
  // 清除之前的定时器
  if (spellingInputTimer) {
    clearTimeout(spellingInputTimer)
  }
  
  if (newWord.value.spelling && newWord.value.spelling.trim()) {
    // 设置新的定时器，延迟 500ms 后再调用 API
    spellingInputTimer = setTimeout(async () => {
      await fetchPartOfSpeechList(newWord.value.spelling)
    }, 500)
  } else {
    dynamicPartOfSpeechOptions.value = []
  }
}

// 处理翻译按钮点击
const handleTranslate = async () => {
  if (!newWord.value.spelling || !newWord.value.partOfSpeech) {
    return
  }
  
  if (!baiduConfig.value.available) {
    alert('百度翻译API未配置，请联系管理员配置或在下方手动输入中文释义')
    return
  }
  
  translating.value = true
  
  try {
    // 直接调用，Edge Function 会自动从数据库获取配置
    const result = await translateToChinese(newWord.value.spelling)
    
    if (result.success) {
      newWord.value.meaning = result.translation
    } else {
      console.error('翻译失败:', result.error)
      if (result.error && (result.error.includes('余额不足') || result.error.includes('频率') || result.error.includes('配额'))) {
        alert('百度翻译API额度已用尽，请手动输入中文释义')
      } else {
        alert('翻译失败: ' + result.error)
      }
    }
  } catch (error) {
    console.error('翻译请求失败:', error)
    alert('翻译请求失败，请手动输入中文释义')
  } finally {
    translating.value = false
  }
}

// 加载用户分配的词库
const loadUserAssignedCategories = async () => {
  if (!authStore.user) return
  
  statsLoading.value = true
  
  try {
    // 首先尝试从 user_learning_plans 表获取学习计划（与Dashboard保持一致）
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('user_learning_plans')
      .select('category, daily_limit')
      .eq('user_id', authStore.user.id)
      .eq('status', 'active')
    
    // 如果有学习计划，使用它
    if (!plansError && plans && plans.length > 0) {
      // 提取所有分配的词库分类
      const assignedCats = [...new Set(plans.map(p => p.category))]
      assignedCategories.value = assignedCats
      
      // 统计教师分配的所有词库的单词总数
      let wordCount = 0
      for (const cat of assignedCats) {
        const { count } = await supabaseAdmin
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat)
        wordCount += count || 0
      }
      assignedWordsCount.value = wordCount
      
      // 获取个人词库单词数量
      const { count } = await supabaseAdmin
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'custom')
        .eq('created_by', authStore.user.id)
      customWordCount.value = count || 0
      
      statsLoading.value = false
      return
    }
    
    // 没有学习计划时，不显示教师分配的词库和单词数
    assignedCategories.value = []
    assignedWordsCount.value = 0
    
    // 获取个人词库单词数量 - 使用supabaseAdmin确保数据一致性
    const { count } = await supabaseAdmin
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'custom')
      .eq('created_by', authStore.user.id)
    
    customWordCount.value = count || 0
  } catch (error) {
    console.error('加载用户词库失败:', error)
    assignedCategories.value = []
    assignedWordsCount.value = 0
    customWordCount.value = 0
  } finally {
    statsLoading.value = false
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

// 显示DeepSeek API提示弹窗
const showDeepseekPromptModal = (words, currentIndex) => {
  pendingWords.value = words
  currentPromptWordIndex.value = currentIndex
  promptApiKey.value = ''
  waitingForApiKey.value = true  // 显示按钮加载状态
  validatingWords.value = true   // 确保按钮显示加载动画
  showDeepseekPrompt.value = true
}

// 保存API Key并继续验证
const saveApiKeyAndContinue = async () => {
  const apiKey = promptApiKey.value.trim()
  if (!apiKey) {
    alert('请输入 API Key')
    return
  }
  
  // 测试API Key
  testingApi.value = true
  try {
    const result = await testDeepSeekApi(apiKey)
    if (!result.success) {
      alert(`❌ ${result.message}`)
      testingApi.value = false
      return
    }
    
    // 保存到本地存储
    localStorage.setItem('smartmemo_deepseek_key', apiKey)
    deepseekApiKey.value = apiKey
    
    // 关闭弹窗，设置提交状态为true保持按钮禁用，直到验证完成
    showDeepseekPrompt.value = false
    waitingForApiKey.value = false
    submitting.value = true
    
    // 继续处理剩余单词
    if (pendingWords.value.length > 0) { await continueValidationWithApi() } else if (newWord.value.spelling && newWord.value.partOfSpeech) { await onPartOfSpeechChange() }
    
  } catch (error) {
    console.error('保存 API Key 失败:', error)
    alert('保存失败，请重试')
  } finally {
    testingApi.value = false
    submitting.value = false
  }
}

// 继续验证（使用API Key）
const continueValidationWithApi = async () => {
  validatingWords.value = true
  
  try {
    const results = await validateWordsListWithApi(pendingWords.value, currentPromptWordIndex.value)
    wordValidationResults.value = results
    
    const validCount = results.filter(w => w.valid).length
    const invalidCount = results.filter(w => !w.valid).length
    
    if (invalidCount > 0) {
      showValidationModal.value = true
    } else {
      await doImport(results)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    await doImport(pendingWords.value)
  } finally {
    validatingWords.value = false
    submitting.value = false
  }
}

// 忽略提示
const ignorePrompt = async () => {
  if (noMorePrompt.value) {
    localStorage.setItem('smartmemo_no_deepseek_prompt', 'true')
  }
  showDeepseekPrompt.value = false
  waitingForApiKey.value = false
  // 设置提交状态为true保持按钮禁用，直到验证完成
  submitting.value = true
  // 不使用API Key继续验证
  if (pendingWords.value.length > 0) { await continueValidationWithoutApi() }
}

// 不使用API Key继续验证
const continueValidationWithoutApi = async () => {
  validatingWords.value = true
  
  try {
    const results = await validateWordsList(pendingWords.value)
    wordValidationResults.value = results
    
    const invalidCount = results.filter(w => !w.valid).length
    
    if (invalidCount > 0) {
      showValidationModal.value = true
    } else {
      await doImport(results)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    await doImport(pendingWords.value)
  } finally {
    validatingWords.value = false
    submitting.value = false
  }
}

// 打开DeepSeek官网
const openDeepseekWebsite = () => {
  window.open('https://platform.deepseek.com/', '_blank')
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
        source: wordData.exampleSource === 'deepseek' ? 'DeepSeek' : 'Dictionary API',
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

// 仅验证单词拼写（不获取例句）
const validateWordSpellingOnly = async (spelling) => {
  if (!spelling || !spelling.trim()) {
    return { valid: false, message: '请输入单词' }
  }


  validationError.value = ''

  try {
    // 验证拼写
    const validation = await wordStore.validateWordSpelling(spelling)
    
    if (!validation.valid) {
      validationError.value = validation.message
      return validation
    }
    
    return validation
  } catch (error) {
    console.error('验证失败:', error)
    validationError.value = '验证失败，请重试'
    return { valid: false, message: '验证失败' }
  }
}

// 词性选择变化时自动获取中文释义、例句和音标
const onPartOfSpeechChange = async () => {
  // 如果没有选择词性或没有单词，则不获取
  if (!newWord.value.partOfSpeech || !newWord.value.spelling) {
    return
  }
  
  // 先验证单词拼写（如果没有验证过）
  const spelling = newWord.value.spelling.trim()
  if (!spelling) {
    return
  }
  
  // 设置加载状态
  newWord.value.meaning = '...'
  currentExample.value = null
  
  // 自动获取中文释义（百度翻译）
  if (baiduConfig.value.available) {
    translating.value = true
    try {
      const result = await translateToChinese(spelling)
      if (result.success) {
        newWord.value.meaning = result.translation
      } else {
        newWord.value.meaning = '翻译失败，请手动输入'
      }
    } catch (error) {
      console.error('自动翻译失败:', error)
      newWord.value.meaning = '翻译失败，请手动输入'
    } finally {
      translating.value = false
    }
  }
  
  // 获取例句和音标（优先Dictionary API，后DeepSeek）
  try {
    const apiKey = localStorage.getItem('smartmemo_deepseek_key')
    const wordData = await fetchWordData(spelling, apiKey, newWord.value.partOfSpeech)
    
    // 获取音标（如果还没有）
    if (wordData?.phonetic && !newWord.value.phonetic) {
      newWord.value.phonetic = wordData.phonetic
    }
    
    // 优先从Dictionary API获取例句
    if (wordData?.example) {
      currentExample.value = {
        source: wordData.exampleSource === 'deepseek' ? 'DeepSeek' : 'Dictionary API',
        sentence: wordData.example,
        translation: ''
      }
    } else if (apiKey && wordData?.meaning) {
      // 有DeepSeek API Key，使用DeepSeek生成例句
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
    } else if (!wordData?.example && !apiKey) {
      // 没有从Dictionary API获取到例句，且没有DeepSeek API Key，弹出提示
      // 显示已有的DeepSeek提示弹窗
      showExamplePromptModal()
    }
  } catch (error) {
    console.error('获取例句失败:', error)
    currentExample.value = null
  }
}

// 显示例句提示弹窗
const showExamplePromptModal = () => {
  promptApiKey.value = ''
  showDeepseekPrompt.value = true
}

const openImportModal = () => {
  showImportModal.value = true
  parsedWords.value = []
}


const closeImportModal = () => {
  showImportModal.value = false
  parsedWords.value = []
  if (importFileInput.value) importFileInput.value.value = ''
  // 不在这里清除duplicateWords，因为需要显示在成功弹窗中
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
    
    // 构建要保存的单词数据，包含例句和音标
    const wordData = {
      spelling: newWord.value.spelling,
      partOfSpeech: newWord.value.partOfSpeech,
      meaning: newWord.value.meaning,
      phonetic: newWord.value.phonetic || null,
      example_sentence: currentExample.value?.sentence || null
    }
    
    // 直接添加到数据库，使用 'custom' 分类
    const result = await wordStore.addCustomWordsBatch([wordData])
    
    if (result.successCount > 0) {
      alert(`✅ 单词 "${newWord.value.spelling}" 添加成功！`)
      newWord.value = { spelling: '', partOfSpeech: '', meaning: '', phonetic: '' }
      validationError.value = ''
      currentExample.value = null
      dynamicPartOfSpeechOptions.value = []
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

// 获取导入按钮文字
const getImportButtonText = () => {
  if (validatingWords.value) {
    return '验证中...'
  }
  if (showDeepseekPrompt.value) {
    return '请在弹窗中操作...'
  }
  if (waitingForApiKey.value) {
    return '处理中...'
  }
  if (submitting.value) {
    return '导入中...'
  }
  return '导入 ' + parsedWords.value.length + ' 个单词'
}

// 处理导入按钮点击 - 支持自动继续执行
const handleImportClick = async () => {
  // 如果正在等待API Key处理中，不允许重复点击
  if (waitingForApiKey.value) {
    return
  }
  
  // 如果弹窗已经显示，说明用户已经点击过一次
  // 检查是否有API Key，如果有则继续验证，否则跳过
  if (showDeepseekPrompt.value) {
    const apiKey = promptApiKey.value.trim()
    if (apiKey) {
      await saveApiKeyAndContinue()
    } else {
      await ignorePrompt()
    }
    return
  }
  
  // 首次点击，执行正常流程
  await submitWords()
}

const submitWords = async () => {
  if (parsedWords.value.length === 0) {
    alert('请先添加单词')
    return
  }


  // 先验证单词 - 设置等待状态
  validatingWords.value = true
  pendingWords.value = parsedWords.value
  
  try {
    // 检查是否需要弹出API提示（没有API Key且没有选择不再提醒）
    const hasApiKey = !!localStorage.getItem('smartmemo_deepseek_key')
    const noPrompt = noMorePrompt.value
    
    // 如果没有API Key且没有选择不再提醒，先检查是否有例句获取失败的情况
    let exampleFetchFailed = false
    if (!hasApiKey && !noPrompt) {
      validatingProgress.value = '正在检查例句资源...'
      exampleFetchFailed = await checkExampleAvailability(parsedWords.value)
    }
    
    if (exampleFetchFailed) {
      // 弹出DeepSeek API提示，保持loading状态
      showDeepseekPromptModal(parsedWords.value, 0)
      // 保持 waitingForApiKey 为 true，按钮保持禁用状态
      // 注意：这里不返回，继续保持等待状态
      return
    }
    
    // 正常验证
    validatingWords.value = true
    const results = await validateWordsList(parsedWords.value)
    wordValidationResults.value = results
    
    const validCount = results.filter(w => w.valid).length
    const invalidCount = results.filter(w => !w.valid).length
    
    if (invalidCount > 0) {
      // 有无效单词，显示验证弹窗
      showValidationModal.value = true
    } else {
      // 全部有效，直接导入
      await doImport(results)
    }
  } catch (error) {
    console.error('验证单词失败:', error)
    alert('验证失败: ' + error.message + '\n将直接导入所有单词。')
    // 验证失败时也允许直接导入
    await doImport(parsedWords.value)
  } finally {
    validatingWords.value = false
    waitingForApiKey.value = false
    submitting.value = false
  }
}

// 检查单词是否有例句资源可用
const checkExampleAvailability = async (words) => {
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  let hasFailed = false
  
  // 只检查前5个单词，避免检查太慢
  const checkCount = Math.min(words.length, 5)
  
  for (let i = 0; i < checkCount; i++) {
    const word = words[i]
    const spelling = word.spelling ? word.spelling.trim() : ''
    if (!spelling) continue
    
    const cleanWord = spelling.toLowerCase()
    
    try {
      const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data[0] && data[0].meanings) {
          // 检查是否有例句
          let hasExample = false
          for (const meaning of data[0].meanings) {
            if (meaning.definitions && meaning.definitions.some(def => def.example)) {
              hasExample = true
              break
            }
          }
          if (!hasExample) {
            hasFailed = true
            break
          }
        } else {
          hasFailed = true
          break
        }
      } else {
        hasFailed = true
        break
      }
    } catch (error) {
      hasFailed = true
      break
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return hasFailed
}

// 带API Key的验证（当用户选择填写API Key时使用）
const validateWordsListWithApi = async (words, startIndex = 0) => {
  const results = []
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  const apiKey = localStorage.getItem('smartmemo_deepseek_key')
  const total = words.length
  
  validatingProgress.value = `正在验证 0/${total} 个单词...`
  
  for (let i = startIndex; i < words.length; i++) {
    const word = words[i]
    const spelling = word.spelling ? word.spelling.trim() : ''
    
    validatingProgress.value = `正在验证 ${i + 1}/${total} 个单词：${spelling || '(空)'}`
    
    if (!spelling) {
      results.push({ ...word, valid: false, reason: '单词为空' })
      continue
    }
    
    const cleanWord = spelling.toLowerCase()
    
    if (!/^[a-z\s\-]+$/.test(cleanWord)) {
      results.push({ ...word, valid: false, reason: '包含非法字符' })
      continue
    }
    
    if (/[-]{2,}/.test(cleanWord)) {
      results.push({ ...word, valid: false, reason: '包含连续连字符' })
      continue
    }
    
    if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
      results.push({ ...word, valid: false, reason: '以连字符开头或结尾' })
      continue
    }
    
    if (cleanWord.length < 2) {
      results.push({ ...word, valid: false, reason: '单词太短' })
      continue
    }
    
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
      results.push({ ...word, valid: true, warning: '验证出错' })
    }
    
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  validatingProgress.value = '验证完成！'
  
  return results
}

// 执行导入
const doImport = async (wordsToImport) => {
  submitting.value = true
  duplicateWords.value = []
  invalidWords.value = []
  successCount.value = 0
  
  try {
    const result = await wordStore.addCustomWordsBatch(wordsToImport)
    successCount.value = result.successCount
    
    if (result.results && result.results.duplicates) {
      duplicateWords.value = result.results.duplicates.map(d => {
        const match = d.match(/^(.+?)（(.+?)）$/)
        if (match) {
          return {
            spelling: match[1],
            partOfSpeech: match[2] === '未标注词性' ? '' : match[2]
          }
        }
        return { spelling: d, partOfSpeech: '' }
      })
    }
    
    if (result.results && result.results.invalid) {
      invalidWords.value = result.results.invalid
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


// 验证单词列表
const validateWordsList = async (words) => {
  const results = []
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  const total = words.length
  
  // 设置初始进度文本
  validatingProgress.value = `正在验证 0/${total} 个单词...`
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const spelling = word.spelling ? word.spelling.trim() : ''
    
    // 更新进度
    validatingProgress.value = `正在验证 ${i + 1}/${total} 个单词：${spelling || '(空)'}`
    
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
      results.push({ ...word, valid: true, warning: '验证出错' })
    }
    
    // 添加延迟避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  // 验证完成
  validatingProgress.value = '验证完成！'
  
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

// 重新验证并保存
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
  
  if (/[-]{2,}/.test(cleanWord)) {
    alert('单词不能包含连续连字符')
    return
  }
  
  if (cleanWord.startsWith('-') || cleanWord.endsWith('-')) {
    alert('单词不能以连字符开头或结尾')
    return
  }
  
  if (cleanWord.length < 2) {
    alert('单词太短')
    return
  }
  
  // 重新验证单词
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en'
  
  try {
    const response = await fetch(`${DICTIONARY_API}/${encodeURIComponent(cleanWord)}`)
    
    if (response.status === 404 || !response.ok) {
      wordValidationResults.value[index] = {
        ...wordValidationResults.value[index],
        spelling: newSpelling,
        valid: false,
        reason: '字典中未找到（拼写错误）'
      }
    } else {
      const data = await response.json()
      if (!data || !data[0] || !data[0].meanings || data[0].meanings.length === 0) {
        wordValidationResults.value[index] = {
          ...wordValidationResults.value[index],
          spelling: newSpelling,
          valid: false,
          reason: '字典中未找到'
        }
      } else {
        wordValidationResults.value[index] = {
          ...wordValidationResults.value[index],
          spelling: newSpelling,
          valid: true,
          phonetic: data[0].phonetic || null
        }
      }
    }
  } catch (error) {
    wordValidationResults.value[index] = {
      ...wordValidationResults.value[index],
      spelling: newSpelling,
      valid: true,
      warning: '验证出错'
    }
  }
  
  editingWordIndex.value = -1
  editingWordText.value = ''
}

// 确认导入（只导入有效单词）
const confirmImport = async () => {
  const validWords = wordValidationResults.value.filter(w => w.valid)
  showValidationModal.value = false
  await doImport(validWords)
}

// 强制导入全部
const forceImportAll = async () => {
  if (!confirm('确定要导入全部单词吗？包含拼写错误的单词可能会导致学习问题。')) {
    return
  }
  showValidationModal.value = false
  await doImport(wordValidationResults.value)
}

// 取消导入
const cancelImport = () => {
  showValidationModal.value = false
  wordValidationResults.value = []
}

// 初始化
onMounted(() => {
  loadUserAssignedCategories()
  loadBaiduConfig()
})


// 监听 DeepSeek 弹窗关闭事件，当弹窗关闭时自动继续执行
watch(showDeepseekPrompt, (newVal, oldVal) => {
  // 如果弹窗从显示变为隐藏，且之前正在等待 API Key
  if (oldVal === true && newVal === false && waitingForApiKey.value) {
    // 弹窗已关闭，检查是否有 API Key，如果有则继续验证，否则跳过
    const apiKey = promptApiKey.value.trim()
    if (apiKey) {
      saveApiKeyAndContinue()
    } else {
      ignorePrompt()
    }
  }
})
</script>






