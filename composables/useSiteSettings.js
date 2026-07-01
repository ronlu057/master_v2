// admin 表單共用邏輯 — 跨 admin 各子頁面共享 load / submit / dirty 判斷
// 各子頁面只負責渲染對應欄位 + 呼叫 setPreview / submit
//
// 用 useState 跨 nav 共享 options / persisted（避免每次切頁重 fetch）

// ── Banner「每個版型各自一組」的設定欄位 ──────────────────────
// 這些 key 在 site-settings.json 仍以「扁平 key」存目前啟用版型的值（執行期 / SSR 直接讀），
// 另外整包記進 bannerStyles[版型名]，切版型時各自還原、互不影響。def = 該版型未設定時的預設值。
export const BANNER_LAYOUT_KEYS = [
  { key: 'bannerTitleColor', def: '' },
  { key: 'bannerSubtitleColor', def: '' },
  { key: 'bannerMemoColor', def: '' },
  { key: 'bannerAccentColor', def: '' },
  { key: 'bannerAccentColor2', def: '' },
  // BlockBanner15 影片圓鈕：五部位獨立色 + 旋轉文字（留空＝版型預設）
  { key: 'bannerVideoOuterColor', def: '' },
  { key: 'bannerVideoInnerColor', def: '' },
  { key: 'bannerVideoTextColor', def: '' },
  { key: 'bannerVideoBgColor', def: '' },
  { key: 'bannerVideoTriColor', def: '' },
  { key: 'bannerVideoText', def: '' },
  { key: 'bannerTopImage', def: '' },
  // BlockBanner16：固定背景大圖 + 3 張浮層小圖（版型層級一組，非每則）
  { key: 'bannerBgImage', def: '' },
  { key: 'bannerDeco1', def: '' },
  { key: 'bannerDeco2', def: '' },
  { key: 'bannerDeco3', def: '' },
  { key: 'bannerNav', def: true },
  { key: 'bannerNavIcon', def: {} },
  { key: 'bannerNavSize', def: 50 },
  { key: 'bannerNavRadius', def: 999 },
  { key: 'bannerNavColor', def: '' },
  { key: 'bannerNavBg', def: '' },
  { key: 'bannerNavIconSize', def: 56 },
  { key: 'bannerNavGap', def: 24 },
  { key: 'bannerNavThickness', def: '' },
  { key: 'bannerLoop', def: true },
  { key: 'bannerAutoplay', def: true },
  // BlockBanner17：主圖滑鼠水波紋效果開關
  { key: 'bannerRipple', def: true },
  { key: 'bannerDots', def: true },
  { key: 'bannerDotBg', def: '' },
  { key: 'bannerDotActiveBg', def: '' },
  { key: 'bannerDotBorderWidth', def: 0 },
  { key: 'bannerDotBorderColor', def: '' },
  { key: 'bannerDotW', def: 10 },
  { key: 'bannerDotH', def: 10 },
  { key: 'bannerDotActiveW', def: 12 },
  { key: 'bannerDotActiveH', def: 12 },
]

