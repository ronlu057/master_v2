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
const languages = computed(() =>
  locales.value.map((l) => ({ code: l.code, label: l.name })),
)

const socials = useSocials()

// 搜尋
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
  <!-- 主 header bar（panel 開啟時隱藏；對應原 jQuery .toggle()） -->
  <header
    v-show="!ui.menuOpen"
    ref="headerEl"
    :class="['header11', { scroll: isScrolled }]"
  >
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <img src="/img/logo/logo-AD.svg" alt="Logo" />
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
          <a href="javascript:;" :aria-label="$t('aria.language')">
            <i class="icon icon-language"></i>
          </a>
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
  left: 120px;
  width: calc(100% - 120px);
  height: 70px;
  padding: 0 40px;
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

  img { max-height: 60px; }
}

.navbar {
  display: flex;
  align-items: center;
}

.navmenu {
  display: flex;
  list-style: none;
  margin-left: 25px;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    display: flex;
    align-items: center;
    position: relative;
    height: 70px;
    padding: 0 25px;
    transition: all 0.3s;

    @include rwd-1680 { padding: 0 15px; }
    @include rwd-1280 { padding: 0 10px; }

    > a {
      display: block;
      color: $web_font_color;
      font-size: 16px;
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

    > ul {
      position: absolute;
      top: 100%;
      left: 50%;
      width: max-content;
      list-style: none;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 0);
      transition: all 0.3s;

      li {
        position: relative;

        & + li { border-top: 1px solid #d9e2e2; }

        a {
          display: block;
          color: $web_font_color;
          font-size: 14px;
          text-align: center;
          padding: 10px 38px;
          background: #fff;
          transition: all 0.3s;
        }

        &:hover > a,
        > a.router-link-active {
          color: #fff;
          background: $web_header_2;
        }
      }
    }

    &:hover > ul {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.navtool {
  display: flex;
  list-style: none;
  margin-left: 25px;
  padding: 0;

  @include rwd-1200 { display: none; }

  > li {
    display: flex;
    align-items: center;
    position: relative;
    height: 70px;

    & + li {
      margin-left: 30px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -16px;
        width: 2px;
        height: 22px;
        background: $web_font_color;
        transform: translateY(-50%);
      }
    }

    > a {
      display: block;

      color: $web_font_color;
      transition: all 0.3s;

      .icon { font-size: 18px; }
    }

    &:hover > a {
      color: $web_header_2;
    }

    ul {
      position: absolute;
      top: 100%;
      left: 50%;
      width: max-content;
      list-style: none;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 0);
      transition: all 0.3s;

      li {
        & + li { border-top: 1px solid #d9e2e2; }

        a {
          display: block;
          color: $web_font_color;
          font-size: 14px;
          text-align: center;
          padding: 10px 15px;
          background: #fff;
          transition: all 0.3s;

          &:hover,
          &.active {
            color: #fff;
            background: $web_header_2;
          }
        }
      }
    }

    &:hover ul {
      opacity: 1;
      pointer-events: auto;
    }
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
  width: 70px;
  height: 70px;
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
    width: 30px;
    height: 18px;

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
      top: 8px;
      transform: rotate(-25deg);
    }
    &.bar2 { width: 0%; }
    &.bar3 {
      top: -8px;
      transform: rotate(25deg);
    }
  }
}
</style>
