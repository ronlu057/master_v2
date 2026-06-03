// POST /_admin/scaffold — 一鍵生成新的 Header / Banner / Mock JSON
// body 三種 type：
//   { type: 'header',  name: 'Header17', basedOn: 'Header01' }
//   { type: 'banner',  name: 'PageBanner02', basedOn: 'PageBanner01' }（basedOn 也可是 BlockBanner01）
//   { type: 'mock',    name: 'custom', content: {...} | '{...}' }
// 既有檔名一律拒絕（不覆蓋）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, resolveInDir, safeFilename, PATHS } from '../../admin/utils.js'

export default defineEventHandler(async (event) => {
  assertDev(event)
  const body = await readBody(event)
  if (!body?.type || !body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'type 與 name 必填' })
  }

  const name = safeFilename(body.name)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'name 含不合法字元' })

  switch (body.type) {
    case 'header': {
      const target = resolveInDir(PATHS.HEADERS_DIR, `${name}.vue`)
      if (fs.existsSync(target)) {
        throw createError({ statusCode: 409, statusMessage: `已存在：${name}.vue` })
      }
      const basedOn = safeFilename(body.basedOn || 'Header01')
      const source = path.join(PATHS.HEADERS_DIR, `${basedOn}.vue`)
      if (!fs.existsSync(source)) {
        throw createError({ statusCode: 404, statusMessage: `範本不存在：${basedOn}.vue` })
      }
      // 複製範本 + class 名替換（class="header01" → class="header17" 之類）
      const raw = fs.readFileSync(source, 'utf8')
      const oldClass = basedOn.toLowerCase()
      const newClass = name.toLowerCase()
      const out = raw.replace(new RegExp(oldClass, 'g'), newClass)
      fs.writeFileSync(target, out, 'utf8')
      return { ok: true, path: path.relative(PATHS.ROOT, target), basedOn }
    }

    case 'banner': {
      const target = resolveInDir(PATHS.BANNERS_DIR, `${name}.vue`)
      if (fs.existsSync(target)) {
        throw createError({ statusCode: 409, statusMessage: `已存在：${name}.vue` })
      }
      const basedOn = safeFilename(body.basedOn || (name.startsWith('Page') ? 'PageBanner01' : 'BlockBanner01'))
      const source = path.join(PATHS.BANNERS_DIR, `${basedOn}.vue`)
      if (!fs.existsSync(source)) {
        throw createError({ statusCode: 404, statusMessage: `範本不存在：${basedOn}.vue` })
      }
      fs.writeFileSync(target, fs.readFileSync(source, 'utf8'), 'utf8')
      return { ok: true, path: path.relative(PATHS.ROOT, target), basedOn }
    }

    case 'mock': {
      const target = resolveInDir(PATHS.MOCK_DIR, `${name}.json`)
      if (fs.existsSync(target)) {
        throw createError({ statusCode: 409, statusMessage: `已存在：${name}.json` })
      }
      let raw
      if (typeof body.content === 'string') {
        try {
          JSON.parse(body.content)
          raw = body.content
        } catch (e) {
          throw createError({ statusCode: 400, statusMessage: `JSON 語法錯誤：${e.message}` })
        }
      } else if (typeof body.content === 'object' && body.content !== null) {
        raw = JSON.stringify(body.content, null, 2)
      } else {
        raw = '{}'
      }
      fs.writeFileSync(target, raw, 'utf8')
      return { ok: true, path: path.relative(PATHS.ROOT, target) }
    }

    default:
      throw createError({ statusCode: 400, statusMessage: `未知 type：${body.type}` })
  }
})
