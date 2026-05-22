<script setup>
// 常見問題（白皮書 §12.1 FAQ）
const route = useRoute()
const router = useRouter()

const { data: cats } = await useApiData('/faq/category', {
  key: 'faq-cats',
  default: () => [],
})

const { data: listRes } = await useApiData('/faq/list', {
  key: 'faq-list',
  query: { category: computed(() => route.query.category || '') },
  default: () => ({ items: [] }),
})

const items = computed(() => listRes.value?.items || [])
const activeCat = computed(() => route.query.category || '')
const openId = ref(null)

function toggle(id) {
  openId.value = openId.value === id ? null : id
}
function selectCat(blink) {
  router.push({ path: '/faq', query: blink ? { category: blink } : {} })
}

useSeoMeta({ title: '常見問題 — 母版專案' })
</script>

<template>
  <div>
    <PageBanner page="faq" title="常見問題" subtitle="快速找到您想知道的答案" />

    <div class="container faq">
      <div class="faq__cats">
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

      <LoadingState :empty="!items.length" empty-text="此分類目前沒有問題" />

      <ul class="faq__list">
        <li
          v-for="item in items"
          :key="item.id"
          class="faq-item"
          :class="{ 'is-open': openId === item.id }"
        >
          <button class="faq-item__q" @click="toggle(item.id)">
            <span>{{ item.question }}</span>
            <span class="faq-item__icon">{{ openId === item.id ? '−' : '+' }}</span>
          </button>
          <div v-show="openId === item.id" class="faq-item__a" v-html="item.answer" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.faq {
  padding: 48px 20px 80px;
  max-width: 820px;

  &__cats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 28px;

    button {
      padding: 8px 20px;
      border: 1px solid var(--color-border);
      border-radius: 99px;
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

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 12px;
  overflow: hidden;

  &.is-open {
    border-color: var(--color-primary);
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 18px 20px;
    background: var(--color-bg);
    font-size: 16px;
    font-weight: 600;
    text-align: left;
  }

  &__icon {
    color: var(--color-primary);
    font-size: 22px;
  }

  &__a {
    padding: 0 20px 18px;
    color: var(--color-text-muted);
    line-height: 1.8;
  }
}
</style>
