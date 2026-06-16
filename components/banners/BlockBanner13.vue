<script setup>
// 首頁 Banner block — 版型 13（全螢幕 fade 主圖 + 左側文字 cover + WATCH VIDEO 觸發 YouTube 背景影片）
//
// 來源：D:\www\master_dev\template\module\banner\banner13.{php,js}
//       D:\www\master_dev\template\css\scss\module\banner\_banner13.scss
//
// 說明：
//   - 全螢幕 fade 切換主圖；每張 slide 左側疊一段文字 cover（title / title2 / memo），隨 active 依序淡入。
//   - 「WATCH VIDEO」按鈕（.play）開啟 YouTube 背景影片浮層（桌面填滿、手機 < 1025 不顯示影片）。
//   - 影片浮層含「停止」與「靜音切換」兩顆按鈕（對應原 YTPlayer 的 stop / sound）。
//   - 僅轉首頁 index banner；page-banner 交給共用 PageBanner01 處理（原 PHP 的 else 分支忽略）。
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, title2, memo, link }
//     image.pc = 大圖（min-width:721px）, image.mb = 小圖
//     title    = 第一行（白字，moduleTitleSize_cht(1)）
//     title2   = 第二行（主色，moduleTitleSize_cht(1)）
//     memo     = 說明（bannerTitleSize_cht(2)，可含換行 → toHtml）
//     link     = 預留 VIEW MORE 連結（原版預設走影片，link 為備援；可選）
// props.videoUrl：YouTube 連結（WATCH VIDEO 背景影片，可選；無則不顯示 .play 與影片浮層）
// props.news：介面相容用，本版型未使用
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
})

