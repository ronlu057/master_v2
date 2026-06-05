// admin 表單共用邏輯 — 跨 admin 各子頁面共享 load / submit / dirty 判斷
// 各子頁面只負責渲染對應欄位 + 呼叫 setPreview / submit
//
// 用 useState 跨 nav 共享 options / persisted（避免每次切頁重 fetch）
export function useSiteSettings() {
  const { state, setPreview, clearPreview } = useEffectiveSettings()
  const navtoolCfg = useNavtoolConfig()

  const options = useState('site-settings-options', () => ({
    projectTypes: ['module', 'custom-home', 'full-custom', 'shop', 'temp'],
    headers: [],
    pageBanners: [],
    blockBanners: [],
    langs: ['tw', 'en', 'jp', 'kr'],
  }))
  const persisted = useState('site-settings-persisted', () => ({}))
  const loaded = useState('site-settings-loaded', () => false)
  const submitting = useState('site-settings-submitting', () => false)

  // 載入：第一次呼叫才會 fetch，後續切頁 cache
  const load = async (force = false) => {
    if (loaded.value && !force) return
    try {
      const res = await $fetch('/_admin/site-settings')
      options.value = res.options
      persisted.value = res.settings
      loaded.value = true
    } catch (e) {
      console.warn('[useSiteSettings] load failed:', e)
    }
  }

  // 哪些 key 跟 persisted 不一致（給按鈕 disabled 用）
  const isDirtyKey = (key) => state[key] !== persisted.value[key]

  // 提交：把當前 state 寫回 site-settings.json + .env
  const submit = async () => {
    submitting.value = true
    try {
      const payload = {
        projectType: state.projectType,
        header: state.header,
        pageBanner: state.pageBanner,
        blockBanner: state.blockBanner,
        apiBase: state.apiBase,
        defaultLang: state.defaultLang,
        enableShop: state.enableShop,
        logo: state.logo,
        logoMaxHeight: state.logoMaxHeight,
        customCss: state.customCss,
        langLabels: state.langLabels || {},
        // navtool per-header 設定：把所有預覽（localStorage）固化進 JSON
        navtool: navtoolCfg.snapshotForSave(),
      }
      const res = await $fetch('/_admin/site-settings', { method: 'POST', body: payload })
      persisted.value = res.settings || payload
      // navtool 已寫回 JSON → 同步 state.navtool 並清掉預覽（浮條收起、開關維持存檔值）
      state.navtool = res.settings?.navtool ?? payload.navtool
      navtoolCfg.markSaved()
      // 廣播給其他 tab（其他 tab 收 storage event 後 refetch）
      if (import.meta.client) {
        localStorage.setItem('master_v2_settings_broadcast', String(Date.now()))
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.statusMessage || e.message }
    } finally {
      submitting.value = false
    }
  }

  return {
    state,
    options,
    persisted,
    loaded,
    submitting,
    load,
    submit,
    setPreview,
    clearPreview,
    isDirtyKey,
  }
}
