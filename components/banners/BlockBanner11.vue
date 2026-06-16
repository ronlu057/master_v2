<script setup>
// 首頁 Banner block — 版型 11（fade 主圖輪播 + 左側文字三行 + 填滿 VIEW MORE + 底部弧形遮罩）
//
// 來源（忠實對應 PHP/JS/SCSS）：
//   D:\www\master_dev\template\module\banner\banner11.{php,js}
//   D:\www\master_dev\template\css\scss\module\banner\_banner11.scss
//
// 結構（對應原 PHP）：
//   .index_banner  fade swiper（speed 2000、autoplay 5s、loop；只有 pagination、無箭頭）
//     swiper-slide > div > picture（主圖，active 時緩慢放大 1.0→1.03）
//                        > .cover_txt（3 行白字 + .button_set 內 VIEW MORE）
//     .swiper-pagination  桌面(≥1025) 直排於左側、手機(≤1024) 置底
//   .mask  底部白色弧形遮罩圖（banner11_mask.png，蓋住左右下角形成大圓弧），≤600 隱藏
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, title3, link }
//     title  = 第一行（moduleTitleSize_cht(1)，粗體）
//     title2 = 主標（bannerTitleSize_cht(1)，粗體）
//     title3 = 第三行（bannerTitleSize_en(2)）
//     link   = VIEW MORE 連結（可選）
// title / videoUrl / news：保留與 BlockBanner01 介面相容（本版型未使用）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  // 底部弧形遮罩圖（已將 banner11_mask.png 複製進 public/img/banner/）
  mask: { type: String, default: '/img/banner/banner11_mask.png' },
})
</script>

<template>
  <section class="banner11">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="2000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div>
          <picture>
            <source media="(min-width: 601px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>

          <div class="cover_txt">
            <div>{{ row.title }}</div>
            <component :is="i === 0 ? 'h1' : 'h2'">{{ row.title2 }}</component>
            <div>{{ row.title3 }}</div>

            <div v-if="row.link" class="button_set">
              <NuxtLink class="cover_btn" :to="row.link" :title="row.title2 || 'VIEW MORE'"><span>VIEW MORE</span></NuxtLink>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 底部白色弧形遮罩（蓋住左右下角形成大圓弧） -->
    <img v-if="mask" class="mask" :src="mask" alt="" />
  </section>
</template>

<style lang="scss" scoped>
.banner11 {
  position: relative;
}

.index_banner {
  height: 100vh;

  :deep(.swiper-wrapper) {
    transition-timing-function: ease-in-out;
  }

  .swiper-slide {
    height: 100vh;

    > div {
      display: block;
      position: relative;
      overflow: hidden;
      height: 100%;

      picture {
        display: block;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.03);
        }
      }

      .cover_txt {
        position: absolute;
        top: 50%;
        left: 8%;
        width: 84%;
        transform: translate(0, -50%);

        > * {
          color: #fff;
          opacity: 0;
          transform: translate(40px, 0);

          @media (max-width: 600px) {
            text-align: center;
            transform: translate(0, 40px);
          }

          // 第一行：moduleTitleSize_cht(1)
          &:nth-child(1) {
            font-weight: 700;
            font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 1s 0.15s, transform 1s 0.15s;
          }

          // 第二行：主標 bannerTitleSize_cht(1)
          &:nth-child(2) {
            font-weight: 700;
            font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 1s 0.3s, transform 1s 0.3s;

            @media (min-width: 1201px) { letter-spacing: 2px; }
          }

          // 第三行：bannerTitleSize_en(2)
          &:nth-child(3) {
            font-weight: 600;
            margin-top: fluid(6);
            font-size: clamp(19px, calc(23 / 19.2 * 1vw), calc(23 / 1920 * 2560 * 1px));
            transition: all 0.3s, opacity 1s 0.45s, transform 1s 0.45s;
          }
        }

        .button_set {
          margin-top: fluid(30);
          opacity: 0;
          transform: translate(40px, 0);
          transition: all 0.3s, opacity 1s 0.6s, transform 1s 0.6s;

          @media (max-width: 600px) {
            display: flex;
            justify-content: center;
            transform: translate(0, 40px);
          }
        }
      }
    }

    // active：主圖緩慢放大 + 文字／按鈕依序進場
    &.swiper-slide-active {
      > div {
        picture img {
          animation: banner11_zoom 7s linear forwards;
        }

        .cover_txt {
          > * {
            opacity: 1;
            transform: translate(0, 0);

            &:nth-child(1) { transition: all 0.3s, opacity 1s 1.15s, transform 1s 1.15s; }
            &:nth-child(2) { transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s; }
            &:nth-child(3) { transition: all 0.3s, opacity 1s 1.45s, transform 1s 1.45s; }
          }

          .button_set {
            opacity: 1;
            transform: translate(0, 0);
            transition: all 0.3s, opacity 1s 1.6s, transform 1s 1.6s;
          }
        }
      }
    }
  }

  // 分頁：桌面直排於左側、手機置底
  :deep(.swiper-pagination) {
    @media (min-width: 1025px) {
      display: flex;
      flex-direction: column;
      gap: 10px;
      top: 50%;
      bottom: unset;
      left: calc(60 / 19.2 * 1vw);
      width: auto;
      transform: translateY(-50%);
    }

    @media (max-width: 1024px) {
      bottom: 15px;
    }

    .swiper-pagination-bullet {
      width: fluid(10);
      height: fluid(10);
      background: #cfcfcf;
      opacity: 1;
      transition: all 0.3s;

      &.swiper-pagination-bullet-active {
        background: $web_color_1;
      }
    }
  }
}

@keyframes banner11_zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.03); }
}

// ── 底部弧形遮罩 ────────────────────────────────────────────
.mask {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 600px) {
    display: none;
  }
}

// ── VIEW MORE 按鈕（對應原 .button06：填滿品牌色、白字、hover 反白） ──
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: fluid(52);
  padding: 0 fluid(38);
  background: $web_color_1;
  border: 1px solid $web_color_1;
  transition: all 0.3s;

  span {
    color: #fff;
    font-family: $title_font_en;
    font-size: fluid-fz(15);
    letter-spacing: 1px;
    transition: all 0.3s;
  }

  &:hover {
    background: #fff;

    span { color: $web_color_1; }
  }
}
</style>
