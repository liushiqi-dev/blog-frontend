import { createRouter, createWebHistory } from 'vue-router'
import { state, isLoggedIn, isAdmin, fetchUserInfo } from '@/stores/user'

/**
 * Vue Router 配置
 * URL → 组件的映射，前端路由不刷新页面（SPA）
 */

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: () => import('@/views/PostDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/ask',
    name: 'ask',
    component: () => import('@/views/Ask.vue'),
    meta: { title: '问我的博客' }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('@/views/Categories.vue'),
    meta: { title: '分类管理' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/posts/create',
    name: 'post-create',
    component: () => import('@/views/PostEditor.vue'),
    meta: { title: '写文章' }
  },
  {
    path: '/posts/:id/edit',
    name: 'post-edit',
    component: () => import('@/views/PostEditor.vue'),
    meta: { title: '编辑文章' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 需要管理员权限才能访问的路由
const adminRoutes = ['categories', 'post-create', 'post-edit']

// 全局前置守卫：设置页面标题 + 管理员路由拦截
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'

  // 已有token但用户信息还没加载（如刷新页面），先加载再判断权限，
  // 否则管理员直接刷新会被误判成未登录而拦回首页
  if (isLoggedIn.value && !state.userInfo) {
    await fetchUserInfo()
  }

  // 非管理员访问管理员页面时，直接重定向回首页
  if (adminRoutes.includes(to.name) && !isAdmin.value) {
    return next('/')
  }

  next()
})

export default router
