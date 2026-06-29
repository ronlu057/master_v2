<script setup>
// 首頁 Banner block — 版型 05（雙層同步：主圖 swiper + 文字 cover swiper）
//
// 來源：D:\www\master_dev\template\module\banner\banner05.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner05.scss
//
// 結構（忠實還原 PHP/JS）：
//   .index_banner（圖片層）與 .index_banner_cover（文字層）是兩個獨立 swiper，
//   透過 Controller 雙向同步（依索引，兩邊都不 loop）。
//   - 圖片層：桌面（≥721px）effect=slide、slidesPerView=auto，整層 scale(-1,1) 鏡射，
//     slide 帶 margin-top 揭幕 + picture translateX/灰幕淡出 + img 緩慢縮放（3~4s）；
//     手機（<721px）改 effect=fade。用 :key 在跨斷點時重建並重新接上 Controller。
//   - 文字層：effect=fade、autoplay 5s，且「乒乓」往返播放（reachEnd 反向、reachBeginning 正向），
//     不 loop；帶左右箭頭。
//   ※ 依原始 SCSS，本版型高度由圖片自然高度決定（非 100vh 滿版）。
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title2, title3, title4, link }
//     title2 = 第一行（小標，bannerTitleSize_cht(2)）
//     title3 = 主標（粗體，可含 <span>，</span> 與換行，moduleTitleSize_cht(1)）
//     title4 = 第三行（標語，bannerTitleSize_en(2)）
//     link   = VIEW MORE 連結（可選）
// 本版型不使用 videoUrl / news（保留與 BlockBanner01 介面相容，忽略）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true }, // 後台 bannerLoop：無限循環（本版型兩層皆不 loop，僅保留介面相容）
  autoplay: { type: Boolean, default: true }, // 後台 bannerAutoplay：自動播放
})

// title3 內含的 <span>，</span> 與 <br> 需原樣輸出 → 用 v-html（資料端標記）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 斷點：桌面 slide / 手機 fade（對應原 JS 的 matchMedia 721px 分流）
// SSR 預設 false（手機），掛載後再更新；跨斷點時靠 :key 重建 swiper
const isDesktop = ref(false)
let mq = null
const updateBreakpoint = () => { isDesktop.value = mq.matches }
onMounted(() => {
  mq = window.matchMedia('(min-width: 721px)')
  updateBreakpoint()
  mq.addEventListener('change', updateBreakpoint)
})
onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', updateBreakpoint)
})

// ── 兩個 Swiper 雙向同步（Controller） ────────────────────────
const mainSwiper = ref(null)
const coverSwiper = ref(null)
const linkControllers = () => {
  if (mainSwiper.value && coverSwiper.value) {
    mainSwiper.value.controller.control = coverSwiper.value
    coverSwiper.value.controller.control = mainSwiper.value
  }
}
const onMainReady = (s) => { mainSwiper.value = s; linkControllers() }
const onCoverReady = (s) => { coverSwiper.value = s; linkControllers() }

// 文字層 autoplay 乒乓往返（對應原 reachEnd / reachBeginning）
const onReachEnd = (s) => {
  s.params.autoplay.reverseDirection = true
  s.autoplay.start()
}
const onReachBeginning = (s) => {
  s.params.autoplay.reverseDirection = false
  s.autoplay.start()
}
</script>

<template>
  <section class="banner05">
    <!-- 圖片層（桌面 slide/auto 鏡射揭幕；手機 fade） -->
    <Swiper
      v-if="rows.length"
      :key="isDesktop ? 'pc' : 'mb'"
      class="index_banner"
      :modules="[EffectFade, Controller]"
      :effect="isDesktop ? 'slide' : 'fade'"
      :fade-effect="{ crossFade: true }"
      :slides-per-view="isDesktop ? 'auto' : 1"
      :centered-slides="false"
      :speed="3000"
      :allow-touch-move="false"
      @swiper="onMainReady"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 721px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>
      </SwiperSlide>
    </Swiper>

    <!-- 文字層（fade，跟主圖同步、autoplay 乒乓往返、左右箭頭） -->
    <Swiper
      v-if="rows.length"
      class="index_banner_cover"
      :modules="[Autoplay, EffectFade, Navigation, Controller]"
      :slides-per-view="1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="3000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :allow-touch-move="true"
      :breakpoints="{ 721: { allowTouchMove: false } }"
      :navigation="{ prevEl: '.banner05_prev', nextEl: '.banner05_next' }"
      @swiper="onCoverReady"
      @reach-end="onReachEnd"
      @reach-beginning="onReachBeginning"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div class="cover" :class="`js-banner-row-${i}`">
          <div v-if="row.title">{{ row.title }}</div>
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
          <div v-if="row.memo">{{ row.memo }}</div>

          <div v-if="row.link" class="button_set">
            <NuxtLink class="cover_btn" :to="row.link" :title="row.subtitle || 'VIEW MORE'"><span>VIEW MORE</span></NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 左右箭頭（cover 層導航；桌面 720 以下隱藏） -->
    <button class="banner05_prev banner_arrow" type="button" aria-label="上一張"></button>
    <button class="banner05_next banner_arrow" type="button" aria-label="下一張"></button>
  </section>
</template>

<style lang="scss" scoped>
.banner05 {
  position: relative;
  margin-top: fluid(70);
}