// 換行欄位：把 \n 轉成 <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// ── YouTube embed URL（自動 loop / mute 起播，無 controls）
// 支援 youtu.be/XXX、youtube.com/watch?v=XXX，或直接給影片 ID（原版用裸 ID）
const videoEmbedUrl = computed(() => {
  if (!props.videoUrl) return ''
  const m = props.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  const id = m ? m[1] : props.videoUrl.trim()
  if (!id) return ''
  const mute = muted.value ? 1 : 0
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${mute}&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1`
})

// ── 影片浮層開關 / 靜音狀態
const videoOn = ref(false)
const muted = ref(true)
const isMobile = ref(false)
let mq = null
const updateBreakpoint = () => { isMobile.value = mq.matches }
onMounted(() => {
  mq = window.matchMedia('(max-width: 1024px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', updateBreakpoint)
})
onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', updateBreakpoint)
})

// WATCH VIDEO：桌面開背景影片浮層；手機（< 1025）改開外連 YouTube
const onPlay = () => {
  if (!videoEmbedUrl.value) return
  if (isMobile.value) {
    window.open(props.videoUrl, '_blank', 'noopener')
  } else {
    muted.value = false
    videoOn.value = true
  }
}
const onStop = () => { videoOn.value = false }
const toggleSound = () => { muted.value = !muted.value }
</script>

<template>
  <section class="banner13">
    <div class="index_banner_wrap">
      <!-- 主圖 + 文字 cover（fade 切換，cover 疊在每張 slide 上隨 active 淡入） -->
      <Swiper
        v-if="rows.length"
        class="index_banner"
        :modules="[Autoplay, EffectFade, Pagination, Navigation]"
        :slides-per-view="1"
        :loop="rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :navigation="{ prevEl: '.banner13_prev', nextEl: '.banner13_next' }"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <div class="slide_inner">
            <picture>
              <source media="(min-width: 721px)" :srcset="row.image?.pc" />
              <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
            </picture>

            <div class="cover_txt">
              <div v-if="row.title">{{ row.title }}</div>
              <component :is="i === 0 ? 'h1' : 'h2'" v-if="row.title2">{{ row.title2 }}</component>
              <p v-if="row.memo" v-html="toHtml(row.memo)" />

              <div v-if="videoEmbedUrl" class="play" @click="onPlay">
                <span class="play_icon" aria-hidden="true"></span>
                <span>WATCH VIDEO</span>
              </div>
              <NuxtLink v-else-if="row.link" class="cover_btn" :to="row.link" :title="row.title2 || 'VIEW MORE'">
                <span>VIEW MORE</span>
              </NuxtLink>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <button class="banner13_prev banner_arrow" type="button" aria-label="上一張"></button>
      <button class="banner13_next banner_arrow" type="button" aria-label="下一張"></button>

      <!-- YouTube 背景影片浮層（桌面才掛 iframe；點 WATCH VIDEO 開啟） -->
      <div v-if="videoEmbedUrl" class="video_banner" :class="{ show: videoOn && !isMobile }">
        <iframe
          v-if="videoOn && !isMobile"
          :src="videoEmbedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        />
        <button class="vb_btn stop" type="button" aria-label="關閉影片" @click="onStop">×</button>
        <button class="vb_btn sound" type="button" aria-label="靜音切換" @click="toggleSound">
          {{ muted ? '🔇' : '🔊' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner13 {
  position: relative;
}

.index_banner_wrap {
  position: relative;
}

// ── 主圖 swiper（全螢幕） ─────────────────────────────────
.index_banner {
  width: 100%;
  height: 100vh;

  .swiper-slide {
    height: 100%;
  }

  .slide_inner {
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

// ── 文字 cover（左側，隨 active 淡入） ────────────────────
.cover_txt {
  position: absolute;
  top: 50%;
  left: 8vw;
  width: 84vw;
  transform: translate(0, -50%);
  transition: all 0.3s;
  z-index: 2;

  @media (max-width: 640px) {
    top: 80%;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 0 25px;
  }

  > * {
    opacity: 0;
    transform: translate(-40px, 0);

    @media (max-width: 640px) {
      transform: translate(0, 40px);
    }
  }

  > :nth-child(1) {
    color: $web_font_color;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0;
    text-transform: uppercase;
    transition: all 0.3s, opacity 0.5s, transform 0.5s;
    // moduleTitleSize_cht(1)
    font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
  }

  > :nth-child(2) {
    color: $web_color_1;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0;
    text-transform: uppercase;
    transition: all 0.3s, opacity 0.5s 0.1s, transform 0.5s 0.1s;
    // moduleTitleSize_cht(1)
    font-size: clamp(30px, calc(45 / 19.2 * 1vw), calc(45 / 1920 * 2560 * 1px));
  }

  > :nth-child(3) {
    color: $web_font_color;
    margin-top: fluid(15);
    transition: all 0.3s, opacity 0.5s 0.2s, transform 0.5s 0.2s;
    // bannerTitleSize_cht(2)
    font-size: clamp(16px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));

    @media (max-width: 540px) {
      display: none;
    }
  }

  // VIEW MORE 備援按鈕（原 .button06 → .cover_btn）
  .cover_btn {
    // btnMarginTop(1)
    margin-top: fluid(55);
    transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

    @media (max-width: 1200px) { margin-top: 35px; }
    @media (max-width: 640px) { margin: 0 auto; }
    @media (max-width: 400px) { margin-top: 20px; }
  }

  .play {
    display: flex;
    align-items: center;
    width: fit-content;
    margin-top: fluid(30);
    cursor: pointer;
    transition: all 0.3s, opacity 0.5s 0.3s, transform 0.5s 0.3s;

    @media (max-width: 640px) {
      flex-direction: column;
      margin: 0 auto;
    }
    @media (max-width: 400px) {
      margin-top: 15px;
    }

    // 播放三角圖示（原 icon27.svg；以邊框繪製避免外部資源）
    .play_icon {
      flex-shrink: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 14px 0 14px 22px;
      border-color: transparent transparent transparent #{$web_font_color};
      transition: all 0.3s;

      @media (max-width: 1440px) { border-width: 12px 0 12px 19px; }
      @media (max-width: 1200px) { border-width: 11px 0 11px 17px; }
      @media (max-width: 640px)  { border-width: 14px 0 14px 22px; }
      @media (max-width: 440px)  { border-width: 12px 0 12px 19px; }
    }

    span {
      color: $web_font_color;
      font-size: fluid-fz(12);
      font-weight: 700;
      letter-spacing: 1px;
      margin-left: fluid(10);
      transition: all 0.3s;

      @media (max-width: 640px) {
        margin-top: 10px;
        margin-left: unset;
      }
      @media (max-width: 400px) { display: none; }
    }

    &:hover {
      @media (min-width: 1025px) {
        .play_icon { border-left-color: $web_color_1; }
        span { color: $web_color_1; }
      }
    }
  }
}

// VIEW MORE 按鈕外觀（原 .button06 → .cover_btn，主色）
.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid $web_color_1;
  color: $web_color_1;
  font-size: fluid-fz(14);
  letter-spacing: 2px;

  &:hover {
    color: #fff;
    background: $web_color_1;
  }
}

// 進場：active slide 內文字與按鈕依序淡入
.index_banner .swiper-slide-active .cover_txt {
  > * {
    opacity: 1;
    transform: translate(0, 0);
  }

  > :nth-child(1) { transition: all 0.3s, opacity 1s 1s, transform 1s 1s; }
  > :nth-child(2) { transition: all 0.3s, opacity 1s 1.1s, transform 1s 1.1s; }
  > :nth-child(3) { transition: all 0.3s, opacity 1s 1.2s, transform 1s 1.2s; }
  .cover_btn,
  .play { transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s; }
}

// ── 分頁圓點（左下；對應原 swiper-pagination） ────────────
.index_banner :deep(.swiper-pagination) {
  bottom: 1.5625vw;
  left: 8vw;
  transform: unset;
  text-align: left;

  @media (max-width: 1024px) {
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }

  .swiper-pagination-bullet {
    position: relative;
    width: fluid(19);
    height: fluid(19);
    border: 1px solid transparent;
    border-radius: 50%;
    margin: 0 fluid(4);
    background: transparent;
    opacity: 1;

    @media (max-width: 1024px) {
      width: 17px;
      height: 17px;
    }

    &::after {
      position: absolute;
      content: '';
      width: fluid(11);
      height: fluid(11);
      border-radius: 50%;
      top: fluid(3);
      left: fluid(3);
      background: $web_color_2;

      @media (max-width: 1024px) {
        width: 9px;
        height: 9px;
      }
    }

    &.swiper-pagination-bullet-active {
      border: 1px solid $web_color_1;

      &::after { background: $web_color_1; }
    }
  }
}

// ── 左右箭頭（border V-chevron；桌面 1024 以下隱藏） ──────
.banner_arrow {
  position: absolute;
  left: calc(4vw - 10px);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fluid(40);
  height: fluid(40);
  background: none;
  border: none;
  cursor: pointer;
  color: $web_font_color;
  transition: all 0.3s;

  @media (max-width: 1200px) { width: 35px; height: 35px; }
  @media (max-width: 1024px) { display: none; }

  // 邊框畫 V 形箭頭
  &::before {
    content: '';
    width: fluid(9);
    height: fluid(9);
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
  }

  &:hover { color: $web_color_1; }
}
// 原版兩顆箭頭上下排列（prev 在上、next 在下）
.banner13_prev {
  top: calc(50% - 54px);
  &::before { transform: rotate(-45deg); margin-top: fluid(3); }
}
.banner13_next {
  top: calc(50% + 54px);
  &::before { transform: rotate(135deg); margin-bottom: fluid(3); }
}

// ── YouTube 背景影片浮層 ─────────────────────────────────
.video_banner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
  transition: all 0.3s;

  &.show {
    opacity: 1;
    pointer-events: auto;
  }
}
// iframe cover 公式：永遠填滿，超出比例的部分被裁切（無黑邊）
.video_banner iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 56.25vw;
  min-width: 100%;
  min-height: 100vh;
  transform: translate(-50%, -50%);
  border: 0;
  pointer-events: none;
}

.vb_btn {
  position: absolute;
  bottom: fluid(30);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  line-height: 1;
  transition: all 0.3s;

  @media (max-width: 1440px) { bottom: 15px; }
  @media (max-width: 1024px) { font-size: 22px; }

  &.stop { right: calc(50% + 10px); }
  &.sound { left: calc(50% + 10px); }

  &:hover { color: rgba(255, 255, 255, 1); }
}
</style>
