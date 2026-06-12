<script setup>
// 首頁 Banner block — 版型 09（全螢幕 YouTube 背景影片 + 開場深色遮罩淡出 + 置中標語）
//
// 來源（忠實對應 PHP/JS/SCSS）：
//   D:\www\master_dev\template\module\banner\banner09.{php,js}
//   D:\www\master_dev\template\css\scss\module\banner\_banner09.scss
//
// 結構（對應原 PHP）：
//   .index_banner
//     #banner_video  YouTube 背景影片（原用 jQuery YTPlayer，opacity .47、mute、loop、無控制列）
//                    → 改用 YouTube iframe embed（cover 公式填滿、pointer-events:none）
//     .banner_cover  開場深色遮罩(#222)，掛載 3.9s 後加 .hide → opacity 0（transition 1s）淡出露出影片
//     .banner_txt    置中標語（data_title，$title_font_en）
//
// 資料來源（比照 BlockBanner01 的影片用法）：
//   props.videoUrl = YouTube 連結或影片 ID（背景影片）
//   標語文字 = rows[0].title（無則 props.title）
// rows[].link / news：本版型未使用（保留與 BlockBanner01 介面相容）
const props = defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// 影片來源比照 BlockBanner01：用專用的 props.videoUrl 欄位（rows[].link 是 VIEW MORE 頁面連結、非影片）
// 沒給則 fallback 樣板預設影片；支援完整網址或純 11 碼 ID
const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=J9GXBXLR97U'
const videoSource = computed(() => props.videoUrl || SAMPLE_VIDEO)
const videoId = computed(() => {
  const v = videoSource.value
  if (!v) return ''
  const m = v.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return m[1]
  return /^[\w-]{11}$/.test(v) ? v : ''
})
const videoEmbedUrl = computed(() =>
  videoId.value
    ? `https://www.youtube.com/embed/${videoId.value}?autoplay=1&mute=1&loop=1&playlist=${videoId.value}&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1`
    : '',
)

// 標語：優先 rows[0].title，否則 props.title
const tagline = computed(() => props.rows[0]?.title || props.title)

// 開場遮罩：掛載 3.9s 後淡出（對應原 JS setTimeout 3900 → addClass('hide')）
const coverHidden = ref(false)
let coverTimer = null
onMounted(() => {
  coverTimer = setTimeout(() => { coverHidden.value = true }, 3900)
})
onBeforeUnmount(() => {
  if (coverTimer) clearTimeout(coverTimer)
})
</script>

<template>
  <section class="banner09">
    <div class="index_banner">
      <!-- YouTube 背景影片 -->
      <div v-if="videoEmbedUrl" class="banner_video">
        <iframe
          :src="videoEmbedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        />
      </div>

      <!-- 開場深色遮罩（3.9s 後淡出） -->
      <div class="banner_cover" :class="{ hide: coverHidden }"></div>

      <!-- 置中標語 -->
      <div class="banner_txt">
        <div class="wider_container">
          <p>{{ tagline }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.banner09 {
  position: relative;
}

.index_banner {
  position: relative;
  height: 100vh;
  background: #000;
  overflow: hidden;

  @media (max-width: 1200px) { height: 680px; }
  @media (max-width: 1024px) { max-height: calc(100vh - 50px); }

  // ── YouTube 背景影片（cover 公式填滿、半透明 .47） ──────────
  .banner_video {
    position: absolute;
    inset: 0;
    overflow: hidden;
    opacity: 0.68;
    pointer-events: none;

    // cover 公式（banner09 自己的：min-height 用 100% 對應 .index_banner 各斷點高度，
    // 不用 banner01 的 100vh，因為 09 的容器在 ≤1200 是 680px、≤1024 是 calc(100vh-50px)）
    iframe {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100vw;
      height: 56.25vw;
      min-width: 177.78vh;
      min-height: 100%;
      transform: translate(-50%, -50%);
      border: 0;
      pointer-events: none;
    }
  }

  // ── 開場深色遮罩 ────────────────────────────────────────
  .banner_cover {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #222222;
    z-index: 1;

    &.hide {
      opacity: 0;
      transition: opacity 1s;
    }
  }

  // ── 置中標語 ────────────────────────────────────────────
  .banner_txt {
    position: absolute;
    top: 75%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    z-index: 2;

    p {
      color: #fff;
      font-size: 18px;
      font-family: $title_font_en;
      text-align: center;
      text-shadow: 0 0 15px rgba(0, 0, 0, 0.45);

      @media (max-width: 1440px) { font-size: 17px; }
      @media (max-width: 1024px) { font-size: 16px; }
      @media (max-width: 480px) { font-size: 15px; }
      @media (max-width: 400px) { font-size: 14px; }
    }
  }
}
</style>
