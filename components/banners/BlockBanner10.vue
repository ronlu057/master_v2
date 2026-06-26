<script setup>
// 首頁 Banner block — 版型 10（全螢幕淡入主圖 + 左側文字 cover + 左側垂直進度指示 + 右側上下箭頭與圓點分頁）
//
// 來源：D:\www\master_dev\template\module\banner\banner10.php
//       D:\www\master_dev\template\module\banner\banner10.js
//       D:\www\master_dev\template\css\scss\module\banner\_banner10.scss
//
// rows 結構（每筆 = 一張主圖）：
//   { image: { pc, mb }, title, subtitle, link }
//     image.pc = 桌機大圖（min-width: 721px）
//     image.mb = 手機小圖
//     title    = 第一行（data_title3；moduleTitleSize_cht(1)、700）
//     subtitle = 第二行（data_title4；moduleTitleSize_en(2)、700）
//     link     = EXPLORE MORE 連結（可選，對應原 data_link，空則不顯示按鈕）
// title：版型 10 未使用（保留與 BlockBanner01 介面相容）
// news：版型 10 未使用（保留與 BlockBanner01 介面相容）
//
// 註：原 PHP 的 page-banner（$page != 'index'）部分由共用的 PageBanner01 處理，此處不轉換。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  // BlockBanner01 介面相容（本版型未使用 videoUrl / news）
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行文字：\n -> <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 左側垂直進度指示（目前頁 / 總頁數 + 進度條 top/height）
const current = ref(1)
const total = computed(() => props.rows.length)
const totalLabel = computed(() => String(total.value).padStart(2, '0'))
const currentLabel = computed(() => String(current.value).padStart(2, '0'))
const barHeight = computed(() => (total.value ? 100 / total.value : 100))
const barTop = computed(() => (current.value - 1) * barHeight.value)

const onSlideChange = (s) => {
  current.value = s.realIndex + 1
}
</script>

<template>
  <section class="banner10">
    <!-- 主圖 swiper（fade 切換，文字 cover 直接疊在 slide 上、隨 active 動畫進場） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ el: '.banner10 .swiper-pagination', clickable: true }"
      :navigation="{ prevEl: '.banner10 .tool_btn .prev', nextEl: '.banner10 .tool_btn .next' }"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div>
          <picture>
            <source media="(min-width: 721px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>

          <div class="cover_txt" :class="`js-banner-row-${i}`">
            <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
            <h2 v-if="row.subtitle" v-html="toHtml(row.subtitle)" />

            <div v-if="row.link" class="button_set">
              <NuxtLink class="cover_btn" :to="row.link" :title="row.title || 'EXPLORE MORE'"><span>EXPLORE MORE</span></NuxtLink>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 左側垂直進度指示（總頁數 / 進度條 / 目前頁，桌機才出現） -->
    <p v-if="rows.length > 1" class="tool_page">
      <span>{{ totalLabel }}</span>
      <span><span :style="{ height: barHeight + '%', top: barTop + '%' }"></span></span>
      <span>{{ currentLabel }}</span>
    </p>

    <!-- 右側上下箭頭 + 圓點分頁 -->
    <div v-show="rows.length > 1" class="tool_btn">
      <button class="banner_arrow prev" type="button" aria-label="上一張"></button>
      <div class="tool_dots">
        <div class="swiper-pagination"></div>
      </div>
      <button class="banner_arrow next" type="button" aria-label="下一張"></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner10 {
  position: relative;
}

