<template>
  <!-- 外层：全屏背景 + 居中容器 -->
  <div class="app-background">
    <div class="app-container">

      <!-- 中间：聊天窗口（固定宽度，永远居中） -->
      <div class="chat-wrap">
        <Chat />
      </div>

      <!-- 右侧：角色管理面板（可收起，高级美观） -->
      <div class="role-sidebar" :class="{ show: showRoleSidebar }">
        <button class="toggle-btn" @click="showRoleSidebar = !showRoleSidebar">
          <span v-if="showRoleSidebar">›</span>
          <span v-else>‹</span>
        </button>
        <div class="role-content">
          <RoleManager @role-selected="onRoleSelected" />
        </div>
      </div>

      <!-- 绘图面板：默认隐藏，需要再开 -->
      <div class="draw-modal" v-if="showDraw">
        <div class="draw-body">
          <button class="close-draw" @click="showDraw = false">关闭</button>
          <Draw />
        </div>
      </div>

      <!-- 打开绘图按钮 -->
      <button class="draw-toggle" @click="showDraw = true">绘图</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RoleManager from './components/RoleManager.vue'
import Chat from './components/Chat.vue'
import Draw from './components/Draw.vue'

const currentRole = ref(null)

// 角色面板默认展开
const showRoleSidebar = ref(true)
// 绘图面板默认关闭
const showDraw = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('currentRole')
  if (stored) {
    currentRole.value = JSON.parse(stored)
  }
})

function onRoleSelected(role) {
  currentRole.value = role
  localStorage.setItem('currentRole', JSON.stringify(role))
  window.dispatchEvent(new Event('role-changed'))
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 全局背景（你以后可以换成图片） */
.app-background {
  width: 100vw;
  min-height: 100vh;
  background: #f0f2f5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-container {
  position: relative;
  width: 100%;
  max-width: 1600px;
  height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ============================
   中间聊天窗口（固定美观）
============================ */
.chat-wrap {
  width: 700px;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 10;
}

/* ============================
   右侧角色栏 —— 高级美观版
============================ */
.role-sidebar {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  height: calc(100vh - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
}

/* 收起状态（滑到屏幕外） */
.role-sidebar:not(.show) {
  transform: translateX(calc(100% + 20px));
}

/* 开关按钮（圆形箭头按钮，完美修复） */
.toggle-btn {
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: #FF7D24;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(255, 125, 36, 0.3);
  z-index: 101;
}

/* 角色栏内容区域 */
.role-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

/* ============================
   绘图按钮（美观悬浮）
============================ */
.draw-toggle {
  position: fixed;
  left: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 14px;
  border: none;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  cursor: pointer;
  z-index: 999;
}

/* ============================
   绘图弹窗
============================ */
.draw-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.draw-body {
  width: 90%;
  max-width: 800px;
  height: 80vh;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.close-draw {
  position: absolute;
  right: 20px;
  top: 20px;
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10000;
}
</style>