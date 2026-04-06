<template>
  <div class="chat-page" :style="{ background: chatBg }">
    <div class="chat-header">
      <div class="title">
        <span>与 {{ currentRole.name || "未选择角色" }}</span>
        <el-button size="small" @click="openUserSwitch" type="text">
          {{ currentUser.name || "选择身份" }}
        </el-button>
      </div>
      <el-button size="small" @click="clearChat" type="danger"
        >清空对话</el-button
      >
    </div>

    <div class="message-list" ref="msgList">
      <!-- 修复：字段名匹配 + 时间格式化 -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="msg-item"
        :class="{ user: msg.is_user }"
      >
        <div class="avatar">
          <!-- 修复：头像显示逻辑（使用force_avatar构建图片） -->
          <!-- <img :src="msg.force_avatar" alt="avatar" class="avatar-img" /> -->
           {{ msg.name.charAt(0) }}
        </div>
        <div class="bubble">
          <div class="name">{{ msg.name }}</div>
          <!-- 修复：消息内容使用mes字段，处理换行 -->
          <div class="content" v-html="formatContent(msg.mes)"></div>
          <!-- 修复：时间使用send_date并格式化 -->
          <div class="time">{{ formatTime(msg.send_date) }}</div>
        </div>
      </div>
      <div v-if="loading" class="loading">正在输入...</div>
    </div>

    <div class="chat-input-bar">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入消息"
        @keyup.enter="send"
      />
      <el-button
        type="primary"
        @click="send"
        :disabled="!currentRole.name || !inputText.trim()"
        >发送</el-button
      >
    </div>

    <el-dialog v-model="showUserDialog" title="切换用户身份" width="400px">
      <el-radio-group v-model="currentUser" @change="handleUserChange">
        <el-radio v-for="u in users" :key="u.id" :label="u">
          {{ u.name }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="showUserDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";

const currentRole = ref({});
const currentUser = ref({
  id: "default",
  name: "用户",
  avatar: "/thumbnail?type=persona&file=user-default.png",
});
const users = ref([]);
const messages = ref([]);
const inputText = ref("");
const loading = ref(false);
const showUserDialog = ref(false);
const chatBg = ref("#f0f2f5");
const msgList = ref(null);

// 加载用户列表（新增user.service接口）
async function loadUsers() {
  const r = await fetch("/api/getUsers");
  users.value = await r.json();
  const cu = localStorage.getItem("currentUser");
  if (cu) currentUser.value = JSON.parse(cu);
}

function saveCurrentUser() {
  localStorage.setItem("currentUser", JSON.stringify(currentUser.value));
}

// 改造：加载聊天记录（适配新结构）
async function loadChat() {
  if (!currentRole.value.name || !currentUser.value.name) return;
  const res = await fetch(
    `/api/chat-record?roleName=${encodeURIComponent(currentRole.value.name)}&userName=${encodeURIComponent(currentUser.value.name)}`,
  );
  const data = await res.json();

  // console.log("原始聊天记录数据：", data.data) ;
  // 修复：1.过滤metadata占位项 2.提取嵌套的message字段
  messages.value =
    data.data.chat
      ?.filter((item) => !item.chat_metadata) // 过滤元数据项
      .map((item) => item.message) // 提取message字段
      .filter(Boolean) || []; // 确保过滤空值

    // console.log("加载聊天记录：", messages.value);
  scrollToBottom();
}
// 改造：发送消息（适配新结构）
async function send() {
  const text = inputText.value.trim();
  if (!text) return;

  // 构建用户消息体（傻酒馆格式）
  const userMsg = {
    name: currentUser.value.name,
    is_user: true,
    is_system: false,
    send_date: new Date().toISOString(),
    mes: text,
    extra: { isSmallSys: false },
    force_avatar: currentUser.value.avatar,
    swipes: [],
    swipe_id: 0,
  };
  messages.value.push(userMsg);
  inputText.value = "";
  loading.value = true;
  scrollToBottom();

  // 保存用户消息到后端
  await saveChatMessage(userMsg);

  const prompt = buildPrompt();
  try {
    const resp = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        roleName: currentRole.value.name,
        userName: currentUser.value.name,
      }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    // 构建AI消息体（傻酒馆格式）
    const aiMsg = {
      name: currentRole.value.name,
      is_user: false,
      is_system: false,
      send_date: new Date().toISOString(),
      mes: "",
      extra: {
        isSmallSys: false,
        api: "llamacpp", // 预留
        model: "Llama-3-8B-Instruct-GGUF-Q4_K_M.gguf", // 预留
      },
      force_avatar: `${currentRole.value.name}.png`, // 预留
      swipes: [],
      swipe_id: 0,
      gen_started: new Date().toISOString(),
      gen_finished: null,
    };
    messages.value.push(aiMsg);
    scrollToBottom();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((i) => i.trim());
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") continue;
        const data = JSON.parse(json);
        const t = data.choices?.[0]?.text || "";
        aiMsg.mes += t;
        scrollToBottom();
      }
    }
    // 补全AI消息生成完成时间
    aiMsg.gen_finished = new Date().toISOString();
    // 保存AI消息到后端
    await saveChatMessage(aiMsg);
  } catch (e) {
    ElMessage.error("发送失败");
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

// 新增：保存单条消息到后端
async function saveChatMessage(message) {
  await fetch("/api/chat-record/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roleName: currentRole.value.name,
      userName: currentUser.value.name,
      message,
    }),
  });
}

