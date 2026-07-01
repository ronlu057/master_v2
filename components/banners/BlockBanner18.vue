<script setup>
// 首頁 Banner block — 版型 18（全螢幕淡入主圖 + 左側分層標題 cover + 右側直式頁碼/進度條/上下箭頭工具列）
//
// 來源：D:\www\master_dev\template\module\banner\banner18.php
//       D:\www\master_dev\template\module\banner\banner18.js
//       D:\www\master_dev\template\css\scss\module\banner\_banner18.scss
//
// 僅轉首頁 index banner（$page == 'index'）；page-banner 由共用 PageBanner01 處理。
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, title3, link }
//     image.pc = 大圖（min-width:641px）
//     image.mb = 小圖（手機）
//     title    = 第一行（英文/標題，bannerTitleSize_en(2)）
//     title2   = 主標（$title_font_en、bannerTitleSize_cht(1)），可含換行
//     title3   = 第三行（bannerTitleSize_cht(2)）
//     link     = VIEW MORE 連結（可選；有值才出按鈕）
// 本版型無影片與新聞；videoUrl / news 僅為與其他 banner 介面相容，未使用。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 換行欄位：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── 直式頁碼/進度條：追蹤目前 active index（對應原 banner18.js slideChange）
const total = computed(() => props.rows.length)
const current = ref(1)
// 進度條填滿高度與位移（100% / 頁數）
const barUnit = computed(() => (total.value ? 100 / total.value : 0))
const onSlideChange = (s) => {
  current.value = s.realIndex + 1
}
</script>

<template>
  <section class="banner18">
    <!-- 主圖 swiper（fade 切換，文字 cover 疊在 slide 上、隨 active 淡入） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="2000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :navigation="{ prevEl: '.banner18_prev', nextEl: '.banner18_next' }"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <!-- 段落順序固定（對應原 PHP 四行），讓 nth-child 動畫穩定；說明/內文用 <p>（製作規範 §2.6） -->
        <div class="cover" :class="`js-banner-row-${i}`">
          <p>{{ row.subtitle }}</p>
          <component :is="i === 0 ? 'h1' : 'h2'" v-html="toHtml(row.title)" />
          <div class="cover_line"><span></span></div>
          <p>{{ row.memo }}</p>

          <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 右側直式工具列：頁碼 + 進度條 + 上下箭頭（單張時隱藏） -->
    <div v-if="rows.length > 1" class="tool_btn">
      <p class="tool_page">
        <span>{{ current }}</span>－<span>{{ total }}</span>
        <span class="tool_bar">
          <span :style="{ height: barUnit + '%', top: (current - 1) * barUnit + '%' }"></span>
        </span>
      </p>
      <button class="banner18_prev banner_arrow prev" type="button" aria-label="上一張"></button>
      <button class="banner18_next banner_arrow next" type="button" aria-label="下一張"></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner18 {
  position: relative;
  background: #000;
}

