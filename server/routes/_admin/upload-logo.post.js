// POST /_admin/upload-logo — 上傳 LOGO（multipart/form-data）
// 接受 jpg / png / svg / gif；存到 public/img/logo/<filename>
// 回傳新 path（相對 URL），AdminSettings 拿到後寫進 site-settings.json 的 logo 欄位
import fs from 'node:fs'
import path from 'node:path'
import { assertDev } from '../../admin/utils.js'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'logo')

const ALLOWED_MIMES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/gif': '.gif',
  'image/webp': '.webp',
}
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export default defineEventHandler(async (event) => {
  assertDev(event)

  const parts = await readMultipartFormData(event)
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, statusMessage: '沒收到檔案' })
  }

  const file = parts.find((p) => p.name === 'logo' && p.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: '請以 name=logo 傳檔案' })
  }

  // 副檔名：以 mime 為主，filename 副檔名為輔
  const ext = ALLOWED_MIMES[file.type]
  if (!ext) {
    throw createError({
      statusCode: 400,
      statusMessage: `不支援的格式：${file.type}（限 jpg / png / svg / gif / webp）`,
    })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `檔案過大（${Math.round(file.data.length / 1024)} KB > 2 MB 上限）`,
    })
  }

  // 用 timestamp 避免覆蓋既有檔
  const stamp = Date.now()
  const baseName = `custom-logo-${stamp}${ext}`
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  const target = path.join(UPLOAD_DIR, baseName)
  fs.writeFileSync(target, file.data)

  const publicUrl = `/img/logo/${baseName}`
  return { ok: true, path: publicUrl, size: file.data.length, mime: file.type }
})
