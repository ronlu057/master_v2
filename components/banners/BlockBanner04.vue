<script setup>
// 首頁 Banner block — 版型 04（全螢幕淡入主圖 + 置中文字 cover：兩行標題 + 了解更多按鈕）
//
// 來源：D:\www\master_dev\template\module\banner\banner04.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner04.scss
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title2, title3, link }
//     title2 = 第一行標題（主標、bannerTitleSize_cht(1)，可含換行）
//     title3 = 第二行標題（次標，可含換行）
//     link   = 「了解更多」連結（可選）
// props.title / props.videoUrl / props.news：BlockBanner01 介面相容，本版型未使用
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 換行標題：把 \n 轉成 <br>（對應原 PHP 內容換行）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')
</script>

<template>
  <section class="banner04">
    <!-- 主圖 swiper（fade 切換，文字 cover 直接疊在 slide 上、隨 active 淡入） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
      :pagination="{ clickable: true }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div class="cover" :class="`js-banner-row-${i}`">
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
          <h2 v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
          <p v-if="row.memo" class="cover_memo" v-html="toHtml(row.memo)" />

          <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>{{ $t('btn.more') }}</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style lang="scss" scoped>
.banner04 {
  position: relative;
  margin-top: fluid(100);

  @media (min-width: 641px) {
    padding: 0 min(calc(75 / 19.2 * 1vw), calc(75 / 1920 * 2560 * 1px));
  }
}

// ── 主圖 swiper（高度扣掉上方 100px header 區） ──────────────
.index_banner {
  position: relative;
  width: 100%;
  height: calc(100vh - 100px);

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    picture {
      display: block;
      width: 100%;
      height: 100%;

      @media (min-width: 641px) {
        border-radius: 40px;
        isolation: isolate;
        overflow: hidden;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.03);
      }
    }

    .cover {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      text-align: center;
      padding: 0 fluid(15);
      transform: translateY(-50%);

      > * {
        opacity: 0;
        transform: translateY(40px);
      }

      // 第一行：主標（bannerTitleSize_cht(1)）
      > :nth-child(1) {
        color: var(--banner-title-color, #fff);
        font-weight: 700;
        font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
        transition: all 0.3s, opacity 0.8s 0.2s, transform 0.8s 0.2s;

        @media (min-width: 1201px) { letter-spacing: 2px; }

        br {
          @media (min-width: 681px) { display: none; }
        }

        span {
          @media (max-width: 680px) { display: none; }
        }
      }

      // 第二行：次標
      > :nth-child(2) {
        color: var(--banner-subtitle-color, #fff);
        font-size: clamp(19px, calc(24 / 19.2 * 1vw), calc(24 / 1920 * 2560 * 1px));
        font-weight: 700;
        margin-top: fluid(20);
        transition: all 0.3s, opacity 0.8s 0.1s, transform 0.8s 0.1s;

        br {
          @media (min-width: 541px) { display: none; }
        }

        span {
          @media (max-width: 540px) { display: none; }
        }
      }

      // 第三行：說明文
      .cover_memo {
        color: var(--banner-memo-color, #fff);
        font-size: clamp(15px, calc(17 / 19.2 * 1vw), calc(17 / 1920 * 2560 * 1px));
        line-height: 1.5;
        margin-top: fluid(15);
        transition: all 0.3s, opacity 0.8s 0.2s, transform 0.8s 0.2s;
      }

      // 了解更多按鈕（對應原 .button06 center；btnMarginTop(1)）
      .cover_btn {
        margin-top: fluid(55);
        transition: all 0.3s, opacity 0.8s, transform 0.8s;

        @include rwd-1200 { margin-top: 35px; }
      }
    }

    // active slide 進場：圖片緩慢放大、cover 內元素依序淡入
    &.swiper-slide-active {
      picture img {
        animation: banner04_zoom 8s linear forwards;
      }

      .cover {
        > * {
          opacity: 1;
          transform: translateY(0);
        }

        > :nth-child(1) {
          transition: all 0.3s, opacity 0.8s 1s, transform 0.8s 1s;
        }
        > :nth-child(2) {
          transition: all 0.3s, opacity 0.8s 1.1s, transform 0.8s 1.1s;
        }
        .cover_memo {
          transition: all 0.3s, opacity 0.8s 1.2s, transform 0.8s 1.2s;
        }
        .cover_btn {
          transition: all 0.3s, opacity 0.8s 1.3s, transform 0.8s 1.3s;
        }
      }
    }
  }

  // 分頁圓點：桌面靠右垂直排列，手機置中底部
  :deep(.swiper-pagination) {
    bottom: fluid(15);
    gap: fluid(10);

    @media (min-width: 641px) {
      display: flex;
      flex-direction: column;
      bottom: 50%;
      top: auto;
      left: auto;
      right: calc(75 / 19.2 * 1vw / 2);
      transform: translate(50%, 50%);
      width: auto;
    }
  }
}

@keyframes banner04_zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.03); }
}

// ── 了解更多按鈕（對應原 .button06 center） ───────────────────
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid #fff;
  color: #fff;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  transition: all 0.3s, opacity 0.8s, transform 0.8s;

  &:hover {
    color: $web_color_1;
    background: #fff;
  }
}
</style>
