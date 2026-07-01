<script setup>
// 首頁 Banner block — 版型 17（全螢幕主圖 + 滑鼠水波紋 + 置中文字 cover）
//
// 來源：D:\www\master_dev\template\module\banner\banner17.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner17.scss
//
// 與範例差異（依需求）：
//   - 文字 + VIEW MORE 置於整個畫面「正中間」（範例是靠下置中）。
//   - 主圖加「滑鼠水波紋」：游標滑過主圖即產生水波（互動式高度場模擬，非固定動畫）。
//     → 主圖畫在 <canvas>，文字輪播（fade）疊在上層；換頁時 canvas 換圖、水波延續。
//
// rows 結構（每筆）：{ image:{pc,mb}, title, subtitle, link }
//   title = 中文標題（大字）／subtitle = 英文副標／link = VIEW MORE 連結（空則不顯示按鈕）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// 能力標記：本版型有「滑鼠水波紋」效果，後台可開關（bannerRipple）
defineOptions({ rippleEffect: true })

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' }, // 介面相容（本版型無影片）
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
  // 後台「輪播箭頭」開關（範例本身無箭頭 → 交由後台控制；預設顯示）
  showNav: { type: Boolean, default: true },
})

// 後台「水波紋」開關（版型層級設定；預設開）
const { state: siteState } = useEffectiveSettings()
const rippleOn = computed(() => siteState.bannerRipple !== false)

// 換行欄位：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 目前 active 張數（決定 canvas 顯示哪張圖）
const activeIndex = ref(0)
const onSlideChange = (s) => {
  activeIndex.value = s.realIndex
}
const currentSrc = computed(() => {
  const r = props.rows?.[activeIndex.value]
  return r?.image?.pc || r?.image?.mb || ''
})

// ── 滑鼠水波紋（canvas 高度場模擬）─────────────────────────────
// 演算法：雙緩衝高度場，每幀以鄰居平均擴散並阻尼；渲染時依高度梯度位移原圖像素。
// 游標滑過 → 在該點注入擾動 → 產生擴散水波。靜止一段時間自動停迴圈（省效能）。
const rootEl = ref(null)
const canvasEl = ref(null)
const MAXW = 960 // canvas 內部解析度上限（越大越清晰、越吃效能；再由下方像素總量上限保護）
const PIXEL_CAP = 640000 // 緩衝總像素上限（約 960×667）；超寬/超高螢幕自動降採樣，兼顧清晰與效能
let ctx = null
let W = 0
let H = 0
let a = null // 高度場：目前
let b = null // 高度場：前一幀
let srcBuf = null // 目前圖片像素（cover 畫好）
let outImg = null // 輸出 ImageData
let img = null
let raf = 0
let alive = false
let idle = 0
let rippleOk = true // getImageData 失敗（跨網域汙染）時關閉水波、只顯示靜態圖

const setupSize = () => {
  if (!import.meta.client || !canvasEl.value) return
  const vw = window.innerWidth || 1920
  const vh = window.innerHeight || 1080
  W = Math.min(MAXW, vw)
  H = Math.max(1, Math.round((W * vh) / vw)) // 緩衝比例＝視窗比例 → CSS 滿版不變形
  // 像素總量上限保護（超寬/超高螢幕自動等比降採樣）
  if (W * H > PIXEL_CAP) {
    const s = Math.sqrt(PIXEL_CAP / (W * H))
    W = Math.max(1, Math.round(W * s))
    H = Math.max(1, Math.round(H * s))
  }
  canvasEl.value.width = W
  canvasEl.value.height = H
  ctx = canvasEl.value.getContext('2d', { willReadFrequently: true })
  a = new Int16Array(W * H)
  b = new Int16Array(W * H)
  if (img && img.complete && img.naturalWidth) drawSource()
}

