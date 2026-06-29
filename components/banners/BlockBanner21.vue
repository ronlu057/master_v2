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

defineOptions({ supportsVideo: true }) // 此版型會渲染背景影片 → 後台才顯示影片欄位
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

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
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1`
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
})
</script>

<template>
  <section class="banner21">
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

              <!-- 桌面主標（對應原 .cus_txt；此版以一般文字呈現，去除滑鼠跟隨 SVG 特效） -->
              <component :is="i === 0 ? 'h1' : 'h2'" class="title_lg">
                {{ row.title }}
                <template v-if="row.subtitle"><br />{{ row.subtitle }}</template>
              </component>

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
          <svg>
            <circle cx="21px" cy="21px" r="20px"></circle>
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
      padding: 0 calc(156 / 19.2 * 1vw);
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

      // 桌面主標（對應原 .cus_txt 文字尺寸）→ 標題
      .title_lg {
        color: var(--banner-title-color, #fff);
        font-size: clamp(46px, calc(84 / 19.2 * 1vw), calc(84 / 1920 * 2560 * 1px));
        font-weight: 900;
        line-height: 1.15;
        text-transform: uppercase;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s, transform 0.5s;

        @media (max-width: 640px) {
          display: none;
        }
      }

      .paragraph {
        color: var(--banner-memo-color, #fff);
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s 0.1s, transform 0.5s 0.1s;
        // bannerTitleSize_cht(2)
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        margin-top: fluid(15);

        @media (max-width: 640px) {
          display: none;
        }
      }

      .button_set {
        display: flex;
        align-items: center;
        gap: fluid(15);
        margin-top: fluid(30);
        opacity: 0;
        transform: translate(40px, 0);
        transition: opacity 0.5s 0.2s, transform 0.5s 0.2s;

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
    .title_lg {
      opacity: 1;
      transform: translate(0, 0);
    }

    > .mb:nth-child(1) { transition: opacity 1s 1s, transform 1s 1s; }
    > .mb:nth-child(2) { transition: opacity 1s 1.1s, transform 1s 1.1s; }
    .title_lg { transition: opacity 1s 1s, transform 1s 1s; }

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
    padding: 0 calc(156 / 19.2 * 1vw);
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
  right: calc(85 / 19.2 * 1vw);
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
