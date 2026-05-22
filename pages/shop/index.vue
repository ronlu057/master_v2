<script setup>
// 線上購物 — 商品列表（購物類型專案；對應「購物系統白皮書」）
definePageMeta({ layout: 'shop' })

const route = useRoute()
const cart = useCartStore()

const { data: res } = await useApiData('/shop/products', {
  key: 'shop-products',
  query: { category: computed(() => route.query.category || '') },
  default: () => ({ items: [] }),
})
const products = computed(() => res.value?.items || [])

useSeoMeta({ title: '線上購物 — 母版專案' })
</script>

<template>
  <div class="container shop">
    <h1 class="shop__title">線上購物</h1>

    <LoadingState :empty="!products.length" empty-text="此分類目前沒有商品" />

    <div v-if="products.length" class="grid grid--4">
      <div v-for="p in products" :key="p.id" class="prod">
        <NuxtLink :to="`/shop/${p.blink}`" class="prod__media">
          <img :src="p.image" :alt="p.title" loading="lazy" />
        </NuxtLink>
        <div class="prod__body">
          <NuxtLink :to="`/shop/${p.blink}`">
            <h3 class="prod__name">{{ p.title }}</h3>
          </NuxtLink>
          <p class="prod__price">
            <span class="prod__now">NT$ {{ p.price.toLocaleString() }}</span>
            <span v-if="p.origin_price > p.price" class="prod__origin">
              NT$ {{ p.origin_price.toLocaleString() }}
            </span>
          </p>
          <button class="btn btn--primary prod__btn" @click="cart.add(p)">
            加入購物車
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shop {
  padding: 40px 20px 80px;

  &__title {
    font-size: 28px;
    margin-bottom: 28px;
  }
}

.prod {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  &__media {
    display: block;
    aspect-ratio: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    padding: 16px;
  }

  &__name {
    font-size: 16px;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 8px 0 12px;
  }

  &__now {
    color: var(--color-primary);
    font-size: 18px;
    font-weight: 700;
  }

  &__origin {
    color: var(--color-text-muted);
    font-size: 13px;
    text-decoration: line-through;
  }

  &__btn {
    width: 100%;
    padding: 9px;
    font-size: 14px;
  }
}
</style>
