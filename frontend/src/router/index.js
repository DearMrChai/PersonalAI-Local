import { createRouter, createWebHistory } from 'vue-router'
import Setup from '../views/Step.vue'
import Layout from '../components/Layout.vue'

// 路由规则：首次进入跳配置页，配置后跳主布局
const routes = [
  {
    path: '/',
    redirect: '/setup' // 根路径重定向到配置页
  },
  {
    path: '/setup',
    name: 'Setup',
    component: Setup,
    meta: { title: 'PersonalAI-Local - 初始化配置' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Layout,
    meta: { title: 'PersonalAI-Local - 主界面' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：修改页面标题
router.afterEach((to) => {
  document.title = to.meta.title || 'PersonalAI-Local'
})

export default router