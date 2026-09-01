// Markdown 渲染器：PostDetail 与 PostEditor 预览共用同一套配置
import { nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'github-markdown-css/github-markdown-dark.css'
import 'highlight.js/styles/atom-one-dark.css'
import '@/styles/markdown.css'

// html: false —— MD 内嵌 HTML 不直接渲染，统一交给 DOMPurify 兜底
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  // 代码高亮：未命中语言时也保持 hljs class，让主题的底色/内边距统一生效
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch (__) {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// fence 包一层相对定位容器，右上角复制按钮由指令在 sanitize 后注入（不进白名单）
const defaultFence = md.renderer.rules.fence
md.renderer.rules.fence = (tokens, idx, options, env, self) =>
  `<div class="md-code-block">${defaultFence(tokens, idx, options, env, self)}</div>`

// 唯一渲染入口：输出进 v-html 前必须经 DOMPurify 过滤（防 XSS，不能省）
export function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(md.render(text))
}

/* ---------- 代码块复制按钮：sanitize 之后由指令动态注入，不改 DOMPurify 白名单 ---------- */

function copyText(text) {
  // 优先 Clipboard API（仅 HTTPS/localhost 可用）；不可用或失败时降级 execCommand，兼容 http 站点
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text))
  }
  return Promise.resolve(fallbackCopy(text))
}

// 降级方案：临时 textarea + execCommand，http 环境下唯一可靠的复制途径
function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  ta.style.top = '0'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch (e) {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}

function restoreBtnText(btn) {
  clearTimeout(btn._copyTimer)
  btn._copyTimer = setTimeout(() => {
    btn.textContent = '复制'
    btn.classList.remove('copied')
  }, 1500)
}

// 事件委托：v-html 渲染出来的 DOM 绑不了 Vue 事件，在渲染容器上统一监听
function handleContainerClick(e, container) {
  const btn = e.target.closest('.md-copy-btn')
  if (!btn || !container.contains(btn)) return
  const code = btn.closest('.md-code-block')?.querySelector('pre code')
  if (!code) return
  btn.disabled = true
  copyText(code.textContent).then(ok => {
    btn.disabled = false
    btn.textContent = ok ? '已复制' : '复制失败'
    btn.classList.add('copied')
    restoreBtnText(btn)
  })
}

// 给每个代码块补注入复制按钮（幂等：已注入的跳过）
function injectCopyButtons(container) {
  container.querySelectorAll('.md-code-block').forEach(block => {
    if (block.querySelector('.md-copy-btn')) return
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'md-copy-btn'
    btn.textContent = '复制'
    block.appendChild(btn)
  })
}

function setupContainer(el) {
  // nextTick：等 v-html 本轮 DOM 更新完成后再注入，避免指令 updated 先于 v-html 执行
  nextTick(() => {
    injectCopyButtons(el)
    if (!el._mdClickBound) {
      el._mdClickBound = true
      el.addEventListener('click', e => handleContainerClick(e, el))
    }
  })
}

// 用法：渲染容器上与 v-html 同元素挂 v-md-container，每次内容更新后自动补按钮
export const markdownContainer = {
  mounted: setupContainer,
  updated: setupContainer,
}

export default md
