<template>
  <div>
    <AppHeader />

    <main class="register-container">
      <div class="register-card">
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">注册成功后自动登录，开始你的博客之旅</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleRegister"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
              clearable
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

          <el-form-item label="邮箱（可选）" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
              size="large"
              clearable
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>

        <div class="register-footer">
          已有账号？<router-link to="/login" class="login-link">去登录</router-link>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { register } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  email: ''
})

// 表单验证规则（对应后端：用户名3-20字符，密码6-32字符，邮箱可选）
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为6-32个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

async function handleRegister() {
  // 先验证表单
  await formRef.value.validate()

  loading.value = true
  try {
    // 邮箱可选，有值才传
    const email = form.email.trim() || undefined
    // 调用注册 → 后端直接返回token（注册即登录）→ store处理token和用户信息
    await register(form.username, form.password, email)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    // 错误已在response拦截器中提示（如：用户名已被占用、邮箱已被注册）
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.register-card {
  max-width: 400px;
  width: 100%;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 40px;
  box-shadow: var(--app-shadow-sm);
}

.register-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--app-foreground);
  text-align: center;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: var(--app-muted-foreground);
  text-align: center;
  margin-bottom: 32px;
}

.register-btn {
  width: 100%;
  margin-top: 8px;
}

.register-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--app-muted-foreground);
}

.login-link {
  color: var(--app-primary);
  font-weight: 500;
}
</style>
