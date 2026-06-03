// POST /_admin/mock — 寫回某個 mock JSON 檔
// body: { name: 'firm', content: <raw json string or object> }
// 寫入前會嘗試 JSON.parse 驗證；解析失敗則拒絕（避免破壞 mock）
import fs from 'node:fs'
import { assertDev, resolveInDir, PATHS } from '../../admin/utils.js'

export default defineEventHandler(async (event) => {
  assertDev(event)
  const body = await readBody(event)
  if (!body?.name) throw createError({ statusCode: 400, statusMessage: 'name 必填' })

  const full = resolveInDir(PATHS.MOCK_DIR, `${body.name}.json`)
  if (!fs.existsSync(full)) {
    throw createError({ statusCode: 404, statusMessage: `mock 檔不存在：${body.name}` })
  }

  // 接受兩種：string（已 stringify）或 object（自動 stringify）
  let raw
  if (typeof body.content === 'string') {
    try {
      JSON.parse(body.content) // 驗證但不重新格式化
      raw = body.content
    } catch (e) {
      throw createError({ statusCode: 400, statusMessage: `JSON 語法錯誤：${e.message}` })
    }
  } else if (typeof body.content === 'object' && body.content !== null) {
    raw = JSON.stringify(body.content, null, 2)
  } else {
    throw createError({ statusCode: 400, statusMessage: 'content 必須是 JSON 字串或 object' })
  }

  fs.writeFileSync(full, raw, 'utf8')
  // db.js 用 Proxy 在 dev mode 每次都重讀檔，因此 mock JSON 寫回後**下次 API 請求就會生效**，
  // 不需要重啟 dev server。production 仍 cache（部署時 JSON 已固定）。
  return { ok: true, bytes: raw.length }
})
