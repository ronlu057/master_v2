<script setup>
// 頁首版型 13 — 內嵌搜尋切換型
// 特色：點搜尋按鈕 → logo 隱藏、搜尋表單從原 logo 位置浮入
// 漢堡按鈕：紅色方塊；navtool 為 56px 方形主色塊
//
// 原始檔：D:\www\master_dev\template\module\header\header13.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header13.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

// i18n
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

const socials = useSocials()

// 搜尋切換：searchOpen 為 true 時，header 加 .active → logo 退場、form 浮入
const searchOpen = ref(false)
const keyword = ref('')
const openSearch = () => { searchOpen.value = true }
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  searchOpen.value = false
  keyword.value = ''
}

// 視窗縮放：從手機切到桌面（>1200）時自動關閉漢堡
const onResize = () => {
  if (window.matchMedia('(min-width: 1201px)').matches && ui.menuOpen) {
    ui.closeMenu()
  }
}

// 捲動偵測：scrollTop ≥ banner − header 時加 .scroll
const headerEl = ref(null)
const isScrolled = ref(false)
const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  const banner = document.querySelector('[class^="banner"]')
  const bannerH = banner ? banner.offsetHeight : 0
  isScrolled.value = window.scrollY >= Math.max(0, bannerH - headerH)
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <header
    ref="headerEl"
    :class="['header13', { scroll: isScrolled, active: searchOpen }]"
  >
    <div class="navbar">
      <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
        <SiteLogo alt="Logo" />
      </NuxtLink>

      <!-- 搜尋表單（active 時浮入取代 logo 位置） -->
      <form class="search_form" @submit.prevent="onSearch">
        <input
          v-model="keyword"
          type="text"
          autocomplete="off"
          :placeholder="$t('site.search_placeholder')"
          :aria-label="$t('aria.search')"
        />
        <button type="submit" hidden>{{ $t('btn.search') }}</button>
      </form>

      <!-- 主選單 -->
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
    </div>

    <div v-if="!isMinimal" class="navtool">
      <!-- 搜尋送出按鈕（active 時取代 search_btn 顯示，由 searchOpen 控制） -->
      <button
        v-if="navtool.isEnabled('search')"
        type="button"
        class="search_btn_sp"
        :style="{ order: navtool.orderOf('search') }"
        :aria-label="$t('btn.search')"
        @click="onSearch"
      >
        <i class="icon icon-search"></i>
      </button>

      <!-- 搜尋觸發 -->
      <button
        v-if="navtool.isEnabled('search')"
        type="button"
        class="search_btn"
        :style="{ order: navtool.orderOf('search') }"
        :aria-label="$t('aria.search')"
        @click="openSearch"
      >
        <i class="icon icon-search"></i>
      </button>

      <!-- 語系 -->
      <div
        v-if="navtool.isEnabled('language') && languages.length > 1"
        class="lang_toggle"
        :style="{ order: navtool.orderOf('language') }"
      >
        <i class="icon icon-language"></i>
        <ul>
          <li v-for="lang in languages" :key="lang.code">
            <a
              href="javascript:;"
              :class="{ active: lang.code === locale }"
              @click.prevent="setLocale(lang.code)"
            >
              {{ lang.label }}
            </a>
          </li>
        </ul>
      </div>

      <!-- 社群 -->
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

      <!-- 會員 -->
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
        class="cart_btn"
        :style="{ order: navtool.orderOf('cart') }"
        aria-label="購物車"
      >
        <i class="icon icon-shopcart"></i>
        <p v-if="cart.count">{{ cart.count }}</p>
      </NuxtLink>

      <!-- 我的最愛 -->
      <NuxtLink
        v-if="navtool.isEnabled('favorite')"
        to="/shop/favorite"
        class="favorite_btn"
        :style="{ order: navtool.orderOf('favorite') }"
        aria-label="我的最愛"
      >
        <i class="icon icon-like"></i>
      </NuxtLink>

      <!-- 漢堡 -->
      <button
        v-if="!isMinimal"
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
  </header>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header13_mobile">
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
.header13 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 calc(4.1667vw - 20px) 0 4.1667vw;
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 calc(2.5vw - 15px) 0 2.5vw; }
  @include rwd-1200 { padding: 0 0 0 30px; }
  @include rwd-480  { padding: 0 0 0 15px; }

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }

  // 搜尋開啟：logo 退場、form 浮入
  &.active {
    .navbar .logo {
      opacity: 0;
      pointer-events: none;
    }
    .navbar .search_form {
      opacity: 1;
      pointer-events: auto;
      transform: translate(0, -50%);
    }
    .navtool .search_btn_sp { display: flex !important; }
    .navtool .search_btn    { display: none; }
  }
}

