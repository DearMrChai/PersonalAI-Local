<template>
  <div class="draw-box">
    <h3>🎨 AI 绘画</h3>
    <!-- 服务状态提示 -->
    <el-tag :type="comfyStatus ? 'success' : 'danger'" size="small" class="mb10">
      ComfyUI：{{ comfyStatus ? '运行中' : '未启动' }}
    </el-tag>
    <el-input v-model="prompt" rows="3" placeholder="输入提示词" class="mt10" :disabled="!comfyStatus" />
    <el-button type="success" :loading="loading" @click="go" class="mt10" :disabled="!comfyStatus">生成图片</el-button>
    <div v-if="loading" class="mt15">正在生成中...请稍候</div>
    <div v-if="result" class="mt15">
      <img :src="result" style="width:100%; border-radius:8px" />
      <el-button type="text" @click="copyImage" class="mt10">复制图片链接</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const prompt = ref('masterpiece, best quality, 1girl')
const loading = ref(false)
const result = ref('')
const comfyStatus = ref(false) // ComfyUI服务状态
let statusTimer = null

// 检测ComfyUI状态
const checkComfyStatus = async () => {
  const res = await fetch('/api/service-status')
  const data = await res.json()
  comfyStatus.value = data.data.comfy
}

// 生成图片
async function go() {
  loading.value = true
  result.value = ''
  try {
    // 提交任务
    const res = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.value })
    })
    const { task_id, success } = await res.json()
    if (!success) throw new Error('提交任务失败')
    // 轮询查询
    const timer = setInterval(async () => {
      try {
        const resp = await fetch(`http://localhost:3000/api/task/${task_id}`)
        const data = await resp.json()
        if (data.done && data.filename) {
          clearInterval(timer)
          loading.value = false
          // 拼接图片链接（适配配置的端口）
          const configRes = await fetch('/api/config')
          const config = await configRes.json()
          result.value = `http://localhost:${config.port.comfy}/view?filename=${data.filename}&t=${Date.now()}`
        } else if (data.done && !data.filename) {
          clearInterval(timer)
          loading.value = false
          ElMessage.warning('生成成功，但未找到图片')
        }
      } catch (e) {
        clearInterval(timer)
        loading.value = false
        ElMessage.error('查询任务失败：' + e.message)
      }
    }, 1000)
  } catch (e) {
    loading.value = false
    ElMessage.error('生成失败：' + e.message)
  }
}

// 复制图片链接
const copyImage = () => {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('图片链接已复制')
}

onMounted(() => {
  checkComfyStatus()
  // 轮询检测状态
  statusTimer = setInterval(checkComfyStatus, 5000)
})

onUnmounted(() => {
  clearInterval(statusTimer)
})
</script>
<style scoped>
.draw-box {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}
.mt10 { margin-top:10px; }
.mt15 { margin-top:15px; }
.mb10 { margin-bottom:10px; }
</style>