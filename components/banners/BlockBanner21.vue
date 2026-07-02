<script setup>
// 首頁 Banner block — 版型 21（全螢幕 fade 主圖 + 左側標題文字 + 右側數字進度環導航 + 可選 YouTube 背景影片）
//
// 來源：D:\www\master_dev\template\module\banner\banner21.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner21.scss
//
// 僅轉換首頁 banner（原 PHP $page == 'index'）；page-banner 由共用 PageBanner01 處理。
//
// rows 結構（每筆，對應原 foreach ($index_banner ...)）：
//   {
//     image:  { pc, mb },          // data_banner_basic / data_banner_basic_mb
//     title:  '',                  // data_title2（主標第一行）
//     title2: '',                  // data_title3（主標第二行，可空）
//     slogan: '',                  // data_title4（標語段落，可含換行）
//     videoUrl: '',                // data_type15_video_link（YouTube 連結，可選；桌面背景影片）
//     link:   '',                  // data_link（VIEW MORE 連結，可選）
//   }
// props.title：保留介面相容（本版型未使用）。
// props.videoUrl：保留介面相容；實際影片以每筆 row.videoUrl 為準。
// props.news：保留介面相容（本版型無最新消息浮窗，忽略）。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

defineOptions({
  supportsVideo: true, // 此版型會渲染背景影片 → 後台才顯示影片欄位
  accentColor: { name: '游標圓反白色', def: '#000000' }, // 大標滑鼠圓內反白的文字色（後台可換）
  circleSize: { name: '游標圓大小（半徑）', def: 96, min: 40, max: 240 }, // 反白圓半徑（後台可調）
})
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 後台「游標圓大小」→ 圓半徑（設計稿 px；SCSS 以此換算 fluid 鎖 2560）
const { state: siteState } = useEffectiveSettings()
const circleSize = computed(() => Number(siteState.bannerCircleSize) || 96)

// 換行標語：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── 序號（01、02…）對應原 str_pad
const padNum = (i) => String(i + 1).padStart(2, '0')

