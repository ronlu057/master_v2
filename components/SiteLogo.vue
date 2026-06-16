<script setup>
// 共用站台 LOGO — img 不寫 inline style
// 高度走 CSS 變數 var(--site-logo-h)，由 app.vue 從 useEffectiveSettings 注入
// 想覆寫樣式可在 admin → Header 模組 → 自訂 CSS 內寫 `.site-logo { ... }`
defineProps({
  alt: { type: String, default: 'Logo' },
})

const { state } = useEffectiveSettings()
const DEFAULT_LOGO = '/img/logo/logo-AD.svg'
</script>

<template>
  <img :src="state.logo || DEFAULT_LOGO" :alt="alt" class="site-logo" />
</template>

<style lang="scss">
/* 注意：unscoped，讓使用者「自訂 CSS」也能命中 .site-logo
   高度跟 --header-h: fluid(72) 用同一套 fluid 縮放：
   --site-logo-h（app.vue 注入的純數字，預設 66）＝ 1920 設計高度，1024~2560 等比，
   讓 logo 在各螢幕都與 header / 文字保持相同比例（不再固定 66px）。
   width: auto 維持 logo 圖檔本身的長寬比、不變形。 */
.site-logo {
  --logo-h: var(--site-logo-h, 66);
  display: block;
  height: clamp(
    calc(var(--logo-h) / 1920 * 1024 * 1px),
    calc(var(--logo-h) / 19.2 * 1vw),
    calc(var(--logo-h) / 1920 * 2560 * 1px)
  );
  width: auto;
  max-width: 100%;
}
</style>
