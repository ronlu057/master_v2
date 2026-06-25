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
  // 捲動後（header 加 .scroll）的背景色覆寫；空＝沿用未捲動的 headerBg。
  // 目標是「帶 .scroll 的 header 本人」→ 用 header.scroll（權重高於上面 header，且只有捲動後才有）。
  const bgScroll = (siteState.headerBgColorScroll || '').trim()
  const headerBgScroll = bgScroll
    ? `.app-header header.scroll { background: ${bgScroll} !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`
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
    '.app-header .hsub .hsub',
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
    '.app-header .hsub__link',
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
    '.app-header .hsub__link:hover',
    '.app-header .hsub__link:focus',
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

  // ── 捲動後（header 加 .scroll）的選單顏色覆寫 ───────────────────────
  // 把上面同一組選擇器前面插入 .scroll（權重更高、且只有捲動後才有 .scroll）→ 捲動後套這組色。
  // 每個欄位空＝沿用未捲動那組顏色（不額外注入）。
  const scrollify = (selList) =>
    selList
      .split(',')
      .map((s) => s.trim().replace(/^\.app-header /, '.app-header .scroll '))
      .join(', ')
  const sTop = scrollify(top)
  const sDropBoxSel = scrollify(dropBoxSel)
  const sSub = scrollify(sub)
  const sSubHover = scrollify(subHover)
  const sNavIcon = scrollify(navIcon)
  const sMenuColor = (siteState.headerMenuColorScroll || '').trim()
  const sMenuHover = (siteState.headerMenuHoverColorScroll || '').trim()
  const sDropColor = (siteState.headerDropdownColorScroll || '').trim()
  const sDropHover = (siteState.headerDropdownHoverColorScroll || '').trim()
  const sDropBg = (siteState.headerDropdownBgScroll || '').trim()
  const sDropItemBg = (siteState.headerDropdownItemBgScroll || '').trim()
  const sDropItemHoverBg = (siteState.headerDropdownItemHoverBgScroll || '').trim()
  const sDropBorderColor = (siteState.headerDropdownBorderColorScroll || '').trim()
  const sDropItemBorderColor = (siteState.headerDropdownItemBorderColorScroll || '').trim()
  const sIconColor = (siteState.headerIconColorScroll || '').trim()
  const sIconHover = (siteState.headerIconHoverColorScroll || '').trim()
  const sIconBg = (siteState.headerIconBgScroll || '').trim()
  const sIconHoverBg = (siteState.headerIconHoverBgScroll || '').trim()
  const scrollMenuCss = [
    sMenuColor && `${sTop} { color: ${sMenuColor} !important; }`,
    sMenuHover &&
      `${sTop}:hover, ${sTop}:focus, ${sTop}:focus-within, ${sTop}.router-link-active { color: ${sMenuHover} !important; }`,
    sDropBg && `${sDropBoxSel} { background: ${sDropBg} !important; }`,
    sDropItemBg && `${sSub} { background: ${sDropItemBg} !important; }`,
    sDropColor && `${sSub} { color: ${sDropColor} !important; }`,
    sDropHover && `${sSubHover} { color: ${sDropHover} !important; }`,
    sDropItemHoverBg && `${sSubHover} { background: ${sDropItemHoverBg} !important; }`,
    sIconColor &&
      `.app-header .scroll .navtool .icon, .app-header .scroll .navtool .navtool_text { color: ${sIconColor} !important; }`,
    sIconHover &&
      `.app-header .scroll .navtool :hover > .icon, .app-header .scroll .navtool .icon:hover, .app-header .scroll .navtool :hover > .navtool_text { color: ${sIconHover} !important; }`,
    sIconBg &&
      `${sNavIcon} { background: ${sIconBg} !important; padding: 0.45em !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }`,
    sIconHoverBg && `${sNavIcon}:hover, ${sNavIcon}:focus-within { background: ${sIconHoverBg} !important; }`,
    sDropBorderColor &&
      `${sDropBoxSel} { border-color: ${sDropBorderColor} !important; border-style: solid !important; }`,
    sDropItemBorderColor &&
      `${sSub} { border-color: ${sDropItemBorderColor} !important; border-style: solid !important; }`,
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

  // 子選單展開箭頭（.hsub__arrow，絕對定位）：靠左/靠右 + 與邊緣距離（px）+ 對應文字對齊
  //   靠左 → 文字置中（左右補 padding 讓置中文字不壓到 icon）；靠右 → 文字靠左
  const subIconPos = siteState.headerSubmenuIconPos === 'left' ? 'left' : 'right'
  const subIconOffNum = Number(siteState.headerSubmenuIconOffset)
  const subOff = Number.isFinite(subIconOffNum) ? subIconOffNum : 8
  const subClear = subOff + 32 // 為 icon（約 28px）+ 邊距預留，避免文字壓到 icon
  const subIconCss =
    subIconPos === 'left'
      ? `.app-header .hsub__arrow { left: ${subOff}px; right: auto; }
.app-header .hsub__link--has { text-align: center; padding-left: ${subClear}px; padding-right: ${subClear}px; }`
      : `.app-header .hsub__arrow { right: ${subOff}px; left: auto; }
.app-header .hsub__link--has { text-align: left; padding-right: ${subClear}px; }`

  // flyout 模式：第三層浮層定位在第二層面板「外側」，但下拉圓角設定會給面板 overflow:hidden
  // 而把浮層裁掉 → 在 flyout 時把第二層面板的 overflow 還原為 visible（讓浮層能露出）。
  const flyoutOverflowCss =
    (siteState.headerSubmenuStyle || 'flyout') === 'flyout'
      ? '.app-header--sub-flyout nav [class*="__sub"] { overflow: visible !important; }'
      : ''

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

  // Banner 輪播箭頭按鈕：大小 / 圓角 → :root 變數（main.scss .banner_nav 以 var() 讀取，免 !important）
  const navSize = String(siteState.bannerNavSize ?? '').trim()
  const navRadius = String(siteState.bannerNavRadius ?? '').trim()
  const navColor = (siteState.bannerNavColor || '').trim()
  const navBg = (siteState.bannerNavBg || '').trim()
  const navIconSize = String(siteState.bannerNavIconSize ?? '').trim()
  const navGap = String(siteState.bannerNavGap ?? '').trim()
  // 輪播圓點：寬·高 / 選中寬·高 / 框線寬度 / 預設·選中背景 / 框線色
  const dotW = String(siteState.bannerDotW ?? '').trim()
  const dotH = String(siteState.bannerDotH ?? '').trim()
  const dotActiveW = String(siteState.bannerDotActiveW ?? '').trim()
  const dotActiveH = String(siteState.bannerDotActiveH ?? '').trim()
  const dotBw = String(siteState.bannerDotBorderWidth ?? '').trim()
  const dotBg = (siteState.bannerDotBg || '').trim()
  const dotActiveBg = (siteState.bannerDotActiveBg || '').trim()
  const dotBc = (siteState.bannerDotBorderColor || '').trim()
  const navVars = [
    navSize !== '' && `--banner-nav-size: ${navSize}px;`,
    navRadius !== '' && `--banner-nav-radius: ${navRadius}px;`,
    navColor && `--banner-nav-color: ${navColor};`,
    navBg && `--banner-nav-bg: ${navBg};`,
    navIconSize !== '' && `--banner-nav-icon-size: ${navIconSize}%;`,
    navGap !== '' && `--banner-nav-gap: ${navGap}px;`,
    dotW !== '' && `--banner-dot-w: ${dotW}px;`,
    dotH !== '' && `--banner-dot-h: ${dotH}px;`,
    dotActiveW !== '' && `--banner-dot-active-w: ${dotActiveW}px;`,
    dotActiveH !== '' && `--banner-dot-active-h: ${dotActiveH}px;`,
    dotBw !== '' && `--banner-dot-bw: ${dotBw}px;`,
    dotBg && `--banner-dot-bg: ${dotBg};`,
    dotActiveBg && `--banner-dot-active-bg: ${dotActiveBg};`,
    dotBc && `--banner-dot-bc: ${dotBc};`,
  ]
    .filter(Boolean)
    .join(' ')
  // 圓點開關：關閉 → 隱藏整條 pagination（全 BlockBanner 共用）
  const dotsHideCss =
    siteState.bannerDots === false ? '.block-banner .swiper-pagination { display: none; }' : ''
  const navCss = (navVars ? `:root { ${navVars} }` : '') + (dotsHideCss ? `\n${dotsHideCss}` : '')

  const customCss = siteState.customCss || ''
  return `${cssVars}\n${headerBg}\n${headerBgScroll}\n${menuCss}\n${scrollMenuCss}\n${iconCss}\n${subIconCss}\n${flyoutOverflowCss}\n${bannerCss}\n${navCss}\n${customCss}`
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
  // i18n link + CJK 各語系字型（SC/JP/KR）。放這裡（而非 nuxt.config）→ HMR 即時生效、免重啟 dev server。
  // TC / Poppins / Roboto 等仍由 nuxt.config 的 link 載入；此處只補簡中/日/韓三個 Noto，避免重複。
  link: () => [
    ...head.value.link,
    {
      rel: 'stylesheet',
      key: 'cjk-fonts',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@100;200;300;400;500;600;700;800;900&display=swap',
    },
  ],
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
