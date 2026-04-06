import express from 'express'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 解决__dirname问题（ES6模块）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
global.__dirname = __dirname

// 初始化app
const app = express()
const server = http.createServer(app)
global.wss = new WebSocketServer({ server })

// 全局中间件
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'static')))

// ==============================================
// 新增1：托管前端打包后的dist静态文件（核心，打包后必加）
// ==============================================
const frontDistPath = path.join(__dirname, '../frontend/dist')
if (fs.existsSync(frontDistPath)) {
  app.use(express.static(frontDistPath))
  // 新增2：访问根路径，直接返回前端首页
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontDistPath, 'index.html'))
  })
}

// 自动注册路由
const routesDir = path.join(__dirname, 'routes')
fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.routes.js')) {
    const router = import(`./routes/${file}`)
    router.then(mod => {
      app.use('/api', mod.default)
    })
  }
})

// 启动服务
const PORT = 3000
server.listen(PORT, () => {
  console.log(`✅ PersonalAI-Local服务已启动：http://localhost:${PORT}`)
  console.log(`✅ 直接打开浏览器访问上方地址，即可进入系统！`)
})