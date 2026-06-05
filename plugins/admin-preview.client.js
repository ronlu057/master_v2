// Client 啟動時：
//   1. 套 localStorage 預覽值（個人覆寫；如果有的話）
//      ※ JSON 初始值已在 SSR 階段由 site-settings.server.js 讀進 state，透過
//        useState payload 同步到 client，**不需要再 fetch**
//   2. 掛 storage event listener — 跨 tab 同步：
//      - PREVIEW_KEY：admin 改下拉時即時換版型
//      - SETTINGS_BROADCAST_KEY：admin 提交寫 JSON 後，其他 tab 重新 fetch JSON 套用
//      - NAVTOOL_PREFIX_xxx：navtool 設定變動
export default defineNuxtPlugin(() => {
  const { state, loadPreview } = useEffectiveSettings()

  loadPreview()

  if (!import.meta.client) return

  const NAVTOOL_PREFIX = 'master_v2_navtool_'
  const PREVIEW_KEY = 'master_v2_preview'
  const SETTINGS_BROADCAST_KEY = 'master_v2_settings_broadcast'

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
      syncAllNavtoolFromStorage()
      return
    }
    if (e.key === PREVIEW_KEY) {
      loadPreview()
      return
    }
    if (e.key === SETTINGS_BROADCAST_KEY) {
      await refetchJson()
      // JSON 內的 navtool 已更新 → 重建 navtool state，讓 admin/其他 tab 跟上新存檔值（前後台同步）
      syncAllNavtoolFromStorage()
      return
    }
    if (e.key.startsWith(NAVTOOL_PREFIX)) {
      syncNavtoolFromStorage(e.key.slice(NAVTOOL_PREFIX.length))
    }
  })
})
