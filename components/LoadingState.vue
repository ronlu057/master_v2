<script setup>
// 載入中 / 空資料 共用狀態元件
defineProps({
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  text: { type: String, default: '載入中…' },
  emptyText: { type: String, default: '目前沒有資料' },
})
</script>

<template>
  <div v-if="loading" class="state">
    <span class="state__spinner" />
    <p>{{ text }}</p>
  </div>
  <div v-else-if="empty" class="state">
    <p class="state__empty">{{ emptyText }}</p>
  </div>
</template>

<style lang="scss" scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 20px;
  color: var(--color-text-muted);

  &__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__empty {
    font-size: fluid-fz(15);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
