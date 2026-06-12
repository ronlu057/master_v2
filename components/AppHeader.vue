<script setup>
// 頁首派發器 — 依設定挑 components/headers/ 內的版型。
// 設定來源：useEffectiveSettings（initial = data/site-settings.json，可被 localStorage 預覽覆寫）
// 新增版型：在 headers/ 放一個 .vue 即可，本檔不需修改。
const headers = import.meta.glob('./headers/*.vue', { eager: true })
const { state } = useEffectiveSettings()

// 依設定挑版型（reactive，state.header 變動 → <component> 自動切換）；找不到時 fallback 第一個
const current = computed(
  () =>
    headers[`./headers/${state.header}.vue`]?.default ||
    Object.values(headers)[0]?.default,
)
</script>

<template>
  <!-- display:contents → 此 div 不產生任何盒子（不影響排版），純粹給後台「Header 背景色」
       的全域覆寫規則 .app-header header 一個穩定掛點，免去逐一改 16 支版型 -->
  <div class="app-header">
    <component :is="current" />
  </div>
</template>

<style scoped>
.app-header {
  display: contents;
}
</style>
