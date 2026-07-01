<script setup>
// 首頁 Banner block — 版型 07（左右分割：左欄文字＋產品輪播，右欄全螢幕主圖輪播）
//
// 來源：D:\www\master_dev\template\module\banner\banner07.php
//       D:\www\master_dev\template\module\banner\banner07.js
//       D:\www\master_dev\template\css\scss\module\banner\_banner07.scss
//
// rows 結構（每筆 = 一張主圖 + 對應產品）：
//   { image: { pc, mb }, product: { pc, mb }, link, title, subtitle, memo }
//     image.pc / image.mb   = 右欄主圖（桌機 / 手機）
//     product.pc / .mb      = 左下產品去背圖（可另上傳；未填退回 image）
//     link                  = 產品連結（可選）
//     title                 = 左下產品名稱（顯示於編號下方；第一則 h1、其後 h2）
//     subtitle              = 左上副標（顯示於說明文上方；只取第一筆 row）
//     memo                  = 左上說明文字（可含換行；只取第一筆 row）
// title（prop）/ news：版型 07 未使用（保留與 BlockBanner01 介面相容）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// 左下產品圖可「另外上傳」（每則一張，去背 PNG/SVG）；右大圖用 row.image；
// 左上文字區可上「整個版型一張」背景圖（topImage 能力 → 後台單張上傳）
defineOptions({
  leftImage: { name: '左下產品圖', hint: '產品去背圖（PNG / SVG）' },
  topImage: { name: '左上背景圖', hint: '左上文字區底圖（整個版型一張）' },
})
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

// 右大圖 swiper 與左下產品 swiper 雙向同步（Controller）→ 大圖 / 產品圖 / 標題同時更換
const mainSwiper = ref(null)
const productSwiper = ref(null)
const linkControllers = () => {
  if (mainSwiper.value && productSwiper.value) {
    mainSwiper.value.controller.control = productSwiper.value
    productSwiper.value.controller.control = mainSwiper.value
  }
}
const onMainReady = (s) => {
  mainSwiper.value = s
  linkControllers()
}
const onProductReady = (s) => {
  productSwiper.value = s
  linkControllers()
}

// 目前頁（1-based）：單一來源，驅動頁碼 / 進度條 / 左上文字 / 左下標題
const current = ref(1)
const total = computed(() => props.rows.length)
const barHeight = computed(() => (total.value ? 100 / total.value : 100))
const barTop = computed(() => (current.value - 1) * barHeight.value)
const productNum = computed(() => String(current.value).padStart(2, '0'))
const onSlideChange = (s) => {
  current.value = s.realIndex + 1
}

// 左上文字（副標 + 說明文 + 按鈕）取目前頁那筆，隨 swiper 切換
const activeRow = computed(() => props.rows[current.value - 1] || {})
</script>

