<template>
  <div class="setup-page">
    <div class="setup-card">
      <h2>⚙️ 初始化配置</h2>
      <el-form label-width="130px">
        <el-collapse title="端口配置（默认即可，无需修改）" class="mb20">
          <el-form-item label="Llama端口">
            <el-input v-model="config.port.llama" placeholder="5001" />
          </el-form-item>
          <el-form-item label="ComfyUI端口">
            <el-input v-model="config.port.comfy" placeholder="8188" />
          </el-form-item>
        </el-collapse>

        <el-form-item label="llama-server.exe路径">
          <el-input v-model="config.path.llamaServer" placeholder="请选择路径" />
          <el-button type="text" @click="selectLlamaServer">选择文件</el-button>
        </el-form-item>

        <el-form-item label="GGUF模型路径">
          <el-input v-model="config.path.llamaModel" placeholder="请选择路径" />
          <el-button type="text" @click="selectLlamaModel">选择文件</el-button>
        </el-form-item>

        <el-form-item label="ComfyUI启动脚本">
          <el-input v-model="config.path.comfyStart" placeholder="请选择路径" />
          <el-button type="text" @click="selectComfyStart">选择文件</el-button>
        </el-form-item>

        <el-collapse title="Llama参数配置" class="mb20">
          <el-form-item label="上下文长度">
            <el-input v-model="config.llama.context" type="number" placeholder="2048" />
          </el-form-item>
          <el-form-item label="GPU分层（CPU=0）">
            <el-input v-model="config.llama.gpuLayers" type="number" placeholder="0" />
          </el-form-item>
        </el-collapse>

        <el-button type="success" @click="startAll" block size="large" class="mb10" :loading="loading">
          🚀 一键启动 Llama + ComfyUI
        </el-button>
        <el-button type="primary" @click="saveAndGo" block size="large">
          💾 保存并进入系统
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()

const config = ref({
  port: { llama: 5001, comfy: 8188 },
  path: { llamaServer: '', llamaModel: '', comfyStart: '' },
  llama: { context: 2048, gpuLayers: 0 },
  mongoUrl: 'mongodb://localhost:27017'
})

const loading = ref(false)

// 加载配置
onMounted(async () => {
  try {
    const res = await fetch('/api/config')
    const data = await res.json()
    config.value = { ...config.value, ...data }
  } catch (e) {
    ElMessage.warning('使用默认配置')
  }
})

// 选择文件
const selectFile = (accept) => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = (e) => resolve(e.target.files[0]?.path || '')
    input.click()
  })
}

const selectLlamaServer = async () => {
  const p = await selectFile('.exe')
  if (p) config.value.path.llamaServer = p
}

const selectLlamaModel = async () => {
  const p = await selectFile('.gguf')
  if (p) config.value.path.llamaModel = p
}

const selectComfyStart = async () => {
  const p = await selectFile('.bat')
  if (p) config.value.path.comfyStart = p
}

// 保存
const save = async () => {
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.value)
  })
  ElMessage.success('保存成功')
}

// 启动服务
const startAll = async () => {
  if (!config.value.path.llamaServer || !config.value.path.llamaModel || !config.value.path.comfyStart) {
    return ElMessage.warning('请填写所有路径')
  }
  loading.value = true
  await save()
  const res = await fetch('/api/start-services')
  const data = await res.json()
  data.ok ? ElMessage.success(data.msg) : ElMessage.error(data.msg)
  loading.value = false
}

// 保存并跳转
const saveAndGo = async () => {
  await save()
  router.push('/main')
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
}
.mb10 { margin-bottom: 10px; }
.mb20 { margin-bottom: 20px; }
</style>