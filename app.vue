<script setup>
// 依專案類型在 <html> 標上 data-project，驅動 CSS 變數主題切換
const { type } = useProject()

// 站台設定 — LOGO 高度走 CSS variable、自訂 CSS 注入 <head>
const { state: siteState } = useEffectiveSettings()

// 動態組成 <style> 內容：(1) :root CSS variable 給 SiteLogo 用 (2) 後台自訂 CSS
const siteStyleContent = computed(() => {
  // 注入「純數字」當 logo 的 1920 設計高度（不含 px）；實際高度由 SiteLogo 套 fluid 縮放算出
  const cssVars = `:root { --site-logo-h: ${siteState.logoMaxHeight || 66}; }`
  // 後台指定的 Header 背景色 → 強制蓋過所有版型在所有狀態（含 .scroll / 內頁）的背景。
  // 空字串＝不注入，交還給版型自身設計。值可為 'transparent' / 色碼 / rgba()。
  // 連 backdrop-filter 一起關掉，確保「透明」是真的透明（不會殘留毛玻璃模糊）。
  const bg = (siteState.headerBgColor || '').trim()
  const headerBg = bg
    ? `:root { --header-bg-color: ${bg}; }
.app-header header { background: var(--header-bg-color) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`
    : ''

  // 後台指定的「選單」顏色 → 強制套到 .app-header nav 的連結與下拉子選單（空＝交還版型預設）。
  //   文字色 / 滑鼠滑過(含 focus / active) 色 / 下拉背景色，各自有值才注入。
  //   下拉容器跨版型用啟發式選擇器：BEM 子選單(__sub) 與巢狀 ul。
  const menuColor = (siteState.headerMenuColor || '').trim()
  const menuHover = (siteState.headerMenuHoverColor || '').trim()
  const menuFz = String(siteState.headerMenuFontSize ?? '').trim() // 主選單文字大小 px
  const dropBg = (siteState.headerDropdownBg || '').trim()
  const dropItemBg = (siteState.headerDropdownItemBg || '').trim()
  const dropColor = (siteState.headerDropdownColor || '').trim()
  const dropHover = (siteState.headerDropdownHoverColor || '').trim()
  // 工具列圖示色 / 滑過色（navtool icon 走 .icon mask，color 即換色）
  const iconColor = (siteState.headerIconColor || '').trim()
  const iconHover = (siteState.headerIconHoverColor || '').trim()
  // 下拉圓角（容器 / 項目）：純數字 px（0＝直角），空＝交還版型預設
  const dropRadius = String(siteState.headerDropdownRadius ?? '').trim()
  const dropItemRadius = String(siteState.headerDropdownItemRadius ?? '').trim()
  // 主選單連結（排除下拉子連結）— 讓「主選單文字色」與「下拉文字色」完全分開、互不影響
  const top = '.app-header nav a:not([class*="__sub"] a):not(ul ul a)'
  // 下拉「容器」：nav 子選單 + navtool 搜尋 / 語系 / ul 卡片浮層（涵蓋三種語系結構）
  const dropBoxSel = [
    '.app-header nav [class*="__sub"]',
    '.app-header nav ul ul',
    '.app-header .search_box',
    '.app-header .lang_box',
    '.app-header .lang_toggle ul',
    '.app-header .navtool ul',
    '.app-header [class*="lang-menu"]',
  ].join(', ')
  // 下拉「項目」：nav 子連結 + 各式語系項目（lang_item / lang_box / lang_toggle ul / lang-menu）+ navtool 下拉連結 + 搜尋輸入框
  const sub = [
    '.app-header nav [class*="__sub"] a',
    '.app-header nav ul ul a',
    '.app-header .lang_item',
    '.app-header .lang_box a',
    '.app-header .lang_box button',
    '.app-header .lang_toggle ul a',
    '.app-header .navtool ul a',
    '.app-header [class*="lang-menu"] a',
    '.app-header [class*="lang-menu"] button',
    '.app-header .search_form input',
  ].join(', ')
  // 下拉項目 hover / focus
  const subHover = [
    '.app-header nav [class*="__sub"] a:hover',
    '.app-header nav [class*="__sub"] a:focus',
    '.app-header nav ul ul a:hover',
    '.app-header nav ul ul a:focus',
    '.app-header .lang_item:hover',
    '.app-header .lang_item:focus',
    '.app-header .lang_box a:hover',
    '.app-header .lang_toggle ul a:hover',
    '.app-header .navtool ul a:hover',
    '.app-header [class*="lang-menu"] a:hover',
    '.app-header [class*="lang-menu"] button:hover',
  ].join(', ')
  const menuCss = [
    menuColor && `${top} { color: ${menuColor} !important; }`,
    menuHover &&
      `${top}:hover, ${top}:focus, ${top}:focus-within, ${top}.router-link-active { color: ${menuHover} !important; }`,
    menuFz !== '' && `${top} { font-size: ${menuFz}px !important; }`,
    dropBg && `${dropBoxSel} { background: ${dropBg} !important; }`,
    dropItemBg && `${sub} { background: ${dropItemBg} !important; }`,
    // 下拉文字色 / 滑過色：獨立選擇器，與主選單文字互不干涉（含搜尋 / 語系浮層）
    dropColor && `${sub} { color: ${dropColor} !important; }`,
    dropHover && `${subHover} { color: ${dropHover} !important; }`,
    iconColor && `.app-header .navtool .icon { color: ${iconColor} !important; }`,
    iconHover &&
      `.app-header .navtool :hover > .icon, .app-header .navtool .icon:hover { color: ${iconHover} !important; }`,
    // 下拉容器圓角（含 overflow:hidden 讓項目底色不超出圓角）
    dropRadius !== '' &&
      `${dropBoxSel} { border-radius: ${dropRadius}px !important; overflow: hidden; }`,
    // 下拉項目圓角
    dropItemRadius !== '' && `${sub} { border-radius: ${dropItemRadius}px !important; }`,
  ]
    .filter(Boolean)
    .join('\n')

  // navtool 換 icon：依後台選擇覆寫對應 .icon-XXX 的 mask-image（line / solid 即時切換）
  const icons = siteState.headerIcons || {}
  const iconCss = HEADER_ICON_SLOTS.map(({ slot, cls }) => {
    const sel = icons[slot]
    if (!sel || !sel.name) return ''
    const url = headerIconMaskUrl(sel.name, sel.style || 'line')
    return url
      ? `.app-header .${cls} { -webkit-mask-image: ${url} !important; mask-image: ${url} !important; }`
      : ''
  })
    .filter(Boolean)
    .join('\n')

  const customCss = siteState.customCss || ''
  return `${cssVars}\n${headerBg}\n${menuCss}\n${iconCss}\n${customCss}`
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
