<script setup>
// 首頁 Banner block — 版型 14（左 40% LOGO 形象區 + 右 60% 主圖 swiper；
//   文字 cover 與主圖雙向同步淡入；左下頁碼＋上/下一張、轉角白色裝飾、右側直式社群欄）
//
// 忠實對應原始檔：
//   D:\www\master_dev\template\module\banner\banner14.{php,js}
//   D:\www\master_dev\template\css\scss\module\banner\_banner14.scss
//
// 結構（對應原 PHP，逐層一致）：
//   .banner14（flex）
//     .logo_banner（左 40%；形象圖＝後台「左側形象圖」topImage，桌面才出現）
//     .index_banner（右 60%；主圖 fade swiper，img 自然高度；只有 pagination）
//       .swiper-slide > .slide_inner > picture + .cover_txt（手機文字疊圖上、goUp）
//     .corner（左 40% 底部白色轉角裝飾，桌面才出現）
//     .text_banner（桌面文字 cover swiper，與主圖同步、goLeft）
//     .tool_btn（左下頁碼 01｜0N + 上/下一張箭頭）
//     .social_media（右側 120px 直式社群欄；取 firm.social）
//
// rows 結構（每筆 = 原 $index_banner 一筆，對齊全版型 title/subtitle/memo）：
//   { image:{pc,mb}, title, subtitle, memo, link }
//     title    = 第一行主標（data_title；moduleTitleSize_cht(1)，可含 \n / <span>｜</span>）
//     subtitle = 第二行（data_title2）
//     memo     = 第三行標語（data_title3；主色）
//     link     = VIEW MORE 連結（data_link，可選）
// videoUrl / news：介面相容用，本版型未使用。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

// 左 40% 形象圖：後台單張上傳（整個版型一張）→ --banner-top-image
defineOptions({
  topImage: { name: '左側形象圖', hint: '左側 40% 區塊圖（整個版型一張）' },
})
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 換行欄位：\n → <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// 右側直式社群欄（取 firm.social；全空則整欄不渲染）
const socials = useSocials()

// ── 主圖 / 文字兩個 swiper 雙向同步（對應原 swiper.controller.control）
const mainSwiper = ref(null)
const textSwiper = ref(null)
const linkControllers = () => {
  if (mainSwiper.value && textSwiper.value) {
    mainSwiper.value.controller.control = textSwiper.value
    textSwiper.value.controller.control = mainSwiper.value
  }
}
const onMainReady = (s) => { mainSwiper.value = s; linkControllers() }
const onTextReady = (s) => { textSwiper.value = s; linkControllers() }

// ── 左下頁碼（current / total）＋ 上/下一張（對應原 tool_btn）
const total = computed(() => props.rows.length)
const current = ref(1)
const pad = (n) => String(n).padStart(2, '0')
const onSlideChange = (s) => { current.value = s.realIndex + 1 }
const slidePrev = () => mainSwiper.value && mainSwiper.value.slidePrev()
const slideNext = () => mainSwiper.value && mainSwiper.value.slideNext()
</script>

