<script setup>
// 首頁 Banner block — 版型 15（全螢幕主圖 fade 輪播 + 左側文字 cover + 每張一顆圓形影片鈕 + 右下進度條工具列）
//
// 來源：D:\www\master_dev\template\module\banner\banner15.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner15.scss
//
// 僅轉首頁 index banner（$page == 'index'）；page-banner 由共用 PageBanner01 處理。
//
// rows 結構（每筆，對應原 PHP $index_banner 的 foreach）：
//   { image: { pc, mb }, title, title2, slogan, link, videoLink }
//     image.pc   = 桌面大圖（min-width:721px）
//     image.mb   = 手機小圖
//     title      = 第一行（主標、moduleTitleSize_cht(1)、粗體）
//     title2     = 第二行（moduleTitleSize_en(2)、粗體）
//     slogan     = 第三行標語（可含換行，bannerTitleSize_cht(2)）
//     link       = VIEW MORE 連結（可選）
//     videoLink  = 該張對應的影片連結（可選，點圓形播放鈕開新視窗）
// news：本版型未使用（介面相容用，忽略）
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
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 換行標語：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 兩位數補零（對應原 banner15.js padStart(2,'0')）
const pad2 = (n) => String(n).padStart(2, '0')

// 工具列進度：目前頁 / 總頁數 / 進度條寬度
const total = computed(() => props.rows.length)
const totalStr = computed(() => pad2(total.value))
const current = ref(0) // realIndex
const currentStr = computed(() => pad2(current.value + 1))
const bar = computed(() => (total.value ? 100 / total.value : 0))

const onSlideChange = (s) => {
  current.value = s.realIndex
}
</script>

<template>
  <section class="banner15">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner15_prev', nextEl: '.banner15_next' }"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <div class="slide_media">
          <picture>
            <source media="(min-width: 721px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>

          <div class="cover_txt" :class="`js-banner-row-${i}`">
            <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title">{{ row.title }}</component>
            <div v-if="row.subtitle">{{ row.subtitle }}</div>
            <div v-if="row.memo" v-html="toHtml(row.memo)" />

            <div class="button_set">
              <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
                <span>VIEW MORE</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- 每張 banner 一顆圓形影片鈕（有 videoLink 才可點） -->
        <div class="slide_video">
          <a
            v-if="row.videoLink"
            class="banner_video"
            :href="row.videoLink"
            target="_blank"
            rel="noopener"
            aria-label="播放影片"
          >
            <span class="video_play"></span>
            <span class="video_ring"></span>
          </a>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 右下工具列：進度數字 + 進度條 + 上下張箭頭 -->
    <div v-if="rows.length > 1" class="tool_btn">
      <p class="tool_page">
        <span>{{ currentStr }}</span>
        <span><span :style="{ width: bar + '%', left: current * bar + '%' }"></span></span>
        <span>{{ totalStr }}</span>
      </p>
      <button class="banner15_prev banner_arrow prev" type="button" aria-label="上一張"></button>
      <button class="banner15_next banner_arrow next" type="button" aria-label="下一張"></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner15 {
  position: relative;
}

// ── 主圖 swiper（全螢幕） ──────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .slide_media {
    position: relative;
    height: 100%;
    background: #dfe5ef;
  }

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

  // active slide 圖片淡入去模糊（對應原 banner15_img）
  .swiper-slide-active .slide_media picture img {
    animation: banner15_img 1.6s 0.3s forwards;
  }

  // 手機分頁點（>720 隱藏）
  :deep(.swiper-pagination) {
    display: none;
    bottom: 25px;

    @media (max-width: 720px) { display: block; }
    @media (max-width: 440px) { bottom: 10px; }
  }
}

@keyframes banner15_img {
  0%   { opacity: 0; filter: blur(10px); }
  100% { opacity: 1; filter: blur(0px); }
}

