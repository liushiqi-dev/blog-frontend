import request from '@/utils/request'

/**
 * 用户相关API
 */

// 获取当前用户信息
// GET /users/me
export function getUserInfoApi() {
  return request.get('/users/me')
}

// 用户登录
// POST /users/login
export function loginApi(data) {
  return request.post('/users/login', data)
}

// 用户注册
// POST /users/register
export function registerApi(data) {
  return request.post('/users/register', data)
}
