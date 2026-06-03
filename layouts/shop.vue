<script setup>
// 購物類型專用版型 — 多一條商品分類列與購物車入口
const cart = useCartStore()
</script>

<template>
  <div class="site site--shop">
    <AppHeader />

    <nav class="shop-bar">
      <div class="container shop-bar__inner">
        <ul class="shop-bar__cats">
          <li><NuxtLink to="/shop">全部商品</NuxtLink></li>
          <li><NuxtLink to="/shop?category=new">新品上市</NuxtLink></li>
          <li><NuxtLink to="/shop?category=hot">熱賣推薦</NuxtLink></li>
          <li><NuxtLink to="/shop?category=sale">優惠專區</NuxtLink></li>
        </ul>
        <NuxtLink to="/shop/cart" class="shop-bar__cart">
          🛒 購物車
          <span v-if="cart.count" class="shop-bar__badge">{{ cart.count }}</span>
        </NuxtLink>
      </div>
    </nav>

    <main class="site__main">
      <slot />
    </main>

    <AppFooter />
    <PopupAds />
    <ClientOnly>
      <AdminPreviewBar />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.site {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1 0 auto;
  }
}

.shop-bar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
  }

  &__cats {
    display: flex;
    gap: 24px;

    a {
      font-size: 14px;
      &:hover { color: var(--color-primary); }
    }
  }

  &__cart {
    position: relative;
    font-size: 14px;
    font-weight: 600;
  }

  &__badge {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--color-primary);
    color: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 18px;
  }
}
</style>
