<template>
  <div class="role-manager">
    <div class="header">
      <h3>角色管理</h3>
      <el-button type="primary" size="small" @click="openEdit()"
        >+ 新建</el-button
      >
    </div>

    <div class="role-list">
      <div
        class="role-item"
        v-for="role in roles"
        :key="role.name"
        :class="{ active: isCurrent(role) }"
        @click="useRole(role)"
      >
        <div class="avatar">{{ role.name.charAt(0) }}</div>

        <div class="info">
          <div class="name">{{ role.name }}</div>
          <div class="desc">{{ role.personality || "未设置" }}</div>
        </div>

        <div class="btns" @click.stop>
          <el-button size="small" type="success" @click="openEdit(role)">
            编辑
          </el-button>
          <!-- 新增删除按钮 -->
          <el-button size="small" type="danger" @click="deleteCharacterv1(role.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showDialog"
      title="编辑角色"
      width="550px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <el-collapse v-model="activeCollapse">
          <!-- 第一层：基础信息 -->
          <el-collapse-item title="基础信息" name="base">
            <el-form-item label="角色名称">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="头像">
              <el-input v-model="form.avatar" placeholder="头像URL" />
            </el-form-item>
            <el-form-item label="短简介">
              <el-input v-model="form.short_bio" />
            </el-form-item>
            <el-form-item label="性格标签">
              <el-select v-model="form.personality" multiple filterable allow-create>
          <!-- 可多选 -->
              </el-select>
            </el-form-item>
            <el-form-item label="语气">
              <el-input v-model="form.tone" />
            </el-form-item>
            <el-form-item label="开场白">
              <el-input v-model="form.opening" type="textarea" />
            </el-form-item>
          </el-collapse-item>

          <!-- 第二层：深度设定（重点加强） -->
          <el-collapse-item title="深度设定" name="depth">
            <el-form-item label="详细描述">
              <el-input v-model="form.description" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="背景故事">
              <el-input
          v-model="form.background_story"
          type="textarea"
          :rows="4"
              />
            </el-form-item>
            <el-form-item label="与用户的关系">
              <el-input v-model="form.relationship" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="form.age" />
            </el-form-item>
            <el-form-item label="身高">
              <el-input v-model="form.height" />
            </el-form-item>
            <el-form-item label="体型">
              <el-input v-model="form.body_type" />
            </el-form-item>
            <el-form-item label="外貌">
              <el-input v-model="form.appearance" />
            </el-form-item>
            <el-form-item label="喜欢">
              <el-input v-model="form.likes" />
            </el-form-item>
            <el-form-item label="不喜欢">
              <el-input v-model="form.dislikes" />
            </el-form-item>
            <el-form-item label="习惯">
              <el-input v-model="form.habits" />
            </el-form-item>
            <el-form-item label="性方面性格">
              <el-input v-model="form.sexual_personality" type="textarea" />
            </el-form-item>
          </el-collapse-item>

          <!-- 第三层：标签系统 -->
          <el-collapse-item title="标签系统" name="tags">
            <el-form-item label="通用标签">
              <el-select v-model="form.tags" multiple filterable allow-create>
          <!-- 支持用户自己输入标签 -->
              </el-select>
            </el-form-item>
            <el-form-item label="癖好（kinks）">
              <el-select v-model="form.kinks" multiple filterable allow-create>
          <!-- 支持用户自己输入癖好 -->
              </el-select>
            </el-form-item>
          </el-collapse-item>

          <!-- 第四层：高级设定 -->
          <el-collapse-item title="高级设定" name="advanced">
            <el-form-item label="声音风格">
              <el-input v-model="form.voice_style" />
            </el-form-item>
            <el-form-item label="示例对话">
              <el-input
          v-model="form.example_dialogs"
          type="textarea"
          :rows="3"
          placeholder="每条对话用换行分隔"
              />
            </el-form-item>
            <el-form-item label="记忆模板">
              <el-input v-model="form.memory_template" type="textarea" />
            </el-form-item>
            <el-form-item label="视觉风格">
              <el-input v-model="form.visual_style" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <!-- <el-button type="primary" @click="save">保存</el-button> -->

        <el-button @click="createCharacterv1" v-if="!form.id">保存</el-button>
        <el-button @click="updateCharacterV1(form)" v-else>更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, triggerRef } from "vue";
