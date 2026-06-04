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
   高度由 CSS 變數 --site-logo-h 控制（app.vue 注入），預設 fallback 66px */
.site-logo {
  display: block;
  height: var(--site-logo-h, 66px);
  width: auto;
  max-width: 100%;
}
</style>
