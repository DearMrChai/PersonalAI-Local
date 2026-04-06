<template>
  <div class="chat-wrapper">
    <div class="chat-header">
      <h3>💬 正在与：{{ currentRole.name || '请先选择角色' }}</h3>
      <el-button type="info" @click="$router.push('/role-manager')">切换角色</el-button>
      <el-tag :type="llamaStatus ? 'success' : 'danger'" size="small">
        Llama：{{ llamaStatus ? '运行中' : '未启动' }}
      </el-tag>
    </div>
    <div class="chat-box">
      <div class="msg" v-for="(m,i) in msgs" :key="i" :class="m.role">
        <div class="bubble">{{ m.content }}</div>
        <img v-if="m.image" :src="m.image" class="msg-img" />
      </div>
      <div v-if="loading" class="loading">思考中…</div>
    </div>
    <div class="chat-input">
      <el-input 
        v-model="text" 
        type="textarea" 
        :rows="2" 
        placeholder="输入消息" 
        @keyup.enter="send" 
        :disabled="!llamaStatus"
      />
      <div style="display: flex; gap: 8px; margin-top: 8px">
        <el-button 
          type="primary" 
          @click="send" 
          :disabled="!llamaStatus || !currentRole.name || !text.trim()"
        >发送</el-button>
        <el-button 
          type="warning" 
          @click="stopGenerate" 
          v-if="generating"
        >打断</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const msgs = ref([])
const text = ref('')
const currentRole = ref({})
const loading = ref(false)
const generating = ref(false)
const llamaStatus = ref(false)
let abortController = null // 用于中断请求
let statusTimer = null

// 读取当前角色
function loadCurrentRole() {
  const r = localStorage.getItem('currentRole')
  if (!r) {
    currentRole.value = {}
    msgs.value = []
    return
  }
  currentRole.value = JSON.parse(r)
  msgs.value = []
  if (currentRole.value.opening) {
    msgs.value.push({ role: 'ai', content: currentRole.value.opening })
  }
}

// 检测Llama服务状态
const checkLlamaStatus = async () => {
  try {
    const res = await fetch('/api/service-status')
    const data = await res.json()
    llamaStatus.value = data.data.llama
  } catch (e) {
    llamaStatus.value = false
  }
}

// 发送消息（请求后端代理接口，而非直接请求LLama）
async function send() {
  const t = text.value.trim()
  if (!t || !currentRole.value.name) return
  if (!llamaStatus.value) {
    ElMessage.error('Llama服务未启动，请先在配置页启动！')
    return
  }

  // 重置中断控制器
  if (abortController) abortController.abort()
  abortController = new AbortController()

  // 追加用户消息
  msgs.value.push({ role: 'user', content: t })
  text.value = ''
  loading.value = true
  generating.value = true
  
  // 初始化AI回复
  const currentReply = { role: 'ai', content: '' }
  msgs.value.push(currentReply)

  // 构造prompt
  const prompt = `
【角色】${currentRole.value.name}
性格：${currentRole.value.personality || '正常'}
语气：${currentRole.value.tone || '正常'}
用户：${t}
你只回复一句话：
  `.trim()

  try {
    // 改为请求后端代理接口（核心修改）
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: abortController.signal
    })

    if (!response.ok) {
      throw new Error(`服务端错误：${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    // 逐块读取流式响应
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        // 解析SSE格式数据
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.substring(6).trim()
        
        // 结束标记
        if (jsonStr === '[DONE]') continue
        
        // 解析LLama返回的token
        try {
          const data = JSON.parse(jsonStr)
          // 适配LLama的响应格式（不同版本可能是text或delta.content）
          const token = data.choices?.[0]?.text || data.choices?.[0]?.delta?.content || ''
          if (token) {
            currentReply.content += token
          }
        } catch (e) {
          // 忽略解析错误（避免单条数据异常导致整体中断）
          console.warn('解析流式数据失败：', e, jsonStr)
        }
      }
    }

    // 处理空回复
    if (!currentReply.content) {
      currentReply.content = '（未获取到回复）'
    }
  } catch (e) {
    if (e.name !== 'AbortError') { // 排除主动中断的情况
      ElMessage.error('请求失败：' + e.message)
      // 标记错误回复
      const lastMsg = msgs.value[msgs.value.length - 1]
      if (lastMsg.role === 'ai') {
        lastMsg.content = '⚠️ ' + e.message
      }
    }
  } finally {
    loading.value = false
    generating.value = false
  }
}

// 打断生成
function stopGenerate() {
  if (abortController) {
    abortController.abort()
    ElMessage.info('已中断回复生成')
  }
  generating.value = false
  loading.value = false
}

onMounted(() => {
  loadCurrentRole()
  checkLlamaStatus()
  statusTimer = setInterval(checkLlamaStatus, 5000)
})

onUnmounted(() => {
  clearInterval(statusTimer)
  if (abortController) abortController.abort()
})

window.addEventListener('role-changed', () => {
  loadCurrentRole()
})
</script>

<style scoped>
.chat-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}
.chat-box {
  flex: 1;
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
}
.msg {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.msg.user {
  align-items: flex-end;
}
.msg.ai {
  align-items: flex-start;
}
.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #eee;
  word-break: break-word;
}
.user .bubble {
  background: #409eff;
  color: #fff;
  border: none;
}
.loading {
  color: #999;
  font-size: 12px;
  padding: 10px;
}
.chat-input {
  margin-top: 12px;
}
.msg-img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 8px;
  border: 1px solid #eee;
}
</style>