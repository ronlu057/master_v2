<script setup>
// 頁首版型 — VALUE 佳質食品風格（白色浮動圓角列）
// 依截圖切版；精確數值可再依 Figma Dev Mode 調整。
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>
const { isMinimal } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

// 語系切換（@nuxtjs/i18n）— 清單來自 nuxt.config.js i18n.locales
// 此版型用「點 button 開合」風格（其他 header 用 hover），故保留 langOpen 狀態
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)
const currentLang = computed(
  () => languages.value.find((l) => l.code === locale.value)?.label || locale.value,
)
const langOpen = ref(false)
function pickLang(code) {
  setLocale(code)
  langOpen.value = false
}

const socials = useSocials()
</script>

<template>
  <header class="header-value">
    <div class="container">
      <div class="header-value__bar">
        <!-- Logo -->
        <NuxtLink to="/" class="header-value__logo">
          <SiteLogo alt="佳質食品" />
        </NuxtLink>

        <!-- 右側功能區 -->
        <div class="header-value__right">
          <!-- 主選單 -->
          <SiteMenu v-if="!isMinimal" :items="menuData.header" class="header-value__nav" />

          <!-- 搜尋 -->
          <NuxtLink
            v-if="navtool.isEnabled('search')"
            to="/search"
            class="header-value__icon-btn"
            :style="{ order: navtool.orderOf('search') }"
            aria-label="搜尋"
          >
            <i v-if="navtool.showsIcon('search')" class="icon icon-search"></i>
            <span v-if="navtool.showsText('search')" class="navtool_text">{{ navtool.textOf('search') }}</span>
          </NuxtLink>

          <!-- 語言切換（剩 1 個語系時隱藏） -->
          <div
            v-if="navtool.isEnabled('language') && languages.length > 1"
            class="header-value__lang"
            :style="{ order: navtool.orderOf('language') }"
          >
            <button
              class="header-value__lang-btn"
              :class="{ 'is-open': langOpen }"
              @click="langOpen = !langOpen"
            >
              <span v-if="navtool.showsText('language')" class="navtool_text">{{ navtool.textOf('language') }}</span>
              {{ currentLang }}
              <i v-if="navtool.showsIcon('language')" class="icon icon-arrow header-value__caret"></i>
            </button>
            <transition name="drop">
              <ul v-show="langOpen" class="header-value__lang-menu">
                <li v-for="lang in languages" :key="lang.code">
                  <button
                    :class="{ 'is-active': lang.code === locale }"
                    @click="pickLang(lang.code)"
                  >
                    {{ lang.label }}
                  </button>
                </li>
              </ul>
            </transition>
          </div>

          <!-- 社群（一排平鋪） -->
          <div
            v-if="navtool.isEnabled('social') && socials.length"
            class="header-value__social"
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
            class="header-value__icon-btn"
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
            class="header-value__icon-btn"
            :style="{ order: navtool.orderOf('cart') }"
            aria-label="購物車"
          >
            <i v-if="navtool.showsIcon('cart')" class="icon icon-shopcart"></i>
            <span v-if="navtool.showsText('cart')" class="navtool_text">{{ navtool.textOf('cart') }}</span>
            <span v-if="cart.count" class="header-value__cart-badge">{{ cart.count }}</span>
          </NuxtLink>

          <!-- 我的最愛 -->
          <NuxtLink
            v-if="navtool.isEnabled('favorite')"
            to="/shop/favorite"
            class="header-value__icon-btn"
            :style="{ order: navtool.orderOf('favorite') }"
            aria-label="我的最愛"
          >
            <i v-if="navtool.showsIcon('favorite')" class="icon icon-like"></i>
            <span v-if="navtool.showsText('favorite')" class="navtool_text">{{ navtool.textOf('favorite') }}</span>
          </NuxtLink>

          <!-- 行動版選單鈕 -->
          <button class="header-value__toggle" aria-label="開啟選單" @click="ui.toggleMenu">☰</button>
        </div>
      </div>

      <!-- 行動版下拉選單 -->
      <transition name="drop">
        <nav v-if="ui.menuOpen && !isMinimal" class="header-value__mobile">
          <SiteMenu :items="menuData.mobile" mobile @navigate="ui.closeMenu" />
        </nav>
      </transition>
    </div>
  </header>
</template>

<style lang="scss" scoped>
$red: #bf3131;

.header-value {
  width: 100%;
  height: fluid(80);
  position: fixed;
  top: fluid(23);
  z-index: 50;

  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: fluid(28);
    background: #fff;
    border-radius: fluid(999);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
    padding: 0 fluid(50);
    min-height: fluid(80);
  }

  &__logo {
    flex-shrink: 0;
    display: block;

    img {
      height: fluid(64);
      width: auto;
      display: block;
    }
  }

  &__nav {
    margin: 0 auto;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: fluid(12);
    flex-shrink: 0;
  }

  /* 語言切換 */
  &__lang {
    position: relative;
  }

  &__lang-btn {
    width: auto;
    height: fluid(32);
    display: flex;
    align-items: center;
    gap: fluid(8);
    background: #BF3131;
    color: #fff;
    border: none;
    border-radius: fluid(999);
    padding: 0 fluid(16);
    font-size: fluid-fz(16);
    font-weight: 500;
  }

  &__caret {
    font-size: fluid-fz(12);
    transition: transform var(--transition);
  }

  &__lang-btn.is-open &__caret {
    transform: rotate(180deg);
  }

  &__lang-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: fluid(120);
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: fluid(12);
    box-shadow: var(--shadow-lg);
    overflow: hidden;

    button {
      display: block;
      width: 100%;
      padding: fluid(11) fluid(16);
      background: none;
      border: none;
      text-align: center;
      font-size: fluid-fz(14);

      &:hover,
      &.is-active {
        color: $red;
        background: var(--color-surface);
      }
    }
  }

  /* LINE */
  &__line {
    display: block;
    flex-shrink: 0;
    color: $red;

    .icon { font-size: fluid-fz(38); }
  }

  /* 行動版 */
  &__toggle {
    display: none;
    background: none;
    border: none;
    font-size: 26px;
    line-height: 1;
  }

  &__mobile {
    display: none;
    margin-top: fluid(10);
    background: #fff;
    border-radius: fluid(20);
    box-shadow: var(--shadow);
    padding: fluid(10) fluid(28);
  }
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}

/* 1200 為 header 變更樣式主斷點 */
@include rwd-1200 {
  .header-value__nav {
    display: none;
  }
  .header-value__toggle {
    display: block;
  }
  .header-value__mobile {
    display: block;
  }
}

@include rwd-480 {
  .header-value__bar {
    padding: 10px 14px 10px 20px;
    min-height: 64px;
  }
  .header-value__logo img {
    height: 40px;
  }
}
</style>
