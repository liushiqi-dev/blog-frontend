<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p>个人博客 · 用于 Java Web 简历项目展示</p>
      <p class="copyright">© 2026 Blog. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
/**
 * AppFooter - 底部版权栏
 */
</script>

<style scoped>
.app-footer {
  margin-top: 64px;
  border-top: 1px solid var(--app-border);
  padding: 32px 0;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  font-size: 14px;
  color: var(--app-muted-foreground);
}

.copyright {
  margin-top: 4px;
}
</style>
