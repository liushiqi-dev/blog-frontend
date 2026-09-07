<template>
  <div class="page-shell">
    <AppHeader />

    <main class="main-content">
      <div class="header-row">
        <h1 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h1>
        <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
      </div>

      <div class="editor-layout" v-loading="loading">
        <!-- 左侧：标题 + 正文 -->
        <section class="editor-main">
          <div class="form-group">
            <label class="form-label">文章标题</label>
            <el-input
              v-model="form.title"
              placeholder="请输入标题"
              size="large"
              :maxlength="100"
              show-word-limit
              clearable
            />
          </div>

          <div class="form-group">
            <label class="form-label">摘要（可选）</label>
            <el-input
              v-model="form.summary"
              placeholder="不填则自动取正文前100字符"
              type="textarea"
              :rows="2"
              :maxlength="200"
              show-word-limit
            />
          </div>

          <div class="form-group">
            <label class="form-label">正文内容</label>
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="18"
              placeholder="开始写作..."
              resize="vertical"
            />
          </div>
        </section>

        <!-- 中间：Markdown 实时预览 -->
        <section class="editor-preview">
          <div class="preview-card">
            <h2 class="settings-title">实时预览</h2>
            <div
              v-if="form.content.trim()"
              class="markdown-body preview-content"
              data-color-mode="dark"
              v-md-container
              v-html="renderedPreview"
            ></div>
            <p v-else class="preview-placeholder">开始输入即可实时预览</p>
          </div>
        </section>

        <!-- 右侧：发布设置 -->
        <aside class="editor-aside">
          <div class="settings-card">
            <h2 class="settings-title">发布设置</h2>
            <div class="settings-form">
              <div class="form-group">
                <label class="form-label">分类</label>
                <el-select
                  v-model="form.categoryIds"
                  multiple
                  placeholder="选择分类（可多选）"
                  style="width: 100%"
                >
                  <el-option
                    v-for="cat in categoryList"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </div>

              <div class="form-group">
                <label class="form-label">状态</label>
                <el-radio-group v-model="form.status">
                  <el-radio value="PUBLISHED">发布</el-radio>
                  <el-radio value="DRAFT">草稿</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button
              type="primary"
              :icon="Promotion"
              :loading="submitLoading"
              @click="handleSubmit"
            >
              {{ form.status === 'DRAFT' ? '保存草稿' : '发布文章' }}
            </el-button>
            <el-button @click="goBack">取消</el-button>
          </div>
        </aside>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPostDetailApi, createPostApi, updatePostApi } from '@/api/post'
import { getCategoryListApi } from '@/api/category'
import { renderMarkdown, markdownContainer as vMdContainer } from '@/utils/markdown'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive({
  title: '',
  content: '',
  summary: '',
  categoryIds: [],
  status: 'PUBLISHED'
})

const categoryList = ref([])

// 实时预览（共享 renderMarkdown 内部已含 DOMPurify 过滤）
const renderedPreview = computed(() => {
  if (!form.content) return ''
  return renderMarkdown(form.content)
})

// 加载分类列表
async function fetchCategoryList() {
  try {
    const res = await getCategoryListApi()
    categoryList.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 编辑模式：加载文章数据
async function fetchPostDetail(id) {
  loading.value = true
  try {
    const res = await getPostDetailApi(id)
    const post = res.data
    form.title = post.title
    form.content = post.content
    form.summary = post.summary || ''
    form.status = post.status
    // categoryNames 是逗号分隔的字符串，需要匹配回 categoryIds
    if (post.categoryNames) {
      const names = post.categoryNames.split(',')
      form.categoryIds = categoryList.value
        .filter(cat => names.includes(cat.name))
        .map(cat => cat.id)
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交（新建或编辑）
async function handleSubmit() {
  if (!form.title.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('正文不能为空')
    return
  }
  if (form.categoryIds.length === 0) {
    ElMessage.warning('请至少选择一个分类')
    return
  }

  const data = {
    title: form.title.trim(),
    content: form.content,
    categoryIds: form.categoryIds,
    status: form.status
  }
  // summary 可选，有值才传
  if (form.summary.trim()) {
    data.summary = form.summary.trim()
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updatePostApi(route.params.id, data)
      ElMessage.success('更新成功')
    } else {
      await createPostApi(data)
      ElMessage.success(form.status === 'DRAFT' ? '草稿已保存' : '发布成功')
    }
    router.push('/')
  } catch (error) {
    // 错误已在响应拦截器中提示
  } finally {
    submitLoading.value = false
  }
}

function goBack() {
  router.push('/')
}

onMounted(async () => {
  await fetchCategoryList()
  if (isEdit.value) {
    fetchPostDetail(route.params.id)
  }
})
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.page-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 320px;
  gap: 32px;
}

/* 中间：Markdown 实时预览 */
.editor-preview {
  min-width: 0;
}

.preview-card {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 24px;
  box-shadow: var(--app-shadow-sm);
}

/* 深色预览面板：底色与文字色由 github-markdown-dark 主题提供，这里只保留滚动约束 */
.preview-content {
  max-height: 640px;
  overflow-y: auto;
}

.preview-placeholder {
  margin: 0;
  min-height: 200px;
  color: var(--app-muted-foreground);
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-foreground);
}

.editor-aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 24px;
  box-shadow: var(--app-shadow-sm);
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-foreground);
  margin: 0 0 16px 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  flex: 1;
}

/* 中屏：预览移到编辑区下方占满整行，发布设置保持右侧 */
@media (max-width: 1100px) {
  .editor-layout {
    grid-template-columns: 1fr 320px;
  }

  .editor-preview {
    grid-column: 1 / -1;
    order: 3;
  }
}

@media (max-width: 768px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  /* 单列时恢复 DOM 顺序：编辑 → 预览 → 发布设置 */
  .editor-preview {
    order: 0;
  }
}
</style>
