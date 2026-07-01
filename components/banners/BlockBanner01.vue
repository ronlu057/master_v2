<script setup>
// 首頁 Banner block — 版型 01（複合型：主圖 + 文字 cover 同步 + YouTube 背景 + 新聞跑馬燈）
//
// rows 結構（每筆）：
//   { image: { pc, mb }, title, subtitle, memo, btnText, link }
//     title=標題、subtitle=副標、memo=說明文（HTML）、btnText=按鈕文字（預設 VIEW MORE）、link=按鈕連結
//     文字顏色一律由 SCSS 控制（見 .cover_txt）；禁用行內 :style（會破壞 RWD）
//     文字欄位（title/subtitle/memo/link）全部為空 → 整個 cover 文字框不出現
// props.videoUrl：YouTube 連結（桌面背景影片，可選）
// props.news：新聞陣列 [{ title, summary, date, url }]（可選）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

defineOptions({ supportsVideo: true }) // 此版型會渲染背景影片 → 後台才顯示影片欄位
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  videoFile: { type: String, default: '' }, // YT 連結為空時，改播此上傳影片（HTML5）
  news: { type: Array, default: () => [] },
  showNav: { type: Boolean, default: true }, // 顯示「上一則 / 下一則」按鈕（後台 bannerNav 控制）
  loop: { type: Boolean, default: true }, // 後台 bannerLoop：無限循環
  autoplay: { type: Boolean, default: true }, // 後台 bannerAutoplay：自動播放
})

// ── 兩個 Swiper 雙向同步（主圖切到第 i 張，cover 也切到第 i 張）
const mainSwiper = ref(null)
const coverSwiper = ref(null)
const onMainReady = (s) => {
  mainSwiper.value = s
  if (coverSwiper.value) {
    s.controller.control = coverSwiper.value
    coverSwiper.value.controller.control = s
  }
}
const onCoverReady = (s) => {
  coverSwiper.value = s
  if (mainSwiper.value) {
    s.controller.control = mainSwiper.value
    mainSwiper.value.controller.control = s
  }
}

