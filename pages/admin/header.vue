<script setup>
// /admin/header — Header 模組設定
//   - 版型切換（NUXT_PUBLIC_HEADER）
//   - LOGO 上傳 + 最大高度
//   - navtool icon 配置（AdminNavtool 元件 — per-Header preset）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, persisted, submitting, load, submit, setPreview, isDirtyKey, switchHeader, headerDirty } =
  useSiteSettings()

onMounted(load)

// ── Header 背景色 ───────────────────────────────────────────
// 值的三種型態：''＝版型預設、'transparent'＝透明、'#rrggbb' / 'rgba(r,g,b,a)'＝指定色
// 強制套用到所有狀態（含捲動後 / 內頁）— 注入邏輯在 app.vue
const parseColor = (v) => {
  if (!v || v === 'transparent') return { hex: '#000000', alpha: 100 }
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i)
  if (m) {
    const hex =
      '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
    return { hex, alpha: m[4] === undefined ? 100 : Math.round(parseFloat(m[4]) * 100) }
  }
  // #rgb → #rrggbb
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return { hex: '#' + v.slice(1).split('').map((c) => c + c).join(''), alpha: 100 }
  }
  return { hex: /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000', alpha: 100 }
}
const composeColor = (hex, alpha) => {
  if (alpha >= 100) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`
}

const _init = parseColor(state.headerBgColor)
const customHex = ref(_init.hex)
const customAlpha = ref(_init.alpha)

const bgMode = computed(() => {
  const v = state.headerBgColor || ''
  if (!v) return 'default'
  if (v === 'transparent') return 'transparent'
  return 'custom'
})

const setBgMode = (mode) => {
  if (mode === 'default') setPreview('headerBgColor', '')
  else if (mode === 'transparent') setPreview('headerBgColor', 'transparent')
  else setPreview('headerBgColor', composeColor(customHex.value, customAlpha.value))
}
const onBgColorInput = (hex) => {
  customHex.value = hex
  setPreview('headerBgColor', composeColor(hex, customAlpha.value))
}
const onBgAlphaInput = (a) => {
  customAlpha.value = a
  setPreview('headerBgColor', composeColor(customHex.value, a))
}

// ── 捲動後（.scroll）Header 背景色（與上面平行；'default' 模式＝沿用未捲動 bg、不覆寫） ──
const _initS = parseColor(state.headerBgColorScroll)
const customHexScroll = ref(_initS.hex)
const customAlphaScroll = ref(_initS.alpha)
const bgModeScroll = computed(() => {
  const v = state.headerBgColorScroll || ''
  if (!v) return 'default'
  if (v === 'transparent') return 'transparent'
  return 'custom'
})
const setBgModeScroll = (mode) => {
  if (mode === 'default') setPreview('headerBgColorScroll', '')
  else if (mode === 'transparent') setPreview('headerBgColorScroll', 'transparent')
  else setPreview('headerBgColorScroll', composeColor(customHexScroll.value, customAlphaScroll.value))
}
const onBgColorInputScroll = (hex) => {
  customHexScroll.value = hex
  setPreview('headerBgColorScroll', composeColor(hex, customAlphaScroll.value))
}
const onBgAlphaInputScroll = (a) => {
  customAlphaScroll.value = a
  setPreview('headerBgColorScroll', composeColor(customHexScroll.value, a))
}

// 選單（menu）顏色欄位（全站共用，留空＝版型預設）；def 僅為色票初始顯示值
const MENU_COLOR_FIELDS = [
  { key: 'headerMenuColor', name: '主選單文字色', def: '#333333' },
  { key: 'headerMenuHoverColor', name: '主選單滑過色', def: '#4fc08d' },
  { key: 'headerDropdownColor', name: '下拉文字色', def: '#333333' },
  { key: 'headerDropdownHoverColor', name: '下拉文字滑過色', def: '#4fc08d' },
  { key: 'headerDropdownBg', name: '下拉背景色', def: '#ffffff' },
  { key: 'headerDropdownItemBg', name: '下拉單項背景色', def: '#f6f8f9' },
  { key: 'headerDropdownItemHoverBg', name: '下拉單項滑過背景色', def: '#eef2f3' },
  { key: 'headerDropdownBorderColor', name: '下拉框線顏色', def: '#e5e7eb' },
  { key: 'headerDropdownItemBorderColor', name: '下拉單項框線顏色', def: '#e5e7eb' },
  { key: 'headerIconColor', name: '工具列圖示色', def: '#333333' },
  { key: 'headerIconHoverColor', name: '工具列圖示滑過色', def: '#4fc08d' },
  { key: 'headerIconBg', name: '工具列圖示背景色', def: '#ffffff' },
  { key: 'headerIconHoverBg', name: '工具列圖示滑過背景色', def: '#eef2f3' },
]
// 任一選單色有設值 → 顯示「全部回到預設」；一鍵把 6 個顏色全清回版型預設
const hasAnyMenuColor = computed(() => MENU_COLOR_FIELDS.some((f) => state[f.key]))
const resetMenuColors = () => MENU_COLOR_FIELDS.forEach((f) => setPreview(f.key, ''))

// 捲動後（header 加 .scroll）的選單顏色：與上面同一組欄位，key 後綴 Scroll；空＝沿用未捲動色。
// 給 Header09 / Header02 等「捲動會變色」的版型用 — 捲動後可套不同文字 / 背景 / 圖示色。
const SCROLL_MENU_COLOR_FIELDS = MENU_COLOR_FIELDS.map((f) => ({
  key: f.key + 'Scroll',
  name: f.name,
  def: f.def,
}))
const hasAnyScrollMenuColor = computed(() => SCROLL_MENU_COLOR_FIELDS.some((f) => state[f.key]))
const resetScrollMenuColors = () => SCROLL_MENU_COLOR_FIELDS.forEach((f) => setPreview(f.key, ''))
// 手動輸入 hex：失焦時若是純 hex 數字（漏打 #）自動補上；空＝交還版型預設
const onHexNormalize = (key, value) => {
  const v = (value || '').trim()
  if (v && !v.startsWith('#') && /^[0-9a-fA-F]{3,8}$/.test(v)) setPreview(key, '#' + v)
}

// 下拉圓角欄位（容器 / 項目，全站共用，留空＝版型預設）；def 僅為滑桿在「版型預設」時的顯示位置
const RADIUS_FIELDS = [
  { key: 'headerDropdownRadius', name: '下拉容器圓角', def: 8 },
  { key: 'headerDropdownItemRadius', name: '下拉項目圓角', def: 6 },
  { key: 'headerNavtoolDropdownRadius', name: '工具列下拉容器圓角', def: 8 },
  { key: 'headerNavtoolDropdownItemRadius', name: '工具列下拉項目圓角', def: 6 },
  { key: 'headerIconRadius', name: '工具列圖示背景圓角', def: 8 },
]

// 下拉內距與框線粗細（容器 / 單項，全站共用，留空＝版型預設）
const DROPDOWN_BOX_FIELDS = [
  { key: 'headerDropdownPaddingY', name: '下拉內距（上下）', def: 10 },
  { key: 'headerDropdownPaddingX', name: '下拉內距（左右）', def: 10 },
  { key: 'headerDropdownBorderWidth', name: '下拉框線粗細', def: 1 },
  { key: 'headerDropdownItemPaddingY', name: '單項內距（上下）', def: 8 },
  { key: 'headerDropdownItemPaddingX', name: '單項內距（左右）', def: 12 },
  { key: 'headerDropdownItemBorderWidth', name: '單項框線粗細', def: 0 },
]

// ── navtool 換 icon（line / 實心，全站共用；留空＝icons.scss 預設）────────────
// HEADER_ICON_SLOTS / headerIconOptions / headerIconSvg / headerIconHasSolid 由 utils/headerIcons 自動 import
const iconSel = (slot) => state.headerIcons?.[slot] || null
const setIcon = (slot, name, style) => {
  setPreview('headerIcons', { ...(state.headerIcons || {}), [slot]: { name, style } })
}
const clearIcon = (slot) => {
  const next = { ...(state.headerIcons || {}) }
  delete next[slot]
  setPreview('headerIcons', next)
}
// 預覽用 inline SVG（帶 currentColor，給 v-html）
const iconPreview = (name, style) => headerIconSvg(name, style, 'currentColor')
// 購物相關 slot：未開購物時標示「⚠ 需開購物」（與 navtool 設定一致）
const { enableShop } = useProject()
const SHOP_SLOTS = ['member', 'cart', 'favorite']

// ── 桌機第三層子選單呈現方式（flyout 向右飛出 / nested 同框內縮）────────────
const SUBMENU_STYLES = [
  { value: 'flyout', label: '向右飛出', hint: '滑到第二層項目，第三層往右側彈出浮層' },
  { value: 'nested', label: '同框內縮', hint: '第三層直接顯示在第二層下拉裡，往內縮排' },
]

// ── 「子選單展開」箭頭 icon（有子層時顯示；可選形狀 + 線條/實心）──────────────
// 桌機：第二層若有第三層 → 顯示此 icon（nested 模式點它展開）；手機：有子層項目右側顯示
const EXPAND_OPTIONS = headerIconOptions('expand')
const expandSel = computed(() => state.headerSubmenuIcon || {})
const expandName = computed(() => expandSel.value.name || 'chevron')
const expandStyle = computed(() => expandSel.value.style || 'line')
const setExpandIcon = (name, style) => setPreview('headerSubmenuIcon', { name, style })

// 全站共用欄位（logo / customCss 等）走 isDirtyKey；Header 各版型欄位走 headerDirty
const dirty = computed(
  () =>
    ['header', 'logo', 'logoMaxHeight', 'customCss'].some(isDirtyKey) || headerDirty.value,
)

const message = ref(null)
const onSubmit = async () => {
  const res = await submit()
  message.value = res.ok
    ? { type: 'success', text: '已寫回 site-settings.json 與 .env，站台立即生效。' }
    : { type: 'error', text: res.message }
}

// LOGO 上傳
const logoInput = ref(null)
const logoUploading = ref(false)
const logoMessage = ref(null)
const DEFAULT_LOGO = '/img/logo/logo-AD.svg'

const onLogoPick = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  logoUploading.value = true
  logoMessage.value = null
  try {
    const form = new FormData()
    form.append('logo', file)
    const res = await $fetch('/_admin/upload-logo', { method: 'POST', body: form })
    setPreview('logo', res.path)
    logoMessage.value = { type: 'success', text: `已上傳：${res.path}（按下方「提交」固化）` }
  } catch (err) {
    logoMessage.value = { type: 'error', text: err.statusMessage || err.message }
  } finally {
    logoUploading.value = false
    if (logoInput.value) logoInput.value.value = ''
  }
}
const onLogoReset = () => {
  setPreview('logo', '')
  logoMessage.value = { type: 'success', text: '已重置為預設 LOGO' }
}

// ── Header 即時預覽（iframe 固定桌機寬 + 等比縮放）──────────────────
// 用 <iframe> 嵌入 /admin/header-preview（只渲染 AppHeader）。iframe 固定 1920×1080，
// 內部 viewport＝桌機寬 → header 的 RWD 斷點走桌機版（目錄、社群不會被收進漢堡/隱藏），
// 再用外層 transform 等比縮放塞進預覽框。設定改動由 iframe 內的 storage 監聽即時同步。
// 市面熱門裝置尺寸（viewport 寬×高）；iframe 寬＝viewport 寬 → header RWD 走該斷點
const DEVICES = [
  // 桌機 / 筆電
  { key: 'pc27', name: '27吋螢幕', type: 'pc', w: 2560, h: 1440 },
  { key: 'pc', name: '桌機', type: 'pc', w: 1920, h: 1080 },
  { key: 'laptop', name: '筆電', type: 'pc', w: 1440, h: 900 },
  { key: 'macair', name: 'Mac Air', type: 'pc', w: 1280, h: 800 },
  // 平板（可切直/橫）— 尺寸以直式存，橫式自動對調
  { key: 'ipadPro', name: 'iPad Pro', type: 'tablet', w: 1024, h: 1366 },
  { key: 'galaxyTabS', name: '三星 Tab S', type: 'tablet', w: 800, h: 1280 },
  { key: 'ipad', name: 'iPad', type: 'tablet', w: 768, h: 1024 },
  { key: 'ipadMini', name: 'iPad mini', type: 'tablet', w: 744, h: 1133 },
  // iPhone 各系列
  { key: 'iphoneSE', name: 'iPhone SE', type: 'phone', w: 375, h: 667 },
  { key: 'iphoneMini', name: 'iPhone mini', type: 'phone', w: 375, h: 812 },
  { key: 'iphone', name: 'iPhone 14/15', type: 'phone', w: 390, h: 844 },
  { key: 'iphonePro', name: 'iPhone 15 Pro', type: 'phone', w: 393, h: 852 },
  { key: 'iphoneProMax', name: 'iPhone ProMax', type: 'phone', w: 430, h: 932 },
  // 三星各系列
  { key: 'galaxySsmall', name: 'Galaxy S(最小)', type: 'phone', w: 360, h: 640 },
  { key: 'galaxyS', name: 'Galaxy S', type: 'phone', w: 360, h: 800 },
  { key: 'galaxyUltra', name: 'Galaxy S Ultra', type: 'phone', w: 412, h: 915 },
  { key: 'galaxyA', name: 'Galaxy A', type: 'phone', w: 360, h: 780 },
  { key: 'galaxyFold', name: 'Galaxy Z Fold(折)', type: 'phone', w: 344, h: 882 },
]
const deviceKey = ref('pc')
const device = computed(() => DEVICES.find((d) => d.key === deviceKey.value) || DEVICES[0])

// 方向：true＝橫版（寬高對調）；平板與手機可切，桌機固定橫
const landscape = ref(false)
const canRotate = computed(() => device.value.type !== 'pc')
const effDims = computed(() => {
  const d = device.value
  if (canRotate.value && landscape.value) {
    return { w: Math.max(d.w, d.h), h: Math.min(d.w, d.h) }
  }
  return { w: d.w, h: d.h }
})
const previewBox = ref(null)
const boxW = ref(900)
const calcPreview = () => {
  if (!import.meta.client || !previewBox.value) return
  boxW.value = previewBox.value.clientWidth
}
// 縮放規則：裝置寬 ≤ 預覽框寬 → 用「實際 1:1 尺寸」（例 744×1133 就照原尺寸、置中）；
// 比框還寬（桌機 / 27吋 / 平板橫…）才等比縮小塞進框寬。高度一律顯示全高（不裁切）。
const scale = computed(() => Math.min(1, boxW.value / effDims.value.w))
const frameLeft = computed(() => Math.max(0, (boxW.value - effDims.value.w * scale.value) / 2))

// 預覽是否可互動（hover 看下拉 / 點擊測試）；預設鎖定，避免誤點 nav 連結讓 iframe 跳頁
const previewInteractive = ref(false)
// 強制展開下拉（不用 hover 也能看下拉樣式效果）；切換時改 iframe src 的 ?dropdown 參數
const previewShowDropdown = ref(false)
const previewSrc = computed(
  () => '/admin/header-preview' + (previewShowDropdown.value ? '?dropdown=1' : ''),
)

const previewBoxStyle = computed(() => ({ height: effDims.value.h * scale.value + 'px' }))
const previewFrameStyle = computed(() => ({
  width: effDims.value.w + 'px',
  height: effDims.value.h + 'px',
  transform: `scale(${scale.value})`,
  marginLeft: frameLeft.value + 'px',
}))
onMounted(() => {
  nextTick(calcPreview)
  if (import.meta.client) window.addEventListener('resize', calcPreview)
})
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('resize', calcPreview)
})

const codeHint = `/* LOGO 高度也可這樣覆寫（預設由 logoMaxHeight 控） */
.site-logo { height: 60px; }

/* 只在 Header02 套用特殊樣式 */
.header02 .site-logo { filter: drop-shadow(0 2px 4px rgba(0,0,0,.2)); }

/* Header 整條換背景 */
.header01 { background: #f5f5f5; }`
</script>

<template>
  <div class="page">
    <h1 class="page__title">Header 模組</h1>
    <p class="page__desc">
      切換 Header 版型、上傳 LOGO、配置 navtool 6 個 icon。
      <strong>navtool 設定 per-Header 獨立保存</strong> — 切版型即看到該版的 toggle / 排序。
    </p>

    <!-- Header 即時預覽（縮放實際 AppHeader 派發器） -->
    <section class="page__section header-preview-section">
      <h2 class="page__section-title">
        Header 即時預覽 <em class="field__live">即時預覽</em>
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          :class="{ 'is-on': previewShowDropdown }"
          @click="previewShowDropdown = !previewShowDropdown"
        >
          {{ previewShowDropdown ? '▾ 下拉展開中' : '▾ 顯示下拉' }}
        </button>
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          :class="{ 'is-on': previewInteractive }"
          @click="previewInteractive = !previewInteractive"
        >
          {{ previewInteractive ? '🖱 可互動中（點此鎖定）' : '🔒 已鎖定（點此可互動）' }}
        </button>
      </h2>
      <p class="page__desc" style="margin-bottom: 12px">
        下方為目前設定的實際 Header（版型 / LOGO / navtool icon・文字 / 顏色），改任何設定即時反映。
        點「顯示下拉」可一鍵展開所有下拉（搜尋 / 語系 / 子選單）直接看樣式效果；
        切「可互動」則能在預覽內 hover / 點擊測試（點到 nav 連結會讓預覽跳頁，重整即可）。
      </p>
      <div class="device-bar">
        <button
          v-for="d in DEVICES"
          :key="d.key"
          type="button"
          class="device-bar__btn"
          :class="{ 'is-on': deviceKey === d.key }"
          @click="deviceKey = d.key"
        >
          {{ d.name }}<span class="device-bar__dim">{{ d.w }}×{{ d.h }}</span>
        </button>
      </div>
      <div v-if="canRotate" class="device-bar">
        <button
          type="button"
          class="device-bar__btn"
          :class="{ 'is-on': !landscape }"
          @click="landscape = false"
        >
          直版<span class="device-bar__dim">{{ Math.min(device.w, device.h) }}×{{ Math.max(device.w, device.h) }}</span>
        </button>
        <button
          type="button"
          class="device-bar__btn"
          :class="{ 'is-on': landscape }"
          @click="landscape = true"
        >
          橫版<span class="device-bar__dim">{{ Math.max(device.w, device.h) }}×{{ Math.min(device.w, device.h) }}</span>
        </button>
      </div>
      <div ref="previewBox" class="header-preview" :style="previewBoxStyle">
        <ClientOnly>
          <iframe
            class="header-preview__frame"
            :class="{ 'is-interactive': previewInteractive }"
            :src="previewSrc"
            title="Header 即時預覽"
            :style="previewFrameStyle"
          ></iframe>
        </ClientOnly>
      </div>
    </section>

    <!-- Header 版型 -->
    <div class="grid">
      <label class="field field--full">
        <span class="field__label">Header 版型 <em class="field__live">即時預覽</em></span>
        <select :value="state.header" @change="switchHeader($event.target.value)">
          <option v-for="h in options.headers" :key="h" :value="h">{{ h }}</option>
        </select>
      </label>

      <!-- LOGO 上傳 -->
      <div class="field field--full">
        <span class="field__label">站台 LOGO <em class="field__live">即時預覽</em></span>
        <div class="logo-uploader">
          <div class="logo-uploader__preview">
            <SiteLogo alt="logo preview" />
          </div>
          <div class="logo-uploader__controls">
            <p class="logo-uploader__current">
              目前：<code>{{ state.logo || DEFAULT_LOGO + '（預設）' }}</code>
            </p>
            <div class="logo-uploader__actions">
              <label class="btn btn--ghost btn--sm">
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp"
                  hidden
                  @change="onLogoPick"
                />
                {{ logoUploading ? '上傳中…' : '選檔上傳' }}
              </label>
              <button
                v-if="state.logo"
                type="button"
                class="btn btn--ghost btn--sm"
                @click="onLogoReset"
              >
                改回預設
              </button>
            </div>
            <p class="field__hint">支援 jpg / png / svg / gif / webp，限 2 MB。存到 <code>public/img/logo/</code></p>
          </div>
        </div>
        <p
          v-if="logoMessage"
          :class="['msg', `msg--${logoMessage.type}`]"
        >
          {{ logoMessage.text }}
        </p>
      </div>

      <!-- LOGO 高度 -->
      <label class="field field--full">
        <span class="field__label">LOGO 最大高度 <em class="field__live">即時預覽</em></span>
        <div class="height-input">
          <input
            type="range"
            min="20"
            max="120"
            step="1"
            :value="state.logoMaxHeight"
            @input="setPreview('logoMaxHeight', Number($event.target.value) || 66)"
          />
          <div class="height-input__num">
            <input
              type="number"
              min="20"
              max="200"
              :value="state.logoMaxHeight"
              @input="setPreview('logoMaxHeight', Number($event.target.value) || 66)"
            />
            <span>px</span>
          </div>
        </div>
        <span class="field__hint">寬度自動；常用 40 ~ 80</span>
      </label>

      <!-- Header 背景色（全站共用，強制套用所有狀態） -->
      <div class="field field--full">
        <span class="field__label">Header 背景色 <em class="field__live">即時預覽</em></span>
        <div class="bg-picker">
          <div class="bg-picker__modes">
            <label :class="{ 'is-on': bgMode === 'default' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'default'"
                @change="setBgMode('default')"
              />
              版型預設
            </label>
            <label :class="{ 'is-on': bgMode === 'transparent' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'transparent'"
                @change="setBgMode('transparent')"
              />
              透明
            </label>
            <label :class="{ 'is-on': bgMode === 'custom' }">
              <input
                type="radio"
                name="bgmode"
                :checked="bgMode === 'custom'"
                @change="setBgMode('custom')"
              />
              指定顏色
            </label>
          </div>

          <div v-if="bgMode === 'custom'" class="bg-picker__custom">
            <input
              type="color"
              :value="customHex"
              @input="onBgColorInput($event.target.value)"
            />
            <div class="bg-picker__alpha">
              <span>不透明度</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="customAlpha"
                @input="onBgAlphaInput(Number($event.target.value))"
              />
              <span class="bg-picker__alpha-num">{{ customAlpha }}%</span>
            </div>
            <code class="bg-picker__val">{{ state.headerBgColor }}</code>
          </div>
        </div>
        <span class="field__hint">
          強制套用到所有狀態（含內頁）。<strong>透明</strong>可讓 header 疊在 banner 上；
          <strong>版型預設</strong>＝交還給版型自身設計（含原本捲動變色效果）。
          捲動後想換別的底色 → 用下方「捲動後 Header 背景色」。
        </span>
      </div>

      <!-- 捲動後（.scroll）Header 背景色：捲動後可換不同底色；沿用未捲動＝不覆寫 -->
      <div class="field field--full">
        <span class="field__label">捲動後 Header 背景色 <em class="field__live">即時預覽</em></span>
        <div class="bg-picker">
          <div class="bg-picker__modes">
            <label :class="{ 'is-on': bgModeScroll === 'default' }">
              <input
                type="radio"
                name="bgmode-scroll"
                :checked="bgModeScroll === 'default'"
                @change="setBgModeScroll('default')"
              />
              沿用未捲動
            </label>
            <label :class="{ 'is-on': bgModeScroll === 'transparent' }">
              <input
                type="radio"
                name="bgmode-scroll"
                :checked="bgModeScroll === 'transparent'"
                @change="setBgModeScroll('transparent')"
              />
              透明
            </label>
            <label :class="{ 'is-on': bgModeScroll === 'custom' }">
              <input
                type="radio"
                name="bgmode-scroll"
                :checked="bgModeScroll === 'custom'"
                @change="setBgModeScroll('custom')"
              />
              指定顏色
            </label>
          </div>

          <div v-if="bgModeScroll === 'custom'" class="bg-picker__custom">
            <input
              type="color"
              :value="customHexScroll"
              @input="onBgColorInputScroll($event.target.value)"
            />
            <div class="bg-picker__alpha">
              <span>不透明度</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="customAlphaScroll"
                @input="onBgAlphaInputScroll(Number($event.target.value))"
              />
              <span class="bg-picker__alpha-num">{{ customAlphaScroll }}%</span>
            </div>
            <code class="bg-picker__val">{{ state.headerBgColorScroll }}</code>
          </div>
        </div>
        <span class="field__hint">
          只在「header 捲動後加上 <code>.scroll</code>」時套用（例如 Header09 / Header02）。
          <strong>沿用未捲動</strong>＝不覆寫，捲動後沿用上面那組背景色。
        </span>
      </div>

      <!-- 選單（menu）顏色：文字色 / 滑過色 / 下拉背景色（全站共用，留空＝版型預設） -->
      <div class="field field--full">
        <span class="field__label">
          選單顏色 <em class="field__live">即時預覽</em>
          <button
            v-if="hasAnyMenuColor"
            type="button"
            class="btn btn--ghost btn--sm"
            @click="resetMenuColors"
          >
            全部回到預設
          </button>
        </span>
        <div class="menu-colors">
          <div v-for="f in MENU_COLOR_FIELDS" :key="f.key" class="menu-colors__row">
            <span class="menu-colors__name">{{ f.name }}</span>
            <input
              type="color"
              :value="state[f.key] || f.def"
              @input="setPreview(f.key, $event.target.value)"
            />
            <input
              type="text"
              class="menu-colors__hex"
              :value="state[f.key]"
              placeholder="版型預設"
              spellcheck="false"
              maxlength="25"
              @input="setPreview(f.key, $event.target.value)"
              @change="onHexNormalize(f.key, $event.target.value)"
            />
            <button
              v-if="state[f.key]"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="setPreview(f.key, '')"
            >
              回到預設
            </button>
          </div>
        </div>
        <span class="field__hint">
          套用到所有版型的選單連結與下拉子選單；留空＝交還版型自身配色。
          下拉文字色與主選單文字色分開控制。
        </span>
      </div>

      <!-- 捲動後（.scroll）選單顏色：同上每個欄位，捲動後可套不同色；留空＝沿用上面未捲動色 -->
      <div class="field field--full">
        <span class="field__label">
          捲動後選單顏色 <em class="field__live">即時預覽</em>
          <button
            v-if="hasAnyScrollMenuColor"
            type="button"
            class="btn btn--ghost btn--sm"
            @click="resetScrollMenuColors"
          >
            全部回到預設
          </button>
        </span>
        <div class="menu-colors">
          <div v-for="f in SCROLL_MENU_COLOR_FIELDS" :key="f.key" class="menu-colors__row">
            <span class="menu-colors__name">{{ f.name }}</span>
            <input
              type="color"
              :value="state[f.key] || f.def"
              @input="setPreview(f.key, $event.target.value)"
            />
            <input
              type="text"
              class="menu-colors__hex"
              :value="state[f.key]"
              placeholder="沿用未捲動色"
              spellcheck="false"
              maxlength="25"
              @input="setPreview(f.key, $event.target.value)"
              @change="onHexNormalize(f.key, $event.target.value)"
            />
            <button
              v-if="state[f.key]"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="setPreview(f.key, '')"
            >
              回到預設
            </button>
          </div>
        </div>
        <span class="field__hint">
          只在「header 捲動後加上 <code>.scroll</code>」時套用（例如 Header09 / Header02 捲動會變色的版型）。
          每個欄位留空＝沿用上面「選單顏色」那組（未捲動）的值。
        </span>
      </div>

      <!-- 下拉圓角：容器 / 項目（全站共用，留空＝版型預設） -->
      <div class="field field--full">
        <span class="field__label">下拉圓角（直角 ↔ 圓角）<em class="field__live">即時預覽</em></span>
        <div class="menu-colors">
          <div v-for="f in RADIUS_FIELDS" :key="f.key" class="menu-colors__row">
            <span class="menu-colors__name">{{ f.name }}</span>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              :value="state[f.key] === '' ? f.def : state[f.key]"
              @input="setPreview(f.key, Number($event.target.value))"
            />
            <div class="menu-colors__num">
              <input
                type="number"
                min="0"
                max="100"
                :value="state[f.key] === '' ? '' : state[f.key]"
                placeholder="預設"
                @input="setPreview(f.key, $event.target.value === '' ? '' : Number($event.target.value))"
              />
              <span>px</span>
            </div>
            <button
              v-if="state[f.key] !== ''"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="setPreview(f.key, '')"
            >
              回到預設
            </button>
          </div>
        </div>
        <span class="field__hint">
          0＝直角、數字越大越圓。套用所有版型的下拉容器與項目（含搜尋 / 語系浮層）；留空＝版型預設。
        </span>
      </div>

      <!-- 下拉內距與框線粗細：容器 / 單項（框線顏色在上方「選單顏色」區） -->
      <div class="field field--full">
        <span class="field__label">下拉內距・框線粗細 <em class="field__live">即時預覽</em></span>
        <div class="menu-colors">
          <div v-for="f in DROPDOWN_BOX_FIELDS" :key="f.key" class="menu-colors__row">
            <span class="menu-colors__name">{{ f.name }}</span>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              :value="state[f.key] === '' ? f.def : state[f.key]"
              @input="setPreview(f.key, Number($event.target.value))"
            />
            <div class="menu-colors__num">
              <input
                type="number"
                min="0"
                max="100"
                :value="state[f.key] === '' ? '' : state[f.key]"
                placeholder="預設"
                @input="setPreview(f.key, $event.target.value === '' ? '' : Number($event.target.value))"
              />
              <span>px</span>
            </div>
            <button
              v-if="state[f.key] !== ''"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="setPreview(f.key, '')"
            >
              回到預設
            </button>
          </div>
        </div>
        <span class="field__hint">
          下拉「容器」與「單項」的內距（上下 / 左右）與框線粗細；框線「顏色」在上方「選單顏色」區。
          框線粗細 0＝無框；留空＝版型預設。
        </span>
      </div>

      <!-- navtool 換 icon（line / 實心，全站共用） -->
      <div class="field field--full">
        <span class="field__label">工具列圖示（可換、線條 / 實心）<em class="field__live">即時預覽</em></span>
        <div class="icon-picker">
          <div v-for="s in HEADER_ICON_SLOTS" :key="s.slot" class="icon-picker__slot">
            <div class="icon-picker__head">
              <span class="icon-picker__name">{{ s.label }}</span>
              <span
                v-if="SHOP_SLOTS.includes(s.slot)"
                class="icon-picker__shop"
                :class="{ 'is-warn': !enableShop }"
                :title="enableShop ? '購物功能已啟用' : '需先啟用購物功能此圖示才會顯示在站台'"
              >
                {{ enableShop ? '購物' : '⚠ 需開購物' }}
              </span>
              <div class="icon-picker__style">
                <button
                  type="button"
                  :class="{ on: (iconSel(s.slot)?.style || 'line') === 'line' }"
                  @click="setIcon(s.slot, iconSel(s.slot)?.name || s.def, 'line')"
                >
                  線條
                </button>
                <button
                  type="button"
                  :class="{ on: iconSel(s.slot)?.style === 'solid' }"
                  @click="setIcon(s.slot, iconSel(s.slot)?.name || s.def, 'solid')"
                >
                  實心
                </button>
              </div>
              <button
                v-if="iconSel(s.slot)"
                type="button"
                class="btn btn--ghost btn--sm"
                @click="clearIcon(s.slot)"
              >
                回到預設
              </button>
            </div>
            <div class="icon-picker__grid">
              <button
                v-for="ic in headerIconOptions(s.slot)"
                :key="ic.name"
                type="button"
                class="icon-picker__opt"
                :class="{ on: iconSel(s.slot)?.name === ic.name }"
                :title="ic.label + (headerIconHasSolid(ic.name) ? '' : '（無實心版，選實心會退回線條）')"
                @click="setIcon(s.slot, ic.name, iconSel(s.slot)?.style || 'line')"
                v-html="iconPreview(ic.name, iconSel(s.slot)?.style || 'line')"
              ></button>
            </div>
          </div>
        </div>
        <span class="field__hint">
          每個工具列圖示可換成庫內任一 icon，並切「線條 / 實心」兩版（部分圖無實心版，選實心會自動退回線條）。
          留空＝用版型預設圖示；全站 16 版型共用。
        </span>
      </div>

      <!-- 主選單文字大小 -->
      <label class="field field--full">
        <span class="field__label">主選單文字大小 <em class="field__live">即時預覽</em></span>
        <div class="height-input">
          <input
            type="range"
            min="12"
            max="28"
            step="1"
            :value="state.headerMenuFontSize || 16"
            @input="setPreview('headerMenuFontSize', Number($event.target.value))"
          />
          <div class="height-input__num">
            <input
              type="number"
              min="10"
              max="40"
              :value="state.headerMenuFontSize ?? ''"
              placeholder="預設"
              @input="setPreview('headerMenuFontSize', $event.target.value === '' ? '' : Number($event.target.value))"
            />
            <span>px</span>
          </div>
          <button
            v-if="state.headerMenuFontSize !== '' && state.headerMenuFontSize != null"
            type="button"
            class="btn btn--ghost btn--sm"
            @click="setPreview('headerMenuFontSize', '')"
          >
            回到預設
          </button>
        </div>
        <span class="field__hint">主選單（最上層連結）文字大小；留空＝版型預設。套用所有版型。</span>
      </label>

      <!-- 桌機第三層子選單呈現方式 -->
      <div class="field field--full">
        <span class="field__label">桌機第三層子選單 <em class="field__live">即時預覽</em></span>
        <div class="submenu-style">
          <label
            v-for="opt in SUBMENU_STYLES"
            :key="opt.value"
            :class="{ 'is-on': (state.headerSubmenuStyle || 'flyout') === opt.value }"
          >
            <input
              type="radio"
              name="submenustyle"
              :checked="(state.headerSubmenuStyle || 'flyout') === opt.value"
              @change="setPreview('headerSubmenuStyle', opt.value)"
            />
            <strong>{{ opt.label }}</strong>
            <span>{{ opt.hint }}</span>
          </label>
        </div>
        <span class="field__hint">
          選單第二層底下若還有第三層，要「往右側飛出浮層」或「在同一個下拉框內往內縮排展開」。套用所有版型。
        </span>
      </div>

      <!-- 子選單展開箭頭 icon（形狀 + 線條/實心）— 有子層時自動顯示 -->
      <div class="field field--full">
        <span class="field__label">子選單展開箭頭 <em class="field__live">即時預覽</em></span>
        <div class="expand-picker">
          <div class="expand-picker__style">
            <button
              type="button"
              :class="{ on: expandStyle === 'line' }"
              @click="setExpandIcon(expandName, 'line')"
            >
              線條
            </button>
            <button
              type="button"
              :class="{ on: expandStyle === 'solid' }"
              @click="setExpandIcon(expandName, 'solid')"
            >
              實心
            </button>
          </div>
          <div class="expand-picker__grid">
            <button
              v-for="ic in EXPAND_OPTIONS"
              :key="ic.name"
              type="button"
              class="expand-picker__opt"
              :class="{ on: expandName === ic.name }"
              :title="ic.label"
              @click="setExpandIcon(ic.name, expandStyle)"
              v-html="iconPreview(ic.name, expandStyle)"
            ></button>
          </div>
        </div>
        <span class="field__hint">
          有子層的項目會自動顯示這顆箭頭。桌機「同框內縮」模式與手機版：點箭頭展開/收合子層（文字本身仍是連結），展開時自動旋轉朝下；桌機「向右飛出」模式：箭頭僅作有子選單的指示。
        </span>
      </div>

      <!-- 展開箭頭位置（絕對定位）+ 邊距 -->
      <div class="field field--full">
        <span class="field__label">箭頭位置 <em class="field__live">即時預覽</em></span>
        <div class="submenu-style">
          <label :class="{ 'is-on': (state.headerSubmenuIconPos || 'right') === 'left' }">
            <input
              type="radio"
              name="iconpos"
              :checked="(state.headerSubmenuIconPos || 'right') === 'left'"
              @change="setPreview('headerSubmenuIconPos', 'left')"
            />
            <strong>靠左</strong>
            <span>icon 靠左、文字置中</span>
          </label>
          <label :class="{ 'is-on': (state.headerSubmenuIconPos || 'right') === 'right' }">
            <input
              type="radio"
              name="iconpos"
              :checked="(state.headerSubmenuIconPos || 'right') === 'right'"
              @change="setPreview('headerSubmenuIconPos', 'right')"
            />
            <strong>靠右</strong>
            <span>文字靠左、icon 靠右</span>
          </label>
        </div>
        <div class="height-input" style="margin-top: 10px">
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            :value="state.headerSubmenuIconOffset ?? 8"
            @input="setPreview('headerSubmenuIconOffset', Number($event.target.value))"
          />
          <div class="height-input__num">
            <input
              type="number"
              min="0"
              max="80"
              :value="state.headerSubmenuIconOffset ?? 8"
              @input="setPreview('headerSubmenuIconOffset', Number($event.target.value) || 0)"
            />
            <span>px</span>
          </div>
        </div>
        <span class="field__hint">箭頭採絕對定位，不會擠壓文字。可調與該側邊緣的距離（px）。套用所有版型。</span>
      </div>
    </div>

    <div class="actions">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="!dirty || submitting"
        @click="onSubmit"
      >
        {{ submitting ? '寫入中…' : dirty ? '提交寫回 site-settings.json + .env' : '無變動' }}
      </button>
    </div>

    <p
      v-if="message"
      :class="['msg', `msg--${message.type}`]"
    >
      {{ message.text }}
    </p>

    <!-- 自訂 CSS — 全域注入，可覆寫 .site-logo / .headerXX 等 -->
    <section class="page__section">
      <h2 class="page__section-title">自訂 CSS <em class="field__live">即時預覽</em></h2>
      <p class="page__desc" style="margin-bottom: 12px">
        輸入純 CSS，會即時注入到站台 <code>&lt;head&gt;</code>。可覆寫 LOGO / Header 任何樣式 — 例如：
      </p>
      <pre class="code-hint">{{ codeHint }}</pre>
      <textarea
        class="css-editor"
        :value="state.customCss"
        spellcheck="false"
        placeholder=".site-logo { ... }"
        @input="setPreview('customCss', $event.target.value)"
      ></textarea>
    </section>

    <!-- navtool 配置（per-Header） -->
    <section class="page__section">
      <AdminNavtool />
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

// 裝置尺寸切換列
.device-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.device-bar__btn {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  background: #1a1f2a;
  color: #c8cfdb;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: #232a38; }
  &.is-on {
    background: #4fc08d;
    border-color: #4fc08d;
    color: #0f1218;
    font-weight: 600;
  }
}
.device-bar__dim {
  font-size: 10px;
  opacity: 0.7;
}

// Header 即時預覽框（嵌入裝置尺寸的 iframe 再等比縮放）
.header-preview {
  position: relative;
  overflow: hidden;
  border: 1px solid #2a3242;
  border-radius: 8px;
  background: #141a26;
}
.header-preview__frame {
  transform-origin: top left;
  border: 0;
  pointer-events: none; // 預設鎖定，避免誤點 nav 連結或觸發下拉
  background: transparent;

  &.is-interactive {
    pointer-events: auto; // 切「可互動」後可在預覽內 hover / 點擊
  }
}

// 預覽「可互動」切換鈕：開啟時綠底提示
.page__section-title .btn.is-on {
  background: #4fc08d;
  border-color: #4fc08d;
  color: #0f1218;
}

.logo-uploader {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    min-width: 120px;
    min-height: 80px;
    background: #fff;
    border-radius: 6px;
    flex-shrink: 0;

    .site-logo { display: block; }
  }

  &__controls { flex: 1; min-width: 0; }

  &__current {
    font-size: 12px;
    color: #c8cfdb;
    margin-bottom: 8px;
    word-break: break-all;

    code {
      background: #0f1218;
      padding: 1px 6px;
      border-radius: 3px;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
}

.code-hint {
  background: #0f1218;
  color: #6a7382;
  border: 1px solid #232a38;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 12px;
  overflow-x: auto;
}

.css-editor {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  background: #1a1f2a;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
}

.menu-colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__name {
    min-width: 80px;
    font-size: 13px;
    color: #c8cfdb;
  }

  input[type='color'] {
    width: 48px;
    height: 32px;
    padding: 0;
    background: none;
    border: 1px solid #2a3242;
    border-radius: 6px;
    cursor: pointer;
  }
  code {
    min-width: 96px;
    padding: 3px 8px;
    background: #0f1218;
    color: #6a7382;
    border-radius: 4px;
    font-size: 12px;
  }

  &__hex {
    width: 110px;
    padding: 5px 8px;
    background: #0f1218;
    color: #e6e9ef;
    border: 1px solid #2a3242;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    text-transform: lowercase;

    &::placeholder { color: #5b6472; text-transform: none; }

    &:focus {
      outline: 1px solid #4fc08d;
      border-color: #4fc08d;
    }
  }

  input[type='range'] {
    flex: 1;
    cursor: pointer;
  }

  &__num {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 78px;
    padding: 0 8px 0 4px;
    background: #0f1218;
    border: 1px solid #2a3242;
    border-radius: 4px;

    input[type='number'] {
      width: 44px;
      padding: 5px 2px;
      background: transparent;
      color: #e6e9ef;
      border: none;
      outline: none;
      font: inherit;
      font-size: 12px;
      text-align: right;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button { appearance: none; margin: 0; }
    }
    span { font-size: 11px; color: #6a7382; }
  }
}

.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;

  &__slot {
    border-bottom: 1px solid #232a38;
    padding-bottom: 12px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  &__name {
    min-width: 72px;
    font-size: 13px;
    color: #c8cfdb;
  }

  &__shop {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 99px;
    background: rgba(79, 192, 141, 0.12);
    color: #6dd6a3;

    &.is-warn {
      background: rgba(255, 184, 0, 0.12);
      color: #d4b170;
    }
  }

  &__style {
    display: inline-flex;
    border: 1px solid #2a3242;
    border-radius: 6px;
    overflow: hidden;

    button {
      padding: 4px 10px;
      font-size: 12px;
      background: #0f1218;
      color: #8a93a3;
      border: none;
      cursor: pointer;

      &.on {
        background: #4fc08d;
        color: #0f1218;
      }
    }
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  &__opt {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #0f1218;
    border: 1px solid #2a3242;
    border-radius: 6px;
    color: #c8cfdb;
    cursor: pointer;

    :deep(svg) {
      width: 20px;
      height: 20px;
    }

    &:hover {
      border-color: #4fc08d;
    }
    &.on {
      border-color: #4fc08d;
      color: #4fc08d;
      background: #14241d;
    }
  }
}

.submenu-style {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  label {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    background: #1a1f2a;
    border: 1px solid #2a3242;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    strong { font-size: 13px; color: #c8cfdb; }
    span { font-size: 11px; color: #6a7382; }

    input { display: none; }

    &.is-on {
      border-color: #4fc08d;
      background: #14241d;
      strong { color: #6dd6a3; }
    }
  }
}

.expand-picker {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 14px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;
}
.expand-picker__style {
  display: inline-flex;
  border: 1px solid #2a3242;
  border-radius: 6px;
  overflow: hidden;

  button {
    padding: 6px 12px;
    font-size: 12px;
    background: #0f1218;
    color: #8a93a3;
    border: none;
    cursor: pointer;

    &.on {
      background: #4fc08d;
      color: #0f1218;
    }
  }
}
.expand-picker__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.expand-picker__opt {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f1218;
  border: 1px solid #2a3242;
  border-radius: 6px;
  color: #c8cfdb;
  cursor: pointer;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }

  &:hover { border-color: #4fc08d; }
  &.on {
    border-color: #4fc08d;
    color: #4fc08d;
    background: #14241d;
  }
}

.bg-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__modes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #1a1f2a;
      border: 1px solid #2a3242;
      border-radius: 6px;
      font-size: 13px;
      color: #c8cfdb;
      cursor: pointer;
      transition: all 0.2s;

      &.is-on {
        border-color: #4fc08d;
        color: #fff;
      }

      input { accent-color: #4fc08d; cursor: pointer; }
    }
  }

  &__custom {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 12px 14px;
    background: #1a1f2a;
    border: 1px solid #2a3242;
    border-radius: 8px;

    input[type='color'] {
      width: 48px;
      height: 36px;
      padding: 0;
      background: none;
      border: 1px solid #2a3242;
      border-radius: 6px;
      cursor: pointer;
    }
  }

  &__alpha {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #7a8896;

    input[type='range'] {
      width: 140px;
      height: 4px;
      background: #2a3242;
      border-radius: 4px;
      appearance: none;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        background: #4fc08d;
        border-radius: 50%;
        cursor: pointer;
      }
      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #4fc08d;
        border: none;
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }

  &__alpha-num {
    min-width: 38px;
    color: #c8cfdb;
  }

  &__val {
    margin-left: auto;
    padding: 4px 10px;
    background: #0f1218;
    color: #6a7382;
    border-radius: 4px;
    font-size: 12px;
  }
}

.height-input {
  display: flex;
  align-items: center;
  gap: 14px;

  input[type='range'] {
    flex: 1;
    height: 4px;
    background: #2a3242;
    border-radius: 4px;
    appearance: none;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #4fc08d;
      border-radius: 50%;
      cursor: pointer;
    }
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #4fc08d;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  &__num {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #1a1f2a;
    border: 1px solid #2a3242;
    border-radius: 6px;
    padding: 0 10px 0 4px;

    input[type='number'] {
      width: 56px;
      padding: 7px 4px;
      background: transparent;
      color: #e6e9ef;
      border: none;
      outline: none;
      font: inherit;
      text-align: right;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button { appearance: none; margin: 0; }
    }
    span { font-size: 12px; color: #7a8896; }
  }
}
</style>
