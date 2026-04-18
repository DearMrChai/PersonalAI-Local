PersonalAI-Local
本地化、高自由度的 AI 角色互动平台 Status: Phase 2 - Core Chat Streaming Implementation

📖 项目简介
PersonalAI-Local 旨在为用户提供一个完全运行在本地环境的 AI 伴侣/角色扮演平台。不同于云端服务，本项目强调数据隐私、无限制的角色定制以及低延迟的本地推理。

当前版本已实现完整的角色与标签管理系统，下一步将聚焦于核心的流式聊天体验重构。

🏗️ 技术架构
后端 (Backend)
Runtime: Node.js (ES Modules)
Framework: Express.js
Database: SQLite (via better-sqlite3)
AI Engine: Llama.cpp (Local Inference)
Architecture: Layered Architecture
Routes: API 入口与 Swagger 文档定义
Controllers: 请求校验与响应标准化 (responseUtil)
Services: 核心业务逻辑与事务处理
Repositories: 数据库原子操作与 SQL 封装
前端 (Frontend)
Framework: Vue 3 (Composition API)
UI Library: Element Plus
State Management: Reactive Refs / LocalStorage (轻量级，计划引入 Pinia)
HTTP Client: Axios (Interceptors for unified error handling)
🚀 核心功能模块
1. 角色管理系统 (Character Manager) ✅
多维人设定制：支持基础信息、外貌特征、背景故事、兴趣习惯、高级设定（声音、示例对话）等 20+ 字段。
双栏沉浸式编辑：左侧列表快速切换，右侧实时编辑，提升配置效率。
数据持久化：本地 SQLite 存储，支持 JSON 字段序列化（如示例对话、癖好列表）。
2. 标签系统 (Tag System) ✅
独立标签库：支持通用、性格、癖好等多种标签类型。
智能关联：角色与标签通过 character_tags 联表管理，支持多对多关系。
Upsert 机制：前端输入新标签时自动创建或复用已有标签，减少维护成本。
3. 聊天交互 (Chat Interface) 🚧 In Progress
当前状态：基础 UI 骨架已完成。
下一步计划：
实现 Server-Sent Events (SSE) 流式输出，模拟真实打字机效果。
集成 Llama.cpp 本地推理接口。
实现上下文记忆管理（Session Context）。
📂 项目结构
text
PersonalAI-Local/
├── backend/
│   ├── src/
│   │   ├── controllers/      # 控制层 (Standardized Response)
│   │   ├── routes/           # 路由层 (Swagger Docs)
│   │   ├── services/         # 业务逻辑层
│   │   ├── models/
│   │   │   ├── entities/     # 数据模型定义
│   │   │   └── repositories/ # 数据访问层 (SQL Encapsulation)
│   │   └── utils/            # 工具类 (Response Util, DB Connection)
│   └── database.sqlite       # 本地数据库文件
├── frontend/
│   ├── src/
│   │   ├── api/              # API 封装 (characterApi, tagApi)
│   │   ├── views/
│   │   │   └── index/
│   │   │       ├── Layout.vue        # 主布局 (Tab Switching)
│   │   │       └── components/
│   │   │           ├── RoleManager.vue  # 角色管理 (Dual-Column)
│   │   │           ├── TagManager.vue   # 标签管理
│   │   │           └── Chat.vue         # 聊天窗口 (To be Refactored)
│   │   └── App.vue
└── README.md
🛠️ 快速开始
后端启动
bash
cd backend
npm install
node src/app.js
# Swagger Docs available at: http://localhost:3000/api-docs
前端启动
bash
cd frontend
npm install
npm run dev
📅 开发路线图 (Roadmap)
阶段	目标	状态	关键任务
Phase 1	骨架与数据流	✅ Done	完成角色/标签 CRUD，确立四层架构，Swagger 文档化
Phase 2	核心聊天流	🚧 Coding	实现 SSE 流式输出，对接 Llama 本地模型，处理中断与错误
Phase 3	状态与记忆	⏳ Pending	引入 Pinia 管理全局状态，实现聊天记录持久化与上下文衔接
Phase 4	UI/UX 精细化	⏳ Pending	引入 Tailwind/Shadcn，优化动画与响应式，深色模式支持
💡 开发心得与策略
后端优先：先确保 API 稳定且文档清晰，前端调用才能无忧。
模块化解耦：角色与标签分离，便于独立测试与维护。
敏捷迭代：不追求一次性完美，先跑通核心链路（选角->聊天），再在使用中修复 Bug 和优化体验。
🤝 贡献与反馈
本项目为个人独立开发，旨在探索本地 AI 应用的最佳实践。欢迎任何关于架构优化或 AI 推理性能的建议。

(Last Updated: 2026-04-18)