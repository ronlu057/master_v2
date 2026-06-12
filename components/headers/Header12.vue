<script setup>
// 頁首版型 12 — 深色主色背景型
// 特色：整條 header 用 $web_header_1 主色；主選單 hover 下劃線有「跑馬線」動畫
//      （a 內嵌兩層 span：外層做 1px 底線、內層 16px 亮點水平掃描循環）
//
// 原始檔：D:\www\master_dev\template\module\header\header12.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header12.scss
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

// 搜尋（點擊跳轉 /search）
const onSearchClick = () => navigateTo('/search')

// 捲動偵測（仿原 JS：scrollTop ≥ banner − header 加 .scroll）
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
  <header ref="headerEl" :class="['header12', { scroll: isScrolled }]">
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
          <NuxtLink :to="item.url" itemprop="url">
            {{ item.title }}
            <!-- 跑馬線下劃線：外層 1px 半透明底、內層 16px 亮點掃描循環 -->
            <span class="underline"><span></span></span>
          </NuxtLink>
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

      <!-- 工具列 -->
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
    </div>
  </header>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header12_mobile">
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
.header12 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 4.1667vw;
  background: $web_header_1;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 2.5vw; }
  @include rwd-1200 { padding: 0 0 0 30px; }
  @include rwd-480  { padding: 0 0 0 15px; }

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
  }
}

.logo {
  display: block;

}

.navbar {
  display: flex;

  .navmenu {
    display: flex;
    margin-left: 15px;
    list-style: none;
    padding: 0;

    @include rwd-1200 { display: none; }

    > li {
      position: relative;
      padding: 14px 25px;
      transition: all 0.3s;

      @include rwd-1440 { padding: 14px 15px; }

      > a {
        display: block;
        position: relative;
        color: #fff;
        font-size: 16px;
        line-height: 1.5;
        padding: 9px 0;
        transition: all 0.3s;
      }

      // 跑馬線下劃線：外層底線 + 內層掃描亮點
      .underline {
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: rgba($web_header_2, 0.5);
        opacity: 0;
        overflow: hidden;
        transition: opacity 0.3s;

        > span {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 16px;
          height: 1px;
          background: $web_header_2;
          animation: header12_marquee 2s linear infinite;
        }
      }

      &:hover > a,
      > a.router-link-active {
        color: $web_header_2;

        .underline { opacity: 1; }
      }

      // 下拉（卡片式浮層，樣式參考 header01 .navmenu__sub）
      > .navmenu_sub {
        position: absolute;
        top: 100%;
        left: 50%;
        width: max-content;
        min-width: calc(100% + 50px);
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

        @include rwd-1440 { min-width: calc(100% + 30px); }

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

// 跑馬線 keyframes（從左跑出右邊）
@keyframes header12_marquee {
  0%   { left: 0;    transform: translateX(-100%); }
  100% { left: 100%; transform: translateX(0%); }
}

// ── 工具列 ──────────────────────────────────────────────
.navtool {
  display: flex;
  margin-left: 20px;

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
      padding: 0;
      margin-left: 20px;

      &:not(.mbPanel_btn) { display: none; }
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

    &:hover {
      color: $web_header_2;

      ul {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translate(50%, 0);
      }
    }
  }

  .mbPanel_btn {
    width: 70px;
    background: $web_header_2;
    padding: 0;

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
.header12_mobile {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: $web_header_1;
  padding: 8px 20px 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: $z_mobile_menu;
}

.mb_navmenu_link {
  display: block;
  padding: 12px 4px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.mb_navmenu_sub {
  padding: 0 0 0 16px;

  a {
    display: block;
    padding: 8px 4px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
