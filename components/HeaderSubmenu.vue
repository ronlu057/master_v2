<script setup>
// 桌機下拉子選單（遞迴，第二層起）— 全 Header 共用，支援第三層。
// 各 Header 的第二層下拉面板內，放 <HeaderSubmenu :items="item.children" /> 即可。
// 呈現由 AppHeader 的 .app-header--sub-* class 控制（樣式在 main.scss 全域）：
//   flyout：滑到「有子層」的項目 → 第三層往右飛出浮層（箭頭僅作指示）
//   nested：第三層預設隱藏，點箭頭 icon 才往內縮排展開（accordion）
// 「有子層」的項目自動顯示展開 icon（HeaderExpandIcon，形狀/線條實心由後台 headerSubmenuIcon 設定）。
const props = defineProps({
  items: { type: Array, required: true },
  level: { type: Number, default: 2 },
})
// 目前呈現模式：nested＝點箭頭才展開（v-show 控制）；flyout＝一律渲染、CSS hover 控顯示
const { state } = useEffectiveSettings()
const nested = computed(() => state.headerSubmenuStyle === 'nested')
const open = reactive(new Set()) // nested 模式：哪些項目展開中（以項目物件為 key）
const isOpen = (it) => open.has(it)
const toggle = (it) => (open.has(it) ? open.delete(it) : open.add(it))
</script>

<template>
  <div class="hsub" :class="`hsub--l${level}`">
    <template v-for="it in items" :key="it.url">
      <!-- 無子層：純連結 -->
      <NuxtLink v-if="!it.children?.length" :to="it.url" itemprop="url" class="hsub__link">
        {{ it.title }}
      </NuxtLink>
      <!-- 有子層：連結 + 展開 icon + 巢狀子選單 -->
      <div v-else class="hsub__group" :class="{ 'is-open': isOpen(it) }">
        <div class="hsub__row">
          <NuxtLink :to="it.url" itemprop="url" class="hsub__link hsub__link--has">
            {{ it.title }}
          </NuxtLink>
          <button
            type="button"
            class="hsub__arrow"
            :aria-expanded="isOpen(it)"
            aria-label="展開子選單"
            @click.prevent.stop="toggle(it)"
          >
            <HeaderExpandIcon :open="isOpen(it)" />
          </button>
        </div>
        <!-- nested：點箭頭才展開（v-show）；flyout：一律渲染、靠 CSS hover 顯示 -->
        <HeaderSubmenu
          v-show="!nested || isOpen(it)"
          :items="it.children"
          :level="level + 1"
        />
      </div>
    </template>
  </div>
</template>
