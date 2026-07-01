<script setup>
// 頁首版型 08 — 雙模式型
// 首頁桌面：主 header 平移隱藏（translateY(-100%)）；浮在 banner 中央的 sp menu 取代之
//          sp menu 的 top 隨捲動動態調整（top = bannerH / 2 - scrollTop）
//          捲過 banner 底 → 主 header 滑回頂部、sp menu 跟著捲走
// 其他狀態（非首頁 / 行動裝置）：主 header 正常顯示、sp menu 隱藏
//
// 原始檔：D:\www\master_dev\template\module\header\header08.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header08.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

const socials = useSocials()

// i18n
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

// 搜尋
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  keyword.value = ''
}

// 捲動偵測 + sp menu 動態 top
const headerEl = ref(null)
const isScrolled = ref(false)
const spTop = ref(0) // .header08_sp 的動態 top
const updateScrollState = () => {
  const banner = document.querySelector('[class^="banner"]')
  const bannerH = banner ? banner.offsetHeight : 0
  const scrollY = window.scrollY

  // sp menu 動態浮起：原 JS `top = bannerH / 2 - scrollTop`
  spTop.value = bannerH / 2 - scrollY

  // scroll 過 banner 底 → 主 header 出現
  isScrolled.value = scrollY >= bannerH
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
  <!-- 主 header（首頁桌面預設隱藏；scroll 後出現） -->
  <header ref="headerEl" :class="['header08', { scroll: isScrolled }]">
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
        <div
          v-if="navtool.isEnabled('search')"
          class="search_btn"
          :style="{ order: navtool.orderOf('search') }"
        >
          <i v-if="navtool.showsIcon('search')" class="icon icon-search" :aria-label="$t('aria.search')"></i>
          <span v-if="navtool.showsText('search')" class="navtool_text">{{ navtool.textOf('search') }}</span>
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

        <!-- 語系 -->
        <div
          v-if="navtool.isEnabled('language') && languages.length > 1"
          class="lang_toggle"
          :style="{ order: navtool.orderOf('language') }"
        >
          <i v-if="navtool.showsIcon('language')" class="icon icon-language" :aria-label="$t('aria.language')"></i>
          <span v-if="navtool.showsText('language')" class="navtool_text">{{ navtool.textOf('language') }}</span>
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

        <!-- 會員中心 -->
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
          class="cart_btn"
          to="/shop/cart"
          :style="{ order: navtool.orderOf('cart') }"
          :aria-label="$t('aria.cart')"
        >
          <i v-if="navtool.showsIcon('cart')" class="icon icon-shopcart"></i>
          <span v-if="navtool.showsText('cart')" class="navtool_text">{{ navtool.textOf('cart') }}</span>
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
          <i v-if="navtool.showsIcon('favorite')" class="icon icon-like"></i>
          <span v-if="navtool.showsText('favorite')" class="navtool_text">{{ navtool.textOf('favorite') }}</span>
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
        </button>
      </div>
    </div>
  </header>

  <!-- 中央浮動 sp menu（首頁桌面才顯示；top 動態跟著捲動） -->
  <div
    v-if="!isMinimal"
    class="header08_sp"
    :style="{ top: spTop + 'px' }"
  >
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <ul itemscope itemtype="https://www.schema.org/SiteNavigationElement" class="navmenu">
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

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header08_panel">
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
// 首頁桌面：主 header 平移隱藏；sp menu 顯示
body[data-page="index"] {
  .header08:not(.scroll) {
    @media (min-width: 1201px) {
      transform: translateY(-100%);
    }
  }

  .header08_sp {
    display: flex;

    @include rwd-1200 { display: none; }
  }
}

// 主 header
.header08 {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
    .navmenu {
      > li {
        .navmenu_sub {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: fluid(160);
          padding: fluid(6);
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
            padding: fluid(8) fluid(12);
            font-size: fluid-fz(14);
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
          transform: translateY(0);
        }
      }
    }
  }
}

