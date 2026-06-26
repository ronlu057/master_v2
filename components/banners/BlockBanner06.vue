<script setup>
// 首頁 Banner block — 版型 06（主圖 swiper + 文字 cover swiper 雙向同步淡入；
// 文字採遮罩展開動畫，桌面左對齊、手機置中；附 pagination(手機)＋左右箭頭）
//
// 來源：D:\www\master_dev\template\module\banner\banner06.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner06.scss
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, slogan, link }
//     title  = 第一行（小標／英文，bannerTitleSize_en(2)，主色）
//     title2 = 主標（bannerTitleSize_en(1)，主色）
//     slogan = 標語（可含換行 \n → <br>，bannerTitleSize_en(3)）
//     link   = VIEW MORE 連結（可選）
// news：本版型未使用（保留以相容 dispatcher 介面）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  // BlockBanner01 介面相容（本版型無影片 / 無新聞，videoUrl、news 忽略）
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行標語：把 \n 轉成 <br>（對應原 PHP 內嵌 <br>）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── 兩個 Swiper 雙向同步（主圖切到第 i 張，cover 也切到第 i 張）
const mainSwiper = ref(null)
const coverSwiper = ref(null)
const onMainReady = (s) => {
  mainSwiper.value = s
  if (coverSwiper.value) {
    s.controller.control = coverSwiper.value
    coverSwiper.value.controller.control = s
  }
}
const onCoverReady = (s) => {
  coverSwiper.value = s
  if (mainSwiper.value) {
    s.controller.control = mainSwiper.value
    mainSwiper.value.controller.control = s
  }
}
</script>

<template>
  <section class="banner06">
    <!-- 主圖 swiper（fade、speed 1600；由 cover 的 autoplay 帶動同步） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[EffectFade, Controller]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :allow-touch-move="false"
      @swiper="onMainReady"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div>
          <div class="empty"></div>
          <div class="content">
            <picture>
              <source media="(min-width: 641px)" :srcset="row.image?.pc" />
              <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
            </picture>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 文字 cover swiper（fade、autoplay 5s、speed 1600；帶 pagination + 箭頭） -->
    <Swiper
      v-if="rows.length"
      class="index_cover"
      :modules="[Autoplay, EffectFade, Pagination, Navigation, Controller]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner06_prev', nextEl: '.banner06_next' }"
      @swiper="onCoverReady"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div class="wider_container" :class="`js-banner-row-${i}`">
          <ul>
            <li><div>{{ row.title }}</div></li>
            <li><component :is="i === 0 ? 'h1' : 'h2'">{{ row.title2 }}</component></li>
            <li><div v-html="toHtml(row.slogan)" /></li>
          </ul>

          <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title2 || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 左右箭頭（桌面 640 以下隱藏） -->
    <button class="banner06_prev banner_arrow white" type="button" aria-label="上一張"></button>
    <button class="banner06_next banner_arrow white" type="button" aria-label="下一張"></button>
  </section>
</template>

<style lang="scss" scoped>
// 原 master_dev 專用緩動（master_v2 _variables.scss 未提供，於此就地定義）
$banner06_block: cubic-bezier(0.6, 0, 0.3, 1); // 色塊／遮罩
$banner06_text: cubic-bezier(0.7, 0.2, 0.4, 1); // 文字展開

.banner06 {
  position: relative;
  margin-top: fluid(70);
}

// ── 主圖 swiper（高度扣掉上方 70px header 區） ──────────────
.index_banner {
  width: 100%;
  height: calc(100vh - 70px);
  z-index: 1;

  .swiper-wrapper {
    transition-timing-function: ease-in-out;
  }

  .swiper-slide {
    height: 100%;

    > div {
      display: flex;
      position: relative;
      height: 100%;

      // 主色斜切色塊（桌面才出現），active 時由左展開
      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 0;
        width: calc(1213 / 1903 * 100%);
        background: $web_color_2;
        transform-origin: left center;
        transform: scaleX(0);
        transition: transform 0.5s $banner06_block 0.3s;

        @media (max-width: 640px) {
          display: none;
        }
      }

      &::before {
        top: 0;
        height: calc(100% - 60 / 19.03 * 1vw);
        z-index: -1;
      }

      &::after {
        bottom: 0;
        height: calc(60 / 19.03 * 1vw);
        z-index: 1;
      }

      .empty {
        width: calc(310 / 19.2 * 1vw);

        @media (max-width: 640px) {
          display: none;
        }
      }

      .content {
        display: flex;
        justify-content: flex-end;
        position: relative;
        width: calc(100vw - 310 / 19.2 * 1vw);
        height: 100%;
        overflow: hidden;

        @media (max-width: 640px) {
          width: 100%;
        }

        // 手機暗罩（讓白字看得清）
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);

          @media (min-width: 641px) {
            display: none;
          }
        }

        picture {
          flex-shrink: 0;
          width: 100%;
          height: 100%;

          // FULLSCREEN：圖填滿並裁切（不論原圖比例）
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        // 白色拉幕（桌面），active 時收掉露出圖
        &::after {
          content: '';
          flex-shrink: 0;
          width: 100%;
          background: #fff;
          transition: width 0.8s $banner06_block;

          @media (max-width: 640px) {
            display: none;
          }
        }
      }
    }

    &.swiper-slide-active {
      > div {
        &::before,
        &::after {
          transform: scaleX(1);
          transition: transform 0.8s $banner06_block 1s;
        }

        .content::after {
          width: 0%;
          transition: width 0.8s $banner06_block 1.2s;
        }
      }
    }
  }
}

