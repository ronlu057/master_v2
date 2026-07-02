// ── 即時設定（SSR JSON + localStorage 預覽覆寫） ─────────────
// 所有 dispatcher（AppHeader / PageBanner / BlockBanner）與其他需要熱換的
// 設定，都走這個 composable 拿值，**不要**直接讀 runtimeConfig.public。
//
// state 來源（優先順序）：
//   1. localStorage（個人預覽，client only）— admin UI 改下拉時即時寫
//   2. data/site-settings.json（專案 runtime 設定）— admin「提交」時寫回
//      由 plugins/site-settings.server.js 在 SSR 階段讀進 state（每次 request 都讀）
//   3. .env / runtimeConfig（build-time fallback）— site-settings.json 沒設的欄位 fallback
//
// 用 useState：SSR 期間建好的 state 序列化到 __NUXT__ payload，client 端從 payload
// 還原 → 第一次 client render 跟 SSR HTML 一致（避免 hydration mismatch）。

const PREVIEW_KEY = 'master_v2_preview'

export function useEffectiveSettings() {
  // SSR-safe state，跨 SSR-client 透過 payload 自動同步
  const state = useState('effective-settings', () => {
    const pub = useRuntimeConfig().public
    return reactive({
      projectType: pub.projectType || 'module',
      header: pub.header || 'Header01',
      pageBanner: pub.pageBanner || 'PageBanner01',
      blockBanner: pub.blockBanner || 'BlockBanner01',
      apiBase: pub.apiBase || '',
      defaultLang: pub.defaultLang || 'tw',
      enableShop: !!pub.enableShop && String(pub.enableShop).toLowerCase() === 'true',
      // LOGO 圖片：空字串 → fallback 到預設 /img/logo/logo-AD.svg
      logo: pub.logo || '',
      // LOGO 最大高度（寬度自動）
      logoMaxHeight: Number(pub.logoMaxHeight) || 66,
      // 後台自訂 CSS — 全域注入到 <head>，可覆寫 .site-logo / 各 .headerXX 等
      customCss: pub.customCss || '',
      // Header 背景色（全站共用）：''＝用版型自身預設、'transparent'＝透明、其餘＝色碼/rgba。
      // 由 app.vue 注入 !important 規則，強制套用到所有狀態（含捲動後 / 內頁）
      headerBgColor: pub.headerBgColor || '',
      // 捲動後（.scroll）Header 背景色覆寫；''＝沿用未捲動 headerBgColor、'transparent'＝透明、其餘＝色碼
      headerBgColorScroll: pub.headerBgColorScroll || '',
      // 選單（menu）顏色（全站共用，空＝交還版型預設）：文字色 / 滑鼠滑過色 / 下拉背景色
      // 由 app.vue 注入 !important 規則，套用到 .app-header nav 連結與下拉子選單
      headerMenuColor: pub.headerMenuColor || '',
      headerMenuHoverColor: pub.headerMenuHoverColor || '',
      headerDropdownBg: pub.headerDropdownBg || '', // 下拉「容器」背景
      headerDropdownItemBg: pub.headerDropdownItemBg || '', // 下拉「單項」背景
      headerDropdownItemHoverBg: pub.headerDropdownItemHoverBg || '', // 下拉「單項」滑鼠滑過背景
      headerDropdownColor: pub.headerDropdownColor || '', // 下拉「文字」色（與主選單文字分開）
      headerDropdownHoverColor: pub.headerDropdownHoverColor || '', // 下拉文字「滑鼠滑過」色
      headerIconColor: pub.headerIconColor || '', // 工具列圖示色（搜尋/語系/社群/會員/購物車…）
      headerIconHoverColor: pub.headerIconHoverColor || '', // 工具列圖示滑過色
      headerIconBg: pub.headerIconBg || '', // 工具列圖示「背景色」（做成按鈕底；空＝無底）
      headerIconHoverBg: pub.headerIconHoverBg || '', // 工具列圖示「滑過背景色」
      headerIconRadius: pub.headerIconRadius ?? '', // 工具列圖示背景圓角 px（0＝直角，''＝無）
      headerDropdownRadius: pub.headerDropdownRadius ?? '', // 下拉「容器」圓角 px（0＝直角，''＝版型預設）
      headerDropdownItemRadius: pub.headerDropdownItemRadius ?? '', // 下拉「項目」圓角 px
      headerNavtoolDropdownRadius: pub.headerNavtoolDropdownRadius ?? '', // 工具列下拉（搜尋/語系浮層）容器圓角 px；''＝沿用下拉容器圓角
      headerNavtoolDropdownItemRadius: pub.headerNavtoolDropdownItemRadius ?? '', // 工具列下拉「項目」圓角 px；''＝沿用下拉項目圓角
      headerDropdownPaddingY: pub.headerDropdownPaddingY ?? '', // 下拉容器內距（上下）px
      headerDropdownPaddingX: pub.headerDropdownPaddingX ?? '', // 下拉容器內距（左右）px
      headerDropdownBorderWidth: pub.headerDropdownBorderWidth ?? '', // 下拉容器框線粗細 px（0＝無框）
      headerDropdownBorderColor: pub.headerDropdownBorderColor || '', // 下拉容器框線顏色
      headerDropdownItemPaddingY: pub.headerDropdownItemPaddingY ?? '', // 下拉單項內距（上下）px
      headerDropdownItemPaddingX: pub.headerDropdownItemPaddingX ?? '', // 下拉單項內距（左右）px
      headerDropdownItemBorderWidth: pub.headerDropdownItemBorderWidth ?? '', // 下拉單項框線粗細 px
      headerDropdownItemBorderColor: pub.headerDropdownItemBorderColor || '', // 下拉單項框線顏色
      // ── 捲動後（header 加上 .scroll）的選單顏色覆寫；空＝沿用上面那組（未捲動）顏色 ──
      // 由 app.vue 注入「.app-header .scroll …」較高權重規則，只在捲動後套用（給 Header09/02 等捲動變色版型）
      headerMenuColorScroll: pub.headerMenuColorScroll || '',
      headerMenuHoverColorScroll: pub.headerMenuHoverColorScroll || '',
      headerDropdownColorScroll: pub.headerDropdownColorScroll || '',
      headerDropdownHoverColorScroll: pub.headerDropdownHoverColorScroll || '',
      headerDropdownBgScroll: pub.headerDropdownBgScroll || '',
      headerDropdownItemBgScroll: pub.headerDropdownItemBgScroll || '',
      headerDropdownItemHoverBgScroll: pub.headerDropdownItemHoverBgScroll || '',
      headerDropdownBorderColorScroll: pub.headerDropdownBorderColorScroll || '',
      headerDropdownItemBorderColorScroll: pub.headerDropdownItemBorderColorScroll || '',
      headerIconColorScroll: pub.headerIconColorScroll || '',
      headerIconHoverColorScroll: pub.headerIconHoverColorScroll || '',
      headerIconBgScroll: pub.headerIconBgScroll || '',
      headerIconHoverBgScroll: pub.headerIconHoverBgScroll || '',
      // navtool 各 slot 換 icon：{ [slot]: { name, style:'line'|'solid' } }；空＝用 icons.scss 預設 SVG
      headerIcons: {},
      // 桌機第三層子選單呈現方式：'flyout'＝滑到第二層往右飛出、'nested'＝同框內向右縮排展開
      headerSubmenuStyle: pub.headerSubmenuStyle || 'flyout',
      // 「有子選單可展開」的指示 icon { name, style:'line'|'solid' }；空＝預設 chevron 線條
      // 桌機：第二層若有第三層 → 該項目顯示此 icon；手機：有子層的項目右側顯示此 icon（可點展開）
      headerSubmenuIcon: {},
      // 展開 icon 位置（絕對定位）：'left'＝靠左、文字置中；'right'＝靠右、文字靠左
      headerSubmenuIconPos: pub.headerSubmenuIconPos || 'right',
      // 展開 icon 與該側邊緣的距離（px）
      headerSubmenuIconOffset: pub.headerSubmenuIconOffset ?? 8,
      // 主選單文字大小（px，全站共用，''＝版型預設）
      headerMenuFontSize: pub.headerMenuFontSize ?? '',
      // Banner 文字色（全站共用，空＝交還版型預設）：標題 / 副標 / 說明文
      // 由 app.vue 注入 :root --banner-*-color，BlockBanner 以 var() 讀取（免 !important）
      bannerTitleColor: pub.bannerTitleColor || '',
      bannerSubtitleColor: pub.bannerSubtitleColor || '',
      bannerMemoColor: pub.bannerMemoColor || '',
      // 主色色塊／強調色（如 BlockBanner06 的斜切色塊）；空＝版型預設
      bannerAccentColor: pub.bannerAccentColor || '',
      // 第二強調色（如 BlockBanner08 右側三角色塊，與左側梯形各自換色）；空＝版型預設
      bannerAccentColor2: pub.bannerAccentColor2 || '',
      // BlockBanner21 游標圓反白：圓半徑（設計稿 px，預設 96）
      bannerCircleSize: Number(pub.bannerCircleSize) || 96,
      // BlockBanner15 影片圓鈕：五部位獨立色 + 旋轉文字（空＝版型預設）
      bannerVideoOuterColor: pub.bannerVideoOuterColor || '',
      bannerVideoInnerColor: pub.bannerVideoInnerColor || '',
      bannerVideoTextColor: pub.bannerVideoTextColor || '',
      bannerVideoBgColor: pub.bannerVideoBgColor || '',
      bannerVideoTriColor: pub.bannerVideoTriColor || '',
      bannerVideoText: pub.bannerVideoText || '',
      // 左上文字區背景圖（如 BlockBanner07）；整個版型一張、空＝版型預設底色
      bannerTopImage: pub.bannerTopImage || '',
      // BlockBanner16：固定背景大圖 + 3 張浮層小圖（版型層級一組，只換圖不分則；空＝不顯示）
      bannerBgImage: pub.bannerBgImage || '',
      bannerBgImagePad: pub.bannerBgImagePad || '',
      bannerBgImageMb: pub.bannerBgImageMb || '',
      bannerDeco1: pub.bannerDeco1 || '',
      bannerDeco2: pub.bannerDeco2 || '',
      bannerDeco3: pub.bannerDeco3 || '',
      // Banner 輪播「上一則 / 下一則」按鈕開關（全站共用，預設顯示）
      bannerNav: pub.bannerNav === undefined ? true : String(pub.bannerNav) !== 'false',
      // 箭頭 icon { name, style:'line'|'solid' }（空＝預設 chevron 線條）/ 按鈕大小 px / 圓角 px（999＝圓形）
      bannerNavIcon: {},
      bannerNavSize: Number(pub.bannerNavSize) || 50,
      bannerNavRadius: pub.bannerNavRadius === undefined ? 999 : Number(pub.bannerNavRadius),
      // 箭頭 icon 顏色 / 按鈕背景色（空＝預設白字 + 半透明黑底）；背景可帶透明度（rgba）
      bannerNavColor: pub.bannerNavColor || '',
      bannerNavBg: pub.bannerNavBg || '',
      // 箭頭 icon 佔按鈕的大小（%，最大 100）
      bannerNavIconSize: pub.bannerNavIconSize === undefined ? 56 : Number(pub.bannerNavIconSize),
      // 按鈕距左右邊界距離 px（左右共用同一值 → 上一則 / 下一則對稱同步）
      bannerNavGap: pub.bannerNavGap === undefined ? 24 : Number(pub.bannerNavGap),
      // 箭頭線條粗細 px（''＝隨按鈕大小自動縮放；給 CSS 畫的箭頭如 BlockBanner03 用）
      bannerNavThickness: pub.bannerNavThickness ?? '',
      // 輪播：無限循環 / 自動播放開關（全 BlockBanner 版型共用此語意，預設開）
      bannerLoop: pub.bannerLoop === undefined ? true : String(pub.bannerLoop) !== 'false',
      bannerAutoplay: pub.bannerAutoplay === undefined ? true : String(pub.bannerAutoplay) !== 'false',
      // BlockBanner17：主圖滑鼠水波紋效果開關（預設開）
      bannerRipple: pub.bannerRipple === undefined ? true : String(pub.bannerRipple) !== 'false',
      // 輪播圓點（pagination dots）：開關、預設/選中背景色、框線寬度·顏色、寬·高（預設/選中各自）
      bannerDots: pub.bannerDots === undefined ? true : String(pub.bannerDots) !== 'false',
      bannerDotBg: pub.bannerDotBg || '', // 預設（未選中）背景色；空＝半透明白
      bannerDotActiveBg: pub.bannerDotActiveBg || '', // 選中背景色；空＝白
      bannerDotBorderWidth: pub.bannerDotBorderWidth === undefined ? 0 : Number(pub.bannerDotBorderWidth),
      bannerDotBorderColor: pub.bannerDotBorderColor || '',
      bannerDotW: pub.bannerDotW === undefined ? 10 : Number(pub.bannerDotW), // 預設寬
      bannerDotH: pub.bannerDotH === undefined ? 10 : Number(pub.bannerDotH), // 預設高
      bannerDotActiveW: pub.bannerDotActiveW === undefined ? 12 : Number(pub.bannerDotActiveW), // 選中寬
      bannerDotActiveH: pub.bannerDotActiveH === undefined ? 12 : Number(pub.bannerDotActiveH), // 選中高
      // Banner 各 BlockBanner 版型各自一組設定 { [版型名]: { ...banner* } }；
      // 執行期不直接讀（仍以上面的扁平 banner* 為「目前啟用版型」值），僅供後台切版型還原。
      bannerStyles: {},
      // 啟用語系（站台實際提供的語系碼陣列）；空＝全部啟用（fallback）。
      // 控制前台語系切換清單 + 後台只對「有啟用的語系」開放文字輸入
      enabledLangs: Array.isArray(pub.enabledLangs) ? pub.enabledLangs : ['tw', 'en', 'jp', 'kr'],
      // 語系顯示文字覆寫 { tw, en, jp, kr }；留空欄位 → 各 header 走自身預設（見 useLangLabels）
      langLabels: {},
      // navtool per-header 設定 { [HeaderName]: { items: [{key,enabled,order}] } }；空 → 走 PRESETS
      navtool: {},
      // Header 各版型各自一組設定 { [版型名]: { ...header* } }；執行期讀扁平值，僅後台切版型還原用
      headerStyles: {},
      isPreviewing: false,
    })
  })

  // 從 payload 還原時是 plain object 失去 reactivity；client 第一次包成 reactive
  // reactive(reactiveObj) 是 noop，安全可重複
  if (!isReactive(state.value)) {
    state.value = reactive(state.value)
  }

  const s = state.value

  // 從 localStorage 套用個人預覽（覆蓋 JSON / runtimeConfig 值）
  const loadPreview = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(PREVIEW_KEY)
      if (!raw) {
        s.isPreviewing = false
        return
      }
      const preview = JSON.parse(raw)
      for (const k of Object.keys(preview)) {
        if (k in s && preview[k] !== undefined && preview[k] !== null) {
          s[k] = preview[k]
        }
      }
      s.isPreviewing = Object.keys(preview).length > 0
    } catch (e) {
      console.warn('[admin preview] localStorage parse failed:', e)
    }
  }

  // 寫入單一欄位到 localStorage（即時生效；storage event 也會通知其他 tab）
  const setPreview = (key, value) => {
    if (!import.meta.client) return
    s[key] = value
    const raw = localStorage.getItem(PREVIEW_KEY)
    const preview = raw ? JSON.parse(raw) : {}
    preview[key] = value
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(preview))
    s.isPreviewing = true
  }

  // 清掉 localStorage 預覽（值回到 JSON / runtimeConfig）
  const clearPreview = () => {
    if (!import.meta.client) return
    localStorage.removeItem(PREVIEW_KEY)
    s.isPreviewing = false
  }

  return {
    state: s,
    loadPreview,
    setPreview,
    clearPreview,
    PREVIEW_KEY,
  }
}
