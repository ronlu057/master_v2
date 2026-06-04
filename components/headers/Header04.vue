<script setup>
// 頁首版型 04 — 浮島膠囊版（首頁透明 + 子頁/scroll 後白底）
// 特色：navmenu 為白色 pill（圓角 50px + 陰影），navtool 各按鈕都是 35×35 圓形小按鈕
//      首頁預設透明，scroll 過 banner 後變白底；子頁則直接保持白底狀態
//      navmenu li hover 出現圓點指示與第二層子選單（blur 進場）
//
// 原始檔：D:\www\master_dev\template\module\header\header04.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header04.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()

const { locale, locales, setLocale } = useI18n()
// 語系縮寫顯示（繁體中文→TW、英文→EN、日本→JP、韓文→KR）；後台語系文字留空時用此預設
const LANG_ABBR = { tw: 'TW', en: 'EN', jp: 'JP', kr: 'KR' }
const languages = useLangLabels((l) => LANG_ABBR[l.code] || l.code.toUpperCase())

const navtool = useNavtoolConfig()

const socials = useSocials()

// 搜尋
const keyword = ref('')
const showSearch = ref(false)
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  keyword.value = ''
  showSearch.value = false
}

// 子頁判斷（鏡像 app.vue 的 data-page 邏輯）：非首頁 → .subpage 直接套白底 pill
// 改用 component class，避免 :global(body:not([data-page='index'])) 的巢狀括號被 Vue scoped 解析錯誤而漏到 <body>
const route = useRoute()
const isSubpage = computed(() => {
  if (route.path === '/') return false
  const codes = locales.value.map((l) => l.code)
  const segments = route.path.split('/').filter(Boolean)
  return !!segments.find((s) => !codes.includes(s))
})

// 捲動偵測：捲過 banner 高 - header 高 → 套上 .scroll
const headerEl = ref(null)
const isScrolled = ref(false)
const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  const bannerEl = document.querySelector('[class*="banner"]')
  const bannerH = bannerEl ? bannerEl.offsetHeight : headerH
  isScrolled.value = window.scrollY >= bannerH - headerH
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
  <header ref="headerEl" :class="['header04', { scroll: isScrolled, subpage: isSubpage }]">
    <div class="nav">
      <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
        <SiteLogo alt="Logo" />
      </NuxtLink>

      <div class="navbar">
        <!-- 白色 pill 主選單 -->
        <ul
          v-if="!isMinimal"
          itemscope
          itemtype="https://www.schema.org/SiteNavigationElement"
          class="navmenu"
        >
          <li v-for="item in menuData.header" :key="item.url" itemprop="name">
            <NuxtLink :to="item.url" itemprop="url">{{ item.title }}</NuxtLink>
            <div v-if="item.children?.length" class="navmenu_sub">
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

        <div v-if="!isMinimal" class="navtool">
          <!-- 搜尋（toggle popup） -->
          <a
            v-if="navtool.isEnabled('search')"
            href="javascript:;"
            class="search_btn"
            :style="{ order: navtool.orderOf('search') }"
            :aria-label="$t('aria.search')"
            @click="showSearch = !showSearch"
          >
            <i class="icon icon-search"></i>
          </a>

          <!-- 語系 -->
          <div
            v-if="navtool.isEnabled('language') && languages.length > 1"
            class="lang_toggle"
            :style="{ order: navtool.orderOf('language') }"
          >
            <i class="icon icon-language"></i>
            <ul>
              <li
                v-for="lang in languages"
                :key="lang.code"
                :class="{ active: lang.code === locale }"
              >
                <a href="javascript:;" @click.prevent="setLocale(lang.code)">
                  {{ lang.label }}
                </a>
              </li>
            </ul>
          </div>

          <!-- 社群（一排平鋪） -->
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
            >
              <i :class="['icon', `icon-${s.key}`]"></i>
            </a>
          </div>

          <!-- 會員中心 -->
          <NuxtLink
            v-if="navtool.isEnabled('member')"
            to="/member"
            class="member_btn"
            :style="{ order: navtool.orderOf('member') }"
            aria-label="會員中心"
          >
            <i class="icon icon-member"></i>
          </NuxtLink>

          <!-- 購物車 -->
          <NuxtLink
            v-if="navtool.isEnabled('cart')"
            to="/shop/cart"
            class="inquiry_btn"
            :data-pro="cart.totalItems || cart.count || 0"
            :style="{ order: navtool.orderOf('cart') }"
            :aria-label="$t('aria.cart')"
          >
            <i class="icon icon-shopcart"></i>
          </NuxtLink>

          <!-- 我的最愛 -->
          <NuxtLink
            v-if="navtool.isEnabled('favorite')"
            to="/shop/favorite"
            class="like_btn"
            :style="{ order: navtool.orderOf('favorite') }"
            :aria-label="$t('aria.favorite')"
          >
            <i class="icon icon-like"></i>
          </NuxtLink>

          <!-- 漢堡 -->
          <button
            type="button"
            class="mbPanel_btn"
            :class="{ active: ui.menuOpen }"
            :aria-label="$t('aria.menu')"
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
    </div>

    <!-- 搜尋浮層 -->
    <transition name="drop">
      <form v-if="showSearch" class="search_layer" @submit.prevent="onSearch">
        <input
          v-model="keyword"
          type="text"
          autocomplete="off"
          :placeholder="$t('site.search_placeholder')"
          :aria-label="$t('aria.search')"
        />
        <button type="submit" :aria-label="$t('btn.search')">
          <i class="icon icon-search" aria-hidden="true"></i>
        </button>
      </form>
    </transition>
  </header>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header04_panel">
      <div class="mb_navmenu">
        <div v-for="item in menuData.mobile" :key="item.url" class="mb_navmenu_item">
          <NuxtLink :to="item.url" class="mb_navmenu_link" @click="ui.closeMenu">
            {{ item.title }}
          </NuxtLink>
          <div v-if="item.children?.length" class="mb_navmenu_sub">
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
</template>

