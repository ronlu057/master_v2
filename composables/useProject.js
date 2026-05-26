// ── 專案類型 ────────────────────────────────────────────────
// 依 NUXT_PUBLIC_PROJECT_TYPE 回傳當前專案類型與功能旗標。
// 全站元件 / 頁面透過此 composable 決定要走 block 模組或手刻。

// 將 .env 字串解析為 boolean — 避免 "false"、" false"（含空格）被 JS 當成 truthy
// 只接受去除首尾空白後等於 'true'（不分大小寫）才回 true
const parseBool = (v) => typeof v === 'string'
  ? v.trim().toLowerCase() === 'true'
  : !!v

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
    enableShop: !!matrix.shop || parseBool(pub.enableShop),
  }
}