.navbar {
  display: flex;
  align-items: center;
  gap: 50px;
  position: relative;

  .logo {
    display: block;
    transition: all 0.3s;

  }

  .search_form {
    position: absolute;
    top: 50%;
    left: 0;
    opacity: 0;
    pointer-events: none;
    transform: translate(-100%, -50%);
    transition: all 0.3s;

    input[type="text"] {
      width: 100%;
      padding: 4px 0;
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--color-border);
      color: $web_font_color;
      font-size: 16px;
      min-width: 280px;

      &:focus { outline: none; border-bottom-color: $web_header_1; }
    }
  }

  .navmenu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    @include rwd-1200 { display: none; }

    > li {
      position: relative;

      > a {
        display: block;
        color: $web_font_color;
        font-size: 16px;
        line-height: 1.5;
        padding: 23px 25px;
        transition: all 0.3s;

        @include rwd-1440 { padding: 23px 15px; }
      }

      &:hover > a,
      > a.router-link-active {
        color: $web_header_1;
      }

      // 下拉（卡片式浮層，樣式參考 header01 .navmenu__sub）
      .navmenu_sub {
        position: absolute;
        top: 100%;
        left: 50%;
        width: max-content;
        min-width: 142px;
        padding: 6px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translate(-50%, 8px);
        transition: all var(--transition);

        a {
          display: block;
          color: $web_font_color;
          font-size: 14px;
          text-align: center;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s;

          &:hover,
          &.router-link-active {
            color: var(--color-primary);
            background: var(--color-surface);
          }
        }
      }

      &:hover > .navmenu_sub {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translate(-50%, 0);
      }
    }
  }
}

.navtool {
  display: flex;
  gap: 20px;

  @include rwd-1200 { gap: 0; }

  > div,
  > button,
  > a {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 56px;
    height: 56px;
    background: $web_header_1;
    border: none;
    cursor: pointer;
    transition: background 0.3s;

    @include rwd-1200 {
      width: 70px;
      height: 70px;

      &:not(.search_btn):not(.mbPanel_btn) { display: none; }
    }

    color: #fff;
    transition: all 0.3s;

    > .icon { font-size: 20px; }

    // 下拉（卡片式浮層，樣式參考 header01 .lang_box）
    ul {
      position: absolute;
      top: 100%;
      right: 50%;
      width: max-content;
      list-style: none;
      margin: 0;
      padding: 6px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translate(50%, 8px);
      transition: all var(--transition);

      li {
        a {
          display: block;
          color: $web_font_color;
          font-size: 14px;
          text-align: center;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s;

          &:hover,
          &.active {
            color: var(--color-primary);
            background: var(--color-surface);
          }
        }
      }
    }

    &:hover > ul {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translate(50%, 0);
    }
  }

  .search_btn_sp { display: none; }

  .mbPanel_btn {
    padding: 0 20px;

    @media (min-width: 1201px) { display: none !important; }

    .bars {
      position: relative;
      width: 30px;
      height: 2px;

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 10px;

        &.bar1 {
          top: -8px;
          transition: top 0.3s 0.5s, transform 0.3s;
        }
        &.bar2 {
          opacity: 1;
          transition: opacity 0s 0.3s;
        }
        &.bar3 {
          top: 8px;
          transition: top 0.3s 0.5s, transform 0.3s;
        }
      }
    }

    &.active .bars .bar {
      &.bar1 {
        top: 0;
        transform: rotate(45deg);
        transition: top 0.3s, transform 0.3s 0.5s;
      }
      &.bar2 { opacity: 0; }
      &.bar3 {
        top: 0;
        transform: rotate(-45deg);
        transition: top 0.3s, transform 0.3s 0.5s;
      }
    }
  }
}

// ── 行動版下拉選單 ───────────────────────────────────────
.header13_mobile {
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
