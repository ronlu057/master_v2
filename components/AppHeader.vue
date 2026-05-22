<script setup>
// 全站頁首 — 依專案類型調整：臨時站(minimal) 只顯示 Logo + 聯絡鈕
const { label, isShop, isMinimal } = useProject()
const ui = useUiStore()
const appConfig = useAppConfig()
const { data: menuData } = useSiteMenu()
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <NuxtLink to="/" class="header__logo">
        {{ appConfig.site.name }}
        <span class="header__badge">{{ label }}</span>
      </NuxtLink>

      <!-- 一般模式：完整選單 -->
      <template v-if="!isMinimal">
        <SiteMenu :items="menuData.header" class="header__nav" />

        <div class="header__actions">
          <NuxtLink to="/search" class="header__icon" aria-label="搜尋">🔍</NuxtLink>
          <NuxtLink v-if="isShop" to="/shop" class="header__icon" aria-label="線上購物">🛍️</NuxtLink>
          <button class="header__toggle" aria-label="開啟選單" @click="ui.toggleMenu">☰</button>
        </div>
      </template>

      <!-- 臨時站：精簡模式 -->
      <NuxtLink v-else to="/contact" class="btn btn--primary header__cta">
        聯絡我們
      </NuxtLink>
    </div>

    <!-- 行動版下拉選單 -->
    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="header__mobile">
        <SiteMenu :items="menuData.mobile" mobile @navigate="ui.closeMenu" />
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-h);
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 800;
    color: var(--color-heading);
  }

  &__badge {
    padding: 2px 10px;
    border-radius: 99px;
    background: var(--color-primary);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }

  &__nav {
    margin-left: auto;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 24px;
  }

  &__icon {
    font-size: 18px;
  }

  &__toggle {
    display: none;
    font-size: 24px;
    background: none;
    border: none;
    line-height: 1;
  }

  &__mobile {
    display: none;
    border-top: 1px solid var(--color-border);
    padding: 8px 20px 16px;
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

@media (max-width: 860px) {
  .header__nav {
    display: none;
  }
  .header__toggle {
    display: block;
  }
  .header__mobile {
    display: block;
  }
}
</style>
