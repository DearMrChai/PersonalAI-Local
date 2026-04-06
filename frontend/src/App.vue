<template>
  <div id="app">
    <!-- 路由出口：配置页/主布局切换 -->
    <router-view />
  </div>
</template>

<script setup>
// 无需额外逻辑，仅作为路由容器
</script>

<style>
/* 全局样式重置，配合Layout.vue的100vh布局 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  overflow: hidden;
  font-family: "Microsoft YaHei", sans-serif;
}
</style>