<script setup>
// 選單元件 — 支援多階層 children 下拉；mobile 模式改為展開式
defineProps({
  items: { type: Array, default: () => [] },
  mobile: { type: Boolean, default: false },
})
const emit = defineEmits(['navigate'])
</script>

<template>
  <ul :class="['site-menu', { 'site-menu--mobile': mobile }]">
    <li v-for="item in items" :key="item.url" class="site-menu__item">
      <NuxtLink :to="item.url" class="site-menu__link" @click="emit('navigate')">
        {{ item.title }}
        <span v-if="item.children?.length" class="site-menu__caret">▾</span>
      </NuxtLink>

      <ul v-if="item.children?.length" class="site-menu__sub">
        <li v-for="child in item.children" :key="child.url">
          <NuxtLink :to="child.url" @click="emit('navigate')">{{ child.title }}</NuxtLink>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.site-menu {
  display: flex;
  align-items: center;
  gap: 4px;

  &__item {
    position: relative;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    font-size: 18px;
    font-weight: 600;
    border-radius: var(--radius);

    &:hover,
    &.router-link-active {
      color: var(--color-primary);
    }
  }

  &__caret {
    font-size: 10px;
  }

  &__sub {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 160px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 6px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    transition: all var(--transition);

    a {
      display: block;
      padding: 8px 12px;
      font-size: 14px;
      border-radius: 6px;

      &:hover {
        background: var(--color-surface);
        color: var(--color-primary);
      }
    }
  }

  &__item:hover &__sub {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  /* ---- 行動版：展開式 ---- */
  &--mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 0;

    .site-menu__link {
      padding: 12px 4px;
      border-bottom: 1px solid var(--color-border);
    }

    .site-menu__sub {
      position: static;
      opacity: 1;
      visibility: visible;
      transform: none;
      border: none;
      box-shadow: none;
      padding: 0 0 0 16px;
    }
  }
}
</style>
