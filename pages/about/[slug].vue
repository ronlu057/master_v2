<script setup>
// 關於我們 / 一般內容頁（白皮書 §9.3 /about/detail）
const route = useRoute()

const { data: page } = await useApiData('/about/detail', {
  key: 'about-detail',
  query: { url: computed(() => route.params.slug) },
  default: () => null,
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到頁面', fatal: true })
}

applySeo(page.value.seo)

onMounted(() => {
  // 頁面瀏覽數 +1（白皮書 §9.3）
  $api('/about/view', { method: 'POST', body: { url: route.params.slug } }).catch(() => {})
})
</script>

<template>
  <div v-if="page">
    <PageBanner page="about" :title="page.title" />

    <div class="container content-page">
      <nav class="breadcrumb">
        <NuxtLink to="/">首頁</NuxtLink>
        <span>/</span>
        <span>{{ page.title }}</span>
      </nav>

      <div class="content-page__body" v-html="page.content" />
      <div v-if="page.content2" class="content-page__body" v-html="page.content2" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-page {
  max-width: fluid(860);
  padding-bottom: fluid(64);

  &__body {
    line-height: 1.9;

    :deep(h3) {
      margin: fluid(24) 0 fluid(12);
    }
    :deep(p) {
      margin-bottom: fluid(14);
    }
  }
}
</style>
