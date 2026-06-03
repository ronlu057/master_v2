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
  <component :is="current" />
</template>
