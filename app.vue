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
  const dropItemHoverBg = (siteState.headerDropdownItemHoverBg || '').trim()
  const dropColor = (siteState.headerDropdownColor || '').trim()
  const dropHover = (siteState.headerDropdownHoverColor || '').trim()
  // 工具列圖示色 / 滑過色（navtool icon 走 .icon mask，color 即換色）
  const iconColor = (siteState.headerIconColor || '').trim()
  const iconHover = (siteState.headerIconHoverColor || '').trim()
  // 工具列圖示「按鈕底」：背景色 / 滑過背景色 / 背景圓角（空＝無底，交還版型）
  const iconBg = (siteState.headerIconBg || '').trim()
  const iconHoverBg = (siteState.headerIconHoverBg || '').trim()
  const iconRadius = String(siteState.headerIconRadius ?? '').trim()
  // 跨 16 版型通用：每個 navtool 項目 wrapper 都帶行內 style="order: N"（來自 :style order），
  // 且只有它們有 → 用屬性選擇器精準命中，排除社群容器（社群連結各自有圓底樣式）。
  const navIcon = '.app-header .navtool [style^="order:"]:not(.navtool_social)'
  // 下拉圓角（容器 / 項目）：純數字 px（0＝直角），空＝交還版型預設
  const dropRadius = String(siteState.headerDropdownRadius ?? '').trim()
  const dropItemRadius = String(siteState.headerDropdownItemRadius ?? '').trim()
  // 工具列下拉（搜尋/語系浮層）專屬圓角：容器 / 項目；空＝沿用上面的下拉圓角
  const navDropRadius = String(siteState.headerNavtoolDropdownRadius ?? '').trim()
  const navDropItemRadius = String(siteState.headerNavtoolDropdownItemRadius ?? '').trim()
  // 工具列下拉「容器」/「項目」選擇器（dropBoxSel / sub 的 navtool 子集）
  const navDropBoxSel = [
    '.app-header .search_box',
    '.app-header .lang_box',
    '.app-header .lang_toggle ul',
    '.app-header .navtool ul',
    '.app-header [class*="lang-menu"]',
  ].join(', ')
  const navDropSubSel = [
    '.app-header .lang_item',
    '.app-header .lang_box a',
    '.app-header .lang_box button',
    '.app-header .lang_toggle ul a',
    '.app-header .navtool ul a',
    '.app-header [class*="lang-menu"] a',
    '.app-header [class*="lang-menu"] button',
    '.app-header .search_form input',
  ].join(', ')
  // 下拉「容器」內距 / 框線（套用 dropBoxSel）
  const dropPadY = String(siteState.headerDropdownPaddingY ?? '').trim()
  const dropPadX = String(siteState.headerDropdownPaddingX ?? '').trim()
  const dropBorderW = String(siteState.headerDropdownBorderWidth ?? '').trim()
  const dropBorderColor = (siteState.headerDropdownBorderColor || '').trim()
  // 下拉「項目」內距 / 框線（套用 sub）
  const dropItemPadY = String(siteState.headerDropdownItemPaddingY ?? '').trim()
  const dropItemPadX = String(siteState.headerDropdownItemPaddingX ?? '').trim()
  const dropItemBorderW = String(siteState.headerDropdownItemBorderWidth ?? '').trim()
  const dropItemBorderColor = (siteState.headerDropdownItemBorderColor || '').trim()
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
    dropItemHoverBg && `${subHover} { background: ${dropItemHoverBg} !important; }`,
    // 工具列圖示色：同時套用到 icon 與「顯示文字」span，避免文字維持版型預設色而看不見
    iconColor &&
      `.app-header .navtool .icon, .app-header .navtool .navtool_text { color: ${iconColor} !important; }`,
    iconHover &&
      `.app-header .navtool :hover > .icon, .app-header .navtool .icon:hover, .app-header .navtool :hover > .navtool_text { color: ${iconHover} !important; }`,
    // 工具列圖示「按鈕底」：有背景色才把 navtool_icon 變成置中的 chip（加 padding 讓底色有呼吸空間）
    iconBg &&
      `${navIcon} { background: ${iconBg} !important; padding: 0.45em !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }`,
    iconHoverBg && `${navIcon}:hover, ${navIcon}:focus-within { background: ${iconHoverBg} !important; }`,
    iconRadius !== '' && `${navIcon} { border-radius: ${iconRadius}px !important; }`,
    // 下拉容器圓角（含 overflow:hidden 讓項目底色不超出圓角）
    dropRadius !== '' &&
      `${dropBoxSel} { border-radius: ${dropRadius}px !important; overflow: hidden; }`,
    // 下拉項目圓角
    dropItemRadius !== '' && `${sub} { border-radius: ${dropItemRadius}px !important; }`,
    // 下拉「容器」內距（上下 / 左右）與框線（粗細 / 顏色）
    dropPadY !== '' &&
      `${dropBoxSel} { padding-top: ${dropPadY}px !important; padding-bottom: ${dropPadY}px !important; }`,
    dropPadX !== '' &&
      `${dropBoxSel} { padding-left: ${dropPadX}px !important; padding-right: ${dropPadX}px !important; }`,
    dropBorderW !== '' &&
      `${dropBoxSel} { border-style: solid !important; border-width: ${dropBorderW}px !important; }`,
    // 設了框線顏色但沒設粗細 → 自動補 solid 1px，確保顏色看得到（版型原本無框時也會顯示）
    dropBorderColor &&
      `${dropBoxSel} { border-color: ${dropBorderColor} !important; border-style: solid !important;${dropBorderW === '' ? ' border-width: 1px !important;' : ''} }`,
    // 下拉「項目」內距（上下 / 左右）與框線（粗細 / 顏色）
    dropItemPadY !== '' &&
      `${sub} { padding-top: ${dropItemPadY}px !important; padding-bottom: ${dropItemPadY}px !important; }`,
    dropItemPadX !== '' &&
      `${sub} { padding-left: ${dropItemPadX}px !important; padding-right: ${dropItemPadX}px !important; }`,
    dropItemBorderW !== '' &&
      `${sub} { border-style: solid !important; border-width: ${dropItemBorderW}px !important; }`,
    dropItemBorderColor &&
      `${sub} { border-color: ${dropItemBorderColor} !important; border-style: solid !important;${dropItemBorderW === '' ? ' border-width: 1px !important;' : ''} }`,
    // 工具列下拉專屬圓角（放在通用規則之後 → 對搜尋/語系浮層覆寫；空＝沿用上面通用值）
    navDropRadius !== '' &&
      `${navDropBoxSel} { border-radius: ${navDropRadius}px !important; overflow: hidden; }`,
    navDropItemRadius !== '' && `${navDropSubSel} { border-radius: ${navDropItemRadius}px !important; }`,
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

  // 後台指定的 Banner 文字色 → 注入 :root CSS 變數；BlockBanner 的標題/副標/說明文以 var() 讀取。
  // 留空＝不注入，元件以自身 SCSS 預設色當 fallback。走 CSS 變數故免 !important（符合製作規範 §3.1）。
  const bannerTitle = (siteState.bannerTitleColor || '').trim()
  const bannerSubtitle = (siteState.bannerSubtitleColor || '').trim()
  const bannerMemo = (siteState.bannerMemoColor || '').trim()
  const bannerVars = [
    bannerTitle && `--banner-title-color: ${bannerTitle};`,
    bannerSubtitle && `--banner-subtitle-color: ${bannerSubtitle};`,
    bannerMemo && `--banner-memo-color: ${bannerMemo};`,
  ]
    .filter(Boolean)
    .join(' ')
  const bannerCss = bannerVars ? `:root { ${bannerVars} }` : ''

  const customCss = siteState.customCss || ''
  return `${cssVars}\n${headerBg}\n${menuCss}\n${iconCss}\n${bannerCss}\n${customCss}`
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
