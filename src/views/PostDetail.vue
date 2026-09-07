<template>
  <div class="page-shell">
    <AppHeader />

    <main class="main-content" v-loading="loading">
      <article v-if="post" class="post-detail">
        <!-- 返回按钮 -->
        <el-button :icon="ArrowLeft" text @click="$router.push('/')">
          返回列表
        </el-button>

        <!-- 文章头部 -->
        <header class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>

          <div class="post-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ post.authorName }}
            </span>
            <span class="meta-dot">·</span>
            <span class="meta-item">{{ formatDate(post.createTime) }}</span>
            <span class="meta-dot">·</span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ post.viewCount }}
            </span>
            <template v-if="post.categoryNames">
              <span class="meta-dot">·</span>
              <el-tag size="small" effect="light" round>
                {{ post.categoryNames }}
              </el-tag>
            </template>
          </div>
        </header>

        <!-- 点赞按钮 -->
        <div class="post-actions">
          <el-button
            round
            :class="{ liked: post.liked }"
            :loading="likeLoading"
            @click="handleLike"
          >
            <svg class="like-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
            {{ post.likeCount }}
          </el-button>
        </div>

        <!-- 文章摘要 -->
        <blockquote v-if="post.summary" class="post-summary">
          {{ post.summary }}
        </blockquote>

        <!-- 文章正文 -->
        <div
          class="post-content markdown-body"
          data-color-mode="dark"
          v-md-container
          v-html="renderedContent"
        ></div>

        <!-- 更新时间 -->
        <footer v-if="post.updateTime && post.updateTime !== post.createTime" class="post-footer">
          最后更新于 {{ formatDate(post.updateTime) }}
        </footer>
      </article>

      <el-empty v-if="!loading && !post" description="文章不存在或已被删除">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </el-empty>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPostDetailApi, toggleLikeApi } from '@/api/post'
import { isLoggedIn } from '@/stores/user'
import { renderMarkdown, markdownContainer as vMdContainer } from '@/utils/markdown'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const likeLoading = ref(false)
const post = ref(null)

// Markdown 渲染（共享 renderMarkdown 内部已含 DOMPurify 过滤）
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return renderMarkdown(post.value.content)
})

async function fetchPostDetail() {
  loading.value = true
  try {
    const res = await getPostDetailApi(route.params.id)
    post.value = res.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.split('T')[0].split(' ')[0]
}

// 点赞/取消点赞：未登录先提示登录；成功后本地翻转状态与计数（后端异步落库，前端乐观更新）
async function handleLike() {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  likeLoading.value = true
  try {
    await toggleLikeApi(post.value.id)
    post.value.liked = !post.value.liked
    post.value.likeCount += post.value.liked ? 1 : -1
  } catch (error) {
    // 失败已在响应拦截器中提示
  } finally {
    likeLoading.value = false
  }
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<style scoped>
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.post-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-header {
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 24px;
}

.post-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0 0 16px 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--app-muted-foreground);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-dot {
  color: var(--app-muted-foreground);
}

.post-actions {
  margin-top: 4px;
}

.like-icon {
  width: 16px;
  height: 16px;
}

.post-actions .el-button {
  color: var(--app-muted-foreground);
}

.post-actions .el-button.liked {
  color: var(--el-color-danger);
}

.post-summary {
  border-left: 3px solid var(--app-primary);
  padding: 16px 24px;
  margin: 0;
  background-color: var(--app-muted);
  border-radius: 0 var(--app-radius-sm) var(--app-radius-sm) 0;
  font-size: 16px;
  line-height: 1.75;
  color: var(--app-muted-foreground);
  font-style: italic;
}

/* 深色阅读面板：底色与文字色由 github-markdown-dark 主题提供，这里只补内边距 */
.post-content {
  padding: 24px;
}

.post-footer {
  border-top: 1px solid var(--app-border);
  padding-top: 24px;
  font-size: 13px;
  color: var(--app-muted-foreground);
}
</style>
