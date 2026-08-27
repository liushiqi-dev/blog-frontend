import request from '@/utils/request'

/**
 * 文章相关API
 * 每个方法对应后端一个接口
 */

// 获取文章列表（分页）
// GET /posts?page=1&size=10
export function getPostListApi(params) {
  return request.get('/posts', { params })
}

// 获取文章详情
// GET /posts/{id}
export function getPostDetailApi(id) {
  return request.get(`/posts/${id}`)
}

// 发布文章
// POST /posts
export function createPostApi(data) {
  return request.post('/posts', data)
}

// 编辑文章
// PUT /posts/{id}
export function updatePostApi(id, data) {
  return request.put(`/posts/${id}`, data)
}

// 删除文章
// DELETE /posts/{id}
export function deletePostApi(id) {
  return request.delete(`/posts/${id}`)
}

// 点赞/取消点赞
// PATCH /posts/{id}/like
export function toggleLikeApi(id) {
  return request.patch(`/posts/${id}/like`)
}