// ── 由 YouTube 連結取得 embed URL（自動 loop / mute / 無 controls）
//    支援 youtu.be/XXX 與 youtube.com/watch?v=XXX
const embedUrl = (url) => {
  if (!url) return ''
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!m) return ''
  const id = m[1]
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&vq=hd2160`
}

// ── 主圖 swiper 實例 + 目前 active index（驅動右側 dots_cus）
const mainSwiper = ref(null)
const activeIndex = ref(0)
const onMainReady = (s) => { mainSwiper.value = s }
const onSlideChange = (s) => { activeIndex.value = s.realIndex }

// 點數字環 → 切到該張（原 swiper.slideToLoop）
const goTo = (i) => {
  if (mainSwiper.value) mainSwiper.value.slideToLoop(i)
}

// ── 桌面大標「滑鼠跟隨圓形反白」（對應原 .cus_txt）：游標在大標上移動時，
//    reveal 主色字只在游標圓內顯現（圓形＝radial-gradient 遮罩）。以 rAF lerp 順滑跟隨。
let cusRaf = 0
let cusEl = null
let ctx = 0
let cty = 0
let ccx = 0
let ccy = 0
const cusTick = () => {
  ccx += (ctx - ccx) / 8 // lerp 拖尾（越大越即時）
  ccy += (cty - ccy) / 8
  if (cusEl) {
    cusEl.style.setProperty('--mx', `${ccx.toFixed(1)}px`)
    cusEl.style.setProperty('--my', `${ccy.toFixed(1)}px`)
  }
  cusRaf = requestAnimationFrame(cusTick)
}
const onCusMove = (e) => {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  ctx = e.clientX - r.left
  cty = e.clientY - r.top
  cusEl = el
  if (!cusRaf) cusRaf = requestAnimationFrame(cusTick)
}
const onCusLeave = (e) => {
  // 離開時圓形緩緩回到大標左上（近似原範本 mouseleave 復位）
  const r = e.currentTarget.getBoundingClientRect()
  ctx = r.width * 0.22
  cty = r.height * 0.45
}

// ── 桌面才掛背景影片（< 1024 不顯示，對應原 .content_video 隱藏 + JS matchMedia）
const isDesktop = ref(false)
let mq = null
const updateBreakpoint = () => { isDesktop.value = mq ? !mq.matches : false }
onMounted(() => {
  mq = window.matchMedia('(max-width: 1024px)')
  updateBreakpoint()
  mq.addEventListener('change', updateBreakpoint)
})
onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', updateBreakpoint)
  if (cusRaf) cancelAnimationFrame(cusRaf)
})
</script>

<template>
  <!-- --banner-circle-size：後台「游標圓大小」執行期變數（§3.1.2 允許的動態變數例外） -->
  <section class="banner21" :style="{ '--banner-circle-size': circleSize }">
    <!-- 主圖 swiper（fade 切換，每張疊文字 info、隨 active 淡入） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :pagination="{ el: '.banner21_pagination', clickable: true }"
      @swiper="onMainReady"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <!-- 桌面背景影片（每筆 row.videoUrl 可選） -->
        <div v-if="isDesktop && embedUrl(row.videoUrl)" class="content_video">
          <iframe
            :src="embedUrl(row.videoUrl)"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          />
        </div>

        <div class="content">
          <div class="wider_container">
            <div class="info" :class="`js-banner-row-${i}`">
              <div class="mb">
                {{ row.title }}
                <template v-if="row.subtitle"><br />{{ row.subtitle }}</template>
              </div>
              <div v-if="row.memo" class="mb" v-html="toHtml(row.memo)" />

              <!-- 桌面主標：滑鼠跟隨圓形反白（base 白字＝h1 供 SEO；reveal 主色字只在游標圓內顯現） -->
              <div class="cus_txt" @pointermove="onCusMove" @pointerleave="onCusLeave">
                <component :is="i === 0 ? 'h1' : 'h2'" class="cus_txt_base">
                  {{ row.title }}<template v-if="row.subtitle"><br />{{ row.subtitle }}</template>
                </component>
                <div class="cus_txt_reveal" aria-hidden="true">
                  {{ row.title }}<template v-if="row.subtitle"><br />{{ row.subtitle }}</template>
                </div>
              </div>

              <div v-if="row.memo" class="paragraph" v-html="toHtml(row.memo)" />

              <div class="button_set">
                <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
                  <span>VIEW MORE</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 底部分頁點（swiper-pagination） -->
    <div class="dots_box">
      <div class="wider_container">
        <div class="banner21_pagination"></div>
      </div>
    </div>

    <!-- 右側數字進度環導航（多於一張才出現） -->
    <div v-if="rows.length > 1" class="dots_cus">
      <div
        v-for="(row, i) in rows"
        :key="i"
        :class="{ active: i === activeIndex }"
        @click="goTo(i)"
      >
        <p>{{ padNum(i) }}</p>
        <div class="circle">
          <svg viewBox="0 0 42 42" aria-hidden="true">
            <circle cx="21" cy="21" r="20"></circle>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner21 {
  position: relative;
}

// ── 主圖 swiper（全螢幕） ─────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  :deep(.swiper-wrapper) {
    transition-timing-function: ease-in-out;
  }

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    > picture {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.03);
      }
    }

    &.swiper-slide-active > picture img {
      animation: banner21_zoom 6s linear forwards;
    }
  }

  .content {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    z-index: 2;
    transform: translateY(-50%);

    .wider_container {
      width: 100%;
      max-width: fluid(1920);
      padding: 0 fluid(156);
      margin: 0 auto;

      @media (max-width: 640px) {
        padding: 0 25px;
      }
    }

    .info {
      > .mb {
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translate(40px, 0);

        @media (max-width: 640px) {
          text-align: center;
          transform: translate(0, 40px);
        }

        // 手機文字（桌面以 .title_lg / .paragraph 取代）
        &.mb {
          @media (min-width: 641px) {
            display: none;
          }

          // 手機主標 → 標題
          &:nth-child(1) {
            color: var(--banner-title-color, #fff);
            font-weight: 900;
            text-transform: uppercase;
            transition: opacity 0.5s, transform 0.5s;
            // bannerTitleSize_cht(1)
            font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

            @media (min-width: 1201px) { letter-spacing: 2px; }
          }

          // 手機標語 → 說明文
          &:nth-child(2) {
            color: var(--banner-memo-color, #fff);
            font-size: clamp(22px, calc(28 / 19.2 * 1vw), calc(28 / 1920 * 2560 * 1px));
            font-weight: 500;
            margin-top: fluid(15);
            transition: opacity 0.5s 0.1s, transform 0.5s 0.1s;
          }
        }
      }

      // 桌面主標：滑鼠跟隨圓形反白（對應原 .cus_txt SVG 特效）
      .cus_txt {
        position: relative;
        display: inline-block;
        --mx: 22%; // 游標圓心（JS 動態覆寫）
        --my: 45%;
        // 圓半徑：後台「游標圓大小」(--banner-circle-size 設計稿 px) → fluid 換算、鎖 2560
        --cr: var(--banner-circle-size, 96);
        --r: clamp(calc(var(--cr) / 1920 * 1024 * 1px), calc(var(--cr) / 19.2 * 1vw), calc(var(--cr) / 1920 * 2560 * 1px));
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s, transform 0.5s;

        @media (max-width: 640px) {
          display: none;
        }
      }

      // base 白字（h1）與 reveal 主色字：同字型/字級/行高 → 完全疊合
      .cus_txt_base,
      .cus_txt_reveal {
        margin: 0;
        font-size: clamp(46px, calc(84 / 19.2 * 1vw), calc(84 / 1920 * 2560 * 1px));
        font-weight: 900;
        line-height: 1.15;
        text-transform: uppercase;
      }
      .cus_txt_base {
        color: var(--banner-title-color, #fff);
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      }
      // reveal：主色字，只在游標圓內顯現（radial-gradient 遮罩，圓心＝--mx/--my）
      .cus_txt_reveal {
        position: absolute;
        top: 0;
        left: 0;
        color: var(--banner-accent-color, #{$web_color_1}); // 後台「游標圓反白色」可換
        pointer-events: none;
        -webkit-mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 99%, transparent 100%);
        mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 99%, transparent 100%);
      }

      .paragraph {
        color: var(--banner-memo-color, #fff);
        margin-top: fluid(20); // 與上方大標拉開間距（範本靠 SVG 標題盒高，母版純文字需補）
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s 0.1s, transform 0.5s 0.1s;
        // bannerTitleSize_cht(2)
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));

        @media (max-width: 640px) {
          display: none;
        }
      }

      .button_set {
        display: flex;
        align-items: center;
        gap: fluid(15);
        margin-top: fluid(55);
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s 0.2s, transform 0.5s 0.2s;

        @include rwd-1200 {
          margin-top: 35px;
        }

        @media (max-width: 640px) {
          justify-content: center;
          transform: translate(0, 40px);
        }
      }
    }
  }

  // 進場：active slide 內文字與按鈕依序淡入
  .swiper-slide-active .content .info {
    > .mb,
    .cus_txt {
      opacity: 1;
      transform: translate(0, 0);
    }

    > .mb:nth-child(1) { transition: opacity 1s 1s, transform 1s 1s; }
    > .mb:nth-child(2) { transition: opacity 1s 1.1s, transform 1s 1.1s; }
    .cus_txt { transition: opacity 1s 1s, transform 1s 1s; }

    .paragraph {
      opacity: 1;
      transform: translate(0, 0);
      transition: opacity 1s 1.1s, transform 1s 1.1s;
    }

    .button_set {
      opacity: 1;
      transform: translate(0, 0);
      transition: opacity 1s 1.2s, transform 1s 1.2s;
    }
  }

  .content_video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;

    @media (max-width: 1024px) {
      display: none;
    }

    // iframe cover 公式：永遠填滿視窗，超出比例被裁切（無黑邊）
    iframe {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 56.25vw;
      min-width: 100%;
      min-height: 100vh;
      transform: translate(-50%, -50%);
      border: 0;
      pointer-events: none;
    }
  }
}

@keyframes banner21_zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.03); }
}

// VIEW MORE 按鈕（對應原 .button06）
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid $web_color_1;
  color: $web_color_1;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    color: #fff;
    background: $web_color_1;
  }
}

// ── 底部分頁點 ───────────────────────────────────────────
.dots_box {
  position: absolute;
  bottom: fluid(40);
  left: 0;
  width: 100%;
  z-index: 1;
  transition: all 0.3s;

  @media (max-width: 1440px) { bottom: 30px; }
  @media (max-width: 1200px) { bottom: 20px; }

  .wider_container {
    width: 100%;
    max-width: fluid(1920);
    padding: 0 fluid(156);
    margin: 0 auto;

    @media (max-width: 640px) { padding: 0 25px; }
  }

  :deep(.banner21_pagination) {
    @media (min-width: 721px) {
      position: unset;
      transform: unset;
      text-align: left;
    }

    .swiper-pagination-bullet {
      border-radius: fluid(50);
      transition: width 0.3s linear, background 0.3s linear;

      &.swiper-pagination-bullet-active {
        width: fluid(40);
      }
    }
  }
}

// ── 右側數字進度環導航 ───────────────────────────────────
.dots_cus {
  position: absolute;
  top: 50%;
  right: fluid(85);
  z-index: 1;
  transform: translateY(-50%);

  @media (max-width: 960px) {
    display: none;
  }

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: fluid(42);
    height: fluid(42);
    border-radius: 50%;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
    cursor: pointer;

    & + div {
      margin-top: fluid(18);
    }

    p {
      color: #fff;
      font-size: fluid-fz(14);
      font-weight: 500;
    }

    .circle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &::before {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        border: 1px solid #fff;
        border-radius: 50%;
      }

      svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);

        circle {
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-dashoffset: 360;
          stroke-dasharray: 360;
        }
      }
    }

    // active：目前播放那張，沿圓畫進度（對應範例 banner21_draw 18s）
    &.active .circle svg circle {
      animation: banner21_draw 18s linear;
    }
  }
}

@keyframes banner21_draw {
  0%   { stroke-dashoffset: 360; }
  100% { stroke-dashoffset: 0; }
}
</style>
