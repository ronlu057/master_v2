<script setup>
// /admin/header-preview — 只渲染 AppHeader（疊在首頁 banner 底圖上）的獨立頁，
// 給 /admin/header 的「即時預覽」用 <iframe> 嵌入：
//   iframe 固定 1920px 寬 → 內部 viewport 是桌機寬，header 的 RWD 斷點走桌機版
//   （目錄、navtool 社群等不會因外層視窗窄而被收進漢堡 / 隱藏），再由外層 transform 縮放。
// 設定即時同步：本頁與站台共用 useEffectiveSettings + admin-preview / navtool storage 監聽，
//   admin 改設定寫 localStorage → 本頁（另一個瀏覽情境）收 storage event 即時更新。
import AppHeader from '~/components/AppHeader.vue'

definePageMeta({ layout: false })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

// ?dropdown=1 → 強制把下拉（搜尋框 / 語系清單 / 子選單）展開，方便在後台預覽看下拉樣式效果
const route = useRoute()
const forceDropdown = computed(() => route.query.dropdown === '1')

// 底圖：用目前版型的首頁 banner 第一張圖，讓 header 像疊在實際頁面內容上
// （banners.json 已改 byLayout 結構 → 用 resolveBannerContent 解析該版型內容）
const { state } = useEffectiveSettings()
const bg = ref('')
onMounted(async () => {
  try {
    const res = await $fetch('/_admin/mock?name=banners')
    const content = resolveBannerContent(res?.parsed?.home || {}, state.blockBanner, { fallbackFirst: true })
    const first = (content.rows || []).find((r) => r?.image?.pc)?.image?.pc
    if (first) bg.value = first
  } catch {}
})

const bgStyle = computed(() =>
  bg.value
    ? {
        backgroundImage: `linear-gradient(rgba(12,16,22,0.28), rgba(12,16,22,0.5)), url('${bg.value}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : null,
)
</script>

<template>
  <div class="header-preview-page" :class="{ 'force-dropdown': forceDropdown }">
    <AppHeader />
    <!-- 模擬首頁 banner：class 以 banner 開頭、滿版高，讓各 Header 的捲動偵測
         （querySelector('[class^="banner"]') 量 bannerH）在頂端正確判定為「未捲動」=透明，
         不會誤套捲動後（.scroll）的底色。 -->
    <div class="banner-stage index_banner" :style="bgStyle"></div>
  </div>
</template>

<style lang="scss" scoped>
.header-preview-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
}
.banner-stage {
  width: 100%;
  height: 100vh;
  // 無 banner 圖時的退回底（模擬頁面內容，讓透明 header + 白字仍可見）
  background: linear-gradient(120deg, #46587a 0%, #28324a 55%, #141a26 100%);
}

// 強制展開下拉（後台預覽「顯示下拉」用）— 跨版型涵蓋搜尋框 / 語系清單 / 子選單浮層。
// 多數版型用 opacity/visibility/transform 控顯隱，這裡一律打開（dev 預覽工具，故用 !important）。
.header-preview-page.force-dropdown {
  :deep(.search_box),
  :deep(.lang_box),
  :deep(.lang_toggle ul),
  :deep(.navtool ul),
  :deep([class*='lang-menu']),
  :deep(.navmenu__sub),
  :deep([class*='__sub']),
  :deep(.hsub .hsub) {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    pointer-events: auto !important;
  }
  // 第三層（.hsub 巢狀）：nested 模式靠 v-show（display:none）收合 → 強制 display 打開；
  // flyout 模式則靠上面的 opacity/visibility 露出（維持往右浮出的相對定位）。
  :deep(.hsub .hsub) {
    display: flex !important;
  }
}
</style>
