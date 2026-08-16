import request from '@/utils/request'

/**
 * 分类相关API
 */

// 获取分类列表
// GET /categories
// 返回: [{ name, total }]
export function getCategoryListApi() {
  return request.get('/categories')
}

// 创建分类
// POST /categories
// 请求体: { name: string (2-20字符) }
export function createCategoryApi(data) {
  return request.post('/categories', data)
}

// 更新分类
// PUT /categories/{id}
// 请求体: { name: string (2-20字符) }
export function updateCategoryApi(id, data) {
  return request.put(`/categories/${id}`, data)
}

// 删除分类
// DELETE /categories/{id}
// 分类下存在文章时无法删除
export function deleteCategoryApi(id) {
  return request.delete(`/categories/${id}`)
}
