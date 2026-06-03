<script setup>
// 預設版型 — 模組件套版／客製首頁／全客製 三種類型共用
</script>

<template>
  <div class="site">
    <AppHeader />
    <main class="site__main">
      <slot />
    </main>
    <AppFooter />
    <PopupAds />
    <ClientOnly>
      <AdminPreviewBar />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.site {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1 0 auto;
  }
}
</style>
