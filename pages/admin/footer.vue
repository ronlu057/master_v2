<script setup>
// /admin/footer — Footer 模組設定（規劃中）
// 預留位置 — Footer 設定待擴充（社群、版權、訂閱、頁尾選單等）
definePageMeta({ layout: 'admin' })

if (import.meta.client && !import.meta.dev) navigateTo('/', { replace: true })
</script>

<template>
  <div class="page">
    <h1 class="page__title">Footer 模組</h1>
    <p class="page__desc">頁尾資訊設定 — 此模組規劃中，未來會加入：</p>

    <ul class="todo-list">
      <li>Footer 版型切換（多版型支援）</li>
      <li>頁尾選單編輯（從 <code>menu.json.footer</code> 取）</li>
      <li>社群連結快速開關（已在 <code>firm.json</code> 內，這裡做視覺化編輯）</li>
      <li>版權文字 / 公司資訊（從 <code>firm.json</code> 取）</li>
      <li>電子報訂閱表單啟用 / 關閉</li>
    </ul>

    <p class="page__desc" style="margin-top: 24px">
      目前 Footer 走 <code>components/AppFooter.vue</code> 單一版型。資料來源主要從
      <code>data/firm.json</code> 與 <code>data/menu.json</code> 取，要改文字 / 連結請到
      <NuxtLink to="/admin/mock" class="link">Mock 資料</NuxtLink> 對應 JSON 編輯。
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/_admin-page.scss' as *;

.todo-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    padding: 10px 14px;
    background: #1a1f2a;
    border: 1px solid #232a38;
    border-radius: 6px;
    color: #c8cfdb;
    font-size: 13px;

    &::before {
      content: '○';
      color: #6a7382;
      margin-right: 8px;
    }

    code {
      background: #0f1218;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
    }
  }
}

.link {
  color: #6dd6a3;
  text-decoration: underline;
}
</style>
