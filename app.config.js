// 母版全域設定 — 五種專案類型的功能矩陣
// 由 composables/useProject.js 讀取，依 NUXT_PUBLIC_PROJECT_TYPE 決定當前行為。
export default defineAppConfig({
  site: {
    name: '母版專案',
    slogan: '一套母版，五種專案類型',
  },

  // customHome  首頁採手刻版型、可嵌入 block 模組（true）；或整頁 block 模組組裝（false）
  // customPages 內頁手刻（true）或 block 模組組裝（false）
  // shop        是否啟用購物模組
  // minimal     精簡模式（臨時站）：固定模板、單頁呈現、隱藏完整選單
  projectTypes: {
    module: {
      label: '模組件套版',
      customHome: false,
      customPages: false,
      shop: false,
    },
    'custom-home': {
      label: '客製首頁',
      customHome: true,
      customPages: false,
      shop: false,
    },
    'full-custom': {
      label: '全部客製開發',
      customHome: true,
      customPages: true,
      shop: false,
    },
    shop: {
      label: '購物類型',
      customHome: true,
      customPages: false,
      shop: true,
    },
    temp: {
      label: '臨時站',
      customHome: true,
      customPages: false,
      shop: false,
      minimal: true,
    },
  },
})
