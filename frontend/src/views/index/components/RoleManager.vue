<template>
  <div class="role-manager">
    <!-- 头部区域：标题 + 新建按钮 -->
    <div class="header">
      <h3>角色管理</h3>
      <el-button type="primary" size="small" @click="openEdit()"
        >+ 新建</el-button
      >
    </div>

    <!-- 角色列表区域：展示所有角色，支持选中/编辑/删除 -->
    <div class="role-list">
      <div
        class="role-item"
        v-for="role in roles"
        :key="role.id" 
        :class="{ active: isCurrent(role) }"
        @click="useRole(role)"
      >
        <!-- 角色头像（取名称首字符） -->
        <div class="avatar">{{ role.name.charAt(0) }}</div>

        <!-- 角色基础信息 -->
        <div class="info">
          <div class="name">{{ role.name }}</div>
          <div class="desc">{{ role.short_bio || "未设置短简介" }}</div>
        </div>

        <!-- 操作按钮组：编辑/删除（阻止事件冒泡） -->
        <div class="btns" @click.stop>
          <el-button size="small" type="success" @click="openEdit(role)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="deleteCharacterv1(role.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑/新建角色弹窗 -->
    <el-dialog
      v-model="showDialog"
      title="编辑角色"
      width="550px"
      append-to-body
      destroy-on-close 
    >
      <el-form :model="form" label-width="100px">
        <el-collapse v-model="activeCollapse">
          <!-- 1. 基础信息折叠面板 -->
          <el-collapse-item title="基础信息" name="base">
            <el-form-item label="角色名称">
              <el-input v-model="form.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="头像">
              <el-input v-model="form.avatar" placeholder="头像URL地址" />
            </el-form-item>
            <el-form-item label="短简介">
              <el-input v-model="form.short_bio" placeholder="简短描述角色（一句话）" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="form.age" placeholder="例如：18 / 25 / 未知" />
            </el-form-item>
            <el-form-item label="性格标签">
              <el-select v-model="form.personality" multiple filterable allow-create placeholder="多选，支持自定义">
              </el-select>
            </el-form-item>
            <el-form-item label="语气">
              <el-input v-model="form.tone" placeholder="例如：温柔 / 高冷 / 活泼" />
            </el-form-item>
            <el-form-item label="开场白">
              <el-input v-model="form.opening" type="textarea" placeholder="角色首次对话的内容" />
            </el-form-item>
          </el-collapse-item>

          <!-- 2. 外貌与特征折叠面板 -->
          <el-collapse-item title="外貌与特征" name="appearance">
            <el-form-item label="身高">
              <el-input v-model="form.height" placeholder="例如：165cm / 180cm" />
            </el-form-item>
            <el-form-item label="体型">
              <el-input v-model="form.body_type" placeholder="例如：苗条 / 健壮 / 微胖" />
            </el-form-item>
            <el-form-item label="外貌">
              <el-input v-model="form.appearance" type="textarea" placeholder="详细描述角色外貌特征" />
            </el-form-item>
            <el-form-item label="视觉风格">
              <el-input v-model="form.visual_style" placeholder="例如：日系动漫 / 写实风 / 赛博朋克" />
            </el-form-item>
          </el-collapse-item>

          <!-- 3. 关系与背景折叠面板 -->
          <el-collapse-item title="关系与背景" name="background">
            <el-form-item label="详细描述">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="角色人设的核心描述" />
            </el-form-item>
            <el-form-item label="背景故事">
              <el-input v-model="form.background_story" type="textarea" :rows="4" placeholder="角色的出身、经历等背景信息" />
            </el-form-item>
            <el-form-item label="与用户的关系">
              <el-input v-model="form.relationship" placeholder="例如：朋友 / 恋人 / 师生" />
            </el-form-item>
          </el-collapse-item>

          <!-- 4. 兴趣与习惯折叠面板 -->
          <el-collapse-item title="兴趣与习惯" name="hobby">
            <el-form-item label="喜欢">
              <el-input v-model="form.likes" placeholder="角色喜欢的事物，多个用逗号分隔" />
            </el-form-item>
            <el-form-item label="不喜欢">
              <el-input v-model="form.dislikes" placeholder="角色不喜欢的事物，多个用逗号分隔" />
            </el-form-item>
            <el-form-item label="习惯">
              <el-input v-model="form.habits" placeholder="角色的日常习惯、口头禅等" />
            </el-form-item>
            <el-form-item label="性方面性格">
              <el-input v-model="form.sexual_personality" type="textarea" placeholder="描述角色在性方面的性格特征" />
            </el-form-item>
          </el-collapse-item>

          <!-- 5. 标签系统折叠面板 -->
          <el-collapse-item title="标签系统" name="tags">
            <el-form-item label="通用标签">
              <el-select v-model="form.tags" multiple filterable allow-create placeholder="多选，支持自定义">
              </el-select>
            </el-form-item>
            <el-form-item label="癖好（kinks）">
              <el-select v-model="form.kinks" multiple filterable allow-create placeholder="多选，支持自定义">
              </el-select>
            </el-form-item>
          </el-collapse-item>

          <!-- 6. 高级设定折叠面板 -->
          <el-collapse-item title="高级设定" name="advanced">
            <el-form-item label="声音风格">
              <el-input v-model="form.voice_style" placeholder="例如：软糯 / 低沉 / 清脆" />
            </el-form-item>
            <el-form-item label="示例对话">
              <el-input
                v-model="form.example_dialogs"
                type="textarea"
                :rows="3"
                placeholder="每条对话用换行分隔，示例：
用户：你好
角色：你好呀～"
              />
            </el-form-item>
            <el-form-item label="记忆模板">
              <el-input v-model="form.memory_template" type="textarea" placeholder="角色的记忆规则模板" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <!-- 弹窗底部按钮 -->
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <!-- 新建时显示“保存”，编辑时显示“更新” -->
        <el-button type="primary" @click="createCharacterv1" v-if="!form.id">保存</el-button>
        <el-button type="primary" @click="updateCharacterV1" v-else>更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/************************** 1. 依赖导入区 **************************/
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
// 角色管理相关接口（旧接口，未使用，保留兼容）
import { getRoles, saveRoles, deleteRoles } from "@/api/roleManageApi";
// 核心角色CRUD接口（新接口）
import {
  getAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/api/characterApi";

/************************** 2. 响应式数据区 **************************/
// 角色列表数据
const roles = ref([]);
// 弹窗显示状态
const showDialog = ref(false);
// 折叠面板默认展开项
const activeCollapse = ref(["base"]);
// 当前选中的角色名称（用于高亮）
const currentRoleName = ref("");

/**
 * 表单数据（新字段方案）
 * 字段说明：
 * - 基础信息：name/avatar/short_bio/age/personality/tone/opening
 * - 外貌特征：height/body_type/appearance/visual_style
 * - 关系背景：description/background_story/relationship
 * - 兴趣习惯：likes/dislikes/habits/sexual_personality
 * - 标签系统：tags/kinks（多选数组）
 * - 高级设定：voice_style/example_dialogs/memory_template
 */
const form = ref({
  // 基础信息
  id: "",          // 角色ID（编辑时赋值，新建时为空）
  name: "",        // 角色名称
  avatar: "",      // 头像URL
  short_bio: "",   // 短简介
  age: "",         // 年龄
  personality: [], // 性格标签（多选 → 数组）
  tone: "",        // 语气
  opening: "",     // 开场白
  // 外貌与特征
  height: "",      // 身高
  body_type: "",   // 体型
  appearance: "",  // 外貌描述
  visual_style: "",// 视觉风格
  // 关系与背景
  description: "", // 详细描述
  background_story: "", // 背景故事
  relationship: "",    // 与用户的关系
  // 兴趣与习惯
  likes: "",       // 喜欢的事物
  dislikes: "",    // 不喜欢的事物
  habits: "",      // 习惯
  sexual_personality: "", // 性方面性格
  // 标签系统
  tags: [],        // 通用标签（多选 → 数组）
  kinks: [],       // 癖好标签（多选 → 数组）
  // 高级设定
  voice_style: "", // 声音风格
  example_dialogs: "", // 示例对话（文本换行 → 接口转数组）
  memory_template: "", // 记忆模板
});

/************************** 3. 工具方法区 **************************/
/**
 * 同步本地存储的选中角色到响应式变量
 * 作用：页面加载时恢复上次选中的角色高亮状态
 */
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
    // 本地存储数据异常时清空
    localStorage.removeItem("currentRole");
    currentRoleName.value = "";
    ElMessage.warning("本地角色数据异常，已重置");
  }
}

