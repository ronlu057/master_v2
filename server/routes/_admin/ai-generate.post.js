// POST /_admin/ai-generate — 免費 AI（Google Gemini）文字生成代理
// body: { field: 'title'|'subtitle'|'memo'|'all', topic?: string, context?: { title, subtitle, lang } }
//   field='all' → 依關鍵字一次產出連貫的三欄，回 { ok, title, subtitle, memo }
//   其餘單欄位 → 回 { ok, text }
// 金鑰：.env.local 的 NUXT_GEMINI_KEY（dev-only，assertDev 守門，不會上線）
import fs from 'node:fs'
import path from 'node:path'
import { assertDev, readEnv } from '../../admin/utils.js'

const API = 'https://generativelanguage.googleapis.com/v1beta/models'

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

// 各欄位的生成指示（限制長度、語氣、只回文字本身）
const FIELD_SPEC = {
  title: { label: '主標題', limit: '12 個字以內', extra: '簡潔有力、像 banner 大標。' },
  subtitle: { label: '副標', limit: '20 個字以內', extra: '補充主標、可帶一點說明。' },
  memo: { label: '說明文', limit: '40 個字以內', extra: '一兩句描述，可較完整。' },
}

export default defineEventHandler(async (event) => {
  assertDev(event)

  const body = await readBody(event)
  const field = body?.field
  if (field !== 'all' && !FIELD_SPEC[field]) {
    throw createError({ statusCode: 400, message: 'field 須為 title / subtitle / memo / all' })
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
  const ctx = body?.context || {}
  const lang = ctx.lang || '繁體中文'
  const topicLine = body?.topic ? `主題 / 關鍵字：${body.topic}` : '主題：通用形象 banner。'

  // 組 prompt 與 generationConfig：單欄位 vs 一次生成全部（標題+副標+內文，連貫）
  let prompt
  const genConfig = { temperature: 1.0, maxOutputTokens: 256 }
  if (field === 'all') {
    prompt = [
      '你是網站 banner 文案撰寫助手。請依主題產生「一組」首頁主視覺 banner 文案，三者需互相呼應、連貫。',
      `語言：${lang}。${topicLine}`,
      '輸出 JSON 物件，鍵與長度限制：',
      'title（主標，12 字以內，簡潔有力）、subtitle（副標，20 字以內）、memo（說明文，40 字以內，可一兩句）。',
      '只回 JSON，不要 markdown、註解或多餘文字。',
    ].join('\n')
    genConfig.maxOutputTokens = 512
    genConfig.responseMimeType = 'application/json'
  } else {
    const spec = FIELD_SPEC[field]
    prompt = [
      `你是網站 banner 文案撰寫助手。請為首頁主視覺 banner 產生「${spec.label}」。`,
      `語言：${lang}。長度：${spec.limit}。${spec.extra}`,
      topicLine,
      ctx.title && field !== 'title' ? `已有主標：「${ctx.title}」，請與其呼應。` : '',
      ctx.subtitle && field !== 'subtitle' ? `已有副標：「${ctx.subtitle}」。` : '',
      '只回傳文字本身，不要任何引號、標點符號開頭、說明或 markdown。',
    ]
      .filter(Boolean)
      .join('\n')
  }

  // 模型備援：設定的模型優先，失敗（尖峰/配額/暫時錯誤）就自動退到 lite 版
  const candidates = [...new Set([model, 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])]
  let data = null
  let lastErr = null
  for (const m of candidates) {
    try {
      data = await $fetch(`${API}/${m}:generateContent?key=${key}`, {
        method: 'POST',
        body: { contents: [{ parts: [{ text: prompt }] }], generationConfig: genConfig },
      })
      lastErr = null
      break
    } catch (e) {
      lastErr = e // 換下一個模型再試
    }
  }
  if (!data) {
    const msg = lastErr?.data?.error?.message || lastErr?.statusMessage || lastErr?.message
    throw createError({ statusCode: 502, message: `Gemini 呼叫失敗：${msg}` })
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    throw createError({ statusCode: 502, message: 'Gemini 沒有回傳內容' })
  }

  const strip = (s) => (s || '').toString().replace(/^["「『]+|["」』]+$/g, '').trim()

  // 一次全部：解析 JSON，回三欄位
  if (field === 'all') {
    let obj
    try {
      obj = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim())
    } catch {
      throw createError({ statusCode: 502, message: 'AI 回傳格式無法解析，請再試一次' })
    }
    return { ok: true, title: strip(obj.title), subtitle: strip(obj.subtitle), memo: strip(obj.memo) }
  }

  return { ok: true, text: strip(text) }
})
