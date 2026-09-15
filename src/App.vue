<template>
  <!-- 路由过渡：旧页淡出后新页淡入上浮，mode=out-in 避免两页同屏撑高 -->
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 目录锚点跳转平滑滚动 */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--app-font-sans);
  background-color: var(--app-background);
  color: var(--app-foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* hero 带用 100vw 满幅出血，clip 掉滚动条宽度差带来的横向溢出 */
  overflow-x: clip;
}

a {
  color: inherit;
  text-decoration: none;
}

/* 页面壳：撑满视口，main 拉伸吃掉剩余空间，Footer 始终沉底 */
.page-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh; /* 移动端地址栏收合时更准确，旧浏览器回退到上面的 100vh */
}

.page-shell > main {
  flex: 1;
  /* column flex 下子项水平 auto 外边距会取消 stretch 使其收缩为 fit-content，
     给定 definite 宽度后 auto 外边距无剩余空间可吸收，main 稳定占满可用宽度（再受各页 max-width 约束居中） */
  width: 100%;
}

/* 滚动触发入场：配合 v-reveal 指令，只动 opacity/transform（合成层属性，不触发重排） */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity var(--app-duration-slow) var(--app-ease-out) var(--reveal-delay, 0ms),
    transform var(--app-duration-slow) var(--app-ease-out) var(--reveal-delay, 0ms);
}

.reveal.is-revealed {
  opacity: 1;
  transform: none;
}

/* 路由过渡动画 */
.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--app-duration-mid) var(--app-ease-out),
    transform var(--app-duration-mid) var(--app-ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
}

/* 无障碍：系统开启"减弱动态效果"时关闭所有入场/过渡动画 */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
