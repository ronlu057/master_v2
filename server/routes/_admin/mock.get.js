// GET /_admin/mock           → 回 mock 檔案清單（檔名 + 大小）
// GET /_admin/mock?name=firm → 回單一 mock 檔內容（JSON parsed）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, resolveInDir, PATHS } from '../../admin/utils.js'

export default defineEventHandler((event) => {
  assertDev(event)
  const q = getQuery(event)

  // 不帶 name → 列檔案清單
  if (!q.name) {
    const files = fs
      .readdirSync(PATHS.MOCK_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const stat = fs.statSync(path.join(PATHS.MOCK_DIR, f))
        return { name: f.replace(/\.json$/, ''), size: stat.size, mtime: stat.mtime }
      })
    return { files }
  }

  // 帶 name → 讀單檔內容
  const full = resolveInDir(PATHS.MOCK_DIR, `${q.name}.json`)
  if (!fs.existsSync(full)) {
    throw createError({ statusCode: 404, statusMessage: `mock 檔不存在：${q.name}` })
  }
  const raw = fs.readFileSync(full, 'utf8')
  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    // 解析失敗仍回原文，讓 UI 自己處理
    return { name: q.name, raw, parsed: null, parseError: e.message }
  }
  return { name: q.name, raw, parsed }
})
