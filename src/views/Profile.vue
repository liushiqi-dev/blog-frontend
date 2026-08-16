<template>
  <div>
    <AppHeader />

    <main class="main-content">
      <!-- 未登录：提示去登录 -->
      <div v-if="!isLoggedIn" class="profile-card">
        <el-empty description="请先登录后查看个人信息">
          <el-button type="primary" round @click="$router.push('/login')">去登录</el-button>
        </el-empty>
      </div>

      <!-- 已登录：展示用户信息 -->
      <div v-else class="profile-card" v-loading="!state.userInfo">
        <template v-if="state.userInfo">
          <!-- 头部：头像 + 用户名 + 角色标签 -->
          <header class="profile-header">
            <el-avatar :size="80" class="profile-avatar">
              {{ state.userInfo.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <h1 class="profile-username">{{ state.userInfo.username }}</h1>
            <el-tag
              :type="isAdmin ? 'danger' : 'info'"
              effect="light"
              round
            >
              {{ isAdmin ? '管理员' : '普通用户' }}
            </el-tag>
          </header>

          <el-divider />

          <!-- 信息列表：对应 /users/me 返回的字段 -->
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ state.userInfo.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">角色</span>
              <span class="info-value">{{ isAdmin ? '管理员' : '普通用户' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ state.userInfo.email || '未绑定' }}</span>
            </div>
          </div>
        </template>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { state, isLoggedIn, isAdmin, fetchUserInfo } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// AppHeader挂载时也会拉取，这里兜底：已登录但还没拿到用户信息时补拉
onMounted(() => {
  if (isLoggedIn.value && !state.userInfo) {
    fetchUserInfo()
  }
})
</script>

<style scoped>
.main-content {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.profile-card {
  max-width: 480px;
  width: 100%;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 40px;
  box-shadow: var(--app-shadow-sm);
  min-height: 300px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  background-color: var(--app-primary);
  color: #fff;
  font-size: 32px;
  font-weight: 600;
}

.profile-username {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--app-foreground);
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--app-muted-foreground);
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--app-foreground);
}
</style>
