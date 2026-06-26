// POST /_admin/upload-banner-asset — 上傳 Banner「去背素材圖」（如 BlockBanner03 左側產品圖）
// 只收 PNG / SVG（保留透明背景），不裁切、原圖存檔；存到 public/img/tw/banner/<filename>
// 回傳新 path（相對 URL），後台寫進對應 row 的 product.pc / product.mb
import fs from 'node:fs'
import path from 'node:path'
import { assertDev } from '../../admin/utils.js'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'tw', 'banner')

// 只允許去背用的 PNG / SVG（JPG 無透明、不收）
const ALLOWED_MIMES = {
  'image/png': '.png',
  'image/svg+xml': '.svg',
}
const MAX_SIZE = 5 * 1024 * 1024 // 5MB（去背素材通常很小）

export default defineEventHandler(async (event) => {
  assertDev(event)

  const parts = await readMultipartFormData(event)
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, message: '沒收到檔案' })
  }

  const file = parts.find((p) => p.name === 'image' && p.filename)
  if (!file) {
    throw createError({ statusCode: 400, message: '請以 name=image 傳檔案' })
  }

  const ext = ALLOWED_MIMES[file.type]
  if (!ext) {
    throw createError({ statusCode: 400, message: `不支援的格式：${file.type}（限 PNG / SVG）` })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      message: `檔案過大（${Math.round(file.data.length / 1024)} KB > ${MAX_SIZE / 1024 / 1024} MB 上限）`,
    })
  }

  // timestamp 避免覆蓋既有檔
  const baseName = `banner-asset-${Date.now()}${ext}`
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  fs.writeFileSync(path.join(UPLOAD_DIR, baseName), file.data)

  return { ok: true, path: `/img/tw/banner/${baseName}`, size: file.data.length, mime: file.type }
})
