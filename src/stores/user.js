import { reactive, computed } from 'vue'
import { loginApi, registerApi, getUserInfoApi } from '@/api/user'

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

// 是否为管理员（/users/me 返回 role: ADMIN/USER，控制文章编辑/删除按钮显示）
const isAdmin = computed(() => state.userInfo?.role === 'ADMIN')

// 登录
// 调用登录API → 存token → 获取用户信息
async function login(username, password) {
  const res = await loginApi({ username, password })
  state.token = res.data.token
  localStorage.setItem('token', state.token)
  // 登录成功后获取用户信息
  await fetchUserInfo()
}

// 注册
// 后端注册成功直接返回token（视为已登录）→ 存token → 获取用户信息
async function register(username, password, email) {
  const res = await registerApi({ username, password, email })
  state.token = res.data.token
  localStorage.setItem('token', state.token)
  await fetchUserInfo()
}

// 获取用户信息
async function fetchUserInfo() {
  if (!state.token) return
  try {
    const res = await getUserInfoApi()
    state.userInfo = res.data
  } catch (error) {
    // 仅 401 代表 token 失效才登出；超时/网络抖动/后端冷启动慢等瞬态故障
    // 不能误杀有效登录态（否则头部会突然变回未登录）
    if (error?.response?.status === 401) logout()
  }
}

// 退出登录
function logout() {
  state.token = ''
  state.userInfo = null
  localStorage.removeItem('token')
}

// 任一请求 401 时同步清空响应式状态：拦截器因循环依赖不能直接 import 本模块，用事件同步
window.addEventListener('auth:logout', logout)

export { state, isLoggedIn, isAdmin, login, register, fetchUserInfo, logout }
