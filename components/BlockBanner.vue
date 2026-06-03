<script setup>
// 首頁 Banner block 派發器 — 依 NUXT_PUBLIC_BLOCK_BANNER 選用 components/banners/ 內的版型
// NUXT_PUBLIC_BLOCK_BANNER 的值 = 版型「檔名」（不含 .vue），例如 BlockBanner01
// 新增版型：在 banners/ 放一個 BlockBannerXX.vue 即可，本檔不需修改
// 設定來源：useEffectiveSettings（initial = runtimeConfig.public，可被 /admin 預覽覆寫）
defineOptions({ inheritAttrs: false })

const variants = import.meta.glob('./banners/BlockBanner*.vue', { eager: true })
const { state } = useEffectiveSettings()

// 依設定挑版型（reactive，state.blockBanner 變動 → 自動切換）；找不到時 fallback 第一個
const current = computed(
  () =>
    variants[`./banners/${state.blockBanner}.vue`]?.default ||
    Object.values(variants)[0]?.default,
)
</script>

<template>
  <component :is="current" v-bind="$attrs" />
</template>
