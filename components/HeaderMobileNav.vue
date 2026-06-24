<script setup>
// 手機版選單（遞迴 accordion）— 全 Header 共用，支援三層。
//   - 父層「文字」是連結，點了直接跳該頁並關閉選單
//   - 有子層才在右側顯示可展開的箭頭（HeaderExpandIcon，形狀/線條實心由後台設定）
//   - 點箭頭才展開/收合子層（不影響文字連結）
// 各 Header 的手機面板只要放 <HeaderMobileNav :items="menuData.mobile" /> 即可。
const props = defineProps({
  items: { type: Array, required: true },
  depth: { type: Number, default: 1 },
})
const ui = useUiStore()
const open = reactive(new Set()) // 哪些項目展開中（以項目物件為 key）
const isOpen = (it) => open.has(it)
const toggle = (it) => (open.has(it) ? open.delete(it) : open.add(it))
</script>

<template>
  <ul class="hmnav" :class="`hmnav--d${depth}`">
    <li v-for="item in items" :key="item.url" class="hmnav__item">
      <div class="hmnav__row">
        <NuxtLink :to="item.url" class="hmnav__link" @click="ui.closeMenu">
          {{ item.title }}
        </NuxtLink>
        <button
          v-if="item.children?.length"
          type="button"
          class="hmnav__toggle"
          :class="{ 'is-open': isOpen(item) }"
          :aria-expanded="isOpen(item)"
          aria-label="展開子選單"
          @click="toggle(item)"
        >
          <HeaderExpandIcon :open="isOpen(item)" />
        </button>
      </div>
      <!-- 下一層（遞迴），點箭頭才展開 -->
      <HeaderMobileNav
        v-if="item.children?.length"
        v-show="isOpen(item)"
        :items="item.children"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.hmnav {
  list-style: none;
  margin: 0;
  padding: 0;
}
// 子層往內縮排 + 左側階層線
.hmnav--d2,
.hmnav--d3 {
  margin: 0 0 fluid(4) fluid(14);
  padding-left: fluid(10);
  border-left: 2px solid var(--color-border);
}

.hmnav__row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}
// 子層字級略小、無底線重複（保留階層線即可）
.hmnav--d2 .hmnav__row,
.hmnav--d3 .hmnav__row {
  border-bottom: none;
}

.hmnav__link {
  flex: 1;
  min-width: 0;
  display: block;
  padding: fluid(12) fluid(4);
  font-size: 18px;
  font-weight: 600;
  color: inherit;

  &:hover,
  &.router-link-active {
    color: var(--color-primary);
  }
}
.hmnav--d2 .hmnav__link {
  font-size: 15px;
  font-weight: 400;
}
.hmnav--d3 .hmnav__link {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.9;
}

.hmnav__toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    color: var(--color-primary);
  }
}
</style>
