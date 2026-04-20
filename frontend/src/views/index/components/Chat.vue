<template>
  <div class="chat-page" :style="{ background: chatBg }">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="title">
        <span class="role-name">
          <el-avatar 
            v-if="currentRole.avatar" 
            :size="24" 
            :src="currentRole.avatar" 
            style="margin-right: 8px; vertical-align: middle;"
          />
          {{ currentRole.name || "未选择角色" }}
        </span>
        <el-button size="small" @click="openUserSwitch" type="text" class="user-switch-btn">
          <el-icon><User /></el-icon>
          {{ currentUser.name || "选择身份" }}
        </el-button>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="clearChat" type="danger" plain :disabled="!currentRole.id">
          清空对话
        </el-button>
      </div>
    </div>

    <!-- 消息列表区域 -->
   <div class="message-list" ref="msgList">
      <div v-if="messages.length === 0" class="empty-state">
        <el-empty description="还没有聊天记录，打个招呼吧~" :image-size="80" />
      </div>

      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="msg-item"
        :class="{ user: msg.is_user }"
      >
        <div class="avatar" :style="{ background: getAvatarColor(msg) }">
          <img 
            v-if="getAvatarUrl(msg)" 
            :src="getAvatarUrl(msg)" 
            alt="avatar" 
            class="avatar-img"
            @error="handleImgError"
          />
          <span v-else>{{ getMessageInitial(msg) }}</span>
        </div>
        
        <div class="bubble">
          <div class="name">{{ msg.name }}</div>
          
          <!-- 如果消息内容为空且正在加载，显示加载动画，否则显示内容 -->
          <div v-if="!msg.mes && loading && !msg.is_user" class="loading-content">
             <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
          <div v-else class="content" v-html="formatContent(msg.mes)"></div>
          
          <div class="time">{{ formatTime(msg.send_date) }}</div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="chat-input-bar">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        @keydown.enter.exact.prevent="send"
        :disabled="loading || !currentRole.id"
      />
      <el-button
        type="primary"
        @click="send"
        :loading="loading"
        :disabled="!currentRole.id || !inputText.trim()"
        class="send-btn"
      >
        发送
      </el-button>
    </div>

    <!-- 用户切换弹窗 -->
    <el-dialog v-model="showUserDialog" title="切换用户身份" width="400px">
      <el-radio-group v-model="selectedUserTemp" class="user-radio-group">
        <el-radio v-for="u in users" :key="u.id" :label="u" border>
          {{ u.name }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="showUserDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUserChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { User } from "@element-plus/icons-vue";

// --- 状态定义 ---
const currentRole = ref({});
const currentUser = ref({
  id: "default",
  name: "用户",
  avatar: ""
});
const users = ref([]);
const messages = ref([]);
const inputText = ref("");
const loading = ref(false);
const showUserDialog = ref(false);
const selectedUserTemp = ref({});
const chatBg = ref("#f5f7fa");
const msgList = ref(null);

// --- 初始化与生命周期 ---

onMounted(async () => {
  await loadUsers();
  
  // 1. 恢复当前用户
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser);
    } catch (e) { console.error(e); }
  }

  // 2. 恢复当前角色
  const savedRole = localStorage.getItem("currentRole");
  if (savedRole) {
    try {
      currentRole.value = JSON.parse(savedRole);
      await loadChatHistory();
    } catch (e) { console.error(e); }
  }

  // 3. 绑定全局角色切换事件
  window.addEventListener("role-changed", handleRoleChangedEvent);
});

onUnmounted(() => {
  window.removeEventListener("role-changed", handleRoleChangedEvent);
});

// --- 核心逻辑 ---

/**
 * 处理来自 RoleManager 的全局事件
 */
function handleRoleChangedEvent(event) {
  const newRole = event.detail;
  if (newRole && newRole.id !== currentRole.value.id) {
    console.log("[Chat] 检测到角色切换:", newRole.name);
    currentRole.value = newRole;
    messages.value = []; 
    loadChatHistory();
  }
}

/**
 * 加载用户列表 (Mock)
 */
async function loadUsers() {
  try {
    users.value = [
      { id: "default", name: "用户", avatar: "" },
      { id: "guest", name: "访客", avatar: "" }
    ];
    
    if (!currentUser.value.id) {
      currentUser.value = users.value[0];
    }
    selectedUserTemp.value = { ...currentUser.value };
  } catch (error) {
    console.error("加载用户失败", error);
  }
}

/**
 * 加载聊天记录
 * 接口: GET /api/chat-record?roleName=xxx&userName=xxx
 */
/**
 * 加载聊天记录
 * 接口: GET /api/chat-record?roleName=xxx&userName=xxx
 */
