<script setup>
// 新聞詳細頁（白皮書 §5.4）
const route = useRoute()

const { data: article } = await useApiData('/news/detail', {
  key: 'news-detail',
  query: { url: computed(() => route.params.slug) },
  default: () => null,
})

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到文章', fatal: true })
}

applySeo(article.value.seo)

onMounted(() => {
  // 瀏覽數 +1（白皮書 §5.5：session 30 分鐘防灌）
  $api('/news/view', { method: 'POST', body: { id: article.value.id } }).catch(() => {})
})
</script>

<template>
  <article v-if="article">
    <PageBanner page="news" :title="article.title" :subtitle="`${article.date} ${article.weekday}`" />

    <div class="container art">
      <nav class="breadcrumb">
        <NuxtLink to="/">首頁</NuxtLink>
        <span>/</span>
        <NuxtLink to="/news">最新消息</NuxtLink>
        <span>/</span>
        <span>{{ article.title }}</span>
      </nav>

      <div class="art__meta">
        <span class="art__date">{{ article.date }} · {{ article.weekday }}</span>
        <span v-for="c in article.category_blinks" :key="c" class="art__tag">#{{ c }}</span>
      </div>

      <div class="art__content" v-html="article.content" />

      <div v-if="article.news_multi_photo?.length" class="art__photos">
        <figure v-for="(photo, i) in article.news_multi_photo" :key="i">
          <img :src="photo.url" :alt="photo.title" loading="lazy" />
          <figcaption v-if="photo.title">{{ photo.title }}</figcaption>
        </figure>
      </div>

      <div class="art__foot">
        <NuxtLink to="/news" class="btn btn--outline">← 回消息列表</NuxtLink>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.art {
  max-width: fluid(820);
  padding-bottom: fluid(64);

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: fluid(12);
    align-items: center;
    margin-bottom: fluid(24);
    color: var(--color-text-muted);
    font-size: fluid-fz(14);
  }

  &__tag {
    color: var(--color-primary);
  }

  &__content {
    line-height: 1.9;

    :deep(h3) {
      margin: fluid(24) 0 fluid(12);
    }
    :deep(p) {
      margin-bottom: fluid(14);
    }
  }

  &__photos {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: fluid(16);
    margin: fluid(32) 0;

    img {
      width: 100%;
      border-radius: var(--radius);
    }

    figcaption {
      margin-top: fluid(6);
      font-size: fluid-fz(13);
      color: var(--color-text-muted);
    }
  }

  &__foot {
    margin-top: fluid(32);
  }
}

@include rwd-480 {
  .art__photos {
    grid-template-columns: 1fr;
  }
}
</style>
