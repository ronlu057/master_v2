<script setup>
// 頁首版型 16 — 9 點漢堡 + 桌面全螢幕大型側邊面板
// 特色：navmenu 置中，navtool 含 search/cart/lang + 3×3 共 9 點漢堡（奇偶雙色）
//      漢堡點擊切換 .mbPanel16_sp 全螢幕大型面板（桌面也顯示，行動版 1200↓ 隱藏）
//      面板分左右：左側 Logo 大標、右側雙欄可捲動的多層選單
//      捲過 banner 高 - header 高 → 套上 .scroll（加陰影）
//
// 原始檔：D:\www\master_dev\template\module\header\header16.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header16.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal, enableShop } = useProject()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

const socials = useSocials()

const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

// 自家面板開關（不重用 ui.menuOpen，避免和其他 header 行動版選單衝突）
const panelOpen = ref(false)
const togglePanel = () => { panelOpen.value = !panelOpen.value }
const closePanel = () => { panelOpen.value = false }

// 搜尋
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  keyword.value = ''
}

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
  <header ref="headerEl" :class="['header16', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- 主選單（置中） -->
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
        <!-- 搜尋（hover popup） -->
        <div
          v-if="navtool.isEnabled('search')"
          class="search_btn"
          :style="{ order: navtool.orderOf('search') }"
        >
          <i v-if="navtool.showsIcon('search')" class="icon icon-search"></i>
          <span v-if="navtool.showsText('search')" class="navtool_text">{{ navtool.textOf('search') }}</span>
          <form class="search_form" @submit.prevent="onSearch">
            <input
              v-model="keyword"
              type="text"
              autocomplete="off"
              :placeholder="$t('site.search_placeholder')"
              :aria-label="$t('aria.search')"
            />
            <button type="submit" :aria-label="$t('btn.search')">
              <i class="icon icon-search"></i>
            </button>
          </form>
        </div>

        <!-- 語系 -->
        <div
          v-if="navtool.isEnabled('language') && languages.length > 1"
          class="lang_toggle"
          :style="{ order: navtool.orderOf('language') }"
        >
          <i v-if="navtool.showsIcon('language')" class="icon icon-language"></i>
          <span v-if="navtool.showsText('language')" class="navtool_text">{{ navtool.textOf('language') }}</span>
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
          <span v-if="navtool.showsText('social')" class="navtool_text">{{ navtool.textOf('social') }}</span>
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
          <i v-if="navtool.showsIcon('member')" class="icon icon-member"></i>
          <span v-if="navtool.showsText('member')" class="navtool_text">{{ navtool.textOf('member') }}</span>
        </NuxtLink>

        <!-- 購物車 -->
        <NuxtLink
          v-if="navtool.isEnabled('cart')"
          to="/shop/cart"
          class="cart_btn"
          :style="{ order: navtool.orderOf('cart') }"
          :aria-label="$t('aria.cart')"
        >
          <i v-if="navtool.showsIcon('cart')" class="icon icon-shopcart"></i>
          <span v-if="navtool.showsText('cart')" class="navtool_text">{{ navtool.textOf('cart') }}</span>
          <p v-if="cart.totalItems || cart.count">{{ cart.totalItems || cart.count }}</p>
        </NuxtLink>

        <!-- 我的最愛 -->
        <NuxtLink
          v-if="navtool.isEnabled('favorite')"
          to="/shop/favorite"
          class="favorite_btn"
          :style="{ order: navtool.orderOf('favorite') }"
          :aria-label="$t('aria.favorite')"
        >
          <i v-if="navtool.showsIcon('favorite')" class="icon icon-like"></i>
          <span v-if="navtool.showsText('favorite')" class="navtool_text">{{ navtool.textOf('favorite') }}</span>
        </NuxtLink>

        <!-- 9 點漢堡 -->
        <button
          type="button"
          class="mbPanel_btn"
          :class="{ active: panelOpen }"
          :aria-label="$t('aria.menu')"
          @click="togglePanel"
        >
          <span class="bars">
            <span v-for="n in 9" :key="n" class="bar"></span>
          </span>
        </button>
      </div>
    </div>
  </header>

  <!-- 全螢幕大型側邊面板 -->
  <transition name="panel">
    <div v-if="panelOpen && !isMinimal" class="mbPanel16_sp">
      <div class="wider_container">
        <div class="row_by_gap no_gutter">
          <div class="left">
            <NuxtLink class="logo" to="/" @click="closePanel">
              <SiteLogo alt="Logo" />
            </NuxtLink>
          </div>
          <div class="right">
            <div v-for="item in menuData.mobile" :key="item.url" class="mb_section">
              <NuxtLink :to="item.url" @click="closePanel">
                {{ item.title }}
              </NuxtLink>
              <div v-if="item.children?.length" class="mb_section_sub">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.url"
                  :to="child.url"
                  @click="closePanel"
                >
                  {{ child.title }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.header16 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 fluid(30);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 calc(80 / 19.2 * 1vw);
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 calc(48 / 14.4 * 1vw); }
  @include rwd-1200 { padding: 0 30px; }
  @include rwd-480 {
    gap: 0 20px;
    padding: 0 15px;
  }

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }
}

