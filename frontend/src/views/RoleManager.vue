<template>
  <div class="role-manager">
    <h2>角色管理</h2>

    <!-- 新建角色按钮 -->
    <div class="role-toolbar">
      <el-button type="primary" @click="openEditDialog()">+ 新建角色</el-button>
    </div>

    <!-- 角色列表 -->
    <div class="role-list">
      <div
        class="role-item"
        v-for="role in roleList"
        :key="role.name"
      >
        <div class="role-info">
          <h4>{{ role.name }}</h4>
          <p>{{ role.personality || '无性格' }}</p>
          <p class="tip">{{ role.tone || '无语气' }}</p>
        </div>
        <div class="role-actions">
          <el-button size="small" @click="useRole(role)">使用</el-button>
          <el-button size="small" type="success" @click="openEditDialog(role)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRole(role.name)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 编辑 / 新建 弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑角色" width="500px">
      <el-form label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="性格设定">
          <el-input v-model="editForm.personality" type="textarea" rows="2" placeholder="冷静、傲娇、温柔…" />
        </el-form-item>
        <el-form-item label="语气风格">
          <el-input v-model="editForm.tone" type="textarea" rows="2" placeholder="简洁、啰嗦、可爱、高冷…" />
        </el-form-item>
        <el-form-item label="开场白">
          <el-input v-model="editForm.opening" type="textarea" rows="2" placeholder="进入聊天时自动说的第一句话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const roleList = ref([])
const dialogVisible = ref(false)
const editForm = ref({
  name: '',
  personality: '',
  tone: '',
  opening: ''
})

// 加载角色列表
async function loadRoles() {
  const res = await fetch('/api/roles')
  roleList.value = await res.json()
}

// 打开编辑框
function openEditDialog(role = null) {
  if (role) {
    editForm.value = { ...role }
  } else {
    editForm.value = { name: '', personality: '', tone: '', opening: '' }
  }
  dialogVisible.value = true
}

// 保存角色（新增+更新）
async function saveRole() {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('角色名不能为空')
    return
  }

  await fetch('/api/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editForm.value)
  })

  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadRoles()
}

// 删除角色
async function deleteRole(name) {
  if (!confirm(`确定要删除角色【${name}】吗？`)) return

  await fetch(`/api/roles/${name}`, { method: 'DELETE' })
  ElMessage.success('删除成功')
  loadRoles()
}

// ✅ 修复：无跳转、无刷新
function useRole(role) {
  localStorage.setItem('currentRole', JSON.stringify(role))
  ElMessage.success(`已选择角色：${role.name}`)
  window.dispatchEvent(new Event('role-changed'))
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.role-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.role-toolbar {
  margin: 10px 0 20px;
}
.role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.role-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.role-info h4 {
  margin: 0 0 6px;
  font-size: 16px;
}
.role-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
.role-info .tip {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
.role-actions {
  display: flex;
  gap: 8px;
}
</style>