/**
 * 判断当前角色是否为选中状态
 * @param {Object} role - 角色对象
 * @returns {Boolean} 是否选中
 */
function isCurrent(role) {
  return currentRoleName.value === role.name;
}

/************************** 4. 核心业务逻辑区 **************************/
/**
 * 加载角色列表
 * 作用：初始化/刷新角色列表数据
 */
async function load() {
  try {
    const res = await getAllCharacters();
    roles.value = res.data || []; // 兜底空数组，避免渲染报错
  } catch (err) {
    ElMessage.error("加载角色列表失败");
    console.error("【角色管理】加载列表失败：", err);
  }
}

/**
 * 打开编辑/新建弹窗
 * @param {Object|null} row - 角色对象（新建时传null）
 */
function openEdit(row = null) {
  if (row) {
    // 编辑模式：回显角色数据
    form.value = {
      ...row,
      // 处理多选字段：确保是数组（防止接口返回非数组）
      personality: Array.isArray(row.personality) ? row.personality : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      kinks: Array.isArray(row.kinks) ? row.kinks : [],
      // 处理示例对话：接口数组 → 文本换行（适配textarea）
      example_dialogs: row.example_dialogs?.join('\n') || "",
    };
  } else {
    // 新建模式：重置表单
    form.value = {
      id: "",
      name: "",
      avatar: "",
      short_bio: "",
      age: "",
      personality: [],
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
      sexual_personality: "",
      tags: [],
      kinks: [],
      voice_style: "",
      example_dialogs: "",
      memory_template: "",
    };
  }
  showDialog.value = true; // 打开弹窗
}

