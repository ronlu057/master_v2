<script setup>
// 內頁 Banner — 版型 01（純背景 + 標題 + 副標題）
// 對應白皮書 §9.2 /banner/page，找不到自動 fallback common
const props = defineProps({
  page: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const { data: banners } = await useApiData('/banner/page', {
  key: `page-banner:${props.page}`,
  query: { page: props.page },
  default: () => [],
})

const bg = computed(() => banners.value?.[0]?.image?.pc || '')
</script>

<template>
  <section class="page-banner" :class="{ 'page-banner--plain': !bg }">
    <img v-if="bg" :src="bg" :alt="title" class="page-banner__bg" />
    <div class="page-banner__overlay">
      <div class="container">
        <h1 class="page-banner__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-banner__sub">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.page-banner {
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: center;

  &--plain {
    background: var(--color-accent);
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__overlay {
    position: relative;
    width: 100%;
    padding: 60px 0;
    background: rgba(0, 0, 0, 0.4);
  }

  &__title {
    color: #fff;
    font-size: 36px;
  }

  &__sub {
    color: rgba(255, 255, 255, 0.85);
    margin-top: 8px;
  }
}

@media (max-width: 560px) {
  .page-banner {
    min-height: 180px;
  }
  .page-banner__title {
    font-size: 26px;
  }
}
</style>
