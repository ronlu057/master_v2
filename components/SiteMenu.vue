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

      <div v-if="item.children?.length" class="site-menu__sub">
        <NuxtLink
          v-for="child in item.children"
          :key="child.url"
          :to="child.url"
          @click="emit('navigate')"
        >
          {{ child.title }}
        </NuxtLink>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.site-menu {
  display: flex;
  align-items: center;
  gap: fluid(4);

  &__item {
    position: relative;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: fluid(4);
    padding: fluid(10) fluid(14);
    font-size: fluid-fz(18);
    font-weight: 600;
    border-radius: var(--radius);

    &:hover,
    &.router-link-active {
      color: var(--color-primary);
    }
  }

  &__caret {
    font-size: fluid-fz(10);
  }

  &__sub {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: fluid(160);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: fluid(6);
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px);
    transition: all var(--transition);

    a {
      display: block;
      padding: fluid(8) fluid(12);
      font-size: fluid-fz(14);
      border-radius: fluid(6);

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
      padding: fluid(12) fluid(4);
      border-bottom: 1px solid var(--color-border);
    }

    .site-menu__sub {
      position: static;
      opacity: 1;
      visibility: visible;
      transform: none;
      border: none;
      box-shadow: none;
      padding: 0 0 0 fluid(16);
    }
  }
}
</style>
