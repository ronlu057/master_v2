<script setup>
// 服務據點 / 門市查詢（白皮書 §12.3）
const route = useRoute()
const router = useRouter()

const { data: cats } = await useApiData('/location/category', {
  key: 'loc-cats',
  default: () => [],
})

const { data: listRes } = await useApiData('/location/list', {
  key: 'loc-list',
  query: { category: computed(() => route.query.category || '') },
  default: () => ({ items: [] }),
})

const items = computed(() => listRes.value?.items || [])
const activeCat = computed(() => route.query.category || '')

function selectCat(blink) {
  router.push({ path: '/location', query: blink ? { category: blink } : {} })
}

useSeoMeta({ title: '服務據點 — 母版專案' })
</script>

<template>
  <div>
    <PageBanner page="location" title="服務據點" subtitle="歡迎就近蒞臨服務" />

    <div class="container loc">
      <nav class="breadcrumb">
        <NuxtLink to="/">首頁</NuxtLink>
        <span>/</span>
        <span>服務據點</span>
      </nav>

      <div class="loc__cats">
        <button :class="{ 'is-active': !activeCat }" @click="selectCat('')">全部</button>
        <button
          v-for="c in cats"
          :key="c.blink"
          :class="{ 'is-active': activeCat === c.blink }"
          @click="selectCat(c.blink)"
        >
          {{ c.title }}
        </button>
      </div>

      <LoadingState :empty="!items.length" empty-text="此區域目前沒有據點" />

      <div v-if="items.length" class="grid grid--3">
        <div v-for="loc in items" :key="loc.id" class="loc-card">
          <img :src="loc.image" :alt="loc.title" class="loc-card__img" loading="lazy" />
          <div class="loc-card__body">
            <h3 class="loc-card__name">{{ loc.title }}</h3>
            <p>📍 {{ loc.address }}</p>
            <p>📞 {{ loc.tel }}</p>
            <p>🕒 {{ loc.open_time }}</p>
            <a :href="loc.map_link" target="_blank" rel="noopener" class="btn btn--outline loc-card__btn">
              地圖導航
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loc {
  padding-bottom: fluid(80);

  &__cats {
    display: flex;
    flex-wrap: wrap;
    gap: fluid(10);
    margin-bottom: fluid(32);

    button {
      padding: fluid(8) fluid(20);
      border: 1px solid var(--color-border);
      border-radius: fluid(99);
      background: var(--color-bg);
      font-size: 14px;

      &.is-active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
      }
    }
  }
}

.loc-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  &__img {
    aspect-ratio: 3 / 2;
    width: 100%;
    object-fit: cover;
  }

  &__body {
    padding: fluid(20);

    p {
      font-size: 14px;
      color: var(--color-text-muted);
      margin-top: fluid(6);
    }
  }

  &__name {
    font-size: 18px;
    margin-bottom: fluid(10);
  }

  &__btn {
    margin-top: fluid(16);
    width: 100%;
    padding: fluid(9);
    font-size: 14px;
  }
}
</style>
