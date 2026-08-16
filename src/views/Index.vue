<template>
  <div>
    <AppHeader />

    <main class="main-content">
      <!-- 标题区 -->
      <section class="page-header">
        <div>
          <h1 class="page-title">全部文章</h1>
          <p class="page-subtitle">记录学习、分享技术、沉淀思考</p>
        </div>
        <el-button type="primary" :icon="Plus" round @click="handleNewPost">
          新建文章
        </el-button>
      </section>

      <!-- 文章列表 -->
      <section class="post-list" v-loading="loading">
        <article
          v-for="post in postList"
          :key="post.id"
          class="post-card"
          @click="goToDetail(post.id)"
        >
          <div class="post-meta">
            <span class="post-author">{{ post.authorName }}</span>
            <span class="meta-dot">·</span>
            <span class="post-date">{{ formatDate(post.createTime) }}</span>
          </div>

          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-summary">{{ post.summary }}</p>

          <div class="post-footer">
            <el-tag
              v-if="post.status === 'PUBLISHED'"
              size="small"
              type="success"
              effect="light"
              round
            >
              已发布
            </el-tag>
            <el-tag
              v-else-if="post.status === 'DRAFT'"
              size="small"
              type="info"
              effect="light"
              round
            >
              草稿
            </el-tag>
          </div>
        </article>

        <el-empty v-if="!loading && postList.length === 0" description="暂无文章" />
      </section>

      <!-- 分页 -->
      <section class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { getPostListApi } from '@/api/post'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

// 响应式状态
const loading = ref(false)
const postList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取文章列表
// 调用API → 后端返回 { code:1, data:{ list, total, page, size } } → 更新状态
async function fetchPostList() {
  loading.value = true
  try {
    const res = await getPostListApi({
      page: currentPage.value,
      size: pageSize.value
    })
    postList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

function goToDetail(id) {
  router.push(`/posts/${id}`)
}

function handleNewPost() {
  router.push('/post-editor')
}

function handlePageChange() {
  fetchPostList()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchPostList()
}

// 后端返回 "2026-08-14 10:00:00"，只取日期部分
function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

onMounted(() => {
  fetchPostList()
})
</script>

<style scoped>
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 24px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40px;
}

.page-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--app-muted-foreground);
  margin: 0;
}

.post-list {
  display: grid;
  gap: 24px;
}

.post-card {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 24px;
  box-shadow: var(--app-shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.post-card:hover {
  box-shadow: var(--app-shadow-md);
  transform: translateY(-2px);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--app-muted-foreground);
  margin-bottom: 12px;
}

.meta-dot {
  color: var(--app-muted-foreground);
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.005em;
  color: var(--app-foreground);
  margin: 0 0 8px 0;
  transition: color 0.2s ease;
}

.post-card:hover .post-title {
  color: var(--app-primary);
}

.post-summary {
  font-size: 16px;
  line-height: 1.75;
  color: var(--app-muted-foreground);
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>
