<script setup>
// 購物車（購物類型專案）— 結帳 / 金流流程對應「綠界整合白皮書」
definePageMeta({ layout: 'shop' })

const cart = useCartStore()

useSeoMeta({ title: '購物車 — 母版專案' })
</script>

<template>
  <div class="container cart">
    <h1 class="cart__title">購物車</h1>

    <div v-if="!cart.items.length" class="cart__empty">
      <p>購物車目前是空的。</p>
      <NuxtLink to="/shop" class="btn btn--primary">去逛逛</NuxtLink>
    </div>

    <div v-else class="cart__layout">
      <ul class="cart__list">
        <li v-for="item in cart.items" :key="item.id" class="cart-row">
          <img :src="item.image" :alt="item.title" class="cart-row__img" />
          <div class="cart-row__info">
            <NuxtLink :to="`/shop/${item.blink}`" class="cart-row__name">
              {{ item.title }}
            </NuxtLink>
            <p class="cart-row__price">NT$ {{ item.price.toLocaleString() }}</p>
          </div>
          <div class="cart-row__qty">
            <button @click="cart.setQty(item.id, item.qty - 1)">−</button>
            <span>{{ item.qty }}</span>
            <button @click="cart.setQty(item.id, item.qty + 1)">＋</button>
          </div>
          <p class="cart-row__sub">NT$ {{ (item.price * item.qty).toLocaleString() }}</p>
          <button class="cart-row__del" @click="cart.remove(item.id)">✕</button>
        </li>
      </ul>

      <aside class="cart__summary">
        <h2>訂單摘要</h2>
        <div class="cart__line">
          <span>商品件數</span>
          <span>{{ cart.count }} 件</span>
        </div>
        <div class="cart__line cart__line--total">
          <span>合計</span>
          <span>NT$ {{ cart.total.toLocaleString() }}</span>
        </div>
        <button class="btn btn--primary cart__checkout">前往結帳</button>
        <p class="cart__note">※ 結帳 / 金流 / 物流串接對應「綠界整合白皮書」。</p>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cart {
  padding: fluid(40) fluid(20) fluid(80);

  &__title {
    font-size: fluid(28);
    margin-bottom: fluid(28);
  }

  &__empty {
    text-align: center;
    padding: fluid(64) 0;

    p {
      margin-bottom: fluid(20);
      color: var(--color-text-muted);
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: fluid(32);
  }

  &__summary {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: fluid(24);
    height: fit-content;

    h2 {
      font-size: fluid(20);
      margin-bottom: fluid(16);
    }
  }

  &__line {
    display: flex;
    justify-content: space-between;
    padding: fluid(8) 0;
    font-size: 14px;

    &--total {
      border-top: 1px solid var(--color-border);
      margin-top: fluid(8);
      padding-top: fluid(14);
      font-size: 18px;
      font-weight: 700;
      color: var(--color-primary);
    }
  }

  &__checkout {
    width: 100%;
    margin-top: fluid(16);
  }

  &__note {
    margin-top: fluid(12);
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.cart-row {
  display: grid;
  grid-template-columns: 88px 1fr auto auto auto;
  align-items: center;
  gap: fluid(16);
  padding: fluid(16) 0;
  border-bottom: 1px solid var(--color-border);

  &__img {
    width: fluid(88);
    height: fluid(88);
    object-fit: cover;
    border-radius: var(--radius);
  }

  &__name {
    font-weight: 600;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__price {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  &__qty {
    display: flex;
    align-items: center;
    gap: fluid(8);

    button {
      width: fluid(30);
      height: fluid(30);
      border: 1px solid var(--color-border);
      border-radius: fluid(6);
      background: var(--color-bg);
    }
  }

  &__sub {
    font-weight: 700;
    min-width: fluid(100);
    text-align: right;
  }

  &__del {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 16px;
  }
}

@include rwd-768 {
  .cart__layout {
    grid-template-columns: 1fr;
  }
  .cart-row {
    grid-template-columns: 72px 1fr auto;
    grid-template-areas:
      'img info del'
      'img qty sub';

    &__img { grid-area: img; width: 72px; height: 72px; }
    &__info { grid-area: info; }
    &__qty { grid-area: qty; }
    &__sub { grid-area: sub; }
    &__del { grid-area: del; }
  }
}
</style>
