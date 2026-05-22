// ============================================================
// Mock 資料庫 — 對應「一般網站白皮書」各 controller 的回應 payload
// 前端開發階段使用；正式串接時把 NUXT_PUBLIC_API_BASE 指向真實後端即可。
// 圖片採用 picsum.photos 佔位圖（白皮書 §2.4：圖片欄位皆為完整 URL）。
// ============================================================

const img = (seed, w = 800, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`

// ── 多語字典（/i18n）──────────────────────────────────────
const i18n = {
  'nav.home': '首頁',
  'nav.about': '關於我們',
  'nav.news': '最新消息',
  'nav.contact': '聯絡我們',
  'btn.more': '看更多',
  'btn.submit': '送出',
  'btn.search': '搜尋',
  'msg.loading': '載入中…',
  'msg.empty': '目前沒有資料',
  'msg.success': '操作成功',
}

// ── 選單（/menu/view）─────────────────────────────────────
const menuItem = (title, url, children = []) => ({ title, url, data_type: 'page', children })
const menu = {
  header: [
    menuItem('首頁', '/'),
    menuItem('關於我們', '/about/company-intro', [
      menuItem('公司簡介', '/about/company-intro'),
      menuItem('服務團隊', '/about/team'),
    ]),
    menuItem('最新消息', '/news'),
    menuItem('服務據點', '/location'),
    menuItem('常見問題', '/faq'),
    menuItem('聯絡我們', '/contact'),
  ],
  footer: [
    menuItem('關於我們', '/about/company-intro'),
    menuItem('最新消息', '/news'),
    menuItem('常見問題', '/faq'),
    menuItem('聯絡我們', '/contact'),
  ],
  mobile: [
    menuItem('首頁', '/'),
    menuItem('關於我們', '/about/company-intro'),
    menuItem('最新消息', '/news'),
    menuItem('服務據點', '/location'),
    menuItem('常見問題', '/faq'),
    menuItem('聯絡我們', '/contact'),
  ],
}

// ── 公司資料（/firm/view）─────────────────────────────────
const firm = {
  firm: {
    title: 'AD-Design 母版示範站',
    mail: 'info@ad-design.tw',
    mail2: 'service@ad-design.tw',
    tel: '02-1234-5678',
    address: '台北市信義區範例路 100 號 8 樓',
    google_map: 'https://maps.google.com/?q=台北101',
    social: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      line: 'https://line.me',
      youtube: 'https://youtube.com',
      twitter: '',
    },
    analytics: { head: '', body_start: '', body_end: '' },
    footer: { title2: '專業前端網站開發 · Nuxt 4 母版' },
  },
  rules: [
    { title: '隱私權政策', url: '/firm/caption?unit=privacy' },
    { title: '服務條款', url: '/firm/caption?unit=terms' },
  ],
}

// ── Banner（/banner/*）────────────────────────────────────
const banners = {
  home: [
    { title: '一套母版，五種專案類型', link: '/about/company-intro', image: { pc: img('banner-1', 1600, 600), mb: img('banner-1m', 800, 800) } },
    { title: '模組化 block 快速套版', link: '/news', image: { pc: img('banner-2', 1600, 600), mb: img('banner-2m', 800, 800) } },
    { title: '購物模組一鍵啟用', link: '/shop', image: { pc: img('banner-3', 1600, 600), mb: img('banner-3m', 800, 800) } },
  ],
  page: {
    news: [{ title: '最新消息', link: '', image: { pc: img('page-news', 1600, 360), mb: img('page-newsm', 800, 400) } }],
    about: [{ title: '關於我們', link: '', image: { pc: img('page-about', 1600, 360), mb: img('page-aboutm', 800, 400) } }],
  },
  common: [{ title: '', link: '', image: { pc: img('page-common', 1600, 360), mb: img('page-commonm', 800, 400) } }],
}

// ── SEO（/seo/*）──────────────────────────────────────────
const seo = {
  home: {
    title: '母版專案 — 一套母版，五種專案類型',
    description: 'Nuxt 4 + Vue 3 + Pinia 前端母版，支援模組件套版、客製首頁、全客製、購物、臨時站。',
    keywords: 'Nuxt4, Vue3, 母版, 套版, 購物網站',
    head_script: '',
    body_script: '',
    og: { title: '母版專案', description: '一套母版，五種專案類型', image: img('og-home', 1200, 630) },
    meta: { author: 'AD-Design', copyright: 'AD-Design', distribution: 'global', rating: 'general', robots: 'index,follow' },
  },
  common: {
    title: '母版專案',
    description: 'Nuxt 4 前端母版示範站。',
    keywords: 'Nuxt, Vue, 母版',
    head_script: '',
    body_script: '',
  },
  pages: {
    news: { title: '最新消息 — 母版專案', description: '查看最新消息與活動公告。', keywords: '消息,活動', source: 'page', fallback_reason: '' },
    about: { title: '關於我們 — 母版專案', description: '認識我們的團隊與服務。', keywords: '關於,團隊', source: 'page', fallback_reason: '' },
  },
}

// ── 新聞（/news/*）────────────────────────────────────────
const newsCategories = [
  { blink: 'news', title: '公司公告', count: 3 },
  { blink: 'events', title: '活動快訊', count: 2 },
  { blink: 'blog', title: '技術部落格', count: 1 },
]

const newsItem = (id, blink, title, cats, date, weekday, summary) => ({
  id,
  blink,
  title,
  date,
  weekday,
  url: `/news/${blink}`,
  video: '',
  category_blinks: cats,
  summary,
  news_multi_photo: [
    { title: title, title2: '', url: img(`news-${id}`, 800, 500) },
    { title: '內文配圖', title2: '', url: img(`news-${id}b`, 800, 500) },
  ],
  content: `<p>${summary}</p><p>這是 mock 文章內文，用於前端開發階段驗證版面。正式上線後由 WDM 後台輸入實際內容。</p>`,
})

const newsItems = [
  newsItem(1, 'master-launch', '母版專案正式上線', ['news'], '5.21,2026', 'Wed', '支援五種專案類型的 Nuxt 4 母版正式對內釋出。'),
  newsItem(2, 'summer-event', '2026 夏季活動開跑', ['events'], '5.18,2026', 'Sun', '夏季限定活動正式登場，多項優惠同步開放。'),
  newsItem(3, 'shop-module', '新增購物模組功能', ['news'], '5.12,2026', 'Mon', '購物類型專案新增購物車與結帳流程。'),
  newsItem(4, 'new-location', '服務據點擴點公告', ['news'], '5.05,2026', 'Mon', '台中、高雄服務據點正式啟用。'),
  newsItem(5, 'member-upgrade', '會員制度升級說明', ['events'], '4.28,2026', 'Mon', '會員分級制度全面升級，回饋更有感。'),
  newsItem(6, 'nuxt4-blog', '技術筆記：Nuxt 4 導入心得', ['blog'], '4.20,2026', 'Mon', '從 Nuxt 3 升級 Nuxt 4 的目錄結構與效能實戰。'),
]

const newsDetailExtra = {
  seo: { title: '', description: '', keywords: '' },
  share: { facebook: true, line: true, twitter: false },
  advanced: {},
  publish: { start_date: '2026-04-01', end_date: '' },
}

// ── 關於 / 內容頁（/about/detail）─────────────────────────
const aboutPages = {
  'company-intro': {
    title: '公司簡介',
    url: '/about/company-intro',
    content: '<h3>關於我們</h3><p>我們是專注於前端網站開發的團隊，以 Nuxt 4 母版快速交付高品質網站。</p><p>從形象網站到購物平台，一套母版滿足多元專案需求。</p>',
    content2: '',
    page: { button_type: '', out_link: '', video: '' },
    seo: { title: '公司簡介', description: '認識我們的團隊', keywords: '關於我們' },
    share: { facebook: true, line: true },
    advanced: {},
    publish: { start_date: '', end_date: '' },
  },
  team: {
    title: '服務團隊',
    url: '/about/team',
    content: '<h3>服務團隊</h3><p>由前端工程、UI/UX 設計與專案管理組成的跨領域團隊。</p>',
    content2: '',
    page: { button_type: '', out_link: '', video: '' },
    seo: { title: '服務團隊', description: '專業跨領域團隊', keywords: '團隊' },
    share: { facebook: true, line: true },
    advanced: {},
    publish: { start_date: '', end_date: '' },
  },
}

// ── 聯絡表單主題（/contact/subjects）──────────────────────
const contactSubjects = [
  { value: 'quote', label: '網站開發報價' },
  { value: 'support', label: '技術支援' },
  { value: 'cooperation', label: '合作提案' },
  { value: 'other', label: '其他' },
]

// ── 全站搜尋（/search）────────────────────────────────────
const searchData = {
  categories: [
    { unit_id: 1, type: 'news', title: '最新消息', count: 6 },
    { unit_id: 2, type: 'about', title: '關於我們', count: 2 },
    { unit_id: 3, type: 'faq', title: '常見問題', count: 4 },
  ],
  list: [
    { unit_id: 1, type: 'news', type_title: '最新消息', title: '母版專案正式上線', url: '/news/master-launch', category_blinks: ['news'], allPage: '/news', has_detail: true, page_button: '查看', target: '_self', summary: '支援五種專案類型的 Nuxt 4 母版正式釋出。' },
    { unit_id: 1, type: 'news', type_title: '最新消息', title: '新增購物模組功能', url: '/news/shop-module', category_blinks: ['news'], allPage: '/news', has_detail: true, page_button: '查看', target: '_self', summary: '購物類型專案新增購物車與結帳流程。' },
    { unit_id: 2, type: 'about', type_title: '關於我們', title: '公司簡介', url: '/about/company-intro', category_blinks: ['about'], allPage: '/about/company-intro', has_detail: true, page_button: '查看', target: '_self', summary: '專注前端網站開發的團隊。' },
    { unit_id: 3, type: 'faq', type_title: '常見問題', title: '如何切換專案類型？', url: '/faq', category_blinks: ['faq'], allPage: '/faq', has_detail: false, page_button: '前往', target: '_self', summary: '修改 .env 的 NUXT_PUBLIC_PROJECT_TYPE。' },
  ],
}

// ── FAQ（/faq/*）──────────────────────────────────────────
const faq = {
  categories: [
    { blink: 'general', title: '一般問題' },
    { blink: 'tech', title: '技術問題' },
  ],
  items: [
    { id: 1, category: 'general', question: '這套母版支援哪些專案類型？', answer: '<p>模組件套版、客製首頁、全客製、購物、臨時站，共五種。</p>' },
    { id: 2, category: 'general', question: '如何切換專案類型？', answer: '<p>修改 .env 的 NUXT_PUBLIC_PROJECT_TYPE 並重啟 dev server。</p>' },
    { id: 3, category: 'tech', question: '前端開發階段如何取得資料？', answer: '<p>NUXT_PUBLIC_API_BASE 留空時自動使用本地 mock JSON。</p>' },
    { id: 4, category: 'tech', question: '可以用 TypeScript 嗎？', answer: '<p>不行，本母版採無 TypeScript 政策，全程純 JavaScript。</p>' },
  ],
}

// ── 下載中心（/download/*）────────────────────────────────
const download = {
  categories: [{ blink: 'doc', title: '文件下載' }, { blink: 'tool', title: '工具資源' }],
  items: [
    { id: 1, category: 'doc', title: '母版開發白皮書 PDF', file_url: 'https://example.com/files/whitepaper.pdf', file_type: 'pdf', open_in_browser: true },
    { id: 2, category: 'doc', title: '專案交付清單', file_url: 'https://example.com/files/checklist.xlsx', file_type: 'xlsx', open_in_browser: false },
    { id: 3, category: 'tool', title: 'UI 元件設計稿', file_url: 'https://example.com/files/ui-kit.zip', file_type: 'zip', open_in_browser: false },
  ],
}

// ── 服務據點（/location/*）────────────────────────────────
const location = {
  categories: [{ blink: 'north', title: '北部' }, { blink: 'central', title: '中部' }, { blink: 'south', title: '南部' }],
  items: [
    { id: 1, category: 'north', title: '台北旗艦店', address: '台北市信義區範例路 100 號', tel: '02-1234-5678', lat: 25.033, lng: 121.5654, image: img('loc-1', 600, 400), open_time: '10:00 - 21:00', map_link: 'https://maps.google.com' },
    { id: 2, category: 'central', title: '台中服務中心', address: '台中市西屯區範例大道 200 號', tel: '04-2345-6789', lat: 24.1477, lng: 120.6736, image: img('loc-2', 600, 400), open_time: '10:00 - 20:00', map_link: 'https://maps.google.com' },
    { id: 3, category: 'south', title: '高雄門市', address: '高雄市前鎮區範例街 300 號', tel: '07-3456-7890', lat: 22.6273, lng: 120.3014, image: img('loc-3', 600, 400), open_time: '11:00 - 21:00', map_link: 'https://maps.google.com' },
  ],
}

// ── 彈跳廣告（/popupsAd/list）─────────────────────────────
const popupsAd = [
  { id: 1, title: '母版示範站開幕', image: img('popup-1', 600, 700), target: { type: 'internal', value: '/news/master-launch' } },
]

// ── 商品（購物類型 /shop）─────────────────────────────────
const products = [
  { id: 1, blink: 'product-a', title: '經典商品 A', category: 'hot', price: 1280, origin_price: 1680, image: img('prod-1', 600, 600), summary: '熱賣推薦款式。' },
  { id: 2, blink: 'product-b', title: '人氣商品 B', category: 'hot', price: 980, origin_price: 980, image: img('prod-2', 600, 600), summary: '人氣不敗經典。' },
  { id: 3, blink: 'product-c', title: '新品上市 C', category: 'new', price: 2200, origin_price: 2200, image: img('prod-3', 600, 600), summary: '本季最新上市。' },
  { id: 4, blink: 'product-d', title: '新品上市 D', category: 'new', price: 1750, origin_price: 1990, image: img('prod-4', 600, 600), summary: '質感升級新選擇。' },
  { id: 5, blink: 'product-e', title: '優惠商品 E', category: 'sale', price: 590, origin_price: 1200, image: img('prod-5', 600, 600), summary: '限時優惠特賣。' },
  { id: 6, blink: 'product-f', title: '優惠商品 F', category: 'sale', price: 850, origin_price: 1500, image: img('prod-6', 600, 600), summary: '出清下殺價。' },
]

// ── 首頁聚合（/home/view）─ slots → blocks → item.rows ────
const home = {
  slots: [
    {
      key: 'cipage',
      type: 'slot',
      blocks: [
        { type: 'banner', title: '', item: { rows: banners.home } },
        {
          type: 'intro',
          title: '關於母版',
          item: {
            rows: [
              {
                title: '一套母版，五種專案類型',
                text: '模組件套版、客製首頁、全客製、購物、臨時站 — 透過設定切換，共用同一套 API 串接層與元件庫。',
                image: img('intro', 900, 600),
                url: '/about/company-intro',
              },
            ],
          },
        },
      ],
    },
    {
      key: 'homePush',
      type: 'slot',
      blocks: [
        {
          type: 'push',
          title: '精選服務',
          item: {
            rows: [
              { title: '模組化開發', text: 'block 模組快速組裝頁面', image: img('push-1', 600, 400), url: '/about/company-intro' },
              { title: 'SSR 效能', text: 'Nuxt 4 伺服器渲染與 SEO', image: img('push-2', 600, 400), url: '/about/company-intro' },
              { title: '購物整合', text: '一鍵啟用購物模組', image: img('push-3', 600, 400), url: '/shop' },
            ],
          },
        },
      ],
    },
    {
      key: 'homeOtherAd',
      type: 'slot',
      blocks: [
        {
          type: 'other_ad',
          title: '最新活動',
          item: {
            rows: [
              { title: '2026 夏季活動', text: '多項優惠同步開放', image: img('ad-1', 800, 450), url: '/news/summer-event' },
              { title: '會員制度升級', text: '回饋更有感', image: img('ad-2', 800, 450), url: '/news/member-upgrade' },
            ],
          },
        },
      ],
    },
    {
      key: 'news_block',
      type: 'slot',
      blocks: [
        {
          type: 'news',
          title: '最新消息',
          item: { rows: newsItems.slice(0, 3) },
        },
      ],
    },
  ],
}

export default {
  i18n,
  menu,
  firm,
  banners,
  seo,
  home,
  news: { categories: newsCategories, items: newsItems, detailExtra: newsDetailExtra },
  about: aboutPages,
  contact: { subjects: contactSubjects },
  search: searchData,
  faq,
  download,
  location,
  popupsAd,
  products,
}
