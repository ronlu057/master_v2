// POST /_admin/site-settings — 同時寫 data/site-settings.json + .env
// body 內可包含任意子集：{ projectType, header, pageBanner, blockBanner, apiBase, defaultLang, enableShop }
//
// JSON = runtime source of truth（SSR 每次都讀 → 不用重啟即時生效）
// .env = 啟動初始值 / git 版控持久層（重啟後 runtimeConfig 用 .env 為 fallback）
//        兩處都寫，確保未來 dev server 重啟後 .env 與 JSON 一致
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, writeEnvUpdates } from '../../admin/utils.js'

const FILE = path.join(process.cwd(), 'data', 'site-settings.json')
const ALLOWED_KEYS = [
  'projectType',
  'header',
  'pageBanner',
  'blockBanner',
  'apiBase',
  'defaultLang',
  'enableShop',
  'logo',
  'logoMaxHeight',
  'customCss',
  'langLabels',
]
const ALLOWED_PROJECT_TYPES = ['module', 'custom-home', 'full-custom', 'shop', 'temp']

// JSON key → .env key
const ENV_MAP = {
  projectType: 'NUXT_PUBLIC_PROJECT_TYPE',
  header: 'NUXT_PUBLIC_HEADER',
  pageBanner: 'NUXT_PUBLIC_PAGE_BANNER',
  blockBanner: 'NUXT_PUBLIC_BLOCK_BANNER',
  apiBase: 'NUXT_PUBLIC_API_BASE',
  defaultLang: 'NUXT_PUBLIC_DEFAULT_LANG',
  enableShop: 'NUXT_PUBLIC_ENABLE_SHOP',
  logo: 'NUXT_PUBLIC_LOGO',
  logoMaxHeight: 'NUXT_PUBLIC_LOGO_MAX_HEIGHT',
}

export default defineEventHandler(async (event) => {
  assertDev(event)
  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'body 必須是 object' })
  }

  if (body.projectType !== undefined && !ALLOWED_PROJECT_TYPES.includes(body.projectType)) {
    throw createError({ statusCode: 400, statusMessage: 'projectType 不合法' })
  }

  // 1. 寫 JSON（runtime 即時生效）
  let current = {}
  if (fs.existsSync(FILE)) {
    try {
      current = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    } catch {
      current = {}
    }
  }
  for (const k of ALLOWED_KEYS) {
    if (body[k] !== undefined) current[k] = body[k]
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(current, null, 2) + '\n', 'utf8')

  // 2. 同步寫 .env（持久層；下次 dev server 重啟仍對得上）
  const envUpdates = {}
  for (const k of ALLOWED_KEYS) {
    if (body[k] !== undefined) {
      const envKey = ENV_MAP[k]
      if (!envKey) continue
      // boolean 轉 'true' / 'false'
      const v = typeof body[k] === 'boolean' ? (body[k] ? 'true' : 'false') : body[k]
      envUpdates[envKey] = v
    }
  }
  if (Object.keys(envUpdates).length) writeEnvUpdates(envUpdates)

  return { ok: true, settings: current, envWritten: Object.keys(envUpdates) }
})
