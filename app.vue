<script setup>
// 依專案類型在 <html> 標上 data-project，驅動 CSS 變數主題切換
const { type } = useProject()

// 站台設定 — LOGO 高度走 CSS variable、自訂 CSS 注入 <head>
const { state: siteState } = useEffectiveSettings()

// 動態組成 <style> 內容：(1) :root CSS variable 給 SiteLogo 用 (2) 後台自訂 CSS
const siteStyleContent = computed(() => {
  const cssVars = `:root { --site-logo-h: ${siteState.logoMaxHeight || 66}px; }`
  // 後台指定的 Header 背景色 → 強制蓋過所有版型在所有狀態（含 .scroll / 內頁）的背景。
  // 空字串＝不注入，交還給版型自身設計。值可為 'transparent' / 色碼 / rgba()。
  // 連 backdrop-filter 一起關掉，確保「透明」是真的透明（不會殘留毛玻璃模糊）。
  const bg = (siteState.headerBgColor || '').trim()
  const headerBg = bg
    ? `:root { --header-bg-color: ${bg}; }
.app-header header { background: var(--header-bg-color) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`
    : ''
  const customCss = siteState.customCss || ''
  return `${cssVars}\n${headerBg}\n${customCss}`
})

// i18n（useI18n / useLocaleHead 必須在 setup 頂層呼叫，不能進 computed / function 內）
const { locales } = useI18n()
const head = useLocaleHead()

// 依目前路由在 <body> 標上 data-page，供 CSS 針對特定頁面切換樣式
// 規則：
//   '/'                       → 'index'
//   '/news'、'/news/xxx'       → 'news'
//   '/en/about/company-intro' → 'about'（跳過語系前綴）
// 用法（任何 .vue 的 <style>）：body[data-page="index"] .xxx { ... }
const route = useRoute()
const localeCodes = computed(() => locales.value.map((l) => l.code))
const dataPage = computed(() => {
  if (route.path === '/') return 'index'
  const segments = route.path.split('/').filter(Boolean)
  const firstNonLocale = segments.find((s) => !localeCodes.value.includes(s))
  return firstNonLocale || 'index'
})

// type 為 ComputedRef，用 callback 形式讓 useHead 在 type 變動時 reactive 更新
useHead({
  htmlAttrs: () => ({
    'data-project': type.value,
    ...head.value.htmlAttrs,
  }),
  bodyAttrs: { 'data-page': dataPage },
  link: () => head.value.link,
  meta: () => head.value.meta,
  // 全域 <style> 注入：CSS 變數（logo 高度等）+ 後台自訂 CSS
  style: () => [
    {
      id: 'site-runtime-style',
      innerHTML: siteStyleContent.value,
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
