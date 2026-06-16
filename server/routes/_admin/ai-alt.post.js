// POST /_admin/ai-alt — 用 Gemini Vision 辨識 banner 圖片，產生 SEO 用的繁中 alt 替代文字
// body: { path: '/img/tw/banner/xxx.jpg' }（public 下、由 upload-banner 回傳的相對 URL）
// 回 { ok, alt }
// 金鑰：.env.local 的 NUXT_GEMINI_KEY（dev-only，assertDev 守門，不會上線）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, readEnv } from '../../admin/utils.js'

const API = 'https://generativelanguage.googleapis.com/v1beta/models'
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

// 讀 .env.local（私密、不納版控）→ 金鑰優先放這
const readEnvLocal = () => {
  const p = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return {}
  const out = {}
  fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if (i < 0) return
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  })
  return out
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

  const local = readEnvLocal()
  const key = process.env.NUXT_GEMINI_KEY || local.NUXT_GEMINI_KEY || readEnv().NUXT_GEMINI_KEY
  if (!key) {
    throw createError({
      statusCode: 400,
      message: '尚未設定 NUXT_GEMINI_KEY，請到 .env.local 填入 Gemini API 金鑰',
    })
  }
  const model =
    process.env.NUXT_GEMINI_MODEL || local.NUXT_GEMINI_MODEL || readEnv().NUXT_GEMINI_MODEL || 'gemini-2.5-flash'

  const base64 = fs.readFileSync(full).toString('base64')
  const prompt = [
    '你是網站無障礙與 SEO 助手。請用繁體中文，為這張網站 banner 圖片寫一句 alt 替代文字。',
    '客觀描述畫面的主要內容 / 主體，具體但精簡，20 個字以內。',
    '只回傳文字本身，不要引號、不要句點開頭、不要說明或 markdown。',
  ].join('\n')

  // 模型備援：設定的模型優先，失敗就退到 flash / lite（皆支援 vision）
  const candidates = [...new Set([model, 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])]
  let data = null
  let lastErr = null
  for (const m of candidates) {
    try {
      data = await $fetch(`${API}/${m}:generateContent?key=${key}`, {
        method: 'POST',
        body: {
          contents: [
            { parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] },
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 64 },
        },
      })
      lastErr = null
      break
    } catch (e) {
      lastErr = e
    }
  }
  if (!data) {
    const msg = lastErr?.data?.error?.message || lastErr?.statusMessage || lastErr?.message
    throw createError({ statusCode: 502, message: `Gemini 辨識失敗：${msg}` })
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    throw createError({ statusCode: 502, message: 'Gemini 沒有回傳內容' })
  }
  const alt = text.replace(/^["「『]+|["」』]+$/g, '').replace(/[。.]\s*$/, '').trim()
  return { ok: true, alt }
})
