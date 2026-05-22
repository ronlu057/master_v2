<script setup>
// 頁首派發器 — 依 NUXT_PUBLIC_HEADER 選用 components/headers/ 內的版型。
// 新增版型：在 headers/ 放一個 HeaderXX.vue 即可，本檔不需修改。
const headers = import.meta.glob('./headers/*.vue', { eager: true })
const { public: pub } = useRuntimeConfig()

// 依設定挑版型；找不到時 fallback 第一個
const current =
  headers[`./headers/Header${pub.header}.vue`]?.default ||
  Object.values(headers)[0]?.default
</script>

<template>
  <component :is="current" />
</template>
