import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * Axios实例
 * - baseURL: /api，Vite代理转发到后端http://localhost:8080
 * - 请求拦截器：注入JWT Token
 * - 响应拦截器：统一错误处理
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器：注入JWT Token到请求头
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理业务错误和HTTP错误
request.interceptors.response.use(
  response => {
    const res = response.data

    // 业务成功（后端约定 code === 1）
    if (res.code === 1) {
      return res
    }

    // 业务失败（code === 2）
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    if (error.response) {
      const status = error.response.status

      if (status === 401) {
        // 未登录或Token失效，跳转登录页
        localStorage.removeItem('token')
        ElMessage.error('登录已过期，请重新登录')
        import('@/router').then(({ default: router }) => {
          router.push('/login')
        })
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }

    return Promise.reject(error)
  }
)

export default request
