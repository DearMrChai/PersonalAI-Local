<template>
  <div class="setup-page">
    <div class="setup-card">
      <h2>⚙️ 初始化配置</h2>
      <el-form label-width="130px">
        <!-- 端口配置 -->
        <el-collapse title="端口配置（默认即可，无需修改）" class="mb20">
          <el-form-item label="Llama端口">
            <el-input v-model="config.port.llama" placeholder="5001" />
          </el-form-item>
          <el-form-item label="ComfyUI端口">
            <el-input v-model="config.port.comfy" placeholder="8188" />
          </el-form-item>
        </el-collapse>
        <!-- 核心：外部路径配置（必须设置） -->
        <el-form-item label="llama-server.exe路径">
          <el-input v-model="config.path.llamaServer" placeholder="例：D:/NSWFAI/AI/llama-cpu/llama-server.exe" />
          <el-button type="text" @click="selectLlamaServer">选择文件</el-button>
        </el-form-item>
        <el-form-item label="GGUF模型路径">
          <el-input v-model="config.path.llamaModel" placeholder="例：D:/NSWFAI/AI/大模型/qwen/xxx.gguf" />
          <el-button type="text" @click="selectLlamaModel">选择文件</el-button>
        </el-form-item>
        <el-form-item label="ComfyUI启动脚本">
          <el-input v-model="config.path.comfyStart" placeholder="例：D:/NSWFAI/AI/ComfyUI/start.bat" />
          <el-button type="text" @click="selectComfyStart">选择文件</el-button>
        </el-form-item>
        <!-- Llama参数配置 -->
        <el-collapse title="Llama参数配置（适配显卡）" class="mb20">
          <el-form-item label="上下文长度">
            <el-input v-model="config.llama.context" placeholder="2048" type="number" />
          </el-form-item>
          <el-form-item label="GPU分层（CPU版设0）">
            <el-input v-model="config.llama.gpuLayers" placeholder="0" type="number" />
          </el-form-item>
        </el-collapse>
        <!-- 预留数据库 -->
        <el-form-item label="MongoDB（预留）">
          <el-input v-model="config.mongoUrl" placeholder="mongodb://localhost:27017" />
        </el-form-item>
        <!-- 按钮区 -->
        <el-button type="success" @click="startAll" block size="large" class="mb10" :loading="loading">
          🚀 一键启动 Llama + ComfyUI
        </el-button>
        <el-button type="primary" @click="save" block size="large">
          💾 保存并进入系统
        </el-button>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const emit = defineEmits(['done'])
const config = ref({})
const loading = ref(false)

// 读取配置
onMounted(async () => {
  const r = await fetch('/api/config')
  config.value = await r.json()
})

// 选择文件（原生file选择，无需额外插件）
const selectFile = (accept) => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = (e) => {
      resolve(e.target.files[0]?.path || '')
    }
    input.click()
  })
}
// 选择llama-server.exe
const selectLlamaServer = async () => {
  const path = await selectFile('.exe')
  if (path) config.value.path.llamaServer = path
}
// 选择GGUF模型
const selectLlamaModel = async () => {
  const path = await selectFile('.gguf')
  if (path) config.value.path.llamaModel = path
}
// 选择ComfyUI的start.bat
const selectComfyStart = async () => {
  const path = await selectFile('.bat')
  if (path) config.value.path.comfyStart = path
}

// 一键启动服务
const startAll = async () => {
  // 校验路径
  if (!config.value.path.llamaServer || !config.value.path.llamaModel || !config.value.path.comfyStart) {
    ElMessage.warning('请先完善所有路径配置！')
    return
  }
  loading.value = true
  try {
    // 先保存配置，再启动
    await save()
    const r = await fetch('/api/start-services')
    const d = await r.json()
    if (d.ok) {
      ElMessage.success(d.msg)
    } else {
      ElMessage.error(d.msg)
    }
  } catch (e) {
    ElMessage.error('启动失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 保存配置
const save = async () => {
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.value)
  })
  ElMessage.success('配置保存成功')
}
</script>
<style scoped>
.setup-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.setup-card {
  width: 700px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}
.setup-card h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 22px;
}
.mb10 { margin-bottom: 10px; }
.mb20 { margin-bottom: 20px; }
</style>