<script setup>
// 首頁 Banner block — 版型 17（全螢幕淡入主圖 + 置中文字 cover：中文標題 + 英文副標 + VIEW MORE）
//
// 來源：D:\www\master_dev\template\module\banner\banner17.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner17.scss
//
// 僅轉換首頁 index banner（$page == 'index'）；page banner 由共用 PageBanner01 處理。
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, link }
//     image.pc = 桌面大圖（min-width:721px）
//     image.mb = 手機小圖（fallback 用 pc）
//     title    = 第一行（中文標題，bannerTitleSize_cht(1)、$title_font_cht）
//     title2   = 第二行（英文標題，bannerTitleSize_en(1)、$title_font_en）
//     link     = VIEW MORE 連結（可選，空則不顯示按鈕）
// news：本版型未使用（保留以相容 BlockBanner01/02 介面）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  // BlockBanner01 介面相容（本版型無影片，videoUrl 忽略）
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行欄位：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')
</script>

<template>
  <section class="banner17">
    <!-- 主圖 swiper（fade 切換，文字 cover 直接疊在 slide 上、隨 active 淡入） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation, Controller]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner17_prev', nextEl: '.banner17_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 721px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div class="cover" :class="`js-banner-row-${i}`">
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
          <h2 v-if="row.title2" v-html="toHtml(row.title2)" />

          <NuxtLink v-if="row.link" class="cover_btn center" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="banner17_prev banner_arrow" type="button" aria-label="上一張"></button>
    <button class="banner17_next banner_arrow" type="button" aria-label="下一張"></button>
  </section>
</template>

<style lang="scss" scoped>
.banner17 {
  position: relative;
  background: #000;
}

// ── 主圖 swiper（全螢幕） ─────────────────────────────────
.index_banner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100vh;

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    picture {
      display: block;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.03);
      }
    }

    .cover {
      position: absolute;
      bottom: calc(135 / 19.2 * 1vw + 40px);
      left: 50%;
      width: max-content;
      max-width: 100%;
      text-align: center;
      padding: 0 fluid(25);
      transform: translate(-50%, 0%);

      @media (max-width: 1024px) {
        bottom: 60px;
      }

      @media (max-width: 720px) {
        bottom: 35%;
        transform: translate(-50%, 50%);
      }

      // 第一行：中文標題（bannerTitleSize_cht(1)）
      > :nth-child(1) {
        color: var(--banner-title-color, #fff);
        font-weight: 500;
        font-family: $title_font_cht;
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateX(-40px);
        transition: all 0.3s, opacity 1s, transform 1s;
        font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

        @media (min-width: 1201px) { letter-spacing: 2px; }
      }

      // 第二行：英文標題（bannerTitleSize_en(1)）
      > :nth-child(2) {
        color: var(--banner-subtitle-color, #fff);
        font-weight: 700;
        font-family: $title_font_en;
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
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

    // active slide：主圖緩慢放大 + 文字依序淡入
    &.swiper-slide-active {
      picture img {
        animation: banner17_zoom 6s linear forwards;
      }

      .cover {
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
  }

  :deep(.swiper-pagination) {
    bottom: calc(135 / 19.2 * 1vw);

    @media (max-width: 1024px) {
      bottom: 20px;
    }
  }
}

@keyframes banner17_zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.03); }
}

// VIEW MORE 按鈕（對應原 .button06 center，改用 .cover_btn + $web_color_1）
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

  &.center { justify-content: center; }

  &:hover {
    color: #fff;
    background: $web_color_1;
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

  // 邊框畫 V 形箭頭：置中穩定，不受字型字形影響
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
