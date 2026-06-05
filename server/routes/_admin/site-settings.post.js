// POST /_admin/site-settings — 同時寫 data/site-settings.json + .env
// body 內可包含任意子集：{ projectType, header, pageBanner, blockBanner, apiBase, defaultLang, enableShop }
//
// JSON = runtime source of truth（SSR 每次都讀 → 不用重啟即時生效）
// .env = 啟動初始值 / git 版控持久層（重啟後 runtimeConfig 用 .env 為 fallback）
//        兩處都寫，確保未來 dev server 重啟後 .env 與 JSON 一致
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, writeEnvUpdates, readEnv } from '../../admin/utils.js'

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
  'navtool',
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
  //    JSON 已是 runtime source of truth（SSR 每次都讀），.env 只是持久備援。
  //    寫 .env 會被 Nuxt dev watcher 偵測而「重啟 dev server」→ 把本次 POST 的連線重置，
  //    前端就看到「套用失敗」。因此這裡：
  //      (a) 只寫「值真的有變」的 key —— 沒變就完全不碰 .env，不會觸發重啟（最常見情境）。
  //      (b) 有變的 key 延後到「回應已送出後」再寫 —— 即使觸發重啟也不影響本次回應。
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
  const currentEnv = readEnv()
  const changedEnv = {}
  for (const [k, v] of Object.entries(envUpdates)) {
    if (String(currentEnv[k] ?? '') !== String(v ?? '')) changedEnv[k] = v
  }
  if (Object.keys(changedEnv).length) {
    setTimeout(() => {
      try {
        writeEnvUpdates(changedEnv)
      } catch (e) {
        console.warn('[site-settings.post] .env write failed:', e.message)
      }
    }, 200)
  }

  return { ok: true, settings: current, envWritten: Object.keys(changedEnv) }
})
