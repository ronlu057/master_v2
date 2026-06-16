<script setup>
// 客製首頁 — 手刻版型 + block 模組（custom-home / full-custom / shop 類型使用）
import BlockRenderer from './BlockRenderer.js'

const { isShop } = useProject()
const appConfig = useAppConfig()

const { data: banners } = await useApiData('/banner/home', {
  key: 'home-banner',
  default: () => ({ rows: [] }),
})
const { data: newsRes } = await useApiData('/news/list', {
  key: 'home-news',
  query: { limit: 3 },
  default: () => ({ items: [] }),
})
const { data: shopRes } = await useApiData('/shop/products', {
  key: 'home-hot',
  query: { category: 'hot' },
  default: () => ({ items: [] }),
})
// block 模組內容（白皮書 §3）— 嵌入手刻版型中的模組化區塊
const { data: homeView } = await useApiData('/home/view', {
  key: 'home-view',
  default: () => ({ slots: [] }),
})

const hero = computed(() => banners.value?.rows?.[0] || {})
const newsList = computed(() => newsRes.value?.items || [])
const hotProducts = computed(() => shopRes.value?.items || [])

// 取 banner / news 以外的 block：banner 已手刻為 hero、news 另有手刻區塊
const moduleBlocks = computed(() => {
  const out = []
  for (const slot of homeView.value?.slots || []) {
    for (const block of slot.blocks || []) {
      if (block.type !== 'banner' && block.type !== 'news') out.push(block)
    }
  }
  return out
})

const features = [
  { icon: '⚡', title: '極速 SSR', text: 'Nuxt 4 伺服器渲染，SEO 與首屏載入俱佳。' },
  { icon: '🧩', title: '模組化開發', text: 'block 元件自由組裝，內頁快速套版。' },
  { icon: '🎨', title: '主題切換', text: 'CSS 變數驅動，依專案類型一鍵換膚。' },
]
</script>

<template>
  <div class="home-custom">
    <!-- 手刻 — Hero -->
    <section class="hero">
      <img v-if="hero.image" :src="hero.image.pc" :alt="hero.title" class="hero__bg" />
      <div class="hero__overlay">
        <div class="container">
          <p class="hero__eyebrow">{{ appConfig.site.slogan }}</p>
          <h1 class="hero__title">{{ hero.title || appConfig.site.name }}</h1>
          <div class="hero__actions">
            <NuxtLink to="/about/company-intro" class="btn btn--primary">認識我們</NuxtLink>
            <NuxtLink to="/contact" class="btn btn--light">聯絡我們</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 手刻 — 特色區 -->
    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <div v-for="f in features" :key="f.title" class="feature">
            <span class="feature__icon">{{ f.icon }}</span>
            <h3 class="feature__title">{{ f.title }}</h3>
            <p class="feature__text">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 手刻 — 購物類型：熱賣推薦 -->
    <section v-if="isShop && hotProducts.length" class="section section--surface">
      <div class="container">
        <div class="section-title">
          <h2 class="section-title__main">熱賣推薦</h2>
        </div>
        <div class="grid grid--4">
          <NuxtLink
            v-for="p in hotProducts"
            :key="p.id"
            :to="`/shop/${p.blink}`"
            class="mini-prod"
          >
            <img :src="p.image" :alt="p.title" />
            <h4 class="mini-prod__name">{{ p.title }}</h4>
            <p class="mini-prod__price">NT$ {{ p.price.toLocaleString() }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- block 模組 — 嵌入手刻版型的模組化區塊（白皮書 §3） -->
    <BlockRenderer :blocks="moduleBlocks" />

    <!-- 手刻 — 最新消息 -->
    <section class="section" :class="{ 'section--surface': !isShop }">
      <div class="container">
        <div class="section-title">
          <h2 class="section-title__main">最新消息</h2>
        </div>
        <div class="grid grid--3">
          <NewsCard v-for="n in newsList" :key="n.id" :item="n" />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: fluid(520);
  display: flex;
  align-items: center;

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__overlay {
    position: relative;
    width: 100%;
    padding: fluid(80) 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.15));
  }

  &__eyebrow {
    color: #fff;
    opacity: 0.85;
    letter-spacing: 2px;
    margin-bottom: fluid(12);
  }

  &__title {
    color: #fff;
    font-size: fluid-fz(48);
    max-width: fluid(620);
    margin-bottom: fluid(28);
  }

  &__actions {
    display: flex;
    gap: fluid(14);
    flex-wrap: wrap;
  }
}

.feature {
  text-align: center;
  padding: fluid(32) fluid(24);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &__icon {
    font-size: fluid-fz(40);
  }

  &__title {
    margin: fluid(14) 0 fluid(8);
    font-size: fluid-fz(20);
  }

  &__text {
    color: var(--color-text-muted);
    font-size: fluid-fz(14);
  }
}

.mini-prod {
  display: block;
  text-align: center;

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius);
  }

  &__name {
    margin: fluid(10) 0 fluid(4);
    font-size: fluid-fz(15);
  }

  &__price {
    color: var(--color-primary);
    font-weight: 700;
  }
}

@include rwd-768 {
  .hero {
    min-height: 420px;
  }
  .hero__title {
    font-size: 30px;
  }
}
</style>
