<script setup>
// 站台預覽提示條 — 當 localStorage 內有 admin 覆寫設定時，網站底部出現一條提示
// 只在 dev mode 顯示；production 不會 render
//
// 三個動作：
//   - 調整：跳到 /admin 編輯
//   - 確定：把當前預覽固化成正式設定（POST 寫 JSON + .env，清 localStorage）
//   - 清除預覽：放棄預覽，回到正式設定
const isDev = import.meta.dev
const { state, clearPreview } = useEffectiveSettings()
const navtool = useNavtoolConfig()
const { submit, submitting } = useSiteSettings()

const confirmState = ref(null) // 'success' | 'error' | null

const onConfirm = async () => {
  const res = await submit()
  if (res.ok) {
    // 寫回成功 → 清掉 localStorage 預覽（因預覽值已固化到 JSON / .env）
    clearPreview()
    if (import.meta.client) {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('master_v2_navtool_')) keys.push(k)
      }
      keys.forEach((k) => localStorage.removeItem(k))
    }
    confirmState.value = 'success'
    // 浮條會自然消失（isPreviewing → false），但短暫顯示 ✓ 提示
    setTimeout(() => { confirmState.value = null }, 2000)
  } else {
    confirmState.value = 'error'
    setTimeout(() => { confirmState.value = null }, 3000)
  }
}

const clearAndReload = () => {
  if (!import.meta.client) return
  clearPreview()
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('master_v2_navtool_')) keysToRemove.push(k)
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
  window.location.reload()
}

const showBar = computed(() => state.isPreviewing || navtool.state.value.isPreviewing)
</script>

<template>
  <div v-if="isDev && showBar" class="admin-preview-bar">
    <span class="admin-preview-bar__dot"></span>
    <span class="admin-preview-bar__text">
      預覽模式 · header=<strong>{{ state.header }}</strong>
      · banner=<strong>{{ state.pageBanner }}</strong>/<strong>{{ state.blockBanner }}</strong>
    </span>
    <NuxtLink to="/admin" class="admin-preview-bar__link">調整</NuxtLink>
    <button
      type="button"
      class="admin-preview-bar__btn admin-preview-bar__btn--confirm"
      :disabled="submitting"
      :title="'把當前預覽寫回 site-settings.json + .env'"
      @click="onConfirm"
    >
      <template v-if="confirmState === 'success'">✓ 已套用</template>
      <template v-else-if="confirmState === 'error'">✗ 失敗</template>
      <template v-else-if="submitting">套用中…</template>
      <template v-else>確定 / 套用</template>
    </button>
    <button type="button" class="admin-preview-bar__btn" @click="clearAndReload">
      清除預覽
    </button>
  </div>
</template>

<style lang="scss" scoped>
.admin-preview-bar {
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(15, 18, 24, 0.92);
  color: #e6e9ef;
  border: 1px solid #2a3242;
  border-radius: 999px;
  font-size: 12px;
  font-family: 'Noto Sans TC', 'Inter', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.admin-preview-bar__dot {
  width: 8px;
  height: 8px;
  background: #4fc08d;
  border-radius: 50%;
  animation: admin-preview-pulse 1.8s ease-in-out infinite;
}

@keyframes admin-preview-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.admin-preview-bar__text strong {
  color: #4fc08d;
  font-weight: 600;
}

.admin-preview-bar__link {
  color: #4fc08d;
  text-decoration: none;
  padding: 4px 11px;
  border: 1px solid #2a4a3a;
  border-radius: 99px;

  &:hover { background: #1a2a22; }
}

.admin-preview-bar__btn {
  background: transparent;
  border: 1px solid #2a3242;
  color: #c8cfdb;
  border-radius: 99px;
  padding: 4px 11px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: #1f2532; color: #fff; }
  &:disabled { opacity: 0.5; cursor: wait; }

  &--confirm {
    background: #4fc08d;
    color: #0f1218;
    border-color: #4fc08d;
    font-weight: 600;

    &:hover:not(:disabled) {
      background: #6dd6a3;
      color: #0f1218;
    }
  }
}
</style>
