@echo off
chcp 65001 >nul
echo =====================================
echo 正在安装PersonalAI-Local打包依赖（pkg）
echo =====================================
cd /d "%~dp0backend"
npm install
npm install -g pkg
echo.
echo =====================================
echo 依赖安装完成！可执行 02-一键打包成EXE.bat
echo =====================================
pause
exit