// POST /_admin/upload-banner-video — 上傳 Banner 背景影片（multipart/form-data）
// 接受 mp4 / webm / ogg；存到 public/video/banner/<filename>
// 回傳新 path（相對 URL），後台拿到後寫進 home.json banner block 的 item.videoFile
// 用途：YT 連結留空時，前台改用 HTML5 <video> 播放此檔（muted + playsinline，含 iOS 自動播放）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev } from '../../admin/utils.js'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'video', 'banner')

const ALLOWED_MIMES = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/quicktime': '.mp4', // .mov（iPhone 錄影）統一存成 .mp4 副檔名（容器多半相容）
}
const MAX_SIZE = 50 * 1024 * 1024 // 50MB（背景影片建議壓縮後上傳）

export default defineEventHandler(async (event) => {
  assertDev(event)

  const parts = await readMultipartFormData(event)
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, message: '沒收到檔案' })
  }

  const file = parts.find((p) => p.name === 'video' && p.filename)
  if (!file) {
    throw createError({ statusCode: 400, message: '請以 name=video 傳檔案' })
  }

  const ext = ALLOWED_MIMES[file.type]
  if (!ext) {
    throw createError({
      statusCode: 400,
      message: `不支援的格式：${file.type}（限 mp4 / webm / ogg）`,
    })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      message: `檔案過大（${Math.round(file.data.length / 1024 / 1024)} MB > 50 MB 上限）`,
    })
  }

  // timestamp 避免覆蓋既有檔
  const stamp = Date.now()
  const baseName = `banner-${stamp}${ext}`
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  fs.writeFileSync(path.join(UPLOAD_DIR, baseName), file.data)

  const publicUrl = `/video/banner/${baseName}`
  return { ok: true, path: publicUrl, size: file.data.length, mime: file.type }
})
