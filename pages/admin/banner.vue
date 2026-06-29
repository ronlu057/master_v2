<script setup>
// /admin/banner — Banner 模組設定
//   1) 版型切換（PageBanner / BlockBanner）— 走 site-settings
//   2) 首頁 Banner 內容編輯（BlockBanner01）— 多則 slide、背景圖上傳（裁切到比例）、標題/副標/說明文 + AI 生成、
//      圖片 alt、背景影片（YT/上傳）、按鈕文字/連結；即時預覽；送出寫回 banners.json（Banner API）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

const { state, options, submitting, load: loadSettings, submit, setPreview, isDirtyKey, switchBlockBanner, bannerDirty } =
  useSiteSettings()

// 即時預覽元件：依目前選取的 BlockBanner 版型動態切換（與站台 BlockBanner 派發器同機制）
const blockBannerVariants = import.meta.glob('../../components/banners/BlockBanner*.vue', {
  eager: true,
})
const currentBlockBanner = computed(
  () =>
    blockBannerVariants[`../../components/banners/${state.blockBanner}.vue`]?.default ||
    Object.values(blockBannerVariants)[0]?.default,
)
// 此版型是否「真的會渲染背景影片」（元件以 defineOptions({ supportsVideo:true }) 標記）；
// 不會播影片的版型 → 後台不顯示影片欄位、存檔也不寫影片（與前端一致）
const layoutSupportsVideo = (name) =>
  !!blockBannerVariants[`../../components/banners/${name}.vue`]?.default?.supportsVideo
const currentSupportsVideo = computed(() => layoutSupportsVideo(state.blockBanner))
// 此版型主標是否支援「大字 span 前綴」（元件以 defineOptions({ supportsTitleSpan:true }) 標記）
const currentSupportsTitleSpan = computed(
  () => !!currentBlockBanner.value?.supportsTitleSpan,
)
// 此版型是否有「第四行備註」（如 BlockBanner03 的「代理…」）
const currentSupportsNote = computed(() => !!currentBlockBanner.value?.supportsNote)
// 此版型是否有「左側產品圖（去背）」可上傳（元件以 defineOptions({ leftImage:{hint} }) 標記）
const currentLeftImage = computed(() => currentBlockBanner.value?.leftImage || null)
// 每則「文字顏色」可調欄位（順序對齊上方文字欄位：標題大字 → 標題 → 副標 → 說明文）
const slideColorFields = computed(() => {
  const base = []
  if (currentSupportsTitleSpan.value) base.push({ key: 'titleSpanColor', name: '標題大字' })
  base.push(
    { key: 'titleColor', name: '標題' },
    { key: 'subtitleColor', name: '副標' },
    { key: 'memoColor', name: '說明文' },
  )
  return base
})

// Banner 文字顏色（全站共用，留空＝交還版型預設）；def 僅為色票初始顯示值
const BANNER_COLOR_FIELDS = [
  { key: 'bannerTitleColor', name: '標題', def: '#ffffff' },
  { key: 'bannerSubtitleColor', name: '副標', def: '#ffffff' },
  { key: 'bannerMemoColor', name: '說明文', def: '#ffffff' },
]
const hasAnyBannerColor = computed(() => BANNER_COLOR_FIELDS.some((f) => state[f.key]))
const resetBannerColors = () => BANNER_COLOR_FIELDS.forEach((f) => setPreview(f.key, ''))

// 輪播箭頭按鈕：icon（沿用 header 的 expand 箭頭組）/ 線條·實心 / 大小 / 圓角
const NAV_ICON_OPTIONS = headerIconOptions('expand')
const navIconName = computed(() => state.bannerNavIcon?.name || 'chevron')
const navIconStyle = computed(() => state.bannerNavIcon?.style || 'line')
const setNavIcon = (name, style) => setPreview('bannerNavIcon', { name, style })
const navIconPreview = (name, style) => headerIconSvg(name, style, 'currentColor')

