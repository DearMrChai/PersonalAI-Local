import { exec, spawn } from 'child_process'
import path from 'path'
import net from 'net'
import { getConfig } from './config.service.js'

// 全局进程池（保存启动的llama/ComfyUI进程，用于关闭/检测）
global.processPool = {
  llama: null,
  comfy: null
}

// 检测端口是否被占用（判断服务是否启动成功）
export const checkPort = (port) => {
  return new Promise((resolve) => {
    const client = new net.Socket()
    client.connect(port, 'localhost', () => {
      client.destroy()
      resolve(true) // 端口占用，服务已启动
    })
    client.on('error', () => {
      resolve(false) // 端口未占用，服务未启动
    })
  })
}

// 启动llama.cpp
export const startLlama = () => {
  const config = getConfig()
  // 校验路径
  if (!config.path.llamaServer || !config.path.llamaModel) {
    return Promise.reject(new Error('请先配置llamaServer和llamaModel路径'))
  }
  // 关闭原有进程
  if (global.processPool.llama) global.processPool.llama.kill()
  // 启动参数
  const args = [
    '-m', config.path.llamaModel,
    '-c', config.llama.context,
    '--n-gpu-layers', config.llama.gpuLayers,
    '--port', config.port.llama
  ]
  // 启动进程（spawn替代exec，避免黑窗闪退）
  const llamaProcess = spawn(config.path.llamaServer, args, {
    cwd: path.dirname(config.path.llamaServer),
    detached: true,
    stdio: 'ignore'
  })
  llamaProcess.unref()
  global.processPool.llama = llamaProcess
  // 检测是否启动成功（轮询端口）
  return new Promise((resolve, reject) => {
    let count = 0
    const timer = setInterval(async () => {
      const isRunning = await checkPort(config.port.llama)
      if (isRunning) {
        clearInterval(timer)
        resolve(true)
      }
      count++
      if (count > 20) { // 20秒超时
        clearInterval(timer)
        reject(new Error('llama.cpp启动超时'))
      }
    }, 1000)
  })
}

// 启动ComfyUI
export const startComfy = () => {
  const config = getConfig()
  // 校验路径
  if (!config.path.comfyStart) {
    return Promise.reject(new Error('请先配置ComfyUI的start.bat路径'))
  }
  // 关闭原有进程
  if (global.processPool.comfy) global.processPool.comfy.kill()
  // 启动进程
  const comfyProcess = spawn(config.path.comfyStart, [], {
    cwd: path.dirname(config.path.comfyStart),
    detached: true,
    stdio: 'ignore'
  })
  comfyProcess.unref()
  global.processPool.comfy = comfyProcess
  // 检测是否启动成功
  return new Promise((resolve, reject) => {
    let count = 0
    const timer = setInterval(async () => {
      const isRunning = await checkPort(config.port.comfy)
      if (isRunning) {
        clearInterval(timer)
        resolve(true)
      }
      count++
      if (count > 30) { // 30秒超时
        clearInterval(timer)
        reject(new Error('ComfyUI启动超时'))
      }
    }, 1000)
  })
}

// 一键启动所有服务
export const startAllServices = () => {
  return Promise.all([startLlama(), startComfy()])
}

// 获取所有服务状态
export const getServiceStatus = async () => {
  const config = getConfig()
  return {
    llama: await checkPort(config.port.llama),
    comfy: await checkPort(config.port.comfy),
    backend: true, // 后端本身肯定在运行
    frontend: await checkPort(config.port.frontend)
  }
}

// 一键关闭所有服务
export const stopAllServices = () => {
  Object.values(global.processPool).forEach(process => {
    if (process) process.kill()
  })
  global.processPool = { llama: null, comfy: null }
  return true
}