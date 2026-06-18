// POST /_admin/upload-banner — 上傳 Banner 背景圖（multipart/form-data）
// 接受 jpg / png / webp / gif；存到 public/img/tw/banner/<filename>
// 回傳新 path（相對 URL），後台拿到後寫進 banners.json 對應 row 的 image.pc / image.mb
// 裁切器已將輸出固定為 2560 × 按比例高
import fs from 'node:fs'
import path from 'node:path'
import { assertDev } from '../../admin/utils.js'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'tw', 'banner')

const ALLOWED_MIMES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}
const MAX_SIZE = 10 * 1024 * 1024 // 10MB（背景大圖；裁切器輸出 2560px JPEG 通常 ~1MB，此為安全餘裕）

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
    throw createError({
      statusCode: 400,
      message: `不支援的格式：${file.type}（限 jpg / png / webp / gif）`,
    })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      message: `檔案過大（${Math.round(file.data.length / 1024)} KB > ${MAX_SIZE / 1024 / 1024} MB 上限）`,
    })
  }

  // timestamp 避免覆蓋既有檔
  const stamp = Date.now()
  const baseName = `banner-${stamp}${ext}`
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  fs.writeFileSync(path.join(UPLOAD_DIR, baseName), file.data)

  const publicUrl = `/img/tw/banner/${baseName}`
  return { ok: true, path: publicUrl, size: file.data.length, mime: file.type }
})
