<script setup>
// 全站搜尋（白皮書 §4）
const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.keyword || '')

const { data: result } = await useApiData('/search', {
  key: 'search',
  query: { keyword: computed(() => route.query.keyword || '') },
  default: () => ({ keyword: '', categories: [], list: [] }),
})

const activeType = ref('')
const list = computed(() => {
  const all = result.value?.list || []
  return activeType.value ? all.filter((r) => r.type === activeType.value) : all
})

function doSearch() {
  router.push({ path: '/search', query: keyword.value ? { keyword: keyword.value } : {} })
}

useSeoMeta({ title: '搜尋 — 母版專案' })
</script>

<template>
  <div>
    <PageBanner page="search" title="全站搜尋" />

    <div class="container search">
      <form class="search__bar" @submit.prevent="doSearch">
        <input v-model="keyword" type="search" placeholder="輸入關鍵字搜尋全站內容…" />
        <button type="submit" class="btn btn--primary">搜尋</button>
      </form>

      <template v-if="route.query.keyword">
        <p class="search__summary">
          關鍵字「<strong>{{ result.keyword }}</strong>」找到 {{ (result.list || []).length }} 筆結果
        </p>

        <!-- 分類 chip（白皮書 §4.4）-->
        <div v-if="result.categories?.length" class="search__chips">
          <button :class="{ 'is-active': !activeType }" @click="activeType = ''">
            全部
          </button>
          <button
            v-for="c in result.categories"
            :key="c.unit_id"
            :class="{ 'is-active': activeType === c.type }"
            @click="activeType = c.type"
          >
            {{ c.title }} ({{ c.count }})
          </button>
        </div>

        <LoadingState :empty="!list.length" empty-text="找不到符合的結果" />

        <ul class="search__list">
          <li v-for="(r, i) in list" :key="i" class="result">
            <span class="result__type">{{ r.type_title }}</span>
            <NuxtLink :to="r.url" class="result__title">{{ r.title }}</NuxtLink>
            <p class="result__summary">{{ r.summary }}</p>
          </li>
        </ul>
      </template>

      <p v-else class="search__hint">請輸入關鍵字開始搜尋。</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search {
  padding: fluid(48) fluid(20) fluid(80);

  &__bar {
    display: flex;
    gap: fluid(10);
    max-width: fluid(620);
    margin: 0 auto fluid(32);

    input {
      flex: 1;
      padding: fluid(12) fluid(16);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }
    }
  }

  &__summary {
    margin-bottom: fluid(16);
    color: var(--color-text-muted);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: fluid(10);
    margin-bottom: fluid(24);

    button {
      padding: fluid(6) fluid(16);
      border: 1px solid var(--color-border);
      border-radius: fluid(99);
      background: var(--color-bg);
      font-size: fluid-fz(13);

      &.is-active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
      }
    }
  }

  &__hint {
    text-align: center;
    color: var(--color-text-muted);
    padding: fluid(48) 0;
  }
}

.result {
  padding: fluid(20) 0;
  border-bottom: 1px solid var(--color-border);

  &__type {
    display: inline-block;
    padding: 2px fluid(10);
    border-radius: fluid(4);
    background: var(--color-surface);
    font-size: fluid-fz(12);
    color: var(--color-primary);
  }

  &__title {
    display: block;
    font-size: fluid-fz(18);
    font-weight: 700;
    margin: fluid(8) 0 fluid(4);

    &:hover {
      color: var(--color-primary);
    }
  }

  &__summary {
    font-size: fluid-fz(14);
    color: var(--color-text-muted);
  }
}
</style>
