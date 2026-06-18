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

// 每則自訂文字色 → 注入 <head> 的 <style>（用 row-index class 當 hook，不用行內 :style）。
// 各版型文字容器已掛 `js-banner-row-${i}` class，並以 color: var(--banner-*-color) 取值。
useHead(() => {
  const css = bannerRowColorCss(banner.value?.rows)
  return css ? { style: [{ children: css }] } : {}
})
</script>

<template>
  <component
    :is="current"
    v-bind="$attrs"
    :rows="banner.rows || []"
    :video-url="banner.videoUrl || ''"
    :video-file="banner.videoFile || ''"
    :news="banner.news || []"
  />
</template>
