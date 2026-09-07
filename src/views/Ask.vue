<template>
  <div class="page-shell">
    <AppHeader />

    <main class="main-content">
      <!-- 页头 -->
      <header class="ask-header">
        <div class="ask-badge">
          <el-icon :size="16"><ChatDotRound /></el-icon>
          <span>知识库问答</span>
        </div>
        <h1 class="ask-title">问我的博客</h1>
        <p class="ask-subtitle">
          基于站内文章内容检索并生成回答，答案下方会列出引用来源。
        </p>
      </header>

      <!-- 提问输入区 -->
      <section class="ask-composer">
        <el-input
          v-model="question"
          type="textarea"
          :rows="4"
          resize="none"
          maxlength="500"
          show-word-limit
          placeholder="输入你想了解的问题，例如：这些博客讲了哪些技术内容？"
          @keydown.ctrl.enter.prevent="handleAsk"
        />
        <div class="composer-actions">
          <span class="composer-hint">Ctrl + Enter 快速提问</span>
          <el-button
            type="primary"
            round
            :loading="loading"
            :disabled="!question.trim()"
            @click="handleAsk"
          >
            <el-icon v-if="!loading"><Promotion /></el-icon>
            <span>提问</span>
          </el-button>
        </div>
      </section>

      <!-- 回答区 -->
      <section v-if="loading || answer" class="ask-answer">
        <div v-if="loading" class="answer-thinking">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="thinking-text">思考中…</span>
        </div>

        <template v-else>
          <div class="answer-label">
            <el-icon :size="15"><MagicStick /></el-icon>
            <span>回答</span>
          </div>
          <p class="answer-text">{{ answer }}</p>

          <!-- 引用来源：为空时不渲染 -->
          <div v-if="sources.length" class="answer-sources">
            <div class="sources-label">引用来源</div>
            <ul class="source-list">
              <li v-for="src in sources" :key="src.postId">
                <router-link :to="`/posts/${src.postId}`" class="source-link">
                  <el-icon :size="14"><Document /></el-icon>
                  <span class="source-title">{{ src.title }}</span>
                  <el-icon :size="13" class="source-arrow"><ArrowRight /></el-icon>
                </router-link>
              </li>
            </ul>
          </div>
        </template>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ChatDotRound,
  Promotion,
  MagicStick,
  Document,
  ArrowRight
} from '@element-plus/icons-vue'
import { askApi } from '@/api/kb'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const question = ref('')
const answer = ref('')
const sources = ref([])
const loading = ref(false)

// 提问：空问题直接拦截；成功后取拦截器返回体的 data 渲染答案与来源
async function handleAsk() {
  const q = question.value.trim()
  if (!q || loading.value) return

  loading.value = true
  answer.value = ''
  sources.value = []
  try {
    const res = await askApi({ question: q })
    answer.value = res.data?.answer || ''
    sources.value = res.data?.sources || []
  } catch (error) {
    // 失败已由响应拦截器统一提示，此处保持页面状态不崩
    console.error('知识库问答失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.main-content {
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px 72px;
}

/* 页头 */
.ask-header {
  text-align: center;
  margin-bottom: 40px;
}

.ask-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: var(--app-radius-full);
  background-color: var(--app-primary-light);
  color: var(--app-primary);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
}

.ask-title {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--app-foreground);
  margin: 0 0 12px;
}

.ask-subtitle {
  font-size: 15px;
  line-height: 1.6;
  color: var(--app-muted-foreground);
  max-width: 460px;
  margin: 0 auto;
}

/* 提问输入区 */
.ask-composer {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 16px;
  box-shadow: var(--app-shadow-sm);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.ask-composer:focus-within {
  border-color: var(--app-primary);
  box-shadow: var(--app-shadow-md);
}

.ask-composer :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 4px 8px;
  font-size: 16px;
  line-height: 1.6;
  background: transparent;
  font-family: inherit;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
}

.composer-hint {
  font-size: 12px;
  color: var(--app-muted-foreground);
}

.composer-actions .el-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* 回答区 */
.ask-answer {
  margin-top: 32px;
  background-color: var(--app-muted-background);
  border-radius: var(--app-radius-lg);
  padding: 28px;
}

.answer-thinking {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--app-muted-foreground);
  font-size: 15px;
}

.answer-thinking .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--app-primary);
  animation: thinking-bounce 1.2s infinite ease-in-out;
}

.answer-thinking .dot:nth-child(2) {
  animation-delay: 0.15s;
}

.answer-thinking .dot:nth-child(3) {
  animation-delay: 0.3s;
}

.thinking-text {
  margin-left: 6px;
}

@keyframes thinking-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

.answer-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-primary);
  margin-bottom: 14px;
}

.answer-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--app-foreground);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

/* 引用来源 */
.answer-sources {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--app-border);
}

.sources-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-muted-foreground);
  margin-bottom: 12px;
}

.source-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  color: var(--app-foreground);
  font-size: 14px;
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.source-link:hover {
  border-color: var(--app-primary);
  transform: translateX(3px);
  box-shadow: var(--app-shadow-sm);
}

.source-link .el-icon:first-child {
  color: var(--app-primary);
  flex-shrink: 0;
}

.source-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-arrow {
  color: var(--app-muted-foreground);
  flex-shrink: 0;
}
</style>
