<script setup>
// 首頁 — 依專案類型切換版型：
//   臨時站 → HomeMinimal／客製首頁系 → HomeCustom／模組件套版 → HomeModule
const { customHome, isMinimal } = useProject()

const { data: seo } = await useApiData('/seo/home', {
  key: 'seo-home',
  default: () => ({}),
})
applySeo(seo.value)
</script>

<template>
  <div>
    <HomeMinimal v-if="isMinimal" />
    <HomeCustom v-else-if="customHome" />
    <HomeModule v-else />
  </div>
</template>
