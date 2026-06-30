<script setup>
// 共用圖示 — 來源：X:\css_generator「Icon 字型工坊」(Feather 風格)
// 圖示資料表在 utils/icons.js（name → inner SVG）；全部 viewBox 0 0 24 24、線條描邊。
//
// 用法：<AppIcon name="play" />  顏色吃 currentColor（外層設 color 即可上色）；
//       線條粗細可用 :width-stroke，大小由外層 font-size / width 控制（預設 1em）。
import { ICONS } from '~/utils/icons'

const props = defineProps({
  name: { type: String, required: true },
  // 描邊粗細（對應工坊的 stroke-width；預設 2）
  strokeWidth: { type: [Number, String], default: 2 },
})

const inner = computed(() => ICONS[props.name] || '')
if (import.meta.dev && !ICONS[props.name]) {
  console.warn(`[AppIcon] 找不到圖示「${props.name}」，請確認名稱（見 utils/icons.js）`)
}
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="inner"
  />
</template>

<style lang="scss">
// unscoped：讓使用者自訂 CSS 也能命中 .app-icon
.app-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  flex-shrink: 0;
}
</style>