const drawSource = () => {
  if (!ctx || !img || !img.naturalWidth) return
  // cover 繪製（填滿 W×H、置中裁切）
  const ir = img.naturalWidth / img.naturalHeight
  const cr = W / H
  let dw, dh
  if (ir > cr) {
    dh = H
    dw = H * ir
  } else {
    dw = W
    dh = W / ir
  }
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
  try {
    srcBuf = ctx.getImageData(0, 0, W, H)
    if (!outImg) outImg = ctx.createImageData(W, H)
    outImg.data.set(srcBuf.data) // 先放原圖（第一幀不空白）
    ctx.putImageData(outImg, 0, 0)
    rippleOk = true
  } catch {
    rippleOk = false // 跨網域圖 → 無法讀像素，退回靜態顯示（drawImage 已畫好）
  }
}

const loadImage = (src) => {
  if (!import.meta.client || !src) return
  img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    if (!ctx) setupSize()
    else drawSource()
  }
  img.src = src
}

const wake = () => {
  idle = 0
  if (!alive && rippleOk) {
    alive = true
    raf = requestAnimationFrame(step)
  }
}

const disturb = (cx, cy, power) => {
  if (!a) return
  const r = 2
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      const x = cx + i
      const y = cy + j
      if (x > 0 && x < W - 1 && y > 0 && y < H - 1) a[y * W + x] += power
    }
  }
  wake()
}

const step = () => {
  if (!ctx || !srcBuf || !rippleOk) {
    alive = false
    return
  }
  const src = srcBuf.data
  const dst = outImg.data
  let energy = 0
  // 擴散 + 阻尼（b 寫入新高度）
  for (let y = 1; y < H - 1; y++) {
    const yw = y * W
    for (let x = 1; x < W - 1; x++) {
      const i = yw + x
      let v = ((a[i - 1] + a[i + 1] + a[i - W] + a[i + W]) >> 1) - b[i]
      v -= v >> 5 // 阻尼（越大衰減越快）
      b[i] = v
      const av = v < 0 ? -v : v
      if (av > energy) energy = av
    }
  }
  // 依高度梯度位移原圖像素
  for (let y = 1; y < H - 1; y++) {
    const yw = y * W
    for (let x = 1; x < W - 1; x++) {
      const i = yw + x
      let sx = x + ((b[i - 1] - b[i + 1]) >> 3)
      let sy = y + ((b[i - W] - b[i + W]) >> 3)
      if (sx < 0) sx = 0
      else if (sx >= W) sx = W - 1
      if (sy < 0) sy = 0
      else if (sy >= H) sy = H - 1
      const si = (sy * W + sx) << 2
      const di = i << 2
      dst[di] = src[si]
      dst[di + 1] = src[si + 1]
      dst[di + 2] = src[si + 2]
      dst[di + 3] = 255
    }
  }
  ctx.putImageData(outImg, 0, 0)
  const t = a // 交換緩衝
  a = b
  b = t
  // 幾乎靜止時計數，連續 idle 太久就停迴圈（下次 mousemove 再喚醒）
  if (energy < 2) {
    if (++idle > 40) {
      alive = false
      return
    }
  } else {
    idle = 0
  }
  raf = requestAnimationFrame(step)
}

const onPointerMove = (e) => {
  if (!rippleOn.value || !rootEl.value || !W) return
  const rect = rootEl.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * W)
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * H)
  if (x >= 0 && x < W && y >= 0 && y < H) disturb(x, y, 320)
}

let resizeTimer = 0
const onResize = () => {
  if (!import.meta.client) return
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setupSize()
    wake()
  }, 200)
}

onMounted(() => {
  if (!import.meta.client) return
  setupSize()
  loadImage(currentSrc.value)
  rootEl.value?.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize)
})
watch(currentSrc, (s) => loadImage(s))
// 後台關掉水波 → 停迴圈、清掉漣漪、還原靜態主圖（即時預覽也生效）
watch(rippleOn, (on) => {
  if (on) {
    wake()
  } else {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    alive = false
    a?.fill(0)
    b?.fill(0)
    drawSource()
  }
})
onBeforeUnmount(() => {
  if (!import.meta.client) return
  rootEl.value?.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('resize', onResize)
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
})
</script>

