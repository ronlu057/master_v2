// Client 啟動時：
//   1. 套 localStorage 預覽值（個人覆寫；如果有的話）
//      ※ JSON 初始值已在 SSR 階段由 site-settings.server.js 讀進 state，透過
//        useState payload 同步到 client，**不需要再 fetch**
//   2. 掛 storage event listener — 跨 tab 同步：
//      - PREVIEW_KEY：admin 改下拉時即時換版型
//      - SETTINGS_BROADCAST_KEY：admin 提交寫 JSON 後，其他 tab 重新 fetch JSON 套用
//      - NAVTOOL_PREFIX_xxx：navtool 設定變動
export default defineNuxtPlugin((nuxtApp) => {
  const { state, loadPreview } = useEffectiveSettings()
  const { load: loadBannerPreview, KEY: BANNER_PREVIEW_KEY } = useBannerPreview()

  loadPreview()
  loadBannerPreview()

  if (!import.meta.client) return

  const NAVTOOL_PREFIX = 'master_v2_navtool_'
  const PREVIEW_KEY = 'master_v2_preview'
  const SETTINGS_BROADCAST_KEY = 'master_v2_settings_broadcast'
  const MENU_BROADCAST_KEY = 'master_v2_menu_broadcast'
  const MENU_KEYS = ['site:menu:tw', 'site:menu:en', 'site:menu:jp', 'site:menu:kr']
  // 通用 mock 資料存檔廣播（banner 等）：其他分頁重抓全部前台資料
  const MOCK_BROADCAST_KEY = 'master_v2_mock_broadcast'

  const refetchJson = async () => {
    try {
      const res = await $fetch('/_admin/site-settings')
      const settings = res?.settings || res
      if (settings && typeof settings === 'object') {
        for (const k of Object.keys(settings)) {
          if (k in state && settings[k] !== undefined) state[k] = settings[k]
        }
      }
    } catch {}
  }

  window.addEventListener('storage', async (e) => {
    if (!e.key) {
      loadPreview()
      loadBannerPreview()
      syncAllNavtoolFromStorage()
      return
    }
    if (e.key === PREVIEW_KEY) {
      loadPreview()
      return
    }
    if (e.key === BANNER_PREVIEW_KEY) {
      // banner 後台編輯中 → 站台即時套用預覽（跨分頁）
      loadBannerPreview()
      return
    }
    if (e.key === SETTINGS_BROADCAST_KEY) {
      await refetchJson()
      // JSON 內的 navtool 已更新 → 重建 navtool state，讓 admin/其他 tab 跟上新存檔值（前後台同步）
      syncAllNavtoolFromStorage()
      return
    }
    if (e.key === MENU_BROADCAST_KEY) {
      // 選單管理存檔 → 重抓前台選單（useFetch 以 key 快取，否則不會更新）
      // ※ refreshNuxtData 需要 Nuxt context，事件回呼裡 context 已遺失 → 用 runWithContext 包起來
      nuxtApp.runWithContext(() => refreshNuxtData(MENU_KEYS))
      return
    }
    if (e.key === MOCK_BROADCAST_KEY) {
      // banner 等 mock 資料存檔 → 重抓首頁 banner（只抓這兩個 key，避免整站重抓造成閃爍/破圖）
      nuxtApp.runWithContext(() => refreshNuxtData(['banner-home', 'home-banner']))
      return
    }
    if (e.key.startsWith(NAVTOOL_PREFIX)) {
      syncNavtoolFromStorage(e.key.slice(NAVTOOL_PREFIX.length))
    }
  })
})
