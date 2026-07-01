<script setup>
// 首頁 Banner block — 版型 16（固定背景大圖 + 中央浮層小圖[滑鼠視差] + 直書文字輪播）
//
// 來源：D:\www\master_dev\template\module\banner\banner16.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner16.scss
//
// 結構（依需求「圖固定、小圖獨立、只有文字輪播」）：
//   - 固定媒體層（.fixed_media）：背景大圖 + 3 張浮層小圖，皆為「版型層級一組」（不分則），
//     由後台設定（useEffectiveSettings 的 bannerBgImage / bannerDeco1~3）。桌面掛滑鼠視差浮動。
//   - 文字輪播（Swiper，fade）：每則只有直書文字（標題 + 副標 + 說明文），齊頭對齊、依序淡入。
//
// rows 結構（每筆，只用文字；圖片改由版型層級設定，不再讀 row.image）：
//   { title, subtitle, memo, link }
//     title    = 直書第一行（主標，clamp 大字）
//     subtitle = 直書第二行（副標，字級同標題）
//     memo     = 直書第三行（說明文，較小）
//     link     = 整段文字連結（可選）
//   三行文字色分別走 --banner-title-color / --banner-subtitle-color / --banner-memo-color。
// title(prop) / videoUrl / news：為與其他 BlockBanner 介面相容而保留，本版型未使用。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// 能力標記：背景大圖 + 3 張浮層小圖為「版型層級一組」（不分則），後台在「版型切換」區設定。
defineOptions({
  bannerLevelMedia: {
    bgHint: '固定背景大圖（整個版型一張，不隨文字輪播）',
    decoHint: '中央浮層小圖（PNG / SVG 去背，桌面有滑鼠視差）',
    decoSlots: 3,
  },
})

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 固定媒體（版型層級一組）：背景大圖 + 3 張浮層小圖，皆取自後台設定
const { state: siteState } = useEffectiveSettings()
const bgImage = computed(() => siteState.bannerBgImage || '')
const deco1 = computed(() => siteState.bannerDeco1 || '')
const deco2 = computed(() => siteState.bannerDeco2 || '')
const deco3 = computed(() => siteState.bannerDeco3 || '')
// 背景圖 alt：借第一則標題（純文字，去 <br>）；沒有就留空
const bgAlt = computed(() => (props.rows?.[0]?.title || '').replace(/<br\s*\/?>/gi, ' ').trim())

