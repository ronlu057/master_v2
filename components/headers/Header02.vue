<script setup>
// 頁首版型 02 — 置中型（Logo 左、選單 + 工具 + 社群 + 漢堡 在右）
// SVG icon 用 Vue 元件方式 inline 進 HTML（可用 CSS 控 fill）
import SearchIcon from '~/assets/icon/search_icon.svg?component'
import LanguageIcon from '~/assets/icon/language_icon.svg?component'
import ShopcartIcon from '~/assets/icon/shopcart_icon.svg?component'
import LikeIcon from '~/assets/icon/like_icon.svg?component'

// 拿目前「專案類型」資訊
//   isMinimal  = 是否臨時站（只顯示 Logo + 聯絡鈕）
//   enableShop = 是否顯示購物 UI（shop 類型自動 true；或 NUXT_PUBLIC_ENABLE_SHOP=true）
const { isMinimal, enableShop } = useProject()

// 手機版選單的「開/關」狀態。點漢堡按鈕時切換
const ui = useUiStore()

// 購物車（cart.count = 目前購物車裡有幾件商品，顯示在購物車圖示上的小紅點數字）
const cart = useCartStore()

// 主選單資料（桌面 header / 手機 mobile / 頁尾 footer 三組）
// 資料來自假後端：server/mock/data/menu.json
const { data: menuData } = useSiteMenu()

// 公司資料 — 用來取社群連結
const { data: firmData } = useSiteFirm()

// 社群連結清單 — 只列出 firm.json 內 social 有填值的項目
const socialList = computed(() => {
  const s = firmData.value?.firm?.social || {}
  return [
    { name: 'facebook', url: s.facebook, icon: '/img/icon/fb_icon.svg', label: 'Facebook' },
    { name: 'instagram', url: s.instagram, icon: '/img/icon/ig_new_icon.svg', label: 'Instagram' },
    { name: 'line', url: s.line, icon: '/img/icon/line_new_icon.svg', label: 'LINE' },
    { name: 'youtube', url: s.youtube, icon: '/img/icon/youtube_icon.svg', label: 'YouTube' },
    { name: 'twitter', url: s.twitter, icon: '/img/icon/x_icon.svg', label: 'X' },
  ].filter((item) => item.url)
})

// ── 搜尋表單 ─────────────────────────────────────────────
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

// ── 語系切換 ─────────────────────────────────────────────
// currentLang = 目前語系；切換時改 currentLang（之後接 i18n 時改成切換 locale）
const languages = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]
const currentLang = ref('zh-TW')
const switchLang = (code) => {
  currentLang.value = code
}

// ── 捲動時讓 Header 變樣式 ─────────────────────────────────
// 邏輯：當「捲動距離」≥「header 高度」就加上 .scroll class
// 對應原 jQuery if(scrollTop >= headerH) addClass('scroll')
// SCSS 那邊定義了 .header02.scroll { box-shadow + 等效果 }
const headerEl = ref(null)
const isScrolled = ref(false)