<template>
  <section class="banner14">
    <!-- 左 40%：形象圖（桌面才出現） -->
    <div class="logo_banner" aria-hidden="true"></div>

    <!-- 右 60%：主圖 swiper（fade；img 自然高度） -->
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

          <!-- 手機版文字（疊圖上、白字；桌面改由 .text_banner 顯示） -->
          <div class="cover_txt cover_txt--mb">
            <p v-if="row.title" v-html="toHtml(row.title)" />
            <p v-if="row.subtitle" v-html="toHtml(row.subtitle)" />
            <p v-if="row.memo" v-html="toHtml(row.memo)" />

            <NuxtLink v-if="row.link" class="cover_btn center" :to="row.link" :title="row.title || 'VIEW MORE'">
              <span>VIEW MORE</span>
            </NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 轉角白色裝飾（左 40% 底部；純 CSS 圓角，桌面才出現） -->
    <div class="corner" aria-hidden="true"></div>

    <!-- 桌面版文字 cover swiper（與主圖雙向同步、goLeft 進場） -->
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
          <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title" class="cover_title" v-html="toHtml(row.title)" />
          <p v-if="row.subtitle" class="cover_subtitle" v-html="toHtml(row.subtitle)" />
          <p v-if="row.memo" class="cover_memo" v-html="toHtml(row.memo)" />

          <NuxtLink v-if="row.link" class="cover_btn" :to="row.link" :title="row.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 左下工具列：頁碼 + 上/下一張（單張時隱藏） -->
    <div v-if="rows.length > 1" class="tool_btn">
      <p class="tool_page"><span>{{ pad(current) }}</span> ｜ <span>{{ pad(total) }}</span></p>

      <button class="banner_arrow prev" type="button" aria-label="上一張" @click="slidePrev"></button>
      <button class="banner_arrow next" type="button" aria-label="下一張" @click="slideNext"></button>
    </div>

    <!-- 右側直式社群欄（firm.social 有值才出現） -->
    <div v-if="socials.length" class="social_media">
      <div class="social_list">
        <a
          v-for="s in socials"
          :key="s.key"
          :href="s.url"
          target="_blank"
          rel="noopener"
          :aria-label="s.key"
        >
          <i :class="['icon', `icon-${s.key}`]"></i>
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner14 {
  display: flex;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

// ── 左 40%：形象圖區（後台 topImage；桌面才出現） ─────────────
.logo_banner {
  flex-shrink: 0;
  width: 40%;
  // 後台上傳的左側形象圖；未上傳＝純底色
  background: var(--banner-top-image, none) no-repeat center center / contain, #fff;

  @media (max-width: 720px) { display: none; }
}

// ── 右 60%：主圖 swiper（img 自然高度，非滿版裁切） ───────────
.index_banner {
  width: 60%;
  height: 100%;

  @media (max-width: 720px) { width: 100%; }

  :deep(.swiper-slide) { height: 100%; }

  .slide_inner {
    position: relative;
    height: 100%;
  }

  picture {
    display: block;
    width: 100%;
    height: 100%;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  // 手機版疊圖上的文字（桌面隱藏，改由 .text_banner 顯示）
  .cover_txt--mb {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 0 fluid(25);
    transform: translateY(-50%);

    @media (min-width: 721px) { display: none; }

    p:nth-child(1) { color: var(--banner-title-color, #fff); }
    p:nth-child(2) { color: var(--banner-subtitle-color, #fff); }
    p:nth-child(3) { color: var(--banner-memo-color, #fff); }
  }

  // 手機版進場：active slide 內各元素依序上浮淡入（對應原 goUp）
  :deep(.swiper-slide-active) .cover_txt--mb {
    p:nth-child(1) { animation: banner14_goUp 1s 0.4s forwards; }
    p:nth-child(2) { animation: banner14_goUp 1s 0.6s forwards; }
    p:nth-child(3) { animation: banner14_goUp 1s 0.8s forwards; }
    .cover_btn { animation: banner14_goUp 1s 1s forwards; }
  }

  // 分頁圓點（靠右；手機置中底部）
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

// ── 文字 cover 共用（手機疊圖 / 桌面 text_banner 皆套用） ──────
.cover_txt {
  // 進場前各元素隱藏，active slide 才依序動畫淡入（對應原 .cover_txt > * { opacity: 0 }）
  > * { opacity: 0; }

  // 第一行：主標（moduleTitleSize_cht(1)）
  .cover_title,
  p:nth-child(1) {
    color: var(--banner-title-color, #1a1a1a);
    font-weight: 700;
    font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));

    :deep(span) {
      @media (max-width: 720px) { display: none; }
    }
    :deep(br) {
      @media (min-width: 721px) { display: none; }
    }
  }

  // 第二行：副標
  .cover_subtitle,
  p:nth-child(2) {
    color: var(--banner-subtitle-color, #1a1a1a);
    font-weight: 700;
    font-size: clamp(17px, calc(26 / 19.2 * 1vw), calc(26 / 1920 * 2560 * 1px));
    margin-top: fluid(23);
  }

  // 第三行：標語（主色，moduleTitleSize_cht(3)）
  .cover_memo,
  p:nth-child(3) {
    color: var(--banner-memo-color, #{$web_color_1});
    font-weight: 500;
    font-size: clamp(15px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
    margin-top: fluid(13);
  }

  // VIEW MORE 按鈕（對應原 .button06；btnMarginTop(1)）
  .cover_btn {
    margin-top: fluid(55);

    @include rwd-1200 { margin-top: 35px; }
  }
}

// VIEW MORE 按鈕外觀（取代原 .button06，主色）
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

// ── 轉角白色裝飾（左 40% 底部；純 CSS 內凹圓弧，crisp 不鋸齒；手機隱藏） ──
// 以「右上角」為圓心、半徑＝邊長：圓內透明露出圖、圓外填白 → 白色左下凹角、弧線內凹
.corner {
  position: absolute;
  bottom: 0;
  left: 40%;
  width: 10.9375vw;
  height: 10.9375vw;
  background: radial-gradient(circle 10.9375vw at top right, transparent 99.5%, #fff 100%);
  pointer-events: none;
  z-index: 1;

  @media (max-width: 720px) { display: none; }
}

// ── 桌面文字 cover swiper（畫面左側垂直置中；手機隱藏） ───────
.text_banner {
  position: absolute;
  top: 50%;
  left: calc(160 / 1920 * 100%);
  width: calc(1600 / 1920 * 100%);
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;

  @media (max-width: 720px) { display: none; }

  :deep(.swiper-slide) .cover_txt { pointer-events: auto; }

  // 進場前：各元素隱藏
  :deep(.swiper-slide) .cover_txt > * { opacity: 0; }

  // 進場：active slide 內文字與按鈕依序自右淡入（對應原 goLeft）
  :deep(.swiper-slide-active) .cover_txt {
    .cover_title { animation: banner14_goLeft 1s 0.4s forwards; }
    .cover_subtitle { animation: banner14_goLeft 1s 0.6s forwards; }
    .cover_memo { animation: banner14_goLeft 1s 0.8s forwards; }
    .cover_btn { animation: banner14_goLeft 1s 1s forwards; }
  }
}

// ── 左下工具列：頁碼 + 上/下一張箭頭（手機隱藏） ─────────────
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

// 上/下一張箭頭（border V-chevron）
.banner_arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  @include banner-nav-vars(fluid(40), 0, $web_color_1, none);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { color: $web_color_2; }
}
.banner_arrow.prev::before { transform: rotate(-135deg); margin-left: 3px; }
.banner_arrow.next::before { transform: rotate(45deg); margin-right: 3px; }

// ── 右側直式社群欄（對應原 social_media） ───────────────────
.social_media {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 100%;
  padding-bottom: 3.64583vw;
  background: $web_color_1;
  z-index: 2;

  @media (max-width: 1200px) { width: 80px; }
  @media (max-width: 720px) { display: none; }

  .social_list {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: fluid(15);

    @media (max-width: 1024px) { gap: 10px; }
  }

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fluid(40);
    height: fluid(40);
    border: 1px solid #fff;
    border-radius: 50%;
    color: #fff;
    transition: all 0.1s;

    .icon {
      width: fluid(20);
      height: fluid(20);
    }

    &:hover {
      @media (min-width: 1025px) {
        background: #fff;
        color: $web_color_1;
      }
    }
  }
}

// ── 進場 keyframes（對應原 goUp / goLeft） ──────────────────
@keyframes banner14_goUp {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes banner14_goLeft {
  0%   { opacity: 0; transform: translateX(40px); }
  100% { opacity: 1; transform: translateX(0); }
}
</style>
