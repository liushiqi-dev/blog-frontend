<template>
  <div class="page-shell detail-shell">
    <!-- 阅读进度条：滚动驱动，纯前端 -->
    <div class="read-progress" :style="{ width: progress + '%' }"></div>

    <AppHeader />

    <main class="main-content" v-loading="loading">
      <div v-if="post" class="post-layout">
      <article class="post-detail">
        <!-- 返回按钮 -->
        <el-button :icon="ArrowLeft" text @click="$router.push('/')">
          返回列表
        </el-button>

        <!-- 文章头部 -->
        <header v-reveal="0" class="post-header">
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
        <blockquote v-if="post.summary" v-reveal="1" class="post-summary">
          {{ post.summary }}
        </blockquote>

        <!-- 文章正文 -->
        <div
          ref="contentRef"
          class="post-content markdown-body"
          v-md-container
          v-reveal="2"
          v-html="renderedContent"
        ></div>

        <!-- 更新时间 -->
        <footer v-if="post.updateTime && post.updateTime !== post.createTime" class="post-footer">
          最后更新于 {{ formatDate(post.updateTime) }}
        </footer>
      </article>

      <!-- 侧栏：目录/相关/热门，全部由前端基于现有列表接口与正文 DOM 计算，不加后端 -->
      <aside class="post-aside">
        <section v-if="tocTree.length" class="aside-card">
          <h3 class="aside-title">目录</h3>
          <ul class="toc">
            <li v-for="g in tocTree" :key="g.id" class="toc-group" :class="{ open: expanded.has(g.id) }">
              <div class="toc-row">
                <a
                  :href="`#${g.id}`"
                  :title="g.text"
                  class="toc-link"
                  :class="{ active: activeId === g.id }"
                  @click="openOnly(g.id)"
                >{{ g.text }}</a>
                <button
                  v-if="g.children.length"
                  type="button"
                  class="toc-toggle"
                  :aria-label="expanded.has(g.id) ? '折叠本节' : '展开本节'"
                  @click="toggle(g.id)"
                >
                  <el-icon class="toc-chev"><ArrowRight /></el-icon>
                </button>
              </div>
              <div class="toc-children">
                <ul>
                  <li v-for="c in g.children" :key="c.id">
                    <a
                      :href="`#${c.id}`"
                      :title="c.text"
                      class="toc-link toc-child"
                      :class="{ active: activeId === c.id }"
                    >{{ c.text }}</a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </section>
        <section v-if="related.length" class="aside-card">
          <h3 class="aside-title">{{ relatedTitle }}</h3>
          <ul class="side-posts">
            <li v-for="p in related" :key="p.id">
              <router-link :to="`/posts/${p.id}`" :title="p.title">{{ p.title }}</router-link>
            </li>
          </ul>
        </section>
        <section v-if="hot.length" class="aside-card">
          <h3 class="aside-title">热门阅读</h3>
          <ol class="side-posts">
            <li v-for="(p, i) in hot" :key="p.id">
              <router-link :to="`/posts/${p.id}`" :title="p.title">
                <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>{{ p.title }}
              </router-link>
            </li>
          </ol>
        </section>
      </aside>
      </div>

      <el-empty v-if="!loading && !post" description="文章不存在或已被删除">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </el-empty>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, User, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPostDetailApi, getPostListApi, toggleLikeApi } from '@/api/post'
import { isLoggedIn } from '@/stores/user'
import { renderMarkdown, markdownContainer as vMdContainer } from '@/utils/markdown'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const likeLoading = ref(false)
const post = ref(null)
const progress = ref(0)
const contentRef = ref(null)
const tocTree = ref([])
const expanded = ref(new Set())
const activeId = ref('')
let headingEls = []
const related = ref([])
const hot = ref([])
const relatedTitle = ref('相关文章')

// 阅读进度条：scrollTop / 可滚总高度
function updateProgress() {
  const el = document.documentElement
  const max = el.scrollHeight - el.clientHeight
  progress.value = max > 0 ? (el.scrollTop / max) * 100 : 0
}

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
    fetchSideLists()
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 侧栏列表：复用现有列表接口前端计算（相关=同分类，热门=浏览量降序），数据量小无需新后端端点
async function fetchSideLists() {
  try {
    const res = await getPostListApi({ page: 1, size: 50 })
    const all = res.data.list || []
    hot.value = [...all].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5)
    const curCats = (post.value?.categoryNames || '').split(',').filter(Boolean)
    const sameCat = all.filter(p =>
      p.id !== post.value.id &&
      (p.categoryNames || '').split(',').some(c => curCats.includes(c))
    )
    // 无同分类文章时退化为最新文章，避免侧栏开天窗
    related.value = (sameCat.length ? sameCat : all.filter(p => p.id !== post.value.id)).slice(0, 5)
    relatedTitle.value = sameCat.length ? '相关文章' : '最新文章'
  } catch (error) {
    console.error('获取侧栏列表失败:', error)
  }
}

