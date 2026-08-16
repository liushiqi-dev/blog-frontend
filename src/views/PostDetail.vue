<template>
  <div>
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
            <template v-if="post.categoryNames">
              <span class="meta-dot">·</span>
              <el-tag size="small" effect="light" round>
                {{ post.categoryNames }}
              </el-tag>
            </template>
          </div>
        </header>

        <!-- 文章摘要 -->
        <blockquote v-if="post.summary" class="post-summary">
          {{ post.summary }}
        </blockquote>

        <!-- 文章正文 -->
        <div class="post-content" v-html="renderedContent"></div>

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
import { useRoute } from 'vue-router'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import { getPostDetailApi } from '@/api/post'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const loading = ref(false)
const post = ref(null)

// 简单的内容渲染（后续可替换为Markdown渲染器）
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  // 将换行符转换为<p>标签
  return post.value.content
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line}</p>`)
    .join('')
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

.post-content {
  font-size: 17px;
  line-height: 1.8;
  color: var(--app-foreground);
}

.post-content :deep(p) {
  margin: 0 0 1.2em 0;
}

.post-footer {
  border-top: 1px solid var(--app-border);
  padding-top: 24px;
  font-size: 13px;
  color: var(--app-muted-foreground);
}
</style>