// ── YouTube embed URL（自動 loop / mute / 無 controls）
// 支援 youtu.be/XXX 與 youtube.com/watch?v=XXX
const videoEmbedUrl = computed(() => {
  if (!props.videoUrl) return ''
  const m = props.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!m) return ''
  const id = m[1]
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&vq=hd2160`
})

// ── 背景影片來源優先序：YouTube 連結 > 上傳影片檔（HTML5）
const useFileVideo = computed(() => !videoEmbedUrl.value && !!props.videoFile)
const hasVideo = computed(() => !!videoEmbedUrl.value || useFileVideo.value)

// 影片開關（使用者可關閉）；YT 僅桌面播放，上傳影片檔含手機/iOS 自動播放
const videoOn = ref(true)
const isMobile = ref(false)
let mq = null
const updateBreakpoint = () => {
  isMobile.value = mq.matches
}

// 實際是否顯示影片：YT → 桌面才播；HTML5 檔 → 任何裝置（muted+playsinline，iOS 也自動播）
const videoActive = computed(() => {
  if (!videoOn.value) return false
  if (videoEmbedUrl.value) return !isMobile.value
  return useFileVideo.value
})

// HTML5 <video>：除了 muted 屬性，再以 property 設 muted 並主動 play（iOS 自動播放必要條件）
const videoEl = ref(null)
const tryPlayFile = () => {
  const el = videoEl.value
  if (!el) return
  el.muted = true
  el.defaultMuted = true
  const p = el.play?.()
  if (p && typeof p.catch === 'function') p.catch(() => {})
}
watch([videoActive, () => props.videoFile], () => {
  if (videoActive.value && useFileVideo.value) nextTick(tryPlayFile)
})

onMounted(() => {
  mq = window.matchMedia('(max-width: 1024px)')
  updateBreakpoint()
  mq.addEventListener('change', updateBreakpoint)
  if (videoActive.value && useFileVideo.value) nextTick(tryPlayFile)
})
onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', updateBreakpoint)
})

// ── 向下捲動指示：點擊跳過 banner 看下面內容（解 fullscreen banner 副作用）
const { $lenis } = useNuxtApp()
const scrollDown = () => {
  const target = window.innerHeight
  if ($lenis) $lenis.scrollTo(target, { duration: 1.2 })
  else window.scrollTo({ top: target, behavior: 'smooth' })
}

// cover 文字框：title / subtitle / memo / link 全空則整個不渲染
const hasCover = (row) => !!(row.title || row.subtitle || row.memo || row.link)
</script>

<template>
  <section class="banner01">
    <div class="banner_content">
      <!-- 主圖 swiper -->
      <Swiper
        v-if="rows.length"
        class="index_banner"
        :modules="[Autoplay, EffectFade, Pagination, Navigation, Controller]"
        :slides-per-view="1"
        :loop="loop && rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :autoplay="autoplay ? { delay: 5000, disableOnInteraction: false } : false"
        :pagination="{ clickable: true }"
        :navigation="showNav && rows.length > 1 ? { prevEl: '.banner_nav_prev', nextEl: '.banner_nav_next' } : false"
        :allow-touch-move="false"
        @swiper="onMainReady"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <picture>
            <source media="(min-width: 641px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
          </picture>
        </SwiperSlide>
      </Swiper>

      <!-- 上一則 / 下一則（後台 bannerNav 開關；單張時不顯示；icon/大小/圓角由後台設定）-->
      <template v-if="showNav && rows.length > 1">
        <BannerNavBtn dir="prev" />
        <BannerNavBtn dir="next" />
      </template>

      <!-- 背景影片：YouTube（桌面）優先；YT 連結為空時改播上傳影片檔（HTML5，含 iOS 自動播放） -->
      <div v-if="hasVideo" class="video_banner" :class="{ show: videoActive }">
        <iframe
          v-if="videoEmbedUrl && videoActive"
          :src="videoEmbedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        />
        <video
          v-else-if="useFileVideo && videoActive"
          ref="videoEl"
          class="video_el"
          :src="videoFile"
          autoplay
          muted
          loop
          playsinline
          webkit-playsinline
          preload="auto"
          disablepictureinpicture
        />
      </div>

      <!-- 文字 cover swiper（跟主圖同步） -->
      <Swiper
        v-if="rows.length"
        class="index_banner_cover"
        :modules="[EffectFade, Controller]"
        :slides-per-view="1"
        :loop="loop && rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :allow-touch-move="false"
        @swiper="onCoverReady"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <div v-if="hasCover(row)" class="cover_txt" :class="`js-banner-row-${i}`">
            <!-- 第一則：主標 h1（全頁唯一）、副標 h2；第二則起主標 h2、副標 h2；說明文維持 p -->
            <component
              :is="i === 0 ? 'h1' : 'h2'"
              v-if="row.title"
              class="cover_title"
              v-html="row.title"
            />
            <h2 v-if="row.subtitle" class="cover_subtitle" v-html="row.subtitle" />
            <p v-if="row.memo" v-html="row.memo" />
            <NuxtLink v-if="row.link" :to="row.link" class="cover_btn" :title="row.title || row.btnText || 'VIEW MORE'">
              <span>{{ row.btnText || 'VIEW MORE' }}</span>
            </NuxtLink>
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- 影片開關（桌面才出現） -->
      <div v-if="hasVideo && !isMobile" class="video_control">
        <button v-if="videoOn" class="stop" aria-label="關閉影片" @click="videoOn = false">×</button>
        <button v-else class="play" aria-label="播放影片" @click="videoOn = true">
          <svg viewBox="0 0 8.23 10.96" width="14" height="18" aria-hidden="true">
            <path d="M0.62,10.96c-0.41-0.14-0.6-0.4-0.62-0.84c0-0.07,0-0.14,0-0.21c0-2.95,0-5.9,0-8.85C0,0.87,0.02,0.67,0.08,0.5c0.13-0.41,0.48-0.59,0.9-0.46c0.21,0.07,0.42,0.16,0.6,0.29c2,1.36,4,2.73,6,4.1C7.82,4.6,8.03,4.79,8.14,5.07c0.18,0.43,0.07,0.9-0.29,1.24C7.76,6.39,7.67,6.47,7.57,6.53c-1.99,1.37-3.99,2.73-5.98,4.1c-0.23,0.16-0.47,0.28-0.75,0.33C0.77,10.96,0.7,10.96,0.62,10.96z" />
          </svg>
        </button>
      </div>

      <!-- 向下捲動指示（提示下面還有內容） -->
      <button
        type="button"
        class="scroll_hint"
        :aria-label="$t('btn.more')"
        @click="scrollDown"
      >
        <span class="scroll_hint_label">SCROLL</span>
        <span class="scroll_hint_line"></span>
      </button>
    </div>

    <!-- 新聞跑馬燈（右下浮窗，可選） -->
    <aside v-if="news.length" class="banner_news">
      <Swiper
        class="news_swiper"
        :modules="[Autoplay, Navigation]"
        :slides-per-view="1"
        :loop="news.length > 1"
        :speed="500"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        :navigation="{ prevEl: '.news_prev', nextEl: '.news_next' }"
      >
        <SwiperSlide v-for="(item, i) in news" :key="i">
          <p class="news_date">{{ $t('nav.news') }}<span>{{ item.date }}</span></p>
          <p class="news_title">{{ item.title }}</p>
          <p class="news_desc">{{ item.summary }}</p>
          <NuxtLink v-if="item.url" :to="item.url" class="cover_btn small" :title="item.title || 'VIEW MORE'">
            <span>VIEW MORE</span>
          </NuxtLink>
        </SwiperSlide>
      </Swiper>
      <button class="news_prev" aria-label="上一則">‹</button>
      <button class="news_next" aria-label="下一則">›</button>
    </aside>
  </section>
</template>

<style lang="scss" scoped>
.banner01 {
  position: relative;
  overflow: hidden;
}

.banner_content {
  position: relative;
}

.index_banner {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;

  .swiper-slide {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      mix-blend-mode: multiply;
      pointer-events: none;
    }
  }

  picture {
    display: block;
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.03);
    }
  }

  .swiper-slide-active picture img {
    animation: banner01_zoom 6s linear forwards;
  }

}

@keyframes banner01_zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.03); }
}

.video_banner {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}
.video_banner.show {
  opacity: 1;
  pointer-events: auto;
}
// iframe 用 cover 公式：永遠填滿視窗，超出比例的部分被 clip（無黑邊）
// 16:9 比例下：寬 = 100vw 對應 56.25vw 高；高 100vh 對應 177.78vh 寬
// 兩個尺寸取較大者，確保 cover
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
// 上傳影片檔（HTML5）：直接 object-fit cover 填滿
.video_banner video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
  pointer-events: none;
}

.index_banner_cover {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  .swiper-slide {
    display: block;
    position: relative;
    height: 100%;
    pointer-events: none;
  }
}

.cover_txt {
  position: absolute;
  top: 50%;
  left: 8.333vw;
  transform: translateY(-50%);
  color: $web_color_3; // 文字色統一走 SCSS 變數（禁行內 :style）
  pointer-events: auto;
  max-width: fluid(540);

  @include rwd-768 {
    top: 47%;
    left: 0;
    width: 100%;
    padding: 0 15px;
    text-align: center;
  }
}

// 進場初始狀態：cover 內的標題(h1/h2)、說明文(p) 皆隱藏（按鈕另有規則）
.cover_txt > :is(h1, h2, h3, p) {
  color: inherit; // 蓋掉全站 h1~h4 標題色，改吃 .cover_txt 的白字
  opacity: 0;
  transform: translate(-20px, 0);
  transition: opacity 0.3s ease, transform 0.3s ease;

  @include rwd-768 {
    transform: translate(0, 20px);
  }
}

// 標題 / 副標 / 說明文 文字色：留空＝繼承 .cover_txt（$web_color_3）；後台可分別覆寫。
// app.vue 依 site-settings 注入 :root --banner-*-color；用 CSS 變數故免 !important（製作規範 §3.1）。
// 用後代選擇器拉高權重，蓋過上方 `.cover_txt > :is(h1,h2,h3,p){ color: inherit }`。
.cover_txt .cover_title { color: var(--banner-title-color, inherit); }
.cover_txt .cover_subtitle { color: var(--banner-subtitle-color, inherit); }
.cover_txt p { color: var(--banner-memo-color, inherit); }

.cover_title {
  font-size: clamp(24px, calc(56 / 19.2 * 1vw), calc(56 / 1920 * 2560 * 1px));
  font-weight: 900;
  margin: 0; // 改用 h1/h2 後清掉瀏覽器預設 margin
}

.cover_subtitle {
  font-size: clamp(16px, calc(24 / 19.2 * 1vw), calc(24 / 1920 * 2560 * 1px));
  font-weight: 500;
  margin: fluid(20) 0 0;
}

.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fluid(12) fluid(32);
  border: 1px solid #fff;
  color: #fff;
  font-size: fluid-fz(14);
  letter-spacing: 2px;
  margin-top: fluid(55);
  opacity: 0;
  transform: translate(-20px, 0);
  transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease, color 0.3s ease;

  @include rwd-1200 {
    margin-top: 35px;
  }

  @include rwd-768 {
    transform: translate(0, 20px);
  }

  &:hover {
    background: #fff;
    color: var(--color-heading);
  }
}

// 進場動畫：active slide 內各元素依序淡入
.index_banner_cover .swiper-slide-active .cover_txt > :is(h1, h2, h3, p),
.index_banner_cover .swiper-slide-active .cover_txt .cover_btn {
  opacity: 1;
  transform: translate(0, 0);
}
.index_banner_cover .swiper-slide-active .cover_txt > *:nth-child(1) { transition-delay: 0.5s; }
.index_banner_cover .swiper-slide-active .cover_txt > *:nth-child(2) { transition-delay: 0.7s; }
.index_banner_cover .swiper-slide-active .cover_txt > *:nth-child(3) { transition-delay: 0.9s; }
.index_banner_cover .swiper-slide-active .cover_txt .cover_btn      { transition-delay: 1.1s; }

.video_control {
  position: absolute;
  top: 50%;
  right: 8.333vw;
  transform: translateY(-50%);
  z-index: 3;
}

// 向下捲動指示（fullscreen banner 必備 — 告訴使用者下面還有內容）
.scroll_hint {
  position: absolute;
  bottom: fluid(40);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: fluid(12);
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  z-index: 3;
  padding: fluid(8) fluid(16);

  @include rwd-768 {
    bottom: 20px;
  }
}

.scroll_hint_label {
  font-size: fluid-fz(11);
  letter-spacing: 3px;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.scroll_hint_line {
  display: block;
  width: 1px;
  height: fluid(50);
  background: rgba(255, 255, 255, 0.25);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    animation: scroll_hint_slide 2s ease-in-out infinite;
  }
}

@keyframes scroll_hint_slide {
  0%   { top: -100%; }
  100% { top: 100%; }
}
.video_control button {
  width: fluid(50);
  height: fluid(50);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  cursor: pointer;
  color: var(--color-heading);
  font-size: fluid-fz(28);
  line-height: 1;
}
.video_control .play svg {
  fill: var(--color-heading);
}

// ── 新聞跑馬燈（右下浮窗） ─────────────────────────────────
.banner_news {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  max-width: fluid(790);
  padding: fluid(35) 3.6vw fluid(45);
  background: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  z-index: 2;
  overflow: hidden;

  @include rwd-1440 { max-width: 710px; padding: 25px 3.6vw 35px; }
  @include rwd-1200 { max-width: 650px; padding: 20px 3.6vw 30px; }
  @include rwd-1024 {
    position: static;
    max-width: none;
    padding: 35px 55px 45px;
  }
  @include rwd-768  { padding: 30px 25px 40px; }
  @include rwd-480  { padding: 30px 20px 40px; }
}

.news_swiper {
  position: relative;
  overflow: hidden;
}

.news_date {
  color: var(--color-heading);
  font-size: fluid-fz(15);
  font-weight: 700;
}
.news_date span {
  font-weight: 500;
  padding-left: fluid(15);
}

.news_title {
  color: var(--color-heading);
  font-size: fluid-fz(22);
  font-weight: 700;
  line-height: 1.5;
  margin-top: fluid(5);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news_desc {
  font-size: fluid-fz(14);
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-top: fluid(8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cover_btn.small {
  margin-top: fluid(24);
  padding: fluid(8) fluid(20);
  border-color: var(--color-heading);
  color: var(--color-heading);

  &:hover {
    background: var(--color-heading);
    color: #fff;
  }
}

.news_prev,
.news_next {
  position: absolute;
  bottom: fluid(16);
  width: fluid(28);
  height: fluid(28);
  background: none;
  border: none;
  cursor: pointer;
  font-size: fluid-fz(24);
  line-height: 1;
  color: var(--color-heading);

  &:hover { color: var(--color-primary); }
}
.news_prev { right: fluid(40); }
.news_next { right: fluid(4); }
.news_next::before {
  content: '';
  position: absolute;
  top: 50%;
  left: fluid(-10);
  width: 1px;
  height: fluid(11);
  background: #dededf;
  transform: translateY(-50%);
}
</style>
