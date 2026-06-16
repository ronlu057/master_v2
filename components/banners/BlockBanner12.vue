<script setup>
// 首頁 Banner block — 版型 12（鏤空大字 hollow text + 毛玻璃進場 + 底部 cover 文字）
//
// 忠實對應原始檔 / 線上 demo：
//   D:\www\master_dev\template\module\banner\banner12.php / banner12.js
//   D:\www\master_dev\template\css\scss\module\banner\_banner12.scss
//   線上：https://awaken_base.lucas.private.ad-design.tw/demo_banner.php（VIEW MORE = button06）
//
// 結構（對應 demo / PHP，逐層一致）：
//   .index_banner（fade swiper、speed 1000、autoplay 5s、loop；只有 pagination）
//     .swiper-slide
//       picture（min-width:721 用 pc 大圖、否則 mb 小圖；img width:100% 自然高度）
//       .frosted_glass（毛玻璃，≤720 隱藏）
//         ::before     毛玻璃模糊層，active 時寬度由 0 展開到 800/1920
//         .hollow_txt  鏤空大字
//           p > span.hollow_1（毛玻璃「內」：鏤空填圖，右緣貼齊毛玻璃邊界）
//               + span        （毛玻璃「外」：白色實心字，左緣貼齊毛玻璃邊界）
//           p > span.hollow_2 + span（第二行同上）
//       .cover > .wider_container > p×3（memo）+ a.cover_btn（VIEW MORE）
//
// rows 結構（每筆）：
//   { image:{pc,mb}, title, title2, title3, title4, memo, link }
//     title  = 第一行毛玻璃內鏤空字、title2 = 第一行毛玻璃外白字
//     title3 = 第二行鏤空字、title4 = 第二行白字
//     memo   = 底部 cover 文字（HTML，三段 <p>；亦相容 \n → <br>）、link = VIEW MORE 連結
// props.title / videoUrl / news：BlockBanner01 介面相容，本版型未使用。
//
// 鏤空字背景定位 = 原始 banner12.js 的 bg_pos：
//   底圖為 width:100% 自然高度，故 background-size 設為 banner 寬度，
//   再依各鏤空字在文件中的位置反推 background-position，使鏤空字像底圖被「鏤空」透出。
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

defineProps({
  title: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  videoUrl: { type: String, default: '' },
  news: { type: Array, default: () => [] },
})

// memo 換行：\n → <br>（對應原 PHP nl2br）
const toHtml = (s) => (s || '').replace(/\n/g, '<br>')

// cover 內容：memo 的 <p> 與 VIEW MORE 按鈕直接灑進 .wider_container（對齊 demo 逐層結構，按鈕用 <a>）
const coverHtml = (row) => {
  let html = toHtml(row.memo)
  if (row.link) {
    html += `<a class="cover_btn" href="${row.link}"><span>VIEW MORE</span></a>`
  }
  return html
}

// 進場毛玻璃旗標（對應原 .beginning class），掛載後短延遲移除以觸發 active 動畫
const beginning = ref(true)

const rootEl = ref(null)

// ── 鏤空字背景定位（對應 banner12.js 的 bg_pos，支援 100vh + object-fit:cover）──
// 底圖改為 height:100vh、object-fit:cover 後會等比縮放並置中裁切，
// 故填圖須依各圖 naturalWidth/Height 重算 cover 後的繪製尺寸（drawW/drawH）
// 與裁切位移（offsetX/offsetY），鏤空字才會對齊裁切後的底圖。
const bgPos = () => {
  const root = rootEl.value
  if (!root) return
  const banner = root.querySelector('.index_banner')
  if (!banner) return

  const bannerRect = banner.getBoundingClientRect()
  const bannerW = banner.offsetWidth
  const bannerH = banner.offsetHeight
  const bannerLeft = bannerRect.left + window.scrollX
  const bannerTop = bannerRect.top + window.scrollY

  // 逐 slide 處理：每張底圖原尺寸不同，cover 縮放與裁切位移也各自不同
  root.querySelectorAll('.index_banner .swiper-slide').forEach((slide) => {
    const img = slide.querySelector('picture img')
    const natW = img?.naturalWidth || bannerW
    const natH = img?.naturalHeight || bannerH

    // object-fit:cover → 取較大縮放使底圖完全覆蓋 banner，多餘部分置中裁切（位移為負）
    const scale = Math.max(bannerW / natW, bannerH / natH)
    const drawW = natW * scale
    const drawH = natH * scale
    const offsetX = (bannerW - drawW) / 2
    const offsetY = (bannerH - drawH) / 2

    slide.querySelectorAll('.hollow_1, .hollow_2').forEach((el) => {
      el.style.backgroundSize = `${drawW}px ${drawH}px`
      const rect = el.getBoundingClientRect()
      const elLeft = rect.left + window.scrollX - bannerLeft
      const elTop = rect.top + window.scrollY - bannerTop
      el.style.backgroundPositionX = `${offsetX - elLeft}px`
      el.style.backgroundPositionY = `${offsetY - elTop}px`
    })
  })
}

