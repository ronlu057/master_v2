// /_admin/* 共用 helper：dev-mode 守門 + .env 讀寫 + 安全檔名檢查
//
// 所有 /_admin/* endpoint 都應該在開頭呼叫 assertDev(event)，
// 確保 production 環境完全無法呼叫到（404）。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env')

// 限定 dev mode；production 一律 404，避免後台被部署上線
export function assertDev(event) {
  if (process.env.NODE_ENV === 'production') {
    setResponseStatus(event, 404)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}

// 讀 .env → parse 為扁平 object（只取 NUXT_PUBLIC_* 對外設定）
export function readEnv() {
  if (!fs.existsSync(ENV_PATH)) return {}
  const raw = fs.readFileSync(ENV_PATH, 'utf8')
  const result = {}
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx < 0) return
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    result[key] = value
  })
  return result
}

// 寫回 .env：保留註解與順序，只替換指定 key；不存在的 key 追加
export function writeEnvUpdates(updates) {
  let raw = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : ''
  for (const [key, value] of Object.entries(updates)) {
    // 整個值用 String 包，避免 boolean/number 寫入時被當物件
    const v = String(value ?? '')
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.test(raw)) {
      raw = raw.replace(regex, `${key}=${v}`)
    } else {
      raw += `\n${key}=${v}`
    }
  }
  fs.writeFileSync(ENV_PATH, raw, 'utf8')
}

// 安全檔名：只允許英數字 / 底線 / 連字符，避免 ../../ 路徑跳脫
export function safeFilename(name) {
  if (typeof name !== 'string') return ''
  return name.replace(/[^A-Za-z0-9_-]/g, '')
}

// 受控目錄解析：確保最終路徑落在 baseDir 內
export function resolveInDir(baseDir, filename) {
  const safe = safeFilename(filename)
  if (!safe) throw createError({ statusCode: 400, statusMessage: '檔名不合法' })
  const full = path.join(baseDir, safe)
  if (!full.startsWith(baseDir)) {
    throw createError({ statusCode: 400, statusMessage: '路徑跳脫不允許' })
  }
  return full
}

export const PATHS = {
  ROOT,
  ENV: ENV_PATH,
  MOCK_DIR: path.join(ROOT, 'server', 'mock', 'data'),
  HEADERS_DIR: path.join(ROOT, 'components', 'headers'),
  BANNERS_DIR: path.join(ROOT, 'components', 'banners'),
  I18N_DIR: path.join(ROOT, 'i18n', 'locales'),
}
