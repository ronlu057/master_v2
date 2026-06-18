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
      // 選單（menu）顏色（全站共用，空＝交還版型預設）：文字色 / 滑鼠滑過色 / 下拉背景色
      // 由 app.vue 注入 !important 規則，套用到 .app-header nav 連結與下拉子選單
      headerMenuColor: pub.headerMenuColor || '',
      headerMenuHoverColor: pub.headerMenuHoverColor || '',
      headerDropdownBg: pub.headerDropdownBg || '', // 下拉「容器」背景
      headerDropdownItemBg: pub.headerDropdownItemBg || '', // 下拉「單項」背景
      headerDropdownColor: pub.headerDropdownColor || '', // 下拉「文字」色（與主選單文字分開）
      headerDropdownHoverColor: pub.headerDropdownHoverColor || '', // 下拉文字「滑鼠滑過」色
      headerIconColor: pub.headerIconColor || '', // 工具列圖示色（搜尋/語系/社群/會員/購物車…）
      headerIconHoverColor: pub.headerIconHoverColor || '', // 工具列圖示滑過色
      headerDropdownRadius: pub.headerDropdownRadius ?? '', // 下拉「容器」圓角 px（0＝直角，''＝版型預設）
      headerDropdownItemRadius: pub.headerDropdownItemRadius ?? '', // 下拉「項目」圓角 px
      // navtool 各 slot 換 icon：{ [slot]: { name, style:'line'|'solid' } }；空＝用 icons.scss 預設 SVG
      headerIcons: {},
      // 主選單文字大小（px，全站共用，''＝版型預設）
      headerMenuFontSize: pub.headerMenuFontSize ?? '',
      // 語系顯示文字覆寫 { tw, en, jp, kr }；留空欄位 → 各 header 走自身預設（見 useLangLabels）
      langLabels: {},
      // navtool per-header 設定 { [HeaderName]: { items: [{key,enabled,order}] } }；空 → 走 PRESETS
      navtool: {},
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
