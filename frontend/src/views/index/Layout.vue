<template>
  <div class="main-layout">
    <div class="left-role">
      <RoleManager @role-selected="onRoleSelected" />
    </div>
    <div class="center-chat">
      <Chat />
    </div>
    <div class="right-draw">
      <Draw />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RoleManager from './components/RoleManager.vue'
import Chat from './components/Chat.vue'
import Draw from './components/Draw.vue'

const currentRole = ref(null)

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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  height: 100%;
  overflow: hidden;
}
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}
.left-role {
  width: 320px;
  background: #fff;
  border-right: 1px solid #eee;
  overflow-y: auto;
}
.center-chat {
  flex: 1;
  overflow: hidden;
}
.right-draw {
  width: 380px;
  background: #fff;
  border-left: 1px solid #eee;
  padding: 16px;
  overflow-y: auto;
}
</style>