// ── 主圖 swiper（全螢幕） ─────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;
  z-index: 1;

  :deep(.swiper-wrapper) {
    transition-timing-function: ease-in-out;
  }

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

    // 左側漸層遮罩（active 才滑入）
    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: fluid(680);
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
      opacity: 0;
      transform: translateX(-80px);
      transition: all 0.3s, opacity 1s, transform 1s;

      @include rwd-1440 {
        width: calc(600 / 14.4 * 1vw);
      }

      @media (max-width: 960px) {
        width: calc(460 / 9.6 * 1vw);
      }

      @media (max-width: 640px) {
        display: none;
      }
    }

    .cover {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      padding: 0 fluid(160);
      z-index: 2;
      transform: translateY(-50%);

      @media (max-width: 640px) {
        text-align: center;
        padding: 50px 10px;
        background: rgba(0, 0, 0, 0.5);
      }

      // 第一行：英文/標題（bannerTitleSize_en(2)）
      > :nth-child(1) {
        color: var(--banner-subtitle-color, #fff);
        font-weight: 600;
        font-family: $title_font_cht;
        font-size: clamp(19px, calc(23 / 19.2 * 1vw), calc(23 / 1920 * 2560 * 1px));
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translate(-40px, 0);
        transition: all 0.3s, opacity 1s 0.15s, transform 1s 0.15s;

        @media (max-width: 640px) {
          transform: translate(0, 40px);
        }
      }

      // 第二行：主標（$title_font_en、bannerTitleSize_cht(1)）
      > :nth-child(2) {
        position: relative;
        color: var(--banner-title-color, #fff);
        font-weight: 500;
        font-family: $title_font_en;
        font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        margin: 0 0 fluid(15);
        opacity: 0;
        transform: translate(-40px, 0);
        transition: all 0.3s, opacity 1s 0.3s, transform 1s 0.3s;

        @media (min-width: 1201px) {
          letter-spacing: 2px;
        }

        @media (max-width: 640px) {
          margin: 5px 0;
          transform: translate(0, 40px);
        }

        &::before {
          content: '';
          display: block;
          position: absolute;
          top: 50%;
          right: calc(100% + 13px);
          width: calc(#{fluid(160)} - 13px); // 與 cover padding 同步、且 2560 後鎖住（4K 不再無限長）
          height: 1px;
          background: rgba(255, 255, 255, 0.4);

          @media (max-width: 640px) {
            display: none;
          }
        }

        :deep(br) {
          @media (min-width: 441px) {
            display: none;
          }
        }
      }

      // 裝飾線（對應原 banner21_ob.svg 那一行）
      .cover_line {
        opacity: 0;
        transition: all 0.3s, opacity 1s 0.4s;

        span {
          display: inline-block;
          width: fluid(40);
          height: 2px;
          background: $web_color_1;
        }

        @media (max-width: 640px) {
          span {
            margin: 0 auto;
          }
        }
      }

      // 第三行（bannerTitleSize_cht(2)）
      > :nth-child(4) {
        color: var(--banner-memo-color, #fff);
        font-weight: 600;
        font-family: $title_font_cht;
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translate(-40px, 0);
        transition: all 0.3s, opacity 1s 0.45s, transform 1s 0.45s;

        @media (max-width: 640px) {
          transform: translate(0, 40px);
        }
      }

      // VIEW MORE 按鈕（對應原 .button06 → .cover_btn / btnMarginTop(1)）
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
        transition: all 0.3s, opacity 1s 0.6s, transform 1s 0.6s;

        @include rwd-1200 {
          margin-top: 35px;
        }

        @media (max-width: 640px) {
          margin: 0 auto;
          transform: translate(0, 40px);
        }

        &:hover {
          color: #fff;
          background: $web_color_1;
        }
      }
    }

    // 進場：active slide 放大動畫 + 遮罩滑入 + 文字依序淡入
    &.swiper-slide-active {
      picture img {
        animation: banner18_zoom 7s linear forwards;
      }

      &::before {
        opacity: 1;
        transform: translateX(0);
        transition: all 0.3s, opacity 1s 1s, transform 1s 1s;
      }

      .cover {
        > :nth-child(1),
        > :nth-child(2),
        > :nth-child(4),
        .cover_line {
          opacity: 1;
          transform: translate(0, 0);
        }

        > :nth-child(1) {
          transition: all 0.3s, opacity 1s 1.15s, transform 1s 1.15s;
        }

        > :nth-child(2) {
          transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
        }

        .cover_line {
          transition: all 0.3s, opacity 1s 1.4s;
        }

        > :nth-child(4) {
          transition: all 0.3s, opacity 1s 1.45s, transform 1s 1.45s;
        }

        .cover_btn {
          opacity: 1;
          transform: translate(0, 0);
          transition: all 0.3s, opacity 1s 1.6s, transform 1s 1.6s;
        }
      }
    }
  }
}

@keyframes banner18_zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.03); }
}

// ── 右側直式工具列 ──────────────────────────────────────
.tool_btn {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  top: 56%;
  right: fluid(108);
  transform: translateY(-50%);
  z-index: 2;

  @media (max-width: 840px) {
    display: none;
  }

  .tool_page {
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #fff;
    font-size: fluid-fz(15);
    line-height: 1.2;

    // 直式進度條（背景軌 + 填滿）
    .tool_bar {
      display: block;
      position: relative;
      width: 1px;
      height: fluid(103);
      margin: fluid(13) 0 fluid(10);
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s;

      @include rwd-1440 {
        height: 80px;
      }

      span {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background: #fff;
        transition: all 0.6s;
      }
    }
  }
}

// ── 上/下箭頭（邊框 V 形；swiperArrowStyle 直式版） ───────────
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(30), 0, #fff, transparent);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  // 邊框畫 V 形箭頭：9px 方塊，border-top + border-right 旋轉
  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover {
    color: $web_color_1;
  }
}
.banner18_prev {
  margin-bottom: fluid(28);
  &::before { transform: rotate(-45deg); margin-top: fluid(3); }

  @include rwd-1440 {
    margin-bottom: 15px;
  }
}
.banner18_next {
  &::before { transform: rotate(135deg); margin-bottom: fluid(3); }
}
</style>
