// Nuxt 4 母版專案設定檔（純 JavaScript，無 TypeScript）
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 白皮書「無 TS 政策」：停用 TypeScript 檢查
  typescript: { typeCheck: false, shim: false },

  modules: ['@pinia/nuxt'],

  // 全域樣式（CSS 變數主題 + reset + 共用樣式）
  css: ['~/assets/styles/main.scss'],

  // 元件自動引入：關閉路徑前綴 → 元件名 = 檔名（如 BlockNews.vue → <BlockNews>）
  components: [{ path: '~/components', pathPrefix: false }],

  // 執行期設定，可被 .env 的 NUXT_PUBLIC_* 覆寫
  runtimeConfig: {
    public: {
      // 專案類型：module（模組件套版）/ custom-home（客製首頁）/ full-custom（全客製）/ shop（購物）
      projectType: 'module',
      // API base URL；留空 = 使用本地 mock JSON（server/routes/api）
      apiBase: '',
      // 預設語系
      defaultLang: 'tw',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
