<template>
  <div class="setup-page">
    <div class="setup-card">
      <!-- Logo 区域 -->
      <div class="logo-box">
        <div class="logo-circle">
          <h1 class="logo-text">AI</h1>
        </div>
        <h2 class="title">PersonalAI 本地初始化配置</h2>
      </div>

      <el-form label-width="150px" class="form-box">
        <!-- 端口配置 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Llama 端口">
              <el-input v-model="config.port.llama" placeholder="5001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ComfyUI 端口">
              <el-input v-model="config.port.comfy" placeholder="18188" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- llama-server -->
        <el-form-item label="llama-server.exe" required>
          <div class="flex-input">
            <el-input v-model="config.path.llamaServer" placeholder="选择可执行文件" />
            <el-button type="primary" @click="selectLlamaServer">选择文件</el-button>
          </div>
        </el-form-item>

        <!-- GGUF 模型 -->
        <el-form-item label="GGUF 模型路径" required>
          <div class="flex-input">
            <el-input v-model="config.path.llamaModel" placeholder="选择 .gguf 模型文件" />
            <el-button type="primary" @click="selectLlamaModel">选择文件</el-button>
          </div>
        </el-form-item>

        <!-- ComfyUI 启动脚本 -->
        <el-form-item label="ComfyUI 启动脚本" required>
          <div class="flex-input">
            <el-input v-model="config.path.comfyStart" placeholder="选择 start.bat" />
            <el-button type="primary" @click="selectComfyStart">选择文件</el-button>
          </div>
        </el-form-item>

        <!-- Llama 参数 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上下文长度">
              <el-input v-model="config.llama.context" type="number" placeholder="2048" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="GPU 分层">
              <el-input v-model="config.llama.gpuLayers" type="number" placeholder="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- MongoDB -->
        <el-form-item label="MongoDB（预留）">
          <el-input v-model="config.mongoUrl" placeholder="mongodb://localhost:27017" />
        </el-form-item>

        <!-- 栅格按钮：完美对齐 -->
        <el-row :gutter="15" style="margin-top: 30px">
          <el-col :span="12">
            <el-button type="success" block size="large" :loading="loading" @click="startAll">
              🚀 一键启动服务
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="primary" block size="large" @click="saveAndGo">
              💾 保存并进入系统
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 引入抽离后的接口方法
import { getConfig, saveConfig, startAllServices } from '@/api/stepApi'

const router = useRouter()

// 初始化完整结构 → 选择文件一定能显示
const config = ref({
  port: { llama: 5001, comfy: 8188 },
  path: { llamaServer: '', llamaModel: '', comfyStart: '' },
  llama: { context: 2048, gpuLayers: 0 },
  mongoUrl: 'mongodb://localhost:27017'
})

const loading = ref(false)

// 加载配置
onMounted(async () => {
  router.push('/home')

  // try {
  //   // 使用抽离的接口方法
  //   const res = await getConfig()
  //   if(res.code==200) {
  //      console.log('加载配置成功:', res.data)
  //      config.value = { ...config.value, ...res.data } // 合并默认值和接口返回值，确保结构完整
  //   } else {
  //     console.warn('加载配置失败，使用默认配置:', res.msg)
  //   }   
  // } catch (e) {
  //   ElMessage.info('使用默认配置')
  // }
})

// 🔥 唯一修复：文件选择方法（解决路径不显示）
const selectFile = (accept) => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return resolve('')

      // 浏览器无法获取真实 path，所以返回文件名 + 提示
      // 你手动补全前面的路径即可
      resolve(file.name)
    }
    
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}

const selectLlamaServer = async () => {
  const p = await selectFile('.exe')
  if (p) {
    config.value.path.llamaServer = p
    console.log('选择文件:', p)
  }
}
const selectLlamaModel = async () => {
  const p = await selectFile('.gguf')
  if (p) {
    config.value.path.llamaModel = p
    console.log('选择模型:', p)
  }
}
const selectComfyStart = async () => {
  const p = await selectFile('.bat')
  if (p) {
    config.value.path.comfyStart = p
    console.log('选择脚本:', p)
  }
}

// 保存
const save = async () => {
  // 使用抽离的接口方法
  await saveConfig(config.value)
  ElMessage.success('配置保存成功')
}

// 启动
const startAll = async () => {
  const p = config.value.path
  if (!p.llamaServer || !p.llamaModel || !p.comfyStart) {
    return ElMessage.warning('请完成所有路径配置')
  }
  loading.value = true
  await save()
  // 使用抽离的接口方法
  const d = await startAllServices()
  d.ok ? ElMessage.success(d.msg) : ElMessage.error(d.msg)
  loading.value = false
}

// 保存并跳转
const saveAndGo = async () => {
  await save()
  router.push('/home')
}
</script>

<style scoped>
.setup-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2eaf5 100%);
}

.setup-card {
  width: 820px;
  background: #fff;
  border-radius: 20px;
  padding: 45px 50px;
  box-shadow: 0 12px 45px rgba(0, 0, 0, 0.07);
}

/* Logo 区域 */
.logo-box {
  text-align: center;
  margin-bottom: 35px;
}
.logo-circle {
  width: 90px;
  height: 90px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #6364f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-text {
  font-size: 28px;
  color: #fff;
  margin: 0;
}
.title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

/* 输入框 + 按钮 组合 */
.flex-input {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
}
.flex-input .el-input {
  flex: 1;
}

.form-box {
  margin-top: 10px;
}
</style>