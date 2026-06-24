// ── 首頁 Banner 內容即時預覽（banners.json 的 home）─────────────
// 與站台共用一份（localStorage 覆寫，client only）。
//   - banner 後台編輯時 set() 寫進來 → 前台 BlockBanner 即時套用（免存檔、免重整）
//   - 預覽島「確定 / 套用」commit() 把預覽寫回 banners.json（保留 page/common）
//   - 預覽島「清除預覽」clear() 還原（站台回到已存檔內容）
// 結構：home = { rows, videoUrl, videoFile, news }（即 /banner/home 回傳格式）
const KEY = 'master_v2_banner_preview'

export function useBannerPreview() {
  // SSR-safe 共用狀態；client 端由 load() 從 localStorage 載入
  const preview = useState('banner-preview', () => null)

  const load = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(KEY)
      preview.value = raw ? JSON.parse(raw) : null
    } catch {
      preview.value = null
    }
  }

  const set = (home) => {
    if (!import.meta.client) return
    preview.value = home
    try {
      localStorage.setItem(KEY, JSON.stringify(home))
    } catch {}
  }

  const clear = () => {
    preview.value = null
    if (import.meta.client) localStorage.removeItem(KEY)
  }

  const isPreviewing = computed(() => !!preview.value)

  // 寫回 banners.json：取現有整包 → 換掉 home（保留 page/common/news 既有欄位）→ POST
  const commit = async () => {
    if (!preview.value) return { ok: true }
    try {
      const res = await $fetch('/_admin/mock', { params: { name: 'banners' } })
      const doc = res?.parsed || {}
      doc.home = { ...(doc.home || {}), ...preview.value }
      await $fetch('/_admin/mock', { method: 'POST', body: { name: 'banners', content: doc } })
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e?.data?.message || e?.statusMessage || e?.message }
    }
  }

  return { preview, isPreviewing, load, set, clear, commit, KEY }
}
