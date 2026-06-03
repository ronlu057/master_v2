// Nuxt 4 母版專案設定檔（純 JavaScript，無 TypeScript）

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // icon 全站走 .icon 字型法（mask-image），SVG 透過 CSS url() 載入，
  // 不再需要 vite-svg-loader 把 SVG 變 Vue 元件。詳見 assets/styles/icons.scss。
  // SCSS additionalData：自動把 _variables.scss 注入所有 .vue scoped style，
  // 讓 $web_font_color 等 SCSS 變數無需手動 @use 即可使用。
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables" as *;',
        },
      },
    },
  },

  // 白皮書「無 TS 政策」：停用 TypeScript 檢查
  typescript: { typeCheck: false, shim: false },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],

  // ── i18n 多語系設定 ─────────────────────────────────────
  // 翻譯字典：i18n/locales/<code>.json
  // 切換語系：元件內呼叫 const { setLocale } = useI18n(); setLocale('en')
  // 取得目前語系：const { locale } = useI18n() → locale.value
  // 取翻譯字串：const { t } = useI18n(); t('nav.home')
  i18n: {
    // 預設語系從 .env 讀取（NUXT_PUBLIC_DEFAULT_LANG），fallback 'tw'
    // 此值在 build / SSR 時讀入，runtime 不會變
    defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LANG || 'tw',
    // URL 策略：預設語系（tw）不加前綴、其他語系加（tw: /about、en: /en/about、jp: /jp/about）
    // SEO 友好：每個語系獨立 URL，搜尋引擎可分別索引
    strategy: 'prefix_except_default',
    locales: [
      { code: 'tw', file: 'tw.json', name: '繁體中文', language: 'zh-Hant-TW' },
      { code: 'en', file: 'en.json', name: 'English', language: 'en-US' },
      { code: 'jp', file: 'jp.json', name: '日本語', language: 'ja-JP' },
      { code: 'kr', file: 'kr.json', name: '한국어', language: 'ko-KR' },
    ],
    // detectBrowserLanguage 暫時關閉 — 過去發生過 cookie 卡住造成 /jp /kr 不認的問題
    // 之後要做「第一次訪問依瀏覽器語言自動跳轉」再開回來
    detectBrowserLanguage: false,
  },

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
      // Header 版型：對應 components/headers/<檔名>.vue
      header: 'Header01',
      // 內頁 Banner 版型：對應 components/banners/PageBannerXX.vue
      pageBanner: 'PageBanner01',
      // 首頁 Banner block 版型：對應 components/banners/BlockBannerXX.vue
      blockBanner: 'BlockBanner01',
      // 購物功能開關：購物車 / 我的最愛 等 UI 是否顯示
      // shop 類型自動啟用；其他類型可用 NUXT_PUBLIC_ENABLE_SHOP=true 強制啟用
      enableShop: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        // Google Fonts：preconnect 提前建連線，stylesheet 載入字型
        // 替換原 jQuery WebFont.load 寫法 — 較新、無 FOUT、SSR 友好
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Gruppo&family=Noto+Sans+TC:wght@100;200;300;400;500;600;700;800;900&family=Noto+Serif+TC:wght@200;300;400;500;600;700;800;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@100;300;400;500;700;900&display=swap',
        },
      ],
    },
  },
})
