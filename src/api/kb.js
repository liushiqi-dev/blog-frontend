import request from '@/utils/request'

// 知识库问答接口
// POST /kb/ask，入参 { question }，返回 { answer, sources:[{postId,title}] }
// 问答链路较长（向量化+KNN+LLM生成），按请求覆盖全局 5s 超时为 60s
export function askApi(data) {
  return request.post('/kb/ask', data, { timeout: 60000 })
}
