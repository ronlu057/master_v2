<script setup>
// 頁首版型 02 — 置中型（Logo 左、選單 + 工具 + 社群 + 漢堡 在右）
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>
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

// navtool icon 配置（哪些顯示 + 順序），由 /admin → navtool 配置控制
const navtool = useNavtoolConfig()

// 社群連結清單（過濾掉 null / 空字串 / 全空格的項目）
const socials = useSocials()

// ── 搜尋表單 ─────────────────────────────────────────────
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

// ── 語系切換 ─────────────────────────────────────────────
// 接 @nuxtjs/i18n 模組：清單來自 nuxt.config.js 的 i18n.locales（單一來源）
// 切換語系呼叫 setLocale(code) — 全站翻譯字串 / locale 同步更新
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)
const currentLang = computed(() => locale.value)
const switchLang = (code) => setLocale(code)

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
        <SiteLogo alt="Logo" />
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

        <!-- 工具列：search/language/social/member/cart/favorite — 由 useNavtoolConfig 控顯示 + 順序 -->
        <div v-if="!isMinimal" class="navtool">
          <!-- 搜尋 -->
          <div
            v-if="navtool.isEnabled('search')"
            class="navtool_icon"
            :style="{ order: navtool.orderOf('search') }"
          >
            <i class="icon icon-search" aria-label="搜尋"></i>
            <div class="search_box">
              <form class="search_form" @submit.prevent="onSearch">
                <input
                  v-model="keyword"
                  type="text"
                  autocomplete="off"
                  placeholder="網站搜尋..."
                  aria-label="網站搜尋"
                />
                <button type="submit" aria-label="搜尋">
                  <i class="icon icon-search" aria-hidden="true"></i>
                </button>
              </form>
            </div>
          </div>

          <!-- 語系 -->
          <div
            v-if="navtool.isEnabled('language') && languages.length > 1"
            class="navtool_icon"
            :style="{ order: navtool.orderOf('language') }"
          >
            <i class="icon icon-language" aria-label="語系"></i>
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

          <!-- 社群（一排平鋪小 icon） -->
          <div
            v-if="navtool.isEnabled('social') && socials.length"
            class="navtool_social"
            :style="{ order: navtool.orderOf('social') }"
          >
            <a
              v-for="s in socials"
              :key="s.key"
              :href="s.url"
              :aria-label="s.key"
              target="_blank"
              rel="noopener"
              class="navtool_social-link"
            >
              <i :class="['icon', `icon-${s.key}`]"></i>
            </a>
          </div>

          <!-- 會員中心 -->
          <NuxtLink
            v-if="navtool.isEnabled('member')"
            class="navtool_icon"
            to="/member"
            :style="{ order: navtool.orderOf('member') }"
            aria-label="會員中心"
          >
            <i class="icon icon-member"></i>
          </NuxtLink>

          <!-- 購物車 -->
          <NuxtLink
            v-if="navtool.isEnabled('cart')"
            class="navtool_icon cart_btn"
            to="/shop/cart"
            :style="{ order: navtool.orderOf('cart') }"
            aria-label="購物車"
          >
            <i class="icon icon-shopcart"></i>
            <div class="quantity_item">{{ cart.count || 0 }}</div>
          </NuxtLink>

          <!-- 我的最愛 -->
          <NuxtLink
            v-if="navtool.isEnabled('favorite')"
            class="navtool_icon"
            to="/shop/favorite"
            :style="{ order: navtool.orderOf('favorite') }"
            aria-label="我的最愛"
          >
            <i class="icon icon-like"></i>
          </NuxtLink>
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
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  height: fluid(70);
  padding: 0 4.1667vw;
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 2.5vw; }
  @include rwd-1200 { padding: 0 30px; }
  @include rwd-480  { padding: 0 15px; }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .logo {
      display: block;
    }

    .navright {
      display: flex;
      align-items: center;

      @include rwd-1200 {
        height: 60px;
        margin-left: 25px;
      }

      .navmenu {
        display: flex;
        list-style: none;
        margin: 0 fluid(25) 0 0;
        padding: 0;
        transition: all 0.3s;

        @include rwd-1680 { margin-right: 20px; }
        @include rwd-1440 { margin-right: 15px; }
        @include rwd-1280 { margin-right: 10px; }
        @include rwd-1200 { display: none; }

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
            font-size: fluid-fz(16);
            line-height: 1.5;
            padding: fluid(23) fluid(25);
            transition: all 0.3s;

            @include rwd-1680 { padding: 23px 20px; }
            @include rwd-1440 { padding: 23px 15px; }
            @include rwd-1280 { padding: 23px 10px; }
            @include rwd-1280 { font-size: 15px; }
          }

          &:hover,
          > a.router-link-active {
            background-image: linear-gradient(to right, $web_header_1, $web_header_1);
            background-size: calc(100% - 30px) 2px;

            @include rwd-1280 { background-size: calc(100% - 15px) 2px; }

            > a { color: $web_header_1; }
          }

          // 下拉浮層（採用 Header01 的 popup 動畫風格 — opacity / visibility / translateY）
          .navmenu__sub {
            position: absolute;
            top: 100%;
            left: 50%;
            min-width: fluid(160);
            padding: fluid(6);
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
              font-size: fluid-fz(14);
              padding: fluid(8) fluid(12);
              border-radius: fluid(6);
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
        gap: fluid(26);
        font-size: fluid-fz(18);
        margin-right: fluid(25);

        @include rwd-1200 { display: none; }

        .navtool_icon {
          position: relative;
          cursor: pointer;
          color: $web_font_color;
          transition: color 0.3s;

          > .icon { font-size: fluid-fz(20); }

          &:hover,
          &:focus-within {
            color: $web_header_1;
          }

          // popup 浮層（搜尋框 / 語系列表 共用樣式）
          .search_box,
          .lang_box {
            position: absolute;
            top: 100%;
            right: 0;
            padding: fluid(10);
            background: #fff;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transform: translateY(8px);
            transition: all var(--transition);
            z-index: 60;
            margin-top: fluid(26);
          }
          .search_box { min-width: 280px; }
          .lang_box {
            min-width: fluid(140);
            display: flex;
            flex-direction: column;
            padding: fluid(6);
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
            padding: fluid(8) fluid(12);
            font-size: fluid-fz(14);
            text-align: left;
            cursor: pointer;
            border-radius: fluid(6);
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
          gap: fluid(6);

          input {
            flex: 1;
            padding: fluid(8) fluid(12);
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            font-size: fluid-fz(14);
          }

          button {
            background: none;
            border: none;
            cursor: pointer;
            padding: fluid(4);
            display: flex;
            color: $web_font_color;
            transition: color 0.3s;

            .icon { font-size: fluid-fz(18); }

            &:hover { color: $web_header_1; }
          }
        }

        // 購物車徽章（小紅點數字）
        .cart_btn {
          position: relative;

          .quantity_item {
            position: absolute;
            top: fluid(-6);
            right: fluid(-10);
            min-width: fluid(18);
            height: fluid(18);
            padding: 0 fluid(4);
            border-radius: fluid(99);
            background: $web_header_1;
            color: #fff;
            font-size: fluid-fz(11);
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      // .social_media 樣式已下放到全域 main.scss → .navtool_social
      // 不在此 scoped 覆寫，所有 Header 共用一致風格
    }
  }

  .mbPanel_btn {
    padding: fluid(20) fluid(13);
    background: $web_header_1;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;

    @media (min-width: 1201px) { display: none; }

    .bars {
      position: relative;
      width: fluid(15);
      height: 1px;

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: fluid(10);

        &.bar1 {
          top: fluid(-5);
          transform: rotate(0deg);
          transition: all 0.3s, top 0.3s 0.5s, transform 0.3s;
        }
        &.bar2 {
          opacity: 1;
          transition: all 0.3s, opacity 0s 0.3s;
        }
        &.bar3 {
          top: fluid(5);
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
  top: fluid(70);
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding: fluid(8) fluid(20) fluid(16);
  z-index: $z_mobile_menu;
}

.mb_navmenu {
  &__link {
    display: block;
    padding: fluid(12) fluid(4);
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
  }

  &__sub {
    padding: 0 0 0 fluid(16);

    a {
      display: block;
      padding: fluid(8) fluid(4);
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
