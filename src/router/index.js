import { createRouter, createWebHistory } from 'vue-router'

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

// 全局前置守卫：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'
  next()
})

export default router
