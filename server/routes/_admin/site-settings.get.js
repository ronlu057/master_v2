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
  headerBgColorScroll: '',
  headerMenuColor: '',
  headerMenuHoverColor: '',
  headerDropdownBg: '',
  headerDropdownItemBg: '',
  headerDropdownItemHoverBg: '',
  headerDropdownColor: '',
  headerDropdownHoverColor: '',
  headerIconColor: '',
  headerIconHoverColor: '',
  headerIconBg: '',
  headerIconHoverBg: '',
  headerIconRadius: '',
  headerDropdownRadius: '',
  headerDropdownItemRadius: '',
  headerNavtoolDropdownRadius: '',
  headerNavtoolDropdownItemRadius: '',
  headerDropdownPaddingY: '',
  headerDropdownPaddingX: '',
  headerDropdownBorderWidth: '',
  headerDropdownBorderColor: '',
  headerDropdownItemPaddingY: '',
  headerDropdownItemPaddingX: '',
  headerDropdownItemBorderWidth: '',
  headerDropdownItemBorderColor: '',
  // 捲動後（.scroll）選單顏色覆寫
  headerMenuColorScroll: '',
  headerMenuHoverColorScroll: '',
  headerDropdownColorScroll: '',
  headerDropdownHoverColorScroll: '',
  headerDropdownBgScroll: '',
  headerDropdownItemBgScroll: '',
  headerDropdownItemHoverBgScroll: '',
  headerDropdownBorderColorScroll: '',
  headerDropdownItemBorderColorScroll: '',
  headerIconColorScroll: '',
  headerIconHoverColorScroll: '',
  headerIconBgScroll: '',
  headerIconHoverBgScroll: '',
  headerIcons: {},
  headerSubmenuStyle: 'flyout',
  headerSubmenuIcon: {},
  headerSubmenuIconPos: 'right',
  headerSubmenuIconOffset: 8,
  headerMenuFontSize: '',
  bannerTitleColor: '',
  bannerSubtitleColor: '',
  bannerMemoColor: '',
  bannerAccentColor: '',
  bannerAccentColor2: '',
  bannerVideoOuterColor: '',
  bannerVideoInnerColor: '',
  bannerVideoTextColor: '',
  bannerVideoBgColor: '',
  bannerVideoTriColor: '',
  bannerVideoText: '',
  bannerTopImage: '',
  bannerBgImage: '',
  bannerDeco1: '',
  bannerDeco2: '',
  bannerDeco3: '',
  bannerNav: true,
  bannerNavIcon: {},
  bannerNavSize: 50,
  bannerNavRadius: 999,
  bannerNavColor: '',
  bannerNavBg: '',
  bannerNavIconSize: 56,
  bannerNavGap: 24,
  bannerNavThickness: '',
  bannerLoop: true,
  bannerAutoplay: true,
  bannerRipple: true,
  bannerDots: true,
  bannerDotBg: '',
  bannerDotActiveBg: '',
  bannerDotBorderWidth: 0,
  bannerDotBorderColor: '',
  bannerDotW: 10,
  bannerDotH: 10,
  bannerDotActiveW: 12,
  bannerDotActiveH: 12,
  // Banner 各版型各自一組設定 { [版型名]: { ...banner* } }
  bannerStyles: {},
  // Header 各版型各自一組設定 { [版型名]: { ...header* } }
  headerStyles: {},
  enabledLangs: ['tw', 'en', 'jp', 'kr'],
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
