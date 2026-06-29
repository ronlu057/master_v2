<script setup>
// 首頁 Banner block — 版型 14（左側 LOGO 區 40% + 右側主圖 swiper 60%，桌面文字 cover 與主圖雙向同步淡入；
//                        右側社群側欄、左下角頁碼 + 上/下一張箭頭工具列、轉角裝飾 SVG）
//
// 來源：D:\www\master_dev\template\module\banner\banner14.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner14.scss
//
// 註：僅轉首頁（index）版型；page-banner 部分由共用 PageBanner01 處理，這裡忽略。
//     原本左側 40% 為 logo_banner、右側 60% 為 index_banner 的分割版面；
//     依母版規範本版型改為全螢幕（width:100%; height:100vh），主圖填滿、object-fit:cover。
//
// rows 結構（每筆 = 原 $index_banner 一筆 foreach）：
//   { image: { pc, mb }, title, title2, slogan, link }
//     image.pc  = data_banner_basic（桌面大圖，min-width:721px）
//     image.mb  = data_banner_basic_mb（手機小圖）
//     title     = data_title（第一行主標，moduleTitleSize_cht(1)，可含 \n 換行）
//     title2    = data_title2（第二行副標）
//     slogan    = data_title3（第三行標語，主色，moduleTitleSize_cht(3)，可含 \n 換行）
//     link      = data_link（VIEW MORE 連結，可選）
//
// news：本版型原始碼無最新消息浮窗，保留 prop 僅為與其他 banner block 介面相容（忽略）。
// videoUrl：本版型無背景影片，保留 prop 僅為介面相容（忽略）。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true }, // 後台 bannerLoop：無限循環
  autoplay: { type: Boolean, default: true }, // 後台 bannerAutoplay：自動播放
})

// 換行欄位：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── 兩個 Swiper 雙向同步（主圖切到第 i 張，文字 cover 也切到第 i 張）
const mainSwiper = ref(null)
const textSwiper = ref(null)
const onMainReady = (s) => {
  mainSwiper.value = s
  if (textSwiper.value) {
    s.controller.control = textSwiper.value
    textSwiper.value.controller.control = s
  }
}
const onTextReady = (s) => {
  textSwiper.value = s
  if (mainSwiper.value) {
    s.controller.control = mainSwiper.value
    mainSwiper.value.controller.control = s
  }
}

// ── 左下角頁碼（current / total）＋ 上下一張箭頭（對應原 tool_btn）
const total = computed(() => props.rows.length)
const current = ref(1)
const pad = (n) => String(n).padStart(2, '0')
const onSlideChange = (s) => {
  current.value = s.realIndex + 1
}
const slidePrev = () => mainSwiper.value && mainSwiper.value.slidePrev()
const slideNext = () => mainSwiper.value && mainSwiper.value.slideNext()
</script>

