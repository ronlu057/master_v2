<script setup>
// 站台預覽提示條 — 當 localStorage 內有 admin 覆寫設定時，網站底部出現一條提示
// 只在 dev mode 顯示；production 不會 render（透過 v-if="import.meta.dev"）
// 點「清除預覽」會清掉 localStorage 並 reload，回到 .env 設定
const isDev = import.meta.dev
const { state, clearPreview } = useEffectiveSettings()
const navtool = useNavtoolConfig()

const clearAndReload = () => {
  // 一鍵清掉所有 admin 預覽：effective settings + 所有 per-Header navtool 配置
  if (!import.meta.client) return
  clearPreview()
  // 清掉所有 master_v2_navtool_* keys（per-Header）
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('master_v2_navtool_')) keysToRemove.push(k)
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
  window.location.reload()
}

// 是否顯示提示條：effective 或當前 Header 的 navtool 有預覽
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
  gap: 12px;
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
  padding: 3px 10px;
  border: 1px solid #2a4a3a;
  border-radius: 99px;

  &:hover { background: #1a2a22; }
}

.admin-preview-bar__btn {
  background: transparent;
  border: 1px solid #2a3242;
  color: #c8cfdb;
  border-radius: 99px;
  padding: 3px 10px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;

  &:hover { background: #1f2532; color: #fff; }
}
</style>
