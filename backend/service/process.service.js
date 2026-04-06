import { spawn } from 'child_process'
import path from 'path'
import net from 'net'
import { getConfig } from './config.service.js'

// 全局进程池
global.processPool = {
  llama: null,
  comfy: null
}

// 检测端口
export const checkPort = (port) => {
  return new Promise((resolve) => {
    const client = new net.Socket()
    client.connect(port, 'localhost', () => {
      client.destroy()
      resolve(true)
    })
    client.on('error', () => {
      resolve(false)
    })
  })
}

// 启动 llama
export const startLlama = async () => {
  try {
    const config = getConfig()

    if (!config.path.llamaServer || !config.path.llamaModel) {
      throw new Error('请先配置 llamaServer 和 llamaModel 路径')
    }

    if (global.processPool.llama) {
      try { global.processPool.llama.kill() } catch {}
    }

    const args = [
      '-m', config.path.llamaModel,
      '-c', config.llama.context,
      '--n-gpu-layers', config.llama.gpuLayers,
      '--port', config.port.llama
    ]

    // ✅ 关键：Windows 弹黑窗
    const llamaProcess = spawn(config.path.llamaServer, args, {
      cwd: path.dirname(config.path.llamaServer),
      shell: true,
      windowsHide: false,
      detached: true
    })

    llamaProcess.on('error', (err) => {
      console.error('Llama 启动错误:', err.message)
    })

    global.processPool.llama = llamaProcess

    // ==============================
    // 给你慢电脑专用：超长时间等待
    // ==============================
    return new Promise((resolve, reject) => {
      let count = 0
      const timer = setInterval(async () => {
        const ok = await checkPort(config.port.llama)
        if (ok) {
          clearInterval(timer)
          resolve(true)
        }
        // 🔴 改成 120 秒超时！
        if (++count > 120) {
          clearInterval(timer)
          reject(new Error('Llama 启动超时'))
        }
      }, 1000)
    })

  } catch (err) {
    console.error('startLlama:', err.message)
    throw err
  }
}

// 启动 ComfyUI
export const startComfy = async () => {
  try {
    const config = getConfig()

    if (!config.path.comfyStart) {
      throw new Error('请先配置 ComfyUI start.bat 路径')
    }

    if (global.processPool.comfy) {
      try { global.processPool.comfy.kill() } catch {}
    }

    // ✅ 关键：Windows 弹黑窗
    const comfyProcess = spawn(config.path.comfyStart, [], {
      cwd: path.dirname(config.path.comfyStart),
      shell: true,
      windowsHide: false,
      detached: true
    })

    comfyProcess.on('error', (err) => {
      console.error('ComfyUI 启动错误:', err.message)
    })

    global.processPool.comfy = comfyProcess

    // ==============================
    // 给你慢电脑专用：180 秒超时
    // ==============================
    return new Promise((resolve, reject) => {
      let count = 0
      const timer = setInterval(async () => {
        const ok = await checkPort(config.port.comfy)
        if (ok) {
          clearInterval(timer)
          resolve(true)
        }
        // 🔴 改成 180 秒超时！
        if (++count > 180) {
          clearInterval(timer)
          reject(new Error('ComfyUI 启动超时'))
        }
      }, 1000)
    })

  } catch (err) {
    console.error('startComfy:', err.message)
    throw err
  }
}

// 一键启动
export const startAllServices = async () => {
  try {
    await Promise.all([startLlama(), startComfy()])
    return true
  } catch (err) {
    console.error('启动失败：', err.message)
    throw err
  }
}

// 获取状态
export const getServiceStatus = async () => {
  const config = getConfig()
  return {
    llama: await checkPort(config.port.llama),
    comfy: await checkPort(config.port.comfy),
    backend: true,
    frontend: await checkPort(config.port.frontend)
  }
}

// 关闭所有
export const stopAllServices = () => {
  try {
    Object.values(global.processPool).forEach(p => p && p.kill())
    global.processPool = { llama: null, comfy: null }
  } catch {}
  return true
}