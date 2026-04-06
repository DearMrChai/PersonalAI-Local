@echo off
chcp 65001 >nul
title PersonalAI-Local一键打包工具
set root_path=%~dp0
set front_path=%root_path%frontend
set back_path=%root_path%backend
set release_path=%root_path%release

echo =====================================
echo 🔧 PersonalAI-Local 一键打包成EXE
echo 项目根目录：%root_path%
echo =====================================
echo.

:: 第一步：打包Vue前端为静态文件dist
echo [1/4] 正在打包前端Vue项目...
cd /d "%front_path%"
if not exist "package.json" (
  echo ❌ 错误：前端目录未找到package.json，请检查路径！
  pause
  exit
)
npm run build
if not exist "dist" (
  echo ❌ 错误：前端打包失败，未生成dist文件夹！
  pause
  exit
)
echo ✅ 前端打包完成，已生成dist静态文件！
echo.

:: 第二步：创建release输出目录
echo [2/4] 正在准备打包输出目录...
if not exist "%release_path%" (
  md "%release_path%"
)
echo ✅ 输出目录已准备：%release_path%
echo.

:: 第三步：后端打包成EXE
echo [3/4] 正在打包后端为EXE文件（包含Node运行环境）...
cd /d "%back_path%"
if not exist "server.js" (
  echo ❌ 错误：后端目录未找到server.js，请检查路径！
  pause
  exit
)
pkg .
echo.

:: 第四步：校验并提示完成
echo [4/4] 打包完成！正在校验文件...
if exist "%release_path%\PersonalAI-Local.exe" (
  echo ✅ 打包成功！EXE文件位置：
  echo %release_path%\PersonalAI-Local.exe
  echo.
  echo 📌 使用说明：
  echo 1. 双击PersonalAI-Local.exe，直接启动服务（无需安装任何环境）
  echo 2. 打开浏览器访问：http://localhost:3000 即可进入系统
  echo 3. 首次使用请在配置页填写llama/ComfyUI路径
) else (
  echo ❌ 打包失败！未在release目录找到EXE文件，请查看上方日志！
)
echo.
echo =====================================
echo 打包流程结束
echo =====================================
pause
exit