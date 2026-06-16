<script setup>
// 首頁 Banner block — 版型 02（左側文字 cover 同步淡入 + 左下角最新消息浮窗）
//
// 來源：D:\www\master_dev\template\module\banner\banner02.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner02.scss
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, slogan, link }
//     title  = 第一行（英文/標題，bannerTitleSize_en）
//     title2 = 主標（主色、$title_font_en、bannerTitleSize_cht(1)）
//     slogan = 標語（可含換行，bannerTitleSize_cht(3)）
//     link   = VIEW MORE 連結（可選）
// news：最新消息陣列 [{ date, title, summary, url }]（可選；空時自動隱藏並收掉間距）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  // BlockBanner01 介面相容（本版型無影片，videoUrl 忽略）
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行標語：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')
</script>

<template>
  <section class="banner02" :class="{ nonews: !news.length }">
    <!-- 主圖 swiper（fade 切換，文字 cover 直接疊在 slide 上、隨 active 淡入） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Navigation]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :navigation="{ prevEl: '.banner02_prev', nextEl: '.banner02_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 641px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div class="cover_txt">
          <div v-if="row.title">{{ row.title }}</div>
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title2">{{ row.title2 }}</component>
          <div v-if="row.slogan" v-html="toHtml(row.slogan)" />

          <div v-if="row.link" class="button_set">
            <NuxtLink class="cover_btn" :to="row.link" :title="row.title2 || 'VIEW MORE'"><span>VIEW MORE</span></NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="banner02_prev banner_arrow" type="button" aria-label="上一張"></button>
    <button class="banner02_next banner_arrow" type="button" aria-label="下一張"></button>

    <!-- 最新消息浮窗（左下，可選） -->
    <aside v-if="news.length" class="banner_news">
      <Swiper
        class="news_swiper"
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :loop="news.length > 1"
        :speed="500"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
      >
        <SwiperSlide v-for="(item, i) in news" :key="i">
          <div class="news_slide">
            <NuxtLink class="news_link" :to="item.url || ''">
              <p class="news_date" v-html="toHtml(item.date)" />
              <p class="news_title">{{ item.title }}</p>
            </NuxtLink>
            <p class="module_desc">{{ item.summary }}</p>
          </div>
        </SwiperSlide>
      </Swiper>
    </aside>
  </section>
</template>

<style lang="scss" scoped>
.banner02 {
  position: relative;
  padding-bottom: fluid(50);
  transition: all 0.3s;

  @media (max-width: 1200px) { padding-bottom: 80px; }
  @media (max-width: 960px) { padding-bottom: 0; }

  &.nonews { padding-bottom: 0; }
}

// ── 主圖 swiper ──────────────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
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
}

.cover_txt {
  position: absolute;
  top: 50%;
  left: calc(156 / 19.2 * 1vw);
  transform: translate(0, -50%);

  @media (max-width: 640px) {
    top: unset;
    bottom: calc(40 / 7.2 * 1vw);
    left: 50%;
    width: 100%;
    padding: 0 25px;
    transform: translate(-50%, 0);
  }

  @media (max-width: 480px) {
    bottom: calc(19.2 / 4.8 * 1vw);
  }

  > :not(.button_set) {
    color: #fff;
    opacity: 0;
    transform: translate(40px, 0);

    @media (max-width: 640px) {
      text-align: center;
      transform: translate(0, 40px);
    }

    // 第一行：英文/標題（bannerTitleSize_en(2)）
    &:nth-child(1) {
      font-size: clamp(19px, calc(23 / 19.2 * 1vw), calc(23 / 1920 * 2560 * 1px));
      margin-bottom: fluid(20);
      transition: all 0.3s, opacity 0.5s, transform 0.5s;

      @media (max-width: 1200px) { margin-bottom: 15px; }
      @media (max-width: 640px) {
        color: $web_font_color;
        margin-bottom: 10px;
      }
      @media (max-width: 540px) { display: none; }
    }

    // 第二行：主標（主色、英文標題字體，bannerTitleSize_cht(1)）
    &:nth-child(2) {
      color: $web_color_1;
      font-weight: 700;
      font-family: $title_font_en;
      line-height: 1.2;
      text-transform: uppercase;
      margin-bottom: fluid(12);
      font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));
      transition: all 0.3s, opacity 0.5s 0.1s, transform 0.5s 0.1s;

      @media (min-width: 1201px) { letter-spacing: 2px; }
      @media (max-width: 640px) { margin-bottom: 10px; }
    }

    // 第三行：標語（bannerTitleSize_cht(3)）
    &:nth-child(3) {
      color: $web_font_color;
      font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));
      transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;

      @media (max-width: 400px) { display: none; }
    }
  }

  .button_set {
    margin-top: fluid(30);
    opacity: 0;
    transform: translate(40px, 0);
    transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

    @media (max-width: 640px) {
      display: flex;
      justify-content: center;
      transform: translate(0, 40px);
    }
    @media (max-width: 400px) { margin-top: 20px; }
  }
}

