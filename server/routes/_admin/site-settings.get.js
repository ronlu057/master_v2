// GET /_admin/site-settings — 讀 data/site-settings.json + 可用版型清單
// 這份 JSON 是 runtime 即時讀取（每次都 fs 讀檔），admin 寫回後**不用重啟 dev**
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, PATHS } from '../../admin/utils.js'

const FILE = path.join(process.cwd(), 'data', 'site-settings.json')

const DEFAULTS = {
  projectType: 'module',
  header: 'Header01',
  pageBanner: 'PageBanner01',
  blockBanner: 'BlockBanner01',
  apiBase: '',
  defaultLang: 'tw',
  enableShop: false,
  logo: '',
  logoMaxHeight: 66,
  customCss: '',
  headerBgColor: '',
  headerMenuColor: '',
  headerMenuHoverColor: '',
  headerDropdownBg: '',
  headerDropdownItemBg: '',
  headerDropdownColor: '',
  headerDropdownHoverColor: '',
  headerIconColor: '',
  headerIconHoverColor: '',
  headerDropdownRadius: '',
  headerDropdownItemRadius: '',
  headerIcons: {},
  headerMenuFontSize: '',
  langLabels: {},
  navtool: {},
}

export default defineEventHandler((event) => {
  assertDev(event)

  // 讀 JSON（缺檔就用 defaults，不丟錯）
  let settings = { ...DEFAULTS }
  if (fs.existsSync(FILE)) {
    try {
      const json = JSON.parse(fs.readFileSync(FILE, 'utf8'))
      settings = { ...DEFAULTS, ...json }
    } catch (e) {
      console.warn('[site-settings.get] parse failed:', e.message)
    }
  }

  // 掃描可用版型（給 admin UI 下拉用）
  const headers = fs
    .readdirSync(PATHS.HEADERS_DIR)
    .filter((f) => f.endsWith('.vue') && !f.endsWith('_sp.vue'))
    .map((f) => f.replace(/\.vue$/, ''))

  const banners = fs.readdirSync(PATHS.BANNERS_DIR).filter((f) => f.endsWith('.vue'))
  const pageBanners = banners
    .filter((f) => f.startsWith('PageBanner'))
    .map((f) => f.replace(/\.vue$/, ''))
  const blockBanners = banners
    .filter((f) => f.startsWith('BlockBanner'))
    .map((f) => f.replace(/\.vue$/, ''))

  return {
    settings,
    options: {
      projectTypes: ['module', 'custom-home', 'full-custom', 'shop', 'temp'],
      headers,
      pageBanners,
      blockBanners,
      langs: ['tw', 'en', 'jp', 'kr'],
    },
  }
})
