<script setup>
// 法規 / 政策頁（白皮書 §9.1 /firm/caption?unit=xxx）
const route = useRoute()

const CONTENT = {
  privacy: {
    title: '隱私權政策',
    body: '<p>本網站重視您的隱私權。以下說明本站如何蒐集、運用與保護您所提供的個人資料。</p><h3>資料蒐集</h3><p>當您填寫聯絡表單或訂閱電子報時，我們會蒐集您主動提供的姓名、聯絡方式等資訊。</p><h3>資料運用</h3><p>蒐集的資料僅用於回覆您的需求與提供服務，不會提供予第三方。</p>',
  },
  terms: {
    title: '服務條款',
    body: '<p>歡迎使用本網站。使用本站服務即表示您同意以下條款。</p><h3>智慧財產權</h3><p>本站所有內容、設計與程式碼之著作權均屬本公司所有。</p><h3>免責聲明</h3><p>本站資訊僅供參考，本公司保留隨時修改內容之權利。</p>',
  },
}

const page = computed(() => CONTENT[route.query.unit] || CONTENT.privacy)

useSeoMeta({ title: () => `${page.value.title} — 母版專案` })
</script>

<template>
  <div>
    <PageBanner page="firm" :title="page.title" />

    <div class="container content-page">
      <nav class="breadcrumb">
        <NuxtLink to="/">首頁</NuxtLink>
        <span>/</span>
        <span>{{ page.title }}</span>
      </nav>
      <div class="content-page__body" v-html="page.body" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-page {
  max-width: fluid(820);
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