// 背景色（含透明度）：hex + alpha ↔ rgba
const parseHexAlpha = (v) => {
  const m = (v || '').match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i)
  if (m) {
    const hex = '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
    return { hex, alpha: m[4] === undefined ? 100 : Math.round(parseFloat(m[4]) * 100) }
  }
  return { hex: /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000', alpha: v ? 100 : 28 }
}
const composeRgba = (hex, alpha) => {
  if (alpha >= 100) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`
}
const _navBgInit = parseHexAlpha(state.bannerNavBg)
const navBgHex = ref(_navBgInit.hex)
const navBgAlpha = ref(_navBgInit.alpha)
const onNavBgColor = (hex) => {
  navBgHex.value = hex
  setPreview('bannerNavBg', composeRgba(hex, navBgAlpha.value))
}
const onNavBgAlpha = (a) => {
  navBgAlpha.value = a
  setPreview('bannerNavBg', composeRgba(navBgHex.value, a))
}

// 箭頭色（含透明度）：hex + alpha ↔ rgba；空＝預設白色、不透明
const _navColorInit = parseHexAlpha(state.bannerNavColor)
const navColorHex = ref(state.bannerNavColor ? _navColorInit.hex : '#ffffff')
const navColorAlpha = ref(state.bannerNavColor ? _navColorInit.alpha : 100)
const onNavColor = (hex) => {
  navColorHex.value = hex
  setPreview('bannerNavColor', composeRgba(hex, navColorAlpha.value))
}
const onNavColorAlpha = (a) => {
  navColorAlpha.value = a
  setPreview('bannerNavColor', composeRgba(navColorHex.value, a))
}
const resetNavColor = () => {
  navColorHex.value = '#ffffff'
  navColorAlpha.value = 100
  setPreview('bannerNavColor', '')
}

const dirtyVer = computed(
  () => ['pageBanner', 'blockBanner'].some(isDirtyKey) || bannerDirty.value,
)
const verMessage = ref(null)
const onSubmitVer = async () => {
  const res = await submit()
  verMessage.value = res.ok
    ? { type: 'success', text: '已寫回，站台立即生效。' }
    : { type: 'error', text: res.message }
}

// ── 首頁 Banner 內容（banners.json 的 home → rows）──────────────
const SAMPLE_IMG = 'https://picsum.photos/seed/banner-new/1920/911'

// <br> ↔ 換行 互轉（編輯時用換行、存檔時用 <br>）
const toEdit = (s) => (s || '').replace(/<br\s*\/?>/gi, '\n')
const toStore = (s) => (s || '').replace(/\n/g, '<br>')

// ── 多語系（標題 / 副標 / 說明文）─────────────────────────────
// 文字以多語系物件 { tw,en,jp,kr } 存；編輯用語系分頁切換，改繁中（失焦）自動翻譯其餘啟用語系。
const ALL_LOCALES = [
  { code: 'tw', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'jp', label: '日本語' },
  { code: 'kr', label: '한국어' },
]
const LANGS = ALL_LOCALES.map((l) => l.code)
const enabledLocales = computed(() => {
  const en =
    Array.isArray(state.enabledLangs) && state.enabledLangs.length ? state.enabledLangs : LANGS
  return ALL_LOCALES.filter((l) => en.includes(l.code))
})
// 繁中以外的啟用語系（給「🌐 多語」展開用）
const otherLangs = computed(() => enabledLocales.value.filter((l) => l.code !== 'tw'))
// 各欄位「多語」展開狀態（key = `${slideIndex}:${field}`）
const openFields = reactive(new Set())
const fieldKey = (i, key) => `${i}:${key}`
const isFieldOpen = (i, key) => openFields.has(fieldKey(i, key))
const toggleField = (i, key) => {
  const k = fieldKey(i, key)
  openFields.has(k) ? openFields.delete(k) : openFields.add(k)
}
// 多語系文字欄位（繁中為主，其餘語系展開覆寫）。
// 支援「大字 span」的版型（BlockBanner03）會在標題前多一個 titleSpan 欄位（前綴大字）。
const TEXT_FIELDS = computed(() => {
  const base = [
    { key: 'title', label: '標題', rows: 2, ph: '主標（可換行）' },
    { key: 'subtitle', label: '副標', rows: 2, ph: '副標（可換行）' },
    { key: 'memo', label: '說明文', rows: 3, ph: '說明文（可換行）' },
  ]
  if (currentSupportsTitleSpan.value) {
    base.unshift({ key: 'titleSpan', label: '標題大字（前綴 span）', rows: 1, ph: '例：GDT（會以大字顯示，接在標題前）' })
  }
  if (currentSupportsNote.value) {
    base.push({ key: 'note', label: '備註（第四行）', rows: 2, ph: '例：代理：Weiss company、JTEKT KOYO、同飛製冷' })
  }
  return base
})
// 字串(舊資料) / 物件 → 編輯用多語系物件（每語系 <br> 轉換行）
const toLangEdit = (v) => {
  const o = {}
  for (const l of LANGS) o[l] = ''
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const l of LANGS) o[l] = toEdit(v[l] || '')
  } else {
    o.tw = toEdit(v || '')
  }
  return o
}
// 編輯用多語系物件 → 存檔（每語系換行轉 <br>；只留有值的語系）
const toLangStore = (o) => {
  const r = {}
  for (const l of LANGS) {
    const s = toStore(o?.[l] || '')
    if (s) r[l] = s
  }
  return r
}
const emptyLang = () => {
  const o = {}
  for (const l of LANGS) o[l] = ''
  return o
}

// 圖片 alt 的 SEO 判斷（每則）：有填→OK；沒填但有標題→以標題替代；都沒→警告
const altStatus = (row) => {
  if ((row.alt || '').trim()) return { type: 'ok', text: '✓ 已設定圖片 alt' }
  // title 為多語系物件 { tw,en,jp,kr }（或舊字串）→ 任一語系有值即視為有標題
  const t = row.title
  const hasTitle =
    t && typeof t === 'object' ? Object.values(t).some((v) => (v || '').trim()) : (t || '').trim()
  if (hasTitle) return { type: 'info', text: 'ℹ 未填 alt，前台會以標題作為替代文字' }
  return { type: 'warn', text: '⚠ 無 alt 也無標題，建議補上（利於圖片 SEO）' }
}

const bannersDoc = ref(null) // banners.json 完整物件（送出時整包寫回，保留 page/common/news）
const rows = ref([]) // 編輯中的 slides（目前版型）
const topic = ref('') // AI 生成共用主題/關鍵字
const videoUrl = ref('') // 目前版型背景影片（YouTube 連結，block 層級、非每則）
const videoFile = ref('') // 目前版型上傳影片檔路徑（YT 連結為空時改用 HTML5 播放）
const loading = ref(true)
const contentMsg = ref(null)
const savingContent = ref(false)
// 每個 BlockBanner 版型各自的內容草稿（編輯中、未提交）：{ [版型名]: { rows(編輯格式), videoUrl, videoFile } }
const contentByLayout = ref({})

// 首頁 Banner 內容即時預覽（編輯中 → 站台即時套用、免存檔/重整；預覽島可「確定/清除」）
const { set: setBannerPreview, clear: clearBannerPreview, preview: bannerPreview, load: loadBannerPreview } =
  useBannerPreview()
const nuxtApp = useNuxtApp()

// 後端 row（store 格式：title 等為多語系物件、<br>）→ 編輯格式（lang 物件、換行）
const toEditRow = (r) => ({
  image: { pc: r.image?.pc || '', mb: r.image?.mb || '' },
  product: { pc: r.product?.pc || '', mb: r.product?.mb || '' }, // 左側產品去背圖（BlockBanner03 等）
  productAlt: r.productAlt || '', // 左側產品圖替代文字（SEO）
  alt: r.alt || '', // 圖片替代文字（SEO）
  topic: '', // 每則 AI 關鍵字（僅供生成用，不寫回）
  title: toLangEdit(r.title),
  titleSpan: toLangEdit(r.titleSpan), // 主標大字前綴（僅 BlockBanner03 等支援版型）
  subtitle: toLangEdit(r.subtitle),
  memo: toLangEdit(r.memo),
  note: toLangEdit(r.note), // 第四行備註（僅 BlockBanner03 等支援版型）
  // 每則自訂文字色（空＝交還全站後台色／版型預設）
  titleColor: r.titleColor || '',
  titleSpanColor: r.titleSpanColor || '', // 標題大字（span）色，僅 BlockBanner03 等支援版型
  subtitleColor: r.subtitleColor || '',
  memoColor: r.memoColor || '',
  btnText: r.btnText || '',
  link: r.link || '',
})
// 解析後內容 { rows, videoUrl, videoFile } → 編輯格式內容
const toEditContent = (c) => ({
  rows: (c?.rows || []).map(toEditRow),
  videoUrl: c?.videoUrl || '',
  videoFile: c?.videoFile || '',
})
// 目前編輯區 → 草稿快照（深拷貝，避免之後編輯反向污染草稿）
const snapshotEditor = () => ({
  rows: JSON.parse(JSON.stringify(rows.value)),
  videoUrl: videoUrl.value,
  videoFile: videoFile.value,
})
// 把某版型的草稿載入編輯區（深拷貝；沒有就是空內容）
const applyContentToEditor = (name) => {
  const c = contentByLayout.value[name] || { rows: [], videoUrl: '', videoFile: '' }
  rows.value = JSON.parse(JSON.stringify(c.rows || []))
  videoUrl.value = c.videoUrl || ''
  videoFile.value = c.videoFile || ''
}

// 首頁 banner 內容來源 = 獨立 Banner API（banners.json 的 home：每版型一份 byLayout + 共用 news）
const loadContent = async () => {
  loading.value = true
  try {
    const res = await $fetch('/_admin/mock?name=banners')
    bannersDoc.value = res.parsed
    loadBannerPreview()
    const home = res.parsed?.home || {}
    // 建每版型編輯草稿：有 byLayout 就逐版型收；舊資料（頂層 rows）→ 歸到目前啟用版型
    const draft = {}
    if (home.byLayout && typeof home.byLayout === 'object') {
      for (const [name, c] of Object.entries(home.byLayout)) draft[name] = toEditContent(c)
    } else if ((home.rows && home.rows.length) || home.videoUrl || home.videoFile) {
      draft[state.blockBanner] = toEditContent(home)
    }
    // 若有未確認的站台預覽，且它正是「目前版型」的預覽 → 以預覽為目前版型來源（與站台一致）
    if (bannerPreview.value && bannerPreview.value._layout === state.blockBanner) {
      draft[state.blockBanner] = toEditContent(bannerPreview.value)
    }
    contentByLayout.value = draft
    applyContentToEditor(state.blockBanner)
  } catch (e) {
    contentMsg.value = { type: 'error', text: `讀取 banners.json 失敗：${e.data?.message || e.statusMessage || e.message}` }
  } finally {
    loading.value = false
  }
}

// 切換版型：先把目前編輯區存回舊版型草稿，再載入新版型草稿（內容各自獨立、互不影響）
watch(
  () => state.blockBanner,
  (newL, oldL) => {
    if (loading.value || newL === oldL) return
    if (oldL) contentByLayout.value[oldL] = snapshotEditor()
    applyContentToEditor(newL)
  },
)

onMounted(() => {
  loadSettings()
  loadContent()
})

const addRow = () => {
  rows.value.push({
    image: { pc: SAMPLE_IMG, mb: '' },
    product: { pc: '', mb: '' },
    productAlt: '',
    alt: '',
    topic: '',
    title: emptyLang(),
    titleSpan: emptyLang(),
    subtitle: emptyLang(),
    memo: emptyLang(),
    note: emptyLang(),
    titleColor: '',
    titleSpanColor: '',
    subtitleColor: '',
    memoColor: '',
    btnText: '',
    link: '',
  })
}
const removeRow = (i) => rows.value.splice(i, 1)
const moveRow = (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= rows.value.length) return
  const [r] = rows.value.splice(i, 1)
  rows.value.splice(j, 0, r)
}

// 背景圖目標比例（沿用 1920:911）；輸出寬度固定 2560，高度「按比例」換算（≈1215，非固定 911）
const BANNER_RATIO = 1920 / 911
const BANNER_TARGET_W = 2560
const BANNER_TARGET_H = Math.round(BANNER_TARGET_W / BANNER_RATIO)

// 背景圖：選檔 → 開啟互動式裁切器（BannerImageCropper）→ 套用後上傳裁切結果（2560 × 按比例高）
const uploadingIdx = ref(-1)
const cropTarget = ref(null) // { file, index }：裁切器開啟中

const onPickImage = (i, e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  cropTarget.value = { file, index: i }
}

const onCropConfirm = async (blob) => {
  const target = cropTarget.value
  cropTarget.value = null
  if (!target || !blob) return
  const i = target.index
  uploadingIdx.value = i
  let uploaded = false
  try {
    const form = new FormData()
    form.append('image', blob, target.file.name)
    const res = await $fetch('/_admin/upload-banner', { method: 'POST', body: form })
    rows.value[i].image = { pc: res.path, mb: res.path }
    uploaded = true
    contentMsg.value = {
      type: 'success',
      text: `第 ${i + 1} 則背景圖已上傳（${BANNER_TARGET_W}×${BANNER_TARGET_H}），AI 辨識 alt 中…`,
    }
  } catch (err) {
    contentMsg.value = { type: 'error', text: err.data?.message || err.statusMessage || err.message }
  } finally {
    uploadingIdx.value = -1
  }
  // 上傳成功 → 自動以 AI 辨識圖片內容填入 alt（best-effort，不影響上傳結果）
  if (uploaded) recognizeAlt(i)
}

// 左側產品去背圖：限 PNG / SVG，不裁切原圖上傳（→ product.pc / product.mb）
const uploadingProductIdx = ref(-1)
const onPickProduct = async (i, e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!['image/png', 'image/svg+xml'].includes(file.type)) {
    contentMsg.value = { type: 'error', text: '左側產品圖只能上傳 PNG 或 SVG（需去背透明）' }
    return
  }
  uploadingProductIdx.value = i
  try {
    const form = new FormData()
    form.append('image', file, file.name)
    const res = await $fetch('/_admin/upload-banner-asset', { method: 'POST', body: form })
    rows.value[i].product = { pc: res.path, mb: res.path }
    contentMsg.value = { type: 'success', text: `第 ${i + 1} 則左側產品圖已上傳，AI 辨識 alt 中…` }
    if (res.path.startsWith('/img/')) recognizeProductAlt(i) // best-effort 自動辨識 alt
  } catch (err) {
    contentMsg.value = { type: 'error', text: err.data?.message || err.statusMessage || err.message }
  } finally {
    uploadingProductIdx.value = -1
  }
}
const clearProduct = (i) => {
  rows.value[i].product = { pc: '', mb: '' }
  rows.value[i].productAlt = ''
}

// 左側產品圖 AI 辨識 alt（僅本機上傳的 /img 圖）
const aiProductAltBusy = ref(-1)
const recognizeProductAlt = async (i) => {
  const pc = rows.value[i]?.product?.pc || ''
  if (!pc.startsWith('/img/')) {
    contentMsg.value = { type: 'error', text: 'AI 辨識僅支援本機上傳的圖片（請先上傳產品圖）' }
    return
  }
  aiProductAltBusy.value = i
  try {
    const res = await $fetch('/_admin/ai-alt', { method: 'POST', body: { path: pc } })
    if (res.alt) {
      rows.value[i].productAlt = res.alt
      contentMsg.value = { type: 'success', text: `第 ${i + 1} 則左側產品圖 alt 已由 AI 辨識填入：「${res.alt}」` }
    }
  } catch (err) {
    contentMsg.value = { type: 'error', text: `alt 辨識失敗：${err.data?.message || err.statusMessage || err.message}` }
  } finally {
    aiProductAltBusy.value = -1
  }
}

// AI 圖片辨識 → 自動填 alt（僅支援本機上傳的 /img 圖；外部 URL 無法讀檔辨識）
const aiAltBusy = ref(-1)
const recognizeAlt = async (i) => {
  const pc = rows.value[i]?.image?.pc || ''
  if (!pc.startsWith('/img/')) {
    contentMsg.value = { type: 'error', text: 'AI 辨識僅支援本機上傳的圖片（請先上傳一張）' }
    return
  }
  aiAltBusy.value = i
  try {
    const res = await $fetch('/_admin/ai-alt', { method: 'POST', body: { path: pc } })
    if (res.alt) {
      rows.value[i].alt = res.alt
      contentMsg.value = { type: 'success', text: `第 ${i + 1} 則 alt 已由 AI 辨識填入：「${res.alt}」` }
    }
  } catch (err) {
    contentMsg.value = { type: 'error', text: `alt 辨識失敗：${err.data?.message || err.statusMessage || err.message}` }
  } finally {
    aiAltBusy.value = -1
  }
}

// 背景影片上傳（mp4/webm/ogg → public/video/banner）；YT 連結留空時前台改播此檔
const uploadingVideo = ref(false)
const onPickVideo = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingVideo.value = true
  try {
    const form = new FormData()
    form.append('video', file)
    const res = await $fetch('/_admin/upload-banner-video', { method: 'POST', body: form })
    videoFile.value = res.path
    contentMsg.value = { type: 'success', text: '背景影片已上傳（YT 連結留空時生效；按下方送出固化）' }
  } catch (err) {
    contentMsg.value = { type: 'error', text: err.data?.message || err.statusMessage || err.message }
  } finally {
    uploadingVideo.value = false
    e.target.value = ''
  }
}
const clearVideoFile = () => {
  videoFile.value = ''
}

// AI 一鍵生成（Gemini）— 依關鍵字一次產出該則的標題+副標+內文（連貫）
const aiBusyAll = ref(-1)
const aiGenAll = async (i) => {
  aiBusyAll.value = i
  try {
    const res = await $fetch('/_admin/ai-generate', {
      method: 'POST',
      body: { field: 'all', topic: rows.value[i].topic || topic.value, context: { lang: '繁體中文' } },
    })
    if (res.title) rows.value[i].title.tw = res.title
    if (res.subtitle) rows.value[i].subtitle.tw = res.subtitle
    if (res.memo) rows.value[i].memo.tw = res.memo
    // 此版型的額外欄位（BlockBanner03：標題大字 / 備註）也一起生成
    const extras = []
    if (currentSupportsTitleSpan.value) extras.push('titleSpan')
    if (currentSupportsNote.value) extras.push('note')
    for (const k of extras) {
      try {
        const r2 = await $fetch('/_admin/ai-generate', {
          method: 'POST',
          body: {
            field: k,
            topic: rows.value[i].topic || topic.value,
            context: { title: rows.value[i].title.tw, lang: '繁體中文' },
          },
        })
        if (r2.text) rows.value[i][k].tw = r2.text
      } catch {
        /* 額外欄位生成失敗不影響主流程 */
      }
    }
  } catch (err) {
    contentMsg.value = { type: 'error', text: `AI 生成失敗：${err.data?.message || err.statusMessage || err.message}` }
  } finally {
    aiBusyAll.value = -1
  }
}

// AI 生成（Gemini）— 針對某則的某欄位
const aiBusy = ref('') // `${i}:${field}`
const aiGen = async (i, field) => {
  const tag = `${i}:${field}`
  aiBusy.value = tag
  try {
    const res = await $fetch('/_admin/ai-generate', {
      method: 'POST',
      body: {
        field,
        topic: rows.value[i].topic || topic.value,
        context: {
          title: rows.value[i].title.tw,
          subtitle: rows.value[i].subtitle.tw,
          lang: '繁體中文',
        },
      },
    })
    rows.value[i][field].tw = res.text
  } catch (err) {
    contentMsg.value = { type: 'error', text: `AI 生成失敗：${err.data?.message || err.statusMessage || err.message}` }
  } finally {
    aiBusy.value = ''
  }
}

// 繁中 → 其餘啟用語系 自動翻譯（Gemini，dev-only）
const translatingField = reactive({}) // `${i}:${field}` → bool
// 核心：把第 i 則的 field（繁中）翻成其餘啟用語系
const translateOne = async (i, field) => {
  const row = rows.value[i]
  const text = (row?.[field]?.tw || '').trim()
  const targets = enabledLocales.value.map((l) => l.code).filter((c) => c !== 'tw')
  if (!text || !targets.length) return
  const tag = `${i}:${field}`
  translatingField[tag] = true
  try {
    const res = await $fetch('/_admin/ai-translate', {
      method: 'POST',
      body: { text, source: 'tw', targets },
    })
    const tr = res?.translations || {}
    for (const c of targets) if (tr[c]) row[field][c] = tr[c]
  } catch (e) {
    contentMsg.value = {
      type: 'error',
      text: `自動翻譯失敗：${e?.data?.message || e?.statusMessage || e?.message || '未知錯誤'}`,
    }
  } finally {
    translatingField[tag] = false
  }
}
// 按鈕觸發：一次翻該則的 標題 + 副標 + 說明文（一律從繁中翻）
const translatingRow = reactive({}) // i → bool
const translateRow = async (i) => {
  translatingRow[i] = true
  try {
    await Promise.all(['title', 'subtitle', 'memo'].map((f) => translateOne(i, f)))
  } finally {
    translatingRow[i] = false
  }
}

// 即時預覽用 rows（取繁中、換行轉 <br>）— 給後台自身 BlockBanner01 預覽框
const previewRows = computed(() =>
  rows.value.map((r) => ({
    image: r.image?.pc ? r.image : { pc: SAMPLE_IMG, mb: '' },
    product: r.product || { pc: '', mb: '' },
    alt: r.alt,
    title: toStore(r.title.tw || ''),
    titleSpan: toStore(r.titleSpan?.tw || ''),
    subtitle: toStore(r.subtitle.tw || ''),
    memo: toStore(r.memo.tw || ''),
    note: toStore(r.note?.tw || ''),
    titleColor: r.titleColor || '',
    titleSpanColor: r.titleSpanColor || '',
    subtitleColor: r.subtitleColor || '',
    memoColor: r.memoColor || '',
    btnText: r.btnText,
    link: r.link,
  })),
)

// 編輯格式 row → 存檔格式 row（多語系物件；前台 BlockBanner 依站台語系自行解析）
const toStoreRow = (r) => ({
  image: r.image?.pc ? r.image : { pc: SAMPLE_IMG, mb: '' },
  ...(r.product?.pc ? { product: { pc: r.product.pc, mb: r.product.mb || r.product.pc } } : {}),
  ...(r.productAlt ? { productAlt: r.productAlt.trim() } : {}),
  alt: (r.alt || '').trim(),
  title: toLangStore(r.title),
  ...(r.titleSpan && Object.keys(toLangStore(r.titleSpan)).length
    ? { titleSpan: toLangStore(r.titleSpan) }
    : {}),
  subtitle: toLangStore(r.subtitle),
  memo: toLangStore(r.memo),
  ...(r.note && Object.keys(toLangStore(r.note)).length ? { note: toLangStore(r.note) } : {}),
  ...(r.titleColor ? { titleColor: r.titleColor } : {}),
  ...(r.titleSpanColor ? { titleSpanColor: r.titleSpanColor } : {}),
  ...(r.subtitleColor ? { subtitleColor: r.subtitleColor } : {}),
  ...(r.memoColor ? { memoColor: r.memoColor } : {}),
  btnText: r.btnText || '',
  link: r.link || '',
})
// 存檔 / 站台預覽用 rows（目前版型）
const storeRows = computed(() => rows.value.map(toStoreRow))

// 預覽用：把每則自訂色注入 <head>（與站台 BlockBanner 派發器同機制；不用行內 :style）
useHead(() => {
  const css = bannerRowColorCss(previewRows.value)
  return css ? { style: [{ children: css }] } : {}
})

// 編輯中即時寫入「站台預覽」（debounce）→ 前台 BlockBanner 即時套用、預覽島出現可確定/清除
let previewTimer = null
watch(
  [rows, videoUrl, videoFile],
  () => {
    if (loading.value) return // 初次載入不算編輯
    if (previewTimer) clearTimeout(previewTimer)
    previewTimer = setTimeout(() => {
      setBannerPreview({
        rows: storeRows.value, // 多語系物件，前台依站台語系解析
        videoUrl: videoUrl.value,
        videoFile: videoFile.value,
        news: bannersDoc.value?.home?.news || [],
        _layout: state.blockBanner, // 標記這份預覽屬於哪個版型，避免套到別的版型
      })
    }, 250)
  },
  { deep: true },
)

// 送出：把「每個版型各自的內容」整包寫回 banners.json 的 home.byLayout（保留 news / page / common）
const saveContent = async () => {
  if (!bannersDoc.value) return
  savingContent.value = true
  try {
    // 目前編輯區先存回草稿，再把所有版型草稿轉存檔格式
    contentByLayout.value[state.blockBanner] = snapshotEditor()
    const byLayout = {}
    for (const [name, c] of Object.entries(contentByLayout.value)) {
      const canVideo = layoutSupportsVideo(name) // 不會播影片的版型 → 不寫影片，保持前後端一致
      byLayout[name] = {
        rows: (c.rows || []).map(toStoreRow),
        videoUrl: canVideo ? (c.videoUrl || '').trim() : '',
        videoFile: canVideo ? (c.videoFile || '').trim() : '',
      }
    }
    const doc = bannersDoc.value
    doc.home = { news: doc.home?.news || [], byLayout } // 丟掉舊頂層 rows/video，改以 byLayout 為準
    await $fetch('/_admin/mock', { method: 'POST', body: { name: 'banners', content: doc } })
    // 已固化 → 清掉站台預覽、重抓 banner（refreshNuxtData 需 Nuxt context，await 後已遺失 → runWithContext 包）
    // 並廣播其他分頁重抓（其預覽也會因清除而落回剛存檔的資料）
    if (import.meta.client) {
      clearBannerPreview()
      await nuxtApp.runWithContext(() => refreshNuxtData(['banner-home', 'home-banner']))
      localStorage.setItem('master_v2_mock_broadcast', String(Date.now()))
    }
    contentMsg.value = { type: 'success', text: '已寫回 banners.json，前台 Banner 已即時更新（含其他分頁）。' }
  } catch (e) {
    contentMsg.value = { type: 'error', text: `寫回失敗：${e.data?.message || e.statusMessage || e.message}` }
  } finally {
    savingContent.value = false
  }
}

// ── 即時預覽縮放（BlockBanner01 為 100vw×100vh，依預覽框寬等比縮放）────────
const previewBox = ref(null)
const scale = ref(0.25)
const winH = ref(900)
const calcScale = () => {
  if (!previewBox.value || !import.meta.client) return
  scale.value = previewBox.value.clientWidth / window.innerWidth
  winH.value = window.innerHeight
}
onMounted(() => {
  nextTick(calcScale)
  if (import.meta.client) window.addEventListener('resize', calcScale)
})
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('resize', calcScale)
})
</script>

<template>
  <div class="page">
    <h1 class="page__title">Banner 模組</h1>

    <!-- 1) 版型切換 -->
    <section class="block">
      <h2 class="block__h">版型切換</h2>
      <div class="grid">
        <label class="field field--full">
          <span class="field__label">PageBanner（內頁 hero） <em class="field__live">即時預覽</em></span>
          <select :value="state.pageBanner" @change="setPreview('pageBanner', $event.target.value)">
            <option v-for="b in options.pageBanners" :key="b" :value="b">{{ b }}</option>
          </select>
        </label>
        <label class="field field--full">
          <span class="field__label">BlockBanner（首頁輪播） <em class="field__live">即時預覽</em></span>
          <select :value="state.blockBanner" @change="switchBlockBanner($event.target.value)">
            <option v-for="b in options.blockBanners" :key="b" :value="b">{{ b }}</option>
          </select>
          <span class="field__hint">
            下面的文字顏色、箭頭、圓點等設定<strong>每個版型各自記一組</strong>；切換版型會自動帶出該版型自己的設定，互不影響。
          </span>
        </label>
      </div>

      <!-- Banner 文字顏色（全站共用，留空＝交還版型預設）-->
      <div class="field field--full">
        <span class="field__label">
          文字顏色（標題 / 副標 / 說明文） <em class="field__live">即時預覽</em>
          <button
            v-if="hasAnyBannerColor"
            type="button"
            class="btn btn--ghost btn--sm"
            @click="resetBannerColors"
          >
            全部回到預設
          </button>
        </span>
        <div class="color-rows">
          <div v-for="f in BANNER_COLOR_FIELDS" :key="f.key" class="color-rows__row">
            <span class="color-rows__name">{{ f.name }}</span>
            <input type="color" :value="state[f.key] || f.def" @input="setPreview(f.key, $event.target.value)" />
            <code>{{ state[f.key] || '版型預設' }}</code>
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
        <span class="field__hint">套用到所有 BlockBanner 版型的標題 / 副標 / 說明文；留空＝交還版型自身配色。</span>
      </div>

      <!-- 上一則 / 下一則 箭頭按鈕開關 -->
      <div class="field field--full">
        <span class="field__label">輪播箭頭按鈕（上一則 / 下一則）<em class="field__live">即時預覽</em></span>
        <label class="nav-switch">
          <input
            type="checkbox"
            :checked="state.bannerNav"
            @change="setPreview('bannerNav', $event.target.checked)"
          />
          <span>{{ state.bannerNav ? '顯示' : '隱藏' }}</span>
        </label>
        <span class="field__hint">
          在 Banner 左右顯示可點的上一則 / 下一則箭頭；只有一張時自動不顯示。套用所有 BlockBanner 版型。
        </span>
      </div>

      <!-- 箭頭樣式：icon（線條/實心）+ 大小 + 圓角 -->
      <div v-if="state.bannerNav" class="field field--full">
        <span class="field__label">箭頭按鈕樣式 <em class="field__live">即時預覽</em></span>
        <div class="nav-style">
          <div class="nav-style__seg">
            <button type="button" :class="{ on: navIconStyle === 'line' }" @click="setNavIcon(navIconName, 'line')">
              線條
            </button>
            <button type="button" :class="{ on: navIconStyle === 'solid' }" @click="setNavIcon(navIconName, 'solid')">
              實心
            </button>
          </div>
          <div class="nav-style__icons">
            <button
              v-for="ic in NAV_ICON_OPTIONS"
              :key="ic.name"
              type="button"
              class="nav-style__opt"
              :class="{ on: navIconName === ic.name }"
              :title="ic.label"
              @click="setNavIcon(ic.name, navIconStyle)"
              v-html="navIconPreview(ic.name, navIconStyle)"
            ></button>
          </div>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">大小</span>
          <input
            type="range"
            min="28"
            max="80"
            step="1"
            :value="state.bannerNavSize ?? 50"
            @input="setPreview('bannerNavSize', Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="20"
            max="120"
            :value="state.bannerNavSize ?? 50"
            @input="setPreview('bannerNavSize', Number($event.target.value) || 50)"
          />
          <span class="nav-range__unit">px</span>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">圓角</span>
          <input
            type="range"
            min="0"
            max="999"
            step="1"
            :value="state.bannerNavRadius ?? 999"
            @input="setPreview('bannerNavRadius', Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="0"
            max="999"
            :value="state.bannerNavRadius ?? 999"
            @input="setPreview('bannerNavRadius', Number($event.target.value) || 0)"
          />
          <span class="nav-range__unit">px</span>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">距邊界</span>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            :value="state.bannerNavGap ?? 24"
            @input="setPreview('bannerNavGap', Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="0"
            max="200"
            :value="state.bannerNavGap ?? 24"
            @input="setPreview('bannerNavGap', Number($event.target.value) || 0)"
          />
          <span class="nav-range__unit">px</span>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">線粗細</span>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            :value="state.bannerNavThickness || 4"
            @input="setPreview('bannerNavThickness', Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="1"
            max="20"
            placeholder="自動"
            :value="state.bannerNavThickness"
            @input="setPreview('bannerNavThickness', $event.target.value === '' ? '' : Number($event.target.value) || '')"
          />
          <span class="nav-range__unit">px</span>
          <button
            v-if="state.bannerNavThickness !== '' && state.bannerNavThickness != null"
            type="button"
            class="mini"
            @click="setPreview('bannerNavThickness', '')"
          >
            自動
          </button>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">箭頭大小</span>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            :value="state.bannerNavIconSize ?? 56"
            @input="setPreview('bannerNavIconSize', Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="10"
            max="100"
            :value="state.bannerNavIconSize ?? 56"
            @input="setPreview('bannerNavIconSize', Number($event.target.value) || 56)"
          />
          <span class="nav-range__unit">%</span>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">箭頭色</span>
          <input type="color" :value="navColorHex" @input="onNavColor($event.target.value)" />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="navColorAlpha"
            @input="onNavColorAlpha(Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="0"
            max="100"
            :value="navColorAlpha"
            @input="onNavColorAlpha(Number($event.target.value) || 0)"
          />
          <span class="nav-range__unit">%</span>
          <button v-if="state.bannerNavColor" type="button" class="mini" @click="resetNavColor">
            預設
          </button>
        </div>
        <div class="nav-range">
          <span class="nav-range__lbl">底色</span>
          <input type="color" :value="navBgHex" @input="onNavBgColor($event.target.value)" />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="navBgAlpha"
            @input="onNavBgAlpha(Number($event.target.value))"
          />
          <input
            type="number"
            class="nav-range__num"
            min="0"
            max="100"
            :value="navBgAlpha"
            @input="onNavBgAlpha(Number($event.target.value) || 0)"
          />
          <span class="nav-range__unit">%</span>
          <button v-if="state.bannerNavBg" type="button" class="mini" @click="setPreview('bannerNavBg', '')">
            預設
          </button>
        </div>
        <span class="field__hint">
          箭頭大小最大 100%（相對按鈕）；圓角 0＝方形、拉到底＝圓形；箭頭色 / 底色皆可調透明度。箭頭「上一則」自動水平翻轉。套用所有 BlockBanner 版型。
        </span>
      </div>

      <!-- 輪播圓點（dots）樣式 -->
      <div class="field field--full">
        <span class="field__label">輪播圓點（dots）<em class="field__live">即時預覽</em></span>
        <label class="nav-switch">
          <input
            type="checkbox"
            :checked="state.bannerDots"
            @change="setPreview('bannerDots', $event.target.checked)"
          />
          <span>{{ state.bannerDots ? '顯示' : '隱藏' }}</span>
        </label>

        <template v-if="state.bannerDots">
          <div class="nav-range">
            <span class="nav-range__lbl">大小</span>
            <span class="nav-range__unit">寬</span>
            <input
              type="number"
              class="nav-range__num"
              min="2"
              max="80"
              :value="state.bannerDotW ?? 10"
              @input="setPreview('bannerDotW', Number($event.target.value) || 10)"
            />
            <span class="nav-range__unit">高</span>
            <input
              type="number"
              class="nav-range__num"
              min="2"
              max="80"
              :value="state.bannerDotH ?? 10"
              @input="setPreview('bannerDotH', Number($event.target.value) || 10)"
            />
            <span class="nav-range__unit">px</span>
          </div>
          <div class="nav-range">
            <span class="nav-range__lbl">選中大小</span>
            <span class="nav-range__unit">寬</span>
            <input
              type="number"
              class="nav-range__num"
              min="2"
              max="120"
              :value="state.bannerDotActiveW ?? 12"
              @input="setPreview('bannerDotActiveW', Number($event.target.value) || 12)"
            />
            <span class="nav-range__unit">高</span>
            <input
              type="number"
              class="nav-range__num"
              min="2"
              max="120"
              :value="state.bannerDotActiveH ?? 12"
              @input="setPreview('bannerDotActiveH', Number($event.target.value) || 12)"
            />
            <span class="nav-range__unit">px</span>
          </div>
          <div class="nav-range">
            <span class="nav-range__lbl">框線寬度</span>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              :value="state.bannerDotBorderWidth ?? 0"
              @input="setPreview('bannerDotBorderWidth', Number($event.target.value))"
            />
            <input
              type="number"
              class="nav-range__num"
              min="0"
              max="12"
              :value="state.bannerDotBorderWidth ?? 0"
              @input="setPreview('bannerDotBorderWidth', Number($event.target.value) || 0)"
            />
            <span class="nav-range__unit">px</span>
          </div>
          <div class="nav-range">
            <span class="nav-range__lbl">預設色</span>
            <input
              type="color"
              :value="state.bannerDotBg || '#ffffff'"
              @input="setPreview('bannerDotBg', $event.target.value)"
            />
            <button v-if="state.bannerDotBg" type="button" class="mini" @click="setPreview('bannerDotBg', '')">
              預設
            </button>
          </div>
          <div class="nav-range">
            <span class="nav-range__lbl">選中色</span>
            <input
              type="color"
              :value="state.bannerDotActiveBg || '#ffffff'"
              @input="setPreview('bannerDotActiveBg', $event.target.value)"
            />
            <button
              v-if="state.bannerDotActiveBg"
              type="button"
              class="mini"
              @click="setPreview('bannerDotActiveBg', '')"
            >
              預設
            </button>
          </div>
          <div class="nav-range">
            <span class="nav-range__lbl">框線色</span>
            <input
              type="color"
              :value="state.bannerDotBorderColor || '#ffffff'"
              @input="setPreview('bannerDotBorderColor', $event.target.value)"
            />
            <button
              v-if="state.bannerDotBorderColor"
              type="button"
              class="mini"
              @click="setPreview('bannerDotBorderColor', '')"
            >
              預設
            </button>
          </div>
          <span class="field__hint">
            大小可分別設定寬 / 高（可做成長條膠囊）；未選中＝預設色（留空＝半透明白）、選中＝選中色（留空＝白）；框線寬度 0＝無框。套用所有有圓點的 BlockBanner 版型。
          </span>
        </template>
      </div>

      <div class="actions">
        <button type="button" class="btn btn--primary" :disabled="!dirtyVer || submitting" @click="onSubmitVer">
          {{ submitting ? '寫入中…' : dirtyVer ? '提交版型設定' : '版型無變動' }}
        </button>
      </div>
      <p v-if="verMessage" :class="['msg', `msg--${verMessage.type}`]">{{ verMessage.text }}</p>
    </section>

    <!-- 2) 首頁 Banner 內容（依目前選取版型，各版型各自一份）-->
    <section class="block">
      <h2 class="block__h">首頁 Banner 內容（{{ state.blockBanner }}）</h2>
      <p class="page__desc">
        <strong>每個 BlockBanner 版型的內容各自獨立</strong>，目前編輯的是「{{ state.blockBanner }}」；切到上方其他版型會帶出該版型自己的圖片 / 文字 / 影片。沒設背景影片的版型前台就不會出現影片。
      </p>
      <p class="page__desc">
        可新增多則輪播。圖片建議尺寸 <code>1920 × 911</code>；沒上傳則用範例圖。
        標題 / 副標 / 說明文按 Enter 換行自動轉 <code>&lt;br&gt;</code>，文字全空的那則不顯示文字框。
        文字支援<strong>多語系</strong>：每欄按「<strong>🌐 多語</strong>」展開其他啟用語系，改<strong>繁中</strong>（失焦）會<strong>自動翻譯</strong>，可手動覆寫。
        編輯內容會<strong>即時預覽到站台</strong>，由底部<strong>確認島</strong>「確定 / 套用」寫回 <code>banners.json</code>、「清除預覽」還原（或用下方「送出」按鈕固化）。
      </p>

      <label class="field field--full">
        <span class="field__label">AI 生成主題 / 關鍵字（共用）</span>
        <input v-model="topic" type="text" placeholder="例：木質文創、綠色建築、夏季新品…" />
        <span class="field__hint">各欄位的「AI 生成」會參考這個主題</span>
      </label>

      <!-- 背景影片：只有「會渲染影片」的版型（BlockBanner01/09/13/21…）才顯示；其餘版型不出現 -->
      <template v-if="currentSupportsVideo">
        <label class="field field--full">
          <span class="field__label">背景影片 YouTube 連結 <em class="field__live">即時預覽</em></span>
          <input v-model="videoUrl" type="text" placeholder="例：https://www.youtube.com/watch?v=cMzGuRieo-8" />
          <span class="field__hint">
            填入後桌面版會以「靜音循環背景影片」覆蓋主圖（&lt; 1024px 自動隱藏）；留空＝只顯示輪播圖。
            支援 <code>watch?v=</code> 與 <code>youtu.be/</code> 連結。
          </span>
        </label>

        <div class="field field--full">
          <span class="field__label">或上傳背景影片檔（YT 連結留空時播放） <em class="field__live">即時預覽</em></span>
          <div class="video-up">
            <label class="btn btn--ghost">
              {{ uploadingVideo ? '上傳中…' : '上傳影片檔' }}
              <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" hidden @change="onPickVideo" />
            </label>
            <span v-if="videoFile" class="video-up__name">{{ videoFile }}</span>
            <button v-if="videoFile" type="button" class="mini mini--danger" @click="clearVideoFile">移除</button>
          </div>
          <span class="field__hint">
            HTML5 播放器、靜音循環、<code>playsinline</code> — 桌面與手機（含 iOS / Apple）皆自動播放。
            限 mp4 / webm / ogg，≤ 50MB。<strong>YT 連結優先</strong>，兩者皆有時播 YT。
          </span>
        </div>
      </template>
      <p v-else class="page__desc">此版型（{{ state.blockBanner }}）不支援背景影片，已隱藏影片欄位。</p>

      <p v-if="loading" class="page__desc">讀取中…</p>

      <div v-else class="slides">
        <div v-for="(row, i) in rows" :key="i" class="slide">
          <div class="slide__head">
            <span class="slide__no">{{ i + 1 }}</span>
            <strong class="slide__title">第 {{ i + 1 }} 則 Banner</strong>
            <div class="slide__ops">
              <button type="button" class="mini" :disabled="i === 0" @click="moveRow(i, -1)">↑</button>
              <button type="button" class="mini" :disabled="i === rows.length - 1" @click="moveRow(i, 1)">↓</button>
              <button type="button" class="mini mini--danger" @click="removeRow(i)">刪除</button>
            </div>
          </div>

          <!-- 背景圖 -->
          <div class="slide__img">
            <img :src="row.image.pc || SAMPLE_IMG" alt="" class="thumb" />
            <label class="btn btn--ghost">
              {{ uploadingIdx === i ? '上傳中…' : '上傳背景圖' }}
              <input type="file" accept="image/*" hidden @change="onPickImage(i, $event)" />
            </label>
          </div>

          <!-- 左側產品去背圖（僅支援的版型，如 BlockBanner03）：限 PNG / SVG -->
          <div v-if="currentLeftImage" class="slide__img slide__img--product">
            <img v-if="row.product?.pc" :src="row.product.pc" alt="" class="thumb thumb--product" />
            <div v-else class="thumb thumb--empty">未設定<br />（用版型預設圖）</div>
            <div class="slide__img-ops">
              <label class="btn btn--ghost">
                {{ uploadingProductIdx === i ? '上傳中…' : '上傳左側產品圖' }}
                <input type="file" accept="image/png,image/svg+xml,.png,.svg" hidden @change="onPickProduct(i, $event)" />
              </label>
              <button v-if="row.product?.pc" type="button" class="mini mini--danger" @click="clearProduct(i)">移除</button>
              <span class="field__hint">
                只能上傳 <strong>PNG / SVG</strong>（需去背透明）；{{ currentLeftImage.hint || '建議去背圖' }}。留空＝用版型內建去背圖。
              </span>
            </div>
          </div>

          <!-- 左側產品圖替代文字（SEO alt）：可 AI 辨識 -->
          <div v-if="currentLeftImage && row.product?.pc" class="field field--full">
            <span class="field__label">
              左側產品圖 alt（SEO）
              <button
                type="button"
                class="ai"
                :disabled="aiProductAltBusy === i || !row.product?.pc?.startsWith('/img/')"
                @click="recognizeProductAlt(i)"
              >
                {{ aiProductAltBusy === i ? 'AI 辨識中…' : 'AI 辨識' }}
              </button>
            </span>
            <input v-model="row.productAlt" type="text" placeholder="描述左側產品圖的內容（留空則前台以標題替代）" />
          </div>

          <!-- 圖片替代文字（SEO alt）：可由 AI 辨識圖片自動產生 -->
          <div class="field field--full">
            <span class="field__label">
              圖片替代文字 alt（SEO）
              <button
                type="button"
                class="ai"
                :disabled="aiAltBusy === i || !row.image?.pc?.startsWith('/img/')"
                @click="recognizeAlt(i)"
              >
                {{ aiAltBusy === i ? 'AI 辨識中…' : 'AI 辨識' }}
              </button>
            </span>
            <input v-model="row.alt" type="text" placeholder="描述這張圖片的內容（留空則前台以標題替代）" />
            <span :class="['field__hint', `alt-${altStatus(row).type}`]">{{ altStatus(row).text }}</span>
          </div>

          <!-- AI 一鍵生成：輸入此則關鍵字 → 一次產出連貫的標題+副標+內文 -->
          <div class="ai-all">
            <input
              v-model="row.topic"
              type="text"
              class="ai-all__kw"
              placeholder="輸入關鍵字（例：海島咖啡廳、手沖、海景）"
              @keyup.enter="aiGenAll(i)"
            />
            <button type="button" class="btn btn--ghost ai-all__btn" :disabled="aiBusyAll === i" @click="aiGenAll(i)">
              {{ aiBusyAll === i ? 'AI 生成中…' : '✦ AI 一鍵生成' }}
            </button>
            <span class="ai-all__hint">留空則用上方共用主題</span>
          </div>

          <!-- 自動翻譯：繁中 → 其餘啟用語系（一次翻標題/副標/說明文）-->
          <div v-if="enabledLocales.length > 1" class="translate-bar">
            <button
              type="button"
              class="btn btn--ghost"
              :disabled="translatingRow[i]"
              @click="translateRow(i)"
            >
              {{ translatingRow[i] ? '翻譯中…' : '✦ 自動翻譯（繁中 → 其他語系）' }}
            </button>
            <span class="translate-bar__hint">也可在繁中欄位打字、失焦自動翻</span>
          </div>

          <!-- 標題 / 副標 / 說明文（繁中為主，「🌐 多語」展開其餘語系，改繁中失焦自動翻譯）-->
          <div v-for="f in TEXT_FIELDS" :key="f.key" class="field field--full">
            <span class="field__label">
              {{ f.label }}
              <span v-if="translatingField[`${i}:${f.key}`]" class="translating">翻譯中…</span>
              <button
                type="button"
                class="ai"
                :disabled="aiBusy === `${i}:${f.key}`"
                @click="aiGen(i, f.key)"
              >
                {{ aiBusy === `${i}:${f.key}` ? 'AI…' : 'AI 生成' }}
              </button>
              <button
                v-if="otherLangs.length"
                type="button"
                class="ml-btn"
                :class="{ 'is-on': isFieldOpen(i, f.key) }"
                @click="toggleField(i, f.key)"
              >
                🌐 多語
              </button>
            </span>
            <textarea
              v-model="row[f.key].tw"
              :rows="f.rows"
              :placeholder="f.ph"
              :disabled="translatingField[`${i}:${f.key}`]"
              @change="translateOne(i, f.key)"
            ></textarea>

            <!-- 其他語系（展開）-->
            <div v-if="otherLangs.length && isFieldOpen(i, f.key)" class="ml-langs">
              <div class="ml-langs__head">
                <span>其他語系 — 改繁中失焦會自動翻譯，亦可手動覆寫</span>
                <button
                  type="button"
                  class="mini"
                  :disabled="translatingField[`${i}:${f.key}`]"
                  @click="translateOne(i, f.key)"
                >
                  {{ translatingField[`${i}:${f.key}`] ? '翻譯中…' : '↻ 重新翻譯' }}
                </button>
              </div>
              <div v-for="l in otherLangs" :key="l.code" class="ml-langs__row">
                <span class="ml-langs__code">{{ l.label }}</span>
                <textarea
                  v-model="row[f.key][l.code]"
                  :rows="f.rows"
                  placeholder="留空＝前台用繁中"
                  :disabled="translatingField[`${i}:${f.key}`]"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 此則文字顏色（留空＝用全站後台色／版型預設）-->
          <div class="field field--full">
            <span class="field__label">此則文字顏色 <em class="field__live">即時預覽</em></span>
            <div class="color-rows">
              <div v-for="c in slideColorFields" :key="c.key" class="color-rows__row">
                <span class="color-rows__name">{{ c.name }}</span>
                <input type="color" :value="row[c.key] || '#ffffff'" @input="row[c.key] = $event.target.value" />
                <code>{{ row[c.key] || '預設' }}</code>
                <button v-if="row[c.key]" type="button" class="btn btn--ghost btn--sm" @click="row[c.key] = ''">
                  回到預設
                </button>
              </div>
            </div>
            <span class="field__hint">只覆寫「這一則」；留空＝交還版型切換區的全站色，全站也留空才用版型預設。</span>
          </div>

          <!-- 按鈕 -->
          <div class="grid">
            <label class="field">
              <span class="field__label">按鈕文字</span>
              <input v-model="row.btnText" type="text" placeholder="預設 VIEW MORE" />
            </label>
            <label class="field">
              <span class="field__label">按鈕連結</span>
              <input v-model="row.link" type="text" placeholder="/about 或 https://…" />
            </label>
          </div>
        </div>

        <button type="button" class="btn btn--ghost add" @click="addRow">＋ 新增一則</button>
      </div>

      <div class="actions">
        <button type="button" class="btn btn--primary" :disabled="savingContent || loading" @click="saveContent">
          {{ savingContent ? '寫入中…' : '送出寫回 banners.json' }}
        </button>
      </div>
      <p v-if="contentMsg" :class="['msg', `msg--${contentMsg.type}`]">{{ contentMsg.text }}</p>
    </section>

    <!-- 3) 即時預覽 -->
    <section class="block">
      <h2 class="block__h">即時預覽</h2>
      <div ref="previewBox" class="banner-preview" :style="{ height: winH * scale + 'px' }">
        <ClientOnly>
          <div class="banner-preview__inner" :style="{ width: '100vw', height: winH + 'px', transform: `scale(${scale})` }">
            <component
              :is="currentBlockBanner"
              :rows="previewRows"
              :video-url="videoUrl"
              :video-file="videoFile"
              :show-nav="state.bannerNav"
            />
          </div>
        </ClientOnly>
      </div>
    </section>

    <!-- 互動式背景圖裁切器（選檔後彈出；比例固定、可拖曳/縮放，輸出 2560×按比例高） -->
    <BannerImageCropper
      v-if="cropTarget"
      :file="cropTarget.file"
      :ratio="BANNER_RATIO"
      :out-width="BANNER_TARGET_W"
      @confirm="onCropConfirm"
      @cancel="cropTarget = null"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.block {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #232a38;
}
.block__h {
  font-size: 16px;
  color: #e6ebf2;
  margin-bottom: 12px;
}

// Banner 文字顏色色票列
.color-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.color-rows__row {
  display: flex;
  align-items: center;
  gap: 10px;

  input[type='color'] {
    width: 40px;
    height: 28px;
    padding: 0;
    background: none;
    border: 1px solid #2a3242;
    border-radius: 4px;
    cursor: pointer;
  }
  code {
    min-width: 86px;
    font-size: 12px;
    color: #9fc0ff;
  }
}
.color-rows__name {
  min-width: 56px;
  font-size: 13px;
  color: #c8cfdb;
}

// 「🌐 多語」展開鈕（每個文字欄位）
.ml-btn {
  padding: 2px 10px;
  font-size: 12px;
  background: #0f1218;
  color: #8a93a3;
  border: 1px solid #2a3242;
  border-radius: 99px;
  cursor: pointer;

  &.is-on,
  &:hover {
    color: #6dd6a3;
    border-color: #2a4a3a;
  }
}
// 其他語系展開區
.ml-langs {
  margin-top: 8px;
  padding: 10px;
  background: #0f1218;
  border: 1px dashed #2a3242;
  border-radius: 6px;
}
.ml-langs__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
  color: #6a7382;
}
.ml-langs__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  & + & {
    margin-top: 6px;
  }

  textarea {
    flex: 1;
    min-width: 0;
  }
}
.ml-langs__code {
  flex-shrink: 0;
  width: 48px;
  padding-top: 8px;
  font-size: 12px;
  color: #8a93a3;
}
.translating {
  font-size: 11px;
  color: #d4b170;
}
.translate-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.translate-bar__hint {
  font-size: 11px;
  color: #6a7382;
}

// 箭頭按鈕開關 / 樣式設定
.nav-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #c8cfdb;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: #4fc08d;
    cursor: pointer;
  }
}
.nav-style {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #1a1f2a;
  border: 1px solid #2a3242;
  border-radius: 8px;
}
.nav-style__seg {
  display: inline-flex;
  border: 1px solid #2a3242;
  border-radius: 6px;
  overflow: hidden;

  button {
    padding: 5px 12px;
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
.nav-style__icons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.nav-style__opt {
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
.nav-range {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  input[type='range'] {
    flex: 1;
    cursor: pointer;
    accent-color: #4fc08d;
  }
}
.nav-range__lbl {
  width: 40px;
  font-size: 13px;
  color: #c8cfdb;
}
.nav-range__num {
  width: 80px;
  padding: 5px 10px;
  background: #0f1218;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  text-align: right;
  -moz-appearance: textfield; // 移除 Firefox 上下箭頭

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }
  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
}
.nav-range__unit {
  min-width: 18px;
  font-size: 12px;
  color: #8a93a3;
}

.slides {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.slide {
  padding: 16px 16px 16px 20px;
  background: #161b24;
  border: 1px solid #232a38;
  border-left: 3px solid #4fc08d; // 左側強調條，明確區隔每一則
  border-radius: 8px;
}
.slide__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #2a3242;
  color: #e6ebf2;
}
.slide__no {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #4fc08d;
  color: #0f1218;
  font-weight: 700;
  font-size: 14px;
  border-radius: 50%;
}
.slide__title {
  font-size: 15px;
}
.slide__head .slide__ops {
  margin-left: auto;
}
.slide__ops {
  display: flex;
  gap: 6px;
}
.mini {
  padding: 4px 10px;
  font-size: 12px;
  background: #232a38;
  border: 1px solid #2e3647;
  border-radius: 4px;
  color: #c8cfdb;
  cursor: pointer;

  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &--danger { color: #ff8a8a; }
}
.slide__img {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .thumb {
    width: 160px;
    height: 76px; // 1920:911 比例縮圖
    object-fit: cover;
    border-radius: 4px;
    background: #0f1218;
  }
}

// 左側產品去背圖：用 contain（不裁切變形）+ 棋盤格底色顯示透明
.slide__img--product {
  align-items: flex-start;

  .thumb--product {
    object-fit: contain;
    background-color: #0f1218;
    background-image:
      linear-gradient(45deg, #1b212c 25%, transparent 25%),
      linear-gradient(-45deg, #1b212c 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #1b212c 75%),
      linear-gradient(-45deg, transparent 75%, #1b212c 75%);
    background-size: 14px 14px;
    background-position: 0 0, 0 7px, 7px -7px, -7px 0;
  }
  .thumb--empty {
    width: 160px;
    height: 76px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12px;
    line-height: 1.4;
    color: #6a7382;
    border: 1px dashed #2a3242;
    border-radius: 4px;
    background: #0f1218;
  }
}
.slide__img-ops {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.field__label .ai {
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 11px;
  background: #2a3550;
  border: 1px solid #3a4568;
  border-radius: 4px;
  color: #9fc0ff;
  cursor: pointer;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// textarea 比照 input 深色樣式（_admin-page.scss 只含 input/select）
.field textarea {
  padding: 9px 12px;
  background: #1a1f2a;
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 6px;
  font: inherit;
  resize: vertical;

  &:focus {
    outline: 1px solid #4fc08d;
    border-color: #4fc08d;
  }
}

// 顏色 + 透明度控制列
// AI 一鍵生成列
.ai-all {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;

  &__kw {
    flex: 1;
    min-width: 200px;
    padding: 9px 12px;
    background: #1a1f2a;
    color: #e6e9ef;
    border: 1px solid #2a3242;
    border-radius: 6px;
    font: inherit;

    &:focus { outline: 1px solid #4fc08d; border-color: #4fc08d; }
  }
  &__btn {
    border-color: #3a4568;
    color: #9fc0ff;
    font-size: 13px;
    white-space: nowrap;

    &:hover:not(:disabled) { background: #1f2738; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  &__hint {
    font-size: 11px;
    color: #6a7382;
  }
}

// 圖片 alt 的 SEO 判斷顏色
.alt-ok { color: #6fd08c; }
.alt-info { color: #9fc0ff; }
.alt-warn { color: #ffcf8a; }

// 背景影片上傳列
.video-up {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.video-up__name {
  font-size: 12px;
  color: #9fc0ff;
  word-break: break-all;
}

.add {
  align-self: flex-start;
}

.banner-preview {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid #232a38;
  border-radius: 8px;
  background: #000;
}
.banner-preview__inner {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  pointer-events: none;

  // 預覽整體不可互動（避免誤點 banner 連結跳頁）；唯獨放行「影片開關（× / ▶）」，
  // 方便在後台關掉背景影片看主圖／文字。
  :deep(.video_control) {
    pointer-events: auto;
  }
}
</style>
