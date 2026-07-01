<script setup>
// 首頁 Banner block — 版型 08（斜切色塊揭幕 + 右側 cover 疊圖上浮 + 四行文字 + 圓環計數箭頭）
//
// 來源（忠實對應 PHP/JS/SCSS）：
//   D:\www\master_dev\template\module\banner\banner08.{php,js}
//   D:\www\master_dev\template\css\scss\module\banner\_banner08.scss
//
// 每張 slide 結構（對應原 PHP）：
//   <a>
//     <picture>            基本圖（背景大圖），載入時左右兩塊斜切漸層色塊由上往下展開
//     <picture class="cover">  右側疊圖（data_type8_banner2），active 時 goUp 上浮淡入
//     <div class="cover_txt">  說明文字 data_memo（內含 4 個 <p>）
//
// rows 結構（每筆，對齊全版型 title/subtitle/memo）：
//   { image: { pc, mb }, coverImage: { pc, mb }, title, subtitle, memo }
//     image      = 基本背景圖（data_banner_basic / _mb）
//     coverImage = 右側疊圖（data_type8_banner2 / _mb；可選）
//     title      = 中文主標（第一則 h1、其後 h2）
//     subtitle   = 標語 / 副標
//     memo       = 說明文字（可含換行）
//   ※ 原 data_type8_banner3（左側圖）PHP 註明「廢棄」，不轉。
//   ※ 高度依原始 SCSS 由圖片自然高度決定（非 100vh）。
// 本版型不使用 videoUrl / news（保留與 BlockBanner01 介面相容）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'

// 揭幕斜切色塊：左側梯形 / 右側三角各自換色（後台兩個色票 → --banner-accent-color / -2）
defineOptions({
  accentColor: { name: '左側梯形色塊', def: '#000000' },
  accentColor2: { name: '右側三角色塊', def: '#393993' },
})
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 計數器：目前頁 / 總頁數（對應原 JS tool_btn 的 01 / 03，補零兩位）
const current = ref(1)
const total = computed(() => props.rows.length)
const pad = (n) => String(n).padStart(2, '0')
const onSlideChange = (s) => { current.value = s.realIndex + 1 }
</script>

<template>
  <section class="banner08">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Navigation]"
      :slides-per-view="1"
      :loop="loop && (rows.length > 1)"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
      :navigation="{ prevEl: '.banner08_prev', nextEl: '.banner08_next' }"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <a>
          <!-- 基本圖（含斜切色塊揭幕） -->
          <picture>
            <source media="(min-width: 641px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>

          <!-- 右側疊圖（active 時上浮淡入；無圖則不出） -->
          <picture v-if="row.coverImage?.pc || row.coverImage?.mb" class="cover">
            <source media="(min-width: 641px)" :srcset="row.coverImage?.pc" />
            <img :src="row.coverImage?.mb || row.coverImage?.pc" alt="" />
          </picture>

          <!-- 文字：主標（第一則 h1、其後 h2）＋ 副標 ＋ 說明文（沿用 BlockBanner01 慣例） -->
          <div class="cover_txt" :class="`js-banner-row-${i}`">
            <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" class="cover_title" v-html="row.title" />
            <h2 v-if="row.subtitle" class="cover_subtitle" v-html="row.subtitle" />
            <p v-if="row.memo" class="cover_memo" v-html="row.memo" />
          </div>
        </a>
      </SwiperSlide>
    </Swiper>

    <!-- 計數箭頭工具列（單張時隱藏） -->
    <div v-show="rows.length > 1" class="tool_btn">
      <a href="javascript:;" class="prev banner08_prev" aria-label="上一張">
        <svg viewBox="0 0 36 36" width="36" height="36"><circle class="circle1" cx="18" cy="18" r="15" /></svg>
        <svg viewBox="0 0 36 36" width="36" height="36"><circle class="circle2" cx="18" cy="18" r="15" /></svg>
        <i class="arrow"></i>
      </a>

      <p><span>{{ pad(current) }}</span> / <span>{{ pad(total) }}</span></p>

      <a href="javascript:;" class="next banner08_next" aria-label="下一張">
        <svg viewBox="0 0 36 36" width="36" height="36"><circle class="circle1" cx="18" cy="18" r="15" /></svg>
        <svg viewBox="0 0 36 36" width="36" height="36"><circle class="circle2" cx="18" cy="18" r="15" /></svg>
        <i class="arrow"></i>
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner08 {
  position: relative;
}

