<script setup>
// 首頁 Banner block — 版型 16（全螢幕主圖 + 視差浮層裝飾 + 直書中文標題）
//
// 來源：D:\www\master_dev\template\module\banner\banner16.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner16.scss
//
// 僅轉首頁 index banner（foreach $index_banner）；page-banner 由共用 PageBanner01 處理。
//
// rows 結構（每筆）：
//   {
//     image: { pc, mb },        // 主圖（大圖 pc / 小圖 mb）
//     title,                    // 直書第一行（可含換行，bannerTitleSize_cht(1)）
//     title2,                   // 直書第二行（可含換行，bannerTitleSize_cht(2)）
//     link,                     // 整張 slide 連結（可選）
//     decos: [                  // 視差浮層（0~3 個，對應原 deco_1/2/3）
//       { src, top, left, width, depth }
//       //  top/left = 百分比數字（不含 %）；width = 原圖像素寬（以 /1760 換算成 %）；
//       //  depth    = 視差深度（保留為 data-depth，桌面才掛 parallax；本版型以靜態定位呈現）
//     ]
//   }
// title / videoUrl / news：為與其他 BlockBanner 介面相容而保留，本版型未使用。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 浮層寬度：原 PHP calc(寬 / 1760 * 100%)
const decoWidth = (w) => `calc(${w} / 1760 * 100%)`
</script>

<template>
  <section class="banner16">
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
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner16_prev', nextEl: '.banner16_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <component
          :is="row.link ? 'NuxtLink' : 'div'"
          :to="row.link || undefined"
          :title="row.link ? (row.title || 'VIEW MORE') : undefined"
          class="banner_parallax"
        >
          <div class="layer">
            <picture>
              <source media="(min-width: 641px)" :srcset="row.image?.pc" />
              <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
            </picture>
          </div>

          <div
            v-for="(deco, di) in (row.decos || [])"
            :key="di"
            class="layer"
            :data-depth="deco.depth"
          >
            <div
              :class="`deco_${di + 1}`"
              :style="{ top: deco.top + '%', left: deco.left + '%', width: decoWidth(deco.width) }"
            >
              <img :src="deco.src" alt="" />
            </div>
          </div>

          <div class="cover_txt" :class="`js-banner-row-${i}`">
            <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
            <h2 v-if="row.title2" v-html="toHtml(row.title2)" />
          </div>
        </component>
      </SwiperSlide>
    </Swiper>

    <!-- 左右切換（原 .tool_btn 直線 SVG 箭頭 → 邊框 V 形箭頭；rows<=1 隱藏） -->
    <div v-if="rows.length > 1" class="tool_btn">
      <button class="banner16_prev banner_arrow prev" type="button" aria-label="上一張"></button>
      <button class="banner16_next banner_arrow next" type="button" aria-label="下一張"></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner16 {
  position: relative;

  @media (min-width: 961px) {
    background: url('../img/background/background05.png');
  }
}

// ── 主圖 swiper（全螢幕）─────────────────────────────────
.index_banner {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #fff;

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    .banner_parallax {
      display: block;
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    picture {
      display: block;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .layer {
      width: 100%;
      height: 100%;

      [class^="deco_"] {
        position: absolute;

        img {
          width: 100%;
        }
      }
    }

    .cover_txt {
      position: absolute;
      top: 32%;
      left: 8.5%;
      width: max-content;
      height: max-content;
      transition: all 0.3s;

      @media (min-width: 641px) {
        writing-mode: vertical-rl;
      }

      @media (min-width: 641px) and (max-width: 1200px) {
        top: 50%;
        left: 5%;
        transform: translateY(-50%);
      }

      @media (max-width: 640px) {
        top: unset;
        bottom: calc(130 / 4.8 * 1vw);
        left: 0;
        width: 100%;
        text-align: center;
        padding: 0 15px;
      }

      > * {
        color: #000;
        font-weight: 900;
        font-family: 'Noto Serif TC', serif;
        opacity: 0;
        transform: translateY(-40px);

        // 第一行：bannerTitleSize_cht(1)
        &:nth-child(1) {
          color: var(--banner-title-color, #000);
          transition: all 0.3s, opacity 1s, transform 1s;
          font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

          @media (min-width: 1201px) { letter-spacing: 2px; }

          @media (min-width: 641px) {
            margin-left: 15px;
          }

          @media (max-width: 640px) {
            margin-bottom: 20px;
          }
        }

        // 第二行：bannerTitleSize_cht(2)
        &:nth-child(2) {
          color: var(--banner-subtitle-color, #000);
          transition: all 0.3s, opacity 1s 0.3s, transform 1s 0.3s;
          font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        }

        :deep(br) {
          @media (max-width: 640px) {
            display: none;
          }
        }
      }
    }
  }

  // 進場：active slide 文字依序淡入
  .swiper-slide-active .banner_parallax .cover_txt > * {
    opacity: 1;
    transform: translateY(0);

    &:nth-child(1) {
      transition: all 0.3s, opacity 1s 1s, transform 1s 1s;
    }

    &:nth-child(2) {
      transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
    }
  }

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

// ── 左右箭頭（原 .tool_btn 直立排列；960 以下隱藏）──────────
.tool_btn {
  position: absolute;
  top: 50%;
  left: calc(75.75 / 19.2 * 1vw);
  z-index: 2;
  transform: translate(-50%, -50%);
  transition: all 0.3s;

  @media (max-width: 1600px) { top: 40%; }
  @media (max-width: 1366px) { top: 35%; }
  @media (max-width: 1200px) { top: 30%; }
  @media (max-width: 960px) { display: none; }
}

.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fluid(40);
  height: fluid(40);
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s;

  // 邊框畫 V 形箭頭：置中穩定，不受字型字形影響
  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { color: $web_color_1; }
}

.banner16_prev {
  margin-bottom: fluid(35);

  @media (max-width: 1200px) { margin-bottom: 20px; }

  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}

.banner16_next {
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}
</style>
