<script setup>
// 頁首版型 06 — 三欄等寬型
// 結構：左 200~250px logo / 中 navmenu / 右 200~250px navtool
// 漢堡按鈕含 menu / close 雙文字（仿 Header10）
//
// 原始檔：D:\www\master_dev\template\module\header\header06.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header06.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

const socials = useSocials()

const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

const onSearchClick = () => navigateTo('/search')

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
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <header ref="headerEl" :class="['header06', { scroll: isScrolled }]">
    <!-- 左 -->
    <div class="left_area">
      <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
        <SiteLogo alt="Logo" />
      </NuxtLink>
    </div>

    <!-- 中 -->
    <div class="center_area">
      <div v-if="!isMinimal" class="navbar">
        <ul
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
    </div>

    <!-- 右 -->
    <div class="right_area">
      <div v-if="!isMinimal" class="navtool">
        <!-- 搜尋 -->
        <a
          v-if="navtool.isEnabled('search')"
          href="javascript:;"
          class="search_btn"
          :style="{ order: navtool.orderOf('search') }"
          :aria-label="$t('aria.search')"
          @click.prevent="onSearchClick"
        >
          <i class="icon icon-search"></i>
        </a>

        <!-- 語系 -->
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
          class="cart_btn"
          to="/shop/cart"
          :style="{ order: navtool.orderOf('cart') }"
          :aria-label="$t('aria.cart')"
        >
          <i class="icon icon-shopcart"></i>
          <p v-if="cart.count">{{ cart.count }}</p>
        </NuxtLink>

        <!-- 我的最愛 -->
        <NuxtLink
          v-if="navtool.isEnabled('favorite')"
          class="favorite_btn"
          to="/shop/favorite"
          :style="{ order: navtool.orderOf('favorite') }"
          :aria-label="$t('aria.favorite')"
        >
          <i class="icon icon-like"></i>
        </NuxtLink>

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
          <p v-show="!ui.menuOpen" class="txt1">menu</p>
          <p v-show="ui.menuOpen" class="txt2">close</p>
        </button>
      </div>
    </div>
  </header>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header06_panel">
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
.header06 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: fluid(20);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 4.1667vw;
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 2.5vw; }
  @include rwd-1200 {
    gap: 7.5px;
    padding: 0 0 0 30px;
  }
  @include rwd-480 { padding: 0 0 0 15px; }

  // 桌面三欄等寬
  @media (min-width: 1201px) {
    .left_area,
    .right_area { width: 200px; }
    .center_area { width: calc(100% - 440px); }
  }

  // 大桌面更寬
  @media (min-width: 1367px) {
    .left_area,
    .right_area { width: 250px; }
    .center_area { width: calc(100% - 540px); }
  }
}

.logo {
  display: block;

}

.navbar {
  @include rwd-1200 { display: none; }
}

.navmenu {
  display: flex;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;

  > li {
    position: relative;

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
      line-height: 1.5;
      padding: fluid(23) fluid(25);
      transition: all 0.3s;

      @include rwd-1440 { padding: 23px 15px; }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_1;
    }

    // 下拉子選單 — 樣式參考 Header01（置中對齊 Header06 的 navmenu）
    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 50%;
      min-width: fluid(160);
      padding: fluid(6);
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translate(-50%, 8px);
      transition: all var(--transition);

      a {
        display: block;
        padding: fluid(8) fluid(12);
        font-size: 14px;
        border-radius: fluid(6);
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
      transform: translate(-50%, 0);
    }
  }
}

.navtool {
  display: flex;
  justify-content: flex-end;

  > div,
  > a,
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: fluid(70);
    padding: 0 fluid(20);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    @include rwd-1440 { padding: 0 15px; }
    @include rwd-1200 {
      padding: 0 25px;
      &:not(.cart_btn):not(.mbPanel_btn) { display: none; }
    }

    color: $web_font_color;
    transition: all 0.3s;

    > .icon { font-size: 20px; }

    &:hover { color: $web_header_1; }
  }

  // 語系下拉 — 樣式與 Header01 統一
  .lang_toggle .lang_box {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: fluid(140);
    display: flex;
    flex-direction: column;
    padding: fluid(6);
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
      padding: fluid(8) fluid(12);
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      border-radius: fluid(6);
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

  .cart_btn {
    p {
      position: absolute;
      top: fluid(17);
      right: fluid(9);
      width: fluid(16);
      line-height: 16px;
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      background: #ff0006;
      border-radius: 50%;

      @include rwd-1440 { right: 4px; }
      @include rwd-1200 { right: 14px; }
    }
  }

  .mbPanel_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: fluid(70);
    height: fluid(70);
    padding: 0;
    background: $web_header_1;

    @media (min-width: 1201px) { display: none !important; }

    .bars {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      width: fluid(30);
      height: fluid(18);

      .bar {
        position: relative;
        top: 0;
        width: 100%;
        height: 2px;
        background: #fff;
        transition:
          top 0.3s 0.3s,
          width 0.3s 0.3s,
          transform 0.3s;
      }

      .bar2 {
        width: 66.67%;
        margin: 0 0 0 auto;
      }
    }

    p {
      color: #fff;
      font-size: 14px;
      font-family: 'Poppins', sans-serif;
      line-height: 1;
      margin-top: fluid(3);
    }

    &.active .bars .bar {
      transition:
        top 0.3s,
        width 0.3s,
        transform 0.3s 0.3s;

      &.bar1 { top: 8px;  transform: rotate(-25deg); }
      &.bar2 { width: 0%; }
      &.bar3 { top: -8px; transform: rotate(25deg); }
    }
  }
}

// 行動版下拉選單
.header06_panel {
  position: fixed;
  top: fluid(70);
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding: fluid(8) fluid(20) fluid(16);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  z-index: $z_mobile_menu;
}

.mb_navmenu_link {
  display: block;
  padding: fluid(12) fluid(4);
  font-size: 18px;
  font-weight: 600;
  color: $web_font_color;
  border-bottom: 1px solid var(--color-border);
}

.mb_navmenu_sub {
  padding: 0 0 0 fluid(16);

  a {
    display: block;
    padding: fluid(8) fluid(4);
    font-size: 14px;
    color: $web_font_color;
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
