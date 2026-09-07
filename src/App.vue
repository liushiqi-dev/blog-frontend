<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--app-font-sans);
  background-color: var(--app-background);
  color: var(--app-foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
</style>