const onMainReady = () => {
  nextTick(bgPos)
}

onMounted(() => {
  bgPos()
  window.addEventListener('scroll', bgPos)
  window.addEventListener('resize', bgPos)
  // 底圖載入後高度才定案、鏤空字位置才正確 → 載完重算（對應原 window load）
  rootEl.value?.querySelectorAll('.index_banner picture img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', bgPos, { once: true })
  })
  // 對應原 setTimeout 200ms 移除 .beginning
  setTimeout(() => {
    beginning.value = false
    bgPos()
  }, 200)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', bgPos)
  window.removeEventListener('resize', bgPos)
})
</script>

<template>
  <section ref="rootEl" class="banner12">
    <Swiper
      v-if="rows.length"
      class="index_banner"
      :class="{ beginning }"
      :modules="[Autoplay, EffectFade, Pagination]"
      :slides-per-view="1"
      :loop="rows.length > 1"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1000"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      @swiper="onMainReady"
      @slide-change="bgPos"
    >
      <SwiperSlide v-for="(row, i) in rows" :key="i">
        <picture>
          <source media="(min-width: 721px)" :srcset="row.image?.pc" />
          <img :src="row.image?.mb || row.image?.pc" :alt="row.alt || row.title || ''" />
        </picture>

        <div class="frosted_glass">
          <div class="hollow_txt">
            <p v-if="row.title || row.title2">
              <span class="hollow_1" :style="{ '--bg': `url('${row.image?.pc}')` }">{{ row.title }}</span>
              <span>{{ row.title2 }}</span>
            </p>
            <p v-if="row.title3 || row.title4">
              <span class="hollow_2" :style="{ '--bg': `url('${row.image?.pc}')` }">{{ row.title3 }}</span>
              <span>{{ row.title4 }}</span>
            </p>
          </div>
        </div>

        <div class="cover">
          <!-- memo 三段 <p> + VIEW MORE 直接放進 wider_container（對齊 demo 結構） -->
          <div class="wider_container" v-html="coverHtml(row)" />
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style lang="scss" scoped>
.banner12 {
  position: relative;
  background: #000;
}

