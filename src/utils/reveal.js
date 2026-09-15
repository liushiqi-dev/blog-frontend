// 滚动触发入场指令：元素进入视口时加 .is-revealed，配合 App.vue 全局 .reveal 样式
// 用法：v-reveal（无值）或 v-reveal="序号"（序号用于 stagger 错峰延迟）
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-revealed')
      observer.unobserve(entry.target)
    })
  },
  { threshold: 0.15 }
)

export const reveal = {
  mounted(el, binding) {
    if (typeof binding.value === 'number') {
      el.style.setProperty('--reveal-delay', `${(binding.value % 4) * 90}ms`)
    }
    // 首屏已在视口内的元素也走 observer，统一入场节奏
    observer.observe(el)
  },
  unmounted(el) {
    observer.unobserve(el)
  },
}
