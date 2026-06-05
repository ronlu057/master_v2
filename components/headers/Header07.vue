<script setup>
// 頁首版型 07 — 補習班專用（含倒數計時）
// 特色：navtool 內含「會考 / 學測 / 分科」三個倒數天數 box（從 firm.exam_countdown 取）
//      桌面版兩行顯示「{年} 年 {名稱} ／ 倒數 {天} 天」
//      行動版單行顯示「{名稱} 倒數 {天} 天」
//
// 原始檔：D:\www\master_dev\template\module\header\header07.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header07.scss
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

// 倒數陣列（過濾掉 days = 0 的）
const examCountdown = computed(() =>
  (firmData.value?.firm?.exam_countdown || []).filter((e) => e.days > 0),
)

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
  <header ref="headerEl" :class="['header07', { scroll: isScrolled }]">
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

        <!-- 三個倒數 box -->
        <div v-if="examCountdown.length" class="three_box">
          <!-- 桌面版（每個 exam 一個 .pc box） -->
          <div
            v-for="exam in examCountdown"
            :key="`pc-${exam.label}`"
            class="pc"
          >
            <p class="pc">{{ exam.year }}年 <span>{{ exam.label }}</span></p>
            <p class="pc">倒數 <span>{{ exam.days }}</span> 天</p>
            <p class="mb">{{ exam.label }}倒數</p>
            <p class="mb"><span>{{ exam.days }}</span>天</p>
          </div>

          <!-- 行動版單一 box（單行列出全部 exam） -->
          <div class="mb">
            <p
              v-for="exam in examCountdown"
              :key="`mb-${exam.label}`"
            >
              {{ exam.label }}倒數 <span>{{ exam.days }}</span> 天
            </p>
          </div>
        </div>

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
    <nav v-if="ui.menuOpen && !isMinimal" class="header07_panel">
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
.header07 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 0 0 calc(80 / 19.2 * 1vw);
  background: #fff;
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1440 { padding: 0 0 0 calc(48 / 19.2 * 1vw); }
  @include rwd-1200 { padding: 0 0 0 30px; }
  @include rwd-768  { padding: 0 0 0 15px; }
  @include rwd-480  { padding: 0 0 0 5px; }
}

.logo {
  display: block;

  @include rwd-1200 { margin-right: 15px; }
  @include rwd-480  { margin-right: 5px; }

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
    position: relative;

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
      padding: 23px 15px;
      transition: all 0.3s;

      @include rwd-1280 { padding: 23px 10px; }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_1;
    }

    // 下拉子選單 — 樣式參考 Header02（置中、popup 淡入、hover 主色底）
    .navmenu_sub {
      position: absolute;
      top: 100%;
      left: 50%;
      min-width: 160px;
      padding: 6px;
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
        font-size: 14px;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.3s;

        &:hover,
        &.router-link-active {
          background: var(--color-surface);
          color: $web_header_1;
        }
      }
    }

    &:hover > .navmenu_sub {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }
}

.navtool {
  display: flex;

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

      &:not(.three_box):not(.mbPanel_btn) { display: none; }
    }

    color: $web_font_color;
    transition: all 0.3s;

    > .icon { font-size: 20px; }

    &:hover { color: $web_header_1; }
  }

  // 語系下拉 — 樣式參考 Header02
  .lang_toggle .lang_box {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    padding: 6px;
    background: #fff;
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
        color: $web_header_1;
      }

      &.is-active {
        color: $web_header_1;
        font-weight: 600;
      }
    }
  }

  .lang_toggle:hover .lang_box {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  // 三個倒數 box
  .three_box {
    align-items: unset;
    width: max-content;
    padding: 0;
    margin-left: 10px;
    cursor: unset;

    // 桌面排到 navtool 最右（搜尋等 icon 之後）；手機維持原樣（漢堡在最右）
    @media (min-width: 1201px) { order: 90; }

    @include rwd-1280 { margin-left: 5px; }

    > div {
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      justify-content: center;
      text-align: center;

      &:nth-child(odd)  { background: #efefef; }
      &:nth-child(even) { background: #e6e6e6; }

      // 桌面顯示（每個 exam 一個 box）
      &.pc {
        line-height: 1.2;
        padding: 0 20px;

        @include rwd-1440 {
          line-height: 1.3;
          padding: 0 13px;
        }
        @include rwd-480 { display: none; }

        p {
          &.pc { @include rwd-1440 { display: none; } }
          &.mb { @media (min-width: 1441px) { display: none; } }
        }

        p:nth-child(odd) {
          color: $web_font_color;
          font-size: 13px;
          font-weight: 500;

          span {
            color: #d62020;
            font-size: 15px;
            font-weight: 700;
          }
        }

        p:nth-child(even) {
          color: $web_font_color;
          font-size: 16px;
          font-weight: 500;

          @include rwd-1440 { font-size: 13px; }

          span {
            color: #d62020;
            font-size: 24px;
            font-weight: 700;

            @include rwd-1440 { font-size: 18px; }
          }
        }
      }

      // 行動版顯示（合併在單一 box 內列出全部 exam）
      &.mb {
        padding: 0 10px;

        @media (min-width: 481px) { display: none; }

        p {
          color: $web_font_color;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;

          span {
            color: #d62020;
            font-size: 16px;
            font-weight: 700;
          }
        }
      }
    }
  }

  // 漢堡
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
.header07_panel {
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
