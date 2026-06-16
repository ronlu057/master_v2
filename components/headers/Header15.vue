<script setup>
// 頁首版型 15 — 雙列浮動圓鈕型
// 特色：透明 header 浮在 .header15_bg 白底層之上；圓形按鈕風格；
//      捲動超過 banner 後 header 跟 bg 同步加 .scroll class（陰影出現）
//
// 原始 PHP / JS / SCSS：D:\www\master_dev\template\module\header\header15.{php,js}
//                       D:\www\master_dev\template\css\scss\module\header\_header15.scss
// icon 全站走 .icon 字型法（assets/styles/icons.scss）：<i class="icon icon-XXX"></i>

const { isMinimal, enableShop } = useProject()
const ui = useUiStore()
const cart = useCartStore()
const { data: firmData } = useSiteFirm()
const navtool = useNavtoolConfig()

// i18n（語系切換、翻譯字串）
const { locale, locales, setLocale } = useI18n()
const languages = useLangLabels((l) => l.name)

const socials = useSocials()

// CTA 動作按鈕：兩個外部連結（觀看菜單 / 線上點餐）— 從 firm 取
const ctaMenu = computed(() => firmData.value?.firm?.cta_menu || '')
const ctaOrder = computed(() => firmData.value?.firm?.cta_order || '')

// 捲動偵測：當 scrollTop ≥ banner高 − header高 → 加 .scroll
// 對應原 jQuery：if (scrollTop >= bannerH - headerH) addClass('scroll')
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
  <header ref="headerEl" :class="['header15', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" :title="$t('site.back_home')">
      <SiteLogo alt="Logo" />
    </NuxtLink>

    <div class="navbar">
      <!-- CTA 動作按鈕（觀看菜單 / 線上點餐） -->
      <div v-if="!isMinimal && (ctaMenu || ctaOrder)" class="navbtn">
        <div class="button_set center">
          <a
            v-if="ctaMenu"
            :href="ctaMenu"
            target="_blank"
            rel="noopener"
            class="button12 middle"
          >
            <span>{{ $t('cta.view_menu') }}</span>
          </a>
          <a
            v-if="ctaOrder"
            :href="ctaOrder"
            target="_blank"
            rel="noopener"
            class="button12 middle"
          >
            <span>{{ $t('cta.order_online') }}</span>
          </a>
        </div>
      </div>

      <!-- 工具列（順序 / 顯示由 useNavtoolConfig 控制） -->
      <div v-if="!isMinimal" class="navtool">
        <!-- 搜尋 -->
        <NuxtLink
          v-if="navtool.isEnabled('search')"
          class="search_btn"
          to="/search"
          :style="{ order: navtool.orderOf('search') }"
          :aria-label="$t('aria.search')"
        >
          <i class="icon icon-search"></i>
        </NuxtLink>

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
      </div>

      <!-- 行動版漢堡 -->
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
  </header>

  <!-- 浮動白底層（捲動後加陰影） -->
  <div :class="['header15_bg', { scroll: isScrolled }]"></div>

  <!-- 行動版下拉選單 -->
  <transition name="drop">
    <nav v-if="ui.menuOpen && !isMinimal" class="header15_mobile">
      <a
        v-if="ctaMenu"
        :href="ctaMenu"
        target="_blank"
        rel="noopener"
        @click="ui.closeMenu"
      >
        {{ $t('cta.view_menu') }}
      </a>
      <a
        v-if="ctaOrder"
        :href="ctaOrder"
        target="_blank"
        rel="noopener"
        @click="ui.closeMenu"
      >
        {{ $t('cta.order_online') }}
      </a>
    </nav>
  </transition>
</template>

<style lang="scss" scoped>
.header15 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 fluid(10);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  height: fluid(70);
  padding: 0 calc(80 / 19.2 * 1vw);
  z-index: $z_mbPanel_btn;

  @include rwd-1440 { padding: 0 calc(48 / 19.2 * 1vw); }
  @include rwd-1200 { padding: 0 30px; }
  @include rwd-768  { padding: 0 15px; }
  @include rwd-480  { padding: 0 8px; }

  .logo {
    display: block;

  }

  .navbar {
    display: flex;
    align-items: center;
    gap: 0 calc(45 / 19.2 * 1vw);

    .navbtn {
      @include rwd-1200 { display: none; }

      .button_set {
        display: flex;
        gap: fluid(12);
        margin-top: 0;
      }
    }

    .navtool {
      display: flex;
      gap: 0 fluid(15);

      @include rwd-768 { gap: 0 10px; }

      > div,
      > a {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: fluid(45);
        height: fluid(45);
        background: $web_header_1;
        border: 1px solid $web_header_1;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        @include rwd-1200 {
          &:not(.search_btn):not(.cart_btn) { display: none; }
        }
        @include rwd-768 {
          width: 40px;
          height: 40px;
        }

        color: #fff;
        transition: all 0.3s;

        > .icon { font-size: fluid-fz(20); }

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
          background: #fff;

          color: $web_header_1;

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
          bottom: fluid(-9);
          left: 50%;
          width: fluid(16);
          line-height: 14px;
          color: $web_font_color;
          font-size: fluid-fz(11);
          font-weight: 700;
          text-align: center;
          background: #fff;
          border: 1px solid $web_header_1;
          border-radius: 50%;
          transform: translateX(-50%);
        }
      }
    }

    .mbPanel_btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: fluid(60);
      height: fluid(60);
      background: $web_header_1;
      border: none;
      border-radius: 50%;
      cursor: pointer;

      @include rwd-768 {
        width: 55px;
        height: 55px;
      }

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
}

.header15_bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: fluid(70);
  background: #fff;
  z-index: $z_header;
  transition: box-shadow 0.3s;

  &.scroll {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }
}

// 行動版下拉（漢堡開啟時）
.header15_mobile {
  position: fixed;
  top: fluid(70);
  left: 0;
  right: 0;
  background: #fff;
  padding: fluid(16) fluid(20);
  display: flex;
  flex-direction: column;
  gap: fluid(12);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  z-index: $z_mobile_menu;

  a {
    display: block;
    padding: fluid(12) fluid(16);
    color: $web_font_color;
    background: rgba(0, 0, 0, 0.04);
    border-radius: fluid(8);
    font-size: 15px;
    text-align: center;
    transition: all 0.3s;

    &:hover {
      background: $web_header_1;
      color: #fff;
    }
  }
}

.drop-enter-active,
.drop-leave-active { transition: opacity 0.2s ease; }
.drop-enter-from,
.drop-leave-to { opacity: 0; }
</style>
