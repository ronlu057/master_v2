<script setup>
// 首頁 Banner block — 版型 07（左右分割：左欄文字＋產品輪播，右欄全螢幕主圖輪播）
//
// 來源：D:\www\master_dev\template\module\banner\banner07.php
//       D:\www\master_dev\template\module\banner\banner07.js
//       D:\www\master_dev\template\css\scss\module\banner\_banner07.scss
//
// rows 結構（每筆 = 一張主圖 + 對應產品）：
//   { image: { pc, mb }, link, title, name, memo }
//     image.pc / image.mb = 右欄主圖（桌機 / 手機）
//     link  = 產品連結（可選）
//     title = 左欄產品圖 alt / 顯示名稱
//     name  = 左下產品名稱（顯示於編號下方；未填則用 title）
//     memo  = 左上區塊說明文字（可含換行；只取第一筆 row 顯示）
// title：左上區塊大標（可選，顯示於 memo 上方）
// news：版型 07 未使用（保留與 BlockBanner01 介面相容）
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
  loop: { type: Boolean, default: true }, // 後台 bannerLoop：無限循環
  autoplay: { type: Boolean, default: true }, // 後台 bannerAutoplay：自動播放
})

// 換行文字：\n -> <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 右欄主圖 swiper：頁碼指示（目前頁 / 總頁數 + 進度條）
const current = ref(1)
const total = computed(() => props.rows.length)
const barHeight = computed(() => (total.value ? 100 / total.value : 100))
const barTop = computed(() => (current.value - 1) * barHeight.value)

const onMainSlideChange = (s) => {
  current.value = s.realIndex + 1
}

// 左下產品名稱（跟著產品 swiper 切換）
const productName = ref('')
const productNum = ref('01')
const onProductSlideChange = (s) => {
  const i = s.realIndex
  productNum.value = String(i + 1).padStart(2, '0')
  const row = props.rows[i]
  productName.value = (row && row.subtitle) || ''
}

// 初始化左下產品資訊
const firstRow = computed(() => props.rows[0] || {})
const initName = computed(() => firstRow.value.subtitle || '')
</script>

<template>
  <section class="banner07">
    <div class="left">
      <!-- 上：文字區塊（背景圖 + 說明 + VIEW MORE） -->
      <div class="top">
        <NuxtLink class="logo" to="/">
          <img src="" alt="" />
        </NuxtLink>

        <div class="editor" :class="'js-banner-row-0'">
          <h1 v-if="title" class="editor_title">{{ title }}</h1>
          <p v-if="firstRow.title" v-html="toHtml(firstRow.title)" />
        </div>

        <div v-if="firstRow.link" class="button_set">
          <NuxtLink class="cover_btn" :to="firstRow.link"><span>VIEW MORE</span></NuxtLink>
        </div>
      </div>

      <!-- 下：產品輪播（編號 + 圖 + 名稱 + 上下一個） -->
      <div class="bottom">
        <div class="index_product">
          <span class="index_product_num">{{ productNum }}</span>

          <Swiper
            v-if="rows.length"
            class="index_banner_product"
            :modules="[Autoplay, Pagination, Navigation]"
            :slides-per-view="1"
            :loop="loop && rows.length > 1"
            :speed="1000"
            :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
            :pagination="{ clickable: true }"
            :navigation="{ prevEl: '.product_prev', nextEl: '.product_next' }"
            @slide-change="onProductSlideChange"
          >
            <SwiperSlide v-for="(row, i) in rows" :key="i">
              <NuxtLink :to="row.link || ''" :title="row.subtitle || 'VIEW MORE'">
                <img :src="row.image?.pc || row.image?.mb" :alt="row.alt || row.subtitle || ''" />
              </NuxtLink>
              <p>{{ row.subtitle }}</p>
            </SwiperSlide>
          </Swiper>

          <p class="index_product_name">{{ productName || initName }}</p>
        </div>

        <div v-if="rows.length > 1" class="button_set">
          <button class="product_prev banner_arrow prev" type="button" aria-label="上一個產品"></button>
          <button class="product_next banner_arrow next" type="button" aria-label="下一個產品"></button>
        </div>
      </div>
    </div>

    <!-- 右：全螢幕主圖輪播 -->
    <div class="right">
      <Swiper
        v-if="rows.length"
        class="index_banner"
        :modules="[EffectFade, Navigation]"
        :slides-per-view="1"
        :loop="loop && rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :navigation="{ prevEl: '.main_prev', nextEl: '.main_next' }"
        @slide-change="onMainSlideChange"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <picture>
            <source media="(min-width: 641px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.subtitle || ''" />
          </picture>
        </SwiperSlide>
      </Swiper>

      <div v-if="rows.length > 1" class="tool_btn">
        <p class="tool_page">
          <span>{{ current }}</span>－<span>{{ total }}</span>
          <span class="tool_bar">
            <span :style="{ height: barHeight + '%', top: barTop + '%' }"></span>
          </span>
        </p>
        <button class="main_prev banner_arrow prev" type="button" aria-label="上一張"></button>
        <button class="main_next banner_arrow next" type="button" aria-label="下一張"></button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner07 {
  display: flex;

  @media (max-width: 640px) {
    position: relative;
    flex-wrap: wrap;
    flex-direction: column-reverse;
  }
}