.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
    height: 100%;

    a {
      display: block;
      position: relative;
      height: 100%;
      padding-bottom: fluid(100);
      overflow: hidden;

      @media (max-width: 640px) {
        padding-bottom: 12vw;
      }

      picture {
        display: block;

        // 基本圖：絕對填滿（100vh 滿版），上面再疊斜切色塊
        &:not(.cover) {
          position: absolute;
          inset: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          &::before {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            left: -9.5%;
            width: 60%;
            height: 100%;
            // 左側梯形：後台可換色（--banner-accent-color）；留空＝原斜切漸層
            background: var(--banner-accent-color, linear-gradient(45deg, rgba($web_header_1, 0.9) 0%, rgba($web_header_1, 0.9) 60%, rgba($web_header_2, 0.9) 100%));
            z-index: 1;
            // 由左到右展開（scaleX 由 origin 左側長出），比原本慢
            transform: skewX(-27.63deg) scaleX(0);
            transform-origin: top left;
            animation: banner08_wipe 1.6s ease-in-out 0.3s forwards;

            @media (max-width: 640px) {
              left: -7%;
            }
          }

          &::after {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            right: -56.5%;
            width: 50%;
            height: 100%;
            // 右側三角：後台可換色（--banner-accent-color-2）；留空＝原 $web_color_2
            background: var(--banner-accent-color-2, #{$web_color_2});
            z-index: 1;
            // 由右到左展開（origin 右側長出），與梯形同速度
            transform: skewX(-27.63deg) scaleX(0);
            transform-origin: top right;
            animation: banner08_wipe 1.6s ease-in-out 0.6s forwards;

            @media (max-width: 640px) {
              right: -89%;
            }
          }
        }

        // 右側疊圖：絕對定位、預設透明、z-index 高
        &.cover {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          opacity: 0;
          z-index: 2;
        }
      }

      .cover_txt {
        position: absolute;
        bottom: 20.6vw;
        left: 13vw;
        z-index: 2;
        transition: all 0.3s;

        @media (max-width: 1600px) { left: 8vw; }
        @media (max-width: 640px) { bottom: 72vw; }

        // 三行共用：預設右移淡出，active 時依序滑入
        .cover_title,
        .cover_subtitle,
        .cover_memo {
          margin: 0;
          color: #fff;
          opacity: 0;
          transform: translate(40px, 0);
        }

        // 主標：尺寸 / 粗細沿用 BlockBanner01 cover_title
        .cover_title {
          color: var(--banner-title-color, #fff);
          font-weight: 900;
          line-height: 1.2;
          font-size: clamp(24px, calc(56 / 19.2 * 1vw), calc(56 / 1920 * 2560 * 1px));
          transition: all 0.3s, opacity 0.5s, transform 0.5s;
        }

        // 副標：沿用 BlockBanner01 cover_subtitle
        .cover_subtitle {
          color: var(--banner-subtitle-color, #fff);
          margin-top: fluid(12);
          font-weight: 500;
          font-size: clamp(16px, calc(24 / 19.2 * 1vw), calc(24 / 1920 * 2560 * 1px));
          transition: all 0.3s, opacity 0.5s 0.1s, transform 0.5s 0.1s;
        }

        // 說明文
        .cover_memo {
          color: var(--banner-memo-color, #fff);
          margin-top: fluid(12);
          line-height: 1.6;
          font-size: clamp(14px, calc(16 / 19.2 * 1vw), calc(16 / 1920 * 2560 * 1px));
          transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;
        }
      }
    }

    // active：疊圖上浮淡入 + 文字依序滑入
    &.swiper-slide-active {
      a {
        picture.cover {
          animation: goUp 1.5s ease-in-out 0.9s forwards;
        }

        .cover_txt {
          .cover_title,
          .cover_subtitle,
          .cover_memo {
            opacity: 1;
            transform: translate(0, 0);
          }

          .cover_title { transition: all 0.3s, opacity 1s 1s, transform 1s 1s; }
          .cover_subtitle { transition: all 0.3s, opacity 1s 1.1s, transform 1s 1.1s; }
          .cover_memo { transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s; }
        }
      }
    }
  }
}

// 斜切色塊揭幕：scaleX 0→1（方向由各自 transform-origin 決定：梯形左、三角右）
@keyframes banner08_wipe {
  0% { transform: skewX(-27.63deg) scaleX(0); }
  100% { transform: skewX(-27.63deg) scaleX(1); }
}

// goUp（master_dev basic/_animate.scss）：上浮淡入
@keyframes goUp {
  0% { opacity: 0; transform: translate(0, 20px); }
  100% { opacity: 1; transform: translate(0, 0); }
}

// ── 計數箭頭工具列 ───────────────────────────────────────
.tool_btn {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10vw;
  left: 13vw;
  transition: all 0.3s;
  z-index: 1;

  @media (max-width: 1600px) { left: 8vw; }
  @media (max-width: 640px) {
    display: none;
    justify-content: space-between;
    bottom: 54%;
    left: 0;
    width: 100%;
    padding: 0 20px;
  }

  a {
    display: block;
    position: relative;
    font-size: fluid-fz(14);
    @include banner-nav-vars(fluid(30), 0, #fff, transparent);

    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-90deg);

      .circle1 {
        fill: transparent;
        stroke: #fff;
        stroke-width: 1.5;
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: banner08_circle_in 0.8s ease-in forwards;
      }

      .circle2 {
        fill: transparent;
        stroke: $web_header_1;
        stroke-width: 1.5;
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: banner08_circle_out 0.8s ease-in forwards;
      }
    }

    // 箭頭：邊框 V 形（取代原 fa-angle，置中穩定）
    i.arrow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: fluid(7);
      height: fluid(7);
      border-top: 2px solid #fff;
      border-right: 2px solid #fff;
    }

    &.prev i.arrow { transform: translate(-30%, -50%) rotate(-135deg); }
    &.next i.arrow { transform: translate(-70%, -50%) rotate(45deg); }

    &:hover {
      .circle1 { animation: banner08_circle_out 0.8s ease-in forwards; }
      .circle2 { animation: banner08_circle_in 0.8s ease-in forwards; }
    }
  }

  p {
    color: #fff;
    font-size: fluid-fz(15);
    font-family: 'Roboto', sans-serif;
    margin: 0 fluid(20);

    @media (max-width: 640px) { display: none; }
  }
}

@keyframes banner08_circle_in {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

@keyframes banner08_circle_out {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 100; }
}
</style>
