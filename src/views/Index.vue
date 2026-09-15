<template>
  <div class="page-shell list-shell">
    <AppHeader />

    <main class="main-content">
      <!-- hero 带：点阵纹理/单一强调色等科技感点缀集中在这里，阅读区保持浅色 -->
      <section class="hero">
        <div class="hero-inner">
          <p class="hero-kicker" v-reveal="0">代码 · 笔记 · 思考</p>
          <h1 class="hero-title" v-reveal="1">每一门技术，都值得被<em>认真书写</em></h1>
          <p class="hero-sub" v-reveal="2">从语言基础到工程实践，一篇一篇，慢慢写清楚</p>
        </div>
      </section>

      <!-- 文章列表：白纸卡片 -->
      <section class="post-list">
        <!-- 列表工具栏：入纸内与行文字同列对齐；新建文章仅管理员可见 -->
        <section class="list-toolbar">
          <h2 class="list-title">全部文章</h2>
          <el-button v-if="isAdmin" type="primary" :icon="Plus" round @click="handleNewPost">
            新建文章
          </el-button>
        </section>

        <template v-if="loading">
          <div v-for="i in 3" :key="`sk-${i}`" class="post-card">
            <el-skeleton animated :rows="3" />
          </div>
        </template>

        <template v-else>
        <article
          v-for="(post, index) in postList"
          :key="post.id"
          class="post-card"
          v-reveal="index"
          @click="goToDetail(post.id)"
        >
          <div class="post-meta">
            <span class="post-author">{{ post.authorName }}</span>
            <span class="meta-dot">·</span>
            <span class="post-date">{{ formatDate(post.createTime) }}</span>
            <span class="meta-dot">·</span>
            <span class="post-views">
              <el-icon :size="14"><View /></el-icon>
              {{ post.viewCount }}
            </span>
          </div>

          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-summary">{{ post.summary }}</p>

          <!-- 发布状态仅管理员可见 -->
          <div v-if="isAdmin" class="post-footer">
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

            <div v-if="isAdmin" class="post-actions">
              <el-button
                :icon="EditPen"
                text
                type="primary"
                size="small"
                @click.stop="handleEdit(post.id)"
              >
                编辑
              </el-button>
              <el-button
                :icon="Delete"
                text
                type="danger"
                size="small"
                @click.stop="handleDelete(post)"
              >
                删除
              </el-button>
            </div>
          </div>
        </article>

        <el-empty v-if="postList.length === 0" description="暂无文章" />
        </template>
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
import { Plus, EditPen, Delete, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPostListApi, deletePostApi } from '@/api/post'
import { isAdmin } from '@/stores/user'
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
  router.push('/posts/create')
}

function handleEdit(id) {
  router.push(`/posts/${id}/edit`)
}

async function handleDelete(post) {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章「${post.title}」吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deletePostApi(post.id)
    ElMessage.success('删除成功')
    fetchPostList()
  } catch (error) {
    // 用户点击取消或请求失败（失败已在拦截器中提示）
  }
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
/* 首页灰底：与详情页同一套分层语言 */
.list-shell {
  background-color: var(--app-muted-background);
}

.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 24px;
}

/* hero 带：100vw 满幅出血，点阵纹理提供氛围但不抢内容 */
.hero {
  position: relative;
  width: 100vw;
  margin: -64px 0 0 calc(50% - 50vw);
  padding: 104px 0 72px;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--app-dot) 1px, transparent 1.5px);
  background-size: 26px 26px;
  -webkit-mask-image: linear-gradient(#000 55%, transparent);
  mask-image: linear-gradient(#000 55%, transparent);
}

.hero-inner {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-kicker {
  color: var(--app-primary);
  font-size: 14px;
  letter-spacing: 0.12em;
  margin: 0 0 14px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0 0 14px;
}

.hero-title em {
  font-style: normal;
  color: var(--app-primary);
}

.hero-sub {
  font-size: 17px;
  color: var(--app-muted-foreground);
  margin: 0;
}

.list-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 0 4px;
}

.list-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--app-foreground);
  margin: 0;
}

/* 列表白纸：与灰底分离，和详情页的白纸卡片呼应；overflow 裁切 hover 高亮的直角 */
.post-list {
  display: grid;
  margin-top: 40px;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-shadow-sm);
  padding: 8px 36px;
  overflow: hidden;
}

/* 流式列表：无间隙行；分隔线与文字左右边缘对齐，上下留白从宽 */
.post-card {
  position: relative;
  /* 负外边距把 hover 高亮撑到纸边（与整列平行），padding 把文字收回与标题对齐 */
  margin: 0 -36px;
  padding: 28px 36px;
  cursor: pointer;
  transition: background-color var(--app-duration-mid) var(--app-ease-out);
}

.post-card::after {
  content: "";
  position: absolute;
  left: 36px;
  right: 36px;
  bottom: 0;
  height: 1px;
  background-color: var(--app-border);
}

.post-card:last-child::after {
  display: none;
}

.post-card:hover {
  background-color: var(--app-primary-light);
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

.post-views {
  display: flex;
  align-items: center;
  gap: 4px;
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
  justify-content: space-between;
  gap: 8px;
}

.post-actions {
  display: flex;
  gap: 4px;
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .hero {
    padding: 72px 0 48px;
  }

  .hero-title {
    font-size: 32px;
  }

  .post-list {
    padding: 4px 18px;
  }

  .post-card {
    margin: 0 -18px;
    padding: 24px 18px;
  }

  .post-card::after {
    left: 18px;
    right: 18px;
  }
}
</style>