// 換行：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── 滑鼠視差（僅桌面 ≥1025）：把游標位移寫成 CSS 變數 --mx / --my（-1~1），
//    各浮層在 SCSS 以不同倍率位移（transform 寫在 SCSS，只有變數值動態）。
//    順滑關鍵（對應原 parallax.js 的 friction）：mousemove 只記「目標」，
//    另用 requestAnimationFrame 每幀以 lerp 逼近目標並寫一次變數 → 60fps 不卡、無 CSS transition 打架。
const mediaEl = ref(null)
let mq = null
let rafId = 0
let running = false
let tx = 0
let ty = 0
let cx = 0
let cy = 0
const FRICTION = 0.09 // 越小越「拖尾」順滑；越大越即時
const onMouseMove = (e) => {
  tx = (e.clientX / window.innerWidth - 0.5) * 2
  ty = (e.clientY / window.innerHeight - 0.5) * 2
}
const tick = () => {
  cx += (tx - cx) * FRICTION
  cy += (ty - cy) * FRICTION
  mediaEl.value?.style.setProperty('--mx', cx.toFixed(4))
  mediaEl.value?.style.setProperty('--my', cy.toFixed(4))
  rafId = requestAnimationFrame(tick)
}
const startParallax = () => {
  if (running) return
  running = true
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  rafId = requestAnimationFrame(tick)
}
const stopParallax = () => {
  running = false
  window.removeEventListener('mousemove', onMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  tx = ty = cx = cy = 0
  mediaEl.value?.style.setProperty('--mx', '0')
  mediaEl.value?.style.setProperty('--my', '0')
}
const syncParallax = () => {
  if (mq && mq.matches) startParallax()
  else stopParallax()
}
onMounted(() => {
  if (!import.meta.client) return
  mq = window.matchMedia('(min-width: 1025px)')
  syncParallax()
  mq.addEventListener?.('change', syncParallax)
})
onBeforeUnmount(() => {
  if (!import.meta.client) return
  stopParallax()
  mq?.removeEventListener?.('change', syncParallax)
})
</script>

<template>
  <section class="banner16">
    <!-- 固定媒體層：背景大圖 + 浮層小圖（不隨文字輪播；桌面滑鼠視差） -->
    <div ref="mediaEl" class="fixed_media">
      <picture v-if="bgImage" class="fixed_bg">
        <img :src="bgImage" :alt="bgAlt" />
      </picture>
      <div v-if="deco1" class="deco deco_1"><img :src="deco1" alt="" /></div>
      <div v-if="deco2" class="deco deco_2"><img :src="deco2" alt="" /></div>
      <div v-if="deco3" class="deco deco_3"><img :src="deco3" alt="" /></div>
    </div>

    <!-- 文字輪播（只有文字，fade 切換） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner16_prev', nextEl: '.banner16_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <component
          :is="row.link ? 'NuxtLink' : 'div'"
          :to="row.link || undefined"
          :title="row.link ? ((row.title || '').replace(/<br\s*\/?>/gi, ' ') || 'VIEW MORE') : undefined"
          class="text_slide"
        >
          <!-- 齊頭對齊：標題 / 副標（字級同標題） / 說明文，三欄頂端對齊 -->
          <div class="cover_txt" :class="`js-banner-row-${i}`">
            <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
            <div v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
            <div v-if="row.memo" v-html="toHtml(row.memo)" />
          </div>
        </component>
      </SwiperSlide>
    </Swiper>

    <!-- 左側上下切換：直線 + 三角箭頭 SVG（複製原 banner16 tool_btn；prev 朝上、next 朝下）；rows<=1 隱藏 -->
    <div v-if="rows.length > 1" class="tool_btn">
      <button class="banner16_prev prev" type="button" aria-label="上一張">
        <svg viewBox="0 0 4.2 88.3" width="4.2" height="88.3" aria-hidden="true" focusable="false">
          <rect x="0" y="1.3" width="0.5" height="87" />
          <polygon points="4.2,6.2 0,6.2 0,0" />
        </svg>
      </button>
      <button class="banner16_next next" type="button" aria-label="下一張">
        <svg viewBox="0 0 4.2 88.3" width="4.2" height="88.3" aria-hidden="true" focusable="false">
          <rect x="0" y="1.3" width="0.5" height="87" />
          <polygon points="4.2,6.2 0,6.2 0,0" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
$b16-strip: fluid(151.5); // 桌面左側直欄寬（放上下箭頭）

.banner16 {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #fff;

  // 桌面：左側直欄鋪 background05 底紋（箭頭浮在其中）
  @media (min-width: 961px) {
    background: url('../img/background/background05.png');
  }
}

// ── 固定媒體層：背景大圖 + 浮層小圖（絕對定位、避開左側直欄；滑鼠視差） ──
.fixed_media {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  @media (min-width: 961px) {
    left: $b16-strip; // 讓出左側直欄，露出 background05
  }
}

// 背景大圖：純固定填滿（不做視差 — 只有浮層小圖會動）
.fixed_bg {
  display: block;
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 浮層小圖：位置與寬度依原版 _banner16.scss（width 以 /1760 換算成 %）；各自不同視差倍率
.deco {
  position: absolute;
  will-change: transform; // 提升為合成層，視差位移不觸發 layout/paint（順滑）
  backface-visibility: hidden;

  img {
    display: block;
    width: 100%;
  }
}
.deco_1 {
  top: 38%;
  left: 48%;
  width: calc(130 / 1760 * 100%);
  transform: translate(calc(var(--mx, 0) * -14px), calc(var(--my, 0) * -14px));
}
.deco_2 {
  top: 38%;
  left: 56%;
  width: calc(68 / 1760 * 100%);
  transform: translate(calc(var(--mx, 0) * -22px), calc(var(--my, 0) * -22px));
}
.deco_3 {
  top: 56.3%;
  left: 53.7%;
  width: calc(202 / 1760 * 100%);
  transform: translate(calc(var(--mx, 0) * -30px), calc(var(--my, 0) * -30px));
}

// ── 文字輪播（透明疊在固定媒體上；只切文字） ──────────────────
.index_banner {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  @media (min-width: 961px) {
    left: $b16-strip;
  }

  .swiper-slide {
    position: relative;
    height: 100%;
  }

  .text_slide {
    display: block;
    position: relative;
    height: 100%;
  }

  // 手機分頁點
  :deep(.swiper-pagination) {
    @media (min-width: 641px) {
      bottom: 20px;
      left: 25px;
      transform: unset;
      text-align: left;
    }

    @media (max-width: 640px) {
      bottom: calc(60 / 4.8 * 1vw);
    }
  }
}

// ── 文字 cover：齊頭對齊（直書 RTL：標題最右 → 副標 → 說明文） ──────
.cover_txt {
  display: flex;
  flex-direction: row-reverse; // 第一個 DOM 子（標題）排最右，符合直書右起
  align-items: flex-start; // 各欄「頂端」對齊 → 齊頭
  gap: fluid(22);
  position: absolute;
  top: 32%;
  left: 8.5%;
  width: max-content;
  max-width: calc(100% - 8.5% - 30px);
  transition: all 0.3s;
  z-index: 1;

  @media (min-width: 641px) and (max-width: 1200px) {
    top: 50%;
    left: 5%;
    transform: translateY(-50%);
  }

  // 手機：改為橫書、置中排在底部
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    top: unset;
    bottom: calc(130 / 4.8 * 1vw);
    left: 0;
    width: 100%;
    max-width: none;
    text-align: center;
    padding: 0 15px;
  }

  > * {
    color: #fff;
    font-weight: 900;
    font-family: 'Noto Serif TC', serif;
    opacity: 0;
    transform: translateY(-40px);

    // 直書（≥641）
    @media (min-width: 641px) {
      writing-mode: vertical-rl;
    }

    :deep(br) {
      @media (max-width: 640px) {
        display: none;
      }
    }
  }

  // 第一行：標題（大字）
  > :nth-child(1) {
    color: var(--banner-title-color, #fff);
    transition: all 0.3s, opacity 1s, transform 1s;
    font-size: clamp(30px, calc(46 / 19.2 * 1vw), calc(46 / 1920 * 2560 * 1px));

    @media (min-width: 1201px) {
      letter-spacing: 2px;
    }
  }

  // 第二行：副標（字級「同標題」）
  > :nth-child(2) {
    color: var(--banner-subtitle-color, #fff);
    transition: all 0.3s, opacity 1s 0.3s, transform 1s 0.3s;
    font-size: clamp(30px, calc(46 / 19.2 * 1vw), calc(46 / 1920 * 2560 * 1px));

    @media (min-width: 1201px) {
      letter-spacing: 2px;
    }
  }

  // 第三行：說明文（較小）
  > :nth-child(3) {
    color: var(--banner-memo-color, #fff);
    transition: all 0.3s, opacity 1s 0.6s, transform 1s 0.6s;
    font-weight: 500;
    font-size: clamp(15px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
  }
}

// 進場：active slide 文字依序淡入（齊頭滑入）
.index_banner .swiper-slide-active .text_slide .cover_txt > * {
  opacity: 1;
  transform: translateY(0);

  &:nth-child(1) {
    transition: all 0.3s, opacity 1s 1s, transform 1s 1s;
  }
  &:nth-child(2) {
    transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s;
  }
  &:nth-child(3) {
    transition: all 0.3s, opacity 1s 1.4s, transform 1s 1.4s;
  }
}

// ── 左側上下切換箭頭（複製原 banner16 tool_btn：直線 + 三角 SVG，直立排列；960 以下隱藏）──
.tool_btn {
  position: absolute;
  top: 50%;
  left: fluid(75.75);
  z-index: 2;
  transform: translate(-50%, -50%);
  transition: all 0.3s;

  @media (max-width: 1600px) { top: 40%; }
  @media (max-width: 1366px) { top: 35%; }
  @media (max-width: 1200px) { top: 30%; }
  @media (max-width: 960px) { display: none; }
}

// prev / next 皆為直立按鈕（原 <p>，上下排列）；SVG 為細線 + 三角，hover 轉主色
.tool_btn .prev,
.tool_btn .next {
  display: block;
  padding: 0 20px;
  background: none;
  border: none;
  cursor: pointer;

  svg {
    display: block;
    fill: #fff;
    transition: all 0.3s;
  }

  &:hover svg { fill: $web_color_1; }
}

// prev：箭頭朝上（原 scale(-1, 1)），與 next 之間留間距
.tool_btn .prev {
  margin-bottom: 35px;

  @media (max-width: 1200px) { margin-bottom: 20px; }

  svg { transform: scale(-1, 1); }
}

// next：箭頭朝下（原 scale(-1, -1)）
.tool_btn .next {
  svg { transform: scale(-1, -1); }
}
</style>
