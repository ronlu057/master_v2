<script setup>
// 圖文介紹 block — 圖片 + 文字左右排版
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
})
const row = computed(() => props.rows[0] || {})
</script>

<template>
  <section v-if="rows.length" class="section">
    <div class="container intro">
      <div class="intro__media">
        <img :src="row.image" :alt="row.title" loading="lazy" />
      </div>
      <div class="intro__body">
        <p v-if="title" class="intro__eyebrow">{{ title }}</p>
        <h2 class="intro__title">{{ row.title }}</h2>
        <p class="intro__text">{{ row.text }}</p>
        <NuxtLink v-if="row.url" :to="row.url" class="btn btn--primary">了解更多</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: fluid(56);
  align-items: center;

  &__media img {
    width: 100%;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }

  &__eyebrow {
    color: var(--color-primary);
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: fluid(8);
  }

  &__title {
    font-size: fluid(32);
    margin-bottom: fluid(16);
  }

  &__text {
    color: var(--color-text-muted);
    margin-bottom: fluid(24);
  }
}

@include rwd-768 {
  .intro {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .intro__title {
    font-size: 24px;
  }
}
</style>