// 目录：渲染完成后扫描正文 h2/h3 补锚点并建树（markdown-it 默认不生 id）
watch(renderedContent, async () => {
  await nextTick()
  const root = contentRef.value
  if (!root) return
  headingEls = Array.from(root.querySelectorAll('h2, h3'))
  headingEls.forEach((h, i) => { h.id = `sec-${i}` })
  const tree = []
  let group = null
  headingEls.forEach(h => {
    const item = { id: h.id, text: h.textContent }
    if (h.tagName === 'H2') {
      group = { ...item, children: [] }
      tree.push(group)
    } else if (group) {
      group.children.push(item)
    } else {
      tree.push({ ...item, children: [] })
    }
  })
  tocTree.value = tree
  // 默认全折叠：目录只露大标题，侧栏不被撑长
  expanded.value = new Set()
  activeId.value = ''
  updateSpy()
})

function groupOf(id) {
  return tocTree.value.find(g => g.id === id || g.children.some(c => c.id === id))
}

// 手风琴式展开：自动展开新节时收起其余，保持侧栏紧凑
function openOnly(id) {
  expanded.value = new Set([id])
}

function toggle(id) {
  const next = new Set(expanded.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expanded.value = next
}

// 滚动 spy：取最后一个越过阅读线的标题为当前节，自动展开其所属分组
function updateSpy() {
  const readLine = 112
  let cur = ''
  for (const h of headingEls) {
    if (h.getBoundingClientRect().top <= readLine) cur = h.id
    else break
  }
  if (cur === activeId.value) return
  activeId.value = cur
  const g = groupOf(cur)
  if (g && !expanded.value.has(g.id)) openOnly(g.id)
}

// 侧栏跳转为同组件换参，需手动重拉并回顶
watch(() => route.params.id, () => {
  if (!route.params.id) return
  post.value = null
  tocTree.value = []
  expanded.value = new Set()
  activeId.value = ''
  headingEls = []
  window.scrollTo({ top: 0 })
  fetchPostDetail()
})

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

let spyTick = false
function handleScroll() {
  updateProgress()
  if (spyTick) return
  spyTick = true
  requestAnimationFrame(() => {
    spyTick = false
    updateSpy()
  })
}

onMounted(() => {
  fetchPostDetail()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
/* 置顶于 header（z-50）之上，贴视口顶边 */
.read-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  background-color: var(--app-primary);
  z-index: 60;
}

/* 灰底：与白纸、深色代码面板形成三层对比，替代背景图 */
.detail-shell {
  background-color: var(--app-muted-background);
}

.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 双栏：加宽的部分给侧栏而非正文行宽 */
.post-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 36px;
  align-items: start;
}

.post-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-shadow-sm);
  padding: 32px 36px;
}

.post-aside {
  position: sticky;
  top: 88px;
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 112px);
  overflow-y: auto;
}

.aside-card {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 16px 18px;
}

.aside-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-foreground);
  margin: 0 0 12px;
}

.toc {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
  line-height: 1.7;
}

.toc-row {
  display: flex;
  align-items: flex-start;
  gap: 2px;
}

.toc-link {
  flex: 1;
  min-width: 0;
  display: block;
  color: var(--app-muted-foreground);
  text-decoration: none;
  /* 目录是导航工具：允许换行保全文本，不截断 */
  line-height: 1.6;
  overflow-wrap: break-word;
  transition: color var(--app-duration-fast);
}

.toc-link:hover {
  color: var(--app-primary);
}

.toc-link.active {
  color: var(--app-primary);
  font-weight: 600;
}

.toc-toggle {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border: 0;
  background: transparent;
  color: var(--app-muted-foreground);
  cursor: pointer;
}

.toc-chev {
  transition: transform var(--app-duration-mid) var(--app-ease-out);
}

.toc-group.open .toc-chev {
  transform: rotate(90deg);
}

/* 子级折叠：grid 0fr→1fr 做高度动画，纯 CSS 丝滑展开 */
.toc-children {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--app-duration-mid) var(--app-ease-out);
}

.toc-group.open .toc-children {
  grid-template-rows: 1fr;
}

.toc-children > ul {
  min-height: 0;
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-child {
  padding-left: 12px;
}

.side-posts {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
}

.side-posts li + li {
  margin-top: 10px;
}

.side-posts a {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  color: var(--app-muted-foreground);
  text-decoration: none;
  transition: color var(--app-duration-fast);
}

.side-posts a:hover {
  color: var(--app-primary);
}

.rank {
  display: inline-block;
  min-width: 18px;
  margin-right: 6px;
  font-weight: 600;
  color: var(--app-muted-foreground);
}

.rank.top {
  color: var(--app-primary);
}

/* 锚点偏移：避免 sticky header 遮住目标标题 */
.post-content :deep(h2),
.post-content :deep(h3) {
  scroll-margin-top: 88px;
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
  background-color: var(--app-muted-background);
  border-radius: 0 var(--app-radius-sm) var(--app-radius-sm) 0;
  font-size: 16px;
  line-height: 1.75;
  color: var(--app-muted-foreground);
  font-style: italic;
}

/* 正文区：github-markdown-light 提供浅色底，这里只补内边距 */
.post-content {
  padding: 24px;
}

.post-footer {
  border-top: 1px solid var(--app-border);
  padding-top: 24px;
  font-size: 13px;
  color: var(--app-muted-foreground);
}

@media (max-width: 1023px) {
  .post-layout {
    grid-template-columns: 1fr;
  }

  .post-aside {
    position: static;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .post-detail {
    padding: 24px 18px;
  }
}
</style>
