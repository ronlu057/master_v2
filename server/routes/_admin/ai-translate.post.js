// POST /_admin/ai-translate — 用 Gemini 把一段 UI 用字翻成多個目標語系（dev-only）
// body: { text, targets: ['en','jp','kr'], source?: 'tw' }
//   回 { ok, translations: { en, jp, kr } }
// 金鑰：.env.local 的 NUXT_GEMINI_KEY（與 ai-generate 共用，assertDev 守門，不會上線）
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

const LANG_NAMES = {
  tw: 'Traditional Chinese',
  en: 'English',
  jp: 'Japanese',
  kr: 'Korean',
  cn: 'Simplified Chinese',
}

export default defineEventHandler(async (event) => {
  assertDev(event)

  const body = await readBody(event)
  const text = (body?.text || '').toString().trim()
  const source = body?.source || 'tw'
  const targets = Array.isArray(body?.targets)
    ? [...new Set(body.targets.filter((t) => t && t !== source))]
    : []
  if (!text) throw createError({ statusCode: 400, message: 'text 不可為空' })
  if (!targets.length) return { ok: true, translations: {} }

  const local = readEnvLocal()
  const key = process.env.NUXT_GEMINI_KEY || local.NUXT_GEMINI_KEY || readEnv().NUXT_GEMINI_KEY
  if (!key) {
    throw createError({
      statusCode: 400,
      message: '尚未設定 NUXT_GEMINI_KEY，請到 .env.local 填入 Gemini API 金鑰',
    })
  }

  const model =
    process.env.NUXT_GEMINI_MODEL ||
    local.NUXT_GEMINI_MODEL ||
    readEnv().NUXT_GEMINI_MODEL ||
    'gemini-2.5-flash'

  const sourceName = LANG_NAMES[source] || 'Traditional Chinese'
  const targetSpec = targets.map((t) => `"${t}" (${LANG_NAMES[t] || t})`).join(', ')
  // 英文指令 + 把待譯文字放最後並清楚標示，避免模型把指令中的字當成待譯內容
  const prompt = [
    'You are a translation engine for short website UI labels (button / menu text).',
    `Translate the text after "TEXT:" from ${sourceName} into each of these languages: ${targetSpec}.`,
    'Translate the exact given text literally — do NOT invent or substitute a different UI word. Keep it concise, no surrounding quotes or punctuation.',
    `Respond with ONLY a JSON object whose keys are the language codes (${targets.join(', ')}) and whose values are the translations. No other text.`,
    '',
    `TEXT: ${text}`,
  ].join('\n')

  const genConfig = {
    temperature: 0,
    maxOutputTokens: 256,
    thinkingConfig: { thinkingBudget: 0 }, // 簡單任務，關掉思考避免吃光 token
    responseMimeType: 'application/json',
  }

  // 模型備援：設定的模型優先，失敗就退到 flash / lite
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
      lastErr = e
    }
  }
  if (!data) {
    const msg = lastErr?.data?.error?.message || lastErr?.statusMessage || lastErr?.message
    throw createError({ statusCode: 502, message: `Gemini 呼叫失敗：${msg}` })
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!raw) throw createError({ statusCode: 502, message: 'Gemini 沒有回傳內容' })

  let obj
  try {
    obj = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim())
  } catch {
    throw createError({ statusCode: 502, message: 'AI 回傳格式無法解析，請再試一次' })
  }

  const strip = (s) => (s || '').toString().replace(/^["「『]+|["」』]+$/g, '').trim()
  const translations = {}
  for (const t of targets) if (obj[t]) translations[t] = strip(obj[t])
  return { ok: true, translations }
})
