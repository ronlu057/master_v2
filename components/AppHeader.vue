<script setup>
// 頁首派發器 — 依 NUXT_PUBLIC_HEADER 選用 components/headers/ 內的版型。
// NUXT_PUBLIC_HEADER 的值 = 版型「檔名」（不含 .vue），例如 header_value、Header01。
// 新增版型：在 headers/ 放一個 .vue 即可，本檔不需修改。
const headers = import.meta.glob('./headers/*.vue', { eager: true })
const { public: pub } = useRuntimeConfig()

// 依設定挑版型；找不到時 fallback 第一個
const current =
  headers[`./headers/${pub.header}.vue`]?.default ||
  Object.values(headers)[0]?.default
</script>

<template>
  <component :is="current" />
</template>
