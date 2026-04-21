// import fs from 'fs'
// import path from 'path'
// import fetch from 'node-fetch'
// import { getConfig } from '../../config.service.js'
// import { readFile } from '../../../utils/fileUtil.js'

// // 获取绘图工作流（可扩展，支持切换不同工作流）
// const getWorkflow = (workflowName = 'character-draw') => {
//   const workflowPath = path.join(__dirname, `../workflows/${workflowName}.json`)
//   return readFile(workflowPath, {})
// }

// // 生成图片
// export const generateImage = async (prompt, workflowName = 'character-draw') => {
//   const config = getConfig()
//   const comfyUrl = `http://localhost:${config.port.comfy}`
//   // 获取工作流并动态替换变量
//   let workflow = getWorkflow(workflowName)
//   const seed = Math.floor(Math.random() * 99999999999)
//   // 替换提示词和种子
//   const workflowStr = JSON.stringify(workflow)
//     .replace(/{{prompt}}/g, prompt)
//     .replace(/{{seed}}/g, seed)
//   workflow = JSON.parse(workflowStr)

//   // 调用ComfyUI接口
//   const response = await fetch(`${comfyUrl}/prompt`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt: workflow, client_id: "my-client" })
//   })
//   const data = await response.json()
//   return { success: true, task_id: data.prompt_id }
// }

// // 查询绘图任务状态
// export const getDrawTask = async (taskId) => {
//   const config = getConfig()
//   const comfyUrl = `http://localhost:${config.port.comfy}`
//   const resp = await fetch(`${comfyUrl}/history`)
//   const history = await resp.json()
//   const task = history[taskId]
//   if (!task) return { done: false }
//   // 提取图片文件名
//   for (const key in task.outputs) {
//     if (task.outputs[key].images) {
//       return {
//         done: true,
//         filename: task.outputs[key].images[0].filename
//       }
//     }
//   }
//   return { done: true }
// }

// // 获取绘图进度
// export const getDrawProgress = async () => {
//   const config = getConfig()
//   const comfyUrl = `http://localhost:${config.port.comfy}`
//   try {
//     const resp = await fetch(`${comfyUrl}/history`)
//     return await resp.json()
//   } catch (e) {
//     return {}
//   }
// }