import { ElMessage } from "element-plus";
// 引入抽离后的接口方法
import { getRoles, saveRoles, deleteRoles } from "@/api/roleManageApi";
import {
  getAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/api/characterApi";
import { id } from "element-plus/es/locale/index.mjs";

const roles = ref([]);
const showDialog = ref(false);
const activeCollapse = ref(["base"]);
// 新增：响应式追踪当前选中角色名
const currentRoleName = ref("");

const form = ref({
  name: "",
  personality: "",
  tone: "",
  opening: "",
  description: "",
  scenario: "日常聊天",
  mesExample: "",
  // talkativeness: 0.5,
  depthPrompt: "不要OOC，严格扮演角色，不偏离人设",
});

// 同步localStorage中的选中角色到响应式变量
function syncCurrentRole() {
  const curr = localStorage.getItem("currentRole");
  if (!curr) {
    currentRoleName.value = "";
    return;
  }
  try {
    const currentRole = JSON.parse(curr);
    currentRoleName.value = currentRole?.name || "";
  } catch (e) {
    localStorage.removeItem("currentRole");
    currentRoleName.value = "";
  }
}

onMounted(() => {
  load();
  syncCurrentRole(); // 初始化同步选中状态
  getAllCharacters()
    .then((res) => {
      console.log("获取角色列表成功：", res.data);
    })
    .catch((err) => {
      console.error("获取角色列表失败：", err);
    });
});

// 新的创建角色接口
const createCharacterv1 = async () => {
  console.log(form);

let data = {
  name: form.value.name,
  avatar: form.value.avatar || "",
  short_bio: form.value.short_bio || "",
  personality: form.value.personality || "",
  tone: form.value.tone || "",
  opening: form.value.opening || "",
  description: form.value.description || "",
  background_story: form.value.background_story || "",
  relationship: form.value.relationship || "",
  age: form.value.age || "",
  height: form.value.height || "",
  body_type: form.value.body_type || "",
  appearance: form.value.appearance || "",
  likes: form.value.likes || "",
  dislikes: form.value.dislikes || "",
  habits: form.value.habits || "",
  sexual_personality: form.value.sexual_personality || "",
  tags: form.value.tags || [],
  kinks: form.value.kinks || [],
  voice_style: form.value.voice_style || "",
  example_dialogs: form.value.example_dialogs || [],
  memory_template: form.value.memory_template || "",
  visual_style: form.value.visual_style || ""
}

  createCharacter(data)
    .then((res) => {
      console.log("创建角色成功：", res.data);
      load(); // 刷新角色列表
    })
    .catch((err) => {
      console.error("创建角色失败：", err);
    });
};

const updateCharacterV1 = async (character) => {
  console.log("更新角色数据：", character);

  updateCharacter(character)
    .then((res) => {
      console.log("更新角色成功：", res.data);
      load(); // 刷新角色列表
    })
    .catch((err) => {
      console.error("更新角色失败：", err);
    });
};

const deleteCharacterv1 = async (id) => {
  if (!confirm("确定删除该角色？")) return;

  deleteCharacter({id:id})
    .then((res) => {
      console.log("删除角色成功：", res.data);
      load(); // 刷新角色列表
    })
    .catch((err) => {
      console.error("删除角色失败：", err);
    });
};

async function load() {
  const res = await getAllCharacters();

  roles.value = res.data;
}

function openEdit(row = null) {
  if (row) {
    form.value = { ...row };
  } else {
    form.value = {
      name: "",
      personality: "",
      tone: "",
      opening: "",
      description: "",
      scenario: "日常聊天",
      mesExample: "",
      // talkativeness: 0.5,
      depthPrompt: "不要OOC，严格扮演角色，不偏离人设",
    };
  }
  showDialog.value = true;
}



// 使用角色
function useRole(role) {
  localStorage.setItem("currentRole", JSON.stringify(role));
  currentRoleName.value = role.name; // 更新响应式变量，触发高亮更新
  ElMessage.success("已选择：" + role.name);
  window.dispatchEvent(new Event("role-changed"));
}

// 判断是否当前选中（高亮用）
function isCurrent(role) {
  return currentRoleName.value === role.name;
}
</script>

<style scoped>
.role-manager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header h3 {
  margin: 0;
  font-size: 16px;
}

.role-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
}

/* 选中高亮 */
.role-item.active {
  border-color: #ff7d24;
  background: #fff9f5;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.info .name {
  font-weight: 600;
  font-size: 14px;
}

.info .desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
