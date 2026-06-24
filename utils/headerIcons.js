// ─────────────────────────────────────────────────────────────
// 工具列（navtool）可換 icon — 「分 slot 的精選集」+ helper
// 啟發自「覺醒設計 · 前端 CSS 輔助器 · Icon 字型工坊」：
//   - line（線條）body 為 Lucide 風格（viewBox 0 0 24 24）
//   - solid（實心）為對應實心版；無實心版者 solid: null → 自動退回線條（與工坊一致）
//
// 每個 slot 只列「該用途適合」的 icon（搜尋給放大鏡類、語系給地球/翻譯類…）。
// 全站 icon 仍走 .icon mask-image；後台選了某 slot 的 icon 後，由 app.vue 注入
// `.app-header .icon-XXX { mask-image: <data-uri> }` 覆寫形狀，line/solid 即時切換。
// 沒選＝用 icons.scss 的預設 SVG。
// ─────────────────────────────────────────────────────────────

// navtool 各 slot → 對應 header 內的 icon class + 預設 icon 名稱（須存在於該 slot 的選項中）
export const HEADER_ICON_SLOTS = [
  { slot: 'search', cls: 'icon-search', label: '搜尋', def: 'search' },
  { slot: 'language', cls: 'icon-language', label: '語系', def: 'globe' },
  { slot: 'member', cls: 'icon-member', label: '會員', def: 'user' },
  { slot: 'cart', cls: 'icon-shopcart', label: '購物車', def: 'cart' },
  { slot: 'favorite', cls: 'icon-like', label: '我的最愛', def: 'heart' },
]