// ── Header「每個版型各自一組」的設定欄位 ──────────────────────
// 同 banner：扁平 key 存「目前啟用 Header」的值（執行期 / SSR 直接讀），
// 另整包記進 headerStyles[版型名]，切版型各自還原、互不影響。
// 不含全站共用的 logo / logoMaxHeight / customCss；navtool 已自有 per-header 機制。
export const HEADER_LAYOUT_KEYS = [
  { key: 'headerBgColor', def: '' },
  { key: 'headerBgColorScroll', def: '' },
  { key: 'headerMenuColor', def: '' },
  { key: 'headerMenuHoverColor', def: '' },
  { key: 'headerDropdownColor', def: '' },
  { key: 'headerDropdownHoverColor', def: '' },
  { key: 'headerDropdownBg', def: '' },
  { key: 'headerDropdownItemBg', def: '' },
  { key: 'headerDropdownItemHoverBg', def: '' },
  { key: 'headerDropdownBorderColor', def: '' },
  { key: 'headerDropdownItemBorderColor', def: '' },
  { key: 'headerIconColor', def: '' },
  { key: 'headerIconHoverColor', def: '' },
  { key: 'headerIconBg', def: '' },
  { key: 'headerIconHoverBg', def: '' },
  { key: 'headerMenuColorScroll', def: '' },
  { key: 'headerMenuHoverColorScroll', def: '' },
  { key: 'headerDropdownColorScroll', def: '' },
  { key: 'headerDropdownHoverColorScroll', def: '' },
  { key: 'headerDropdownBgScroll', def: '' },
  { key: 'headerDropdownItemBgScroll', def: '' },
  { key: 'headerDropdownItemHoverBgScroll', def: '' },
  { key: 'headerDropdownBorderColorScroll', def: '' },
  { key: 'headerDropdownItemBorderColorScroll', def: '' },
  { key: 'headerIconColorScroll', def: '' },
  { key: 'headerIconHoverColorScroll', def: '' },
  { key: 'headerIconBgScroll', def: '' },
  { key: 'headerIconHoverBgScroll', def: '' },
  { key: 'headerIconRadius', def: '' },
  { key: 'headerDropdownRadius', def: '' },
  { key: 'headerDropdownItemRadius', def: '' },
  { key: 'headerNavtoolDropdownRadius', def: '' },
  { key: 'headerNavtoolDropdownItemRadius', def: '' },
  { key: 'headerDropdownPaddingY', def: '' },
  { key: 'headerDropdownPaddingX', def: '' },
  { key: 'headerDropdownBorderWidth', def: '' },
  { key: 'headerDropdownItemPaddingY', def: '' },
  { key: 'headerDropdownItemPaddingX', def: '' },
  { key: 'headerDropdownItemBorderWidth', def: '' },
  { key: 'headerMenuFontSize', def: '' },
  { key: 'headerSubmenuStyle', def: 'flyout' },
  { key: 'headerSubmenuIconPos', def: 'right' },
  { key: 'headerSubmenuIconOffset', def: 8 },
  { key: 'headerIcons', def: {} },
  { key: 'headerSubmenuIcon', def: {} },
]

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
  // Banner 各版型設定草稿（編輯中、未提交）：{ [版型名]: { ...BANNER_LAYOUT_KEYS } }
  const bannerDraft = useState('banner-styles-draft', () => ({}))
  // Header 各版型設定草稿（同上）
  const headerDraft = useState('header-styles-draft', () => ({}))

  // 以 persisted 為基底重建 header 草稿（缺目前啟用版型 → 用扁平值補上）
  const seedHeaderDraft = () => {
    const draft = { ...(persisted.value.headerStyles || {}) }
    const active = persisted.value.header || 'Header01'
    if (!draft[active]) {
      const o = {}
      for (const { key } of HEADER_LAYOUT_KEYS) o[key] = persisted.value[key]
      draft[active] = o
    }
    headerDraft.value = draft
  }

  // 切換 Header 版型：先存舊版型草稿 → 切 → 載入新版型草稿（沒設過用預設）寫進 state
  const switchHeader = (name) => {
    const cur = {}
    for (const { key } of HEADER_LAYOUT_KEYS) cur[key] = state[key]
    headerDraft.value = { ...headerDraft.value, [state.header]: cur }
    setPreview('header', name)
    const next = headerDraft.value[name]
    for (const { key, def } of HEADER_LAYOUT_KEYS) {
      setPreview(key, next && next[key] !== undefined ? next[key] : def)
    }
  }

  // Header 是否有未提交變動（目前啟用版型扁平值 vs persisted；其他版型草稿 vs persisted.headerStyles）
  const headerDirty = computed(() => {
    for (const { key } of HEADER_LAYOUT_KEYS) {
      if (JSON.stringify(state[key]) !== JSON.stringify(persisted.value[key])) return true
    }
    const saved = persisted.value.headerStyles || {}
    for (const name of Object.keys(headerDraft.value)) {
      if (name === state.header) continue
      if (JSON.stringify(headerDraft.value[name]) !== JSON.stringify(saved[name] || {})) return true
    }
    return false
  })

  // 以 persisted 為基底重建 banner 草稿：
  //   - 既有 bannerStyles 全收
  //   - 缺「目前啟用版型」那筆 → 用 JSON 既有的扁平值補上（首次遷移、無 bannerStyles 時）
  const seedBannerDraft = () => {
    const draft = { ...(persisted.value.bannerStyles || {}) }
    const active = persisted.value.blockBanner || 'BlockBanner01'
    if (!draft[active]) {
      const o = {}
      for (const { key } of BANNER_LAYOUT_KEYS) o[key] = persisted.value[key]
      draft[active] = o
    }
    bannerDraft.value = draft
  }

  // 載入：第一次呼叫才會 fetch，後續切頁 cache
  const load = async (force = false) => {
    if (loaded.value && !force) return
    try {
      const res = await $fetch('/_admin/site-settings')
      options.value = res.options
      persisted.value = res.settings
      seedBannerDraft()
      seedHeaderDraft()
      loaded.value = true
    } catch (e) {
      console.warn('[useSiteSettings] load failed:', e)
    }
  }

  // 切換 BlockBanner 版型（後台用）：
  //   1) 先把目前畫面上的 banner 設定存進草稿（記住舊版型的調整）
  //   2) 切版型
  //   3) 載入新版型的草稿值（沒設過 → 用各欄位預設）寫進 state（即時預覽）
  const switchBlockBanner = (name) => {
    const cur = {}
    for (const { key } of BANNER_LAYOUT_KEYS) cur[key] = state[key]
    bannerDraft.value = { ...bannerDraft.value, [state.blockBanner]: cur }

    setPreview('blockBanner', name)

    const next = bannerDraft.value[name]
    for (const { key, def } of BANNER_LAYOUT_KEYS) {
      setPreview(key, next && next[key] !== undefined ? next[key] : def)
    }
  }

  // 哪些 key 跟 persisted 不一致（給按鈕 disabled 用）
  const isDirtyKey = (key) => state[key] !== persisted.value[key]

  // Banner 是否有未提交變動：目前啟用版型的扁平值 vs persisted，
  // 以及其他版型草稿 vs persisted.bannerStyles（涵蓋「調了 B 又切回 A」）
  const bannerDirty = computed(() => {
    for (const { key } of BANNER_LAYOUT_KEYS) {
      if (JSON.stringify(state[key]) !== JSON.stringify(persisted.value[key])) return true
    }
    const saved = persisted.value.bannerStyles || {}
    for (const name of Object.keys(bannerDraft.value)) {
      if (name === state.blockBanner) continue
      if (JSON.stringify(bannerDraft.value[name]) !== JSON.stringify(saved[name] || {})) return true
    }
    return false
  })

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
        headerBgColor: state.headerBgColor || '',
        headerBgColorScroll: state.headerBgColorScroll || '',
        headerMenuColor: state.headerMenuColor || '',
        headerMenuHoverColor: state.headerMenuHoverColor || '',
        headerDropdownBg: state.headerDropdownBg || '',
        headerDropdownItemBg: state.headerDropdownItemBg || '',
        headerDropdownItemHoverBg: state.headerDropdownItemHoverBg || '',
        headerDropdownColor: state.headerDropdownColor || '',
        headerDropdownHoverColor: state.headerDropdownHoverColor || '',
        headerIconColor: state.headerIconColor || '',
        headerIconHoverColor: state.headerIconHoverColor || '',
        headerIconBg: state.headerIconBg || '',
        headerIconHoverBg: state.headerIconHoverBg || '',
        headerIconRadius: state.headerIconRadius ?? '',
        headerDropdownRadius: state.headerDropdownRadius ?? '',
        headerDropdownItemRadius: state.headerDropdownItemRadius ?? '',
        headerNavtoolDropdownRadius: state.headerNavtoolDropdownRadius ?? '',
        headerNavtoolDropdownItemRadius: state.headerNavtoolDropdownItemRadius ?? '',
        headerDropdownPaddingY: state.headerDropdownPaddingY ?? '',
        headerDropdownPaddingX: state.headerDropdownPaddingX ?? '',
        headerDropdownBorderWidth: state.headerDropdownBorderWidth ?? '',
        headerDropdownBorderColor: state.headerDropdownBorderColor || '',
        headerDropdownItemPaddingY: state.headerDropdownItemPaddingY ?? '',
        headerDropdownItemPaddingX: state.headerDropdownItemPaddingX ?? '',
        headerDropdownItemBorderWidth: state.headerDropdownItemBorderWidth ?? '',
        headerDropdownItemBorderColor: state.headerDropdownItemBorderColor || '',
        // 捲動後（.scroll）選單顏色覆寫
        headerMenuColorScroll: state.headerMenuColorScroll || '',
        headerMenuHoverColorScroll: state.headerMenuHoverColorScroll || '',
        headerDropdownColorScroll: state.headerDropdownColorScroll || '',
        headerDropdownHoverColorScroll: state.headerDropdownHoverColorScroll || '',
        headerDropdownBgScroll: state.headerDropdownBgScroll || '',
        headerDropdownItemBgScroll: state.headerDropdownItemBgScroll || '',
        headerDropdownItemHoverBgScroll: state.headerDropdownItemHoverBgScroll || '',
        headerDropdownBorderColorScroll: state.headerDropdownBorderColorScroll || '',
        headerDropdownItemBorderColorScroll: state.headerDropdownItemBorderColorScroll || '',
        headerIconColorScroll: state.headerIconColorScroll || '',
        headerIconHoverColorScroll: state.headerIconHoverColorScroll || '',
        headerIconBgScroll: state.headerIconBgScroll || '',
        headerIconHoverBgScroll: state.headerIconHoverBgScroll || '',
        headerIcons: state.headerIcons || {},
        headerSubmenuStyle: state.headerSubmenuStyle || 'flyout',
        headerSubmenuIcon: state.headerSubmenuIcon || {},
        headerSubmenuIconPos: state.headerSubmenuIconPos || 'right',
        headerSubmenuIconOffset: state.headerSubmenuIconOffset ?? 8,
        headerMenuFontSize: state.headerMenuFontSize ?? '',
        bannerTitleColor: state.bannerTitleColor || '',
        bannerSubtitleColor: state.bannerSubtitleColor || '',
        bannerMemoColor: state.bannerMemoColor || '',
        bannerAccentColor: state.bannerAccentColor || '',
        bannerAccentColor2: state.bannerAccentColor2 || '',
        bannerVideoOuterColor: state.bannerVideoOuterColor || '',
        bannerVideoInnerColor: state.bannerVideoInnerColor || '',
        bannerVideoTextColor: state.bannerVideoTextColor || '',
        bannerVideoBgColor: state.bannerVideoBgColor || '',
        bannerVideoTriColor: state.bannerVideoTriColor || '',
        bannerVideoText: state.bannerVideoText || '',
        bannerTopImage: state.bannerTopImage || '',
        bannerBgImage: state.bannerBgImage || '',
        bannerDeco1: state.bannerDeco1 || '',
        bannerDeco2: state.bannerDeco2 || '',
        bannerDeco3: state.bannerDeco3 || '',
        bannerNav: !!state.bannerNav,
        bannerNavIcon: state.bannerNavIcon || {},
        bannerNavSize: Number(state.bannerNavSize) || 50,
        bannerNavRadius: state.bannerNavRadius ?? 999,
        bannerNavColor: state.bannerNavColor || '',
        bannerNavBg: state.bannerNavBg || '',
        bannerNavIconSize: state.bannerNavIconSize ?? 56,
        bannerNavGap: state.bannerNavGap ?? 24,
        bannerNavThickness: state.bannerNavThickness ?? '',
        bannerLoop: !!state.bannerLoop,
        bannerAutoplay: !!state.bannerAutoplay,
        bannerRipple: !!state.bannerRipple,
        bannerDots: !!state.bannerDots,
        bannerDotBg: state.bannerDotBg || '',
        bannerDotActiveBg: state.bannerDotActiveBg || '',
        bannerDotBorderWidth: state.bannerDotBorderWidth ?? 0,
        bannerDotBorderColor: state.bannerDotBorderColor || '',
        bannerDotW: state.bannerDotW ?? 10,
        bannerDotH: state.bannerDotH ?? 10,
        bannerDotActiveW: state.bannerDotActiveW ?? 12,
        bannerDotActiveH: state.bannerDotActiveH ?? 12,
        enabledLangs: Array.isArray(state.enabledLangs) ? state.enabledLangs : [],
        langLabels: state.langLabels || {},
        // navtool per-header 設定：把所有預覽（localStorage）固化進 JSON
        navtool: navtoolCfg.snapshotForSave(),
      }
      // Banner 各版型設定：草稿 + 目前啟用版型的最新值（取 payload 已打包好的扁平值）整包寫回。
      // 扁平 banner key 仍代表「目前啟用版型」，執行期 / SSR 不變；bannerStyles 供後台切版型還原。
      const activeSnap = {}
      for (const { key } of BANNER_LAYOUT_KEYS) activeSnap[key] = payload[key]
      payload.bannerStyles = { ...bannerDraft.value, [state.blockBanner]: activeSnap }
      // Header 各版型設定：同 banner，整包 headerStyles 連同目前啟用版型快照寫回
      const headerSnap = {}
      for (const { key } of HEADER_LAYOUT_KEYS) headerSnap[key] = payload[key]
      payload.headerStyles = { ...headerDraft.value, [state.header]: headerSnap }
      const res = await $fetch('/_admin/site-settings', { method: 'POST', body: payload })
      persisted.value = res.settings || payload
      seedBannerDraft()
      seedHeaderDraft()
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
    switchBlockBanner,
    bannerDirty,
    switchHeader,
    headerDirty,
  }
}
