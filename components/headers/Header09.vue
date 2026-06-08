<script setup>
// 頁首版型 09 — 透明 + 半透明黑底 + 浮動漢堡型
// 特色：
//   - 首頁桌面：header 全透明、navmenu 隱藏；scroll 後 → 半透明黑底 + 模糊背景 + navmenu 浮現
//   - 非首頁：直接半透明黑底 + navmenu 顯示（桌面）+ 浮動漢堡隱藏
//   - 行動裝置 ≤1200：永遠半透明黑底；漢堡固定右上
//   - 雙 logo（≤1024 切換成第二張）
//
// 原始檔：D:\www\master_dev\template\module\header\header09.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header09.scss
const { isMinimal } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

const socials = useSocials()

const onSearchClick = () => navigateTo('/search')

// 捲動偵測（仿原 JS：scrollTop ≥ headerH 加 .scroll，且桌面 scroll 後自動關閉漢堡）
const headerEl = ref(null)
const isScrolled = ref(false)
const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  isScrolled.value = window.scrollY >= headerH

  // 桌面 scroll 後自動關漢堡（仿原 JS）
  if (isScrolled.value && window.matchMedia('(min-width: 1201px)').matches) {
    if (ui.menuOpen) ui.closeMenu()
  }
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
  <header ref="headerEl" :class="['header09', { scroll: isScrolled }]">
    <div class="navbar">
      <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
        <!-- 雙 logo：≥1025 顯示第一張、≤1024 顯示第二張（mock 暫用同檔） -->
        <SiteLogo alt="Logo" />
        <SiteLogo alt="Logo" />
      </NuxtLink>

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

      <!-- 工具列（順序 / 顯示由 useNavtoolConfig 控制） -->
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
          :aria-label="$t('aria.cart')"
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
          :aria-label="$t('aria.favorite')"
        >
          <i class="icon icon-like"></i>
        </NuxtLink>
      </div>
    </div>
  </header>

  <!-- 浮動漢堡（外層獨立元素） -->
  <button
    v-if="!isMinimal"
    type="button"
    :class="['mbPanel_btn09', { active: ui.menuOpen, scroll: isScrolled }]"
    :aria-label="$t('aria.menu')"
    @click="ui.toggleMenu"
  >
    <span class="bars">
      <span class="bar bar1"></span>
      <span class="bar bar2"></span>
      <span class="bar bar3"></span>
    </span>
  </button>

  <!-- 行動版 / 漢堡開啟時的下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header09_panel">
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
// 非首頁桌面：自動半透明黑底 + navmenu 顯示 + 漢堡隱藏
body:not([data-page="index"]) {
  @media (min-width: 1201px) {
    .header09 {
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);

      .navmenu {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .mbPanel_btn09 {
      opacity: 0;
      pointer-events: none;
    }
  }
}

.header09 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 4.1667vw;
  background: transparent;
  backdrop-filter: blur(0);
  z-index: $z_header;
  transition: all 0.5s $ani_bezier_7;

  @include rwd-1440 { padding: 0 2.5vw; }
  @include rwd-1200 {
    padding: 0 30px;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
  }
  @include rwd-480 { padding: 0 15px; }

  &.scroll {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);

    .navmenu {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.5s $ani_bezier_7;

  @include rwd-1200 { height: 70px; }
}

.logo {
  display: block;

  @media (min-width: 1201px) { min-width: fit-content; }
  @include rwd-1200 { max-width: calc(100% - 60px); }

  img {
    max-height: 60px;
    transition: all 0.5s $ani_bezier_7;

    // ≥1025 顯示第一張、≤1024 顯示第二張
    &:nth-child(1) {
      @include rwd-1024 { display: none; }
    }
    &:nth-child(2) {
      @media (min-width: 1025px) { display: none; }
    }
  }
}

.navmenu {
  display: flex;
  justify-content: flex-end;
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s $ani_bezier_7;

  @include rwd-1200 { display: none; }

  > li {
    position: relative;

    > a {
      display: block;
      color: #fff;
      font-size: 16px;
      padding: 23px 20px;
      transition: all 0.5s $ani_bezier_7;
    }

    &:hover > a,
    > a.router-link-active {
      color: #fff;
      opacity: 0.85;
    }

    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 50%;
      width: max-content;
      min-width: 100%;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 0);
      transition: all 0.5s $ani_bezier_7;

      a {
        display: block;
        color: #fff;
        font-size: 14px;
        text-align: center;
        padding: 10px 20px;
        background: rgba(0, 0, 0, 0.55);
        transition: all 0.5s $ani_bezier_7;

        &:hover,
        &.router-link-active {
          background: rgba(0, 0, 0, 0.75);
        }
      }
    }

    &:hover > .navmenu_sub {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

// ── navtool（與 navmenu 一起隨可見性切換） ─────────────────
.navtool {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: 20px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s $ani_bezier_7;
  color: #fff;

  @include rwd-1200 { display: none; }

  > a, > div, > button {
    color: #fff;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;

    &:hover { opacity: 0.85; }
  }

  .icon { font-size: 18px; }

  // .navtool_social 樣式走全域 main.scss

  // 語系下拉
  .lang_toggle {
    position: relative;

    ul {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 100px;
      list-style: none;
      margin: 0;
      padding: 6px;
      background: rgba(0, 0, 0, 0.85);
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: all 0.3s;

      li a {
        display: block;
        color: #fff;
        font-size: 13px;
        padding: 6px 10px;
        text-align: center;

        &:hover, &.active { opacity: 1; background: rgba(255, 255, 255, 0.1); }
      }
    }

    &:hover ul {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  }

  // 購物車徽章
  .cart_btn {
    p {
      position: absolute;
      top: -8px;
      right: -10px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 99px;
      background: $web_header_1;
      color: #fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
  }
}

// scroll / 非首頁時跟 navmenu 一起浮現
.header09.scroll .navtool,
body:not([data-page="index"]) .header09 .navtool {
  opacity: 1;
  pointer-events: auto;
}

// ── 浮動漢堡（外層獨立元素） ──────────────────────────────
.mbPanel_btn09 {
  position: fixed;
  top: 26px;
  right: 4.1667vw;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 1;
  pointer-events: auto;
  z-index: $z_mbPanel_btn;
  transition: all 0.5s $ani_bezier_7;

  @include rwd-1440 { right: 2.5vw; }
  @include rwd-1200 { right: 30px; }
  @include rwd-480  { right: 25px; }

  .bars {
    position: relative;
    width: 34px;
    height: 1px;
    margin: 9px 0;

    .bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: 10px;

      &.bar1 {
        top: -9px;
        left: 9px;
        width: 25px;
        transform-origin: left top;
        transition: all 0.5s $ani_bezier_7;
      }
      &.bar2 { transition: all 0.5s $ani_bezier_7; }
      &.bar3 {
        top: 9px;
        transform-origin: left bottom;
        transition: all 0.5s $ani_bezier_7;
      }
    }
  }

  &:hover .bars .bar1 {
    left: 0;
    width: 100%;
  }

  &.active .bars .bar {
    &.bar1 {
      left: 0;
      width: 38px;
      transform: rotate(27.5deg);
    }
    &.bar2 { opacity: 0; }
    &.bar3 {
      width: 38px;
      transform: rotate(-27.5deg);
    }
  }

  // 桌面 scroll 後自動隱藏（避免遮 navmenu）
  &.scroll {
    @media (min-width: 1201px) {
      opacity: 0;
      pointer-events: none;
    }
  }
}

// ── 漢堡開啟時的下拉選單 ──────────────────────────────────
.header09_panel {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  padding: 20px 4.1667vw;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: $z_mobile_menu;
  max-height: calc(100vh - 70px);
  overflow-y: auto;

  @include rwd-1440 { padding: 20px 2.5vw; }
  @include rwd-1200 { padding: 16px 30px; }
}

.mb_navmenu_link {
  display: block;
  padding: 14px 4px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  transition: opacity 0.3s;

  &:hover { opacity: 0.7; }
}

.mb_navmenu_sub {
  padding: 0 0 0 16px;

  a {
    display: block;
    padding: 8px 4px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);

    &:hover { color: #fff; }
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.3s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