// ── 文字 cover swiper（疊在主圖之上） ───────────────────────
.index_cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .swiper-wrapper {
    transition-timing-function: ease-in-out;
  }

  .swiper-slide {
    height: 100%;

    .wider_container {
      display: flex;
      justify-content: center;
      flex-direction: column;
      height: 100%;
      padding: 0 calc(310 / 19.2 * 1vw + 30px);

      @media (max-width: 640px) {
        align-items: center;
        padding: 0 25px;
      }
    }

    ul li {
      position: relative;
      width: 0;
      overflow: hidden;

      @media (max-width: 640px) {
        width: 100%;
        text-align: center;
        opacity: 0;
        transform: translate(0, 40px);
      }

      > * {
        display: inline-block;
        position: relative;
        white-space: nowrap;
        overflow: hidden;

        @media (max-width: 640px) {
          white-space: normal;
        }

        // 白色遮罩，active 時滑開露出文字（桌面）
        &::after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
          transform: translateX(0%);
          transition: transform 0s $banner06_block 0.8s;

          @media (max-width: 640px) {
            display: none;
          }
        }
      }

      // 第一行：小標／英文（bannerTitleSize_en(2)）
      &:nth-child(1) {
        transition: width 0.5s $banner06_text;

        @media (max-width: 640px) {
          transition: opacity 0.5s, transform 0.5s;
        }

        > div {
          color: var(--banner-subtitle-color, $web_color_1);
          font-weight: 700;
          font-family: $title_font_en;
          text-transform: uppercase;
          text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
          font-size: clamp(19px, calc(23 / 19.2 * 1vw), calc(23 / 1920 * 2560 * 1px));

          @media (max-width: 640px) {
            color: var(--banner-subtitle-color, #fff);
          }
        }
      }

      // 第二行：主標（bannerTitleSize_en(1)）
      &:nth-child(2) {
        transition: width 0.5s $banner06_text 0.1s;

        @media (max-width: 640px) {
          transition: opacity 0.5s 0.1s, transform 0.5s 0.1s;
        }

        > * {
          color: var(--banner-title-color, $web_color_1);
          font-weight: 700;
          font-family: $title_font_en;
          line-height: 1.2;
          text-transform: uppercase;
          text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
          font-size: clamp(38px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

          @media (max-width: 640px) {
            color: var(--banner-title-color, #fff);
          }
        }
      }

      // 第三行：標語（bannerTitleSize_en(3)）
      &:nth-child(3) {
        transition: width 0.5s $banner06_text 0.2s;

        @media (max-width: 640px) {
          transition: opacity 0.5s 0.2s, transform 0.5s 0.2s;
        }

        > div {
          color: var(--banner-memo-color, #000);
          font-weight: 500;
          font-family: $title_font_en;
          text-transform: uppercase;
          text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
          font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));

          @media (max-width: 640px) {
            color: var(--banner-memo-color, #fff);
            text-wrap: balance;
          }

          :deep(br) {
            @media (max-width: 640px) {
              display: none;
            }
          }
        }
      }
    }

    // VIEW MORE 按鈕（對應原 .button06；btnMarginTop(1)）
    .cover_btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: fluid(12) fluid(32);
      border: 1px solid $web_color_1;
      color: $web_color_1;
      font-size: fluid-fz(14);
      letter-spacing: 2px;
      margin-top: fluid(55);
      opacity: 0;
      transform: translate(-40px, 0);
      transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

      @media (max-width: 1200px) { margin-top: 35px; }
      @media (max-width: 640px) { transform: translate(0, 40px); }

      &:hover {
        color: #fff;
        background: $web_color_1;
      }
    }
  }

  // 進場：active slide 內文字遮罩滑開、按鈕淡入
  .swiper-slide-active {
    ul li {
      width: 100%;

      @media (max-width: 640px) {
        opacity: 1;
        transform: translate(0, 0);
      }

      > *::after {
        transform: translateX(101%);
        transition: transform 0.8s $banner06_block;
      }

      &:nth-child(1) {
        transition: width 0.8s $banner06_text 1.7s;
        @media (max-width: 640px) { transition: opacity 1s 1s, transform 1s 1s; }
        > div::after { transition-delay: 2.1s; }
      }

      &:nth-child(2) {
        transition: width 0.8s $banner06_text 1.8s;
        @media (max-width: 640px) { transition: opacity 1s 1.1s, transform 1s 1.1s; }
        > *::after { transition-delay: 2.2s; }
      }

      &:nth-child(3) {
        transition: width 0.8s $banner06_text 1.9s;
        @media (max-width: 640px) { transition: opacity 1s 1.2s, transform 1s 1.2s; }
        > div::after { transition-delay: 2.3s; }
      }
    }

    .cover_btn {
      opacity: 1;
      transform: translate(0, 0);
      transition: all 0.3s, opacity 1s 2s, transform 1s 2s;

      @media (max-width: 640px) {
        transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
      }
    }
  }

  // pagination：僅手機顯示（桌面藏起）
  :deep(.swiper-pagination) {
    display: none;
    bottom: fluid(20);

    @media (max-width: 640px) {
      display: block;
    }
  }
}

// ── 左右箭頭（swiperArrowStyle(1)：40 / 35 / 30；640 以下隱藏） ──
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

  @media (max-width: 640px) { display: none; }

  // 邊框畫 V 形箭頭：置中穩定，不受字型字形影響
  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { background: #fff; color: $web_color_1; }
}
.banner06_prev {
  @include banner-nav-gap(left, fluid(20));
  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}
.banner06_next {
  @include banner-nav-gap(right, fluid(20));
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}
</style>
