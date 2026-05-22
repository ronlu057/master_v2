<script setup>
// 最新消息列表（白皮書 §5.2 / §5.3）
const route = useRoute()
const router = useRouter()

const { data: cats } = await useApiData('/news/category', {
  key: 'news-cats',
  default: () => [],
})

const { data: listRes } = await useApiData('/news/list', {
  key: 'news-list',
  query: {
    page: computed(() => parseInt(route.query.page) || 1),
    category: computed(() => route.query.category || ''),
    limit: 6,
  },
  default: () => ({ items: [], meta: { total: 0, page: 1, limit: 6 } }),
})

const items = computed(() => listRes.value?.items || [])
const meta = computed(() => listRes.value?.meta || { total: 0, page: 1, limit: 6 })
const totalPages = computed(() =>
  Math.max(1, Math.ceil((meta.value.total || 0) / (meta.value.limit || 6))),
)
const activeCat = computed(() => route.query.category || '')

function selectCat(blink) {
  router.push({ path: '/news', query: blink ? { category: blink } : {} })
}
function goPage(p) {
  router.push({ path: '/news', query: { ...route.query, page: p } })
}

const { data: seo } = await useApiData('/seo/list', {
  key: 'seo-news',
  query: { page_type: 'news' },
  default: () => ({}),
})
applySeo(seo.value)
</script>

<template>
  <div>
    <PageBanner page="news" title="最新消息" subtitle="掌握我們的第一手動態" />

    <div class="container">
      <nav class="breadcrumb">
        <NuxtLink to="/">首頁</NuxtLink>
        <span>/</span>
        <span>最新消息</span>
      </nav>

      <div class="news-filter">
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

      <LoadingState :empty="!items.length" empty-text="此分類目前沒有消息" />

      <div v-if="items.length" class="grid grid--3 news-grid">
        <NewsCard v-for="item in items" :key="item.id" :item="item" />
      </div>

      <div v-if="totalPages > 1" class="pager">
        <button
          v-for="p in totalPages"
          :key="p"
          :class="{ 'is-active': p === meta.page }"
          @click="goPage(p)"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.news-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;

  button {
    padding: 8px 20px;
    border: 1px solid var(--color-border);
    border-radius: 99px;
    background: var(--color-bg);
    font-size: 14px;
    transition: all var(--transition);

    &.is-active,
    &:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    }
  }
}

.news-grid {
  margin-bottom: 40px;
}

.pager {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-bottom: 64px;

  button {
    width: 40px;
    height: 40px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-bg);

    &.is-active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    }
  }
}
</style>
