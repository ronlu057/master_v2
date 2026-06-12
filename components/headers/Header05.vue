<script setup>
// 頁首版型 05 — CTA 預約諮詢按鈕 + scroll 後浮島化
// 特色：scroll 後桌面 header 縮成浮島（top:10px、左右留邊、加陰影）；選單 padding 縮小
//      右側固定一顆 CTA「立即預約諮詢」按鈕（連 firm.cta_appointment）
//      navmenu 內錨點連結用 Lenis 平滑捲動
//
// 原始檔：D:\www\master_dev\template\module\header\header05.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header05.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const { $lenis } = useNuxtApp()
const navtool = useNavtoolConfig()

const socials = useSocials()

const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

// CTA：立即預約諮詢（從 firm.cta_appointment 取）
const ctaLink = computed(() => firmData.value?.firm?.cta_appointment || '')

// 搜尋表單
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  keyword.value = ''
}

// 錨點連結平滑捲動：用 Lenis 捲到指定 #id，偏移 -90 留 header 空間
const onMenuClick = (e, url) => {
  if (!url?.startsWith('#')) return
  const target = document.querySelector(url)
  if (!target) return
  e.preventDefault()
  const offset = 90
  const top = target.getBoundingClientRect().top + window.scrollY - offset
  if ($lenis) $lenis.scrollTo(top, { duration: 0.8 })
  else window.scrollTo({ top, behavior: 'smooth' })
  ui.closeMenu()
}

// 捲動偵測
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
  <header ref="headerEl" :class="['header05', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- 主選單 -->
      <ul
        v-if="!isMinimal"
        itemscope
        itemtype="https://www.schema.org/SiteNavigationElement"
        class="navmenu"
      >
        <li v-for="item in menuData.header" :key="item.url" itemprop="name">
          <NuxtLink
            :to="item.url"
            itemprop="url"
            @click="(e) => onMenuClick(e, item.url)"
          >
            {{ item.title }}
          </NuxtLink>
          <div v-if="item.children?.length" class="navmenu_sub">
            <NuxtLink
              v-for="child in item.children"
              :key="child.url"
              :to="child.url"
              itemprop="url"
              @click="(e) => onMenuClick(e, child.url)"
            >
              {{ child.title }}
            </NuxtLink>
          </div>
        </li>
      </ul>

      <div v-if="!isMinimal" class="navtool">
        <!-- 搜尋（hover 下拉，樣式同 Header01） -->
        <div
          v-if="navtool.isEnabled('search')"
          class="search_btn"
          :style="{ order: navtool.orderOf('search') }"
        >
          <i class="icon icon-search" :aria-label="$t('aria.search')"></i>
          <div class="search_box">
            <form class="search_form" @submit.prevent="onSearch">
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
          </div>
        </div>

        <!-- 語系（參考 Header01：.lang_box + button.lang_item，不用 ul/li） -->
        <div
          v-if="navtool.isEnabled('language') && languages.length > 1"
          class="lang_toggle"
          :style="{ order: navtool.orderOf('language') }"
        >
          <i class="icon icon-language" :aria-label="$t('aria.language')"></i>
          <div class="lang_box">
            <button
              v-for="lang in languages"
              :key="lang.code"
              type="button"
              class="lang_item"
              :class="{ 'is-active': lang.code === locale }"
              @click="setLocale(lang.code)"
            >
              {{ lang.label }}
            </button>
          </div>
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

        <!-- CTA 立即預約諮詢（Header05 專屬，永遠在 navtool 尾端） -->
        <a
          v-if="ctaLink"
          :href="ctaLink"
          target="_blank"
          rel="noopener"
          class="sp_link"
          :style="{ order: 90 }"
        >
          {{ $t('cta.book_appointment') }}
        </a>

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
  </header>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header05_panel">
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
.header05 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 calc(75 / 19.2 * 1vw);
  height: 70px;
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 calc(48 / 14.4 * 1vw); }
  @include rwd-1200 { padding: 0 0 0 30px; }
  @include rwd-480  { padding: 0 0 0 15px; }

  // scroll 後浮島化（桌面：縮成中央浮 box + 陰影）
  &.scroll {
    box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.1);

    @media (min-width: 1201px) {
      top: 10px;
      left: calc(75 / 19.2 * 1vw);
      right: calc(75 / 19.2 * 1vw);
      padding: 0 30px;
      border-radius: 999px;
    }
  }
}

.logo {
  display: block;

  @include rwd-1200 { margin-right: 15px; }

  img {
    max-height: 60px;

    @include rwd-1200 { max-height: 40px; }
  }
}

.navbar {
  display: flex;
}

.navmenu {
  display: flex;
  list-style: none;
  margin-left: 15px;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    display: flex;
    align-items: center;
    position: relative;
    height: 70px;

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
      padding: 0 25px;
      transition: all 0.3s;

      @include rwd-1440 { padding: 0 15px; }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_1;
    }

    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 160px;
      padding: 6px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all var(--transition);

      a {
        display: block;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 6px;
        color: $web_font_color;
        transition: all var(--transition);

        &:hover,
        &.router-link-active {
          background: var(--color-surface);
          color: var(--color-primary);
        }
      }
    }

    &:hover > .navmenu_sub {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

.navtool {
  display: flex;
  align-items: center;
  margin-left: 15px;

  @include rwd-1280 { margin-left: 0; }

  > div,
  > a,
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 70px;
    padding: 0 20px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    @include rwd-1440 { padding: 0 15px; }
    @include rwd-1200 {
      padding: 0 25px;
      &:not(.sp_link):not(.mbPanel_btn) { display: none; }
    }

    color: $web_font_color;

    > .icon { font-size: 20px; }

    &:hover { color: $web_header_1; }
  }

  // 搜尋下拉 — 樣式與 Header01 統一
  .search_btn .search_box {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 280px;
    padding: 10px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    transition: all var(--transition);
    z-index: 60;

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
        color: $web_font_color;
        transition: color 0.3s;

        .icon { font-size: 18px; }

        &:hover { color: var(--color-primary); }
      }
    }
  }

  .search_btn:hover .search_box,
  .search_btn:focus-within .search_box {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  // 語系下拉 — 樣式與 Header01 統一
  .lang_toggle .lang_box {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    padding: 6px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    transition: all var(--transition);
    z-index: 60;

    .lang_item {
      background: none;
      border: none;
      padding: 8px 12px;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      border-radius: 6px;
      color: $web_font_color;
      transition: all var(--transition);

      &:hover {
        background: var(--color-surface);
        color: var(--color-primary);
      }

      &.is-active {
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  }

  .lang_toggle:hover .lang_box {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  // CTA「立即預約諮詢」
  .sp_link {
    width: 150px;
    height: 42px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    margin-left: 10px;
    background: $web_header_2;
    border: 1px solid $web_header_2;
    border-radius: 999px;
    padding: 0;
    transition: all 0.3s;

    @include rwd-1680 { width: 170px; }
    @include rwd-1280 {
      width: 150px;
      margin-left: 15px;
    }

    &:hover {
      color: $web_font_color;
      background: #fff;
    }
  }

  .mbPanel_btn {
    padding: 0 20px;
    background: $web_header_1;

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

// 行動版下拉選單
.header05_panel {
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
