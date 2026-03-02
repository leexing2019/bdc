<template>
  <div class="min-h-[calc(100dvh-8rem)] mobile-content-pb lg:pb-0">
    <!-- 复习提示弹窗 -->
    <div v-if="showReviewPrompt" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div class="text-center">
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">复习时间到！</h3>
          <p class="text-gray-600 mb-6">
            今日的任务已完成，不再进行新词的背诵，现在即将进行复习流程。
          </p>
          <button
            @click="confirmReview"
            class="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            开始复习
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
        {{ isPreviewMode ? '预习' : '单词背诵' }}
      </h1>
      <!-- 模式指示器 -->
      <div class="flex items-center space-x-2">
        <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          {{ isPreviewMode ? '预习模式' : modeLabel }}
        </span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full h-2 bg-gray-200 rounded-full mb-6">
      <div
        class="h-full bg-primary-500 rounded-full transition-all duration-300 progress-animate"
        :style="{ width: isPreviewMode ? `${previewProgress}%` : `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Empty State -->
    <div v-if="wordStore.todayWords.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">暂无计划</h2>
      <p class="text-gray-500 mb-6">暂未分配学习任务，请联系教师分配或导入个人词库</p>
      <router-link
        to="/student/dashboard"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        返回主页
      </router-link>
    </div>

    <!-- Session Completed State -->
    <div v-else-if="isSessionCompleted" class="flex flex-col items-center justify-center py-16">
      <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">本轮完成！</h2>
      
      <!-- 学习统计 -->
      <div class="bg-gray-50 rounded-xl p-6 mb-6 w-full max-w-md">
        <p class="text-center text-gray-500 mb-4">今日学习表现</p>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-gray-800">{{ sessionStats.total }}</p>
            <p class="text-sm text-gray-500">总题数</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600">{{ sessionStats.correct }}</p>
            <p class="text-sm text-gray-500">掌握</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-500">{{ sessionStats.wrong }}</p>
            <p class="text-sm text-gray-500">还需努力</p>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <button
          @click="continueStudy"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          复习巩固
        </button>
        <router-link
          to="/student/dashboard"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          返回主页
        </router-link>
      </div>
    </div>

    <!-- Preview/Preheat Mode (Flashcard) -->
    <div v-else-if="isPreviewMode" class="max-w-2xl mx-auto">
      <!-- Preview Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-2">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          预习环节
        </div>
        <p class="text-gray-500 text-sm">快速浏览今日单词，先混个脸熟~</p>
      </div>

      <!-- Preview Progress -->
      <div class="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div
          class="h-full bg-amber-500 rounded-full transition-all duration-300"
          :style="{ width: `${previewProgress}%` }"
        ></div>
      </div>

    <!-- Preview Card -->
    <div v-if="!isPreviewComplete && previewWord" class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div class="text-center">
        <div class="text-sm text-gray-400 mb-4">
          {{ previewIndex + 1 }} / {{ wordStore.todayWords.length }}
        </div>

        <!-- Word (front of card) -->
        <div v-if="!previewShowAnswer" class="animate-fade-in">
          <button
            @click="playPronunciation(previewWord)"
            class="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition"
            :disabled="isPlayingAudio"
          >
            <!-- Loading spinner -->
            <svg v-if="isPlayingAudio" class="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <!-- Speaker icon -->
            <svg v-else class="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{{ previewWord?.spelling }}</h2>
          <p v-if="previewWord?.phonetic" class="text-gray-400 mb-4 sm:mb-6">{{ previewWord?.phonetic }}</p>
          
          <button
            @click="previewShowAnswer = true"
            class="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm sm:text-base"
          >
            点击查看释义
          </button>
        </div>

        <!-- Meaning (back of card) -->
        <div v-else class="animate-fade-in">
          <p class="text-base sm:text-lg text-gray-600 mb-2">{{ previewWord?.part_of_speech }}</p>
          <p class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">{{ previewWord?.meaning }}</p>
          
          <p v-if="previewWord?.example_sentence" class="text-xs sm:text-sm text-gray-500 italic mb-4 sm:mb-6">
            {{ previewWord?.example_sentence }}
          </p>

          <div class="flex justify-center space-x-3">
            <button
              @click="previewShowAnswer = false"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              返回
            </button>
            <button
              @click="nextPreviewWord"
              class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
            >
              下一个
            </button>
          </div>
        </div>
        </div>
      </div>

      <!-- Preview Complete -->
      <div v-if="isPreviewComplete" class="mt-6 text-center animate-fade-in">
        <div class="bg-green-50 rounded-xl p-6 mb-4">
          <svg class="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-700 font-medium">预习完成！</p>
        </div>
        
        <button
          @click="startStudy"
          class="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-medium"
        >
          开始练习 →
        </button>
        
        <button
          @click="skipPreview"
          class="block w-full mt-3 text-gray-400 hover:text-gray-600 text-sm"
        >
          跳过预习，直接练习
        </button>
      </div>

      <!-- Skip Preview Button (when not complete) -->
      <div v-else class="mt-4 text-center">
        <button
          @click="skipPreview"
          class="text-gray-400 hover:text-gray-600 text-sm"
        >
          跳过预习，直接练习 →
        </button>
      </div>
    </div>

    <!-- Study Content -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Mode Badge -->
      <div class="flex justify-center mb-4 space-x-2">
        <span
          class="px-4 py-1 rounded-full text-sm font-medium"
          :class="currentWord?.isNew ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
        >
          {{ currentWord?.isNew ? '新词' : '复习' }}
        </span>
        <!-- 来源标签 -->
        <span
          v-if="currentWord?.source"
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="currentWord.source === 'institution' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
        >
          {{ currentWord.source === 'institution' ? '机构添加' : '自主添加' }}
        </span>
      </div>

      <!-- Mode: Recall (识记模式) - 看英文说中文 -->
      <div v-if="studyMode === 'recall'" class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div class="text-center">
          <button
            @click="playPronunciation(currentWord)"
            class="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition"
            :disabled="isPlayingAudio"
          >
            <!-- Loading spinner -->
            <svg v-if="isPlayingAudio" class="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <!-- Speaker icon -->
            <svg v-else class="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{{ currentWord?.spelling }}</h2>
          <p v-if="currentWord?.phonetic" class="text-gray-400 mb-2">{{ currentWord?.phonetic }}</p>
          <p v-if="currentWord?.part_of_speech" class="text-gray-500 mb-4 sm:mb-6">{{ currentWord?.part_of_speech }}</p>
          
          <button
            @click="showAnswer = true"
            v-if="!showAnswer"
            class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm sm:text-base"
          >
            显示答案
          </button>
          
          <div v-else class="mt-4 sm:mt-6 animate-fade-in">
            <p class="text-base sm:text-lg text-gray-600 mb-2">{{ currentWord?.part_of_speech }}</p>
            <p class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">{{ currentWord?.meaning }}</p>
            
            <p v-if="currentWord?.example_sentence" class="text-xs sm:text-sm text-gray-500 italic mb-4 sm:mb-6">
              {{ currentWord?.example_sentence }}
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div v-if="showAnswer" class="mt-6 sm:mt-8">
          <p class="text-center text-gray-500 mb-4 text-sm">你对这个单词的掌握程度是？</p>
          <div class="grid grid-cols-3 gap-2 sm:gap-4">
            <button
              @click="handleResponse(1)"
              :disabled="isTransitioning"
              class="flex flex-col items-center p-3 sm:p-4 bg-red-50 hover:bg-red-100 rounded-xl transition disabled:opacity-50"
            >
              <span class="text-red-700 font-medium text-sm sm:text-base">不认识</span>
            </button>
            <button
              @click="handleResponse(3)"
              :disabled="isTransitioning"
              class="flex flex-col items-center p-3 sm:p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition disabled:opacity-50"
            >
              <span class="text-yellow-700 font-medium text-sm sm:text-base">模糊</span>
            </button>
            <button
              @click="handleResponse(5)"
              :disabled="isTransitioning"
              class="flex flex-col items-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-xl transition disabled:opacity-50"
            >
              <span class="text-green-700 font-medium text-sm sm:text-base">认识</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mode: Dictation (默写模式) - 看中文默写英文 -->
      <div v-else-if="studyMode === 'dictation'" class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">请默写出这个单词</p>
          
          <div class="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4">
            <p class="text-lg sm:text-2xl font-semibold text-gray-800">{{ currentWord?.meaning }}</p>
            <p v-if="currentWord?.phonetic" class="text-gray-400 mt-2">{{ currentWord?.phonetic }}</p>
          </div>
          
          <input
            ref="dictationInput"
            v-model="dictationAnswer"
            type="text"
            @keyup.enter="checkDictation"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-lg sm:text-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
            placeholder="请输入英文单词"
            :disabled="dictationResult !== null"
          />
          
          <!-- Result Feedback -->
          <div v-if="dictationResult !== null" class="mb-4 animate-fade-in">
            <div v-if="dictationResult" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-2xl font-bold mt-2">{{ currentWord?.spelling }}</p>
            </div>
          </div>
          
          <button
            v-if="dictationResult === null"
            @click="checkDictation"
            :disabled="isTransitioning"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            提交
          </button>
          <button
            v-if="dictationResult === null"
            @click="skipDictation"
            :disabled="isTransitioning"
            class="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition ml-3 disabled:opacity-50"
          >
            不确定
          </button>
          <button
            v-else
            @click="nextWord"
            :disabled="isTransitioning"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <span v-if="isTransitioning" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载中...
            </span>
            <span v-else>{{ isLastWord ? '结束答题' : '下一个' }}</span>
          </button>
        </div>
      </div>

      <!-- Mode: POS (词性选择) -->
      <div v-else-if="studyMode === 'pos'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-4">请选择正确的词性</p>
          
          <h2 class="text-4xl font-bold text-gray-800 mb-6">{{ currentWord?.spelling }}</h2>
          <p class="text-xl text-gray-600 mb-8">{{ currentWord?.meaning }}</p>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="pos in posOptions"
              :key="pos.value"
              @click="checkPOS(pos.value)"
              class="p-2 sm:p-4 rounded-xl border-2 transition text-sm sm:text-lg font-medium"
              :class="getPOSButtonClass(pos.value)"
              :disabled="posResult !== null"
            >
              {{ pos.label }}
            </button>
          </div>
          
          <!-- Result Feedback -->
          <div v-if="posResult !== null" class="mt-6 animate-fade-in">
            <div v-if="posResult" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-xl font-bold mt-2">{{ currentWord?.part_of_speech }}</p>
            </div>
            
            <button
              @click="nextWord"
              :disabled="isTransitioning"
              class="mt-4 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <span v-if="isTransitioning" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
              </span>
              <span v-else>{{ isLastWord ? '结束答题' : '下一个' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mode: Cloze (填空模式) -->
      <div v-else-if="studyMode === 'cloze'" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-4">请填写空白处的单词</p>
          
          <!-- Loading State -->
          <div v-if="clozeLoading" class="bg-gray-50 rounded-xl p-6 mb-6">
            <div class="flex items-center justify-center">
              <svg class="animate-spin h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-500">加载例句中...</span>
            </div>
          </div>
          
          <!-- Cloze Sentence -->
          <div v-else class="bg-gray-50 rounded-xl p-6 mb-6">
            <p class="text-lg text-gray-800 leading-relaxed">
              {{ clozeSentence }}
            </p>
          </div>
          
          <p class="text-gray-500 mb-4">中文释义：{{ currentWord?.meaning }}</p>
          
          <input
            v-model="clozeAnswer"
            type="text"
            @keyup.enter="checkCloze"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
            placeholder="请填写单词"
            :disabled="clozeResult !== null || clozeLoading"
          />
          
          <!-- Result Feedback -->
          <div v-if="clozeResult !== null" class="mb-4 animate-fade-in">
            <div v-if="clozeResult === true" class="flex items-center justify-center text-green-600">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">正确！</span>
            </div>
            <div v-else-if="clozeResult === 'hint'" class="text-yellow-600">
              <p class="font-medium">提示：根据例句时态，应填写变形形式</p>
              <p class="text-2xl font-bold mt-2">{{ clozeTargetForm }}</p>
            </div>
            <div v-else class="text-red-600">
              <p class="font-medium">错误，正确答案是：</p>
              <p class="text-2xl font-bold mt-2">{{ clozeTargetForm || currentWord?.spelling }}</p>
            </div>
          </div>
          
          <button
            v-if="clozeResult === null"
            @click="checkCloze"
            :disabled="isTransitioning || clozeLoading"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            提交
          </button>
          <button
            v-if="clozeResult === null"
            @click="skipCloze"
            :disabled="isTransitioning || clozeLoading"
            class="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition ml-3 disabled:opacity-50"
          >
            不确定
          </button>
          <button
            v-else
            @click="nextWord"
            :disabled="isTransitioning"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <span v-if="isTransitioning" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载中...
            </span>
            <span v-else>{{ isLastWord ? '结束答题' : '下一个' }}</span>
          </button>
        </div>
      </div>

      <!-- Progress Info -->
      <div class="text-center mt-6 text-gray-500">
        {{ currentIndex + 1 }} / {{ wordStore.todayWords.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useWordStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const wordStore = useWordStore()
const authStore = useAuthStore()

// 学习时长跟踪
const studyStartTime = ref(null) // 学习开始时间（包含预习）
const sessionNewWords = ref(0) // 本轮学习的新词数
const sessionReviewedWords = ref(0) // 本轮学习的复习词数

// Preview mode states
const isPreviewMode = ref(true)
const isSessionCompleted = ref(false) // 学习完成状态
const previewIndex = ref(0)
const previewShowAnswer = ref(false)

// Study mode states
const studyMode = ref('recall')
const currentIndex = ref(0)
const showAnswer = ref(false)

// Audio playing state
const isPlayingAudio = ref(false)

// 切换单词时的加载状态
const isTransitioning = ref(false)

// 本次学习的统计
const sessionStats = ref({
  total: 0,
  correct: 0,
  wrong: 0,
  hint: 0
})

// 所有模式列表
const modes = ['recall', 'dictation', 'pos', 'cloze']
const modeLabels = {
  recall: '识记模式',
  dictation: '默写模式',
  pos: '词性选择',
  cloze: '填空模式'
}

// 当前模式标签
const modeLabel = computed(() => modeLabels[studyMode.value])

// 随机选择模式
const randomMode = () => {
  // 获取当前单词
  const word = currentWord.value?.spelling
  
  // 检查是否是短语（包含空格）
  const isPhrase = word && word.includes(' ')
  
  // 如果是短语，只能从3个模式中选择（排除 pos 词性选择）
  if (isPhrase) {
    const availableModes = ['recall', 'dictation', 'cloze']
    const randomIndex = Math.floor(Math.random() * availableModes.length)
    studyMode.value = availableModes[randomIndex]
    return
  }
  
  // 如果不是短语，正常4选1
  const randomIndex = Math.floor(Math.random() * modes.length)
  studyMode.value = modes[randomIndex]
}

// Dictation mode
const dictationAnswer = ref('')
const dictationResult = ref(null)

// POS mode - 扩展词性选项
const posOptions = [
  { value: 'n.', label: '名词 (n.)' },
  { value: 'v.', label: '动词 (v.)' },
  { value: 'vt.', label: '及物动词 (vt.)' },
  { value: 'vi.', label: '不及物动词 (vi.)' },
  { value: 'adj.', label: '形容词 (adj.)' },
  { value: 'adv.', label: '副词 (adv.)' },
  { value: 'prep.', label: '介词 (prep.)' },
  { value: 'pron.', label: '代词 (pron.)' },
  { value: 'conj.', label: '连词 (conj.)' },
  { value: 'num.', label: '数词 (num.)' }
]
const posResult = ref(null)

// Cloze mode
const clozeAnswer = ref('')
const clozeResult = ref(null)
const clozeExample = ref('')
const clozeTargetForm = ref('') // 例句中使用的正确变形形式
const clozeLoading = ref(false) // 例句加载状态

// 复习提示弹窗
const showReviewPrompt = ref(false)

// Fetch example sentence from Dictionary API
const fetchClozeExample = async (word) => {
  if (!word) return { example: '', targetForm: '' }
  
  // Check cache first
  if (exampleCache.has(word)) {
    return exampleCache.get(word)
  }
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!response.ok) return { example: '', targetForm: '' }
    
    const data = await response.json()
    if (!data || !data[0]) return { example: '', targetForm: '' }
    
    // Find example in the API response
    const meanings = data[0].meanings || []
    for (const meaning of meanings) {
      const definitions = meaning.definitions || []
      for (const def of definitions) {
        if (def.example) {
          // 提取例句中的正确变形形式
          const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
          const match = def.example.match(regex)
          const targetForm = match ? match[0] : ''
          
          const result = { example: def.example, targetForm }
          exampleCache.set(word, result)
          return result
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return { example: '', targetForm: '' }
}

// Load cloze example when word changes
const loadClozeExample = async () => {
  const word = currentWord.value?.spelling
  if (!word) return
  
  // Set loading state
  clozeLoading.value = true
  clozeExample.value = ''
  clozeTargetForm.value = ''
  
  try {
    // First try database example
    if (currentWord.value?.example_sentence) {
      clozeExample.value = currentWord.value.example_sentence
      // 尝试从数据库例句中提取变形
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
      const match = currentWord.value.example_sentence.match(regex)
      clozeTargetForm.value = match ? match[0] : ''
      clozeLoading.value = false
      return
    }
    
    // Then try Dictionary API
    const result = await fetchClozeExample(word)
    if (result.example) {
      clozeExample.value = result.example
      clozeTargetForm.value = result.targetForm
      clozeLoading.value = false
      return
    }
    
    // Fall back to blank
    clozeExample.value = ''
    clozeLoading.value = false
  } catch (e) {
    clozeLoading.value = false
  }
}

const currentWord = computed(() => wordStore.todayWords[currentIndex.value])

// 是否是最后一题
const isLastWord = computed(() => {
  return currentIndex.value === wordStore.todayWords.length - 1
})

const progressPercent = computed(() => {
  if (wordStore.todayWords.length === 0) return 100
  return ((currentIndex.value) / wordStore.todayWords.length) * 100
})

// Preview mode computed
const previewWord = computed(() => wordStore.todayWords[previewIndex.value])
const previewProgress = computed(() => {
  if (wordStore.todayWords.length === 0) return 100
  // 使用 previewIndex + 1 因为显示是从1开始的
  return ((previewIndex.value + 1) / wordStore.todayWords.length) * 100
})
const isPreviewComplete = computed(() => previewIndex.value >= wordStore.todayWords.length)

const startStudy = () => {
  // 检查是否已完成新词任务，如果是，显示复习提示
  if (wordStore.newWordsCompleted) {
    showReviewPrompt.value = true
    return
  }
  isPreviewMode.value = false
  isSessionCompleted.value = false
  currentIndex.value = 0
  randomMode()
}

// 确认开始复习
const confirmReview = () => {
  showReviewPrompt.value = false
  isPreviewMode.value = false
  isSessionCompleted.value = false
  currentIndex.value = 0
  randomMode()
}

const nextPreviewWord = () => {
  previewShowAnswer.value = false
  previewIndex.value++
}

const skipPreview = () => {
  // 检查是否已完成新词任务，如果是，显示复习提示
  if (wordStore.newWordsCompleted) {
    showReviewPrompt.value = true
    return
  }
  isPreviewMode.value = false
  currentIndex.value = 0
  randomMode()
}

// Cache for example sentences
const exampleCache = new Map()

const clozeSentence = computed(() => {
  const word = currentWord.value?.spelling || ''
  
  // If we have a fetched example, use it
  if (clozeExample.value) {
    // 尝试用单词边界匹配，处理变形形式
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
    const match = clozeExample.value.match(regex)
    if (match) {
      return clozeExample.value.replace(regex, '______')
    }
    // 如果没找到匹配，返回原句加提示
    return clozeExample.value
  }
  
  // If word has example sentence in database, use it
  if (currentWord.value?.example_sentence) {
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
    const match = currentWord.value.example_sentence.match(regex)
    if (match) {
      return currentWord.value.example_sentence.replace(regex, '______')
    }
    return currentWord.value.example_sentence
  }
  
  // Otherwise, use a better fallback based on meaning
  const meaning = currentWord.value?.meaning || ''
  
  // Better context-aware templates based on meaning keywords
  if (meaning.includes('重要') || meaning.includes('关键')) {
    return `This concept is ______ and essential for understanding.`
  }
  if (meaning.includes('学习') || meaning.includes('学校')) {
    return `I need to ______ my lessons before the exam.`
  }
  if (meaning.includes('工作') || meaning.includes('职业')) {
    return `She decided to ______ in this field.`
  }
  if (meaning.includes('时间')) {
    return `We don't have much ______ to finish this task.`
  }
  if (meaning.includes('人') || meaning.includes('者')) {
    return `The ______ is very dedicated to their work.`
  }
  if (meaning.includes('做') || meaning.includes('进行')) {
    return `Let's ______ this together as a team.`
  }
  if (meaning.includes('认为') || meaning.includes('相信')) {
    return `I ______ this is the right approach.`
  }
  if (meaning.includes('提供') || meaning.includes('给予')) {
    return `Please ______ more information about this.`
  }
  if (meaning.includes('使用') || meaning.includes('用')) {
    return `We can ______ this method to solve the problem.`
  }
  if (meaning.includes('获得') || meaning.includes('得到')) {
    return `How can I ______ better results?`
  }
  
  // Generic fallback with meaning hint
  return `The word "______" means: "${meaning}". Fill in the blank with the correct word.`
})

const playPronunciation = async (word) => {
  // 支持传入字符串（单词拼写）或完整单词对象
  let wordToSpeak, audioUrl

  if (word && typeof word === 'object') {
    // 传入的是完整单词对象
    wordToSpeak = word.spelling
    audioUrl = word.audio_url
  } else if (word && typeof word === 'string') {
    // 传入的是字符串
    wordToSpeak = word
    audioUrl = null
  } else {
    // 没有传入参数（比如点击事件），使用当前单词
    wordToSpeak = currentWord.value?.spelling
    audioUrl = currentWord.value?.audio_url
  }

  if (!wordToSpeak) return

  // 开始播放，设置加载状态
  isPlayingAudio.value = true

  // 检查是否是短语（包含空格或下划线）
  const isPhrase = wordToSpeak.includes(' ') || wordToSpeak.includes('_') || wordToSpeak.includes('-')

  // 如果是短语，直接使用浏览器 TTS 朗读完整内容
  if (isPhrase) {
    isPlayingAudio.value = false
    speakWithBrowser(wordToSpeak)
    return
  }

  try {
    // 优先使用传入的音频 URL
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.oncanplaythrough = () => {
        isPlayingAudio.value = false
      }
      audio.onended = () => {
        isPlayingAudio.value = false
      }
      audio.onerror = () => {
        isPlayingAudio.value = false
        // 如果播放失败，回退到 API 获取
        fetchAndPlayAudio(wordToSpeak)
      }
      audio.play().catch(e => {
        console.error('Audio play failed:', e)
        isPlayingAudio.value = false
        // 如果播放失败，回退到 API 获取
        fetchAndPlayAudio(wordToSpeak)
      })
      return
    }

    // 如果没有音频 URL，调用 API 获取
    await fetchAndPlayAudio(wordToSpeak)
  } catch (error) {
    console.error('TTS error:', error)
    isPlayingAudio.value = false
    // Fallback to browser TTS
    speakWithBrowser(wordToSpeak)
  }
}

// 从API获取并播放音频
const fetchAndPlayAudio = async (wordToSpeak) => {
  // 确保是字符串
  if (!wordToSpeak || typeof wordToSpeak !== 'string') {
    isPlayingAudio.value = false
    return
  }
  
  // 设置加载状态
  isPlayingAudio.value = true
  
  try {
    // Fetch from Free Dictionary API which provides real audio
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordToSpeak.trim())}`)
    
    if (!response.ok) throw new Error('Word not found')
    
    const data = await response.json()
    if (!data || !data[0]) throw new Error('No data')
    
    // Find an English audio URL
    const phonetics = data[0].phonetics || []
    let audioUrl = null
    
    for (const p of phonetics) {
      if (p.audio && p.audio.includes('//')) {
        audioUrl = p.audio
        break
      }
    }
    
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.oncanplaythrough = () => {
        isPlayingAudio.value = false
      }
      audio.onended = () => {
        isPlayingAudio.value = false
      }
      audio.onerror = () => {
        isPlayingAudio.value = false
        speakWithBrowser(wordToSpeak)
      }
      audio.play().catch(e => {
        console.error('Audio play failed:', e)
        isPlayingAudio.value = false
        speakWithBrowser(wordToSpeak)
      })
    } else {
      // No audio available, use browser TTS
      speakWithBrowser(wordToSpeak)
    }
  } catch (error) {
    console.error('Fetch audio error:', error)
    isPlayingAudio.value = false
    speakWithBrowser(wordToSpeak)
  }
}

// Browser TTS fallback
const speakWithBrowser = (word) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.onstart = () => {
      isPlayingAudio.value = false
    }
    utterance.onend = () => {
      isPlayingAudio.value = false
    }
    utterance.onerror = () => {
      isPlayingAudio.value = false
    }
    speechSynthesis.speak(utterance)
  } else {
    isPlayingAudio.value = false
  }
}

const handleResponse = async (quality) => {
  // 设置加载状态
  isTransitioning.value = true

  // 记录统计
  sessionStats.value.total++
  if (quality >= 3) {
    sessionStats.value.correct++
  } else {
    sessionStats.value.wrong++
  }

  await wordStore.submitReview(quality)
  resetState()
  currentIndex.value++

  // 检查是否完成，如果完成则不继续选择模式
  if (currentIndex.value >= wordStore.todayWords.length) {
    isSessionCompleted.value = true
    isTransitioning.value = false
    return
  }

  // 切换到下一个单词时随机选择模式
  randomMode()

  // 加载完成
  isTransitioning.value = false
}

const checkDictation = () => {
  if (!dictationAnswer.value.trim()) return
  
  const correct = dictationAnswer.value.trim().toLowerCase() === currentWord.value.spelling.toLowerCase()
  dictationResult.value = correct
  
  // 不自动跳转，等待用户点击"下一个"按钮
}

const checkPOS = (selectedPOS) => {
  const correct = selectedPOS === currentWord.value.part_of_speech
  posResult.value = correct
  
  // 不自动跳转，等待用户点击"下一个"按钮
}

const checkCloze = () => {
  if (!clozeAnswer.value.trim()) return
  
  const userAnswer = clozeAnswer.value.trim().toLowerCase()
  const baseForm = currentWord.value.spelling.toLowerCase()
  const targetForm = clozeTargetForm.value.toLowerCase()
  
  // 如果有目标变形形式
  if (targetForm && targetForm !== baseForm) {
    if (userAnswer === targetForm) {
      // 用户填写了变形形式，正确
      clozeResult.value = true
    } else if (userAnswer === baseForm) {
      // 用户填写了原形，提示应该填写变形形式
      clozeResult.value = 'hint' // 特殊状态：需要提示
    } else {
      // 用户填写了其他形式，错误
      clozeResult.value = false
    }
  } else {
    // 没有目标变形，使用原来的逻辑
    const correct = userAnswer === baseForm
    clozeResult.value = correct
  }
  
  // 不自动跳转，等待用户点击"下一个"按钮
}

// 跳过填空题，记为不认识
const skipCloze = () => {
  clozeResult.value = false  // 记为错误
}

// 跳过默写题，记为不认识
const skipDictation = () => {
  dictationResult.value = false  // 记为错误
}

const getPOSButtonClass = (pos) => {
  if (posResult.value === null) {
    return 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
  }
  if (pos === currentWord.value.part_of_speech) {
    return 'border-green-500 bg-green-50 text-green-700'
  }
  return 'border-gray-200 opacity-50'
}

const nextWord = async () => {
  // 设置加载状态
  isTransitioning.value = true
  
  // 根据答题结果提交复习记录
  let quality = 3 // 默认模糊
  // clozeResult 可能是 true, false, 或 'hint'（hint也算正确）
  const clozeCorrect = clozeResult.value === true || clozeResult.value === 'hint'
  
  // 记录统计
  sessionStats.value.total++
  if (dictationResult.value === true || posResult.value === true || clozeCorrect) {
    quality = 5 // 正确
    sessionStats.value.correct++
  } else if (dictationResult.value === false || posResult.value === false || clozeResult.value === false) {
    quality = 1 // 错误
    sessionStats.value.wrong++
  } else {
    // clozeResult 为 'hint' 时
    if (clozeResult.value === 'hint') {
      sessionStats.value.hint++
    }
  }
  
  await wordStore.submitReview(quality)
  
  // 记录是新词还是复习
  if (currentWord.value?.isNew) {
    sessionNewWords.value++
  } else {
    sessionReviewedWords.value++
  }
  
  resetState()
  currentIndex.value++

  // 检查是否完成，如果完成则记录学习时长
  if (currentIndex.value >= wordStore.todayWords.length) {
    await recordStudyDuration()
    isSessionCompleted.value = true
    isTransitioning.value = false
    return
  }

  // 切换到下一个单词时随机选择模式
  randomMode()

  // 加载完成
  isTransitioning.value = false
}

const resetState = () => {
  showAnswer.value = false
  dictationAnswer.value = ''
  dictationResult.value = null
  posResult.value = null
  clozeAnswer.value = ''
  clozeResult.value = null
  clozeTargetForm.value = ''
}

const checkCompleted = async () => {
  if (currentIndex.value >= wordStore.todayWords.length) {
    // 显示完成界面，而不是自动重置
    isSessionCompleted.value = true
  }
}

// 继续学习新的一轮 - 改为复习模式，复习已学过的单词
const continueStudy = async () => {
  // 重新获取今日单词（包含复习和新词）
  await wordStore.fetchTodayWords()
  currentIndex.value = 0
  isSessionCompleted.value = false
  // 重置统计
  sessionStats.value = { total: 0, correct: 0, wrong: 0, hint: 0 }
  // 重置学习时长跟踪
  studyStartTime.value = Date.now()
  sessionNewWords.value = 0
  sessionReviewedWords.value = 0

  // 随机选择模式
  randomMode()

  // 设置为复习模式（不再获取新词）
  isReviewMode.value = true
}

// 标记是否为复习模式
const isReviewMode = ref(false)

// 记录学习时长到数据库
const recordStudyDuration = async () => {
  if (!studyStartTime.value || !authStore.user) return
  
  const endTime = Date.now()
  const durationMinutes = Math.round((endTime - studyStartTime.value) / 60000)
  
  if (durationMinutes < 1) return // 忽略小于1分钟的学习
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 检查今天是否已有记录
    const { data: existingLog } = await supabase
      .from('study_logs')
      .select('*')
      .eq('user_id', authStore.user.id)
      .eq('date', today)
      .maybeSingle()
    
    if (existingLog) {
      // 更新现有记录，累加时长
      const newDuration = (existingLog.duration_minutes || 0) + durationMinutes
      await supabase
        .from('study_logs')
        .update({ 
          duration_minutes: newDuration,
          new_words_learned: (existingLog.new_words_learned || 0) + sessionNewWords.value,
          words_reviewed: (existingLog.words_reviewed || 0) + sessionReviewedWords.value
        })
        .eq('id', existingLog.id)
    } else {
      // 创建新记录
      await supabase
        .from('study_logs')
        .insert({
          user_id: authStore.user.id,
          date: today,
          new_words_learned: sessionNewWords.value,
          words_reviewed: sessionReviewedWords.value,
          duration_minutes: durationMinutes
        })
    }
  } catch (error) {
    console.error('记录学习时长失败:', error)
  }
}

// Watch for word changes and load cloze example when in cloze mode
watch(currentIndex, async () => {
  // Reset cloze example when word changes
  clozeExample.value = ''
  
  // If entering cloze mode, try to fetch example
  if (studyMode.value === 'cloze') {
    await loadClozeExample()
  }
})

// Also watch for mode changes
watch(studyMode, async (newMode) => {
  if (newMode === 'cloze') {
    await loadClozeExample()
  }
})

onMounted(async () => {
  // Only fetch if not already loaded
  if (wordStore.todayWords.length === 0) {
    await wordStore.fetchTodayWords()
  }
  // Start in preview mode
  isPreviewMode.value = true
  previewIndex.value = 0
  // Initial random mode for later
  randomMode()
  // 开始学习时长计时
  studyStartTime.value = Date.now()
  sessionNewWords.value = 0
  sessionReviewedWords.value = 0
})
</script>
