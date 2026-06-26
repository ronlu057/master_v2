// POST /_admin/ai-translate — 用 Gemini 把一段 UI 用字翻成多個目標語系（dev-only）
// body: { text, targets: ['en','jp','kr'], source?: 'tw' }
//   回 { ok, translations: { en, jp, kr } }
// 金鑰：.env.local 的 NUXT_GEMINI_KEY（與 ai-generate 共用，assertDev 守門，不會上線）
import { assertDev } from '../../admin/utils.js'
import { callGemini, geminiText } from '../../admin/gemini.js'

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

  // 模型備援 + 暫時性錯誤（尖峰過載）自動重試，全在 callGemini 內處理
  const data = await callGemini({ contents: [{ parts: [{ text: prompt }] }], generationConfig: genConfig })
  const raw = geminiText(data)

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