<template>
  <section class="banner07">
    <div class="left">
      <!-- 上：文字區塊（背景圖 + 說明 + VIEW MORE） -->
      <div class="top">
        <NuxtLink class="logo" to="/">
          <SiteLogo alt="Logo" />
        </NuxtLink>

        <div class="editor" :class="`js-banner-row-${current - 1}`">
          <h2 v-if="activeRow.subtitle" :key="`st-${current}`" class="editor_title">{{ activeRow.subtitle }}</h2>
          <p v-if="activeRow.memo" :key="`memo-${current}`" v-html="toHtml(activeRow.memo)" />
        </div>

        <div v-if="activeRow.link" :key="`btn-${current}`" class="button_set">
          <NuxtLink class="cover_btn" :to="activeRow.link"><span>VIEW MORE</span></NuxtLink>
        </div>
      </div>

      <!-- 下：產品輪播（編號 + 圖 + 名稱 + 上下一個） -->
      <div class="bottom">
        <div class="index_product">
          <span class="index_product_num">{{ productNum }}</span>

          <Swiper
            v-if="rows.length"
            class="index_banner_product"
            :modules="[Autoplay, Pagination, Navigation, Controller]"
            :slides-per-view="1"
            :loop="loop && rows.length > 1"
            :speed="1000"
            :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
            :pagination="{ clickable: true }"
            :navigation="{ prevEl: '.product_prev', nextEl: '.product_next' }"
            @swiper="onProductReady"
            @slide-change="onSlideChange"
          >
            <SwiperSlide v-for="(row, i) in rows" :key="i">
              <NuxtLink :to="row.link || ''" :title="row.title || 'VIEW MORE'">
                <img
                  :src="row.product?.pc || row.product?.mb || row.image?.pc || row.image?.mb"
                  :alt="row.productAlt || row.title || ''"
                />
              </NuxtLink>
            </SwiperSlide>
          </Swiper>

          <!-- 產品標題：放 swiper 外避免被 overflow 裁掉；每則一個 h1/h2，只顯示目前頁 -->
          <div class="index_product_name">
            <template v-for="(row, i) in rows" :key="i">
              <component
                :is="i === 0 ? 'h1' : 'h2'"
                v-if="row.title"
                class="index_product_name_item"
                :class="['js-banner-row-' + i, { 'is-active': current === i + 1 }]"
              >{{ row.title }}</component>
            </template>
          </div>
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
        :modules="[EffectFade, Navigation, Controller]"
        :slides-per-view="1"
        :loop="loop && rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :navigation="{ prevEl: '.main_prev', nextEl: '.main_next' }"
        @swiper="onMainReady"
        @slide-change="onSlideChange"
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
// 左上文字切換：由左向右滑入（副標 → 說明文 → 按鈕 依序延遲）
@keyframes banner07_slide_in {
  from {
    opacity: 0;
    transform: translateX(calc(-40 / 19.2 * 1vw));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

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
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 fluid(80) fluid(30);
    // 左上背景：後台上傳的底圖（--banner-top-image）疊在主色上；未上傳＝純主色
    background: var(--banner-top-image, none) no-repeat center center / cover, $web_color_2;

    @media (min-width: 641px) { height: calc(495 / 840 * 100%); }
    @media (max-width: 640px) { padding: 30px calc(80 / 19.2 * 1vw); }

    .logo {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: fluid(70);
      margin-bottom: fluid(25);

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
      color: #fff;

      // text_scroll_y(21px, 14)
      max-height: 21px * 14;
      overflow-x: hidden;
      overflow-y: auto;

      .editor_title {
        // 左上副標：bannerTitleSize_cht(2)
        color: var(--banner-subtitle-color, #fff);
        font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
        font-weight: 700;
        margin-bottom: fluid(10);
        // 切換時由左滑入
        animation: banner07_slide_in 0.7s ease both;
      }

      p {
        // bannerTitleSize_cht(3)
        color: var(--banner-memo-color, #fff);
        font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));
        line-height: 1.6;
        // 比副標略慢滑入
        animation: banner07_slide_in 0.7s ease 0.18s both;
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
      // 跟著文字滑入，再略慢於說明文
      animation: banner07_slide_in 0.7s ease 0.32s both;

      @media (max-width: 640px) { justify-content: center; }
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    position: relative;
    padding: fluid(30) fluid(80) calc(44 / 16 * 1rem + 10 / 19.2 * 1vw);
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

      // 左下產品名稱（每則 title，h1/h2）：放 swiper 外，全部疊在同格、只顯示目前頁
      .index_product_name {
        display: grid;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;

        @media (max-width: 480px) {
          position: static;
          margin-top: fluid(30);
        }

        .index_product_name_item {
          grid-area: 1 / 1; // 全部疊同一格
          margin: 0;
          color: var(--banner-title-color, #fff);
          font-size: clamp(17px, calc(24 / 19.2 * 1vw), calc(24 / 1920 * 2560 * 1px));
          font-weight: 700;
          line-height: 1;
          text-align: right;
          opacity: 0;
          transition: opacity 0.6s ease;

          // 與大圖同時更換：目前頁淡入，其餘淡出
          &.is-active { opacity: 1; }

          @media (max-width: 640px) { font-size: calc(12 / 16 * 1rem + 12 / 6.4 * 1vw); }
          @media (max-width: 480px) { text-align: center; }
        }
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
    right: fluid(40);
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
