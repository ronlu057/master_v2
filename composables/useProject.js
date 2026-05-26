// ── 專案類型 ────────────────────────────────────────────────
// 依 NUXT_PUBLIC_PROJECT_TYPE 回傳當前專案類型與功能旗標。
// 全站元件 / 頁面透過此 composable 決定要走 block 模組或手刻。
export function useProject() {
  const { public: pub } = useRuntimeConfig()
  const appConfig = useAppConfig()

  const type = pub.projectType || 'module'
  const matrix = appConfig.projectTypes[type] || appConfig.projectTypes.module

  return {
    type, // 'module' | 'custom-home' | 'full-custom' | 'shop' | 'temp'
    label: matrix.label, // 中文名稱
    customHome: !!matrix.customHome, // 首頁是否手刻
    customPages: !!matrix.customPages, // 內頁是否手刻
    isShop: !!matrix.shop, // 是否購物類型（依 projectType=shop 自動判定）
    isMinimal: !!matrix.minimal, // 是否精簡模式（臨時站）
    // 是否顯示購物 UI（購物車 / 我的最愛 / 收藏 等）
    // 兩種啟用方式：① projectType=shop 自動啟用；② NUXT_PUBLIC_ENABLE_SHOP=true 強制啟用（即使非 shop 類型，也可加掛購物功能）
    enableShop: !!matrix.shop || !!pub.enableShop,
  }
}