// ── 圖片層 ──────────────────────────────────────────────
.index_banner {
  z-index: 1;
  width: 100%;
  height: calc(100vh - 70px);

  // 桌面整層鏡射（picture 再各自 scale(-1,1) 轉回正向）
  @media (min-width: 721px) {
    transform: scale(-1, 1);
  }

  // swiper-wrapper 為 swiper 內部產生 → :deep
  :deep(.swiper-wrapper) {
    transition-timing-function: cubic-bezier(0.75, 0, 0.25, 1);

    @media (min-width: 721px) {
      &::after {
        content: '';
        display: block;
        flex-shrink: 0;
        width: calc(368 / 19.2 * 1vw);
      }
    }
  }

  .swiper-slide {
    overflow: hidden;
    height: 100%;

    @media (min-width: 721px) {
      width: 100%;
      padding-right: calc(368 / 19.2 * 1vw);
      margin-top: calc(99 / 19.2 * 1vw);
      transition: margin-top 3s ease-in-out, margin-left 3s ease-in-out;
    }

    &.swiper-slide-next {
      @media (min-width: 721px) {
        margin-left: calc(-368 / 19.2 * 1vw);
      }
    }

    picture {
      display: block;
      width: 100%;
      height: 100%;

      @media (min-width: 721px) {
        position: relative;
        transform: translateX(calc(92 / 16 * 1rem + 276 / 19.2 * 1vw - 116px)) scale(-1, 1);
        transition: transform 3s ease-in-out;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(#cbcbcb, 0.7);
          opacity: 1;
          transition: opacity 1s ease-in-out 3s;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        @media (min-width: 721px) {
          transform: scale(1.2);
          transform-origin: right center;
          transition: transform 4s ease-in-out;
        }
      }
    }

    &.swiper-slide-active {
      @media (min-width: 721px) {
        margin-top: 0;

        picture {
          transform: translateX(0) scale(-1, 1);

          &::after {
            opacity: 0;
            transition: opacity 1s ease-in-out;
          }

          img {
            transform: scale(1);
          }
        }
      }
    }
  }
}

// ── 文字層（cover，疊在圖片層之上、置中） ────────────────────
.index_banner_cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;

  :deep(.swiper-wrapper) {
    transition-timing-function: cubic-bezier(0.76, 0, 0.25, 1);
  }

  .swiper-slide {
    height: auto;
    pointer-events: none;

    @media (min-width: 721px) {
      padding: 0 0 0 calc(368 / 19.2 * 1vw - 40px);
    }
  }

  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    pointer-events: auto;

    @media (min-width: 721px) {
      width: 52%;
    }

    > * {
      opacity: 0;
      transform: translate(0, 40px);

      @media (max-width: 720px) {
        text-align: center;
      }
    }

    // 第一行：小標（bannerTitleSize_cht(2)）
    > :nth-child(1) {
      color: var(--banner-subtitle-color, $web_font_color);
      margin-bottom: fluid(5);
      font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
      transition: all 0.3s, opacity 1s 0.6s, transform 1s 0.6s;
    }

    // 第二行：主標（moduleTitleSize_cht(1)）
    > :nth-child(2) {
      color: var(--banner-title-color, $web_font_color);
      font-weight: 700;
      line-height: 1.3;
      font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
      transition: all 0.3s, opacity 1s 0.4s, transform 1s 0.4s;

      @media (max-width: 720px) {
        line-height: 1.7;
      }

      :deep(span) {
        @media (max-width: 720px) { display: none; }
      }
      :deep(br) {
        @media (min-width: 721px) { display: none; }
      }
    }

    // 第三行：標語（bannerTitleSize_en(2)）
    > :nth-child(3) {
      color: var(--banner-memo-color, $web_font_color);
      font-weight: 500;
      margin-top: fluid(20);
      font-size: clamp(19px, calc(23 / 19.2 * 1vw), calc(23 / 1920 * 2560 * 1px));
      transition: all 0.3s, opacity 1s 0.2s, transform 1s 0.2s;

      @media (max-width: 720px) {
        margin-top: 10px;
      }
    }

    .button_set {
      margin-top: fluid(30);
      transition: all 0.3s, opacity 1s, transform 1s;

      @media (max-width: 720px) {
        display: flex;
        justify-content: center;
      }
    }
  }

  // 進場：active slide 內各元素依序淡入
  .swiper-slide-active {
    .cover {
      > * {
        opacity: 1;
        transform: translate(0, 0);
      }

      > :nth-child(1) { transition: all 0.3s, opacity 1.5s 2s, transform 1.5s 2s; }
      > :nth-child(2) { transition: all 0.3s, opacity 1.5s 2.2s, transform 1.5s 2.2s; }
      > :nth-child(3) { transition: all 0.3s, opacity 1.5s 2.4s, transform 1.5s 2.4s; }
      .button_set { transition: all 0.3s, opacity 1.5s 2.6s, transform 1.5s 2.6s; }
    }
  }
}

// ── VIEW MORE 按鈕（對應原 .button06） ──────────────────────
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid $web_color_1;
  color: $web_color_1;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  transition: all 0.3s;

  &:hover {
    color: #fff;
    background: $web_color_1;
  }
}

// ── 左右箭頭（swiperArrowStyle(1)：40 / 35 / 30；720 以下隱藏） ──
.banner_arrow {
  position: absolute;
  top: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 50%, $web_font_color, rgba(255, 255, 255, 0.85));
  border: none;
  cursor: pointer;
  transform: translateY(-50%);
  transition: all 0.3s;

  @media (max-width: 720px) { display: none; }

  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { background: #fff; color: $web_color_1; }
}

.banner05_prev {
  @include banner-nav-gap(left, fluid(20));
  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}
.banner05_next {
  @include banner-nav-gap(right, fluid(20));
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}
</style>
