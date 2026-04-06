@echo off
chcp 65001 >nul
echo 正在关闭PersonalAI-Local服务...
taskkill /f /im PersonalAI-Local.exe
taskkill /f /im node.exe
echo 服务已关闭！
pause