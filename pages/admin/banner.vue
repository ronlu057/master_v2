<script setup>
// /admin/banner — Banner 模組設定
//   1) 版型切換（PageBanner / BlockBanner）— 走 site-settings
//   2) 首頁 Banner 內容編輯（BlockBanner01）— 多則 slide、背景圖上傳（裁切到比例）、標題/副標/說明文 + AI 生成、
//      圖片 alt、背景影片（YT/上傳）、按鈕文字/連結；即時預覽；送出寫回 banners.json（Banner API）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })

import BlockBanner01 from '~/components/banners/BlockBanner01.vue'

const { state, options, submitting, load: loadSettings, submit, setPreview, isDirtyKey } =
  useSiteSettings()

const dirtyVer = computed(() => ['pageBanner', 'blockBanner'].some(isDirtyKey))
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

// 圖片 alt 的 SEO 判斷（每則）：有填→OK；沒填但有標題→以標題替代；都沒→警告
const altStatus = (row) => {
  if ((row.alt || '').trim()) return { type: 'ok', text: '✓ 已設定圖片 alt' }
  if ((row.title || '').trim()) return { type: 'info', text: 'ℹ 未填 alt，前台會以標題作為替代文字' }
  return { type: 'warn', text: '⚠ 無 alt 也無標題，建議補上（利於圖片 SEO）' }
}

const bannersDoc = ref(null) // banners.json 完整物件（送出時整包寫回，保留 page/common/news）
const rows = ref([]) // 編輯中的 slides
const topic = ref('') // AI 生成共用主題/關鍵字
const videoUrl = ref('') // BlockBanner01 背景影片（YouTube 連結，block 層級、非每則）
const videoFile = ref('') // BlockBanner01 上傳影片檔路徑（YT 連結為空時改用 HTML5 播放）
const loading = ref(true)
const contentMsg = ref(null)
const savingContent = ref(false)

// 首頁 banner 內容來源 = 獨立 Banner API（banners.json 的 home 物件：rows + videoUrl/videoFile + news）
const loadContent = async () => {
  loading.value = true
  try {
    const res = await $fetch('/_admin/mock?name=banners')
    bannersDoc.value = res.parsed
    const h = res.parsed?.home || {}
    videoUrl.value = h.videoUrl || ''
    videoFile.value = h.videoFile || ''
    rows.value = (h.rows || []).map((r) => ({
      image: { pc: r.image?.pc || '', mb: r.image?.mb || '' },
      alt: r.alt || '', // 圖片替代文字（SEO）
      topic: '', // 每則 AI 關鍵字（僅供生成用，不寫回）
      title: toEdit(r.title),
      subtitle: toEdit(r.subtitle),
      memo: toEdit(r.memo),
      btnText: r.btnText || '',
      link: r.link || '',
    }))
  } catch (e) {
    contentMsg.value = { type: 'error', text: `讀取 banners.json 失敗：${e.data?.message || e.statusMessage || e.message}` }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSettings()
  loadContent()
})

const addRow = () => {
  rows.value.push({
    image: { pc: SAMPLE_IMG, mb: '' },
    alt: '',
    topic: '',
    title: '',
    subtitle: '',
    memo: '',
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
    if (res.title) rows.value[i].title = res.title
    if (res.subtitle) rows.value[i].subtitle = res.subtitle
    if (res.memo) rows.value[i].memo = res.memo
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
        context: { title: rows.value[i].title, subtitle: rows.value[i].subtitle, lang: '繁體中文' },
      },
    })
    rows.value[i][field] = res.text
  } catch (err) {
    contentMsg.value = { type: 'error', text: `AI 生成失敗：${err.data?.message || err.statusMessage || err.message}` }
  } finally {
    aiBusy.value = ''
  }
}

// 即時預覽用 rows（換行轉 <br>）
const previewRows = computed(() =>
  rows.value.map((r) => ({
    image: r.image?.pc ? r.image : { pc: SAMPLE_IMG, mb: '' },
    alt: r.alt,
    title: toStore(r.title),
    subtitle: toStore(r.subtitle),
    memo: toStore(r.memo),
    btnText: r.btnText,
    link: r.link,
  })),
)

