<script setup>
// Banner 輪播「上一則 / 下一則」按鈕 — 全 Banner 版型共用。
// icon 形狀 / 線條·實心 由後台 bannerNavIcon 控制；大小·圓角走 CSS 變數（app.vue 注入）。
// 各版型在 position:relative 的 banner 容器內放 <BannerNavBtn dir="prev" /> <BannerNavBtn dir="next" />，
// 並把主 Swiper 的 :navigation 指向 .banner_nav_prev / .banner_nav_next 即可。
const props = defineProps({
  dir: { type: String, default: 'next' }, // 'prev' | 'next'
})
const { state } = useEffectiveSettings()
const svg = computed(() => {
  const sel = state.bannerNavIcon || {}
  return headerIconSvg(sel.name || 'chevron', sel.style || 'line', 'currentColor')
})
</script>

<template>
  <button
    type="button"
    class="banner_nav"
    :class="dir === 'prev' ? 'banner_nav_prev banner_nav--prev' : 'banner_nav_next'"
    :aria-label="dir === 'prev' ? '上一則' : '下一則'"
    v-html="svg"
  ></button>
</template>
