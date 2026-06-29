<script setup>
// 首頁 Banner block 派發器 — 依 NUXT_PUBLIC_BLOCK_BANNER 選用 components/banners/ 內的版型
// NUXT_PUBLIC_BLOCK_BANNER 的值 = 版型「檔名」（不含 .vue），例如 BlockBanner01
// 新增版型：在 banners/ 放一個 BlockBannerXX.vue 即可，本檔不需修改
// 設定來源：useEffectiveSettings（initial = runtimeConfig.public，可被 /admin 預覽覆寫）
//
// 資料一律取自「獨立 Banner API」/banner/home（rows + 背景影片 videoUrl/videoFile + 跑馬燈 news），
// 不再依賴 /home/view 聚合內嵌 banner 內容（白皮書 §8.2 / §12）。
defineOptions({ inheritAttrs: false })

const variants = import.meta.glob('./banners/BlockBanner*.vue', { eager: true })
const { state } = useEffectiveSettings()

// 依設定挑版型（reactive，state.blockBanner 變動 → 自動切換）；找不到時 fallback 第一個
const current = computed(
  () =>
    variants[`./banners/${state.blockBanner}.vue`]?.default ||
    Object.values(variants)[0]?.default,
)

// 首頁 banner 資料 — 獨立 Banner API
const { data: banner } = await useApiData('/banner/home', {
  key: 'banner-home',
  default: () => ({ rows: [], news: [], videoUrl: '', videoFile: '' }),
})

// 後台「即時預覽」覆寫：banner 後台編輯中 → 站台即時套用、免存檔/重整。
// preview 由 plugins/admin-preview.client.js 於 client 啟動時載入（共用 useState）；
// preview.value 是「某版型」解析後的內容 { rows, videoUrl, videoFile, news, _layout }。
// 只有當預覽的 _layout 與目前版型相符才套用，否則交還已存檔內容
// → 避免「在 A 版型編輯的影片/內容」跑到 B 版型上（跨版型外洩）。
const { preview: bannerPreview } = useBannerPreview()
const eff = computed(() =>
  bannerPreview.value && bannerPreview.value._layout === state.blockBanner
    ? bannerPreview.value
    : resolveBannerContent(banner.value || {}, state.blockBanner),
)

// 多語系文字解析：title/subtitle/memo 可為字串（舊資料）或多語系物件 { tw,en,jp,kr }。
// 依目前語系取值，缺則 fallback 預設語系 / tw / 第一個有值的。版型仍收到「字串」，免逐版型改。
const { locale } = useI18n()
const pickLang = (v) => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v[locale.value] || v[state.defaultLang] || v.tw || Object.values(v).find(Boolean) || ''
  }
  return v || ''
}
const resolvedRows = computed(() =>
  (eff.value.rows || []).map((r) => ({
    ...r,
    title: pickLang(r.title),
    titleSpan: pickLang(r.titleSpan), // BlockBanner03：主標大字前綴
    subtitle: pickLang(r.subtitle),
    memo: pickLang(r.memo),
    note: pickLang(r.note), // BlockBanner03：第四行備註（代理…）
  })),
)

// 每則自訂文字色 → 注入 <head> 的 <style>（用 row-index class 當 hook，不用行內 :style）。
// 各版型文字容器已掛 `js-banner-row-${i}` class，並以 color: var(--banner-*-color) 取值。
// 每則自訂文字色 → 寫進共用 state，由 app.vue 的 site-runtime-style 注入（useState 會序列化到
// payload，client 端比子元件 useHead 可靠；各版型文字容器掛 js-banner-row-${i}、以 var() 取值）。
const bannerRowColorCssState = useState('banner-row-color-css', () => '')
watch(
  () => eff.value?.rows,
  () => {
    bannerRowColorCssState.value = bannerRowColorCss(eff.value?.rows)
  },
  { immediate: true, deep: true },
)
onBeforeUnmount(() => {
  bannerRowColorCssState.value = ''
})
</script>

<template>
  <!-- display:contents 包一層當「輪播圓點」樣式的穩定掛點（.block-banner），不影響版型排版 -->
  <div class="block-banner">
    <component
      :is="current"
      v-bind="$attrs"
      :rows="resolvedRows"
      :video-url="eff.videoUrl || ''"
      :video-file="eff.videoFile || ''"
      :news="eff.news || []"
      :show-nav="state.bannerNav"
      :loop="state.bannerLoop"
      :autoplay="state.bannerAutoplay"
    />
  </div>
</template>

<style lang="scss" scoped>
.block-banner {
  display: contents; // 不產生盒子、不影響版型排版，只當圓點樣式掛點
}
</style>
