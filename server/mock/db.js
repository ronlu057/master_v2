// ============================================================
// Mock 資料庫 — 從 server/mock/data/*.json 載入「一般網站白皮書」各 controller payload。
//
// 透過 Proxy 動態載入：
// - dev mode：每次存取 db.xxx 都重新讀檔，/admin Mock 編輯後**立即生效**，無需重啟
// - production：第一次讀後 cache，避免每個 request 都 fs.readFileSync
//
// 改 JSON 即生效；正式串接時把 NUXT_PUBLIC_API_BASE 指向真實後端，本檔就不再被呼叫。
// ============================================================
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const dataDir = join(process.cwd(), 'server', 'mock', 'data')
const load = (name) => JSON.parse(readFileSync(join(dataDir, `${name}.json`), 'utf8'))

// 對外 key → 檔名 對照（多數同名，只有 headerProducts → header_products 需轉）
const FILES = {
  i18n: 'i18n',
  menu: 'menu',
  firm: 'firm',
  banners: 'banners',
  seo: 'seo',
  home: 'home',
  news: 'news',
  about: 'about',
  contact: 'contact',
  search: 'search',
  faq: 'faq',
  download: 'download',
  location: 'location',
  popupsAd: 'popupsAd',
  products: 'products',
  headerProducts: 'header_products',
}

const isProd = process.env.NODE_ENV === 'production'
const cache = {}

export default new Proxy({}, {
  get(_target, prop) {
    const file = FILES[prop]
    if (!file) return undefined
    if (isProd) {
      // production：cache，避免每 request 都讀檔
      if (!(prop in cache)) cache[prop] = load(file)
      return cache[prop]
    }
    // dev：每次都讀，admin 後台寫回 mock JSON 後立刻生效
    return load(file)
  },
  // 讓 Object.keys(db) 等仍能列出 keys（for debug / inspect）
  ownKeys() { return Object.keys(FILES) },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true }
  },
})
