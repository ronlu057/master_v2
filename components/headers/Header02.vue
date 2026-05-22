<script setup>
// 頁首版型 02 — 置中型（Logo 置中、選單置於下方一列）
const { label, isShop, isMinimal } = useProject()
const ui = useUiStore()
const appConfig = useAppConfig()
const { data: menuData } = useSiteMenu()
</script>

<template>
  <header class="header2">
    <div class="header2__bar">
      <div class="container header2__bar-inner">
        <button
          v-if="!isMinimal"
          class="header2__toggle"
          aria-label="開啟選單"
          @click="ui.toggleMenu"
        >
          ☰
        </button>

        <NuxtLink to="/" class="header2__logo">
          {{ appConfig.site.name }}
          <span class="header2__badge">{{ label }}</span>
        </NuxtLink>

        <div class="header2__actions">
          <template v-if="!isMinimal">
            <NuxtLink to="/search" aria-label="搜尋">🔍</NuxtLink>
            <NuxtLink v-if="isShop" to="/shop" aria-label="線上購物">🛍️</NuxtLink>
          </template>
          <NuxtLink v-else to="/contact" class="btn btn--primary">聯絡我們</NuxtLink>
        </div>
      </div>
    </div>

    <!-- 選單列（置中） -->
    <nav v-if="!isMinimal" class="header2__navrow">
      <SiteMenu :items="menuData.header" />
    </nav>

    <!-- 行動版下拉選單 -->
    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="header2__mobile">
        <SiteMenu :items="menuData.mobile" mobile @navigate="ui.closeMenu" />
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.header2 {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow);

  &__bar-inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    height: var(--header-h);
  }

  &__toggle {
    display: none;
    justify-self: start;
    font-size: 24px;
    background: none;
    border: none;
    line-height: 1;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-self: center;
    font-size: 22px;
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

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-self: end;
    font-size: 18px;
  }

  &__navrow {
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--color-border);
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
  .header2__navrow {
    display: none;
  }
  .header2__toggle {
    display: block;
  }
  .header2__mobile {
    display: block;
  }
}
</style>
