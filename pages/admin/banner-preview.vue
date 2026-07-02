<script setup>
// /admin/banner-preview — 只渲染首頁 BlockBanner 派發器的獨立頁，
// 給 /admin/banner 的「即時預覽」用 <iframe> 嵌入：
//   iframe 寬＝所選裝置 viewport 寬 → banner 的 RWD 斷點（三段圖 <picture>、fluid、@media）
//   都走該裝置的實際寬度，再由外層 transform 等比縮放塞進預覽框。
// 內容 / 設定即時同步：本頁與站台共用 useEffectiveSettings + useBannerPreview，admin 改設定 /
//   編輯內容寫 localStorage → 本頁（另一瀏覽情境）由 admin-preview.client.js 的 storage 監聽即時更新。
import BlockBanner from '~/components/BlockBanner.vue'

definePageMeta({ layout: false })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })
</script>

<template>
  <div class="banner-preview-page">
    <BlockBanner />
  </div>
</template>

<style lang="scss" scoped>
.banner-preview-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}
</style>
