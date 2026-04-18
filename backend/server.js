/**
 * PersonalAI-Local Backend Entry Point
 * 
 * 启动流程：
 * 1. 加载环境变量
 * 2. 初始化 Express 应用与 WebSocket
 * 3. 注册全局中间件 (CORS, JSON, Static)
 * 4. 自动注册业务路由
 * 5. 注册全局错误处理
 * 6. 执行数据库迁移 (确保数据结构最新)
 * 7. 启动 HTTP 服务器监听端口
 */

import 'dotenv/config'; // [必须] 放在最顶部，加载 .env 变量

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 引入自定义模块
// import { runMigrations } from './src/models/migrate.js';
import './src/models/index.js'; // 确保模型被加载，触发表创建等逻辑
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';

// ==========================================
// 1. 基础配置与全局变量
// ==========================================

// 解决 ES Module 中 __dirname 缺失的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__dirname = __dirname;

// 从环境变量获取端口，默认 3000
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. 应用初始化 (App & Server & WS)
// ==========================================

const app = express();
const server = http.createServer(app);

// 初始化 WebSocket 并挂载到全局，方便后续在路由或控制器中使用
global.wss = new WebSocketServer({ server });

// ==========================================
// 3. 全局中间件 (Middleware)
// ==========================================

// 跨域支持
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 托管后端自带的静态资源 (如上传的图片等)
app.use(express.static(path.join(__dirname, 'static')));

// 托管 Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// 4. 前端静态资源托管 (Production Ready)
// ==========================================

const frontDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontDistPath)) {
  console.log('📂 检测到前端构建产物，启用静态托管');
  
  // 托管前端 dist 目录
  app.use(express.static(frontDistPath));
  
  // SPA 回退机制：所有非 API 请求都返回 index.html
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontDistPath, 'index.html'));
  });
} else {
  console.log('⚠️ 未检测到前端 dist 目录，仅启动后端 API 服务');
}

// ==========================================
// 5. 自动注册业务路由 (Auto Routing)
// ==========================================

const routesDir = path.join(__dirname, './src/routes');
console.log(`🔍 正在扫描路由目录: ${routesDir}`);

if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach((file) => {
    if (file.endsWith('.routes.js')) {
      // 动态导入路由文件
      import(`./src/routes/${file}`).then((mod) => {
        if (mod.default) {
          app.use('/api', mod.default);
          console.log(`   ✅ 已加载路由: ${file}`);
        }
      }).catch((err) => {
        console.error(`   ❌ 路由加载失败 ${file}:`, err.message);
      });
    }
  });
} else {
  console.warn('⚠️ 路由目录不存在，请检查路径');
}

// ==========================================
// 6. 全局错误处理 (Global Error Handling)
// ==========================================

// Express 专属错误处理中间件 (必须放在所有路由之后)
app.use((err, req, res, next) => {
  console.error('❌ [Express Error]:', err.stack);
  res.status(500).json({
    message: '服务器内部错误',
    // 生产环境建议隐藏具体错误信息
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 处理未捕获的同步异常
process.on('uncaughtException', (err) => {
  console.error('💥 [Uncaught Exception]:', err);
  process.exit(1); // 退出进程，交由 PM2 等工具重启
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Unhandled Rejection] at:', promise, 'reason:', reason);
});

// ==========================================
// 7. 启动服务 (Start Server)
// ==========================================

/**
 * 启动策略：
 * 先执行数据库迁移，确保表结构正确。
 * 迁移成功后，再启动 HTTP 监听。
 * 这样可以避免服务启动后，接口因表结构缺失而报错。
 */
// runMigrations()
//   .then(() => {
    server.listen(PORT, () => {
      console.log('----------------------------------------');
      console.log(`✅ PersonalAI-Local 服务已启动`);
      console.log(`🚀 API 地址: http://localhost:${PORT}/api`);
      console.log(`📚 文档地址: http://localhost:${PORT}/api-docs`);
      console.log(`🌐 前端地址: http://localhost:${PORT}`);
      console.log('----------------------------------------');
    });
  // })
  // .catch((err) => {
  //   console.error('❌ [Startup Failed] 数据库迁移失败，服务终止:', err);
  //   process.exit(1);
  // });