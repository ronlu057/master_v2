<script setup>
// 新聞 block — 對應白皮書 §3.5 news_block
defineProps({
  title: { type: String, default: '最新消息' },
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <section v-if="rows.length" class="section section--surface">
    <div class="container">
      <div class="section-title">
        <h2 class="section-title__main">{{ title }}</h2>
      </div>
      <div class="grid grid--3">
        <NewsCard v-for="item in rows" :key="item.id" :item="item" />
      </div>
      <div class="block-news__more">
        <NuxtLink to="/news" class="btn btn--outline">看更多消息</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.block-news__more {
  text-align: center;
  margin-top: fluid(36);
}
</style>
