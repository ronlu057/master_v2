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
//     videoLink  = 該張自帶影片連結（可選）；未填則用全版型 videoUrl（後台影片欄位）
//     videoText  = 圓鈕旋轉文字（可選，預設 WATCH VIDEO）
// 圓形影片鈕：有影片連結才出現，點擊開「滿版彈跳視窗」播放（X 關閉，對應原 videoGallery）。
//   五個部位各自獨立色，由 CSS 變數控制（可後台/每則覆寫）：
//     --b15-ring-outer 外圈線、--b15-ring-inner 內圈線、--b15-text 旋轉文字、
//     --b15-btn-bg 播放圓底、--b15-tri 三角形。
// news：本版型未使用（介面相容用，忽略）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// 圓形影片鈕 → 後台可填影片連結（block 層級）+ 五部位獨立色 + 旋轉文字
defineOptions({ supportsVideo: true, videoButton: true })
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
})

// 影片連結：優先用該則自帶的 videoLink，否則用全版型 videoUrl（後台影片欄位）
const videoHref = (row) => row?.videoLink || props.videoUrl || ''

// 旋轉文字環內容（可換文字）：取該則 videoText，預設 WATCH VIDEO；重複數圈填滿圓周
const { state: siteState } = useEffectiveSettings()
const ringText = (row) => {
  const t = (siteState.bannerVideoText || row?.videoText || 'WATCH VIDEO').trim()
  return (`${t} • `).repeat(4)
}

// ── 影片彈跳視窗（滿版 YouTube）：點圓鈕開啟、X 關閉
const activeVideo = ref('')
const toEmbed = (url) => {
  if (!url) return ''
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&vq=hd2160` : url
}
const openVideo = (row) => {
  const u = videoHref(row)
  if (u) activeVideo.value = toEmbed(u)
}
const closeVideo = () => { activeVideo.value = '' }

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

        <!-- 每張 banner 一顆圓形影片鈕（有影片連結才出現）；點擊開滿版彈窗 -->
        <div v-if="videoHref(row)" class="slide_video">
          <button
            class="banner_video"
            type="button"
            aria-label="WATCH VIDEO"
            @click="openVideo(row)"
          >
            <!-- 外圈旋轉文字（可換文字、可換色；textPath 沿圓繞排） -->
            <span class="video_ring" aria-hidden="true">
              <svg viewBox="0 0 120 120" focusable="false">
                <defs>
                  <path :id="`b15ring-${i}`" d="M60,18 a42,42 0 1,1 -0.001,0" />
                </defs>
                <text>
                  <textPath :href="`#b15ring-${i}`" startOffset="0">{{ ringText(row) }}</textPath>
                </text>
              </svg>
            </span>

            <!-- 中央播放鈕（對應 icon29.svg：圓底 + 三角，兩者可分別換色） -->
            <span class="video_play" aria-hidden="true">
              <svg viewBox="0 0 60 60" focusable="false">
                <path class="video_play_bg" d="M0,31.8c0-1.2,0-2.3,0-3.5c0-0.4,0.1-0.8,0.1-1.3c0.7-6.5,3.2-12.2,7.5-17C12.3,4.9,18,1.7,24.8,0.5C26,0.3,27.1,0.2,28.3,0c1.2,0,2.3,0,3.5,0c1,0.1,2,0.2,3,0.4C41,1.4,46.5,4.1,51,8.6c6.7,6.7,9.7,14.9,8.8,24.4c-0.6,6.4-3.1,12-7.3,16.8c-5.7,6.3-12.8,9.8-21.3,10.2c-5.9,0.3-11.5-1.1-16.6-4.2C6.9,51,2.1,44.2,0.5,35.2C0.3,34.1,0.2,32.9,0,31.8z" />
                <path class="video_play_tri" d="M22.5,30c0,3.6,0,7.3,0,10.9c0,0.6,0.1,1.1,0.7,1.4c0.6,0.3,1,0.1,1.5-0.2c5.6-3.6,11.3-7.3,16.9-10.9c1.2-0.7,1.2-1.7,0-2.5c-5.6-3.6-11.3-7.3-16.9-10.9c-0.5-0.3-1-0.5-1.5-0.2c-0.6,0.3-0.7,0.8-0.7,1.4C22.5,22.7,22.5,26.4,22.5,30z" />
              </svg>
            </span>
          </button>
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

    <!-- 影片彈跳視窗（滿版；點 X 或背景關閉）-->
    <Teleport to="body">
      <div v-if="activeVideo" class="banner15_video_modal" role="dialog" aria-modal="true">
        <div class="bvm_bg" @click="closeVideo"></div>
        <div class="bvm_box">
          <div class="bvm_frame">
            <iframe
              :src="activeVideo"
              title="影片"
              frameborder="0"
              allow="autoplay; encrypted-media; fullscreen"
              allowfullscreen
            />
          </div>
          <button class="bvm_close" type="button" aria-label="關閉影片" @click="closeVideo">
            <AppIcon name="x" />
          </button>
        </div>
      </div>
    </Teleport>
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
    margin-top: fluid(30);
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

// 影片鈕五個部位各自獨立色（可由後台 / 每則覆寫對應變數）：
//   --b15-ring-outer 外圈線、--b15-ring-inner 內圈線、--b15-text 旋轉文字、
//   --b15-btn-bg 播放圓底、--b15-tri 三角形。留空＝以下預設（主色系）。
.banner_video {
  display: block;
  position: relative;
  width: fluid(120);
  height: fluid(120);
  padding: 0;
  background: none;
  // 外圈線 2px（留空＝主色 0.25 透明）
  border: 2px solid var(--banner-video-outer, #{rgba($web_color_1, 0.25)});
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  @media (max-width: 1440px) {
    width: 110px;
    height: 110px;
  }

  // 內圈線（與外圈同心；與旋轉文字保留適中間距）
  &::before {
    content: '';
    display: block;
    position: absolute;
    inset: fluid(5);
    border: 1px solid var(--banner-video-inner, #{$web_color_1});
    border-radius: 50%;
  }

  // 外圈旋轉文字環（textPath 沿圓繞排；可換文字、可換色、同心旋轉）
  .video_ring {
    position: absolute;
    inset: 0;
    animation: banner15_video 10s linear infinite;

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    text {
      fill: var(--banner-video-text, #{$web_color_1});
      font-size: 8.4px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
  }

  // 中央播放鈕（icon29 路徑：圓底 / 三角 各自獨立色，36px、同心）
  .video_play {
    position: absolute;
    top: 50%;
    left: 50%;
    width: fluid(36);
    height: fluid(36);
    transform: translate(-50%, -50%) scale(1);
    transition: all 0.3s;

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .video_play_bg { fill: var(--banner-video-bg, #{$web_color_1}); }
    .video_play_tri { fill: var(--banner-video-tri, #fff); }
  }

  &:hover .video_play {
    transform: translate(-50%, -50%) scale(1.2);
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

// ── 影片彈跳視窗（滿版；teleport 到 body，仍帶 scoped 屬性） ──
.banner15_video_modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.bvm_bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  cursor: pointer;
}

.bvm_box {
  position: relative;
  width: min(90vw, calc(90vh * 16 / 9));
  z-index: 1;
}

// 16:9 滿版置中影片
.bvm_frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.bvm_close {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -120%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 26px;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  @media (max-width: 720px) {
    transform: translate(0, -120%);
  }

  &:hover { opacity: 0.7; }
}
</style>
