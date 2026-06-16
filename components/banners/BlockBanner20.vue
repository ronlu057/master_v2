<script setup>
// 首頁 Banner block — 版型 20（全螢幕淡入 + 中央產品物件圖 + 左側文字 + 雙按鈕）
//
// 來源：D:\www\master_dev\template\module\banner\banner20.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner20.scss
//
// 說明：fullscreen fade 輪播，每張含一張背景大圖（pc/mb 切換）、一張置中產品物件圖
//       （桌面置中、手機跟在文字下方）、標題、說明文字，以及最多兩顆按鈕
//       （VIEW MORE 內部連結、PLAY VIDEO 外部影片連結）。active slide 內各元素依序淡入。
//       page-banner 部分由共用 PageBanner01 處理，這裡只做首頁版。
//
// rows 結構（每筆）：
//   { image: { pc, mb }, object, title, memo, link, videoLink }
//     image.pc   = 背景大圖（min-width:641px 顯示）
//     image.mb   = 背景小圖（手機）
//     object     = 中央產品物件圖（桌面置中、手機在文字下方）
//     title      = 主標（主色、bannerTitleSize_en(1)）
//     memo       = 說明文字（白、可含換行、bannerTitleSize_cht(2)；<360 隱藏）
//     link       = VIEW MORE 內部連結（可選）
//     videoLink  = PLAY VIDEO 外部影片連結（可選，另開分頁）
// props.videoUrl、props.news：本版型未使用（保留以相容 BlockBanner 介面）
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
})

// 換行：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')
</script>

<template>
  <section class="banner20">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Navigation]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1600"
      :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false }"
      :navigation="{ prevEl: '.banner20_prev', nextEl: '.banner20_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div v-if="row.object" class="object">
          <img :src="row.object" alt="" />
        </div>

        <div class="content">
          <div class="wider_container">
            <div class="info">
              <component :is="i === 0 ? 'h1' : 'h2'">{{ row.title }}</component>
              <p v-if="row.memo" v-html="toHtml(row.memo)" />

              <div v-if="row.object" class="object_mb">
                <img :src="row.object" alt="" />
              </div>

              <div class="button_set">
                <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
                  <span>VIEW MORE</span>
                </NuxtLink>
                <a
                  v-if="row.videoLink"
                  class="cover_btn black"
                  :href="row.videoLink"
                  target="_blank"
                  rel="noopener"
                >
                  <span>PLAY VIDEO</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="banner20_prev banner_arrow" type="button" aria-label="上一張"></button>
    <button class="banner20_next banner_arrow" type="button" aria-label="下一張"></button>
  </section>
</template>

<style lang="scss" scoped>
.banner20 {
  position: relative;
}

// ── 主圖 swiper（fullscreen fade） ───────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      z-index: 1;
    }
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

  // 中央產品物件圖（桌面置中、手機隱藏）
  .object {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(800 / 1903 * 100%);
    z-index: 2;
    transform: translate(-50%, -50%);

    @media (max-width: 640px) {
      display: none;
    }

    img {
      width: 100%;
      opacity: 0;
      transform: translate(0, 40px);
      transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;
    }
  }

  .content {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    z-index: 2;
    transform: translateY(-50%);

    .info {
      width: 100%;

      > :nth-child(1),
      > :nth-child(2) {
        opacity: 0;
        transform: translate(40px, 0);

        @media (max-width: 640px) {
          text-align: center;
          transform: translate(0, 40px);
        }
      }

      // 第一行：主標（主色，bannerTitleSize_en(1)）
      > :nth-child(1) {
        color: $web_color_1;
        font-weight: 700;
        margin-bottom: fluid(7);
        font-size: clamp(38px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
        transition: all 0.3s, opacity 0.5s, transform 0.5s;
      }

      // 第二行：說明（白，bannerTitleSize_cht(2)）
      > :nth-child(2) {
        color: #fff;
        line-height: 1.7;
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        transition: all 0.3s, opacity 0.5s 0.1s, transform 0.5s 0.1s;

        @media (max-width: 360px) {
          display: none;
        }
      }

      // 手機版產品物件圖（跟在文字下方）
      .object_mb {
        @media (min-width: 641px) {
          display: none;
        }

        img {
          opacity: 0;
          transform: translate(0, 40px);
          transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;
        }
      }

      > .button_set {
        opacity: 0;
        transform: translate(40px, 0);
        transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

        @media (max-width: 640px) {
          justify-content: center;
          transform: translate(0, 40px);
        }
      }
    }
  }

  // 進場：active slide 內各元素依序淡入
  .swiper-slide-active {
    .object {
      img {
        opacity: 1;
        transform: translate(0, 0);
        transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s;
      }
    }

    .content {
      .info {
        > :nth-child(1),
        > :nth-child(2) {
          opacity: 1;
          transform: translate(0, 0);
        }

        > :nth-child(1) {
          transition: all 0.3s, opacity 1s 1s, transform 1s 1s;
        }

        > :nth-child(2) {
          transition: all 0.3s, opacity 1s 1.1s, transform 1s 1.1s;
        }

        .object_mb {
          img {
            opacity: 1;
            transform: translate(0, 0);
            transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s;
          }
        }

        > .button_set {
          opacity: 1;
          transform: translate(0, 0);
          transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s;
        }
      }
    }
  }
}

// 內距容器（對應原 .wider_container）
.wider_container {
  width: 100%;
  max-width: fluid(1903);
  padding: 0 calc(156 / 19.2 * 1vw);
  margin: 0 auto;

  @media (max-width: 640px) {
    padding: 0 25px;
  }
}

.button_set {
  display: flex;
  align-items: center;
  gap: fluid(15);
  margin-top: fluid(30);

  @media (max-width: 400px) {
    margin-top: 20px;
  }
}

// VIEW MORE / PLAY VIDEO 按鈕（對應原 .button06；.black 為深色變體）
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

  &.black {
    border-color: #fff;
    color: #fff;

    &:hover {
      color: $web_color_1;
      background: #fff;
    }
  }
}

// ── 左右箭頭（swiperArrowStyle(1)；1024 以下隱藏） ─────────────
.banner_arrow {
  position: absolute;
  top: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fluid(40);
  height: fluid(40);
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: $web_font_color;
  transform: translateY(-50%);
  transition: all 0.3s;

  @media (max-width: 1200px) { width: 35px; height: 35px; }
  @media (max-width: 1024px) { display: none; }

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
.banner20_prev {
  left: fluid(20);
  &::before { transform: rotate(-135deg); margin-left: 3px; }
}
.banner20_next {
  right: fluid(20);
  &::before { transform: rotate(45deg); margin-right: 3px; }
}
</style>