// VIEW MORE 按鈕（對應原 .button06 middle）
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

// 進場：active slide 內文字與按鈕依序淡入（對應原 swiper-slide-active 動畫）
.index_banner .swiper-slide-active .cover_txt {
  > :not(.button_set) {
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

// ── 左右箭頭（swiperArrowStyle(1)；桌面 1024 以下隱藏） ──────
.banner_arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
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
.banner02_prev {
  left: fluid(20);
  &::before { transform: rotate(-135deg); margin-left: 3px; }
}
.banner02_next {
  right: fluid(20);
  &::before { transform: rotate(45deg); margin-right: 3px; }
}

// ── 最新消息浮窗 ─────────────────────────────────────────
.banner_news {
  position: absolute;
  bottom: 0;
  left: calc(156 / 19.2 * 1vw);
  width: 100%;
  max-width: fluid(586);
  padding: 0 fluid(30) fluid(20) 0;
  background: rgba(#6d6e71, 0.8);
  transition: all 0.3s;
  z-index: 1;

  @media (max-width: 1024px) {
    position: static;
    max-width: none;
  }
  @media (max-width: 480px) {
    padding: 0 20px 5px 0;
  }
}

.news_swiper {
  position: relative;
  overflow: hidden;
  padding-bottom: fluid(50);
  transition: all 0.3s;

  @media (max-width: 1366px) { padding-bottom: 30px; }

  :deep(.swiper-pagination) {
    left: unset;
    right: 0;
    transform: unset;
    text-align: right;

    .swiper-pagination-bullet {
      width: fluid(8);
      height: fluid(8);
      background: #6d6e71;
      opacity: 1;

      &.swiper-pagination-bullet-active { background: #fff; }
    }
  }
}

.news_slide {
  .news_link {
    display: flex;
    align-items: center;
    margin-bottom: fluid(16);

    .news_date {
      flex-shrink: 0;
      color: #000;
      font-size: fluid-fz(16);
      font-weight: 300;
      font-family: 'Poppins', sans-serif;
      line-height: 1.2;
      letter-spacing: 1px;
      text-align: center;
      padding: fluid(8) fluid(32);
      background: #fff;
      transition: all 0.3s;

      @media (max-width: 480px) {
        font-size: 14px;
        padding: 8px 16px;
      }
    }

    .news_title {
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      color: #fff;
      font-size: fluid-fz(16);
      letter-spacing: 1px;
      padding-left: fluid(35);
      transition: all 0.3s;

      @media (max-width: 480px) { padding-left: 16px; }
    }
  }

  .module_desc {
    color: #fff;
    font-size: fluid-fz(14);
    font-weight: 300;
    line-height: 1.6;
    padding-left: fluid(30);

    // text_truncate_h(22.4px, 2)
    display: -webkit-box;
    height: 44.8px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    overflow: hidden;

    @media (max-width: 480px) { padding-left: 20px; }
  }
}
</style>
