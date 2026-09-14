<template>
  <div class="page-shell">
    <AppHeader />

    <main class="main-content">
      <div class="page-head">
        <div>
          <h1 class="page-title">数据看板</h1>
          <p class="page-desc">全站文章、互动与内容规模统计，仅管理员可见</p>
        </div>
        <el-button :icon="Refresh" :loading="loading" @click="fetchDashboard">
          刷新
        </el-button>
      </div>

      <!-- 路由守卫已拦截非管理员，这里是第二道兜底：万一守卫被绕过（如直接构造跳转），
           页面本身也不渲染数据，真正的安全边界仍是后端的 @PreAuthorize -->
      <el-empty v-if="!isAdmin" description="需要管理员权限" />

      <template v-else>
        <!-- 数字指标卡片 -->
        <section class="stat-grid" v-loading="loading">
          <div v-for="card in statCards" :key="card.label" class="stat-card">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ fmt(card.value) }}</div>
            <div v-if="card.hint" class="stat-hint">{{ card.hint }}</div>
          </div>
        </section>

        <!-- 分类分布 + 热门文章 -->
        <div class="table-row">
          <section class="table-section">
            <h2 class="section-title">分类分布</h2>
            <el-table
              :data="data.categories"
              v-loading="loading"
              size="small"
              :header-cell-style="headerStyle"
            >
              <el-table-column prop="name" label="分类" min-width="140" />
              <el-table-column prop="total" label="文章数" width="100" align="right" />
              <template #empty>
                <el-empty description="暂无分类" :image-size="60" />
              </template>
            </el-table>
          </section>

          <section class="table-section">
            <h2 class="section-title">热门文章 Top10</h2>
            <el-table
              :data="data.hotPosts"
              v-loading="loading"
              size="small"
              :header-cell-style="headerStyle"
            >
              <el-table-column label="标题" min-width="200">
                <template #default="{ row }">
                  <router-link :to="`/posts/${row.id}`" class="hot-link">
                    {{ row.title }}
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column label="浏览量" width="100" align="right">
                <template #default="{ row }">
                  <span class="hot-count">{{ fmt(row.viewCount) }}</span>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无已发布文章" :image-size="60" />
              </template>
            </el-table>
          </section>
        </div>
      </template>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getDashboardApi } from '@/api/dashboard'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { isAdmin } from '@/stores/user'

const loading = ref(false)

// 后端 DashboardVo 的本地镜像，给出初始值避免首次渲染时读到 undefined
const data = reactive({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  recentPosts: 0,
  totalViews: 0,
  totalLikes: 0,
  totalWords: 0,
  categories: [],
  hotPosts: []
})

const headerStyle = {
  backgroundColor: 'var(--app-muted)',
  color: 'var(--app-muted-foreground)'
}

// 卡片配置集中在一处，模板里 v-for 渲染，增减指标只改这个数组
const statCards = computed(() => [
  { label: '文章总数', value: data.totalPosts, hint: '不含已删除' },
  { label: '已发布', value: data.publishedPosts, hint: '' },
  { label: '草稿', value: data.draftPosts, hint: '' },
  { label: '近 7 天新增', value: data.recentPosts, hint: '滚动 168 小时' },
  { label: '总浏览量', value: data.totalViews, hint: '' },
  { label: '总点赞数', value: data.totalLikes, hint: '' },
  { label: '全站字数', value: data.totalWords, hint: '正文字符数' }
])

// 千分位格式化；后端聚合值可能是字符串（Long 序列化），统一转 Number 再处理
function fmt(value) {
  if (value === null || value === undefined) return '-'
  const num = Number(value)
  return Number.isFinite(num) ? num.toLocaleString('zh-CN') : '-'
}

async function fetchDashboard() {
  loading.value = true
  try {
    const res = await getDashboardApi()
    Object.assign(data, res.data)
  } catch (error) {
    // 401/403 已由响应拦截器统一提示（跳登录 / "没有权限访问"），此处只保证页面不崩
    console.error('获取看板数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 非管理员不发请求，避免必然的 403
  if (isAdmin.value) {
    fetchDashboard()
  }
})
</script>

<style scoped>
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 64px 24px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: var(--app-muted-foreground);
  margin: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 20px;
  box-shadow: var(--app-shadow-sm);
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-muted-foreground);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  font-variant-numeric: tabular-nums;
}

.stat-hint {
  font-size: 12px;
  color: var(--app-muted-foreground);
  margin-top: 6px;
  min-height: 16px;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 16px;
}

.table-section {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 20px;
  box-shadow: var(--app-shadow-sm);
  overflow: hidden;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-foreground);
  margin: 0 0 16px 0;
}

.hot-link {
  color: var(--app-foreground);
  text-decoration: none;
  transition: color 0.2s ease;
}

.hot-link:hover {
  color: var(--app-primary);
}

.hot-count {
  color: var(--app-muted-foreground);
  font-variant-numeric: tabular-nums;
}

/* 窄屏降级为单列，避免卡片被压得读不清数字 */
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 32px;
  }
}
</style>