const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  isScrolled.value = window.scrollY >= headerH
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <header ref="headerEl" :class="['header02', { scroll: isScrolled }]">
    <div class="navbar">
      <!-- Logo -->
      <NuxtLink class="logo" to="/" title="回首頁">
        <img src="/img/logo/logo-AD.svg" alt="Logo" />
      </NuxtLink>

      <div class="navright">
        <!-- 主選單（桌面） -->
        <nav v-if="!isMinimal" itemscope itemtype="https://www.schema.org/SiteNavigationElement">
          <ul class="navmenu">
            <li
              v-for="item in menuData.header"
              :key="item.url"
              itemprop="name"
            >
              <NuxtLink :to="item.url" itemprop="url">{{ item.title }}</NuxtLink>
              <div v-if="item.children?.length" class="navmenu__sub">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.url"
                  :to="child.url"
                  itemprop="url"
                >
                  {{ child.title }}
                </NuxtLink>
              </div>
            </li>
          </ul>
        </nav>

        <!-- 工具列：搜尋 / 語系 / 購物車 / 我的最愛（hover 展開 popup） -->
        <div v-if="!isMinimal" class="navtool">
          <!-- 搜尋（hover icon 展開輸入框） -->
          <div class="navtool_icon">
            <SearchIcon aria-label="搜尋" />
            <div class="search_box">
              <form class="search_form" @submit.prevent="onSearch">
                <input
                  v-model="keyword"
                  type="text"
                  autocomplete="off"
                  placeholder="網站搜尋..."
                  aria-label="網站搜尋"
                />
                <button type="submit" aria-label="搜尋"><SearchIcon /></button>
              </form>
            </div>
          </div>

          <!-- 語系（只有一個語系時不顯示，避免無謂的選單） -->
          <div v-if="languages.length > 1" class="navtool_icon">
            <LanguageIcon aria-label="語系" />
            <div class="lang_box">
              <button
                v-for="lang in languages"
                :key="lang.code"
                type="button"
                class="lang_item"
                :class="{ 'is-active': lang.code === currentLang }"
                @click="switchLang(lang.code)"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>

          <!-- 購物車 / 我的最愛：購物類型自動顯示；其他類型 .env 設 NUXT_PUBLIC_ENABLE_SHOP=true 也能強制開啟 -->
          <template v-if="enableShop">
            <NuxtLink class="navtool_icon cart_btn" to="/shop/cart" aria-label="購物車">
              <ShopcartIcon />
              <div class="quantity_item">{{ cart.count || 0 }}</div>
            </NuxtLink>

            <NuxtLink class="navtool_icon" to="/shop/favorite" aria-label="我的最愛">
              <LikeIcon />
            </NuxtLink>
          </template>
        </div>

        <!-- 社群圖示（只列有填值的） -->
        <div v-if="!isMinimal && socialList.length" class="social_media">
          <a
            v-for="item in socialList"
            :key="item.name"
            :href="item.url"
            :aria-label="item.label"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img :src="item.icon" :alt="item.label" />
          </a>
        </div>

        <!-- 行動版漢堡按鈕 -->
        <button
          v-if="!isMinimal"
          class="mbPanel_btn"
          :class="{ active: ui.menuOpen }"
          aria-label="開啟選單"
          @click="ui.toggleMenu"
        >
          <span class="bars">
            <span class="bar bar1"></span>
            <span class="bar bar2"></span>
            <span class="bar bar3"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- 行動版下拉選單 -->
    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="mb_panel">
        <div class="mb_navmenu">
          <div v-for="item in menuData.mobile" :key="item.url" class="mb_navmenu__item">
            <NuxtLink :to="item.url" class="mb_navmenu__link" @click="ui.closeMenu">
              {{ item.title }}
            </NuxtLink>
            <div v-if="item.children?.length" class="mb_navmenu__sub">
              <NuxtLink
                v-for="child in item.children"
                :key="child.url"
                :to="child.url"
                @click="ui.closeMenu"
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
// 首頁時 header 透明（捲動或選單開啟後恢復白底）
body[data-page="index"] {
  .header02 {
    &:not(.scroll):not(.active) {
      @media (min-width: 1201px) {
        background: transparent;

        .navbar .navright .navmenu > li {
          background-image: linear-gradient(to right, #fff, #fff);
          > a { color: #fff; }
        }
      }
    }
  }
}

.header02 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  padding: 0 4.1667vw;
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @media (max-width: 1440px) { padding: 0 2.5vw; }
  @media (max-width: 1200px) { padding: 0 30px; }
  @media (max-width: 480px)  { padding: 0 15px; }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .logo {
      display: block;
      img { max-height: 60px; }
    }

    .navright {
      display: flex;
      align-items: center;

      @media (max-width: 1200px) {
        height: 60px;
        margin-left: 25px;
      }

      .navmenu {
        display: flex;
        list-style: none;
        margin: 0 25px 0 0;
        padding: 0;
        transition: all 0.3s;

        @media (max-width: 1600px) { margin-right: 20px; }
        @media (max-width: 1440px) { margin-right: 15px; }
        @media (max-width: 1366px) { margin-right: 10px; }
        @media (max-width: 1200px) { display: none; }

        > li {
          position: relative;
          background-image: linear-gradient(to right, $web_font_color, $web_font_color);
          background-size: 0 2px;
          background-position: center calc(50% + 15px);
          background-repeat: no-repeat;
          transition: all 0.3s;

          > a {
            display: block;
            color: $web_font_color;
            font-size: 16px;
            line-height: 1.5;
            padding: 23px 25px;
            transition: all 0.3s;

            @media (max-width: 1600px) { padding: 23px 20px; }
            @media (max-width: 1440px) { padding: 23px 15px; }
            @media (max-width: 1366px) { padding: 23px 10px; }
            @media (max-width: 1280px) { font-size: 15px; }
          }

          &:hover,
          > a.router-link-active {
            background-image: linear-gradient(to right, $web_header_1, $web_header_1);
            background-size: calc(100% - 30px) 2px;

            @media (max-width: 1366px) { background-size: calc(100% - 15px) 2px; }

            > a { color: $web_header_1; }
          }

          // 下拉浮層（採用 Header01 的 popup 動畫風格 — opacity / visibility / translateY）
          .navmenu__sub {
            position: absolute;
            top: 100%;
            left: 50%;
            min-width: 160px;
            padding: 6px;
            background: #fff;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transform: translateX(-50%) translateY(8px);
            transition: all var(--transition);
            z-index: 60;

            a {
              display: block;
              color: $web_font_color;
              font-size: 14px;
              padding: 8px 12px;
              border-radius: 6px;
              transition: all 0.3s;

              &:hover,
              &.router-link-active {
                background: var(--color-surface);
                color: $web_header_1;
              }
            }
          }

          &:hover .navmenu__sub {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
          }
        }
      }

      // 工具列：搜尋 / 語系 / 購物車 / 我的最愛
      .navtool {
        display: flex;
        align-items: center;
        gap: 26px;
        font-size: 18px;
        margin-right: 25px;

        @media (max-width: 1200px) { display: none; }

        .navtool_icon {
          position: relative;
          cursor: pointer;

          > svg {
            display: block;
            width: 20px;
            height: 20px;
            fill: $web_font_color;
            transition: all 0.3s;
          }

          &:hover > svg,
          &:focus-within > svg {
            fill: $web_header_1;
          }

          // popup 浮層（搜尋框 / 語系列表 共用樣式）
          .search_box,
          .lang_box {
            position: absolute;
            top: 100%;
            right: 0;
            padding: 10px;
            background: #fff;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transform: translateY(8px);
            transition: all var(--transition);
            z-index: 60;
            margin-top: 26px;
          }
          .search_box { min-width: 280px; }
          .lang_box {
            min-width: 140px;
            display: flex;
            flex-direction: column;
            padding: 6px;
          }

          &:hover .search_box,
          &:focus-within .search_box,
          &:hover .lang_box,
          &:focus-within .lang_box {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          // 語系選項
          .lang_item {
            background: none;
            border: none;
            padding: 8px 12px;
            font-size: 14px;
            text-align: left;
            cursor: pointer;
            border-radius: 6px;
            color: inherit;

            &:hover {
              background: var(--color-surface);
              color: $web_header_1;
            }
            &.is-active {
              color: $web_header_1;
              font-weight: 600;
            }
          }
        }

        // 搜尋表單樣式
        .search_form {
          display: flex;
          align-items: center;
          gap: 6px;

          input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            font-size: 14px;
          }

          button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;

            svg {
              width: 18px;
              height: 18px;
              fill: $web_font_color;
              transition: fill 0.3s;
            }

            &:hover svg { fill: $web_header_1; }
          }
        }

        // 購物車徽章（小紅點數字）
        .cart_btn {
          position: relative;

          .quantity_item {
            position: absolute;
            top: -6px;
            right: -10px;
            min-width: 18px;
            height: 18px;
            padding: 0 4px;
            border-radius: 99px;
            background: $web_header_1;
            color: #fff;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .social_media {
        display: flex;
        gap: 0 13px;
        transition: all 0.3s;

        @media (max-width: 1440px) { gap: 0 10px; }
        @media (max-width: 1366px) { gap: 0 7px; }
        @media (max-width: 1200px) { display: none; }

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          background: $web_font_color;
          border-radius: 50%;
          transition: all 0.3s;

          img {
            width: 21px;
            height: 21px;
            // 強制 icon 顯示為白色（適用任何顏色的原 SVG）
            filter: brightness(0) invert(1);
          }

          &:hover { background: $web_header_1; }
        }
      }
    }
  }

  .mbPanel_btn {
    padding: 20px 13px;
    background: $web_header_1;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;

    @media (min-width: 1201px) { display: none; }

    .bars {
      position: relative;
      width: 15px;
      height: 1px;

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 10px;

        &.bar1 {
          top: -5px;
          transform: rotate(0deg);
          transition: all 0.3s, top 0.3s 0.5s, transform 0.3s;
        }
        &.bar2 {
          opacity: 1;
          transition: all 0.3s, opacity 0s 0.3s;
        }
        &.bar3 {
          top: 5px;
          transform: rotate(0deg);
          transition: all 0.3s, top 0.3s 0.5s, transform 0.3s;
        }
      }
    }

    &.active .bars .bar {
      &.bar1 {
        top: 0;
        left: 0;
        transform: rotate(45deg);
        transition: all 0.3s, top 0.3s, transform 0.3s 0.5s;
      }
      &.bar2 { opacity: 0; }
      &.bar3 {
        top: 0;
        left: 0;
        transform: rotate(-45deg);
        transition: all 0.3s, top 0.3s, transform 0.3s 0.5s;
      }
    }
  }

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }
}

// 行動版下拉選單
.mb_panel {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding: 8px 20px 16px;
  z-index: $z_mobile_menu;
}

.mb_navmenu {
  &__link {
    display: block;
    padding: 12px 4px;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
  }

  &__sub {
    padding: 0 0 0 16px;

    a {
      display: block;
      padding: 8px 4px;
      font-size: 14px;
    }
  }
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}
</style>