/**
 * 选中角色
 * @param {Object} role - 角色对象
 * 作用：将选中角色存入本地存储，并触发高亮/全局事件
 */
function useRole(role) {
  localStorage.setItem("currentRole", JSON.stringify(role));
  currentRoleName.value = role.name;
  ElMessage.success(`已选中角色：${role.name}`);
  // 触发全局事件，供其他组件监听角色切换
  window.dispatchEvent(new Event("role-changed"));
}

/************************** 5. 接口调用区 **************************/
/**
 * 新建角色（调用新接口）
 * 流程：处理表单数据 → 调用接口 → 刷新列表 → 关闭弹窗
 */
const createCharacterv1 = async () => {
  // 表单校验：必填项检查
  if (!form.value.name.trim()) {
    return ElMessage.warning("角色名称不能为空");
  }

  // 处理示例对话：textarea换行文本 → 数组（过滤空行）
  const exampleDialogs = form.value.example_dialogs
    ? form.value.example_dialogs.split('\n').filter(item => item.trim())
    : [];

  // 构造接口请求参数
  const requestData = {
    ...form.value,
    example_dialogs: exampleDialogs, // 替换处理后的值
    // 兜底空值，避免传undefined导致接口报错
    avatar: form.value.avatar || "",
    short_bio: form.value.short_bio || "",
  };

  try {
    await createCharacter(requestData);
    ElMessage.success("角色创建成功");
    load(); // 刷新角色列表
    showDialog.value = false; // 关闭弹窗
  } catch (err) {
    ElMessage.error("角色创建失败");
    console.error("【角色管理】创建角色失败：", err);
  }
};

/**
 * 更新角色（调用新接口）
 * 流程：校验ID → 处理表单数据 → 调用接口 → 刷新列表 → 关闭弹窗
 */
const updateCharacterV1 = async () => {
  // 校验：编辑时必须有ID
  if (!form.value.id) {
    return ElMessage.warning("角色ID不存在，无法更新");
  }

  // 处理示例对话：textarea换行文本 → 数组
  const exampleDialogs = form.value.example_dialogs
    ? form.value.example_dialogs.split('\n').filter(item => item.trim())
    : [];

  // 构造接口请求参数
  const requestData = {
    ...form.value,
    example_dialogs: exampleDialogs,
  };

  try {
    await updateCharacter(requestData);
    ElMessage.success("角色更新成功");
    load(); // 刷新角色列表
    showDialog.value = false; // 关闭弹窗
  } catch (err) {
    ElMessage.error("角色更新失败");
    console.error("【角色管理】更新角色失败：", err);
  }
};

/**
 * 删除角色（调用新接口）
 * @param {String} id - 角色ID
 * 流程：确认删除 → 调用接口 → 刷新列表 → 清空选中状态（如果删除的是当前角色）
 */
const deleteCharacterv1 = async (id) => {
  // 二次确认：防止误删
  if (!confirm("确定要删除该角色吗？删除后无法恢复！")) {
    return;
  }

  try {
    await deleteCharacter({ id });
    ElMessage.success("角色删除成功");
    load(); // 刷新角色列表

    // 如果删除的是当前选中角色，清空本地存储和高亮
    const deletedRole = roles.value.find(role => role.id === id);
    if (deletedRole && deletedRole.name === currentRoleName.value) {
      localStorage.removeItem("currentRole");
      currentRoleName.value = "";
    }
  } catch (err) {
    ElMessage.error("角色删除失败");
    console.error("【角色管理】删除角色失败：", err);
  }
};

/************************** 6. 生命周期 **************************/
/**
 * 页面挂载时执行：
 * 1. 加载角色列表
 * 2. 同步本地选中角色
 * 3. 打印角色列表（调试用）
 */
onMounted(() => {
  load();
  syncCurrentRole();
  // 调试：打印角色列表
  getAllCharacters()
    .then((res) => {
      console.log("【角色管理】初始化获取角色列表：", res.data);
    })
    .catch((err) => {
      console.error("【角色管理】初始化获取列表失败：", err);
    });
});
</script>

<style scoped>
/* 整体容器样式 */
.role-manager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部样式：标题 + 按钮 */
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
  font-weight: 600;
}

/* 角色列表容器：可滚动 */
.role-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

/* 单个角色项样式 */
.role-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 角色项 hover 效果 */
.role-item:hover {
  border-color: #ddd;
  background: #fafafa;
}

/* 选中角色高亮样式 */
.role-item.active {
  border-color: #ff7d24;
  background: #fff9f5;
}

/* 角色头像样式 */
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

/* 角色信息容器 */
.info {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
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

/* 操作按钮组 */
.btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>