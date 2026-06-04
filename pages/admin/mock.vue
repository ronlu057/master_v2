<script setup>
// /admin/mock — Mock 資料編輯（直接用既有 AdminMockData 元件）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })
</script>

<template>
  <div class="page">
    <AdminMockData />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.page { padding: 0; }
</style>
