<script setup>
// 首頁 Banner block — 版型 03（斜切遮罩 + 大字浮水印 + 左產品圖／右文字，fade 全螢幕輪播）
//
// 來源：D:\www\master_dev\template\module\banner\banner03.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner03.scss
//
// rows 結構（每筆）：
//   {
//     image:   { pc, mb },   // 背景大圖（data_banner_basic / _mb）
//     product: { pc, mb },   // 左側產品圖（data_type3_banner2 / _mb）
//     title,                 // 主標第一行（data_title，可含 HTML 如 <span>，bannerTitleSize_cht(1)）
//     slogan,                // 第二行標語（data_title2，可含換行）
//     desc,                  // 第三行描述（data_title3）
//     note,                  // 第四行備註（data_title4，bannerTitleSize_cht(3)）
//     link                   // VIEW MORE 連結（可選）
//   }
// 浮水印文字固定為 "gdt tech"（對應原 .cover_txt）。
// BlockBanner01 介面相容：videoUrl / news 本版型不使用，忽略。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 主標支援「大字 span 前綴」、有第四行備註；左側產品圖可上傳（去背 PNG/SVG，建議 1360×1050）
defineOptions({
  supportsTitleSpan: true,
  supportsNote: true,
  leftImage: { hint: '建議 1360 × 1050（去背透明）' },
})
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 換行：把 \n 轉成 <br>（對應原 PHP nl2br / 樣板內 <br>）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 主標：titleSpan（大字前綴）+ title（後面文字）組成原版的 `<span>GDT</span> 環宇…`。
// span 由 SCSS .right 第一行的 :deep(span) 放大；後面文字維持一般大小。
const composedTitle = (row) => {
  const span = (row.titleSpan || '').trim()
  return span ? `<span>${span}</span> ${row.title || ''}` : row.title || ''
}

// 左側產品圖預設（後台無此欄位可編輯）：未設定 product 時用版型內建去背圖 banner03_ob
const OB_PC = '/img/banner/banner03_ob.png'
const OB_MB = '/img/banner/banner03_ob_mb.png'
const leftPc = (row) => row.product?.pc || OB_PC
const leftMb = (row) => row.product?.mb || row.product?.pc || OB_MB
</script>