// ── 文字 cover（左側，深色字） ─────────────────────────────
.cover_txt {
  position: absolute;
  top: 50%;
  left: 7.94791vw;
  width: max-content;
  max-width: calc(100% - 4.94791vw * 2);
  transform: translate(0, -50%);
  transition: all 0.3s;
  z-index: 1;

  @media (max-width: 1200px) {
    left: 30px;
    max-width: calc(100% - 60px);
  }

  @media (max-width: 720px) {
    top: 20vw;
    bottom: 10%;
    transform: translate(0, 0);
  }

  > * {
    color: #000;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    opacity: 0;

    // 第一行：主標（moduleTitleSize_cht(1)）
    &:nth-child(1) {
      color: var(--banner-title-color, #000);
      font-weight: 700;
      margin-bottom: fluid(10);
      font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
    }

    // 第二行（moduleTitleSize_en(2)）
    &:nth-child(2) {
      color: var(--banner-subtitle-color, #000);
      font-weight: 700;
      font-size: clamp(24px, calc(36 / 19.2 * 1vw), calc(36 / 1920 * 2560 * 1px));
    }

    // 第三行：標語（bannerTitleSize_cht(2)）
    &:nth-child(3) {
      color: var(--banner-memo-color, #000);
      margin-top: fluid(25);
      font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
    }

    :deep(br) {
      @media (max-width: 720px) { display: none; }
    }
  }

  .button_set {
    opacity: 0;
  }
}

// VIEW MORE 按鈕（對應原 .button06 → .cover_btn，使用 $web_color_1）
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
}

// 進場：active slide 文字與按鈕依序淡入（對應原 goRight 動畫序列）
.index_banner .swiper-slide-active .cover_txt {
  > * {
    animation: banner15_goRight 1.6s forwards;

    &:nth-child(1) { animation-delay: 1s; }
    &:nth-child(2) { animation-delay: 1.2s; }
    &:nth-child(3) { animation-delay: 1.4s; }
    &:nth-child(4) { animation-delay: 1.6s; }
  }

  .button_set {
    animation: banner15_goRight 1.6s 1.8s forwards;
  }
}

@keyframes banner15_goRight {
  0%   { opacity: 0; transform: translate(-40px, 0); }
  100% { opacity: 1; transform: translate(0, 0); }
}

// ── 圓形影片鈕（每張一顆，桌面右下） ───────────────────────
.slide_video {
  position: absolute;
  bottom: 7.8125vw; // 150
  right: 8.3333vw;  // 160
  z-index: 1;

  @media (max-width: 1200px) { right: 5.5vw; }
  @media (max-width: 840px) { display: none; }
}

.banner_video {
  display: block;
  position: relative;
  width: fluid(120);
  height: fluid(120);
  border: 1px solid rgba($web_color_1, 0.25);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  @media (max-width: 1440px) {
    width: 110px;
    height: 110px;
  }

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: fluid(5);
    left: fluid(5);
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    border: 1px solid $web_color_1;
    border-radius: 50%;
  }

  // 中央播放三角
  .video_play {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 11px 0 11px 18px;
    border-color: transparent transparent transparent $web_color_1;
    transform: translate(-40%, -50%) scale(1);
    transition: all 0.3s;
  }

  // 外圈旋轉裝飾（對應原 other22.svg 旋轉）
  .video_ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px dashed rgba($web_color_1, 0.4);
    animation: banner15_video 10s linear infinite;
  }

  &:hover .video_play {
    transform: translate(-40%, -50%) scale(1.2);
  }
}

@keyframes banner15_video {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}

// ── 右下工具列：進度數字 + 進度條 + 箭頭 ───────────────────
.tool_btn {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 2.34375vw; // 45
  right: 7.8125vw;   // 150
  z-index: 2;

  @media (max-width: 1200px) { right: 3vw; }
  @media (max-width: 720px) { display: none; }
}

.tool_page {
  display: flex;
  align-items: center;
  color: $web_color_1;
  font-size: fluid-fz(18);
  font-family: $title_font_en;
  letter-spacing: 0;
  margin-right: fluid(30);

  // 進度條軌道
  > span:nth-child(2) {
    display: block;
    position: relative;
    width: fluid(300);
    height: 2px;
    margin: 0 fluid(10);
    background: $web_color_1;
    transition: all 0.3s;

    @media (max-width: 1440px) { width: 240px; }
    @media (max-width: 1200px) { width: 160px; }
    @media (max-width: 1024px) { width: 100px; }

    // 進度條目前段（寬度＝1/總數，left 隨 realIndex 位移）
    span {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: #fff;
      transition: all 1s;
    }
  }
}

// ── 左右箭頭（邊框 V 形 chevron；對應原 swiperArrowStyle(1)） ──
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 50%, $web_font_color, rgba(255, 255, 255, 0.85));
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

  &:hover { background: #fff; color: $web_color_1; }
}

.banner15_prev {
  margin-right: fluid(15);
  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}
.banner15_next {
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}
</style>