.logo {
  display: block;

  @media (min-width: 1201px) { flex-shrink: 0; }

}

.navbar {
  display: flex;
  gap: 0 fluid(30);

  @media (min-width: 1201px) { width: 100%; }
}

.navmenu {
  display: flex;
  justify-content: center;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    position: relative;

    > a {
      display: block;
      color: $web_font_color;
      font-size: fluid-fz(16);
      padding: fluid(23) fluid(25);
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
      min-width: fluid(142);
      padding: fluid(6);
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
        font-size: fluid-fz(14);
        text-align: center;
        padding: fluid(8) fluid(12);
        border-radius: fluid(6);
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

.navtool {
  display: flex;
  gap: 0 fluid(30);

  @include rwd-1440 { gap: 0 20px; }
  @include rwd-1200 { gap: 0 30px; }
  @include rwd-480 { gap: 0 20px; }

  > div,
  > a,
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: fluid(70);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    @include rwd-1200 {
      &:not(.cart_btn):not(.mbPanel_btn) { display: none; }
    }

    color: $web_font_color;
    transition: all 0.3s;

    > .icon { font-size: fluid-fz(20); }

    .search_form {
      display: flex;
      align-items: center;
      position: absolute;
      top: 100%;
      right: 0;
      width: fit-content;
      padding: fluid(15);
      background: #fff;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s;

      input {
        padding: fluid(6) fluid(10);
        border: 1px solid var(--color-border);
        color: $web_font_color;
        font-size: fluid-fz(14);
        width: fluid(200);
      }

      button {
        background: none;
        border: none;
        margin-left: fluid(13);
        cursor: pointer;

        color: $web_font_color;
        transition: color 0.3s;

        .icon { font-size: fluid-fz(18); }

        &:hover { color: $web_header_1; }
      }
    }

    // 下拉（卡片式浮層，樣式參考 header01 .lang_box）
    ul {
      position: absolute;
      top: 100%;
      right: 50%;
      width: max-content;
      list-style: none;
      margin: 0;
      padding: fluid(6);
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
          font-size: fluid-fz(14);
          text-align: center;
          padding: fluid(8) fluid(12);
          border-radius: fluid(6);
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
      @media (min-width: 1025px) {
        color: $web_header_1;
      }
      .search_form {
        opacity: 1;
        pointer-events: auto;
      }
      ul {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translate(50%, 0);
      }
    }
  }

  .cart_btn {
    p {
      position: absolute;
      top: fluid(17);
      right: fluid(9);
      width: fluid(16);
      line-height: 16px;
      color: #fff;
      font-size: fluid-fz(14);
      font-weight: 500;
      text-align: center;
      background: #ff0006;
      border-radius: 50%;
      margin: 0;
      transition: all 0.3s;

      @include rwd-1440 { right: 4px; }
      @include rwd-1200 { right: 14px; }
    }
  }

  // 9 點漢堡：3×3 方陣，奇偶雙色，中央固定品牌色
  .mbPanel_btn {
    @media (min-width: 1201px) { margin-left: calc(65 / 19.2 * 1vw); }

    .bars {
      display: flex;
      flex-wrap: wrap;
      gap: fluid(6);
      width: fluid(30);
      height: fluid(30);

      .bar {
        width: fluid(6);
        height: fluid(6);
        transition: background 0.4s ease;

        &:nth-child(odd) { background: $web_font_color; }
        &:nth-child(even) { background: $web_header_1; }
        &:nth-child(5) { background: $web_header_1; }
      }
    }

    &.active .bars .bar {
      &:nth-child(odd) { background: $web_header_1; }
      &:nth-child(even) { background: $web_font_color; }
    }

    @media (min-width: 1025px) {
      &:hover .bars .bar {
        &:nth-child(odd) { background: $web_header_1; }
        &:nth-child(even) { background: $web_font_color; }
      }
    }
  }
}

// 全螢幕大型側邊面板
.mbPanel16_sp {
  display: flex;
  position: fixed;
  top: fluid(70);
  bottom: 0;
  left: 0;
  right: 0;
  padding: fluid(70) 0;
  background: #fff;
  background-position: left bottom;
  background-size: calc(562 / 19.2 * 1vw) calc(406 / 19.2 * 1vw);
  background-repeat: no-repeat;
  overflow: hidden;
  z-index: $z_mbPanel_95;

  @include rwd-1200 { display: none; }

  .wider_container {
    width: 100%;
    max-width: fluid(1600);
    margin: 0 auto;
    padding: 0 calc(80 / 19.2 * 1vw);
  }

  .row_by_gap {
    display: flex;
    align-items: flex-start;
  }

  .left {
    width: calc(600 / 1600 * 100%);
    padding-right: calc(130 / 19.2 * 1vw);

    .logo {
      display: block;
      width: fit-content;

    }
  }

  .right {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: calc(50 / 19.2 * 1vw) calc(130 / 19.2 * 1vw);
    width: calc(1000 / 1600 * 100%);
    max-height: calc(100vh - 210px);
    padding-right: fluid(22);
    overflow-y: auto;

    &::-webkit-scrollbar { width: 2px; }
    &::-webkit-scrollbar-track { background: #e5e5e5; }
    &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.3); }
    &::-webkit-scrollbar-thumb:hover { background: $web_font_color; }

    .mb_section {
      width: calc(50% - 65 / 19.2 * 1vw);

      > a {
        display: block;
        position: relative;
        color: $web_font_color;
        font-size: fluid-fz(24);
        font-weight: 500;
        transition: all 0.3s;

        &::before {
          content: '';
          display: block;
          width: 100%;
          height: fluid(7);
          padding: fluid(3) 0;
          margin-bottom: fluid(7);
          background-image: linear-gradient(to right, #e8e8e6, #e8e8e6);
          background-size: 100% 1px;
          background-position: left center;
          background-repeat: no-repeat;
          transition: background-size 0.5s ease-in-out;
        }

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: fluid(6);
          height: fluid(6);
          background: $web_header_1;
          border-radius: fluid(20);
          transition: width 0.5s ease-in-out;
        }

        &:hover {
          color: $web_header_1;

          &::before { background-size: 0% 1px; }
          &::after { width: 100%; }
        }
      }

      > ul {
        display: flex;
        flex-wrap: wrap;
        gap: fluid(11) fluid(19);
        margin-top: fluid(21);
        list-style: none;
        padding: 0;

        li {
          &:not(:last-child) {
            position: relative;

            &::after {
              content: '';
              position: absolute;
              top: 0;
              right: fluid(-10);
              width: 1px;
              height: 80%;
              background: #acacac;
            }
          }

          a {
            color: #4e4e4e;
            transition: all 0.3s;

            &:hover { color: $web_header_1; }
          }
        }
      }
    }
  }
}

// 面板進出場
.panel-enter-active,
.panel-leave-active { transition: opacity 0.4s ease; }
.panel-enter-from,
.panel-leave-to { opacity: 0; }
</style>
