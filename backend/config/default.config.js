// 统一默认配置，解决重复config问题，所有可配置项都放这
export default {
  // 服务端口（前端/后端/第三方）
  port: {
    backend: 3000,
    frontend: 5173,
    llama: 5001,
    comfy: 8188
  },
  // 外部程序路径（核心可配置，用户首次启动需设置）
  path: {
    llamaServer: '', // llama-server.exe绝对路径
    llamaModel: '',  // GGUF模型绝对路径
    comfyStart: ''   // ComfyUI的start.bat绝对路径
  },
  // llama启动参数（可配置，适配不同显卡/模型）
  llama: {
    context: 2048,    // 上下文长度
    gpuLayers: 0,     // GPU分层（CPU版设0，N卡可改）
    temperature: 0.7, // 温度
    maxTokens: 80     // 最大生成token
  },
  // 数据库（预留）
  mongoUrl: ''
}