async function loadChatHistory() {
  if (!currentRole.value.name || !currentUser.value.name) return;

  try {
    const url = `/api/chat-record?roleName=${encodeURIComponent(currentRole.value.name)}&userName=${encodeURIComponent(currentUser.value.name)}`;
    const res = await fetch(url);
    const result = await res.json();

    // 后端返回结构: { code: 200, data: { chat: [...] } }
    if (result.code === 200 && result.data && result.data.chat) {
      const rawChatList = result.data.chat;

      // 1. 过滤出有效的消息对象
      // 有效消息特征：有 'mes' 字段，且没有 'chat_metadata' 字段
      const validMessages = rawChatList.filter(item => {
        // 排除元数据头
        if (item.chat_metadata) return false;
        
        // 排除旧版/错误版的嵌套结构 (即包含 roleName 和 message 字段的)
        // 这种结构通常是因为之前 saveChatRecord 调用方式不对导致的
        if (item.roleName && item.message) return false;

        // 保留标准结构 (有 mes 字段)
        return item.mes !== undefined;
      });

      // 2. 数据清洗（可选）：确保字段一致性
      messages.value = validMessages.map(msg => ({
        name: msg.name,
        is_user: msg.is_user,
        mes: msg.mes,
        send_date: msg.send_date,
        force_avatar: msg.force_avatar || (msg.is_user ? currentUser.value.avatar : currentRole.value.avatar),
        extra: msg.extra || {},
        swipes: msg.swipes || [],
        swipe_id: msg.swipe_id || 0,
        gen_started: msg.gen_started,
        gen_finished: msg.gen_finished
      }));

      console.log(`[Chat] 成功加载 ${messages.value.length} 条历史记录`);
    } else {
      messages.value = [];
    }
  } catch (error) {
    console.warn("加载历史记录失败:", error);
    messages.value = [];
  } finally {
    scrollToBottom();
  }
}

/**
 * 发送消息
 * 接口: POST /api/chat/stream
 */
/**
 * 发送消息
 */
async function send() {
  const text = inputText.value.trim();
  
  if (!text) return;
  if (loading.value) return;
  if (!currentRole.value || !currentRole.value.id) {
    ElMessage.warning("请先选择一个角色");
    return;
  }

  // 1. 构建并显示用户消息
  const userMsg = {
    name: currentUser.value.name,
    is_user: true,
    mes: text,
    send_date: new Date().toISOString(),
    force_avatar: currentUser.value.avatar,
    extra: { isSmallSys: false },
    swipes: [],
    swipe_id: 0
  };
  
  messages.value.push(userMsg);
  inputText.value = "";
  loading.value = true; // 开启加载状态
  scrollToBottom();

  // 2. 准备 AI 消息占位符 (mes 为空)
  const aiMsg = {
    name: currentRole.value.name,
    is_user: false,
    mes: "",
    send_date: new Date().toISOString(),
    force_avatar: currentRole.value.avatar, 
    extra: { isSmallSys: false },
    swipes: [],
    swipe_id: 0,
    gen_started: new Date().toISOString(),
    gen_finished: null
  };
  messages.value.push(aiMsg);
  scrollToBottom();

  let isStreamDone = false; // 标记流是否自然结束

  try {
    // 3. 调用后端流式接口
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: currentRole.value.id,
        message: text,
        history: getHistoryForContext(),
        userName: currentUser.value.name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 4. 处理流式响应
    while (true) {
      const { done, value } = await reader.read();
      
      // 【关键修复1】如果后端关闭连接，done 会为 true
      if (done) {
        console.log("[Chat] 流读取完毕 (done=true)");
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          
          // 【关键修复2】明确检查 DONE 标记
          if (jsonStr === "[DONE]") {
            console.log("[Chat] 收到 [DONE] 标记");
            isStreamDone = true;
            break; // 跳出 for 循环，随后 while 也会因为逻辑判断或下次 read 结束
          }
          
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            
            // 适配 chat.controller.js 返回的格式: { type: 'chunk', text: '...' }
            if (data.type === 'chunk' && data.text) {
              aiMsg.mes += data.text;
              scrollToBottom();
            } 
            // 【关键修复3】检查后端发送的 type: 'done'
            else if (data.type === 'done') {
              console.log("[Chat] 收到 type:done 信号");
              isStreamDone = true;
              break;
            }
            else if (data.type === 'error') {
               ElMessage.error(data.message || "生成过程中出错");
               aiMsg.mes += `\n[错误: ${data.message}]`;
               isStreamDone = true; // 出错也视为结束
               break;
            }
          } catch (e) {
            console.warn("JSON Parse Error in Stream:", e);
          }
        }
      }
      
      // 如果收到了结束信号，主动跳出 while 循环
      if (isStreamDone) break;
    }

    // 5. 生成结束，标记完成时间
    aiMsg.gen_finished = new Date().toISOString();
    console.log("[Chat] 生成完全结束，准备保存");

    // 6. 异步保存两条消息到后端
    // 即使保存失败，也不应影响前端体验，所以放在 try-catch 外或单独捕获
    // saveMessageToBackend(userMsg);
    // saveMessageToBackend(aiMsg);

  } catch (error) {
    console.error("发送失败:", error);
    ElMessage.error("发送消息失败，请检查后端服务");
    
    // 错误处理：如果 AI 还没开始说话，移除气泡；如果说了，标记中断
    if (aiMsg.mes === "") {
      messages.value.pop();
    } else {
      aiMsg.mes += "\n[连接中断]";
    }
  } finally {
    // 【关键修复4】无论发生什么，必须关闭 loading 状态
    loading.value = false;
    scrollToBottom();
    console.log("[Chat] loading 状态已重置为 false");
  }
}
/**
 * 单条消息保存到后端
 */
