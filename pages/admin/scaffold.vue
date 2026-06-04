<script setup>
// /admin/scaffold — 檔案生成（直接用既有 AdminScaffold 元件）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })
</script>

<template>
  <div class="page">
    <AdminScaffold />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.page { padding: 0; }
</style>