// ── 左欄 ─────────────────────────────────────────────────
.left {
  display: flex;
  flex-direction: column;
  width: calc(700 / 1920 * 100%);

  @media (min-width: 641px) { height: 100vh; }
  @media (max-width: 840px) { width: calc(355 / 840 * 100%); }
  @media (max-width: 720px) { width: calc(300 / 640 * 100%); }
  @media (max-width: 640px) { width: 100%; }

  .top {
    display: flex;
    flex-direction: column;
    padding: 0 calc(80 / 19.2 * 1vw) fluid(30);
    background: $web_color_2 no-repeat center center / cover;

    @media (min-width: 641px) { height: calc(495 / 840 * 100%); }
    @media (max-width: 640px) { padding: 30px calc(80 / 19.2 * 1vw); }

    .logo {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: fluid(70);
      margin-bottom: fluid(25);
      visibility: hidden;

      @media (max-width: 640px) {
        position: absolute;
        top: 0;
        left: calc(80 / 19.2 * 1vw);
        z-index: 1;
      }

      img {
        max-height: fluid(60);

        @media (max-width: 640px) {
          max-height: calc(16 / 16 * 1rem + 24 / 6.4 * 1vw);
        }
      }
    }

    .editor {
      margin-top: auto;
      color: #fff;

      // text_scroll_y(21px, 14)
      max-height: 21px * 14;
      overflow-x: hidden;
      overflow-y: auto;

      .editor_title {
        // bannerTitleSize_cht(2)
        color: var(--banner-title-color, #fff);
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        font-weight: 700;
        margin-bottom: fluid(10);
      }

      p {
        // bannerTitleSize_cht(3)
        color: var(--banner-memo-color, #fff);
        font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));
        line-height: 1.6;
      }

      &::-webkit-scrollbar { width: 3px; }

      &::-webkit-scrollbar-track {
        background-image: linear-gradient(to bottom, #acacac, #acacac);
        background-size: 1px 100%;
        background-position: center top;
        background-repeat: no-repeat;
      }

      &::-webkit-scrollbar-thumb,
      &::-webkit-scrollbar-thumb:hover {
        background: #fff;
      }
    }

    .button_set {
      display: flex;
      gap: fluid(12);
      margin-top: fluid(30);

      @media (max-width: 640px) { justify-content: center; }
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    position: relative;
    padding: fluid(30) calc(80 / 19.2 * 1vw) calc(44 / 16 * 1rem + 10 / 19.2 * 1vw);
    background: $web_color_2;

    @media (min-width: 641px) { height: calc(345 / 840 * 100%); }
    @media (max-width: 640px) {
      padding: 30px calc(80 / 19.2 * 1vw) calc(44 / 16 * 1rem + 10 / 6.4 * 1vw);
    }

    .index_product {
      position: relative;
      width: 100%;
      height: 100%;

      .index_product_num {
        position: absolute;
        top: calc(0vw - 20 / 19.2 * 1vw);
        left: 0;
        color: rgba(#fefefe, 0.41);
        font-size: clamp(59px, calc(148 / 19.2 * 1vw), calc(148 / 1920 * 2560 * 1px));
        font-weight: 900;
        font-family: $title_font_en;
        line-height: 1;

        @media (max-width: 640px) {
          top: calc(0vw - 20 / 6.4 * 1vw);
          font-size: calc(135 / 6.4 * 1vw);
        }
      }

      .index_product_name {
        position: absolute;
        top: 100%;
        width: 100%;
        color: #fff;
        font-size: clamp(17px, calc(24 / 19.2 * 1vw), calc(24 / 1920 * 2560 * 1px));
        font-weight: 700;
        line-height: 1;
        text-align: right;

        @media (max-width: 640px) { font-size: calc(12 / 16 * 1rem + 12 / 6.4 * 1vw); }
        @media (max-width: 480px) { display: none; }
      }

      .index_banner_product {
        width: 100%;
        height: 100%;

        .swiper-slide {
          a {
            display: flex;
            align-items: center;
            height: 100%;

            img {
              max-height: 100%;
              margin: 0 auto;
            }
          }

          p {
            color: #fff;
            font-size: calc(12 / 16 * 1rem + 12 / 6.4 * 1vw);
            font-weight: 700;
            text-align: center;
            margin-top: fluid(30);

            @media (min-width: 481px) { display: none; }
          }
        }

        :deep(.swiper-pagination) {
          bottom: fluid(-30);
          display: none;

          @media (max-width: 640px) { display: block; }

          .swiper-pagination-bullet {
            background: #fff;
            opacity: 0.4;

            &.swiper-pagination-bullet-active { opacity: 1; }
          }
        }
      }
    }

    .button_set {
      display: flex;
      gap: fluid(10);
      position: absolute;
      bottom: fluid(18);
      left: fluid(8);
      z-index: 1;

      @media (max-width: 480px) { display: none; }
    }
  }
}

// ── 右欄：全螢幕主圖 ──────────────────────────────────────
.right {
  position: relative;
  width: calc(1220 / 1920 * 100%);

  @media (max-width: 840px) { width: calc(485 / 840 * 100%); }
  @media (max-width: 720px) { width: calc(340 / 640 * 100%); }
  @media (max-width: 640px) { width: 100%; }

  .index_banner {
    width: 100%;
    height: 100vh;

    .swiper-slide {
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
  }

  .tool_btn {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: absolute;
    top: 56%;
    right: calc(40 / 19.2 * 1vw);
    transform: translateY(-50%);
    z-index: 1;

    @media (max-width: 640px) { display: none; }

    .tool_page {
      display: flex;
      align-items: center;
      flex-direction: column;
      color: #fff;
      font-size: fluid-fz(15);
      line-height: 1.2;

      .tool_bar {
        display: block;
        position: relative;
        width: 1px;
        height: fluid(103);
        margin: fluid(13) 0 fluid(10);
        background: rgba(#fff, 0.2);
        transition: all 0.3s;

        @media (max-width: 1440px) { height: 80px; }

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
}

// ── 箭頭（border V 形：垂直置中穩定；swiperArrowStyle 尺寸） ──
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 0, #fff, transparent);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  // 邊框畫 V 形箭頭：置中穩定，不受字型字形影響
  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &.prev::before { transform: rotate(-135deg); margin-left: fluid(3); }
  &.next::before { transform: rotate(45deg); margin-right: fluid(3); }

  &:hover { color: $web_color_2; }
}

// 右欄主圖箭頭（直向排列於頁碼下方）
.tool_btn {
  .banner_arrow {
    width: auto;
    height: auto;
    color: #fff;

    &::before {
      width: fluid(8);
      height: fluid(8);
      border-width: 2px;
    }

    &.prev {
      margin-bottom: fluid(28);
      @media (max-width: 1440px) { margin-bottom: 15px; }
      &::before { transform: rotate(-45deg); margin-left: 0; }
    }

    &.next {
      &::before { transform: rotate(135deg); margin-right: 0; }
    }

    &:hover { color: $web_color_1; }
  }
}

// 左下產品箭頭
.bottom .button_set .banner_arrow {
  width: fluid(25);
  height: fluid(45);
}

// VIEW MORE 按鈕（對應原 .button06）
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid #fff;
  color: #fff;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  transition: all 0.3s;

  &:hover {
    color: $web_color_1;
    background: #fff;
  }
}
</style>
