@echo off
chcp 65001 >nul
echo =====================================
echo 启动 PersonalAI-Local 后端服务
echo =====================================
cd /d "D:\NSWFAI\无限制ai开发\PersonalAI-Local\backend"
start "PersonalAI-Local-Backend" node server.js

echo =====================================
echo 启动 PersonalAI-Local 前端服务
echo =====================================
cd /d "D:\NSWFAI\无限制ai开发\PersonalAI-Local\frontend"
start "PersonalAI-Local-Frontend" npm run dev

echo =====================================
echo 所有服务启动中...
echo 前端地址：http://localhost:5173
echo 后端地址：http://localhost:3000
echo =====================================
pause >nul
exit