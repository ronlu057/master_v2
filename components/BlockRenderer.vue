<script setup>
// Block 渲染器（白皮書 §3.7）
// 依 block.type 對應元件，內容固定取自 block.item.rows；未知 type 直接 skip。
import BlockBanner from './BlockBanner.vue'
import BlockIntro from './BlockIntro.vue'
import BlockNews from './BlockNews.vue'
import BlockGeneric from './BlockGeneric.vue'

defineProps({
  blocks: { type: Array, default: () => [] },
})

// block.type → 對應元件
const BLOCK_COMPONENTS = {
  banner: BlockBanner,
  intro: BlockIntro,
  news: BlockNews,
  push: BlockGeneric,
  other_ad: BlockGeneric,
}

function blockComponent(type) {
  return BLOCK_COMPONENTS[type] || null
}
</script>

<template>
  <template v-for="(block, i) in blocks" :key="i">
    <component
      :is="blockComponent(block.type)"
      v-if="blockComponent(block.type)"
      :title="block.title"
      :rows="block.item?.rows || []"
    />
  </template>
</template>
