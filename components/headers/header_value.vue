<script setup>
// 頁首版型 — VALUE 佳質食品風格（白色浮動圓角列）
// 依截圖切版；精確數值可再依 Figma Dev Mode 調整。
const { isMinimal } = useProject()
const ui = useUiStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()

const langs = ['中文', 'English']
const currentLang = ref('中文')
const langOpen = ref(false)
function pickLang(l) {
  currentLang.value = l
  langOpen.value = false
}
</script>

<template>
  <header class="header-value">
    <div class="container">
      <div class="header-value__bar">
        <!-- Logo -->
        <NuxtLink to="/" class="header-value__logo">
          <img src="/img/icon/Logo.svg" alt="佳質食品" />
        </NuxtLink>

        <!-- 主選單 -->
        <SiteMenu v-if="!isMinimal" :items="menuData.header" class="header-value__nav" />

        <!-- 右側功能區 -->
        <div class="header-value__right">
          <!-- 語言切換 -->
          <div class="header-value__lang">
            <button
              class="header-value__lang-btn"
              :class="{ 'is-open': langOpen }"
              @click="langOpen = !langOpen"
            >
              {{ currentLang }}
              <span class="header-value__caret" />
            </button>
            <transition name="drop">
              <ul v-show="langOpen" class="header-value__lang-menu">
                <li v-for="l in langs" :key="l">
                  <button :class="{ 'is-active': l === currentLang }" @click="pickLang(l)">
                    {{ l }}
                  </button>
                </li>
              </ul>
            </transition>
          </div>

          <!-- LINE -->
          <a
            v-if="firmData.firm.social?.line"
            :href="firmData.firm.social.line"
            target="_blank"
            rel="noopener"
            class="header-value__line"
            aria-label="LINE"
          >
            <img src="/img/icon/line_icon.svg" alt="LINE" />
          </a>

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
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 18px 0;

  &__bar {
    display: flex;
    align-items: center;
    gap: 28px;
    background: #fff;
    border-radius: 999px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
    padding: 15px 44px 15px 56px;
    min-height: 90px;
  }

  &__logo {
    flex-shrink: 0;
    display: block;

    img {
      height: 60px;
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
    gap: 12px;
    flex-shrink: 0;
  }

  /* 語言切換 */
  &__lang {
    position: relative;
  }

  &__lang-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 9px 20px;
    font-size: 14px;
    font-weight: 600;
  }

  &__caret {
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translate(-1px, -1px);
    transition: transform var(--transition);
  }

  &__lang-btn.is-open &__caret {
    transform: rotate(-135deg) translate(-1px, -1px);
  }

  &__lang-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 120px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;

    button {
      display: block;
      width: 100%;
      padding: 11px 16px;
      background: none;
      border: none;
      text-align: center;
      font-size: 14px;

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

    img {
      width: 44px;
      height: 44px;
      display: block;
    }
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
    margin-top: 10px;
    background: #fff;
    border-radius: 20px;
    box-shadow: var(--shadow);
    padding: 10px 28px;
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
@media (max-width: 1200px) {
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

@media (max-width: 560px) {
  .header-value__bar {
    padding: 10px 14px 10px 20px;
    min-height: 64px;
  }
  .header-value__logo img {
    height: 40px;
  }
}
</style>
