<script setup>
// 模組件套版首頁 — 由 /home/view 回傳的 slots 驅動，前端只負責 render（白皮書 §3.7）
const { data: home } = await useApiData('/home/view', {
  key: 'home-view',
  default: () => ({ slots: [] }),
})
</script>

<template>
  <div class="home-module">
    <template v-for="slot in home.slots" :key="slot.key">
      <BlockRenderer :blocks="slot.blocks" />
    </template>
  </div>
</template>