<template>
  <section class="banner14">
    <!-- 主圖 swiper（fade 切換；手機時文字直接疊在圖上，桌面交由左側 text_banner 顯示） -->
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :modules="[Autoplay, EffectFade, Pagination, Controller]"
      :slides-per-view="1"
      :loop="loop && rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
      :pagination="{ clickable: true }"
      @swiper="onMainReady"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i" :class="`js-banner-row-${i}`">
        <div class="slide_inner">
          <picture>
            <source media="(min-width: 721px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>

          <!-- 手機版文字（桌面隱藏，桌面改由左側 text_banner 顯示） -->
          <div class="cover_txt mb_only">
            <div v-if="row.title" v-html="toHtml(row.title)" />
            <div v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
            <div v-if="row.memo" v-html="toHtml(row.memo)" />

            <NuxtLink v-if="row.link" class="cover_btn center" :to="row.link" :title="row.title || 'VIEW MORE'">
              <span>VIEW MORE</span>
            </NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 轉角裝飾 -->
    <div class="corner" aria-hidden="true"></div>

    <!-- 桌面版文字 cover swiper（與主圖雙向同步） -->
    <Swiper
      v-if="rows.length"
      class="text_banner"
      :modules="[EffectFade, Controller]"
      :slides-per-view="1"
      :loop="loop && rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :allow-touch-move="false"
      @swiper="onTextReady"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i" :class="`js-banner-row-${i}`">
        <div class="cover_txt">
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" v-html="toHtml(row.title)" />
          <h2 v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
          <div v-if="row.memo" v-html="toHtml(row.memo)" />

          <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 工具列：頁碼 + 上/下一張（對應原 tool_btn；單張時隱藏） -->
    <div v-if="rows.length > 1" class="tool_btn">
      <p class="tool_page"><span>{{ pad(current) }}</span> ｜ <span>{{ pad(total) }}</span></p>

      <button class="banner_arrow prev" type="button" aria-label="上一張" @click="slidePrev"></button>
      <button class="banner_arrow next" type="button" aria-label="下一張" @click="slideNext"></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner14 {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// ── 主圖 swiper（全螢幕填滿） ──────────────────────────────
.index_banner {
  width: 100%;
  height: 100%;

  :deep(.swiper-slide) {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .slide_inner {
    position: relative;
    width: 100%;
    height: 100%;
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

  // 手機版疊在圖上的文字（桌面隱藏）
  .cover_txt.mb_only {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 0 fluid(25);
    transform: translateY(-50%);

    @media (min-width: 721px) { display: none; }

    > :nth-child(1) { color: var(--banner-title-color, #fff); }
    > :nth-child(2) { color: var(--banner-subtitle-color, #fff); }
    > :nth-child(3) { color: var(--banner-memo-color, #fff); }
  }

  // 手機版進場動畫（active slide 內各元素依序上浮淡入）
  :deep(.swiper-slide-active) .cover_txt.mb_only {
    > :nth-child(1) { animation: banner14_goUp 1s 0.4s forwards; }
    > :nth-child(2) { animation: banner14_goUp 1s 0.6s forwards; }
    > :nth-child(3) { animation: banner14_goUp 1s 0.8s forwards; }
    .cover_btn     { animation: banner14_goUp 1s 1s forwards; }
  }

  // 分頁圓點（靠右，桌面置中收於底部）
  :deep(.swiper-pagination) {
    bottom: 3.906vw;
    left: unset;
    right: fluid(180);
    transform: unset;
    text-align: right;

    @media (max-width: 1200px) { right: 100px; }
    @media (max-width: 720px) {
      bottom: 35px;
      right: 50%;
      transform: translateX(50%);
      text-align: center;
    }
    @media (max-width: 480px) { bottom: 20px; }
    @media (max-width: 440px) { bottom: 10px; }
  }
}

// ── 共用文字樣式（cover_txt：三行 + 按鈕） ─────────────────
.cover_txt {
  // 第一行：主標（moduleTitleSize_cht(1) = clamp(30,45/19.2vw,45)）
  > :nth-child(1) {
    color: var(--banner-title-color, #1a1a1a);
    font-weight: 700;
    font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));

    span {
      @media (max-width: 720px) { display: none; }
    }
    br {
      @media (min-width: 721px) { display: none; }
    }
  }

  // 第二行：副標
  > :nth-child(2) {
    color: var(--banner-subtitle-color, #1a1a1a);
    font-size: clamp(17px, calc(26 / 19.2 * 1vw), calc(26 / 1920 * 2560 * 1px));
    font-weight: 700;
    margin-top: fluid(23);
  }

  // 第三行：標語（主色，moduleTitleSize_cht(3) = clamp(15,18/19.2vw,18)）
  > :nth-child(3) {
    color: var(--banner-memo-color, $web_color_1);
    font-weight: 500;
    margin-top: fluid(13);
    font-size: clamp(15px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
  }

  // VIEW MORE 按鈕（對應原 .button06 → .cover_btn，btnMarginTop(1)）
  .cover_btn {
    margin-top: fluid(55);

    @media (max-width: 1200px) { margin-top: 35px; }
  }
}

// VIEW MORE 按鈕（取代原 .button06，使用 $web_color_1）
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

  &.center { margin-left: auto; margin-right: auto; }

  &:hover {
    color: #fff;
    background: $web_color_1;
  }
}

// ── 轉角裝飾（桌面左中位置；手機隱藏） ────────────────────
.corner {
  position: absolute;
  bottom: 0;
  left: 40%;
  width: 10.9375vw;
  height: 10.9375vw;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 720px) { display: none; }
}

// ── 桌面文字 cover swiper（絕對置中於畫面左側；手機隱藏） ──
.text_banner {
  position: absolute;
  top: 50%;
  left: calc(160 / 1920 * 100%);
  width: calc(1600 / 1920 * 100%);
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;

  @media (max-width: 720px) { display: none; }

  :deep(.swiper-slide) {
    .cover_txt { pointer-events: auto; }

    > * { opacity: 0; }
  }

  // 進場：active slide 內文字與按鈕依序自左淡入
  :deep(.swiper-slide-active) .cover_txt {
    > :nth-child(1) { animation: banner14_goLeft 1s 0.4s forwards; }
    > :nth-child(2) { animation: banner14_goLeft 1s 0.6s forwards; }
    > :nth-child(3) { animation: banner14_goLeft 1s 0.8s forwards; }
    .cover_btn     { animation: banner14_goLeft 1s 1s forwards; }
  }
}

// ── 左下角工具列：頁碼 + 上/下一張箭頭（手機隱藏） ────────
.tool_btn {
  display: flex;
  align-items: center;
  gap: fluid(15);
  position: absolute;
  bottom: 0;
  left: calc(160 / 1920 * 100%);
  z-index: 2;

  @media (max-width: 720px) { display: none; }

  .tool_page {
    color: $web_color_1;
    font-size: fluid-fz(15);
  }
}

// 上/下一張箭頭（border V-chevron；swiperArrowStyle 尺寸 40/35/30）
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 0, $web_color_1, none);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  // 邊框畫 V 形箭頭（9px 方塊，border-top + border-right，旋轉）
  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { color: $web_color_2; }
}
.banner_arrow.prev {
  &::before { transform: rotate(-135deg); margin-left: 3px; }
}
.banner_arrow.next {
  &::before { transform: rotate(45deg); margin-right: 3px; }
}

// ── 進場 keyframes（對應原 goUp / goLeft 動畫） ──────────────
@keyframes banner14_goUp {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes banner14_goLeft {
  0%   { opacity: 0; transform: translateX(40px); }
  100% { opacity: 1; transform: translateX(0); }
}
</style>
