<template>
  <div class="tag-manager">
    <!-- 头部 -->
    <div class="header">
      <h3>标签管理</h3>
      <el-button type="primary" size="small" @click="openEdit(null)">
        + 新建标签
      </el-button>
    </div>

    <!-- 内容区域：左右分栏 -->
    <div class="content">
      <!-- 左侧：标签列表 -->
      <div class="tag-list-panel">
        <el-input
          v-model="searchKey"
          placeholder="搜索标签名称..."
          prefix-icon="Search"
          clearable
          style="margin-bottom: 10px"
        />
        <div class="list-container">
          <div
            v-for="tag in filteredTags"
            :key="tag.id"
            class="tag-item"
            :class="{ active: currentTag?.id === tag.id }"
            @click="openEdit(tag)"
          >
            <span class="tag-name">{{ tag.name }}</span>
            <el-tag size="small" :type="getTypeColor(tag.type)">{{
              tag.type || "general"
            }}</el-tag>
          </div>
          <el-empty v-if="filteredTags.length === 0" description="暂无标签" />
        </div>
      </div>

      <!-- 右侧：编辑/新建表单 -->
      <div class="tag-form-panel">
        <el-card v-if="showForm" shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ isEdit ? "编辑标签" : "新建标签" }}</span>
              <el-button
                v-if="isEdit"
                type="danger"
                size="small"
                link
                @click="handleDelete"
              >
                删除
              </el-button>
            </div>
          </template>

          <el-form :model="form" label-width="80px">
            <el-form-item label="标签名称">
              <el-input v-model="form.name" placeholder="请输入标签名称" />
            </el-form-item>
            
            <el-form-item label="标签类型">
              <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
                <el-option label="通用 (General)" value="general" />
                <el-option label="癖好 (Kink)" value="kink" />
                <el-option label="性格 (Personality)" value="personality" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                保存
              </el-button>
              <el-button @click="showForm = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-empty v-else description="点击左侧标签进行编辑，或点击右上角新建" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getAllTags,
  createOrGetTag,
  updateTag,
  deleteTag,
} from "@/api/tagApi";

// --- 响应式数据 ---
const allTags = ref([]);
const searchKey = ref("");
const showForm = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const currentTag = ref(null); // 当前正在编辑的标签对象

const form = ref({
  id: null,
  name: "",
  type: "general",
});

// --- 计算属性 ---
const filteredTags = computed(() => {
  if (!searchKey.value) return allTags.value;
  return allTags.value.filter((t) =>
    t.name.toLowerCase().includes(searchKey.value.toLowerCase())
  );
});

// --- 方法 ---

/**
 * 加载标签列表
 */
async function loadTags() {
  try {
    const res = await getAllTags();
    allTags.value = res.data || [];
  } catch (err) {
    ElMessage.error("加载标签列表失败");
    console.error(err);
  }
}

/**
 * 打开编辑或新建弹窗
 */
function openEdit(tag) {
  showForm.value = true;
  if (tag) {
    // 编辑模式
    isEdit.value = true;
    currentTag.value = tag;
    form.value = {
      id: tag.id,
      name: tag.name,
      type: tag.type || "general",
    };
  } else {
    // 新建模式
    isEdit.value = false;
    currentTag.value = null;
    form.value = {
      id: null,
      name: "",
      type: "general",
    };
  }
}

/**
 * 提交表单 (新建或更新)
 * 注意：新建时我们使用 createOrGetTag，更新时使用 updateTag
 */
async function handleSubmit() {
  if (!form.value.name.trim()) {
    return ElMessage.warning("标签名称不能为空");
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      // 更新逻辑
      await updateTag({
        id: form.value.id,
        name: form.value.name,
        type: form.value.type,
      });
      ElMessage.success("更新成功");
    } else {
      // 新建逻辑 (Upsert)
      await createOrGetTag({
        name: form.value.name,
        type: form.value.type,
      });
      ElMessage.success("创建成功");
    }
    
    // 刷新列表并重置表单状态
    await loadTags();
    showForm.value = false;
  } catch (err) {
    ElMessage.error(isEdit.value ? "更新失败" : "创建失败");
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

/**
 * 删除标签
 */
async function handleDelete() {
  if (!currentTag.value) return;
  
  try {
    await ElMessageBox.confirm(
      `确定要删除标签 "${currentTag.value.name}" 吗？关联的角色将失去该标签。`,
      "警告",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" }
    );
    
    await deleteTag({ id: currentTag.value.id });
    ElMessage.success("删除成功");
    await loadTags();
    showForm.value = false;
  } catch (err) {
    if (err !== "cancel") {
      ElMessage.error("删除失败");
      console.error(err);
    }
  }
}

/**
 * 获取标签类型对应的颜色
 */
function getTypeColor(type) {
  switch (type) {
    case "kink": return "danger";
    case "personality": return "success";
    default: return "info";
  }
}

onMounted(() => {
  loadTags();
});
</script>

<style scoped>
.tag-manager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 去掉 background: #fff; 因为父容器已经是白色了 */
}
.header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h3 { margin: 0; font-size: 16px; }

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧列表 */
.tag-list-panel {
  width: 280px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  padding: 10px;
}
.list-container {
  flex: 1;
  overflow-y: auto;
}
.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 5px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.tag-item:hover { background: #f5f7fa; }
.tag-item.active { background: #ecf5ff; border-left: 3px solid #409eff; }
.tag-name { font-size: 14px; font-weight: 500; }

/* 右侧表单 */
.tag-form-panel {
  flex: 1;
  padding: 20px;
  background: #fafafa;
  overflow-y: auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>