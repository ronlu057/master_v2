// POST /_admin/ai-alt — 用 Gemini Vision 辨識 banner 圖片，產生 SEO 用的繁中 alt 替代文字
// body: { path: '/img/tw/banner/xxx.jpg' }（public 下、由 upload-banner 回傳的相對 URL）
// 回 { ok, alt }
// 金鑰：.env.local 的 NUXT_GEMINI_KEY（dev-only，assertDev 守門，不會上線）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev } from '../../admin/utils.js'
import { callGemini, geminiText } from '../../admin/gemini.js'

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export default defineEventHandler(async (event) => {
  assertDev(event)

  const body = await readBody(event)
  const rel = (body?.path || '').toString()
  // 只允許 public/img 下的圖片，擋路徑跳脫
  if (!rel.startsWith('/img/') || rel.includes('..')) {
    throw createError({ statusCode: 400, message: 'path 必須是 /img/ 下的圖片' })
  }
  const full = path.join(process.cwd(), 'public', rel)
  if (!fs.existsSync(full)) {
    throw createError({ statusCode: 404, message: '找不到圖片檔，請先上傳' })
  }
  const ext = path.extname(full).toLowerCase()
  const mime = MIME_BY_EXT[ext]
  if (!mime) {
    throw createError({ statusCode: 400, message: `不支援的圖片格式：${ext}` })
  }

  const base64 = fs.readFileSync(full).toString('base64')
  const prompt = [
    '你是網站無障礙與 SEO 助手。請用繁體中文，為這張網站 banner 圖片寫一句 alt 替代文字。',
    '客觀描述畫面的主要內容 / 主體，具體但精簡，20 個字以內。',
    '只回傳文字本身，不要引號、不要句點開頭、不要說明或 markdown。',
  ].join('\n')

  // 模型備援 + 暫時性錯誤（尖峰過載）自動重試，全在 callGemini 內處理
  const data = await callGemini({
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
    // thinkingBudget:0 關掉 2.5-flash 的思考（alt 是簡單任務，否則思考會吃光 token → 回空字串）
    generationConfig: { temperature: 0.4, maxOutputTokens: 256, thinkingConfig: { thinkingBudget: 0 } },
  })

  const text = geminiText(data)
  const alt = text.replace(/^["「『]+|["」』]+$/g, '').replace(/[。.]\s*$/, '').trim()
  return { ok: true, alt }
})
