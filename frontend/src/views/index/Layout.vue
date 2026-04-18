<template>
  <!-- 外层：全屏背景 + 居中容器 -->
  <div class="app-background">
    <div class="app-container">

      <!-- 中间：聊天窗口（固定宽度，永远居中） -->
      <div class="chat-wrap">
        <Chat />
      </div>

      <!-- 右侧：多功能面板（可收起） -->
      <div class="role-sidebar" :class="{ show: showRoleSidebar }">
        <!-- 开关按钮 -->
        <button class="toggle-btn" @click="showRoleSidebar = !showRoleSidebar">
          <span v-if="showRoleSidebar">›</span>
          <span v-else>‹</span>
        </button>

        <!-- 面板内容区 -->
        <div class="panel-container">
          <!-- 顶部 Tab 切换 -->
          <div class="panel-tabs">
            <button 
              :class="{ active: currentTab === 'role' }" 
              @click="currentTab = 'role'"
            >
              角色管理
            </button>
            <button 
              :class="{ active: currentTab === 'tag' }" 
              @click="currentTab = 'tag'"
            >
              标签管理
            </button>
          </div>

          <!-- 内容区域：根据 Tab 显示不同组件 -->
          <div class="panel-content">
            <RoleManager v-if="currentTab === 'role'" @role-selected="onRoleSelected" />
            <TagManager v-if="currentTab === 'tag'" />
          </div>
        </div>
      </div>

      <!-- 绘图面板：默认隐藏 -->
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
import TagManager from './components/TagManager.vue' // 引入新组件
import Chat from './components/Chat.vue'
import Draw from './components/Draw.vue'

const currentRole = ref(null)
const showRoleSidebar = ref(true)
const showDraw = ref(false)

// 新增：当前面板 Tab 状态 ('role' | 'tag')
const currentTab = ref('role')

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

.app-background {
  width: 100vw;
  min-height: 100vh;
  background: #f0f2f5;
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
   中间聊天窗口
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
   右侧多功能面板
============================ */
.role-sidebar {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 880px; /* 稍微加宽一点，方便看标签 */
  height: calc(100vh - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.role-sidebar:not(.show) {
  transform: translateX(calc(100% + 20px));
}

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

/* 新增：面板内部布局 */
.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* 新增：Tab 样式 */
.panel-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0 10px;
  background: #fafafa;
  border-radius: 16px 16px 0 0;
}

.panel-tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.panel-tabs button:hover {
  color: #FF7D24;
  background: #f0f0f0;
}

.panel-tabs button.active {
  color: #FF7D24;
  border-bottom-color: #FF7D24;
  background: #fff;
}

/* 新增：内容区域 */
.panel-content {
  flex: 1;
  overflow: hidden; /* 让内部组件自己处理滚动 */
  position: relative;
}

/* ============================
   绘图相关样式保持不变
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