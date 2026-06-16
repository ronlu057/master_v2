<script setup>
// 新聞卡片 — BlockNews 與新聞列表頁共用
defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <NuxtLink :to="item.url" class="news-card">
    <div class="news-card__img">
      <img :src="item.news_multi_photo?.[0]?.url" :alt="item.title" loading="lazy" />
    </div>
    <div class="news-card__body">
      <div class="news-card__meta">
        <span class="news-card__date">{{ item.date }}</span>
        <span v-if="item.weekday" class="news-card__week">{{ item.weekday }}</span>
      </div>
      <h3 class="news-card__title">{{ item.title }}</h3>
      <p class="news-card__summary">{{ item.summary }}</p>
      <div class="news-card__tags">
        <span v-for="c in item.category_blinks" :key="c">#{{ c }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.news-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition), box-shadow var(--transition);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &__img {
    aspect-ratio: 16 / 10;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition);
    }
  }

  &:hover &__img img {
    transform: scale(1.05);
  }

  &__body {
    padding: fluid(20);
  }

  &__meta {
    display: flex;
    gap: fluid(8);
    font-size: fluid-fz(13);
    color: var(--color-text-muted);
  }

  &__week {
    color: var(--color-primary);
    font-weight: 600;
  }

  &__title {
    font-size: fluid-fz(18);
    margin: fluid(8) 0;
  }

  &__summary {
    font-size: fluid-fz(14);
    color: var(--color-text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: fluid(8);
    margin-top: fluid(12);
    font-size: fluid-fz(12);
    color: var(--color-primary);
  }
}
</style>