// ── 主圖 swiper（全螢幕） ──────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
    height: 100%;

    > div {
      position: relative;
      height: 100%;
      background: #000;

      picture {
        display: block;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          filter: blur(10px);
        }
      }

      .cover_txt {
        position: absolute;
        top: 50%;
        left: calc(155 / 19.2 * 1vw);
        width: max-content;
        max-width: calc(100% - 155 / 19.2 * 2vw);
        transform: translate(0, -50%);

        > :nth-child(1),
        > :nth-child(2),
        > :nth-child(3):not(.button_set) {
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          opacity: 0;

          :deep(br) {
            @media (max-width: 720px) {
              display: none;
            }
          }
        }

        // 第一行（data_title3）：moduleTitleSize_cht(1)
        > :nth-child(1) {
          color: var(--banner-title-color, #fff);
          font-weight: 700;
          margin-bottom: fluid(10);
          font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
        }

        // 第二行（data_title4）：moduleTitleSize_en(2)
        > :nth-child(2) {
          color: var(--banner-subtitle-color, #fff);
          font-weight: 700;
          font-size: clamp(24px, calc(36 / 19.2 * 1vw), calc(36 / 1920 * 2560 * 1px));
        }

        // 第三行（保留位）：bannerTitleSize_cht(2)
        > :nth-child(3):not(.button_set) {
          color: var(--banner-memo-color, #fff);
          margin-top: fluid(25);
          font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        }

        .button_set {
          display: flex;
          align-items: center;
          gap: fluid(15);
          margin-top: fluid(55);
          opacity: 0;

          @media (max-width: 1200px) {
            margin-top: 35px;
          }
        }
      }
    }

    // 進場動畫：active slide 圖片去模糊 + 文字/按鈕依序上移淡入
    &.swiper-slide-active {
      > div {
        picture img {
          animation: banner10_img 0.3s 0.3s forwards;
        }

        .cover_txt {
          > :nth-child(1) { animation: goUp 1.6s 0.5s forwards; }
          > :nth-child(2) { animation: goUp 1.6s 0.8s forwards; }
          > :nth-child(3):not(.button_set) { animation: goUp 1.6s 1.1s forwards; }

          .button_set { animation: goUp 1.6s 1.4s forwards; }
        }
      }
    }
  }
}

@keyframes banner10_img {
  0%   { opacity: 0; filter: blur(10px); }
  100% { opacity: 1; filter: blur(0px); }
}

// 全站共用進場：下方上移淡入
@keyframes goUp {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

// ── 左側垂直進度指示 ──────────────────────────────────────
.tool_page {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: fluid(10);
  position: absolute;
  top: 50%;
  left: calc(47.5 / 16 * 0.5rem + 47.5 / 19.2 * 0.5vw);
  color: #fff;
  font-size: fluid-fz(16);
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0;
  transform: translate(-50%, -50%);
  z-index: 1;

  @media (max-width: 1024px) {
    display: none;
  }

  > span:nth-child(2) {
    display: block;
    position: relative;
    width: 2px;
    height: calc(360 / 19.2 * 1vw);
    background: #fff;

    span {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: $web_color_1;
      transition: all 1s;
    }
  }
}

// ── 右側上下箭頭 + 圓點分頁 ───────────────────────────────
.tool_btn {
  display: flex;
  align-items: center;
  gap: calc(55 / 19.2 * 1vw);
  position: absolute;
  top: 50%;
  right: calc(40 / 16 * 1rem + 40 / 19.2 * 1vw);
  transform: translateY(-50%);
  z-index: 1;

  @media (min-width: 1025px) {
    flex-direction: column;
  }

  @media (max-width: 1200px) {
    right: 3vw;
  }

  @media (max-width: 1024px) {
    top: unset;
    bottom: calc(15 / 16 * 1rem + 15 / 10.24 * 1vw);
    right: 50%;
    transform: translateX(50%);
  }

  .tool_dots {
    .swiper-pagination {
      display: flex;
      align-items: center;
      gap: calc(50 / 19.2 * 1vw);
      position: unset;
      transform: unset;

      @media (min-width: 1025px) {
        flex-direction: column;
      }

      @media (max-width: 1024px) {
        gap: 20px;
      }

      :deep(.swiper-pagination-bullet) {
        background: transparent;
        border: 1px solid #c9caca;
        opacity: 1;
        transition: all 0.2s;

        &.swiper-pagination-bullet-active {
          width: fluid(17);
          height: fluid(17);
          border: 2px solid $web_color_1;
          background: transparent;
        }
      }
    }
  }
}

// ── 上下箭頭（border V 形：置中穩定，不受字型字形影響） ──────
// 桌機直向排列（rotate 後變上 / 下）；1024 以下隱藏
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(20), 0, #fff, transparent);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  @media (max-width: 1024px) {
    display: none;
  }

  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  // 桌機：上下箭頭（prev 朝上、next 朝下）
  &.prev::before { transform: rotate(-45deg); }
  &.next::before { transform: rotate(135deg); }

  &:hover { color: $web_color_1; }
}

// VIEW MORE / EXPLORE MORE 按鈕（對應原 .button06）
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid $web_color_1;
  color: #fff;
  background: $web_color_1;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  transition: all 0.3s;

  &:hover {
    color: $web_color_1;
    background: transparent;
  }
}
</style>