<template>
  <section ref="rootEl" class="banner17">
    <!-- 主圖水波紋層：canvas 顯示 active 主圖，滑鼠滑過產生水波 -->
    <canvas ref="canvasEl" class="ripple_canvas" aria-hidden="true"></canvas>

    <!-- 文字輪播（fade）：只有文字疊在水波主圖上，隨 active 淡入 -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner17_prev', nextEl: '.banner17_next' }"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div class="cover" :class="`js-banner-row-${i}`">
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
          <h2 v-if="row.subtitle" v-html="toHtml(row.subtitle)" />

          <NuxtLink v-if="row.link" class="cover_btn center" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 左右箭頭：範例無箭頭 → 交後台「輪播箭頭」開關控制，且只有一張時自動隱藏 -->
    <template v-if="showNav && rows.length > 1">
      <button class="banner17_prev banner_arrow" type="button" aria-label="上一張"></button>
      <button class="banner17_next banner_arrow" type="button" aria-label="下一張"></button>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.banner17 {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

// 水波紋主圖層（滿版；緩衝比例＝視窗比例故不變形）
.ripple_canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
}

// ── 文字輪播層（透明疊在水波主圖上） ─────────────────────────
.index_banner {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;

  .swiper-slide {
    position: relative;
    height: 100%;

    .cover {
      position: absolute;
      top: 50%;
      left: 50%;
      width: max-content;
      max-width: 100%;
      text-align: center;
      padding: 0 fluid(25);
      transform: translate(-50%, -50%); // 整個畫面正中間（水平＋垂直置中）

      // 第一行：中文標題（bannerTitleSize_cht(1)）
      > :nth-child(1) {
        color: var(--banner-title-color, #fff);
        font-weight: 500;
        font-family: $title_font_cht;
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(-40px);
        transition: all 0.3s, opacity 1s, transform 1s;
        font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

        @media (min-width: 1201px) { letter-spacing: 2px; }
      }

      // 第二行：英文副標（bannerTitleSize_en(1)）
      > :nth-child(2) {
        color: var(--banner-subtitle-color, #fff);
        font-weight: 700;
        font-family: $title_font_en;
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(40px);
        transition: all 0.3s, opacity 1s, transform 1s;
        font-size: clamp(38px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
      }

      // VIEW MORE 按鈕（btnMarginTop(1)）
      .cover_btn {
        opacity: 0;
        transform: translateY(40px);
        transition: all 0.3s, opacity 1s, transform 1s;
        margin-top: fluid(55);

        @media (max-width: 1200px) { margin-top: 35px; }
      }
    }

    // active slide：文字依序淡入（標題從左、副標從右、按鈕上滑）
    &.swiper-slide-active .cover {
      > :nth-child(1),
      > :nth-child(2) {
        opacity: 1;
        transform: translateX(0);
        transition: all 0.3s, opacity 1s 1s, transform 1s 1s;
      }

      .cover_btn {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
      }
    }
  }

  :deep(.swiper-pagination) {
    bottom: fluid(135);

    @media (max-width: 1024px) {
      bottom: 20px;
    }
  }
}

// VIEW MORE 按鈕（嚴格對應原 .button06：實心主色底 + 白字，180×45，hover 反白；.center = margin auto）
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 45px;
  background: $web_color_1;
  border: 1px solid $web_color_1;
  transition: all 0.3s;

  @media (max-width: 1200px) {
    width: 160px;
    height: 40px;
  }

  span {
    color: #fff;
    font-family: $title_font_en;
    font-size: fluid-fz(14);
    letter-spacing: 2px;
    transition: all 0.3s;
  }

  &.center { margin: 0 auto; }

  &:hover {
    background: #fff;
    span { color: $web_color_1; }
  }
}

// ── 左右箭頭（swiperArrowStyle 風格；邊框畫 V 形 chevron） ──
.banner_arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 50%, $web_font_color, rgba(255, 255, 255, 0.85));
  border: none;
  cursor: pointer;
  transform: translateY(-50%);
  transition: all 0.3s;

  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { background: #fff; color: $web_color_1; }
}
.banner17_prev {
  @include banner-nav-gap(left, fluid(20));
  &::before { transform: rotate(-135deg); margin-left: 3px; }
}
.banner17_next {
  @include banner-nav-gap(right, fluid(20));
  &::before { transform: rotate(45deg); margin-right: 3px; }
}
</style>
