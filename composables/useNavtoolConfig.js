// ── navtool 設定（per-Header） ──────────────────────────────
// 每個 Header 有自己的 navtool 預設值（PRESETS）與 localStorage（key per-Header）
// 切換 Header 版型時自動讀對應 state；admin UI 也跟著當前 Header 顯示
//
// localStorage keys：master_v2_navtool_<HeaderName>
// 例：master_v2_navtool_Header02 = { items: [{key, enabled, order}, ...] }

const KEY_PREFIX = 'master_v2_navtool_'

// 標準 6 個 icon 的 label（各 preset 共用）
const ITEM_LABELS = {
  search: '搜尋',
  language: '語系',
  social: '社群',
  member: '會員中心',
  cart: '購物車',
  favorite: '我的最愛',
}

// 通用預設（沒在 PRESETS 列出的 Header 都套這個）
const GENERAL_DEFAULT = {
  search: { enabled: true, order: 1 },
  language: { enabled: true, order: 2 },
  social: { enabled: false, order: 3 },
  member: { enabled: false, order: 4 },
  cart: { enabled: false, order: 5 },
  favorite: { enabled: false, order: 6 },
}

// Per-Header 預設覆寫（只列「跟通用不同」的 Header）
const PRESETS = {
  // Header02：含獨立社群區的置中型 — 預設只開社群、其他關
  Header02: {
    search: { enabled: false, order: 1 },
    language: { enabled: false, order: 2 },
    social: { enabled: true, order: 3 },
    member: { enabled: false, order: 4 },
    cart: { enabled: false, order: 5 },
    favorite: { enabled: false, order: 6 },
  },
  // 之後若要為其他 Header 設不同預設，加在這邊：
  // Header07: { ... },  // 補習班可能不需語系
  // Header15: { ... },  // 餐廳浮動圓鈕可能要強調社群
}

function buildPresetItems(headerKey) {
  const preset = PRESETS[headerKey] || GENERAL_DEFAULT
  return Object.keys(ITEM_LABELS).map((key) => ({
    key,
    label: ITEM_LABELS[key],
    enabled: preset[key]?.enabled ?? false,
    order: preset[key]?.order ?? 99,
  }))
}

// 「已存回 site-settings.json 的 navtool 設定」的即時讀取器
// 指向 reactive 的 effective.navtool（singleton）；admin 存檔 / 跨 tab refetch 把它替換後，
// 這裡讀到的永遠是最新值。用 getter 而非複製 → 避免拿到舊副本（前後台不同步的根因）
let getPersistedNavtool = () => ({})

// 基準 items：先套 PRESET，再用「已存檔」的值覆寫（存檔 > preset）
// localStorage 預覽再疊在這之上（見 syncStateFromStorage）
function baseItemsFor(headerKey) {
  const preset = PRESETS[headerKey] || GENERAL_DEFAULT
  const saved = getPersistedNavtool()?.[headerKey]?.items
  return Object.keys(ITEM_LABELS).map((key) => {
    const f = Array.isArray(saved) ? saved.find((x) => x.key === key) : null
    return {
      key,
      label: ITEM_LABELS[key],
      enabled: typeof f?.enabled === 'boolean' ? f.enabled : (preset[key]?.enabled ?? false),
      order: typeof f?.order === 'number' ? f.order : (preset[key]?.order ?? 99),
    }
  })
}

// 全域 state map：每個 Header 一份 reactive state
// （Map 本身不 reactive，但每個 value 是 reactive 物件）
const allStates = new Map()

function ensureState(headerKey) {
  if (allStates.has(headerKey)) return allStates.get(headerKey)

  const items = baseItemsFor(headerKey)
  const state = reactive({ items, isPreviewing: false, headerKey })
  allStates.set(headerKey, state)

  // client 端嘗試從 localStorage 套用
  if (import.meta.client) syncStateFromStorage(state)

  return state
}

// 把 localStorage 的 navtool 設定套到 reactive state 上（或在 localStorage 被清時 reset 為 preset）
// 給 storage event listener 與初次建 state 共用
function syncStateFromStorage(state) {
  if (!import.meta.client) return
  const raw = localStorage.getItem(KEY_PREFIX + state.headerKey)
  if (!raw) {
    // localStorage 被清 → 套回「已存檔基準（或 preset）」，跨 tab 同步「清預覽」
    const defaults = baseItemsFor(state.headerKey)
    state.items.forEach((item) => {
      const def = defaults.find((d) => d.key === item.key)
      if (def) {
        item.enabled = def.enabled
        item.order = def.order
      }
    })
    state.isPreviewing = false
    return
  }
  try {
    const saved = JSON.parse(raw)
    if (Array.isArray(saved?.items)) {
      state.items.forEach((item) => {
        const found = saved.items.find((x) => x.key === item.key)
        if (found) {
          if (typeof found.enabled === 'boolean') item.enabled = found.enabled
          if (typeof found.order === 'number') item.order = found.order
        }
      })
      state.isPreviewing = true
    }
  } catch (e) {
    console.warn('[navtool config] localStorage parse failed:', e)
  }
}

