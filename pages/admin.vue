<script setup>
// /admin — 前端整合設定後台（dev mode only）
//   分頁：設定中心 / Mock 資料 / 檔案生成
//   預覽：所有設定變動先進 localStorage（即時影響 Header / Banner dispatcher）
//   提交：呼叫 server route 寫回 .env / mock JSON / scaffold 新檔
//
// production 環境下 server route 全 404，本頁也會立即重導離開（雙保險）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) {
  // 真的不該在 production 出現；保險起見直接踢回首頁
  navigateTo('/', { replace: true })
}

const tabs = [
  { key: 'settings', label: '設定中心' },
  { key: 'mock', label: 'Mock 資料' },
  { key: 'scaffold', label: '檔案生成' },
]
const active = ref('settings')
</script>

<template>
  <div class="admin">
    <header class="admin__topbar">
      <div class="admin__brand">
        <strong>master_v2</strong> · 整合設定後台
        <span class="admin__hint">dev 模式限定 · 不會出現在 production</span>
      </div>
      <nav class="admin__tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :class="['admin__tab', { 'is-active': active === t.key }]"
          @click="active = t.key"
        >
          {{ t.label }}
        </button>
      </nav>
      <NuxtLink
        to="/"
        class="admin__view-site"
        target="_blank"
        title="開新 tab 看站台 — 在 admin 改設定時，站台 tab 會即時同步切換版型"
      >
        看站台 ↗
      </NuxtLink>
    </header>

    <main class="admin__main">
      <AdminSettings v-if="active === 'settings'" />
      <AdminMockData v-else-if="active === 'mock'" />
      <AdminScaffold v-else-if="active === 'scaffold'" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.admin {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin__topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  background: #161b25;
  border-bottom: 1px solid #232a38;
  position: sticky;
  top: 0;
  z-index: 20;
}

.admin__brand {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  line-height: 1.4;
}

.admin__hint {
  font-size: 11px;
  color: #7a8896;
}

.admin__tabs {
  display: flex;
  gap: 6px;
  margin-left: auto;
  margin-right: auto;
}

.admin__tab {
  padding: 8px 18px;
  background: transparent;
  color: #c8cfdb;
  border: 1px solid #2a3242;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #1f2532; }
  &.is-active {
    background: #4fc08d;
    color: #0f1218;
    border-color: #4fc08d;
    font-weight: 600;
  }
}

.admin__view-site {
  font-size: 13px;
  color: #4fc08d;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #2a4a3a;
  border-radius: 6px;

  &:hover { background: #1a2a22; }
}

.admin__main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>
