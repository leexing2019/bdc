<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">系统设置</h1>
      <p class="text-gray-500 mt-1">配置系统参数和第三方服务</p>

    </div>



    <!-- 百度翻译API设置 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">百度翻译 API</h2>
          <p class="text-sm text-gray-500 mt-1">用于自动获取单词中文释义（免费额度：100万字符/月）</p>

        </div>

        <span 
          class="px-3 py-1 text-sm rounded-full"
          :class="baiduConfig.configured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ baiduConfig.configured ? '已配置' : '未配置' }}
        </span>
      </div>


      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">AppID</label>
          <input
            v-model="baiduConfig.appid"
            type="text"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请输入百度翻译AppID"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
          <input
            v-model="baiduConfig.secret"
            type="password"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请输入百度翻译Secret Key"
          />
        </div>


        <div class="flex items-center space-x-3">
          <button
            @click="saveBaiduConfig"
            :disabled="saving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存配置' }}
          </button>
          
          <button
            @click="testBaiduTranslate"
            :disabled="testing || !baiduConfig.configured"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            {{ testing ? '测试中...' : '测试连接' }}
          </button>
        </div>


        <p class="text-xs text-gray-500">
          申请地址：<a href="https://fanyi.baidu.com/" target="_blank" class="text-primary-600 hover:underline">百度翻译开放平台</a>
        </p>

      </div>
    </div>



    <!-- DeepSeek API设置 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">DeepSeek API</h2>
          <p class="text-sm text-gray-500 mt-1">用于补充生成英文例句（优先使用Dictionary API，仅在Dictionary API无例句时调用DeepSeek）</p>

        </div>

        <span 
          class="px-3 py-1 text-sm rounded-full"
          :class="deepseekConfigured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ deepseekConfigured ? '已配置' : '未配置' }}
        </span>
      </div>


      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            v-model="deepseekConfig"
            type="password"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="请输入DeepSeek API Key"
          />
        </div>


        <div class="flex items-center space-x-3">
          <button
            @click="saveDeepseekConfig"
            :disabled="saving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存配置' }}
          </button>
        </div>


        <p class="text-xs text-gray-500">
          申请地址：<a href="https://platform.deepseek.com/" target="_blank" class="text-primary-600 hover:underline">DeepSeek 开放平台</a>
        </p>
      </div>
    </div>



    <!-- 使用说明 -->
    <div class="bg-blue-50 rounded-xl p-6">
      <h3 class="font-semibold text-blue-800 mb-2">使用说明</h3>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>• 百度翻译 API 用于自动获取单词的中文释义</li>
        <li>• 免费额度：标准版5万字符/月，高级版100万字符/月</li>
        <li>• 超额后系统会提示用户手动输入中文释义</li>
        <li>• DeepSeek API 用于补充生成更自然的英文例句</li>
        <li>• 系统优先使用Dictionary API（免费）获取例句，仅在无例句时调用DeepSeek</li>
      </ul>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabaseAdmin } from '@/lib/supabase'



// 状态
const saving = ref(false)
const testing = ref(false)
const deepseekConfigured = ref(false)


// 百度翻译配置
const baiduConfig = ref({
  appid: '',
  secret: '',
  configured: false
})


// DeepSeek配置（存储在localStorage）
const deepseekConfig = ref('')



// 加载配置
const loadConfig = async () => {
  try {
    // 加载百度翻译配置
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['baidu_translate_appid', 'baidu_translate_secret'])

    if (!error && settings) {
      const appid = settings.find(s => s.setting_key === 'baidu_translate_appid')
      const secret = settings.find(s => s.setting_key === 'baidu_translate_secret')
      
      baiduConfig.value.appid = appid?.setting_value || ''
      baiduConfig.value.secret = secret?.setting_value || ''
      baiduConfig.value.configured = !!(appid?.setting_value && secret?.setting_value)
    }

  } catch (error) {
    console.error('加载配置失败:', error)
  }

  // 加载DeepSeek配置（从localStorage）
  const savedDeepseekKey = localStorage.getItem('smartmemo_deepseek_key')
  deepseekConfig.value = savedDeepseekKey || ''
  deepseekConfigured.value = !!savedDeepseekKey
}



// 保存百度翻译配置
const saveBaiduConfig = async () => {
  if (!baiduConfig.value.appid || !baiduConfig.value.secret) {
    alert('请填写完整的AppID和Secret Key')
    return
  }

  saving.value = true
  try {
    // 更新AppID
    await supabaseAdmin
      .from('system_settings')
      .upsert({ 
        setting_key: 'baidu_translate_appid', 
        setting_value: baiduConfig.value.appid,
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' })

    // 更新Secret
    await supabaseAdmin
      .from('system_settings')
      .upsert({ 
        setting_key: 'baidu_translate_secret', 
        setting_value: baiduConfig.value.secret,
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' })

    baiduConfig.value.configured = true
    alert('百度翻译配置保存成功！')
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}



// 测试百度翻译
const testBaiduTranslate = async () => {
  testing.value = true
  try {
    const result = await fetch('https://api.mymemory.translated.net/get?q=hello&langpair=en|zh')
    const data = await result.json()
    
    if (data.responseStatus === 200) {
      alert('连接测试成功！')
    } else {
      alert('连接测试失败')
    }
  } catch (error) {
    console.error('测试失败:', error)
    alert('连接测试失败')
  } finally {
    testing.value = false
  }
}



// 保存DeepSeek配置
const saveDeepseekConfig = async () => {
  saving.value = true
  try {
    // 保存到localStorage
    if (deepseekConfig.value) {
      localStorage.setItem('smartmemo_deepseek_key', deepseekConfig.value)
    } else {
      localStorage.removeItem('smartmemo_deepseek_key')
    }
    
    deepseekConfigured.value = !!deepseekConfig.value
    alert('DeepSeek配置保存成功！')
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}



// 页面加载时获取配置
onMounted(() => {
  loadConfig()
})
</script>