// 讓 storage event handler 用 — 把單一 header 的 state sync（如果該 state 已 init）
export function syncNavtoolFromStorage(headerKey) {
  const s = allStates.get(headerKey)
  if (s) syncStateFromStorage(s)
}

// 重新 sync 所有已 init 的 Header state（給「storage 全清」用）
export function syncAllNavtoolFromStorage() {
  allStates.forEach((s) => syncStateFromStorage(s))
}

// member/cart/favorite 三個需要 enableShop 才會實際顯示
const SHOP_DEPENDENT = ['member', 'cart', 'favorite']

export function useNavtoolConfig() {
  const { state: effective } = useEffectiveSettings()

  // 把「已存檔基準」指向 reactive 的 effective.navtool（live；refetch 後自動跟新值）
  getPersistedNavtool = () => effective.navtool

  // 當前 Header 的 reactive state（computed 跟隨 effective.header 變動）
  const currentState = computed(() => ensureState(effective.header))

  // 寫入 localStorage
  const persist = () => {
    if (!import.meta.client) return
    const s = currentState.value
    localStorage.setItem(
      KEY_PREFIX + s.headerKey,
      JSON.stringify({ items: s.items }),
    )
    s.isPreviewing = true
  }

  // 切換單一 icon 開關
  const toggle = (key, enabled) => {
    const item = currentState.value.items.find((x) => x.key === key)
    if (!item) return
    item.enabled = enabled
    persist()
  }

  // order 上下移
  const moveUp = (key) => {
    const sorted = [...currentState.value.items].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.key === key)
    if (idx <= 0) return
    const a = sorted[idx]
    const b = sorted[idx - 1]
    ;[a.order, b.order] = [b.order, a.order]
    persist()
  }
  const moveDown = (key) => {
    const sorted = [...currentState.value.items].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x.key === key)
    if (idx < 0 || idx >= sorted.length - 1) return
    const a = sorted[idx]
    const b = sorted[idx + 1]
    ;[a.order, b.order] = [b.order, a.order]
    persist()
  }

  // 回到當前 Header 的預設 + 清該 Header 的 localStorage
  const reset = () => {
    const s = currentState.value
    const defaults = buildPresetItems(s.headerKey)
    s.items.forEach((item) => {
      const def = defaults.find((d) => d.key === item.key)
      if (def) {
        item.enabled = def.enabled
        item.order = def.order
      }
    })
    if (import.meta.client) localStorage.removeItem(KEY_PREFIX + s.headerKey)
    s.isPreviewing = false
  }

  // 清「所有 Header 的 navtool 預覽」+ effective settings + reload
  const resetAndReload = () => {
    if (!import.meta.client) return
    // 掃 localStorage 所有 master_v2_navtool_* key
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(KEY_PREFIX)) keysToRemove.push(k)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    localStorage.removeItem('master_v2_preview')
    window.location.reload()
  }

  // 查詢函式（reactive；跟著 currentState 切換 Header 自動換）
  const isEnabled = (key) => {
    const item = currentState.value.items.find((x) => x.key === key)
    if (!item || !item.enabled) return false
    if (SHOP_DEPENDENT.includes(key)) {
      const { enableShop } = useProject()
      return enableShop.value
    }
    return true
  }
  const orderOf = (key) => {
    const item = currentState.value.items.find((x) => x.key === key)
    return item ? item.order : 99
  }

  // 排好順序的清單（給 admin UI 用）
  const orderedItems = computed(
    () => [...currentState.value.items].sort((a, b) => a.order - b.order),
  )

  // 收集「所有預覽中（localStorage）+ 已存檔」的 navtool 設定 → 可寫回 JSON 的物件
  // 給 submit 用：把預覽固化進 site-settings.json
  const snapshotForSave = () => {
    const result = { ...(effective.navtool || {}) }
    if (import.meta.client) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k || !k.startsWith(KEY_PREFIX)) continue
        const headerKey = k.slice(KEY_PREFIX.length)
        try {
          const saved = JSON.parse(localStorage.getItem(k))
          if (Array.isArray(saved?.items)) {
            result[headerKey] = {
              items: saved.items.map((x) => ({
                key: x.key,
                enabled: !!x.enabled,
                order: Number(x.order) || 99,
              })),
            }
          }
        } catch {}
      }
    }
    return result
  }

  // 存檔後：把已寫回 JSON 的值設為新基準 + 清掉所有預覽 localStorage + 重建 state（isPreviewing→false）
  // → 浮條收起、開關維持存檔值（不再彈回 preset）
  const markSaved = () => {
    if (import.meta.client) {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(KEY_PREFIX)) keys.push(k)
      }
      keys.forEach((k) => localStorage.removeItem(k))
    }
    allStates.forEach((s) => syncStateFromStorage(s))
  }

  return {
    // current Header 對應的 state（reactive，admin UI 依此顯示）
    state: currentState,
    items: orderedItems,
    currentHeader: computed(() => currentState.value.headerKey),
    // 查詢（給各 Header 用）
    isEnabled,
    orderOf,
    // 操作（admin UI 用）
    toggle,
    moveUp,
    moveDown,
    reset,
    resetAndReload,
    persist,
    snapshotForSave,
    markSaved,
  }
}