// async function saveMessageToBackend(messageObj) {
//   try {
//     await fetch("/api/chat-record/save", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         roleName: currentRole.value.name,
//         userName: currentUser.value.name,
//         message: messageObj // 整个 message 对象作为新消息体
//       })
//     });
//   } catch (e) {
//     console.error("保存单条消息失败", e);
//   }
// }

/**
 * 获取用于上下文的最近历史记录
 */
function getHistoryForContext() {
  // 排除最后两条：刚添加的用户消息 和 空的AI消息
  const historySource = messages.value.slice(0, -2); 
  const limit = 20; 
  const recentHistory = historySource.slice(-limit);

  return recentHistory.map(m => ({
    role: m.is_user ? 'user' : 'assistant',
    content: m.mes
  }));
}

/**
 * 清空对话
 * 接口: POST /api/chat-record/clear
 */
async function clearChat() {
  if (!currentRole.value.id) return;
  
  try {
    await ElMessageBox.confirm("确定要清空与当前角色的所有聊天记录吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res = await fetch("/api/chat-record/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roleName: currentRole.value.name,
        userName: currentUser.value.name
      })
    });

    const result = await res.json();
    if (result.code === 200) {
      messages.value = [];
      ElMessage.success("聊天记录已清空");
    } else {
      ElMessage.error(result.msg || "清空失败");
    }
  } catch (e) {
    if (e !== "cancel") {
      console.error("清空聊天记录异常:", e);
      ElMessage.error("清空操作失败");
    }
  }
}

// --- 辅助函数 ---

function openUserSwitch() {
  selectedUserTemp.value = { ...currentUser.value };
  showUserDialog.value = true;
}

function confirmUserChange() {
  currentUser.value = selectedUserTemp.value;
  localStorage.setItem("currentUser", JSON.stringify(currentUser.value));
  showUserDialog.value = false;
  ElMessage.success(`已切换至: ${currentUser.value.name}`);
  messages.value = [];
  loadChatHistory();
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function formatContent(content) {
  if (!content) return "";
  return content.replace(/\n/g, "<br>");
}

function getAvatarUrl(msg) {
  // 优先使用 force_avatar，如果是 AI 且没有 force_avatar，尝试使用角色头像
  if (msg.force_avatar) return msg.force_avatar;
  if (!msg.is_user && currentRole.value.avatar) return currentRole.value.avatar;
  return null;
}

function getAvatarColor(msg) {
  return msg.is_user ? '#409eff' : '#FF7D24';
}

function getMessageInitial(msg) {
  return msg.name ? msg.name.charAt(0) : '?';
}

function handleImgError(e) {
  e.target.style.display = 'none';
}

function scrollToBottom() {
  nextTick(() => {
    if (msgList.value) {
      msgList.value.scrollTop = msgList.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
/* 保持你原有的样式不变，这里仅做少量补充以确保完整性 */
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  position: relative;
}

.chat-header {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  z-index: 10;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.user-switch-btn {
  font-size: 13px;
  color: #909399;
  padding: 4px 8px;
  border-radius: 12px;
}
.user-switch-btn:hover {
  background: #f2f6fc;
  color: #409eff;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.msg-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  animation: fadeIn 0.3s ease;
}

.msg-item.user {
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  margin: 0 12px;
}

.msg-item.user .bubble {
  background: #95ec69;
  color: #000;
  border-top-right-radius: 2px;
}

.msg-item:not(.user) .bubble {
  border-top-left-radius: 2px;
}

.bubble .name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 500;
}

.msg-item.user .bubble .name {
  text-align: right;
}

.bubble .content {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubble .time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 6px;
  text-align: right;
}

.loading-bubble {
  padding: 15px 20px;
  display: flex;
  gap: 4px;
  align-items: center;
}
.dot {
  width: 6px;
  height: 6px;
  background: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input-bar {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input-bar :deep(.el-textarea__inner) {
  resize: none;
  padding: 10px 12px;
  font-size: 14px;
}

.send-btn {
  min-width: 80px;
  height: 40px;
}
</style>