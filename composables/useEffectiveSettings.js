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
