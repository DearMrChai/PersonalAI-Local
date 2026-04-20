<template>
  <div class="role-manager-container">
    <!-- 左侧：角色列表 -->
    <div class="list-panel">
      <div class="list-header">
        <h3>角色列表</h3>
        <el-button type="primary" size="small" @click="createNew">
          + 新建
        </el-button>
      </div>
      
      <el-input
        v-model="searchKey"
        placeholder="搜索角色..."
        prefix-icon="Search"
        clearable
        class="search-box"
      />

      <div class="list-content">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="role-card"
          :class="{ active: currentEditId === role.id }"
          @click="loadRoleToForm(role)"
        >
          <div class="card-avatar">{{ role.name.charAt(0) }}</div>
          <div class="card-info">
            <div class="card-name">{{ role.name }}</div>
            <div class="card-bio">{{ role.short_bio || '暂无简介' }}</div>
          </div>
        </div>
        <el-empty v-if="filteredRoles.length === 0" description="暂无角色" :image-size="60" />
      </div>
    </div>

    <!-- 右侧：编辑/详情面板 -->
    <div class="edit-panel">
      <div class="edit-header">
        <h3>{{ isEditing ? '编辑角色' : '新建角色' }}</h3>
        <div class="header-actions">
          <el-button 
            v-if="isEditing" 
            type="danger" 
            link 
            @click="handleDeleteCurrent"
          >
            删除
          </el-button>
        </div>
      </div>

      <div class="form-scroll-area">
        <el-form :model="form" label-width="90px" class="role-form">
          
          <!-- 1. 基础信息 -->
          <div class="form-section">
            <div class="section-title">基础信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称">
                  <el-input v-model="form.name" placeholder="角色名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年龄">
                  <el-input v-model="form.age" placeholder="例如: 18" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="头像URL">
              <el-input v-model="form.avatar" placeholder="https://..." />
            </el-form-item>
            <el-form-item label="短简介">
              <el-input v-model="form.short_bio" type="textarea" :rows="2" placeholder="一句话介绍" />
            </el-form-item>
            <el-row :gutter="20">
               <el-col :span="12">
                 <el-form-item label="语气">
                   <el-input v-model="form.tone" placeholder="温柔/高冷" />
                 </el-form-item>
               </el-col>
               <el-col :span="12">
                 <el-form-item label="性格">
                   <el-input v-model="form.personality" placeholder="开朗/内向" />
                 </el-form-item>
               </el-col>
            </el-row>
            <el-form-item label="开场白">
              <el-input v-model="form.opening" type="textarea" :rows="3" placeholder="第一次见面的话" />
            </el-form-item>
          </div>

          <!-- 2. 外貌与特征 -->
          <div class="form-section">
            <div class="section-title">外貌与特征</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="身高">
                  <el-input v-model="form.height" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="体型">
                  <el-input v-model="form.body_type" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="视觉风格">
                  <el-input v-model="form.visual_style" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="外貌描述">
              <el-input v-model="form.appearance" type="textarea" :rows="3" />
            </el-form-item>
          </div>

          <!-- 3. 背景与关系 -->
          <div class="form-section">
            <div class="section-title">背景与关系</div>
            <el-form-item label="详细描述">
              <el-input v-model="form.description" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="背景故事">
              <el-input v-model="form.background_story" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="与用户关系">
              <el-input v-model="form.relationship" placeholder="朋友/恋人/师徒" />
            </el-form-item>
          </div>

          <!-- 4. 标签系统 (重点优化) -->
          <div class="form-section">
            <div class="section-title">标签系统</div>
            <el-form-item label="通用标签">
              <el-select
                v-model="form.tagIds"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入新标签并回车"
                style="width: 100%"
                @change="handleTagChange"
              >
                <el-option
                  v-for="tag in allTags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="癖好 (Kinks)">
               <el-input 
                 v-model="form.kinksStr" 
                 type="textarea"
                 :rows="2"
                 placeholder="多个用逗号分隔" 
               />
            </el-form-item>
          </div>

          <!-- 5. 其他设定 -->
          <div class="form-section">
            <div class="section-title">兴趣与高级设定</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="喜欢">
                  <el-input v-model="form.likes" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="不喜欢">
                  <el-input v-model="form.dislikes" />
                </el-form-item>
              </el-col>
               <el-col :span="24">
                <el-form-item label="性方面">
                  <el-input v-model="form.sexual_personality"   type="textarea"
                :rows="4"/>
                </el-form-item>
              </el-col>
              
            </el-row>
            <el-form-item label="习惯">
              <el-input v-model="form.habits" />
            </el-form-item>
            <el-form-item label="声音风格">
              <el-input v-model="form.voice_style" />
            </el-form-item>
            <el-form-item label="示例对话">
              <el-input
                v-model="form.example_dialogs"
                type="textarea"
                :rows="4"
                placeholder="用户：你好&#10;角色：你好呀~"
              />
            </el-form-item>
          </div>

        </el-form>
      </div>

      <!-- 底部操作栏 -->
      <div class="form-footer">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting" style="width: 120px">
          {{ isEditing ? '更新角色' : '创建角色' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/api/characterApi";
import { getAllTags, createOrGetTag } from "@/api/tagApi";

// --- 状态 ---
const roles = ref([]);
const allTags = ref([]);
const searchKey = ref("");
const submitting = ref(false);
const currentEditId = ref(null); // 当前正在编辑的角色ID

// 表单数据
const form = ref({
  id: "",
  name: "",
  avatar: "",
  short_bio: "",
  age: "",
  personality: "",
  tone: "",
  opening: "",
  height: "",
  body_type: "",
  appearance: "",
  visual_style: "",
  description: "",
  background_story: "",
  relationship: "",
  likes: "",
  dislikes: "",
  habits: "",
  tagIds: [],
  kinksStr: "",
  voice_style: "",
  example_dialogs: "",
});

const isEditing = computed(() => !!currentEditId.value);

// 过滤列表
const filteredRoles = computed(() => {
  if (!searchKey.value) return roles.value;
  return roles.value.filter(r => r.name.includes(searchKey.value));
});

// --- 方法 ---

async function loadData() {
  try {
    const [charRes, tagRes] = await Promise.all([getAllCharacters(), getAllTags()]);
    roles.value = charRes.data || [];
    allTags.value = tagRes.data || [];
  } catch (err) {
    ElMessage.error("数据加载失败");
  }
}

// src/views/index/components/RoleManager.vue

// ... 其他代码 ...

// 加载角色到右侧表单
function loadRoleToForm(role) {
  currentEditId.value = role.id;
  
  // ... (原有的表单赋值逻辑保持不变) ...
  let tagIds = [];
  if (Array.isArray(role.tags)) {
    tagIds = role.tags.map(t => typeof t === 'object' ? t.id : t);
  }
  let kinksStr = "";
  if (Array.isArray(role.kinks)) kinksStr = role.kinks.join(',');
  else if (typeof role.kinks === 'string') kinksStr = role.kinks;

  form.value = {
    ...role,
    tagIds,
    kinksStr,
    example_dialogs: Array.isArray(role.example_dialogs) 
      ? role.example_dialogs.join('\n') 
      : (role.example_dialogs || ""),
  };

  localStorage.setItem("currentRole", JSON.stringify(role));

  // 【新增】触发全局事件，通知 Chat 组件角色已切换
  window.dispatchEvent(new CustomEvent("role-changed", { detail: role }));
}

// ... 其他代码 ...
// 新建模式
function createNew() {
  currentEditId.value = null;
  form.value = {
    id: "",
    name: "",
    avatar: "",
    short_bio: "",
    age: "",
    personality: "",
    tone: "",
    opening: "",
    height: "",
    body_type: "",
    appearance: "",
    visual_style: "",
    description: "",
    background_story: "",
    relationship: "",
    likes: "",
    dislikes: "",
    habits: "",
    tagIds: [],
    kinksStr: "",
    voice_style: "",
    example_dialogs: "",
  };
}

// 自动创建标签逻辑
async function handleTagChange(val) {
  const newTagsToCreate = val.filter(v => typeof v === 'string');
  if (newTagsToCreate.length > 0) {
    submitting.value = true;
    try {
      for (const tagName of newTagsToCreate) {
        const res = await createOrGetTag({ name: tagName, type: 'general' });
        const newTag = res.data;
        if (!allTags.value.find(t => t.id === newTag.id)) {
          allTags.value.push(newTag);
        }
        const index = form.value.tagIds.indexOf(tagName);
        if (index !== -1) form.value.tagIds[index] = newTag.id;
      }
      ElMessage.success("标签已自动创建");
    } catch (err) {
      ElMessage.error("标签创建失败");
    } finally {
      submitting.value = false;
    }
  }
}

// 提交保存
async function submitForm() {
  if (!form.value.name.trim()) return ElMessage.warning("名称不能为空");

  submitting.value = true;
  try {
    const kinksArray = form.value.kinksStr
      ? form.value.kinksStr.split(/[,，]/).map(s => s.trim()).filter(s => s)
      : [];
    const dialogsArray = form.value.example_dialogs
      ? form.value.example_dialogs.split('\n').filter(s => s.trim())
      : [];

    const requestData = {
      ...form.value,
      tags: form.value.tagIds,
      kinks: kinksArray,
      example_dialogs: dialogsArray,
      kinksStr: undefined,
      tagIds: undefined 
    };

    if (isEditing.value) {
      await updateCharacter(requestData);
      ElMessage.success("更新成功");
    } else {
      await createCharacter(requestData);
      ElMessage.success("创建成功");
      createNew(); // 创建后清空表单，方便继续建下一个
    }
    
    await loadData(); // 刷新列表
  } catch (err) {
    ElMessage.error("操作失败");
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

// 删除当前
async function handleDeleteCurrent() {
  if (!currentEditId.value) return;
  try {
    await ElMessageBox.confirm("确定删除该角色吗？", "警告", { type: "warning" });
    await deleteCharacter({ id: currentEditId.value });
    ElMessage.success("删除成功");
    createNew();
    await loadData();
  } catch (err) {
    if (err !== "cancel") ElMessage.error("删除失败");
  }
}

function resetForm() {
  if (currentEditId.value) {
    const role = roles.value.find(r => r.id === currentEditId.value);
    if (role) loadRoleToForm(role);
  } else {
    createNew();
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.role-manager-container {
  display: flex;
  height: 100%;
  width: 100%;
  background: #fff;
}

/* 左侧列表 */
.list-panel {
  width: 280px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.list-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.list-header h3 { margin: 0; font-size: 16px; }

.search-box {
  margin: 10px 15px;
  width: calc(100% - 30px);
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 10px;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.role-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.role-card.active {
  border-color: #FF7D24;
  background: #fff9f5;
}

.card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  overflow: hidden;
}
.card-name { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.card-bio { font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 右侧编辑区 */
.edit-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.edit-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.edit-header h3 { margin: 0; font-size: 18px; }

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
}

.role-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 30px;
  background: #fdfdfd;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #FF7D24;
}

.form-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
}
</style>