<template>
  <section class="banner03">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Navigation, Pagination]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :navigation="{ prevEl: '.banner03_prev', nextEl: '.banner03_next' }"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 841px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div class="cover_mask_left"></div>
        <div class="cover_mask_right"></div>

        <p class="cover_txt">gdt tech</p>

        <div class="content">
          <div class="wider_container">
            <div class="row no_gutter">
              <div class="left">
                <picture>
                  <source media="(min-width: 541px)" :srcset="leftPc(row)" />
                  <img :src="leftMb(row)" alt="" />
                </picture>
              </div>

              <div class="right" :class="`js-banner-row-${i}`">
                <component
                  :is="i === 0 ? 'h1' : 'h2'"
                  v-if="row.title || row.titleSpan"
                  class="b_title"
                  v-html="composedTitle(row)"
                />
                <div v-if="row.subtitle" class="b_subtitle" v-html="toHtml(row.subtitle)" />
                <p v-if="row.memo" class="b_memo" v-html="toHtml(row.memo)"></p>
                <p v-if="row.note" class="b_note" v-html="toHtml(row.note)"></p>

                <div v-if="row.link" class="button_set">
                  <NuxtLink class="cover_btn" :to="row.link" :title="row.title || row.btnText || 'VIEW MORE'">
                    <span>{{ row.btnText || 'VIEW MORE' }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="banner03_prev banner_arrow" type="button" aria-label="上一張"></button>
    <button class="banner03_next banner_arrow" type="button" aria-label="下一張"></button>
  </section>
</template>

<style lang="scss" scoped>
.banner03 {
  position: relative;
}

// ── 主圖 swiper（全螢幕） ────────────────────────────────────
.index_banner {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .swiper-slide {
    position: relative;
    height: 100%;
    overflow: hidden;

    > picture {
      display: block;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    // 左側斜切深色遮罩
    .cover_mask_left {
      position: absolute;
      top: 0;
      right: 50.7%;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      opacity: 0;
      transform: translateX(-49.3%) skew(-30deg);
    }

    // 右側斜切色塊遮罩（頁尾色漸層）
    .cover_mask_right {
      position: absolute;
      top: 0;
      left: 49.3%;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, $web_footer_1 0%, $web_footer_2 100%);
      opacity: 0;
      transform: translateX(50.7%) skew(-30deg);
    }

    // 大字浮水印
    .cover_txt {
      position: absolute;
      top: calc(100 / 19.2 * 1vw);
      left: 0;
      width: 100%;
      color: transparent;
      font-size: clamp(100px, calc(250 / 19.2 * 1vw), calc(250 / 1920 * 2560 * 1px));
      font-family: 'CAMPUS PERSONAL USE';
      line-height: 1.05;
      letter-spacing: 12px;
      text-indent: 12px;
      text-align: center;
      text-transform: uppercase;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.1) 100%);
      background-clip: text;
      opacity: 0;
      transform: translate(0, 20px);
      transition: all 0.3s;

      @media (max-width: 1440px) { top: calc(40 / 14.4 * 1vw); }
      @media (max-width: 840px) {
        top: calc(100 / 8.4 * 1vw);
        font-size: calc(150 / 8.4 * 1vw);
      }
      @media (max-width: 640px) { top: 5.6vw; }
      @media (max-width: 540px) { letter-spacing: 10px; }
      @media (max-width: 480px) { top: 0.6vw; }
      @media (max-width: 440px) { letter-spacing: 8px; }
      @media (max-width: 400px) { display: none; }
    }

    .content {
      position: absolute;
      top: 55%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      z-index: 1;

      @media (max-width: 1440px) { top: 52.5%; }
      @media (max-width: 840px) { top: 50%; }

      .wider_container {
        width: 100%;
        max-width: fluid(1600);
        margin: 0 auto;
        padding: 0 fluid(15);
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0 calc(70 / 1600 * 100%);

        @media (max-width: 840px) {
          flex-direction: column-reverse;
          gap: 40px 0;
        }
        @media (max-width: 400px) { gap: 30px 0; }
      }

      .left {
        width: calc(900 / 1600 * 100%);
        max-width: calc(680 / 19.2 * 1vw);
        opacity: 0;
        transform: translate(-20px, 0);

        @media (max-width: 840px) {
          width: 100%;
          max-width: unset;
        }

        picture { display: block; }

        img {
          width: 100%;

          @media (max-width: 840px) {
            width: unset;
            max-width: calc(550 / 8.4 * 1vw);
            margin: 0 auto;
          }
          @media (max-width: 540px) { max-width: 90%; }
          @media (max-width: 360px) { max-width: 100%; }
        }
      }

      .right {
        flex-shrink: 0;
        width: calc(630 / 1600 * 100%);
        min-width: max-content;
        opacity: 0;
        transform: translate(20px, 0);

        @media (min-width: 841px) and (max-width: 940px) { display: none; }
        @media (max-width: 840px) {
          width: 100%;
          min-width: unset;
        }

        // 字級依製作規範 §3：clamp(下限px, calc(目標/19.2*1vw), calc(目標/1920*2560*1px))
        // 目標值對齊 master_dev（bannerTitleSize_cht(1)=50、span=90、副標/說明=22、備註=15）
        // 第一行：主標
        .b_title {
          color: var(--banner-title-color, #fff);
          font-weight: 700;
          line-height: 1;
          font-size: clamp(32px, calc(50 / 19.2 * 1vw), calc(50 / 1920 * 2560 * 1px));

          @media (min-width: 1201px) { letter-spacing: 2px; }

          // ≤480 改用較小級距（30 - 45）
          @media (max-width: 480px) {
            font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
          }

          // 大字 span（titleSpan）：可單獨換色（--banner-titlespan-color），未設則沿用主標色
          :deep(span) {
            color: var(--banner-titlespan-color, var(--banner-title-color, #fff));
            font-size: clamp(45px, calc(90 / 19.2 * 1vw), calc(90 / 1920 * 2560 * 1px));
          }
        }

        // 第二行：副標
        .b_subtitle {
          color: var(--banner-subtitle-color, #fff);
          font-size: clamp(16px, calc(22 / 19.2 * 1vw), calc(22 / 1920 * 2560 * 1px));
          line-height: 1.3;
          margin-top: calc(23 / 19.2 * 1vw);

          @media (max-width: 840px) {
            line-height: 1.5;
            margin-top: 23px;
          }
        }

        // 第三行：說明文
        .b_memo {
          color: var(--banner-memo-color, #fff);
          font-size: clamp(16px, calc(22 / 19.2 * 1vw), calc(22 / 1920 * 2560 * 1px));
          line-height: 1.3;
          margin-top: calc(28 / 19.2 * 1vw);

          @media (max-width: 840px) {
            line-height: 1.5;
            margin-top: 15px;
          }
          @media (max-width: 360px) { display: none; }
        }

        // 第四行：備註（代理…等，bannerTitleSize_cht(3)=15）；≤840 隱藏
        .b_note {
          color: var(--banner-memo-color, #fff);
          font-size: clamp(14px, calc(15 / 19.2 * 1vw), calc(15 / 1920 * 2560 * 1px));
          margin-top: calc(30 / 19.2 * 1vw);

          @media (max-width: 840px) { display: none; }
        }

        .button_set {
          margin-top: fluid(30);

          @media (max-width: 400px) { margin-top: 30px; }
        }
      }
    }

    // 進場動畫：active slide 內各元素依序進場
    &.swiper-slide-active {
      .cover_mask_left { animation: banner03_mask_left 1s forwards; }
      .cover_mask_right { animation: banner03_mask_right 1s forwards; }
      .cover_txt { animation: banner03_goUp 1s 1.5s forwards; }

      .content {
        .left { animation: banner03_goRight 1s 1s forwards; }
        .right { animation: banner03_goLeft 1s 1s forwards; }
      }
    }
  }

  // pagination（桌面隱藏、≤1024 顯示）
  :deep(.swiper-pagination) {
    display: none;
    bottom: fluid(15);

    @media (max-width: 1024px) { display: block; }
    @media (max-width: 400px) { bottom: 8px; }
  }
}

@keyframes banner03_mask_left {
  0%   { opacity: 0; transform: translateX(-49.3%) skew(-30deg); }
  100% { opacity: 1; transform: translateX(0) skew(-30deg); }
}
@keyframes banner03_mask_right {
  0%   { opacity: 0; transform: translateX(50.7%) skew(-30deg); }
  100% { opacity: 1; transform: translateX(0) skew(-30deg); }
}
@keyframes banner03_goUp {
  0%   { opacity: 0; transform: translate(0, 20px); }
  100% { opacity: 1; transform: translate(0, 0); }
}
@keyframes banner03_goRight {
  0%   { opacity: 0; transform: translate(-20px, 0); }
  100% { opacity: 1; transform: translate(0, 0); }
}
@keyframes banner03_goLeft {
  0%   { opacity: 0; transform: translate(20px, 0); }
  100% { opacity: 1; transform: translate(0, 0); }
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
    color: #fff;
    background: $web_color_1;
    border-color: $web_color_1;
  }
}

// ── 左右箭頭（swiperArrowStyle(1)；邊框畫 V 形；≤1024 隱藏） ──
.banner_arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  // 後台箭頭設定（大小/圓角/箭頭色/底色）生效；fallback＝預設白箭頭、無底色（未設定也看得見）
  @include banner-nav-vars(fluid(40), 50%, #fff, transparent);
  border: none;
  cursor: pointer;
  transform: translateY(-50%);
  transition: all 0.3s;

  @media (max-width: 1024px) { display: none; }

  // V 形箭頭與線條粗細都跟著按鈕大小縮放（大按鈕＝大且粗的箭頭）
  &::before {
    content: '';
    width: calc(var(--banner-nav-size, #{fluid(40)}) * 0.3);
    height: calc(var(--banner-nav-size, #{fluid(40)}) * 0.3);
    border-top: calc(var(--banner-nav-size, #{fluid(40)}) * 0.06) solid currentColor;
    border-right: calc(var(--banner-nav-size, #{fluid(40)}) * 0.06) solid currentColor;
  }

  &:hover { opacity: 0.7; }
}
.banner03_prev {
  @include banner-nav-gap(left, fluid(20));
  &::before { transform: rotate(-135deg); margin-left: fluid(3); }
}
.banner03_next {
  @include banner-nav-gap(right, fluid(20));
  &::before { transform: rotate(45deg); margin-right: fluid(3); }
}
</style>
