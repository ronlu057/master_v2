<script setup>
const { label, isShop, isMinimal } = useProject()
const ui = useUiStore()
const appConfig = useAppConfig()
const cart = useCartStore()
const { data: menuData } = useSiteMenu()
const { data: firmData } = useSiteFirm()

const keyword = ref('')
const onSearch = () => {
  if (!keyword.value.trim()) return
  navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
}

const headerEl = ref(null)
const isScrolled = ref(false)

const updateScrollState = () => {
  if (!headerEl.value) return
  const headerH = headerEl.value.offsetHeight
  const banner = document.querySelector('[class^="banner"]')
  const bannerH = banner ? banner.offsetHeight : 0
  const scrollH = Math.max(0, bannerH - headerH)
  isScrolled.value = window.scrollY >= scrollH
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
  <header ref="headerEl" :class="['header01', { scroll: isScrolled }]">
    <NuxtLink class="logo" to="/" title="回首頁">
      {{ firmData?.firm?.title || appConfig.site.name }}
      <span class="logo__badge">{{ label }}</span>
    </NuxtLink>

    <div class="navbar">
      <nav v-if="!isMinimal" itemscope itemtype="https://www.schema.org/SiteNavigationElement">
        <SiteMenu :items="menuData.header" class="navmenu" />
      </nav>

      <div class="navtool">
        <template v-if="!isMinimal">
          <div class="search_btn">
            <form class="search_form" @submit.prevent="onSearch">
              <input
                v-model="keyword"
                type="text"
                autocomplete="off"
                placeholder="網站搜尋..."
                aria-label="網站搜尋"
              />
              <button type="submit" aria-label="搜尋">🔍</button>
            </form>
          </div>

          <NuxtLink v-if="isShop" class="cart_btn" to="/shop/cart" aria-label="購物車">
            🛍️
            <p v-if="cart.count">{{ cart.count }}</p>
          </NuxtLink>
        </template>

        <NuxtLink v-else to="/contact" class="btn btn--primary">聯絡我們</NuxtLink>

        <button
          v-if="!isMinimal"
          class="mbPanel_btn"
          aria-label="開啟選單"
          @click="ui.toggleMenu"
        >
          <span class="bars">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </span>
        </button>
      </div>
    </div>

    <transition name="drop">
      <nav v-if="ui.menuOpen && !isMinimal" class="mb_panel">
        <SiteMenu :items="menuData.mobile" mobile @navigate="ui.closeMenu" />
      </nav>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.header01 {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
  height: var(--header-h);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow);
  transition: background var(--transition), box-shadow var(--transition);

  &.scroll {
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(6px);
    box-shadow: var(--shadow-lg);
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-heading);

  &__badge {
    padding: 2px 10px;
    border-radius: 99px;
    background: var(--color-primary);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
}

.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.navmenu {
  display: flex;
}

.navtool {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
}

.search_btn .search_form {
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    padding: 6px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 14px;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
}

.cart_btn {
  position: relative;
  display: inline-flex;
  align-items: center;

  p {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }
}

.mbPanel_btn {
  display: none;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;

  .bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bar {
    width: 22px;
    height: 2px;
    background: var(--color-heading);
  }
}

.mb_panel {
  position: absolute;
  top: var(--header-h);
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 8px 20px 16px;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .header01 {
    height: 64px;
  }
  .logo {
    font-size: 18px;
  }
}

@media (max-width: 860px) {
  .navmenu,
  .search_btn {
    display: none;
  }
  .mbPanel_btn {
    display: block;
  }
}
</style>
