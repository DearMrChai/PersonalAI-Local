<template>
  <div class="role-manager">
    <div class="header">
      <h3>角色管理</h3>
      <el-button type="primary" size="small" @click="openEdit()">+ 新建</el-button>
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
          <el-button size="small" type="danger" @click="del(role.name)">
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
          <el-collapse-item title="基础信息（必填）" name="base">
            <el-form-item label="角色名称">
              <el-input v-model="form.name" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="性格">
              <el-input v-model="form.personality" placeholder="温柔、冷静、傲娇" />
            </el-form-item>
            <el-form-item label="语气">
              <el-input v-model="form.tone" placeholder="简短、可爱、高冷" />
            </el-form-item>
            <el-form-item label="开场白">
              <el-input v-model="form.opening" type="textarea" :rows="2" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="角色设定（选填）" name="extra">
            <el-form-item label="角色描述">
              <el-input v-model="form.description" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="对话场景">
              <el-input v-model="form.scenario" />
            </el-form-item>
            <el-form-item label="对话示例">
              <el-input v-model="form.mesExample" type="textarea" :rows="3" placeholder="不填自动生成" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="高级设置（可选）" name="advanced">
            <el-form-item label="话痨程度">
              <el-slider v-model.number="form.talkativeness" :min="0" :max="1" :step="0.1" />
            </el-form-item>
            <el-form-item label="深度提示词">
              <el-input v-model="form.depthPrompt" type="textarea" :rows="2" />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, triggerRef } from 'vue'
import { ElMessage } from 'element-plus'

const roles = ref([])
const showDialog = ref(false)
const activeCollapse = ref(['base'])
// 新增：响应式追踪当前选中角色名
const currentRoleName = ref('')

const form = ref({
  name: '',
  personality: '',
  tone: '',
  opening: '',
  description: '',
  scenario: '日常聊天',
  mesExample: '',
  talkativeness: 0.5,
  depthPrompt: '不要OOC，严格扮演角色，不偏离人设',
})

// 同步localStorage中的选中角色到响应式变量
function syncCurrentRole() {
  const curr = localStorage.getItem('currentRole')
  if (!curr) {
    currentRoleName.value = ''
    return
  }
  try {
    const currentRole = JSON.parse(curr)
    currentRoleName.value = currentRole?.name || ''
  } catch (e) {
    localStorage.removeItem('currentRole')
    currentRoleName.value = ''
  }
}

onMounted(() => {
  load()
  syncCurrentRole() // 初始化同步选中状态
})

async function load() {
  const res = await fetch('/api/roles')
  roles.value = await res.json()
}

function openEdit(row = null) {
  if (row) {
    form.value = { ...row }
  } else {
    form.value = {
      name: '',
      personality: '',
      tone: '',
      opening: '',
      description: '',
      scenario: '日常聊天',
      mesExample: '',
      talkativeness: 0.5,
      depthPrompt: '不要OOC，严格扮演角色，不偏离人设',
    }
  }
  showDialog.value = true
}

async function save() {
  if (!form.value.name) return ElMessage.warning('角色名必填')
  
  // 编辑当前选中角色时，同步更新localStorage
  const curr = localStorage.getItem('currentRole')
  if (curr) {
    try {
      const currentRole = JSON.parse(curr)
      if (currentRole.name === form.value.name && form.value.name !== form.value.name) {
        currentRole.name = form.value.name
        localStorage.setItem('currentRole', JSON.stringify(currentRole))
        currentRoleName.value = form.value.name
      }
    } catch (e) {}
  }

  await fetch('/api/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value),
  })
  showDialog.value = false
  load()
  ElMessage.success('保存成功')
}

// 删除功能（对接你的后端）
async function del(name) {
  if (!confirm('确定删除该角色？')) return
  
  // 删除当前选中角色时，清空选中状态
  const curr = localStorage.getItem('currentRole')
  if (curr) {
    try {
      const currentRole = JSON.parse(curr)
      if (currentRole.name === name) {
        localStorage.removeItem('currentRole')
        currentRoleName.value = ''
      }
    } catch (e) {}
  }

  await fetch(`/api/roles/${name}`, { method: 'DELETE' })
  ElMessage.success('删除成功')
  load()
}

// 使用角色
function useRole(role) {
  localStorage.setItem('currentRole', JSON.stringify(role))
  currentRoleName.value = role.name // 更新响应式变量，触发高亮更新
  ElMessage.success('已选择：' + role.name)
  window.dispatchEvent(new Event('role-changed'))
}

// 判断是否当前选中（高亮用）
function isCurrent(role) {
  return currentRoleName.value === role.name
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