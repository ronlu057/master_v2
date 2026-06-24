<script setup>
// admin 後台 layout — 左側 sidebar 導覽，右側 slot 顯示當前模組設定
import { useRoute } from '#imports'

const route = useRoute()

// 導覽分組：基礎模組（一定要有）+ 其他工具
const nav = [
  {
    group: '共用',
    items: [{ to: '/admin', label: '共用設定', desc: 'projectType / API / 語系 / 購物' }],
  },
  {
    group: '基礎架構模組',
    items: [
      { to: '/admin/header', label: 'Header 模組', desc: '版型 / LOGO / navtool' },
      { to: '/admin/menu', label: '選單管理', desc: 'header / footer / 行動版選單' },
      { to: '/admin/banner', label: 'Banner 模組', desc: 'PageBanner / BlockBanner' },
      { to: '/admin/footer', label: 'Footer 模組', desc: '頁尾資訊（規劃中）' },
    ],
  },
  {
    group: '工具',
    items: [
      { to: '/admin/mock', label: 'Mock 資料', desc: '編輯 server/mock/data/*.json' },
      { to: '/admin/scaffold', label: '檔案生成', desc: '新增 Header / Banner / Mock' },
    ],
  },
]

const isActive = (to) => {
  if (to === '/admin') return route.path === '/admin' || route.path === '/admin/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="admin">
    <header class="admin__topbar">
      <div class="admin__brand">
        <strong>master_v2</strong> · 整合設定後台
        <span class="admin__hint">dev 模式限定 · 不會出現在 production</span>
      </div>
      <NuxtLink
        to="/"
        class="admin__view-site"
        target="_blank"
        title="開新 tab 看站台 — admin 改設定時站台 tab 即時同步"
      >
        看站台 ↗
      </NuxtLink>
    </header>

    <div class="admin__body">
      <aside class="admin__sidebar">
        <div v-for="group in nav" :key="group.group" class="admin__group">
          <div class="admin__group-label">{{ group.group }}</div>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :class="['admin__nav-item', { 'is-active': isActive(item.to) }]"
          >
            <span class="admin__nav-label">{{ item.label }}</span>
            <span class="admin__nav-desc">{{ item.desc }}</span>
          </NuxtLink>
        </div>
      </aside>

      <main class="admin__main">
        <slot />
      </main>
    </div>

    <!-- 預覽確認島：有 localStorage 預覽（Header / Banner / navtool）時，後台也直接顯示「確定/套用 ‧ 清除預覽」 -->
    <AdminPreviewBar />
  </div>
</template>

<style lang="scss" scoped>
.admin {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f1218;
  color: #e6e9ef;
  font-family: 'Noto Sans TC', 'Inter', sans-serif;
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

.admin__view-site {
  margin-left: auto;
  font-size: 13px;
  color: #4fc08d;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #2a4a3a;
  border-radius: 6px;

  &:hover { background: #1a2a22; }
}

.admin__body {
  display: flex;
  flex: 1;
}

.admin__sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 20px 12px;
  background: #131822;
  border-right: 1px solid #232a38;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 56px;
  align-self: flex-start;
  height: calc(100vh - 56px);
  overflow-y: auto;
}

.admin__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin__group-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6a7382;
  padding: 0 12px 6px;
  border-bottom: 1px solid #232a38;
  margin-bottom: 4px;
}

.admin__nav-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #c8cfdb;
  text-decoration: none;
  transition: all 0.15s;

  &:hover { background: #1a1f2a; }

  &.is-active {
    background: rgba(79, 192, 141, 0.12);
    color: #6dd6a3;

    .admin__nav-label { font-weight: 600; }
  }
}

.admin__nav-label {
  font-size: 13px;
}

.admin__nav-desc {
  font-size: 10px;
  color: #6a7382;
  line-height: 1.4;
}

.admin__main {
  flex: 1;
  padding: 28px 32px;
  max-width: 980px;
}
</style>
