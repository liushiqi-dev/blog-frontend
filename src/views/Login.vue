<template>
  <div>
    <AppHeader />

    <main class="login-container">
      <div class="login-card">
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录后继续管理你的博客</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>

        <div class="login-footer">
          还没有账号？<router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

// 表单验证规则（对应后端：用户名3-20字符，密码6-32字符）
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为6-32个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  // 先验证表单
  await formRef.value.validate()

  loading.value = true
  try {
    // 调用登录 → store处理token存储和获取用户信息
    await login(form.username, form.password)
    ElMessage.success('登录成功')

    // 如果有重定向参数（如从受保护页面跳来），登录后回到原页面
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    // 错误已在response拦截器中提示（ElMessage.error）
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.login-card {
  max-width: 400px;
  width: 100%;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 40px;
  box-shadow: var(--app-shadow-sm);
}

.login-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--app-foreground);
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--app-muted-foreground);
  text-align: center;
  margin-bottom: 32px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--app-muted-foreground);
}

.register-link {
  color: var(--app-primary);
  font-weight: 500;
}
</style>
