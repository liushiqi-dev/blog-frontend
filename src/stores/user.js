import { reactive, computed } from 'vue'
import { loginApi, getUserInfoApi } from '@/api/user'

/**
 * 用户状态管理（全局响应式状态）
 *
 * 数据流程：
 * 登录页调用 login() → API返回token → 存入localStorage + reactive状态
 * AppHeader读取 isLoggedIn → 显示用户名或登录按钮
 * 退出调用 logout() → 清除localStorage + reactive状态
 */

const state = reactive({
  token: localStorage.getItem('token') || '',
  userInfo: null  // { username, role, email }
})

// 是否已登录
const isLoggedIn = computed(() => !!state.token)

// 登录
// 调用登录API → 存token → 获取用户信息
async function login(username, password) {
  const res = await loginApi({ username, password })
  state.token = res.data.token
  localStorage.setItem('token', state.token)
  // 登录成功后获取用户信息
  await fetchUserInfo()
}

// 获取用户信息
async function fetchUserInfo() {
  if (!state.token) return
  try {
    const res = await getUserInfoApi()
    state.userInfo = res.data
  } catch (error) {
    // token失效，清除登录状态
    logout()
  }
}

// 退出登录
function logout() {
  state.token = ''
  state.userInfo = null
  localStorage.removeItem('token')
}

export { state, isLoggedIn, login, fetchUserInfo, logout }
