<script setup>
// 依專案類型在 <html> 標上 data-project，驅動 CSS 變數主題切換
const { type } = useProject()

// 依目前路由在 <body> 標上 data-page，供 CSS 針對特定頁面切換樣式
// 規則：
//   '/'                       → 'index'
//   '/news'、'/news/xxx'       → 'news'
//   '/about/company-intro'    → 'about'
// 用法（任何 .vue 的 <style>）：body[data-page="index"] .xxx { ... }
const route = useRoute()
const dataPage = computed(() => {
  if (route.path === '/') return 'index'
  return route.path.split('/').filter(Boolean)[0] || 'index'
})

useHead({
  htmlAttrs: { 'data-project': type },
  bodyAttrs: { 'data-page': dataPage },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
