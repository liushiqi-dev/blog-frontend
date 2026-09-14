import request from '@/utils/request'

/**
 * 管理后台统计看板 API
 */

// 获取全站统计指标
// GET /admin/dashboard
// 需要 ADMIN 角色，非管理员后端返回 403
// 返回: { totalPosts, publishedPosts, draftPosts, recentPosts, totalViews,
//         totalLikes, totalWords, categories:[{id,name,total}], hotPosts:[{id,title,viewCount,createTime}] }
export function getDashboardApi() {
  return request.get('/admin/dashboard')
}
