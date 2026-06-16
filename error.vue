<script setup>
const props = defineProps({
  error: { type: Object, default: () => ({}) },
})

const isNotFound = computed(() => props.error?.statusCode === 404)

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page">
    <div class="error-page__inner">
      <p class="error-page__code">{{ error?.statusCode || 500 }}</p>
      <h1 class="error-page__title">
        {{ isNotFound ? '找不到頁面' : '發生錯誤' }}
      </h1>
      <p class="error-page__msg">
        {{ error?.message || '請稍後再試，或回到首頁。' }}
      </p>
      <button class="error-page__btn" @click="goHome">回到首頁</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--color-bg);

  &__inner {
    text-align: center;
    max-width: 480px;
  }

  &__code {
    font-size: fluid-fz(96);
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary);
  }

  &__title {
    font-size: fluid-fz(28);
    margin: 16px 0 8px;
  }

  &__msg {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }

  &__btn {
    padding: 12px 32px;
    border: none;
    border-radius: var(--radius);
    background: var(--color-primary);
    color: #fff;
    font-size: fluid-fz(16);
    transition: background var(--transition);

    &:hover {
      background: var(--color-primary-dark);
    }
  }
}
</style>
