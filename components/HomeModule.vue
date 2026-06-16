<script setup>
// 模組件套版首頁 — 由 /home/view 回傳的 slots 驅動，前端只負責 render（白皮書 §3.7）
// 用 BlockRenderer（render function）把 slots→blocks 攤平成子節點陣列，
// 避免 template v-for/v-if 產生的 Fragment 註解錨點（<!--[-->），同時維持 SSR / SEO。
import BlockRenderer from './BlockRenderer.js'

const { data: home } = await useApiData('/home/view', {
  key: 'home-view',
  default: () => ({ slots: [] }),
})

const blocks = computed(() =>
  (home.value?.slots || []).flatMap((slot) => slot.blocks || []),
)
</script>

<template>
  <BlockRenderer :blocks="blocks" wrap-class="home-module" />
</template>