// 送出：把 rows / 影片設定寫回 banners.json 的 home（保留 news / page / common）
const saveContent = async () => {
  if (!bannersDoc.value) return
  savingContent.value = true
  try {
    const doc = bannersDoc.value
    doc.home = doc.home || {}
    doc.home.videoUrl = videoUrl.value.trim()
    doc.home.videoFile = videoFile.value.trim()
    doc.home.rows = rows.value.map((r) => ({
      image: r.image?.pc ? r.image : { pc: SAMPLE_IMG, mb: '' },
      alt: (r.alt || '').trim(),
      title: toStore(r.title),
      subtitle: toStore(r.subtitle),
      memo: toStore(r.memo),
      btnText: r.btnText || '',
      link: r.link || '',
    }))
    await $fetch('/_admin/mock', { method: 'POST', body: { name: 'banners', content: doc } })
    contentMsg.value = { type: 'success', text: '已寫回 banners.json（Banner API），站台下次請求即生效。' }
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
          <select :value="state.blockBanner" @change="setPreview('blockBanner', $event.target.value)">
            <option v-for="b in options.blockBanners" :key="b" :value="b">{{ b }}</option>
          </select>
        </label>
      </div>
      <div class="actions">
        <button type="button" class="btn btn--primary" :disabled="!dirtyVer || submitting" @click="onSubmitVer">
          {{ submitting ? '寫入中…' : dirtyVer ? '提交版型設定' : '版型無變動' }}
        </button>
      </div>
      <p v-if="verMessage" :class="['msg', `msg--${verMessage.type}`]">{{ verMessage.text }}</p>
    </section>

    <!-- 2) 首頁 Banner 內容（BlockBanner01）-->
    <section class="block">
      <h2 class="block__h">首頁 Banner 內容（BlockBanner01）</h2>
      <p class="page__desc">
        可新增多則輪播。圖片建議尺寸 <code>1920 × 911</code>；沒上傳則用範例圖。標題/副標/說明文按 Enter 換行會自動轉
        <code>&lt;br&gt;</code>；文字全空的那則不顯示文字框。送出後寫回 <code>banners.json</code>。
      </p>

      <label class="field field--full">
        <span class="field__label">AI 生成主題 / 關鍵字（共用）</span>
        <input v-model="topic" type="text" placeholder="例：木質文創、綠色建築、夏季新品…" />
        <span class="field__hint">各欄位的「AI 生成」會參考這個主題</span>
      </label>

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

          <!-- 標題 -->
          <div class="field field--full">
            <span class="field__label">
              標題
              <button type="button" class="ai" :disabled="aiBusy === `${i}:title`" @click="aiGen(i, 'title')">
                {{ aiBusy === `${i}:title` ? 'AI…' : 'AI 生成' }}
              </button>
            </span>
            <textarea v-model="row.title" rows="2" placeholder="主標（可換行）"></textarea>
          </div>

          <!-- 副標 -->
          <div class="field field--full">
            <span class="field__label">
              副標
              <button type="button" class="ai" :disabled="aiBusy === `${i}:subtitle`" @click="aiGen(i, 'subtitle')">
                {{ aiBusy === `${i}:subtitle` ? 'AI…' : 'AI 生成' }}
              </button>
            </span>
            <textarea v-model="row.subtitle" rows="2" placeholder="副標（可換行）"></textarea>
          </div>

          <!-- 說明文 -->
          <div class="field field--full">
            <span class="field__label">
              說明文
              <button type="button" class="ai" :disabled="aiBusy === `${i}:memo`" @click="aiGen(i, 'memo')">
                {{ aiBusy === `${i}:memo` ? 'AI…' : 'AI 生成' }}
              </button>
            </span>
            <textarea v-model="row.memo" rows="3" placeholder="說明文（可換行）"></textarea>
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
            <BlockBanner01 :rows="previewRows" :video-url="videoUrl" :video-file="videoFile" />
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
