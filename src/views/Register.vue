<template>
  <div>
    <AppHeader />
    <main class="main-content">
      <div class="register-card">
        <h1>注册</h1>
        <p class="subtitle">创建账号，开始你的博客之旅</p>
        <p class="placeholder">注册页待实现</p>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
.main-content {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.register-card {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.subtitle {
  color: var(--app-muted-foreground);
  margin-top: 8px;
}

.placeholder {
  margin-top: 32px;
  color: var(--app-muted-foreground);
}
</style>
