// ── 專案類型 ────────────────────────────────────────────────
// 全站元件 / 頁面透過此 composable 決定要走 block 模組或手刻。
//
// 設定來源：useEffectiveSettings（initial = runtimeConfig.public，可被 /admin 預覽覆寫）
// 所有回傳值都是 ComputedRef — template 中 auto-unwrap、script 中要 .value
// 例：<template> v-if="!isMinimal"</template> / <script> if (isMinimal.value) </script>

// 將 .env 字串解析為 boolean — 避免 "false"、" false"（含空格）被 JS 當成 truthy
const parseBool = (v) =>
  typeof v === 'string' ? v.trim().toLowerCase() === 'true' : !!v

export function useProject() {
  const { state } = useEffectiveSettings()
  const appConfig = useAppConfig()

  const type = computed(() => state.projectType || 'module')
  const matrix = computed(
    () => appConfig.projectTypes[type.value] || appConfig.projectTypes.module,
  )

  return {
    type, // ComputedRef<'module'|'custom-home'|'full-custom'|'shop'|'temp'>
    label: computed(() => matrix.value.label), // 中文名稱
    customHome: computed(() => !!matrix.value.customHome), // 首頁是否手刻
    customPages: computed(() => !!matrix.value.customPages), // 內頁是否手刻
    isShop: computed(() => !!matrix.value.shop), // 是否購物類型（依 projectType=shop 自動判定）
    isMinimal: computed(() => !!matrix.value.minimal), // 是否精簡模式（臨時站）
    // 是否顯示購物 UI：① projectType=shop 自動 ② NUXT_PUBLIC_ENABLE_SHOP=true 強制
    enableShop: computed(() => !!matrix.value.shop || parseBool(state.enableShop)),
  }
}
