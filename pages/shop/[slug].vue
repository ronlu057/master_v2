<script setup>
// 商品詳細頁（購物類型專案）
definePageMeta({ layout: 'shop' })

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const { data: product } = await useApiData('/shop/product', {
  key: 'shop-product',
  query: { blink: computed(() => route.params.slug) },
  default: () => null,
})

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到商品', fatal: true })
}

const qty = ref(1)
const added = ref(false)

function addToCart() {
  cart.add(product.value, qty.value)
  added.value = true
  setTimeout(() => (added.value = false), 2000)
}
function buyNow() {
  cart.add(product.value, qty.value)
  router.push('/shop/cart')
}

useSeoMeta({ title: `${product.value.title} — 母版專案` })
</script>

<template>
  <div v-if="product" class="container detail">
    <nav class="breadcrumb">
      <NuxtLink to="/">首頁</NuxtLink>
      <span>/</span>
      <NuxtLink to="/shop">線上購物</NuxtLink>
      <span>/</span>
      <span>{{ product.title }}</span>
    </nav>

    <div class="detail__grid">
      <div class="detail__media">
        <img :src="product.image" :alt="product.title" />
      </div>

      <div class="detail__info">
        <h1 class="detail__name">{{ product.title }}</h1>
        <p class="detail__summary">{{ product.summary }}</p>

        <p class="detail__price">
          <span class="detail__now">NT$ {{ product.price.toLocaleString() }}</span>
          <span v-if="product.origin_price > product.price" class="detail__origin">
            NT$ {{ product.origin_price.toLocaleString() }}
          </span>
        </p>

        <div class="detail__qty">
          <span>數量</span>
          <button @click="qty = Math.max(1, qty - 1)">−</button>
          <input v-model.number="qty" type="number" min="1" />
          <button @click="qty++">＋</button>
        </div>

        <div class="detail__actions">
          <button class="btn btn--outline" @click="addToCart">加入購物車</button>
          <button class="btn btn--primary" @click="buyNow">立即購買</button>
        </div>

        <p v-if="added" class="detail__added">✓ 已加入購物車</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.detail {
  padding-bottom: 80px;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }

  &__media img {
    width: 100%;
    border-radius: var(--radius-lg);
  }

  &__name {
    font-size: 28px;
  }

  &__summary {
    color: var(--color-text-muted);
    margin: 12px 0 20px;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__now {
    color: var(--color-primary);
    font-size: 28px;
    font-weight: 800;
  }

  &__origin {
    color: var(--color-text-muted);
    text-decoration: line-through;
  }

  &__qty {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;

    button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-bg);
      font-size: 18px;
    }

    input {
      width: 64px;
      height: 36px;
      text-align: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
  }

  &__added {
    margin-top: 14px;
    color: #1b7f4d;
  }
}

@include rwd-768 {
  .detail__grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
