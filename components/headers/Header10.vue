<script setup>
// 頁首版型 10 — 首頁透明 + 寬版搜尋鈕 + 右側 120px 漢堡塊
// 特色：
//   - 首頁時 header 透明，navmenu 預設隱藏（hover/scroll 才顯示）
//   - 非首頁時 (body:not([data-page="index"])) 自動白底 + navmenu 顯示
//   - 右側固定漢堡塊（紅色 120×70），開啟時 menu / close 文字切換
//   - 點漢堡時隱藏 navmenu + 搜尋鈕，浮出行動版下拉
//
// 原始檔：D:\www\master_dev\template\module\header\header10.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header10.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

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

// 捲動偵測
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
  <header ref="headerEl" :class="['header10', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- 主選單（漢堡開啟時隱藏） -->
      <ul
        v-if="!isMinimal"
        itemscope
        itemtype="https://www.schema.org/SiteNavigationElement"
        :class="['navmenu', { dontshow: ui.menuOpen }]"
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

      <!-- 搜尋寬塊（Header10 特色，漢堡開啟時隱藏） -->
      <a
        v-if="!isMinimal && navtool.isEnabled('search')"
        href="javascript:;"
        :class="['search_btn', { dontshow: ui.menuOpen }]"
        :style="{ order: navtool.orderOf('search') }"
        :aria-label="$t('aria.search')"
        @click.prevent="onSearchClick"
      >
        <i class="icon icon-search"></i>
        <div>
          <p>{{ $t('btn.search') }}</p>
          <p>SEARCH</p>
        </div>
      </a>

      <!-- 其餘 5 個 navtool icon -->
      <div v-if="!isMinimal" class="navtool">
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
      </div>

      <!-- 右側固定漢堡塊 -->
      <button
        v-if="!isMinimal"
        type="button"
        :class="['mbPanel_btn', { active: ui.menuOpen }]"
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
  </header>

  <!-- 行動版 / 漢堡開啟時的下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header10_panel">
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
// 非首頁時自動：白底 + navmenu 顯示
body:not([data-page="index"]) {
  .header10 {
    background: #fff;

    .navmenu {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.header10 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  padding: 0 120px 0 4.1667vw;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 120px 0 2.5vw; }
  @include rwd-1200 {
    padding: 0 80px 0 30px;
    background: #fff;
  }
  @include rwd-480 { padding: 0 80px 0 15px; }

  &.scroll {
    background: #fff;

    .navmenu {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.logo {
  display: block;

}

.navbar {
  display: flex;
  align-items: center;
}

// 主選單
.navmenu {
  display: flex;
  list-style: none;
  margin: 0 45px;
  padding: 0;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s;

  @include rwd-1680 { margin: 0 30px; }
  @include rwd-1280 { margin: 0 15px; }
  @include rwd-1200 { display: none; }

  &.dontshow { display: none; }

  > li {
    position: relative;

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
      padding: 23px 25px;
      transition: all 0.3s;

      @include rwd-1680 { padding: 23px 15px; }
      @include rwd-1280 {
        font-size: 15px;
        padding: 23px 10px;
      }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_2;
    }

    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 50%;
      width: max-content;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 0);
      transition: all 0.3s;

      a {
        display: block;
        color: $web_font_color;
        font-size: 14px;
        text-align: center;
        padding: 10px 40px;
        background: #fff;
        border-bottom: 1px solid #e6e7e8;
        transition: all 0.3s;

        &:hover,
        &.router-link-active {
          color: #fff;
          background: $web_header_2;
        }
      }
    }

    &:hover > .navmenu_sub {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

// ── 工具列（語系 / 社群 / 會員 / 購物車 / 最愛） ──────────
.navtool {
  display: flex;
  align-items: center;
  gap: 18px;
  color: $web_font_color;

  @include rwd-1200 { display: none; }

  > a,
  > div {
    color: $web_font_color;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;

    &:hover { color: $web_header_2; }
  }

  .icon { font-size: 20px; }

  // .navtool_social 樣式走全域 main.scss

  // 語系下拉（預設隱藏，hover 才浮現）
  .lang_toggle {
    position: relative;

    ul {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 120px;
      list-style: none;
      margin: 0;
      padding: 6px;
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: all 0.3s;

      li a {
        display: block;
        color: $web_font_color;
        font-size: 13px;
        padding: 6px 10px;
        text-align: center;
        border-radius: 6px;

        &:hover,
        &.active {
          color: $web_header_2;
          background: var(--color-surface);
        }
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
      background: $web_header_2;
      color: #fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
  }
}

// 寬版搜尋鈕
.search_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 175px;
  height: 70px;
  // 後台「Header 背景色」有設時跟著變（含透明）；沒設則用版型預設色
  background: var(--header-bg-color, #{$web_header_2});
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  @include rwd-1680 { width: 155px; }
  @include rwd-1280 { width: 135px; }
  @include rwd-1200 {
    width: 70px;
    margin-left: 15px;
  }

  &.dontshow { display: none; }

  color: #fff;

  .icon { font-size: 20px; }

  div {
    margin-left: 15px;

    @include rwd-1200 { display: none; }

    p { line-height: 1.05; }

    p:nth-child(1) {
      color: #fff;
      font-size: 13px;
      letter-spacing: 1px;
    }

    p:nth-child(2) {
      color: #fff;
      font-size: 12px;
      letter-spacing: 2px;
      opacity: 0.5;
    }
  }
}

// 漢堡塊
.mbPanel_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: 0;
  width: 120px;
  height: 70px;
  // 後台「Header 背景色」有設時跟著變（含透明）；沒設則用版型預設色
  background: var(--header-bg-color, #{$web_header_1});
  border: none;
  cursor: pointer;
  z-index: $z_mbPanel_btn;
  transition: all 0.3s;

  @include rwd-1200 { width: 80px; }

  .bars {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 30px;
    height: 18px;

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
    margin-top: 3px;
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

// ── 漢堡開啟時的全寬下拉選單 ──────────────────────────────
.header10_panel {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--color-border);
  padding: 20px 4.1667vw;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
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
  color: $web_font_color;
  border-bottom: 1px solid var(--color-border);
  transition: color 0.3s;

  &:hover { color: $web_header_2; }
}

.mb_navmenu_sub {
  padding: 0 0 0 16px;

  a {
    display: block;
    padding: 8px 4px;
    font-size: 14px;
    color: $web_font_color;

    &:hover { color: $web_header_2; }
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