<style lang="scss" scoped>
// 子頁直接套上「白底+pill」狀態（.subpage 由 component 計算；不再用 :global(body:not()) 避免漏樣式到 <body>）
.header04.subpage {
  background: #fff;

  .nav { padding: 9px 0; }
  .navmenu {
    background: transparent;
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

.header04 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 4.1667vw;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 2.5vw; }
  @include rwd-1200 {
    padding: 0 30px;
    background: #fff;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }
  @include rwd-480 { padding: 0 15px; }

  &.scroll {
    background: #fff;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);

    .nav { padding: 9px 0; }
    .navmenu {
      background: transparent;
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0 0;
  transition: all 0.3s;

  @include rwd-1200 {
    height: 70px;
    padding: 0;
  }
}

.logo {
  display: block;
  margin-right: 30px;

  @include rwd-1200 { margin-right: 0; }

  img {
    max-height: 50px;
    margin: 0 auto;
  }
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: max-content;
}

// 白色 pill 主選單
.navmenu {
  display: flex;
  list-style: none;
  padding: 0 25px;
  margin: 0 28px 0 0;
  background: #fff;
  box-shadow: 3px 3px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 15px; }
  @include rwd-1280 {
    padding: 0 10px;
    margin-right: 20px;
  }
  @include rwd-1200 { display: none; }

  > li {
    position: relative;

    // hover 圓點指示
    &::before {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 6px;
      height: 6px;
      background: $web_font_color;
      border-radius: 50%;
      opacity: 0;
      transform: translate(-50%, 0);
      transition: all 0.3s;
    }

    // 下拉填補（避免 hover 斷掉）
    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 10px;
      pointer-events: none;
      transition: all 0.3s;
    }

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
      padding: 14px 25px;
      transition: all 0.3s;

      @include rwd-1440 { padding: 14px 15px; }
      @include rwd-1280 { padding: 14px 10px; }
    }

    &:hover {
      &::before {
        background: $web_color_1;
        opacity: 1;
        transform: translate(-50%, -7px);
      }
      &::after { pointer-events: auto; }
    }

    .navmenu_sub {
      position: absolute;
      top: calc(100% + 10px);
      left: 50%;
      width: max-content;
      min-width: 100%;
      border-radius: 10px;
      background: #fff;
      box-shadow: 3px 3px 3px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
      opacity: 0;
      filter: blur(5px);
      pointer-events: none;
      transform: translate(-50%, 30px);
      transition: all 0.3s;

      a {
        display: block;
        color: $web_font_color;
        font-size: 14px;
        text-align: center;
        padding: 10px 20px;
        transition: all 0.3s;

        &:not(:last-child) { border-bottom: 1px solid #e7e7e7; }

        &:hover { color: $web_header_2; }
      }
    }

    &:hover > .navmenu_sub {
      opacity: 1;
      filter: blur(0);
      pointer-events: auto;
      transform: translate(-50%, 0);
    }
  }
}

// navtool — 各按鈕為 35×35 圓形浮島
.navtool {
  display: flex;
  align-items: center;
  min-width: max-content;

  > div,
  > a,
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 35px;
    height: 35px;
    background: #fff;
    border: none;
    border-radius: 50%;
    box-shadow: 3px 3px 3px 0 rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    padding: 0;

    & + div,
    & + a,
    & + button { margin-left: 18px; }

    @include rwd-1280 {
      & + div,
      & + a,
      & + button { margin-left: 15px; }
    }
    @include rwd-1200 {
      &:not(.mbPanel_btn) { display: none; }
    }

    color: $web_font_color;

    .icon { font-size: 16px; }

    &:hover {
      background: $web_header_2;
      color: #fff;
    }
  }

  // 語系下拉
  .lang_toggle {
    ul {
      position: absolute;
      top: 100%;
      right: 50%;
      list-style: none;
      margin: 0;
      padding: 0;
      opacity: 0;
      filter: blur(5px);
      pointer-events: none;
      transform: translate(50%, 30px);
      transition: all 0.3s;

      li {
        padding-top: 10px;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          color: $web_font_color;
          font-size: 14px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 3px 3px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        &:hover a,
        &.active a {
          color: #fff;
          background: $web_header_2;
        }
      }
    }

    &:hover ul {
      opacity: 1;
      filter: blur(0);
      pointer-events: auto;
      transform: translate(50%, 0);
    }
  }

  // 詢問車徽章
  .inquiry_btn {
    &::before {
      content: attr(data-pro);
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      color: #fff;
      font-size: 12px;
      background: $web_font_color;
      border-radius: 50%;
      transition: all 0.3s;
    }
  }

  // 漢堡
  .mbPanel_btn {
    @media (min-width: 1201px) { display: none !important; }

    .bars {
      position: relative;
      width: 12px;
      height: 1px;

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: $web_header_2;
        border-radius: 10px;

        &.bar1 {
          top: -4px;
          transition: all 0.3s, top 0.3s 0.3s, transform 0.3s;
        }
        &.bar2 {
          opacity: 1;
          transition: all 0.3s, opacity 0s 0.3s;
        }
        &.bar3 {
          top: 4px;
          transition: all 0.3s, top 0.3s 0.3s, transform 0.3s;
        }
      }
    }

    &:hover .bars .bar { background: #fff; }

    &.active .bars .bar {
      &.bar1 {
        top: 0;
        transform: rotate(45deg);
        transition: all 0.3s, top 0.3s, transform 0.3s 0.3s;
      }
      &.bar2 { opacity: 0; }
      &.bar3 {
        top: 0;
        transform: rotate(-45deg);
        transition: all 0.3s, top 0.3s, transform 0.3s 0.3s;
      }
    }
  }
}

// 搜尋浮層
.search_layer {
  position: absolute;
  top: 100%;
  right: 4.1667vw;
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border-radius: 8px;

  input {
    padding: 6px 10px;
    border: 1px solid var(--color-border);
    color: $web_font_color;
    font-size: 14px;
    width: 220px;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 8px;
    color: $web_font_color;

    .icon { font-size: 18px; }
  }
}

// 行動版下拉選單
.header04_panel {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding: 8px 20px 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  z-index: $z_mobile_menu;
}

.mb_navmenu_link {
  display: block;
  padding: 12px 4px;
  font-size: 18px;
  font-weight: 600;
  color: $web_font_color;
  border-bottom: 1px solid var(--color-border);
}

.mb_navmenu_sub {
  padding: 0 0 0 16px;

  a {
    display: block;
    padding: 8px 4px;
    font-size: 14px;
    color: $web_font_color;
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
