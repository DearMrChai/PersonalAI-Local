<template>
  <div class="chat-wrapper">
    <div class="chat-header">
      <h3>💬 正在与：{{ currentRole.name || '请先选择角色' }}</h3>
      <el-button type="info" @click="$router.push('/role-manager')">切换角色</el-button>
      <!-- 服务状态提示 -->
      <el-tag :type="llamaStatus ? 'success' : 'danger'" size="small">
        Llama：{{ llamaStatus ? '运行中' : '未启动' }}
      </el-tag>
    </div>
    <div class="chat-box">
      <div class="msg" v-for="(m,i) in msgs" :key="i" :class="m.role">
        <div class="bubble">{{ m.content }}</div>
        <!-- 聊天框显示图片（预留，后续可直接用） -->
        <img v-if="m.image" :src="m.image" class="msg-img" />
      </div>
      <div v-if="loading" class="loading">思考中…</div>
    </div>
    <div class="chat-input">
      <el-input v-model="text" type="textarea" :rows="2" placeholder="输入消息" @keyup.enter="send" :disabled="!llamaStatus" />
      <div style="display: flex; gap: 8px; margin-top: 8px">
        <el-button type="primary" @click="send" :disabled="!llamaStatus || !currentRole.name">发送</el-button>
        <el-button type="warning" @click="stopGenerate" v-if="generating">打断</el-button>
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
const llamaStatus = ref(false) // Llama服务状态
let ws = null
let currentReply = null
let statusTimer = null // 状态轮询定时器

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
  const res = await fetch('/api/service-status')
  const data = await res.json()
  llamaStatus.value = data.data.llama
}

// 连接WS
function connectWs() {
  ws = new WebSocket('ws://localhost:3000')
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data)
    if (d.type === 'token' && currentReply) {
      currentReply.content += d.token
    }
    if (d.type === 'done' || d.type === 'stopped') {
      loading.value = false
      generating.value = false
    }
  }
  ws.onclose = () => {
    ElMessage.warning('WebSocket连接断开，正在重连…')
    setTimeout(connectWs, 1000)
  }
}

// 发送
function send() {
  const t = text.value.trim()
  if (!t || !currentRole.value.name) return
  // 再次校验状态
  if (!llamaStatus.value) {
    ElMessage.error('Llama服务未启动，请先在配置页启动！')
    return
  }
  msgs.value.push({ role: 'user', content: t })
  text.value = ''
  loading.value = true
  generating.value = true
  currentReply = { role: 'ai', content: '' }
  msgs.value.push(currentReply)
  const prompt = `
【角色】${currentRole.value.name}
性格：${currentRole.value.personality || '正常'}
语气：${currentRole.value.tone || '正常'}
用户：${t}
你只回复一句话：
  `.trim()
  ws.send(JSON.stringify({ type: 'chat', prompt }))
}

// 打断生成
function stopGenerate() {
  ws.send(JSON.stringify({ type: 'stop' }))
}

onMounted(() => {
  loadCurrentRole()
  connectWs()
  checkLlamaStatus()
  // 轮询检测状态（每5秒一次）
  statusTimer = setInterval(checkLlamaStatus, 5000)
})

// 销毁时清除定时器
onUnmounted(() => {
  clearInterval(statusTimer)
  if (ws) ws.close()
})

// 监听角色切换自动刷新
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