.logo {
  display: block;

  @include rwd-1200 { margin-right: 15px; }

}

.navbar {
  display: flex;
}

.navmenu {
  display: flex;
  list-style: none;
  margin-left: fluid(15);
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    position: relative;

    > a {
      display: block;
      color: $web_font_color;
      font-size: fluid-fz(16);
      line-height: 1.5;
      padding: fluid(23) fluid(25);
      transition: all 0.3s;

      @include rwd-1440 { padding: 23px 15px; }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_1;
    }

    // 下拉子選單 — 樣式與 Header01 一致
    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: fluid(160);
      padding: fluid(6);
      background: transparent;
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all var(--transition);

      a {
        display: block;
        padding: fluid(8) fluid(12);
        font-size: fluid-fz(14);
        border-radius: fluid(6);
        color: $web_font_color;
        transition: all var(--transition);

        &:hover,
        &.router-link-active {
          background: transparent;
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

// 工具列
.navtool {
  display: flex;
  margin-left: fluid(20);

  @include rwd-1280 { margin-left: 0; }

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

    > .icon { font-size: fluid-fz(20); }

    &:hover { color: $web_header_1; }
  }

  // 搜尋下拉 — 樣式與 Header01 一致
  .search_btn .search_box {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: fluid(280);
    padding: fluid(10);
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

  // 語系下拉 — 樣式與 Header01 一致
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
      font-size: fluid-fz(14);
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
      font-size: fluid-fz(13);
      font-weight: 500;
      text-align: center;
      background: #ff0006;
      border-radius: 50%;

      @include rwd-1440 { right: 4px; }
      @include rwd-1200 { right: 14px; }
    }
  }

  .mbPanel_btn {
    padding: 0 fluid(20);
    background: $web_header_1;

    @media (min-width: 1201px) { display: none; }

    .bars {
      position: relative;
      width: fluid(30);
      height: 2px;

      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: fluid(10);

        &.bar1 {
          top: fluid(-8);
          transition: top 0.3s 0.5s, transform 0.3s;
        }
        &.bar2 {
          opacity: 1;
          transition: opacity 0s 0.3s;
        }
        &.bar3 {
          top: fluid(8);
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

// ── 中央浮動 sp menu（首頁桌面才顯示） ────────────────────
.header08_sp {
  display: none;
  align-items: center;
  flex-direction: column;
  position: fixed;
  left: 0;
  right: 0;
  z-index: $z_header;
  transform: translateY(-55%);

  .logo {
    margin-bottom: fluid(30);

  }

  .navmenu {
    display: flex;
    gap: 0 fluid(50);
    list-style: none;
    margin: 0;
    padding: 0;

    > li {
      position: relative;

      > a {
        display: block;
        color: #fff;
        font-size: fluid-fz(16);
        text-shadow: 0 0 15px rgba(0, 0, 0, 0.45);
        padding: fluid(5) 0;
        transition: all 0.3s;
      }

      &:hover > a,
      > a.router-link-active {
        color: $web_header_1;
      }

      .navmenu_sub {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: fluid(10) fluid(25);
        position: absolute;
        top: 100%;
        left: 50%;
        width: 50vw;
        max-width: fluid(500);
        padding-top: fluid(25);
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, 0);
        transition: all 0.3s;

        &::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          width: 1px;
          height: 0;
          background: $web_header_1;
          transition: all 0.3s;
        }

        a {
          flex-shrink: 0;
          display: block;
          color: #a0a0a0;
          font-size: fluid-fz(14);
          line-height: 1.5;
          text-align: center;
          transition: all 0.3s;

          &:hover,
          &.router-link-active {
            color: #fff;
            text-shadow: 0 0 15px rgba(0, 0, 0, 0.45);
          }
        }
      }
    }

    > li:hover > .navmenu_sub {
      opacity: 1;
      pointer-events: auto;

      &::before { height: 20px; }
    }
  }
}

// ── 行動版下拉選單 ───────────────────────────────────────
.header08_panel {
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
