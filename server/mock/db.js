// ============================================================
// Mock 資料庫 — 從 server/mock/data/*.json 載入「一般網站白皮書」各 controller payload。
// 改 JSON 即生效；正式串接時把 NUXT_PUBLIC_API_BASE 指向真實後端，本檔就不再被呼叫。
// ============================================================
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// 從專案根目錄解析，避免 Nitro 打包後 import.meta.url 指錯位置
const dataDir = join(process.cwd(), 'server', 'mock', 'data')
const load = (name) => JSON.parse(readFileSync(join(dataDir, `${name}.json`), 'utf8'))

export default {
  i18n: load('i18n'),
  menu: load('menu'),
  firm: load('firm'),
  banners: load('banners'),
  seo: load('seo'),
  home: load('home'),
  news: load('news'),
  about: load('about'),
  contact: load('contact'),
  search: load('search'),
  faq: load('faq'),
  download: load('download'),
  location: load('location'),
  popupsAd: load('popupsAd'),
  products: load('products'),
  headerProducts: load('header_products'),
}
