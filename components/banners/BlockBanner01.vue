<script setup>
// 首頁 Banner block — 版型 01（複合型：主圖 + 文字 cover 同步 + YouTube 背景 + 新聞跑馬燈）
//
// rows 結構（每筆）：
//   { image: { pc, mb }, link, title, memo }
// props.videoUrl：YouTube 連結（桌面背景影片，可選）
// props.news：新聞陣列 [{ title, summary, date, url }]（可選）
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination, Navigation, Controller } from 'swiper/modules'
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
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1`
})

// ── 影片開關：桌面預設開、手機關（< 1024 不顯示影片）
const videoOn = ref(true)
const isMobile = ref(false)
let mq = null
const updateBreakpoint = () => {
  isMobile.value = mq.matches
  if (isMobile.value) videoOn.value = false
}
onMounted(() => {
  mq = window.matchMedia('(max-width: 1024px)')
  updateBreakpoint()
  mq.addEventListener('change', updateBreakpoint)
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
</script>

<template>
  <section class="banner01">
    <div class="banner_content">
      <!-- 主圖 swiper -->
      <Swiper
        v-if="rows.length"
        class="index_banner"
        :modules="[Autoplay, EffectFade, Pagination, Controller]"
        :slides-per-view="1"
        :loop="rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :allow-touch-move="false"
        @swiper="onMainReady"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <picture>
            <source media="(min-width: 641px)" :srcset="row.image?.pc" />
            <img :src="row.image?.mb || row.image?.pc" :alt="row.title || ''" />
          </picture>
        </SwiperSlide>
      </Swiper>

      <!-- YouTube 背景影片（桌面才掛 iframe，避免手機載入） -->
      <div v-if="videoEmbedUrl" class="video_banner" :class="{ show: videoOn && !isMobile }">
        <iframe
          v-if="videoOn && !isMobile"
          :src="videoEmbedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        />
      </div>

      <!-- 文字 cover swiper（跟主圖同步） -->
      <Swiper
        v-if="rows.length"
        class="index_banner_cover"
        :modules="[EffectFade, Controller]"
        :slides-per-view="1"
        :loop="rows.length > 1"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :allow-touch-move="false"
        @swiper="onCoverReady"
      >
        <SwiperSlide v-for="(row, i) in rows" :key="i">
          <div class="cover_txt">
            <p v-if="row.title" class="cover_title">{{ row.title }}</p>
            <p v-if="row.memo" v-html="row.memo" />
            <NuxtLink v-if="row.link" :to="row.link" class="cover_btn">
              <span>VIEW MORE</span>
            </NuxtLink>
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- 影片開關（桌面才出現） -->
      <div v-if="videoEmbedUrl && !isMobile" class="video_control">
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
          <NuxtLink v-if="item.url" :to="item.url" class="cover_btn small">
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

  .swiper-pagination {
    text-align: left;
    bottom: 2.45vw;

    @include rwd-768 {
      text-align: center;
      left: 0;
    }
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
  color: #fff;
  pointer-events: auto;
  max-width: 540px;

  @include rwd-768 {
    top: 47%;
    left: 0;
    width: 100%;
    padding: 0 15px;
    text-align: center;
  }
}

.cover_txt p {
  opacity: 0;
  transform: translate(-20px, 0);
  transition: opacity 0.3s ease, transform 0.3s ease;

  @include rwd-768 {
    transform: translate(0, 20px);
  }
}

.cover_title {
  font-size: clamp(24px, 4vw, 56px);
  font-weight: 900;
  margin-bottom: 18px;
}

.cover_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  border: 1px solid #fff;
  color: #fff;
  font-size: 14px;
  letter-spacing: 2px;
  margin-top: 24px;
  opacity: 0;
  transform: translate(-20px, 0);
  transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease, color 0.3s ease;

  @include rwd-768 {
    transform: translate(0, 20px);
  }

  &:hover {
    background: #fff;
    color: var(--color-heading);
  }
}

// 進場動畫：active slide 內各元素依序淡入
.index_banner_cover .swiper-slide-active .cover_txt p,
.index_banner_cover .swiper-slide-active .cover_txt .cover_btn {
  opacity: 1;
  transform: translate(0, 0);
}
.index_banner_cover .swiper-slide-active .cover_txt p:nth-child(1)  { transition-delay: 0.5s; }
.index_banner_cover .swiper-slide-active .cover_txt p:nth-child(2)  { transition-delay: 0.7s; }
.index_banner_cover .swiper-slide-active .cover_txt p:nth-child(3)  { transition-delay: 0.9s; }
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
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  z-index: 3;
  padding: 8px 16px;

  @include rwd-768 {
    bottom: 20px;
  }
}

.scroll_hint_label {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.scroll_hint_line {
  display: block;
  width: 1px;
  height: 50px;
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
  width: 50px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  cursor: pointer;
  color: var(--color-heading);
  font-size: 28px;
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
  max-width: 790px;
  padding: 35px 3.6vw 45px;
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
  font-size: 15px;
  font-weight: 700;
}
.news_date span {
  font-weight: 500;
  padding-left: 15px;
}

.news_title {
  color: var(--color-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  margin-top: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news_desc {
  line-height: 1.5;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cover_btn.small {
  margin-top: 24px;
  padding: 8px 20px;
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
  bottom: 16px;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  color: var(--color-heading);

  &:hover { color: var(--color-primary); }
}
.news_prev { right: 40px; }
.news_next { right: 4px; }
.news_next::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -10px;
  width: 1px;
  height: 11px;
  background: #dededf;
  transform: translateY(-50%);
}
</style>
