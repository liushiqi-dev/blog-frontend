<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- 左侧：Logo -->
      <router-link to="/" class="logo">
        <el-icon :size="20" color="var(--app-primary)">
          <EditPen />
        </el-icon>
        <span>我的博客</span>
      </router-link>

      <!-- 中间：导航菜单 -->
      <nav class="nav-menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/categories" class="nav-link">分类</router-link>
        <router-link to="/post-editor" class="nav-link">写文章</router-link>
      </nav>

      <!-- 右侧：根据登录状态显示不同内容 -->
      <div class="user-actions">
        <!-- 已登录：显示用户名 + 退出 -->
        <template v-if="isLoggedIn">
          <router-link to="/profile" class="nav-link">
            {{ state.userInfo?.username || '用户' }}
          </router-link>
          <el-button round @click="handleLogout">退出</el-button>
        </template>

        <!-- 未登录：显示登录按钮 -->
        <template v-else>
          <router-link to="/profile" class="nav-link">个人中心</router-link>
          <el-button type="primary" round @click="$router.push('/login')">
            登录
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { state, isLoggedIn, fetchUserInfo, logout } from '@/stores/user'

const router = useRouter()

// 页面加载时，如果已有token但还没获取用户信息，则获取
onMounted(() => {
  if (isLoggedIn.value && !state.userInfo) {
    fetchUserInfo()
  }
})

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // 用户点击取消，不做任何操作
  }
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--app-shadow-header);
}

.header-inner {
  max-width: 1280px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--app-foreground);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-muted-foreground);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--app-primary);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