// 各 slot 的精選 icon（line 必填、solid 可為 null＝退回線條）。名稱全庫唯一。
export const HEADER_ICON_OPTIONS = {
  // 搜尋：放大鏡 / 縮放 / 掃描 / 篩選
  search: [
    {
      name: 'search',
      label: '放大鏡',
      line: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      solid: '<path d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39a1 1 0 0 1-1.42 1.42l-5.39-5.39A8 8 0 1 1 10 2z"/>',
    },
    {
      name: 'zoom-in',
      label: '放大鏡＋',
      line: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
      solid: null,
    },
    {
      name: 'scan-search',
      label: '掃描',
      line: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="11" cy="11" r="3"/><path d="m16 16-2-2"/>',
      solid: null,
    },
    {
      name: 'filter',
      label: '篩選',
      line: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
      solid: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    },
  ],

  // 語系：地球 / 翻譯 / 字典
  language: [
    {
      name: 'globe',
      label: '地球',
      line: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      solid: null,
    },
    {
      name: 'globe-2',
      label: '地球（經緯）',
      line: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2v20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/>',
      solid: null,
    },
    {
      name: 'languages',
      label: '翻譯',
      line: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
      solid: null,
    },
    {
      name: 'book',
      label: '字典',
      line: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      solid: null,
    },
  ],

  // 會員：人像 / 圓框人像 / 方框人像 / 證件卡
  member: [
    {
      name: 'user',
      label: '人像',
      line: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      solid: '<path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM3 21a9 9 0 0 1 18 0 1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    },
    {
      name: 'user-circle',
      label: '圓框人像',
      line: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5a6 6 0 0 1 11 0"/>',
      solid: null,
    },
    {
      name: 'user-square',
      label: '方框人像',
      line: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 19a5 5 0 0 1 10 0"/>',
      solid: null,
    },
    {
      name: 'id-card',
      label: '會員卡',
      line: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0"/><line x1="14" y1="10" x2="19" y2="10"/><line x1="14" y1="14" x2="19" y2="14"/>',
      solid: null,
    },
  ],

  // 購物車：購物車 / 提袋 / 提籃 / 商店
  cart: [
    {
      name: 'cart',
      label: '購物車',
      line: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
      solid: '<path d="M2 2a1 1 0 0 0 0 2h1.22l2.58 12.06A2.5 2.5 0 0 0 8.25 18h10a1 1 0 0 0 0-2H8.66a.5.5 0 0 1-.49-.4l-.2-.93h10.23a2 2 0 0 0 1.96-1.6l1.32-6.46A1 1 0 0 0 20.5 5H6.0l-.27-1.36A1.5 1.5 0 0 0 4.26 2H2z"/><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/>',
    },
    {
      name: 'bag',
      label: '提袋',
      line: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      solid: '<path d="M5 7h14a1 1 0 0 1 1 1.06l-.74 11.2A2 2 0 0 1 17.27 21H6.73a2 2 0 0 1-2-1.74L4 8.06A1 1 0 0 1 5 7zm3 0a4 4 0 0 1 8 0h-2a2 2 0 0 0-4 0H8z" fill-rule="evenodd"/>',
    },
    {
      name: 'basket',
      label: '提籃',
      line: '<path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4"/><path d="m9 11 1 9"/><path d="m15 11-1 9"/>',
      solid: null,
    },
    {
      name: 'store',
      label: '商店',
      line: '<path d="m2 7 2-4h16l2 4"/><path d="M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7"/><path d="M2 7h20"/>',
      solid: null,
    },
  ],

  // 我的最愛：愛心 / 星星 / 書籤 / 讚
  favorite: [
    {
      name: 'heart',
      label: '愛心',
      line: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      solid: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    },
    {
      name: 'star',
      label: '星星',
      line: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      solid: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    },
    {
      name: 'bookmark',
      label: '書籤',
      line: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
      solid: '<path d="M6 2a2 2 0 0 0-2 2v17.5a1 1 0 0 0 1.55.83L12 18l6.45 4.33A1 1 0 0 0 20 21.5V4a2 2 0 0 0-2-2H6z"/>',
    },
    {
      name: 'thumbs-up',
      label: '讚',
      line: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
      solid: '<path d="M7 10v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h4zm2 0 4.5-8.1a1 1 0 0 1 1.8.5L14.7 8H21a2 2 0 0 1 2 2.3l-1.4 9a2 2 0 0 1-2 1.7H9z"/>',
    },
  ],

  // 手機版「展開子選單」箭頭（給 HeaderExpandIcon 用；不在 HEADER_ICON_SLOTS，不走 navtool mask）
  // 預設指向右（▸），HeaderExpandIcon 在展開時用 CSS rotate 90° 變成朝下（▾）
  expand: [
    {
      name: 'chevron',
      label: '箭頭（細）',
      line: '<polyline points="9 6 15 12 9 18"/>',
      solid: '<path d="M8.5 4.5a1.5 1.5 0 0 0 0 2.12L13.88 12l-5.38 5.38a1.5 1.5 0 1 0 2.12 2.12l6.44-6.44a1.5 1.5 0 0 0 0-2.12L10.62 4.5a1.5 1.5 0 0 0-2.12 0z"/>',
    },
    {
      name: 'caret',
      label: '三角',
      line: '<path d="M9 5l7 7-7 7z"/>',
      solid: '<path d="M9 5l7 7-7 7z"/>',
    },
    {
      name: 'arrow',
      label: '箭號',
      line: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
      solid: '<path d="M4 11h12.17l-3.58-3.59L14 6l6 6-6 6-1.41-1.41L16.17 13H4z"/>',
    },
    {
      name: 'plus',
      label: '加號',
      line: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      solid: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    },
  ],
}

// 全庫攤平（給 name → icon 查找）
const ALL_ICONS = Object.values(HEADER_ICON_OPTIONS).flat()

// 某 slot 的選項清單（後台 grid 用）
export function headerIconOptions(slot) {
  return HEADER_ICON_OPTIONS[slot] || []
}

// 取某 icon 的完整 SVG。style='solid' 但無實心版 → 退回線條。color 預設 #000（mask 用）。
export function headerIconSvg(name, style = 'line', color = '#000') {
  const ic = ALL_ICONS.find((i) => i.name === name)
  if (!ic) return ''
  const useSolid = style === 'solid' && ic.solid
  const body = useSolid ? ic.solid : ic.line
  return useSolid
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">${body}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

// mask-image 用的 data-URI（給 app.vue 注入）
export function headerIconMaskUrl(name, style = 'line') {
  const svg = headerIconSvg(name, style, '#000')
  if (!svg) return ''
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// 某 icon 是否有實心版（後台 UI 提示用）
export function headerIconHasSolid(name) {
  const ic = ALL_ICONS.find((i) => i.name === name)
  return !!(ic && ic.solid)
}
