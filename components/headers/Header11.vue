<script setup>
// 頁首版型 11 — 左 sidebar + 主 header bar 雙層型（主體）
// 結構：左側 120px sidebar（Header11_sp 元件處理） + 右側主 header bar（本檔）
// 點 sidebar 漢堡 → 全螢幕 panel 浮起、主 header 隱藏
//
// 原始檔：D:\www\master_dev\template\module\header\header11.{php,js}
//        D:\www\master_dev\template\css\scss\module\header\_header11.scss
// 配合：Header11_sp.vue（左 sidebar + 全螢幕 panel + WebGL 波浪背景）
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

// 搜尋（hover 下拉表單，同 Header01）
const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

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
  <!-- 主 header bar（panel 開啟時隱藏；對應原 jQuery .toggle()） -->
  <header
    v-show="!ui.menuOpen"
    ref="headerEl"
    :class="['header11', { scroll: isScrolled }]"
  >
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

      <!-- 工具列 -->
      <div v-if="!isMinimal" class="navtool">
        <!-- 搜尋（hover 下拉表單，樣式同 Header01） -->
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

        <!-- 語系（參考 Header01：.lang_box + button.lang_item，div 結構不用 ul/li） -->
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
    </div>
  </header>

  <!-- 行動版漢堡（< 1201 才顯示，跟 Header11_sp 的桌面 sidebar 區隔） -->
  <button
    v-if="!isMinimal"
    type="button"
    :class="['mbPanel11_btn', { active: ui.menuOpen }]"
    :aria-label="$t('aria.menu')"
    @click="ui.toggleMenu"
  >
    <span class="bars">
      <span class="bar bar1"></span>
      <span class="bar bar2"></span>
      <span class="bar bar3"></span>
    </span>
  </button>

  <!-- 全螢幕 panel + 左 sidebar 在獨立元件 -->
  <Header11Sp />
</template>

<style lang="scss" scoped>
.header11 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: fluid(120);
  width: calc(100% - 120px);
  height: fluid(70);
  padding: 0 fluid(40);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0);
  z-index: $z_header;
  transition: all 0.3s;

  @include rwd-1200 {
    left: 0;
    width: 100%;
    padding: 0 70px 0 25px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }

  &.scroll {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);

    @media (min-width: 1201px) {
      background: #fff;
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

.navmenu {
  display: flex;
  list-style: none;
  margin-left: fluid(25);
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    display: flex;
    align-items: center;
    position: relative;
    height: fluid(70);
    padding: 0 fluid(25);
    transition: all 0.3s;

    @include rwd-1680 { padding: 0 15px; }
    @include rwd-1280 { padding: 0 10px; }

    > a {
      display: block;
      color: $web_font_color;
      font-size: fluid-fz(16);
      font-weight: 500;
      background-image: linear-gradient(to right, $web_header_2 0%, $web_header_2 100%);
      background-size: 0% 2px;
      background-position: center bottom;
      background-repeat: no-repeat;
      transition: all 0.3s;

      @include rwd-1440 { font-size: 15px; }
      @include rwd-1280 { font-size: 14px; }
    }

    &:hover > a,
    > a.router-link-active {
      color: $web_header_2;
      background-size: 100% 2px;
    }

    > .navmenu_sub {
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

.navtool {
  display: flex;
  align-items: center;
  margin-left: fluid(25);

  @include rwd-1200 { display: none; }

  // 每個工具項（搜尋 / 語系 / 社群 / 會員 / 購物車 / 最愛）— 直接子元素，不用 li
  > * {
    display: flex;
    align-items: center;
    position: relative;
    height: fluid(70);
    color: $web_font_color;
    cursor: pointer;
    transition: all 0.3s;

    .icon { font-size: fluid-fz(18); }

    // 項目間距 + 分隔線
    & + * {
      margin-left: fluid(30);

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: fluid(-16);
        width: 2px;
        height: fluid(22);
        background: $web_font_color;
        transform: translateY(-50%);
      }
    }

    &:hover { color: $web_header_2; }
  }

  // 社群一排平鋪
  .navtool_social {
    gap: 0 fluid(14);

    a {
      color: $web_font_color;
      transition: all 0.3s;

      &:hover { color: $web_header_2; }
    }
  }

  // 搜尋下拉 — 樣式與 Header01 統一
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

  // 購物車徽章
  .cart_btn p {
    position: absolute;
    top: fluid(16);
    right: fluid(-10);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: fluid(16);
    height: fluid(16);
    padding: 0 fluid(4);
    color: #fff;
    font-size: fluid-fz(11);
    line-height: 1;
    background: $web_header_2;
    border-radius: fluid(8);
  }
}

// ── 行動版漢堡 ───────────────────────────────────────────
.mbPanel11_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  right: 0;
  width: fluid(70);
  height: fluid(70);
  background: none;
  border: none;
  cursor: pointer;
  z-index: $z_mbPanel_btn;
  transition: all 0.3s;

  @media (min-width: 1201px) { display: none; }

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
      background: $web_header_1;
      transition:
        top 0.3s 0.3s,
        width 0.3s 0.3s,
        transform 0.3s,
        background 0.3s;
    }

    .bar2 {
      width: 66.67%;
      margin: 0 0 0 auto;
    }
  }

  &.active .bars .bar {
    background: #fff;
    transition:
      top 0.3s,
      width 0.3s,
      transform 0.3s 0.3s,
      background 0.3s;

    &.bar1 {
      top: fluid(8);
      transform: rotate(-25deg);
    }
    &.bar2 { width: 0%; }
    &.bar3 {
      top: fluid(-8);
      transform: rotate(25deg);
    }
  }
}
</style>
