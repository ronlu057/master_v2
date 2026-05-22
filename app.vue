<script setup>
// 依專案類型在 <html> 標上 data-project，驅動 CSS 變數主題切換
const { type } = useProject()
useHead({ htmlAttrs: { 'data-project': type } })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