// ── 主圖 swiper（對應原版 _banner12.scss：width 滿版、自然高度）──────
.index_banner {
  position: relative;
  z-index: 1;
  height: 100vh;

  .swiper-slide {
    overflow: hidden;
    height: 100vh;

    picture {
      display: block;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    // ── 毛玻璃 + 鏤空大字 ─────────────────────────────────
    .frosted_glass {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;

      @media (max-width: 720px) {
        display: none;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 0%;
        background: rgba(#fff, 0.3);
        backdrop-filter: blur(20px);
        transition: width 1s;
      }

      .hollow_txt {
        position: absolute;
        top: 27%;
        left: 0;
        right: 0;
        transition: all 0.3s;

        @media (max-width: 1366px) { top: 20%; }
        @media (max-width: 1024px) { top: 17%; }
        @media (max-width: 960px) { top: 14%; }
        @media (max-width: 840px) { top: 12%; }
        @media (max-width: 768px) { top: 10%; }

        p {
          position: relative;
          font-size: clamp(65px, calc(162 / 19.2 * 1vw), calc(162 / 1920 * 2560 * 1px));
          font-weight: 900;
          font-family: 'Roboto', sans-serif;
          line-height: 1;

          span {
            // 毛玻璃「內」：鏤空填圖（透出背景），右緣對齊毛玻璃邊界
            &:nth-child(1) {
              position: absolute;
              right: calc(1120 / 1920 * 100%);
              color: transparent;
              background: var(--bg);
              background-repeat: no-repeat;
              background-clip: text;
              -webkit-background-clip: text;
            }

            // 毛玻璃「外」：白色實心字，左緣對齊毛玻璃邊界
            &:nth-child(2) {
              position: relative;
              left: calc(800 / 1920 * 100%);
              color: #fff;
              opacity: 0;
              transition: opacity 1s;
            }
          }
        }
      }
    }

    // ── 底部 cover（wider_container 內：memo 三段 <p> + VIEW MORE 按鈕）──
    .cover {
      position: absolute;
      bottom: calc(96 / 19.2 * 1vw);
      left: 0;
      right: 0;

      @media (max-width: 720px) {
        bottom: 50%;
        text-align: center;
        transform: translateY(50%);
      }

      .wider_container {
        @media (max-width: 480px) {
          padding: 0 15px;
        }

        // 進場前初始狀態（memo 三段 + 按鈕共用）：右移淡出，手機改下移
        :deep(p),
        :deep(.cover_btn) {
          opacity: 0;
          transform: translate(40px, 0);
          transition: all 0.3s, opacity 1s, transform 1s;

          @media (max-width: 720px) { transform: translate(0, 40px); }
        }

        // memo 三段共用：白字 + 陰影
        :deep(p) {
          color: #fff;
          text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        }

        // memo 第一段（手機標題，桌面隱藏）
        :deep(p):nth-child(1) {
          font-size: clamp(20px, calc(28 / 19.2 * 1vw), calc(28 / 1920 * 2560 * 1px));
          font-weight: 900;
          font-family: 'Roboto', sans-serif;
          line-height: 1;
          margin-bottom: fluid(18);

          @media (min-width: 721px) { display: none; }
        }

        // memo 第二段（主標）
        :deep(p):nth-child(2) {
          font-size: clamp(20px, calc(28 / 19.2 * 1vw), calc(28 / 1920 * 2560 * 1px));
          font-weight: 700;
          font-family: $title_font_cht;
        }

        // memo 第三段（副標）
        :deep(p):nth-child(3) {
          font-size: clamp(14px, calc(18 / 19.2 * 1vw), calc(18 / 1920 * 2560 * 1px));
          font-family: $title_font_en;
          margin-top: fluid(15);

          @media (max-width: 720px) { margin-top: 24px; }
        }

        // VIEW MORE 按鈕進場（對齊原始 btnMarginTop(1)：55px、≤1200 為 35px）
        :deep(.cover_btn) {
          margin-top: fluid(55) !important;

          @media (max-width: 1200px) { margin-top: 35px !important; }
          @media (max-width: 720px) {
            margin: 0 auto;
            margin-top: 35px !important;
          }
        }
      }
    }

    // ── active 進場動畫 ─────────────────────────────────
    &.swiper-slide-active {
      .frosted_glass {
        &::before {
          width: calc(800 / 1920 * 100%);
          transition: width 1s 1s;
        }

        .hollow_txt p span:nth-child(2) {
          opacity: 1;
          transition: opacity 1s 1.9s;
        }
      }

      .cover .wider_container {
        :deep(p):nth-child(1),
        :deep(p):nth-child(2),
        :deep(p):nth-child(3),
        :deep(.cover_btn) {
          opacity: 1;
          transform: translate(0, 0);
        }

        :deep(p):nth-child(1) { transition: all 0.3s, opacity 1s 1s, transform 1s 1s; }
        :deep(p):nth-child(2) { transition: all 0.3s, opacity 1s 1.3s, transform 1s 1.3s; }
        :deep(p):nth-child(3) { transition: all 0.3s, opacity 1s 1.6s, transform 1s 1.6s; }
        :deep(.cover_btn) { transition: all 0.3s, opacity 1s 1.9s, transform 1s 1.9s; }
      }
    }
  }

  // ── 進場（.beginning）：壓回初始狀態，移除後才播 active 動畫 ──
  &.beginning {
    .swiper-slide.swiper-slide-active {
      .frosted_glass {
        &::before { width: 0%; }
        .hollow_txt p span:nth-child(2) { opacity: 0; }
      }

      .cover .wider_container {
        :deep(p):nth-child(1),
        :deep(p):nth-child(2),
        :deep(p):nth-child(3),
        :deep(.cover_btn) {
          opacity: 0;
          transform: translate(40px, 0);

          @media (max-width: 720px) { transform: translate(0, 40px); }
        }
      }
    }
  }

  // ── 分頁點（右下；手機置中底部）─────────────────────────
  :deep(.swiper-pagination) {
    gap: fluid(10);

    @media (min-width: 721px) {
      bottom: calc(96 / 19.2 * 1vw);
      left: unset;
      right: calc(160 / 19.2 * 1vw);
      transform: unset;
      text-align: right;
    }

    @media (max-width: 768px) { right: 30px; }
    @media (max-width: 720px) {
      bottom: 30px;
      right: unset;
    }

    .swiper-pagination-bullet {
      width: fluid(48);
      height: fluid(8);
      background: transparent;
      border: 1px solid #fff;
      border-radius: 0;
      opacity: 1;

      &.swiper-pagination-bullet-active { background: #fff; }
    }
  }
}

// ── VIEW MORE 按鈕（對應線上 demo 的 .button06：填滿品牌色、白字）──
// 按鈕由 v-html 輸出（無 scoped data 屬性），故用 :deep 才套得到
.banner12 :deep(.cover_btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fluid(180);
  height: fluid(45);
  padding: 0 fluid(15);
  background: $web_color_1;
  border: 1px solid $web_color_1;
  transition: all 0.3s;

  @media (max-width: 1200px) {
    width: 160px;
    height: 40px;
  }

  span {
    color: #fff;
    font-family: $title_font_cht;
    font-size: 14px;
    transition: all 0.3s;

    @media (max-width: 1200px) { font-size: 13px; }
  }

  &:hover {
    background: #fff;

    span { color: $web_color_1; }
  }
}
</style>
