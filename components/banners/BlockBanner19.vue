<script setup>
// 首頁 Banner block — 版型 19（全螢幕主圖 fade 輪播 + 左文右產品圖分欄）
//
// 來源（PHP 母版）：
//   D:\www\master_dev\template\module\banner\banner19.php
//   D:\www\master_dev\template\module\banner\banner19.js
//   D:\www\master_dev\template\css\scss\module\banner\_banner19.scss
//
// 每張 slide：背景大圖（含半透明黑遮罩 + 進場 zoom）疊上分欄內容：
//   左欄 .info — 三行文字（英文標題 / 中文主標 / 標語）+ VIEW MORE 按鈕
//   右欄 .pic  — 產品去背圖（og 圖）
// 文字與產品圖依序淡入（對應原 swiper-slide-active 動畫）。
// pagination 放在底部 .dots_box（桌面靠左對齊）。
//
// rows 結構（每筆）：
//   {
//     image: { pc, mb },   // pc=大圖(data_banner_basic)，mb=小圖(data_banner_basic_mb)
//     product,             // 右欄產品去背圖(data_type4_banner2_mb)
//     title,               // 第一行：英文/標題（bannerTitleSize_en(3)，可含換行）
//     title3,              // 第二行：中文主標（bannerTitleSize_cht(1)，可含換行）
//     title4,              // 第三行：標語（bannerTitleSize_cht(2)，可含換行）
//     link,                // VIEW MORE 連結（可選；空時不顯示按鈕）
//   }
// news：本版型未使用，僅為與其他 banner block 介面相容而保留。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
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
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 換行：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')
</script>

<template>
  <div class="banner19">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :pagination="{ el: '.banner19 .dots_box .swiper-pagination', clickable: true }"
      :navigation="{ prevEl: '.banner19_prev', nextEl: '.banner19_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.subtitle || ''" />
        </picture>

        <div class="content">
          <div class="wider_container">
            <div class="row no_gutter">
              <div class="info" :class="`js-banner-row-${i}`">
                <div v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
                <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
                <div v-if="row.memo" v-html="toHtml(row.memo)" />

                <div class="button_set">
                  <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'" target="_blank">
                    <span>VIEW MORE</span>
                  </NuxtLink>
                </div>
              </div>

              <div class="pic">
                <img v-if="row.product" :src="row.product" alt="" />
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="banner19_prev swiper-arrow" type="button" aria-label="上一張"></button>
    <button class="banner19_next swiper-arrow" type="button" aria-label="下一張"></button>

    <div class="dots_box">
      <div class="wider_container">
        <div class="swiper-pagination"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner19 {
  position: relative;
}

// ── 主圖 swiper（全螢幕 fade） ─────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .swiper-slide {
    position: relative;
    height: 100%;

    > picture {
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

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.35);
    }

    .content {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      transform: translateY(-50%);

      .row {
        align-items: center;
      }

      .info {
        width: calc(940 / 1600 * 100%);

        @media (max-width: 640px) {
          width: 100%;
          margin-bottom: 40px;
        }

        > * {
          opacity: 0;
          transform: translate(40px, 0);

          @media (max-width: 640px) {
            text-align: center;
            transform: translate(0, 40px);
          }

          // 第一行：英文/標題（bannerTitleSize_en(3)）→ 副標
          &:nth-child(1) {
            color: var(--banner-subtitle-color, #fff);
            font-weight: 600;
            margin-bottom: fluid(3);
            font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 0.5s, transform 0.5s;
          }

          // 第二行：中文主標（bannerTitleSize_cht(1)）→ 標題
          &:nth-child(2) {
            color: var(--banner-title-color, #fff);
            font-weight: 700;
            font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 0.5s 0.1s, transform 0.5s 0.1s;

            @media (min-width: 1201px) {
              letter-spacing: 2px;
            }
          }

          // 第三行：標語（bannerTitleSize_cht(2)）→ 說明文
          &:nth-child(3) {
            color: var(--banner-memo-color, #fff);
            margin-top: fluid(8);
            font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;
          }
        }

        .button_set {
          opacity: 0;
          transform: translate(40px, 0);
          transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

          @media (max-width: 640px) {
            justify-content: center;
            transform: translate(0, 40px);
          }
        }
      }

      .pic {
        width: calc(660 / 1600 * 100%);

        @media (max-width: 640px) {
          width: 100%;
        }

        img {
          margin: 0 auto;
          opacity: 0;
          transform: translate(-40px, 0);
          transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

          @media (max-width: 640px) {
            max-width: calc(300 / 430 * 100%);
            transform: translate(0, 40px);
          }
        }
      }
    }

    // 進場：active slide 內背景 zoom、文字與產品圖依序淡入
    &.swiper-slide-active {
      > picture img {
        animation: banner19_zoom 6s linear forwards;
      }

      .content {
        .info {
          > * {
            opacity: 1;
            transform: translate(0, 0);

            &:nth-child(1) { transition: all 0.3s, opacity 1s 1s, transform 1s 1s; }
            &:nth-child(2) { transition: all 0.3s, opacity 1s 1.1s, transform 1s 1.1s; }
            &:nth-child(3) { transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s; }
          }

          .button_set {
            opacity: 1;
            transform: translate(0, 0);
            transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
          }
        }

        .pic img {
          opacity: 1;
          transform: translate(0, 0);
          transition: all 0.3s, opacity 1s 1.4s, transform 1s 1.4s;
        }
      }
    }
  }
}

@keyframes banner19_zoom {
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

// ── 左右箭頭（swiperArrowStyle(1)；border 畫 V 形；桌面 1024 以下隱藏） ──
.swiper-arrow {
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

  @media (max-width: 1024px) { display: none; }

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
.banner19_prev {
  @include banner-nav-gap(left, fluid(20));
  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}
.banner19_next {
  @include banner-nav-gap(right, fluid(20));
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}

// ── pagination（底部，桌面靠左對齊） ─────────────────────────
.dots_box {
  position: absolute;
  bottom: fluid(40);
  left: 0;
  width: 100%;
  transition: all 0.3s;
  z-index: 1;

  @media (max-width: 1440px) { bottom: 30px; }
  @media (max-width: 1200px) { bottom: 20px; }

  :deep(.swiper-pagination) {
    @media (min-width: 721px) {
      position: unset;
      transform: unset;
      text-align: left;
    }
  }
}
</style>
