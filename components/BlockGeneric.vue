<script setup>
// 通用卡片 block — push（推薦）、other_ad（廣告）共用
defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <section v-if="rows.length" class="section">
    <div class="container">
      <div v-if="title" class="section-title">
        <h2 class="section-title__main">{{ title }}</h2>
      </div>
      <div class="grid" :class="rows.length >= 3 ? 'grid--3' : 'grid--2'">
        <component
          :is="card.url ? 'NuxtLink' : 'div'"
          v-for="(card, i) in rows"
          :key="i"
          :to="card.url || undefined"
          class="g-card"
        >
          <div v-if="card.image" class="g-card__img">
            <img :src="card.image" :alt="card.title" loading="lazy" />
          </div>
          <div class="g-card__body">
            <h3 class="g-card__title">{{ card.title }}</h3>
            <p v-if="card.text" class="g-card__text">{{ card.text }}</p>
          </div>
        </component>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.g-card {
  display: block;
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
    }
  }

  &__body {
    padding: 20px;
  }

  &__title {
    font-size: 18px;
  }

  &__text {
    margin-top: 8px;
    font-size: 14px;
    color: var(--color-text-muted);
  }
}
</style>