// 改造：构建Prompt（适配新消息结构）
function buildPrompt() {
  const r = currentRole.value;
  let prompt = `
【角色】${r.name}
性格：${r.personality}
语气：${r.tone}
场景：${r.scenario}
`;
  messages.value.forEach((m) => {
    prompt += `${m.name}：${m.mes}\n`;
  });
  prompt += `${r.name}：`;
  return prompt;
}

// 改造：清空聊天记录
async function clearChat() {
  if (!confirm("清空？")) return;
  
  try {
    // 构造请求体参数
    const postData = {
      roleName: currentRole.value.name,
      userName: currentUser.value.name
    };

    const response = await fetch('/api/chat-record/clear', {
      method: "POST",
      headers: {
        // 必须指定JSON格式，否则后端req.body解析不到参数
        "Content-Type": "application/json",
      },
      // 将参数转为JSON字符串放入body
      body: JSON.stringify(postData)
    });

    // 处理HTTP状态码异常
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `请求失败：${response.status}`);
    }

    // 清空前端本地消息列表
    messages.value = [];
    ElMessage.success("聊天记录已清空");
  } catch (error) {
    // 捕获所有异常并提示
    console.error("清空聊天记录失败：", error);
    ElMessage.error(`清空失败：${error.message}`);
  }
}

// 修复：格式化时间显示（适配ISOString）
function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// 新增：处理消息内容换行（将\n转为<br>）
function formatContent(content) {
  if (!content) return "";
  return content.replace(/\n/g, "<br>");
}

function scrollToBottom() {
  nextTick(() => {
    const el = msgList.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function openUserSwitch() {
  showUserDialog.value = true;
}

// 新增：切换用户后先保存再加载聊天记录
async function handleUserChange() {
  saveCurrentUser();
  await loadChat();
}

onMounted(async () => {
  await loadUsers();
  const cr = localStorage.getItem("currentRole");
  if (cr) currentRole.value = JSON.parse(cr);
  // 初始化仅调用一次loadChat
  await loadChat();
});

// 移除currentRole的自动watch触发，仅保留业务需要的主动触发
watch(
  () => currentRole.value,
  async (newVal, oldVal) => {
    // 仅当角色真的变化时才处理（避免初始化空值赋值触发）
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal) && newVal.name) {
      localStorage.setItem("currentRole", JSON.stringify(newVal));
    }
  },
  { deep: true },
);

// 移除currentUser的自动watch触发，改为切换时手动调用
watch(
  () => currentUser.value,
  async (newVal, oldVal) => {
    // 仅做监听，不主动触发loadChat（交给切换时的handleUserChange）
  },
  { deep: true },
);

// 角色切换的全局监听保留（业务主动触发）
window.addEventListener("role-changed", async () => {
  const cr = localStorage.getItem("currentRole");
  if (cr) {
    currentRole.value = JSON.parse(cr);
    // 主动切换角色时手动加载聊天记录
    await loadChat();
  }
});
</script>

<style scoped>
/* 修复：头像图片样式 */
.avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}
.chat-header {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header .title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}
.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.msg-item {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-end;
}
.msg-item.user {
  flex-direction: row-reverse;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin: 0 8px;
  flex-shrink: 0;
  overflow: hidden; /* 新增：防止头像溢出 */
}
.bubble {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 12px;
  background: #ffffff;
  position: relative;
}
.msg-item.user .bubble {
  background: #95ec69;
}
.bubble .name {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.bubble .content {
  white-space: pre-wrap; /* 新增：保留换行和空格 */
  word-break: break-all; /* 新增：防止长文本溢出 */
}
.bubble .time {
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}
.chat-input-bar {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.chat-input-bar .el-input {
  flex: 1;
}
.loading {
  text-align: center;
  color: #999;
  padding: 8px;
  font-size: 12px;
}
</style>
