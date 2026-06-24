<script setup>
// 「有子選單可展開」指示箭頭 — 形狀由後台設定 headerSubmenuIcon { name, style } 控制
// 桌機（有第三層的第二層項目）與手機（有子層項目）共用。
// 預設 chevron 線條；可選實心版（與 navtool icon 一致的線條/實心機制）。
// open=true 時 CSS 旋轉 90°（▸ → ▾），不需另存第二顆 icon。
const props = defineProps({
  open: { type: Boolean, default: false },
})
const { state } = useEffectiveSettings()
const sel = computed(() => state.headerSubmenuIcon || {})
const svg = computed(() =>
  headerIconSvg(sel.value.name || 'chevron', sel.value.style || 'line', 'currentColor'),
)
</script>

<template>
  <span class="hexp" :class="{ 'is-open': open }" aria-hidden="true" v-html="svg"></span>
</template>

<style lang="scss" scoped>
.hexp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  :deep(svg) {
    width: 1em;
    height: 1em;
  }

  &.is-open {
    transform: rotate(90deg);
  }
}
</style>
